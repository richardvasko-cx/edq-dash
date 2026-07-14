import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../App';

// ============================================================================
// I. BUTTONS & FABs
// ============================================================================

// 1. Md3Button
interface Md3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text';
  icon?: string;
  loading?: boolean;
}

export function Md3Button({
  label,
  variant = 'filled',
  icon,
  loading = false,
  className,
  ...props
}: Md3ButtonProps) {
  const baseClasses = cn(
    'relative md3-state-layer flex items-center justify-center gap-2 h-10 px-6 rounded-full text-sm font-semibold select-none outline-none transition-all duration-200 ease-md3-standard focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-38',
    className
  );

  const variants = {
    filled: 'bg-primary text-on-primary hover:shadow-md focus-visible:ring-primary',
    elevated: 'bg-surface-bright text-primary shadow-sm hover:shadow-md focus-visible:ring-primary border border-outline-variant/30',
    tonal: 'bg-secondary-fixed text-on-secondary-fixed focus-visible:ring-secondary',
    outlined: 'border border-outline text-primary focus-visible:ring-primary',
    text: 'text-primary focus-visible:ring-primary px-3',
  };

  return (
    <button className={cn(baseClasses, variants[variant])} {...props}>
      {loading && (
        <span className="material-symbols-outlined animate-spin text-[18px]">
          progress_activity
        </span>
      )}
      {!loading && icon && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
      <span>{label}</span>
    </button>
  );
}

// 2. Md3ButtonGroup
export function Md3ButtonGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center -space-x-px rounded-full overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-sm', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const element = child as React.ReactElement<any>;
          return React.cloneElement(element, {
            className: cn(element.props.className, 'rounded-none border-y-0 border-x border-outline-variant/30 first:border-l-0 last:border-r-0 first:pl-6 last:pr-6 px-4'),
          });
        }
        return child;
      })}
    </div>
  );
}

// 3. Md3FAB & Extended FAB
interface Md3FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label?: string; // If label is provided, becomes an Extended FAB
  size?: 'small' | 'medium' | 'large';
  variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
}

export function Md3FAB({
  icon,
  label,
  size = 'medium',
  variant = 'primary',
  className,
  ...props
}: Md3FABProps) {
  const isExtended = !!label;

  const baseClasses = cn(
    'flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 ease-md3-standard select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    isExtended ? 'rounded-2xl h-14 px-5 gap-3' : {
      small: 'rounded-xl h-10 w-10',
      medium: 'rounded-2xl h-14 w-14',
      large: 'rounded-[28px] h-24 w-24',
    }[size],
    className
  );

  const colors = {
    surface: 'bg-surface-bright text-primary hover:bg-surface-container-low focus-visible:ring-primary',
    primary: 'bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim/80 focus-visible:ring-primary',
    secondary: 'bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim/80 focus-visible:ring-secondary',
    tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed-dim/80 focus-visible:ring-tertiary',
  };

  const iconSizes = {
    small: 'text-[20px]',
    medium: 'text-[24px]',
    large: 'text-[36px]',
  };

  return (
    <button className={cn(baseClasses, colors[variant])} {...props}>
      <span className={cn('material-symbols-outlined', isExtended ? 'text-[24px]' : iconSizes[size])}>
        {icon}
      </span>
      {isExtended && <span className="text-sm font-semibold tracking-[0.1px]">{label}</span>}
    </button>
  );
}

// 4. Md3FABMenu
interface Md3FABMenuProps {
  icon: string;
  actions: { icon: string; label: string; onClick: () => void }[];
  variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
  className?: string;
}

export function Md3FABMenu({ icon, actions, variant = 'primary', className }: Md3FABMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('relative flex flex-col items-center gap-3', className)}>
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-center gap-3 absolute bottom-full mb-3 z-10">
            {actions.map((act, i) => (
              <motion.div
                key={act.label}
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ duration: 0.2, delay: i * 0.05, ease: [0.05, 0.7, 0.1, 1] }}
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => {
                  act.onClick();
                  setIsOpen(false);
                }}
              >
                <span className="bg-inverse-surface text-inverse-on-surface text-[11px] font-bold px-2 py-1 rounded-sm shadow opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                  {act.label}
                </span>
                <button className="flex items-center justify-center rounded-full bg-surface-bright text-primary border border-outline-variant/30 shadow-md h-10 w-10 hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{act.icon}</span>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
      <Md3FAB
        icon={icon}
        variant={variant}
        onClick={() => setIsOpen(!isOpen)}
        className={cn('transition-transform duration-300', isOpen && 'rotate-45')}
      />
    </div>
  );
}

// 5. Md3IconButton
interface Md3IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  selectedIcon?: string;
  selected?: boolean;
  toggle?: boolean;
}

