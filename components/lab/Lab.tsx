'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as RV from '@/lib/riscv.mjs';
import { EXAMPLES } from '@/lib/examples.mjs';
import { describe } from '@/lib/describe';
import { useLang } from '@/lib/lang';
import { L } from '@/components/i18n';
import Editor from './Editor';
import ExecView from './ExecView';
import RegPanel from './RegPanel';
import MemPanel from './MemPanel';
import ConsolePanel from './ConsolePanel';
import FieldBreakdown from './FieldBreakdown';

export type Prog = ReturnType<typeof RV.assemble>;
export type SimT = InstanceType<typeof RV.Sim>;

const SPEEDS = [
  { id: '1', label: ['1 lệnh/giây', '1 instr/s'], ms: 1000 },
  { id: '3', label: ['3 lệnh/giây', '3 instr/s'], ms: 333 },
  { id: '10', label: ['10 lệnh/giây', '10 instr/s'], ms: 100 },
  { id: '50', label: ['50 lệnh/giây', '50 instr/s'], ms: 20 },
  { id: 'max', label: ['Nhanh nhất', 'Fastest'], ms: 0 },
];
const MAX_STEPS = 5_000_000;
const DEFAULT = EXAMPLES.find((e) => e.id === 'arith')!;

const GROUPS = Array.from(new Set(EXAMPLES.map((e) => e.group)));
const GROUP_EN: Record<string, string> = { 'Chương 3': 'Chapter 3', 'Chương 4': 'Chapter 4', 'Bài tập Ch3': 'Ch. 3 exercises' };

/** Ngôn ngữ của trang lúc này (đọc thẳng từ <html>, dùng được ngay khi mount). */
const docLang = (): 'vi' | 'en' =>
  typeof document !== 'undefined' && document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'vi';
const exCode = (ex: (typeof EXAMPLES)[number], l: 'vi' | 'en') => (l === 'en' && ex.en ? ex.en.code : ex.code);
const exTitle = (ex: (typeof EXAMPLES)[number], l: 'vi' | 'en') => (l === 'en' && ex.en ? ex.en.title : ex.title);

type Props = {
  initialCode?: string;
  initialTitle?: string;
  autoAssemble?: boolean;
  onClose?: () => void;
};

