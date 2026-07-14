import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../App';

export type PanelOutlineItem = {
  key: string;
  title: string;
  description?: string;
  visible: boolean;
  disabled?: boolean;
  disabledLabel?: string;
  preview?: ReactNode | (() => ReactNode);
};

export function ScaledPanelPreview({
  children,
  baseWidth = 640,
  baseHeight = 360,
  theme = 'light',
}: {
  children: ReactNode;
  baseWidth?: number;
  baseHeight?: number;
  theme?: 'dark' | 'light';
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.38);

  // Measure synchronously before paint so the first render already has the correct
  // scale — avoids a post-commit setState that would re-paint mid sheet-open animation.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const width = el.clientWidth;
    const height = el.clientHeight;
    if (width > 0 && height > 0) {
      const next = Math.min(width / baseWidth, height / baseHeight);
      setScale(prev => (Math.abs(prev - next) > 0.001 ? next : prev));
    }
  }, [baseWidth, baseHeight]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) return;
      const next = Math.min(width / baseWidth, height / baseHeight);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScale(prev => (Math.abs(prev - next) > 0.001 ? next : prev));
      });
    });
    observer.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [baseWidth, baseHeight]);

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "h-full w-full overflow-hidden flex items-center justify-center",
        theme === 'dark' ? "bg-[#300266]" : "bg-[#F4F7FC] dark:bg-[#242228]"
      )}
    >
      <div
        className="pointer-events-none select-none flex-shrink-0"
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function PanelRemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Remove panel from view"
      onClick={onClick}
      className="absolute -right-3 -top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/25 bg-[#C5221F] text-white shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-colors md3-state-layer hover:bg-[#A50E0E] dark:bg-[#C5221F] dark:text-white"
    >
      <span className="material-symbols-outlined text-[20px]">close</span>
    </button>
  );
}

function FallbackPreview() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 rounded-[8px] bg-transparent px-4">
      <span className="h-3 w-20 rounded-full bg-[#1a73e8]/70" />
      <div className="space-y-3">
        <span className="block h-3 w-full rounded-full bg-[#1a73e8]/45" />
        <span className="block h-3 w-3/4 rounded-full bg-[#1a73e8]/35" />
      </div>
    </div>
  );
}

function PanelTogglePill({
  visible,
  title,
  onToggle,
}: {
  visible: boolean;
  title: string;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={event => {
        event.stopPropagation();
        onToggle();
      }}
      initial={false}
      animate={{
        backgroundColor: visible ? '#C5221F' : '#1A73E8',
        scale: 1,
      }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 520, damping: 32, mass: 0.65 }}
      className="absolute right-0 top-0 z-10 flex h-9 w-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-[0_2px_6px_rgba(30,55,90,0.22)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D2E3FC]"
      aria-label={visible ? `Remove ${title}` : `Add ${title}`}
    >
      <motion.span
        animate={{ rotate: visible ? 45 : 0, scale: visible ? 0.94 : 1 }}
        transition={{ type: 'spring', stiffness: 520, damping: 30, mass: 0.55 }}
        className="material-symbols-outlined text-[20px] leading-none"
      >
        add
      </motion.span>
    </motion.button>
  );
}