export function Md3IconButton({
  icon,
  selectedIcon,
  selected = false,
  toggle = false,
  className,
  ...props
}: Md3IconButtonProps) {
  const activeIcon = toggle && selected ? (selectedIcon || icon) : icon;

  return (
    <button
      className={cn(
        'w-10 h-10 rounded-full md3-state-layer flex items-center justify-center transition-colors text-on-surface-variant outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-38 disabled:pointer-events-none',
        toggle && selected && 'text-primary bg-primary/8',
        className
      )}
      {...props}
    >
      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: toggle && selected ? "'FILL' 1" : '' }}>
        {activeIcon}
      </span>
    </button>
  );
}

// 6. Md3SegmentedButton
interface Md3SegmentedButtonProps {
  options: { id: string; label: string; icon?: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  multiSelect?: boolean;
  className?: string;
}

export function Md3SegmentedButton({
  options,
  selectedIds,
  onChange,
  multiSelect = false,
  className,
}: Md3SegmentedButtonProps) {
  const handleClick = (id: string) => {
    if (multiSelect) {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter((x) => x !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    } else {
      onChange([id]);
    }
  };

  return (
    <div className={cn('flex items-center -space-x-px border border-outline rounded-full overflow-hidden bg-surface-container-lowest shadow-none w-full max-w-fit', className)}>
      {options.map((opt, idx) => {
        const isSelected = selectedIds.includes(opt.id);
        return (
          <button
            key={opt.id}
            onClick={() => handleClick(opt.id)}
            className={cn(
              'relative flex items-center justify-center gap-2 h-10 px-5 text-xs font-semibold select-none outline-none transition-all duration-200 ease-md3-standard border-r border-outline border-y-0 border-l-0 last:border-r-0 flex-1 whitespace-nowrap',
              isSelected
                ? 'bg-secondary-fixed text-on-secondary-fixed font-bold'
                : 'text-on-surface-variant hover:bg-on-surface/4'
            )}
          >
            {isSelected && (
              <span className="material-symbols-outlined text-[16px]">check</span>
            )}
            {!isSelected && opt.icon && (
              <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// 7. Md3SplitButton
interface Md3SplitButtonProps {
  label: string;
  icon?: string;
  onClick: () => void;
  actions: { label: string; onClick: () => void }[];
  disabled?: boolean;
  className?: string;
}

export function Md3SplitButton({
  label,
  icon,
  onClick,
  actions,
  disabled = false,
  className,
}: Md3SplitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative inline-flex items-center', className)}>
      {/* Primary Action */}
      <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center gap-2 h-10 pl-6 pr-4 bg-primary text-on-primary rounded-l-full text-sm font-semibold select-none outline-none hover:bg-primary-container hover:shadow-md transition-all duration-200 border-r border-black/10 disabled:opacity-38 disabled:pointer-events-none"
      >
        {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
        <span>{label}</span>
      </button>

      {/* Dropdown Arrow */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center justify-center w-10 h-10 bg-primary text-on-primary rounded-r-full hover:bg-primary-container hover:shadow-md transition-all duration-200 outline-none disabled:opacity-38 disabled:pointer-events-none"
      >
        <span className={cn('material-symbols-outlined text-[20px] transition-transform duration-200', isOpen && 'rotate-180')}>
          arrow_drop_down
        </span>
      </button>

      {/* Menu Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: [0.05, 0.7, 0.1, 1] }}
            className="absolute top-full mt-1.5 right-0 bg-surface-bright border border-outline-variant/30 rounded-md py-1.5 min-w-[160px] shadow-lg z-20"
          >
            {actions.map((act) => (
              <button
                key={act.label}
                onClick={() => {
                  act.onClick();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-on-surface hover:bg-on-surface/4 transition-colors"
              >
                {act.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ============================================================================
// II. DATE & TIME PICKERS
// ============================================================================

// 1. Md3DatePicker
interface Md3DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function Md3DatePicker({ isOpen, onClose, selectedDate, onSelectDate }: Md3DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isManualInput, setIsManualInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  // Helper to format date to MM/DD/YYYY
  const formatDateToInput = (d: Date): string => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  // Helper to parse date MM/DD/YYYY
  const parseInputToDate = (s: string): Date | null => {
    const parts = s.split(/[\/\-\.]/);
    if (parts.length !== 3) return null;
    let month, day, year;
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      // MM/DD/YYYY
      month = parseInt(parts[0], 10) - 1;
      day = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }
    if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
    const d = new Date(year, month, day);
    if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
    return d;
  };

  // Sync state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(selectedDate || new Date());
      setIsManualInput(false);
      setInputValue(selectedDate ? formatDateToInput(selectedDate) : '');
      setInputError('');
    }
  }, [isOpen, selectedDate]);

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

  const days = getDaysInMonth(currentMonth);
  // Get index of the first day (0 = Sunday, 1 = Monday, etc.) to offset days grid correctly
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const headerDateText = useMemo(() => {
    if (isManualInput) {
      const parsed = parseInputToDate(inputValue);
      if (parsed) {
        return parsed.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }
      return 'Select date';
    }
    if (selectedDate) {
      return selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return 'Select date';
  }, [selectedDate, isManualInput, inputValue]);

  const handleOk = () => {
    if (isManualInput) {
      const parsed = parseInputToDate(inputValue);
      if (!parsed) {
        setInputError('Invalid date. Use MM/DD/YYYY.');
        return;
      }
      onSelectDate(parsed);
    }
    onClose();
  };

  const handleSelectDay = (day: Date) => {
    onSelectDate(day);
    setInputValue(formatDateToInput(day));
    setInputError('');
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') handleOk();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isManualInput, inputValue]);

  const today = new Date();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
            className="relative bg-[#ECE6F0] dark:bg-[#2B2930] rounded-[28px] w-full max-w-[328px] overflow-hidden shadow-2xl border border-outline-variant/20 text-[#1D1B20] dark:text-[#E6E1E9] flex flex-col select-none"
            role="dialog"
            aria-modal="true"
          >
            {/* Header section */}
            <div className="p-6 pb-3 flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-[#49454F] dark:text-[#CAC4D0] tracking-wider uppercase">
                {isManualInput ? 'Enter date' : 'Select date'}
              </span>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-[28px] font-normal leading-tight text-[#1D1B20] dark:text-[#E6E1E9]">
                  {headerDateText}
                </span>
                <button
                  onClick={() => setIsManualInput(v => !v)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/6 dark:hover:bg-white/6 transition-colors"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {isManualInput ? 'calendar_today' : 'edit'}
                  </span>
                </button>
              </div>
            </div>
            <div className="h-px bg-outline-variant/30 dark:bg-white/10 w-full" />

            {/* Content view toggle */}
            {isManualInput ? (
              /* Manual Text Input View */
              <div className="p-6 py-8 flex flex-col gap-2 min-h-[288px]">
                <label className="text-xs font-semibold text-[#6750A4] dark:text-[#D0BCFF]">Date</label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setInputError('');
                  }}
                  placeholder="MM/DD/YYYY"
                  className="w-full bg-white dark:bg-black/20 border border-[#6750A4] dark:border-[#D0BCFF] rounded-lg px-4 py-3 text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-[#6750A4] transition-all"
                  autoFocus
                />
                <span className="text-xs text-[#49454F]/70 dark:text-[#CAC4D0]/70">Format: MM/DD/YYYY</span>
                {inputError && (
                  <span className="text-xs text-[#B3261E] font-semibold mt-1">{inputError}</span>
                )}
              </div>
            ) : (
              /* Calendar Grid View */
              <div className="flex flex-col min-h-[288px]">
                {/* Month selector controls */}
                <div className="px-6 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1 cursor-pointer hover:bg-black/4 dark:hover:bg-white/4 px-2 py-1 rounded-md">
                    <span className="text-sm font-semibold text-[#49454F] dark:text-[#CAC4D0] capitalize">
                      {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-[#49454F] dark:text-[#CAC4D0]">arrow_drop_down</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/6 dark:hover:bg-white/6">
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/6 dark:hover:bg-white/6">
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center px-4 pb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-xs font-bold text-on-surface-variant/70 w-9 h-9 flex items-center justify-center">{d}</span>
                  ))}
                  
                  {/* Empty cells offset */}
                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="w-9 h-9" />
                  ))}

                  {/* Day Buttons */}
                  {days.map((day) => {
                    const isSelected = selectedDate?.toDateString() === day.toDateString();
                    const isToday = today.toDateString() === day.toDateString();
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleSelectDay(day)}
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-colors relative',
                          isSelected
                            ? 'bg-[#6750A4] text-white dark:bg-[#D0BCFF] dark:text-[#381E72]'
                            : isToday
                            ? 'border border-[#6750A4] text-[#6750A4] dark:border-[#D0BCFF] dark:text-[#D0BCFF] hover:bg-[#6750A4]/10'
                            : 'text-[#1D1B20] dark:text-[#E6E1E9] hover:bg-black/6 dark:hover:bg-white/6'
                        )}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action buttons footer */}
            <div className="p-4 pt-1 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-full text-sm font-bold text-[#6750A4] dark:text-[#D0BCFF] hover:bg-[#6750A4]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOk}
                className="px-3 py-2 rounded-full text-sm font-bold text-[#6750A4] dark:text-[#D0BCFF] hover:bg-[#6750A4]/10 transition-colors"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// 1.5. InlineDatePicker
interface InlineDatePickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onClose?: () => void;
}

export function InlineDatePicker({ selectedDate, onSelectDate, onClose }: InlineDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setCurrentMonth(selectedDate || new Date());
  }, [selectedDate]);

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

  const days = getDaysInMonth(currentMonth);
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleOk = () => {
    if (onClose) onClose();
  };

  const handleSelectDay = (day: Date) => {
    onSelectDate(day);
  };

  const today = new Date();

  return (
    <div className="flex flex-col gap-3 select-none bg-white text-[#1D1B20] dark:bg-[#2A2930] dark:text-[#E6E1E9]">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-bold capitalize text-[#1D1B20] dark:text-[#E6E1E9]">
          {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </span>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={prevMonth} className="flex h-7 w-7 items-center justify-center rounded-full text-[#1A73E8] transition-colors hover:bg-black/6 dark:text-[#8AB4F8] dark:hover:bg-white/6">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button type="button" onClick={nextMonth} className="flex h-7 w-7 items-center justify-center rounded-full text-[#1A73E8] transition-colors hover:bg-[#1A73E8]/10 dark:text-[#8AB4F8] dark:hover:bg-white/6">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-x-0.5 gap-y-0.5 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="flex h-8 w-8 items-center justify-center text-[10px] font-black text-on-surface-variant/70">{d}</span>
        ))}

        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-8 w-8" />
        ))}

        {days.map((day) => {
          const isSelected = selectedDate?.toDateString() === day.toDateString();
          const isToday = today.toDateString() === day.toDateString();
          return (
            <button
              type="button"
              key={day.toISOString()}
              onClick={() => handleSelectDay(day)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                isSelected
                  ? 'bg-[#1A73E8] text-white dark:bg-[#8AB4F8] dark:text-[#1D1B20]'
                  : isToday
                    ? 'border border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8]/10 dark:border-[#8AB4F8] dark:text-[#8AB4F8]'
                    : 'text-[#1D1B20] hover:bg-black/6 dark:text-[#E6E1E9] dark:hover:bg-white/6'
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 border-t border-outline-variant/10 pt-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-3 py-1.5 text-xs font-bold text-[#1A73E8] transition-colors hover:bg-[#1A73E8]/10 dark:text-[#8AB4F8]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleOk}
          className="rounded-full px-3 py-1.5 text-xs font-bold text-[#1A73E8] transition-colors hover:bg-[#1A73E8]/10 dark:text-[#8AB4F8]"
        >
          OK
        </button>
      </div>
    </div>
  );
}

// 2. Md3TimePicker
interface Md3TimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTime: string; // "HH:MM AM/PM"
  onSelectTime: (time: string) => void;
}

export function Md3TimePicker({ isOpen, onClose, selectedTime, onSelectTime }: Md3TimePickerProps) {
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  const handleSave = () => {
    onSelectTime(`${hour}:${minute} ${period}`);
    onClose();
  };

  return (
    <Md3Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Set Time"
      actions={
        <div className="flex justify-end gap-2">
          <Md3Button label="Cancel" variant="text" onClick={onClose} />
          <Md3Button label="OK" variant="filled" onClick={handleSave} />
        </div>
      }
    >
      <div className="flex flex-col items-center gap-6 py-4">
        {/* Time input boxes */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1 items-center">
            <input
              type="text"
              value={hour}
              onChange={(e) => setHour(e.target.value.slice(0, 2))}
              className="w-16 h-16 rounded-xl border border-outline bg-surface-container text-center text-3xl font-bold text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <span className="text-[10px] text-on-surface-variant/70 font-semibold uppercase">Hour</span>
          </div>

          <span className="text-3xl font-bold text-on-surface-variant mb-4">:</span>

          <div className="flex flex-col gap-1 items-center">
            <input
              type="text"
              value={minute}
              onChange={(e) => setMinute(e.target.value.slice(0, 2))}
              className="w-16 h-16 rounded-xl border border-outline bg-surface-container text-center text-3xl font-bold text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <span className="text-[10px] text-on-surface-variant/70 font-semibold uppercase">Minute</span>
          </div>

          <div className="flex flex-col rounded-xl border border-outline overflow-hidden shrink-0 ml-2">
            <button
              onClick={() => setPeriod('AM')}
              className={cn('px-4 py-2.5 text-xs font-bold transition-colors border-b border-outline', period === 'AM' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'hover:bg-on-surface/4 text-on-surface-variant')}
            >
              AM
            </button>
            <button
              onClick={() => setPeriod('PM')}
              className={cn('px-4 py-2.5 text-xs font-bold transition-colors', period === 'PM' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'hover:bg-on-surface/4 text-on-surface-variant')}
            >
              PM
            </button>
          </div>
        </div>
      </div>
    </Md3Dialog>
  );
}


// ============================================================================
// III. LOADING & PROGRESS
// ============================================================================

// 1. Md3LoadingIndicator (Circular spinner)
export function Md3LoadingIndicator({ className, size = 'medium' }: { className?: string; size?: 'small' | 'medium' | 'large' }) {
  const pixelSizes = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-[3px]',
    large: 'w-16 h-16 border-[4px]',
  };
  return (
    <div
      className={cn(
        'rounded-full border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin',
        pixelSizes[size],
        className
      )}
    />
  );
}

// 2. Md3ProgressIndicator (Linear progress bar)
export function Md3ProgressIndicator({ progress, className }: { progress?: number; className?: string }) {
  const isIndeterminate = progress === undefined;

  return (
    <div className={cn('h-1 w-full bg-surface-container rounded-full overflow-hidden relative', className)}>
      {isIndeterminate ? (
        <div className="h-full bg-primary rounded-full absolute top-0 left-0 w-1/3 animate-[indeterminate-progress_1.6s_infinite_linear]" />
      ) : (
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-md3-standard"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      )}
    </div>
  );
}


// ============================================================================
// IV. NAVIGATION COMPONENTS
// ============================================================================

// 1. Md3NavigationBar
interface Md3NavigationBarProps {
  items: { id: string; label: string; icon: string }[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Md3NavigationBar({ items, activeId, onChange, className }: Md3NavigationBarProps) {
  return (
    <nav className={cn('flex items-center justify-around h-20 bg-surface-container-low border-t border-outline-variant/30 px-2 shrink-0 select-none', className)}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="flex flex-col items-center gap-1.5 flex-1 max-w-[80px] h-full justify-center group outline-none"
          >
            <div className="relative h-8 w-16 flex items-center justify-center">
              {isActive && (
                <motion.div
                  layoutId="nav-bar-pill"
                  className="absolute inset-0 bg-primary-fixed rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              <span
                className={cn('relative z-10 material-symbols-outlined text-[24px] text-on-surface-variant group-hover:text-on-surface transition-colors', isActive && 'text-on-primary-fixed')}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : '' }}
              >
                {item.icon}
              </span>
            </div>
            <span className={cn('text-[11px] font-semibold tracking-[0.2px] text-on-surface-variant transition-colors group-hover:text-on-surface', isActive && 'text-on-surface font-black')}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// 2. Md3NavigationDrawer
interface Md3NavigationDrawerProps {
  items: { id: string; label: string; icon: string }[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  header?: React.ReactNode;
}

export function Md3NavigationDrawer({ items, activeId, onChange, className, header }: Md3NavigationDrawerProps) {
  return (
    <aside className={cn('w-80 shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col py-6 gap-1.5 px-3 select-none h-full', className)}>
      {header && <div className="mb-4">{header}</div>}
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative flex items-center gap-3 px-4 min-h-[56px] rounded-full text-sm font-semibold tracking-[0.1px] text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isActive
                ? 'bg-[#1A73E8]/8 dark:bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#D2E3FC] font-black'
                : 'text-on-surface-variant hover:bg-on-surface/8 hover:text-on-surface'
            )}
          >
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : '' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}

// 3. Md3NavigationRail
interface Md3NavigationRailProps {
  items: { id: string; label: string; icon: string }[];
  activeId: string;
  onChange: (id: string) => void;
  fabIcon?: string;
  onFabClick?: () => void;
  className?: string;
}

export function Md3NavigationRail({
  items,
  activeId,
  onChange,
  fabIcon,
  onFabClick,
  className,
}: Md3NavigationRailProps) {
  return (
    <aside className={cn('w-20 shrink-0 bg-surface-container-low border-r border-outline-variant/30 flex flex-col items-center py-6 gap-8 h-full select-none', className)}>
      {fabIcon && onFabClick && (
        <Md3FAB icon={fabIcon} size="medium" variant="surface" onClick={onFabClick} />
      )}
      <div className="flex-1 flex flex-col gap-6 w-full items-center justify-center">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="flex flex-col items-center gap-1 w-full group outline-none"
            >
              <div className="relative h-8 w-14 flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="nav-rail-pill"
                    className="absolute inset-0 bg-primary-fixed rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span
                  className={cn('relative z-10 material-symbols-outlined text-[24px] text-on-surface-variant group-hover:text-on-surface transition-colors', isActive && 'text-on-primary-fixed')}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : '' }}
                >
                  {item.icon}
                </span>
              </div>
              <span className={cn('text-[10px] font-semibold text-on-surface-variant transition-colors group-hover:text-on-surface', isActive && 'text-on-surface font-black')}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}


// ============================================================================
// V. SHEETS
// ============================================================================

// 1. Md3BottomSheet
interface Md3BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Md3BottomSheet({ isOpen, onClose, title, children, className }: Md3BottomSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }} // Emphasized decelerate
            className={cn(
              'relative bg-surface-bright rounded-t-[28px] w-full max-h-[85vh] shadow-2xl flex flex-col border-t border-outline-variant/30 text-on-surface dark:text-inverse-on-surface z-10',
              className
            )}
          >
            {/* Drag Handle Indicator */}
            <div className="w-full flex justify-center py-3 select-none">
              <div className="w-8 h-1 bg-outline-variant/80 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-outline-variant/30 shrink-0">
              <h3 className="text-lg font-bold">{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-on-surface/6">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// 2. Md3SideSheet
interface Md3SideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Md3SideSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
}: Md3SideSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'tween', duration: 0.24, ease: [0.2, 0, 0, 1] }}
            className={cn(
              'relative bg-surface-bright rounded-l-2xl w-full max-w-[450px] h-full shadow-2xl flex flex-col border-l border-outline-variant/30 text-on-surface dark:text-inverse-on-surface z-10',
              className
            )}
          >
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/50 shrink-0">
              <h3 className="text-lg font-bold text-on-surface dark:text-inverse-on-surface">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-on-surface/8 transition-colors text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


// ============================================================================
// VI. ALL OTHER M3 COMPONENTS
// ============================================================================

// 1. Md3AppBar
interface Md3AppBarProps {
  title: string;
  type?: 'center' | 'small' | 'medium' | 'large';
  actions?: React.ReactNode;
  navigationIcon?: string;
  onNavigationClick?: () => void;
  className?: string;
}

export function Md3AppBar({
  title,
  type = 'small',
  actions,
  navigationIcon = 'menu',
  onNavigationClick,
  className,
}: Md3AppBarProps) {
  const isCenter = type === 'center';
  const isLarge = type === 'large' || type === 'medium';

  return (
    <header
      className={cn(
        'w-full bg-surface-container-low text-on-surface flex flex-col justify-between border-b border-outline-variant/30 shrink-0 px-4 select-none',
        type === 'large' ? 'h-36 py-4' : type === 'medium' ? 'h-28 py-3' : 'h-16',
        className
      )}
    >
      <div className="flex items-center justify-between h-16 w-full">
        {/* Navigation Icon */}
        <div className="flex items-center gap-1">
          {onNavigationClick && (
            <Md3IconButton icon={navigationIcon} onClick={onNavigationClick} />
          )}
          {!isLarge && (
            <h1 className={cn('text-lg font-bold', isCenter && 'absolute left-1/2 -translate-x-1/2')}>
              {title}
            </h1>
          )}
        </div>

        {/* Actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Large / Medium title header spacing */}
      {isLarge && (
        <h1 className={cn('font-bold leading-tight px-3', type === 'large' ? 'text-3xl' : 'text-xl')}>
          {title}
        </h1>
      )}
    </header>
  );
}

// 2. Md3Badge
export function Md3Badge({ content, className }: { content?: number | string; className?: string }) {
  const hasContent = content !== undefined;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-error text-on-error select-none font-bold shrink-0',
        hasContent
          ? 'min-w-[16px] h-4 px-1.5 text-[9px] leading-none tracking-wide'
          : 'w-2.5 h-2.5 border border-surface-bright',
        className
      )}
    >
      {content}
    </span>
  );
}

// 3. Md3Card
interface Md3CardProps {
  variant?: 'elevated' | 'filled' | 'outlined';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Md3Card({
  variant = 'elevated',
  children,
  onClick,
  className,
}: Md3CardProps) {
  const isActionable = !!onClick;
  
  const baseClasses = cn(
    'rounded-md p-5 transition-all duration-300 ease-md3-emphasized border text-on-surface dark:text-inverse-on-surface',
    isActionable && 'cursor-pointer select-none',
    className
  );

  const variants = {
    elevated: cn(
      'bg-surface-bright shadow-sm border-outline-variant/30',
      isActionable && 'hover:shadow-md hover:bg-surface-container-low hover:border-outline-variant/60'
    ),
    filled: cn(
      'bg-surface-container border-transparent',
      isActionable && 'hover:bg-surface-container-high'
    ),
    outlined: cn(
      'border-outline-variant bg-surface-container-lowest',
      isActionable && 'hover:bg-surface-container hover:border-outline'
    ),
  };

  return (
    <div onClick={onClick} className={cn(baseClasses, variants[variant])}>
      {children}
    </div>
  );
}

// 4. Md3Carousel
export function Md3Carousel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar w-full py-2', className)}>
      {React.Children.map(children, (child) => (
        <div className="snap-center shrink-0 max-w-[280px]">
          {child}
        </div>
      ))}
    </div>
  );
}

// 5. Md3Checkbox
interface Md3CheckboxProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Md3Checkbox({ checked, onChange, className, disabled, children, ...props }: Md3CheckboxProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleChange = (e: any) => {
      onChange?.(e.target.hasAttribute('checked'));
    };
    el.addEventListener('change', handleChange);
    return () => {
      el.removeEventListener('change', handleChange);
    };
  }, [onChange]);

  return (
    <cr-checkbox
      ref={ref as any}
      checked={checked ? '' : undefined}
      disabled={disabled ? '' : undefined}
      class={className}
      {...props}
    >
      {children}
    </cr-checkbox>
  );
}

// 6. Md3Chip
interface Md3ChipProps {
  label: string;
  icon?: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  onClose?: () => void; // If provided, shows close button
  className?: string;
}

export function Md3Chip({
  label,
  icon,
  selected = false,
  onClick,
  disabled = false,
  onClose,
  className,
}: Md3ChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 h-8 px-4 rounded-sm text-xs font-semibold border transition-all duration-200 ease-md3-standard select-none disabled:opacity-38 disabled:pointer-events-none shrink-0',
        selected
          ? 'bg-secondary-fixed border-transparent text-on-secondary-fixed'
          : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-on-surface/4 hover:border-outline',
        className
      )}
    >
      {icon && <span className="material-symbols-outlined text-[16px]">{icon}</span>}
      <span>{label}</span>
      {onClose && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="material-symbols-outlined text-[16px] ml-1 text-on-surface-variant/60 hover:text-on-surface cursor-pointer rounded-full p-0.5"
        >
          close
        </span>
      )}
    </button>
  );
}

