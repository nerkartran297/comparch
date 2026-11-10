'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as RV from '@/lib/riscv.mjs';
import { EXAMPLES } from '@/lib/examples.mjs';
import { describe } from '@/lib/describe';
import Editor from './Editor';
import ExecView from './ExecView';
import RegPanel from './RegPanel';
import MemPanel from './MemPanel';
import ConsolePanel from './ConsolePanel';
import FieldBreakdown from './FieldBreakdown';

export type Prog = ReturnType<typeof RV.assemble>;
export type SimT = InstanceType<typeof RV.Sim>;

const SPEEDS = [
  { id: '1', label: '1 lệnh/giây', ms: 1000 },
  { id: '3', label: '3 lệnh/giây', ms: 333 },
  { id: '10', label: '10 lệnh/giây', ms: 100 },
  { id: '50', label: '50 lệnh/giây', ms: 20 },
  { id: 'max', label: 'Nhanh nhất', ms: 0 },
];
const MAX_STEPS = 5_000_000;
const DEFAULT = EXAMPLES.find((e) => e.id === 'arith')!;

const GROUPS = Array.from(new Set(EXAMPLES.map((e) => e.group)));

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

  const [code, setCode] = useState(initialCode ?? DEFAULT.code);
  const [title, setTitle] = useState(initialTitle ?? (initialCode ? 'Code từ bài học' : DEFAULT.title));
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
    if (autoAssemble || !initialCode) assembleNow(initialCode ?? DEFAULT.code);
    // chỉ chạy một lần khi mở
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        setWarn(`Đã chạy hơn ${MAX_STEPS.toLocaleString('vi-VN')} lệnh — có thể bị lặp vô hạn. Lab tự dừng lại.`);
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
    if (!r.ok) return r.msg ?? 'Giá trị không hợp lệ';
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
    setCode(ex.code);
    setTitle(ex.title);
    assembleNow(ex.code);
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
    if (mode === 'edit') return errors.length ? `${errors.length} lỗi khi dịch — sửa rồi bấm Dịch lại` : 'Đang sửa code. Bấm “Dịch” để chuyển sang chế độ chạy.';
    if (sim.error) return sim.haltMsg;
    if (sim.waiting) return 'Chương trình đang chờ bạn nhập ở khung Màn hình';
    if (sim.halted) return sim.haltMsg;
    if (running) return `Đang chạy… ${sim.count.toLocaleString('vi-VN')} lệnh`;
    return sim.count ? `Đã chạy ${sim.count.toLocaleString('vi-VN')} lệnh. Lệnh sắp chạy được tô vàng.` : 'Sẵn sàng. Bấm “Bước” để chạy lệnh đầu tiên (dòng tô vàng).';
  })();
  const statusKind = sim.error || errors.length ? 'bad' : sim.halted && mode === 'run' ? 'ok' : sim.waiting ? 'wait' : '';

  return (
    <div className="lab">
      <div className="lab-head">
        <div className="lab-title">
          <span className="lab-kicker">Lab RISC-V · mô phỏng kiểu RARS</span>
          <strong>{title}</strong>
        </div>
        <label className="lab-ex">
          <span className="visually-hidden">Chọn chương trình mẫu</span>
          <select id="lab-example" value={exampleId} onChange={(e) => loadExample(e.target.value)}>
            <option value="" disabled>Chọn chương trình mẫu…</option>
            {GROUPS.map((g) => (
              <optgroup key={g} label={g}>
                {EXAMPLES.filter((e) => e.group === g).map((e) => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        {onClose && <button className="lab-close" onClick={onClose} aria-label="Đóng Lab">✕ Đóng</button>}
      </div>

      <div className="lab-toolbar" role="toolbar" aria-label="Điều khiển chạy">
        {mode === 'edit' ? (
          <button className="lab-btn primary" onClick={() => assembleNow(code)}>⚙ Dịch (Assemble)</button>
        ) : (
          <button className="lab-btn" onClick={() => { setRunning(false); setMode('edit'); }}>✎ Sửa code</button>
        )}
        <span className="lab-sep" />
        <button className="lab-btn" onClick={doBack} disabled={mode !== 'run' || sim.history.length === 0} title="Lùi lại 1 lệnh">⏮ Lùi</button>
        <button className="lab-btn" onClick={doStep} disabled={mode !== 'run' || (!sim.canStep() && !sim.waiting)} title="Chạy đúng 1 lệnh">⏭ Bước</button>
        <button className={`lab-btn ${running ? 'stop' : 'go'}`} onClick={doRunToggle} disabled={mode !== 'run'}>
          {running ? '⏸ Dừng' : sim.halted ? '▶ Chạy lại' : '▶ Chạy'}
        </button>
        <button className="lab-btn" onClick={doReset} disabled={mode !== 'run'} title="Về trạng thái ban đầu">⟲ Đặt lại</button>
        <label className="lab-speed">
          <span>Tốc độ</span>
          <select id="lab-speed" value={speed} onChange={(e) => setSpeed(e.target.value)}>
            {SPEEDS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>
      <p className={`lab-status ${statusKind}`} aria-live="polite">{warn || status}</p>

      <div className="lab-tabs" role="tablist">
        {(['regs', 'mem', 'io'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t === 'regs' ? 'Thanh ghi' : t === 'mem' ? 'Bộ nhớ' : sim.waiting ? 'Màn hình ●' : 'Màn hình'}
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
                      <button onClick={() => setFocusLine({ line: e.line, n: Date.now() })}>Dòng {e.line}</button> {e.msg}
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
                      <span>{sel != null && sel !== sim.pc ? 'Lệnh đang chọn' : 'Lệnh sắp chạy'} · {RV.hex8(viewAddr!)}</span>
                      {sel != null && <button className="link-btn" onClick={() => setSel(null)}>Theo PC</button>}
                    </div>
                    <FieldBreakdown d={viewDecoded} compact />
                    {viewAddr === sim.pc && !sim.halted && (() => {
                      const ds = describe(viewDecoded, sim.x, sim.pc);
                      return (
                        <p className="lab-explain">
                          <strong>Lệnh này làm gì:</strong> {ds.what}
                          {ds.now && <><br /><strong>Với giá trị hiện tại:</strong> {ds.now}</>}
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
            <button role="tab" aria-selected={tab !== 'io'} className={tab !== 'io' ? 'on' : ''} onClick={() => setTab('mem')}>Bộ nhớ</button>
            <button role="tab" aria-selected={tab === 'io'} className={tab === 'io' ? 'on' : ''} onClick={() => setTab('io')}>
              {sim.waiting ? 'Màn hình ● đang chờ nhập' : 'Màn hình & nhật ký'}
            </button>
          </div>
          <div className={`lab-pane pane-mem ${tab === 'mem' ? 'on' : ''} ${tab !== 'io' ? 'wide-on' : ''}`}><MemPanel sim={sim} prog={prog && prog.ok ? prog : null} /></div>
          <div className={`lab-pane pane-io ${tab === 'io' ? 'on wide-on' : ''}`}><ConsolePanel sim={sim} onInput={onInput} /></div>
        </section>
      </div>
    </div>
  );
}