export default function PanelCustomizeSheet({
  open,
  onClose,
  title = 'Customize panels',
  subtitle = 'Choose which panels are visible in this view.',
  items,
  onShow,
  onHide,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  items: PanelOutlineItem[];
  onShow: (key: string) => void;
  onHide: (key: string) => void;
}) {
  const [sheetHeight, setSheetHeight] = useState(() => Math.min(760, Math.round(window.innerHeight * 0.9)));
  const dragRef = useRef<{ startY: number; startHeight: number; pointerId: number } | null>(null);

  useEffect(() => {
    const clampHeight = () => {
      setSheetHeight(current => Math.max(360, Math.min(Math.round(window.innerHeight * 0.96), current)));
    };
    clampHeight();
    window.addEventListener('resize', clampHeight);
    return () => window.removeEventListener('resize', clampHeight);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startY: event.clientY, startHeight: sheetHeight, pointerId: event.pointerId };
  };

  const updateResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    if (event.pointerId !== dragRef.current.pointerId) return;
    if (event.buttons === 0) {
      endResize(event);
      return;
    }
    const maxHeight = Math.round(window.innerHeight * 0.96);
    const next = dragRef.current.startHeight + dragRef.current.startY - event.clientY;
    setSheetHeight(Math.max(360, Math.min(maxHeight, next)));
  };

  const endResize = (event?: React.PointerEvent<HTMLButtonElement>) => {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  };

  const toggleItem = (item: PanelOutlineItem) => {
    if (item.disabled) return;
    if (item.visible) onHide(item.key);
    else onShow(item.key);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[120] bg-black/20"
          />
          <motion.aside
            data-panel-customize-sheet
            style={{ height: sheetHeight, willChange: 'transform' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.9 }}
            className={cn(
              'fixed bottom-0 left-4 right-4 z-[121] flex max-h-[96vh] min-h-[360px] flex-col overflow-hidden md:left-[92px]',
              'rounded-t-[24px] border border-outline-variant/15 bg-[#F7F9FC] shadow-[0_-18px_58px_rgba(32,33,36,0.22)] dark:bg-[#1E1D22]'
            )}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              aria-label="Resize customization drawer"
              onPointerDown={startResize}
              onPointerMove={updateResize}
              onPointerUp={endResize}
              onPointerCancel={endResize}
              onLostPointerCapture={() => {
                dragRef.current = null;
              }}
              className="group flex h-8 shrink-0 cursor-ns-resize touch-none items-center justify-center"
            >
              <span className="h-1.5 w-14 rounded-full bg-[#1a73e8] transition-transform group-hover:scale-x-125" />
            </button>
            <div className="relative flex shrink-0 items-center justify-between gap-4 border-b border-outline-variant/15 px-6 pb-4 md:px-8">
              <div className="min-w-0">
                <h2 className="truncate text-[18px] font-black text-on-surface dark:text-inverse-on-surface">{title}</h2>
                <p className="truncate text-[12px] font-semibold text-on-surface-variant dark:text-inverse-on-surface/65">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors md3-state-layer hover:bg-black/5 dark:text-inverse-on-surface/70 dark:hover:bg-white/8"
                aria-label="Close customization"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-6 md:px-8 xl:px-10">
              {items.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <p className="max-w-sm text-[15px] font-semibold text-on-surface-variant dark:text-inverse-on-surface/70">
                    No panels are available to customize in this view.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-8 gap-y-7">
                  {items.map(item => (
                    <section
                      key={item.key}
                      className={cn(
                        'group flex w-full flex-col items-start text-left transition-opacity',
                        item.visible ? 'opacity-100' : 'opacity-70 hover:opacity-100',
                        item.disabled && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <div className="w-full rounded-[8px] bg-transparent">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleItem(item)}
                          onKeyDown={event => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              toggleItem(item);
                            }
                          }}
                          className="relative block h-[170px] w-full overflow-visible text-left"
                          aria-label={item.disabled ? `${item.title} is ${item.disabledLabel ?? 'unavailable'}` : item.visible ? `Remove ${item.title}` : `Add ${item.title}`}
                        >
                          {!item.disabled && <PanelTogglePill
                            visible={item.visible}
                            title={item.title}
                            onToggle={() => toggleItem(item)}
                          />}
                          <div className={cn(
                            'h-full w-full overflow-hidden rounded-[18px] border bg-[#F4F7FC] transition-colors md3-state-layer dark:bg-[#242228]',
                            item.visible ? 'border-[#1a73e8]/80' : 'border-outline-variant/30 hover:border-[#1a73e8]/55'
                          )}>
                            {item.preview ? (typeof item.preview === 'function' ? (item.preview as Function)() : item.preview) : <FallbackPreview />}
                          </div>
                        </div>
                      </div>
                      <h3 className="mt-3 max-w-full truncate text-[15px] font-black text-on-surface dark:text-inverse-on-surface">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-1 line-clamp-2 max-w-[240px] text-[12px] font-semibold leading-snug text-on-surface-variant dark:text-inverse-on-surface/65">
                          {item.description}
                        </p>
                      )}
                      {item.disabled && <span className="mt-2 inline-flex rounded-full bg-on-surface/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-on-surface-variant">{item.disabledLabel ?? 'Coming soon'}</span>}
                    </section>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
