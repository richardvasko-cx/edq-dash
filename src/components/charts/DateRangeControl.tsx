// Per-tab date-range picker. Drives the date window for every chart on a tab. Works off
// the actual metric_date values present in the historical dataset (30 dates per case),
// with quick presets plus explicit from/to. Emits ISO date strings (inclusive).

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../App';
import { motion, AnimatePresence } from 'motion/react';

export interface DateRange { from: string; to: string }

const fmt = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

interface Props {
  /** Sorted ascending ISO dates available in the data. */
  dates: string[];
  value: DateRange;
  onChange: (r: DateRange) => void;
  className?: string;
}

export default function DateRangeControl({ dates, value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState('');
  const [tempTo, setTempTo] = useState('');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [pickerTarget, setPickerTarget] = useState<'from' | 'to'>('from');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const ref = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const min = dates[0] ?? '';
  const max = dates[dates.length - 1] ?? '';

  useEffect(() => {
    if (open) {
      const adjustPosition = () => {
        if (dropdownRef.current && ref.current) {
          const triggerRect = ref.current.getBoundingClientRect();
          const dropdownHeight = dropdownRef.current.offsetHeight;
          const viewportHeight = window.innerHeight;
          const normalBottom = triggerRect.bottom + 4 + dropdownHeight;
          const overflow = normalBottom - (viewportHeight - 16);
          if (overflow > 0) {
            const maxShift = triggerRect.bottom - 16;
            setTranslateY(-Math.min(overflow, maxShift));
          } else {
            setTranslateY(0);
          }
        }
      };

      adjustPosition();

      const observer = new ResizeObserver(() => {
        adjustPosition();
      });
      if (dropdownRef.current) {
        observer.observe(dropdownRef.current);
      }

      window.addEventListener('resize', adjustPosition);
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', adjustPosition);
      };
    } else {
      setTranslateY(0);
    }
  }, [open]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setPickerOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // Sync temp state when dropdown opens
  useEffect(() => {
    if (open) {
      setTempFrom(value.from);
      setTempTo(value.to);
      setPickerOpen(false);
      if (value.from) {
        setCurrentMonth(new Date(value.from + 'T00:00:00'));
      } else {
        setCurrentMonth(new Date());
      }
    }
  }, [open, value]);

  const presets = useMemo(() => {
    if (!dates.length) return [];
    const lastN = (n: number) => ({ from: dates[Math.max(0, dates.length - n)], to: max });
    return [
      { label: 'Last 7 days', range: lastN(7) },
      { label: 'Last 14 days', range: lastN(14) },
      { label: 'Last 30 days', range: { from: min, to: max } },
    ];
  }, [dates, min, max]);

  const label = value.from === min && value.to === max
    ? 'Last 30 days'
    : value.from === value.to ? fmt(value.from) : `${fmt(value.from)} – ${fmt(value.to)}`;

  const getDaysInMonth = (month: Date) => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const date = new Date(year, m, 1);
    const days: Date[] = [];
    while (date.getMonth() === m) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);
  const firstDayIndex = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(), [currentMonth]);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: Date) => {
    const iso = day.toISOString().slice(0, 10);
    // Two-click range selection logic
    if (!tempFrom || (tempFrom && tempTo)) {
      setTempFrom(iso);
      setTempTo('');
    } else {
      if (iso < tempFrom) {
        setTempFrom(iso);
      } else {
        setTempTo(iso);
      }
    }
  };

  return (
    <div ref={ref} className={cn('relative pointer-events-auto', className)}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex h-12 items-center gap-2 rounded-full border border-outline-variant/40 bg-white px-4 text-[13px] font-semibold text-on-surface shadow-[0_6px_18px_rgba(32,33,36,0.08)] transition-colors md3-state-layer dark:bg-[#121115] dark:text-inverse-on-surface"
      >
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">calendar_today</span>
        {label}
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div
          ref={dropdownRef}
          style={{
            transform: translateY !== 0 ? `translateY(${translateY}px)` : undefined,
            transition: 'transform 0.2s ease-out'
          }}
          className="absolute right-0 mt-1 z-30 w-[290px] rounded-2xl bg-white dark:bg-[#2A2930] border border-outline-variant/20 shadow-xl p-4 flex flex-col gap-3"
        >
          {/* 1. Presets */}
          <div className="flex flex-col gap-0.5">
            {presets.map(p => {
              const active = value.from === p.range.from && value.to === p.range.to;
              return (
                <button
                  key={p.label}
                  onClick={() => { onChange(p.range); setOpen(false); setPickerOpen(false); }}
                  className={cn('flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium text-left transition-colors md3-state-layer',
                    active ? 'bg-[#1A73E8]/10 text-[#1A73E8] dark:text-[#8AB4F8]' : 'text-on-surface dark:text-inverse-on-surface')}
                >
                  {p.label}
                  {active && <span className="material-symbols-outlined text-[18px] text-[#1A73E8] dark:text-[#8AB4F8]">check</span>}
                </button>
              );
            })}
          </div>

          {/* 2. From / To inputs (display temp range) */}
          <div className="border-t border-outline-variant/15 pt-3 grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 text-[11px] font-semibold text-on-surface-variant">
              From
              <button
                type="button"
                onClick={() => {
                  if (pickerOpen && pickerTarget === 'from') {
                    setPickerOpen(false);
                  } else {
                    setPickerTarget('from');
                    setPickerOpen(true);
                    if (tempFrom) setCurrentMonth(new Date(tempFrom + 'T00:00:00'));
                  }
                }}
                className={cn(
                  "px-2.5 py-2 rounded-lg border bg-transparent text-[12px] text-on-surface dark:text-inverse-on-surface text-left flex items-center justify-between transition-all font-medium md3-state-layer",
                  pickerOpen && pickerTarget === 'from'
                    ? "border-[#1A73E8] dark:border-[#8AB4F8] ring-1 ring-[#1A73E8]/20"
                    : "border-outline-variant/40"
                )}
              >
                <span>{tempFrom ? fmt(tempFrom) : 'Select date'}</span>
                <span className="material-symbols-outlined text-[15px] opacity-60">calendar_today</span>
              </button>
            </div>
            <div className="flex flex-col gap-1 text-[11px] font-semibold text-on-surface-variant">
              To
              <button
                type="button"
                onClick={() => {
                  if (pickerOpen && pickerTarget === 'to') {
                    setPickerOpen(false);
                  } else {
                    setPickerTarget('to');
                    setPickerOpen(true);
                    if (tempTo) setCurrentMonth(new Date(tempTo + 'T00:00:00'));
                  }
                }}
                className={cn(
                  "px-2.5 py-2 rounded-lg border bg-transparent text-[12px] text-on-surface dark:text-inverse-on-surface text-left flex items-center justify-between transition-all font-medium md3-state-layer",
                  pickerOpen && pickerTarget === 'to'
                    ? "border-[#1A73E8] dark:border-[#8AB4F8] ring-1 ring-[#1A73E8]/20"
                    : "border-outline-variant/40"
                )}
              >
                <span>{tempTo ? fmt(tempTo) : 'Select date'}</span>
                <span className="material-symbols-outlined text-[15px] opacity-60">calendar_today</span>
              </button>
            </div>
          </div>

          {/* 3. Inline Calendar (Smoothly extends panel downwards) */}
          <AnimatePresence initial={false}>
            {pickerOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="overflow-hidden border-t border-outline-variant/15 pt-3 mt-1 flex flex-col gap-2 select-none"
              >
                {/* Month selector header */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[13px] font-bold text-[#1D1B20] dark:text-[#E6E1E9] capitalize">
                    {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button type="button" onClick={prevMonth} className="w-7 h-7 rounded-full flex items-center justify-center text-[#1A73E8] dark:text-[#8AB4F8] hover:bg-black/6 dark:hover:bg-white/6 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button type="button" onClick={nextMonth} className="w-7 h-7 rounded-full flex items-center justify-center text-[#1A73E8] dark:text-[#8AB4F8] hover:bg-[#1A73E8]/10 dark:hover:bg-white/6 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-0.5 gap-x-0.5 text-center mt-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-[10px] font-black text-on-surface-variant/70 w-8 h-8 flex items-center justify-center">{d}</span>
                  ))}

                  {/* Empty cells offset */}
                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="w-8 h-8" />
                  ))}

                  {/* Day Buttons */}
                  {days.map((day) => {
                    const dayIso = day.toISOString().slice(0, 10);

                    const isFrom = tempFrom && dayIso === tempFrom;
                    const isTo = tempTo && dayIso === tempTo;

                    // Highlight logic:
                    // If range is fully selected: dayTime between start and end.
                    // If selection in progress (only start is selected) and user is hovering: dayTime between start and hovered.
                    let isInRange = false;
                    if (tempFrom && tempTo) {
                      isInRange = dayIso > tempFrom && dayIso < tempTo;
                    } else if (tempFrom && !tempTo && hoveredDate) {
                      isInRange = dayIso > tempFrom && dayIso < hoveredDate;
                    }

                    const isHoveredEnd = tempFrom && !tempTo && hoveredDate === dayIso;
                    const isToday = dayIso === new Date().toISOString().slice(0, 10);

                    return (
                      <button
                        type="button"
                        key={day.toISOString()}
                        onClick={() => handleSelectDay(day)}
                        onMouseEnter={() => setHoveredDate(dayIso)}
                        onMouseLeave={() => setHoveredDate(null)}
                        className={cn(
                          'w-8 h-8 flex items-center justify-center text-xs font-semibold transition-colors',
                          (isFrom || isTo)
                            ? 'bg-[#1A73E8] text-white dark:bg-[#8AB4F8] dark:text-[#1D1B20] rounded-full z-10 font-bold'
                            : isHoveredEnd
                            ? 'border border-dashed border-[#1A73E8] text-[#1A73E8] dark:border-[#8AB4F8] dark:text-[#8AB4F8] rounded-full z-10'
                            : isInRange
                            ? 'bg-[#1A73E8]/15 text-[#1A73E8] dark:bg-[#8AB4F8]/20 dark:text-[#8AB4F8]'
                            : isToday
                            ? 'border border-[#1A73E8] text-[#1A73E8] dark:border-[#8AB4F8] dark:text-[#8AB4F8] rounded-full hover:bg-black/5 dark:hover:bg-white/5'
                            : 'text-[#1D1B20] dark:text-[#E6E1E9] hover:bg-black/5 dark:hover:bg-white/5 rounded-full'
                        )}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Footer Actions (OK / Cancel) */}
                <div className="pt-2 flex justify-end gap-2 border-t border-outline-variant/10 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setPickerOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-full md3-state-layer text-xs font-bold text-[#1A73E8] dark:text-[#8AB4F8] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ from: tempFrom, to: tempTo });
                      setOpen(false);
                      setPickerOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-full md3-state-layer text-xs font-bold text-[#1A73E8] dark:text-[#8AB4F8] transition-colors cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