export default function Lab({ initialCode, initialTitle, autoAssemble = false, onClose }: Props) {
  const simRef = useRef<SimT | null>(null);
  if (!simRef.current) simRef.current = new RV.Sim();
  const sim = simRef.current;
  const [lang] = useLang();
  const T = (vi: string, en: string) => (lang === 'en' ? en : vi);
  const nf = (n: number) => n.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN');

  const [code, setCode] = useState(initialCode ?? DEFAULT.code);
  const [title, setTitle] = useState(initialTitle ?? (initialCode ? 'Code từ bài học' : DEFAULT.title));
  const titleFromCaller = useRef(initialTitle !== undefined);
  const [exampleId, setExampleId] = useState(initialCode ? '' : DEFAULT.id);
  const [prog, setProg] = useState<Prog | null>(null);
  const [mode, setMode] = useState<'edit' | 'run'>('edit');
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState('3');
  const [bps, setBps] = useState<Set<number>>(() => new Set());
  const [sel, setSel] = useState<number | null>(null);
  const [warn, setWarn] = useState('');
  const [focusLine, setFocusLine] = useState<{ line: number; n: number } | null>(null);
  const [tab, setTab] = useState<'regs' | 'mem' | 'io'>('regs');
  const resumeRef = useRef(false);
  const stepsRun = useRef(0);

  const assembleNow = useCallback(
    (src: string) => {
      setRunning(false);
      setWarn('');
      RV.setLang(docLang());
      const p = RV.assemble(src);
      setProg(p);
      if (!p.ok) {
        setMode('edit');
        return false;
      }
      sim.load(p);
      stepsRun.current = 0;
      resumeRef.current = false;
      setSel(null);
      setBps(new Set());
      setMode('run');
      rerender();
      return true;
    },
    [sim, rerender],
  );

  useEffect(() => {
    if (!initialCode && docLang() === 'en') {
      const c = exCode(DEFAULT, 'en');
      setCode(c);
      assembleNow(c);
      return;
    }
    if (autoAssemble || !initialCode) assembleNow(initialCode ?? DEFAULT.code);
    // chỉ chạy một lần khi mở
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đổi ngôn ngữ: chương trình mẫu chưa sửa thì đổi sang bản cùng ngôn ngữ (nếu chưa chạy dở);
  // còn lỗi dịch thì dịch lại để thông báo lỗi theo ngôn ngữ mới.
  const firstLang = useRef(true);
  useEffect(() => {
    RV.setLang(lang);
    if (firstLang.current) { firstLang.current = false; return; }
    const ex = EXAMPLES.find((e) => e.id === exampleId);
    if (ex) {
      const other = exCode(ex, lang === 'en' ? 'vi' : 'en');
      const next = exCode(ex, lang);
      if (code === other && next !== other && (mode === 'edit' || sim.count === 0)) {
        setCode(next);
        if (mode === 'run') assembleNow(next);
        return;
      }
    }
    if (mode === 'edit' && prog && !prog.ok) setProg(RV.assemble(code));
    // chỉ theo dõi đổi ngôn ngữ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // vòng chạy tự động
  useEffect(() => {
    if (!running) return;
    const sp = SPEEDS.find((s) => s.id === speed)!;
    let first = true;
    let cancelled = false;
    let raf = 0;
    let timer: ReturnType<typeof setInterval> | undefined;

    const hitBp = () => !first && bps.has(sim.pc >>> 0);
    const settle = () => {
      if (sim.waiting) {
        resumeRef.current = true;
        setRunning(false);
        setTab('io');
      } else if (!sim.canStep()) setRunning(false);
      rerender();
    };
    const guard = () => {
      if (++stepsRun.current > MAX_STEPS) {
        setWarn(docLang() === 'en'
          ? `Ran more than ${MAX_STEPS.toLocaleString('en-US')} instructions — probably an infinite loop. The Lab stopped.`
          : `Đã chạy hơn ${MAX_STEPS.toLocaleString('vi-VN')} lệnh — có thể bị lặp vô hạn. Lab tự dừng lại.`);
        setRunning(false);
        return true;
      }
      return false;
    };

    if (sp.ms === 0) {
      const frame = () => {
        if (cancelled) return;
        const t0 = performance.now();
        while (performance.now() - t0 < 14 && sim.canStep()) {
          for (let i = 0; i < 2000 && sim.canStep(); i++) {
            if (hitBp()) { setRunning(false); rerender(); return; }
            sim.step();
            first = false;
            if (guard()) { rerender(); return; }
          }
        }
        settle();
        if (sim.canStep()) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      return () => { cancelled = true; cancelAnimationFrame(raf); };
    }
    const tick = () => {
      if (!sim.canStep()) { settle(); return; }
      if (hitBp()) { setRunning(false); rerender(); return; }
      sim.step();
      first = false;
      if (guard()) { rerender(); return; }
      settle();
    };
    tick();
    timer = setInterval(tick, sp.ms);
    return () => clearInterval(timer);
  }, [running, speed, bps, sim, rerender]);

  const doStep = () => {
    setRunning(false);
    if (sim.waiting) { setTab('io'); return; }
    sim.step();
    rerender();
  };
  const doBack = () => { setRunning(false); resumeRef.current = false; sim.back(); rerender(); };
  const doReset = () => { setRunning(false); resumeRef.current = false; stepsRun.current = 0; setWarn(''); sim.reset(); rerender(); };
  const doRunToggle = () => {
    if (running) { setRunning(false); return; }
    if (sim.waiting) { setTab('io'); return; }
    if (sim.halted) { sim.reset(); stepsRun.current = 0; }
    setWarn('');
    setRunning(true);
  };
  const onInput = (s: string) => {
    const r = sim.provideInput(s);
    if (!r.ok) return r.msg ?? T('Giá trị không hợp lệ', 'Invalid value');
    rerender();
    if (resumeRef.current) { resumeRef.current = false; setRunning(true); }
    return '';
  };
  const toggleBp = (addr: number) =>
    setBps((s) => { const n = new Set(s); if (n.has(addr)) n.delete(addr); else n.add(addr); return n; });

  const loadExample = (id: string) => {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setExampleId(id);
    const c = exCode(ex, lang);
    setCode(c);
    setTitle(ex.title);
    titleFromCaller.current = false;
    assembleNow(c);
  };

  // lệnh đang xem trong khung giải mã: dòng được chọn, hoặc lệnh sắp chạy (PC)
  const viewAddr = sel ?? (sim.prog && sim.textMap?.has(sim.pc) ? sim.pc : null);
  const viewDecoded = useMemo(() => {
    if (viewAddr == null || !sim.prog) return null;
    return RV.decode(sim.peekWord(viewAddr), viewAddr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewAddr, prog]);

  const errors = prog && !prog.ok ? prog.errors : [];
  const status = (() => {
    if (mode === 'edit')
      return errors.length
        ? T(`${errors.length} lỗi khi dịch — sửa rồi bấm Dịch lại`, `${errors.length} assembly error(s) — fix them and press Assemble again`)
        : T('Đang sửa code. Bấm “Dịch” để chuyển sang chế độ chạy.', 'Editing code. Press “Assemble” to switch to run mode.');
    if (sim.error) return sim.haltMsg;
    if (sim.waiting) return T('Chương trình đang chờ bạn nhập ở khung Màn hình', 'The program is waiting for your input in the Console panel');
    if (sim.halted) return sim.haltMsg;
    if (running) return T(`Đang chạy… ${nf(sim.count)} lệnh`, `Running… ${nf(sim.count)} instructions`);
    return sim.count
      ? T(`Đã chạy ${nf(sim.count)} lệnh. Lệnh sắp chạy được tô vàng.`, `Ran ${nf(sim.count)} instructions. The next instruction is highlighted in yellow.`)
      : T('Sẵn sàng. Bấm “Bước” để chạy lệnh đầu tiên (dòng tô vàng).', 'Ready. Press “Step” to run the first instruction (the yellow row).');
  })();
  const curEx = EXAMPLES.find((e) => e.id === exampleId);
  const shownTitle = curEx && !titleFromCaller.current
    ? exTitle(curEx, lang)
    : title === 'Code từ bài học' ? T('Code từ bài học', 'Code from the lesson') : title;
  const statusKind = sim.error || errors.length ? 'bad' : sim.halted && mode === 'run' ? 'ok' : sim.waiting ? 'wait' : '';

  return (
    <div className="lab">
      <div className="lab-head">
        <div className="lab-title">
          <span className="lab-kicker"><L vi="Lab RISC-V · mô phỏng kiểu RARS" en="RISC-V Lab · a RARS-style simulator" /></span>
          <strong>{shownTitle}</strong>
        </div>
        <label className="lab-ex">
          <span className="visually-hidden"><L vi="Chọn chương trình mẫu" en="Choose a sample program" /></span>
          <select id="lab-example" value={exampleId} onChange={(e) => loadExample(e.target.value)}>
            <option value="" disabled>{T('Chọn chương trình mẫu…', 'Choose a sample program…')}</option>
            {GROUPS.map((g) => (
              <optgroup key={g} label={lang === 'en' ? (GROUP_EN[g] ?? g) : g}>
                {EXAMPLES.filter((e) => e.group === g).map((e) => (
                  <option key={e.id} value={e.id}>{exTitle(e, lang)}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        {onClose && <button className="lab-close" onClick={onClose} aria-label={T('Đóng Lab', 'Close the Lab')}>✕ <L vi="Đóng" en="Close" /></button>}
      </div>

      <div className="lab-toolbar" role="toolbar" aria-label={T('Điều khiển chạy', 'Run controls')}>
        {mode === 'edit' ? (
          <button className="lab-btn primary" onClick={() => assembleNow(code)}>⚙ <L vi="Dịch (Assemble)" en="Assemble" /></button>
        ) : (
          <button className="lab-btn" onClick={() => { setRunning(false); setMode('edit'); }}>✎ <L vi="Sửa code" en="Edit code" /></button>
        )}
        <span className="lab-sep" />
        <button className="lab-btn" onClick={doBack} disabled={mode !== 'run' || sim.history.length === 0} title={T('Lùi lại 1 lệnh', 'Undo 1 instruction')}>⏮ <L vi="Lùi" en="Back" /></button>
        <button className="lab-btn" onClick={doStep} disabled={mode !== 'run' || (!sim.canStep() && !sim.waiting)} title={T('Chạy đúng 1 lệnh', 'Run exactly 1 instruction')}>⏭ <L vi="Bước" en="Step" /></button>
        <button className={`lab-btn ${running ? 'stop' : 'go'}`} onClick={doRunToggle} disabled={mode !== 'run'}>
          {running ? <>⏸ <L vi="Dừng" en="Pause" /></> : sim.halted ? <>▶ <L vi="Chạy lại" en="Run again" /></> : <>▶ <L vi="Chạy" en="Run" /></>}
        </button>
        <button className="lab-btn" onClick={doReset} disabled={mode !== 'run'} title={T('Về trạng thái ban đầu', 'Back to the initial state')}>⟲ <L vi="Đặt lại" en="Reset" /></button>
        <label className="lab-speed">
          <span><L vi="Tốc độ" en="Speed" /></span>
          <select id="lab-speed" value={speed} onChange={(e) => setSpeed(e.target.value)}>
            {SPEEDS.map((s) => <option key={s.id} value={s.id}>{s.label[lang === 'en' ? 1 : 0]}</option>)}
          </select>
        </label>
      </div>
      <p className={`lab-status ${statusKind}`} aria-live="polite">{warn || status}</p>

      <div className="lab-tabs" role="tablist">
        {(['regs', 'mem', 'io'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t === 'regs' ? <L vi="Thanh ghi" en="Registers" /> : t === 'mem' ? <L vi="Bộ nhớ" en="Memory" /> : <><L vi="Màn hình" en="Console" />{sim.waiting ? ' ●' : ''}</>}
          </button>
        ))}
      </div>

      <div className="lab-body">
        <section className="lab-left">
          {mode === 'edit' ? (
            <>
              <Editor value={code} onChange={(v) => { setCode(v); setExampleId(''); }} errors={errors} focusLine={focusLine} />
              {errors.length > 0 && (
                <ul className="lab-errors">
                  {errors.map((e, i) => (
                    <li key={i}>
                      <button onClick={() => setFocusLine({ line: e.line, n: Date.now() })}><L vi="Dòng" en="Line" /> {e.line}</button> {e.msg}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            prog && (
              <>
                <ExecView prog={prog} sim={sim} bps={bps} toggleBp={toggleBp} sel={sel} setSel={setSel} />
                {viewDecoded && viewDecoded.ok && (
                  <div className="lab-decode">
                    <div className="lab-decode-head">
                      <span>{sel != null && sel !== sim.pc ? <L vi="Lệnh đang chọn" en="Selected instruction" /> : <L vi="Lệnh sắp chạy" en="Next instruction" />} · {RV.hex8(viewAddr!)}</span>
                      {sel != null && <button className="link-btn" onClick={() => setSel(null)}><L vi="Theo PC" en="Follow PC" /></button>}
                    </div>
                    <FieldBreakdown d={viewDecoded} compact />
                    {viewAddr === sim.pc && !sim.halted && (() => {
                      const ds = describe(viewDecoded, sim.x, sim.pc, lang);
                      return (
                        <p className="lab-explain">
                          <strong><L vi="Lệnh này làm gì:" en="What it does:" /></strong> {ds.what}
                          {ds.now && <><br /><strong><L vi="Với giá trị hiện tại:" en="With the current values:" /></strong> {ds.now}</>}
                        </p>
                      );
                    })()}
                  </div>
                )}
              </>
            )
          )}
        </section>

        <section className="lab-right">
          <div className={`lab-pane pane-regs ${tab === 'regs' ? 'on' : ''}`}><RegPanel sim={sim} /></div>
          <div className="lab-subtabs" role="tablist">
            <button role="tab" aria-selected={tab !== 'io'} className={tab !== 'io' ? 'on' : ''} onClick={() => setTab('mem')}><L vi="Bộ nhớ" en="Memory" /></button>
            <button role="tab" aria-selected={tab === 'io'} className={tab === 'io' ? 'on' : ''} onClick={() => setTab('io')}>
              {sim.waiting ? <L vi="Màn hình ● đang chờ nhập" en="Console ● waiting for input" /> : <L vi="Màn hình & nhật ký" en="Console & trace" />}
            </button>
          </div>
          <div className={`lab-pane pane-mem ${tab === 'mem' ? 'on' : ''} ${tab !== 'io' ? 'wide-on' : ''}`}><MemPanel sim={sim} prog={prog && prog.ok ? prog : null} /></div>
          <div className={`lab-pane pane-io ${tab === 'io' ? 'on wide-on' : ''}`}><ConsolePanel sim={sim} onInput={onInput} /></div>
        </section>
      </div>
    </div>
  );
}
