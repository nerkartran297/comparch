'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Lab from './Lab';

type LabCtx = { openLab: (code?: string, title?: string) => void; closeLab: () => void };
const Ctx = createContext<LabCtx>({ openLab: () => {}, closeLab: () => {} });

export const useLab = () => useContext(Ctx);

/** Lab trượt ra phủ lên bài học: bấm "Chạy trong Lab" ở bất kỳ đoạn code nào để mở. */
export default function LabProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ open: boolean; mounted: boolean; code?: string; title?: string; token: number }>({ open: false, mounted: false, token: 0 });

  const openLab = useCallback((code?: string, title?: string) => {
    setState((s) => ({ open: true, mounted: true, code: code ?? s.code, title: title ?? s.title, token: code !== undefined ? s.token + 1 : s.token }));
  }, []);
  const closeLab = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  useEffect(() => {
    if (!state.open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLab(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [state.open, closeLab]);

  return (
    <Ctx.Provider value={{ openLab, closeLab }}>
      {children}
      <div className={`lab-drawer${state.open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Lab RISC-V" aria-hidden={!state.open}>
        <div className="lab-drawer-scrim" onClick={closeLab} />
        <div className="lab-drawer-panel">
          {state.mounted && (
            <Lab key={state.token} initialCode={state.code} initialTitle={state.title} autoAssemble={state.token > 0} onClose={closeLab} />
          )}
        </div>
      </div>
    </Ctx.Provider>
  );
}
