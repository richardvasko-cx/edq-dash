import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../App';

type GeminiModel = { id: string; label: string };
type MenuPosition = { top?: number; bottom?: number; right: number; maxHeight: number };

const shortLabel = (label: string) => label.replace(/^Gemini\s+/i, '');

export default function GeminiModelSelect({
  isDark,
  placement = 'above',
}: {
  isDark: boolean;
  placement?: 'above' | 'below';
}) {
  const [models, setModels] = useState<GeminiModel[]>([]);
  const [activeModel, setActiveModel] = useState('');
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const load = () => {
      fetch('/api/gemini/model')
        .then(response => response.json())
        .then(data => {
          setModels(Array.isArray(data.models) ? data.models : []);
          setActiveModel(String(data.active || ''));
        })
        .catch(() => {});
    };
    const syncActive = (event: Event) => {
      const active = (event as CustomEvent<{ active?: string }>).detail?.active;
      if (active) setActiveModel(active);
    };
    load();
    window.addEventListener('edq-gemini-model-change', syncActive);
    return () => window.removeEventListener('edq-gemini-model-change', syncActive);
  }, []);

  const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!buttonRef.current) return;
    if (open) return setOpen(false);
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = Math.min(320, window.innerHeight - 24);
    const openAbove = placement === 'above' && rect.top >= menuHeight + 12;
    setMenuPosition(openAbove
      ? { bottom: window.innerHeight - rect.top + 8, right: window.innerWidth - rect.right, maxHeight: rect.top - 12 }
      : { top: rect.bottom + 8, right: window.innerWidth - rect.right, maxHeight: window.innerHeight - rect.bottom - 12 });
    setOpen(true);
  };

  const changeModel = async (model: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    setOpen(false);
    if (!model || model === activeModel) return;
    setSaving(true);
    try {
      const response = await fetch('/api/gemini/model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      });
      const data = await response.json();
      if (data.active) {
        setActiveModel(data.active);
        const nextLabel = models.find(item => item.id === data.active)?.label || data.active;
        window.dispatchEvent(new CustomEvent('edq-gemini-model-change', { detail: { active: data.active, label: nextLabel } }));
      }
    } finally {
      setSaving(false);
    }
  };

  const label = models.find(model => model.id === activeModel)?.label || activeModel || 'Model';
  return (
    <div className="shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        disabled={saving || !activeModel}
        className={cn(
          'flex h-8 max-w-[128px] items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold transition-colors',
          isDark
            ? 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
            : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-[#F1F3F4]',
        )}
        title={label}
      >
        <span className="truncate">{saving ? 'Switching' : shortLabel(label)}</span>
        <span className={cn('material-symbols-outlined text-[15px] transition-transform', open && 'rotate-180')}>expand_more</span>
      </button>
      {open && menuPosition && (
        <>
          <button type="button" aria-label="Close model menu" onClick={event => { event.preventDefault(); event.stopPropagation(); setOpen(false); }} className="fixed inset-0 z-[140] cursor-default" />
          <div
            className={cn(
              'fixed z-[141] w-64 overflow-y-auto rounded-xl border py-1.5 shadow-xl',
              isDark ? 'border-white/10 bg-[#28272E]' : 'border-[#E0E4EC] bg-white',
            )}
            style={{ top: menuPosition.top, bottom: menuPosition.bottom, right: menuPosition.right, maxHeight: menuPosition.maxHeight }}
          >
            <p className={cn('sticky top-0 z-10 border-b px-3 pb-1 pt-2 text-[9px] font-black uppercase tracking-widest', isDark ? 'border-white/8 bg-[#28272E] text-white/40' : 'border-[#F1F3F4] bg-white text-[#747775]')}>Text-output models</p>
            {models.map(model => {
              const isActive = model.id === activeModel;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={event => changeModel(model.id, event)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-[12px] font-medium transition-colors',
                    isActive
                      ? isDark ? 'bg-white/10 text-white' : 'bg-[#F1F3F4] text-[#202124]'
                      : isDark ? 'text-white/75 hover:bg-white/8' : 'text-[#3C4043] hover:bg-[#F1F3F4]',
                  )}
                >
                  <span className="truncate">{model.label}</span>
                  {isActive && <span className={cn('material-symbols-outlined shrink-0 text-[17px]', isDark ? 'text-white/70' : 'text-[#5F6368]')}>check</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