// 7. Md3Dialog
interface Md3DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function Md3Dialog({
  isOpen,
  onClose,
  title,
  children,
  actions,
  className,
}: Md3DialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
            className={cn(
              'relative bg-surface-bright rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-xl border border-outline-variant/30 text-on-surface dark:text-inverse-on-surface',
              className
            )}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="text-xl font-bold text-on-surface dark:text-inverse-on-surface leading-tight">
              {title}
            </h2>
            <div className="text-sm leading-relaxed text-on-surface-variant overflow-y-auto max-h-[60vh] custom-scrollbar">
              {children}
            </div>
            {actions && (
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-outline-variant/30">
                {actions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// 8. Md3Divider
export function Md3Divider({ className, vertical = false }: { className?: string; vertical?: boolean }) {
  return (
    <div
      className={cn(
        'bg-outline-variant/50 shrink-0',
        vertical ? 'w-px h-full' : 'h-px w-full',
        className
      )}
    />
  );
}

// 9. Md3List & ListItem
export function Md3List({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col w-full py-1.5 bg-surface-bright rounded-md border border-outline-variant/20', className)}>
      {children}
    </div>
  );
}

interface Md3ListItemProps {
  headline: string;
  supportingText?: string;
  leadingIcon?: string;
  trailingAction?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Md3ListItem({
  headline,
  supportingText,
  leadingIcon,
  trailingAction,
  onClick,
  className,
}: Md3ListItemProps) {
  const isActionable = !!onClick;
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 px-4 py-3 min-h-[56px] text-left transition-colors border-b border-outline-variant/20 last:border-b-0 text-on-surface select-none',
        isActionable ? 'cursor-pointer md3-state-layer' : '',
        className
      )}
    >
      {leadingIcon && (
        <span className="material-symbols-outlined text-[24px] text-on-surface-variant shrink-0">
          {leadingIcon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate leading-tight">{headline}</p>
        {supportingText && (
          <p className="text-xs text-on-surface-variant truncate mt-0.5 leading-none">{supportingText}</p>
        )}
      </div>
      {trailingAction && <div className="shrink-0">{trailingAction}</div>}
    </div>
  );
}

// 10. Md3Menu
interface Md3MenuProps {
  trigger: React.ReactNode;
  items: { label: string; icon?: string; onClick: () => void }[];
  className?: string;
}

export function Md3Menu({ trigger, items, className }: Md3MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: [0.05, 0.7, 0.1, 1] }}
            className={cn(
              'absolute right-0 mt-1.5 w-48 rounded-md bg-surface-bright border border-outline-variant/30 shadow-lg z-20 py-1.5 focus:outline-none',
              className
            )}
          >
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-on-surface/4 text-left transition-colors"
              >
                {item.icon && (
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 11. Md3RadioButton
interface Md3RadioButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  selected: boolean;
  onChange: (val: boolean) => void;
}

export function Md3RadioButton({ selected, onChange, disabled, className, ...props }: Md3RadioButtonProps) {
  return (
    <label className={cn('relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-on-surface/6 cursor-pointer select-none outline-none focus-within:ring-2 focus-within:ring-primary', disabled && 'opacity-38 pointer-events-none', className)}>
      <input
        type="radio"
        checked={selected}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        {...props}
      />
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
          selected ? 'border-primary' : 'border-outline-variant hover:border-outline'
        )}
      >
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2.5 h-2.5 rounded-full bg-primary"
          />
        )}
      </div>
    </label>
  );
}

// 12. Md3Search
interface Md3SearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onSelectSuggestion?: (s: string) => void;
  className?: string;
}

export function Md3Search({
  value,
  onChange,
  placeholder = 'Search…',
  suggestions = [],
  onSelectSuggestion,
  className,
}: Md3SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const hasSuggestions = suggestions.length > 0;

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-md select-none', className)}>
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[20px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-11 pl-12 pr-10 rounded-full border border-outline bg-surface-container-low text-sm font-semibold outline-none focus:bg-surface-bright focus:border-primary transition-all text-on-surface"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="absolute right-4 text-on-surface-variant/70 hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hasSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-full bg-surface-bright border border-outline-variant/30 rounded-2xl shadow-xl z-20 overflow-hidden py-2"
          >
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onSelectSuggestion?.(s);
                  setIsOpen(false);
                }}
                className="w-full text-left px-5 py-3 text-xs font-semibold text-on-surface hover:bg-on-surface/4 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history</span>
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 13. Md3Slider
interface Md3SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  className?: string;
}

export function Md3Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
}: Md3SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('relative flex items-center w-full h-10 select-none group', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-surface-container rounded-full appearance-none outline-none cursor-pointer focus:ring-1 focus:ring-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:hover:shadow-md [&::-webkit-slider-thumb]:transition-all"
        style={{
          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--color-surface-container) ${percentage}%, var(--color-surface-container) 100%)`,
        }}
      />
    </div>
  );
}

// 14. Md3Snackbar
interface Md3SnackbarProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
  className?: string;
}

export function Md3Snackbar({
  message,
  isOpen,
  onClose,
  actionLabel,
  onAction,
  durationMs = 5000,
  className,
}: Md3SnackbarProps) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [isOpen, durationMs, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
            className={cn(
              'pointer-events-auto bg-inverse-surface text-inverse-on-surface flex items-center justify-between gap-4 px-4 py-3.5 rounded-sm shadow-lg text-sm select-none',
              className
            )}
          >
            <span className="flex-1 leading-normal">{message}</span>
            <div className="flex items-center gap-2 shrink-0">
              {actionLabel && onAction && (
                <button
                  onClick={() => {
                    onAction();
                    onClose();
                  }}
                  className="text-primary-fixed-dim hover:bg-white/5 px-3 py-1.5 rounded-full font-bold select-none text-xs uppercase tracking-wide transition-colors"
                >
                  {actionLabel}
                </button>
              )}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-inverse-on-surface/80 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// 15. Md3Switch
interface Md3SwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Md3Switch({ checked, onChange, disabled = false, className }: Md3SwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-8 w-14 items-center rounded-full border-2 transition-colors outline-none select-none disabled:opacity-38 disabled:pointer-events-none',
        checked
          ? 'bg-primary border-transparent'
          : 'bg-surface-container-highest border-outline',
        className
      )}
    >
      <motion.div
        layout
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center shadow-sm',
          checked ? 'bg-on-primary' : 'bg-outline'
        )}
        style={{ marginLeft: checked ? '22px' : '4px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {checked && (
          <span className="material-symbols-outlined text-[16px] text-primary font-black">
            check
          </span>
        )}
      </motion.div>
    </button>
  );
}

// 16. Md3Tabs
interface Md3TabsProps {
  tabs: { id: string; label: string; icon?: string }[];
  activeTabId: string;
  onChange: (id: string) => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function Md3Tabs({
  tabs,
  activeTabId,
  onChange,
  variant = 'primary',
  className,
}: Md3TabsProps) {
  return (
    <div
      className={cn(
        'flex border-b border-outline-variant/50 w-full overflow-x-auto no-scrollbar',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold transition-colors duration-200 outline-none select-none shrink-0',
              isActive
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-on-surface/4'
            )}
          >
            {tab.icon && (
              <span className="material-symbols-outlined text-[18px]">
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId={variant === 'primary' ? 'active-tab-indicator-primary' : 'active-tab-indicator-secondary'}
                className={cn(
                  'absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full',
                  variant === 'primary' ? 'mx-4' : 'mx-0'
                )}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// 17. Md3TextField
interface Md3TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  variant?: 'filled' | 'outlined';
  errorText?: string;
}

export function Md3TextField({
  label,
  variant = 'outlined',
  errorText,
  value,
  onFocus,
  onBlur,
  className,
  ...props
}: Md3TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = !!value;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const isFloating = isFocused || hasValue;

  return (
    <div className={cn('relative w-full flex flex-col gap-1', className)}>
      <div className="relative flex items-center">
        {/* Input */}
        <input
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            'w-full h-14 text-sm font-semibold select-all outline-none transition-all duration-200 px-4 text-on-surface',
            variant === 'filled'
              ? 'rounded-t-sm bg-surface-container border-b-2 border-outline-variant focus:border-primary focus:bg-surface-container-high'
              : 'rounded-sm border-2 border-outline-variant bg-transparent focus:border-primary',
            errorText && 'border-error focus:border-error'
          )}
          {...props}
        />

        {/* Floating Label */}
        <motion.label
          animate={{
            y: isFloating ? (variant === 'filled' ? -10 : -28) : 0,
            scale: isFloating ? 0.85 : 1,
            x: isFloating && variant === 'outlined' ? -2 : 0,
          }}
          className={cn(
            'absolute left-4 text-sm font-semibold text-on-surface-variant pointer-events-none transition-colors origin-left',
            isFocused && 'text-primary',
            errorText && 'text-error'
          )}
          style={{
            backgroundColor: variant === 'outlined' && isFloating ? 'var(--color-surface-bright)' : 'transparent',
            paddingLeft: variant === 'outlined' && isFloating ? '4px' : '0',
            paddingRight: variant === 'outlined' && isFloating ? '4px' : '0',
          }}
        >
          {label}
        </motion.label>
      </div>
      {errorText && (
        <span className="text-[10px] text-error font-bold px-3">{errorText}</span>
      )}
    </div>
  );
}

// 18. Md3Toolbar
export function Md3Toolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-2 border border-outline-variant/30 rounded-md bg-surface-container-low shadow-sm', className)}>
      {children}
    </div>
  );
}

// 19. Md3Tooltip
interface Md3TooltipProps {
  message: string;
  children: React.ReactNode;
  className?: string;
}

export function Md3Tooltip({ message, children, className }: Md3TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      className="relative inline-block select-none"
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.9, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              'absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold py-1.5 px-3 rounded shadow-md z-30 whitespace-nowrap pointer-events-none leading-none',
              className
            )}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
