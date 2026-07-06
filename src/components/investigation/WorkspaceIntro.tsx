import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../App';

interface WorkspaceIntroProps {
  onStart: () => void;
  ticketNumber?: string;
  accountName?: string;
}

function getScrollParent(element: HTMLElement | null): HTMLElement | Window {
  let parent = element?.parentElement ?? null;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

export default function WorkspaceIntro({ onStart, ticketNumber, accountName }: WorkspaceIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const targetOffset = useRef(0);
  const currentOffset = useRef(0);
  const dragStart = useRef({ x: 0, offset: 0 });
  const lastScrollY = useRef(0);

  const maxShift = 900; // Maximum scroll shift in px

  // Handle Drag / Swipe mouse/touch events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, offset: targetOffset.current };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.touches[0].clientX, offset: targetOffset.current };
  };

  // Continuous animation loop using requestAnimationFrame for buttery-smooth movement (directly editing DOM style nodes)
  useEffect(() => {
    let active = true;
    
    const tick = () => {
      if (!active) return;
      
      const diff = targetOffset.current - currentOffset.current;
      if (Math.abs(diff) > 0.02) {
        currentOffset.current += diff * 0.12; // Easing coefficient (lerp)
      } else {
        currentOffset.current = targetOffset.current;
      }
      
      // Update DOM nodes directly to prevent React Virtual DOM diffing overhead (gives a solid 60/120fps stutter-free scroll)
      const wrapper = wrapperRef.current;
      if (wrapper) {
        wrapper.style.transform = `translate3d(-${currentOffset.current.toFixed(1)}px, 0px, 0px)`;
        
        // Mosaic items align to form a continuous grid within first 350px of offset
        const progress = Math.max(0, Math.min(1, currentOffset.current / 350));
        const remaining = 1 - progress;
        const cards = wrapper.children;
        
        if (cards.length >= 5) {
          // Card 1
          (cards[0] as HTMLElement).style.transform = `translate3d(${(remaining * -40).toFixed(1)}px, ${(remaining * -20).toFixed(1)}px, 0) scale(${(0.96 + progress * 0.04).toFixed(4)})`;
          // Card 2
          (cards[1] as HTMLElement).style.transform = `translate3d(${(remaining * -70).toFixed(1)}px, ${(remaining * 60).toFixed(1)}px, 0) scale(${(0.88 + progress * 0.12).toFixed(4)})`;
          // Card 3
          (cards[2] as HTMLElement).style.transform = `translate3d(0, ${(remaining * -15).toFixed(1)}px, 0) scale(${(0.98 + progress * 0.02).toFixed(4)})`;
          // Card 4
          (cards[3] as HTMLElement).style.transform = `translate3d(${(remaining * 80).toFixed(1)}px, ${(remaining * -60).toFixed(1)}px, 0) scale(${(0.86 + progress * 0.14).toFixed(4)})`;
          // Card 5
          (cards[4] as HTMLElement).style.transform = `translate3d(${(remaining * 110).toFixed(1)}px, ${(remaining * 40).toFixed(1)}px, 0) scale(${(0.93 + progress * 0.07).toFixed(4)})`;
        }
      }
      
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => {
      active = false;
    };
  }, []);

  // Scroll listener for parallax slide-into-place on scroll down
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const scroller = getScrollParent(el);
    const target = scroller === window ? window : scroller;

    // Seed the initial scroll position so we don't snap back on load or mouseUp
    lastScrollY.current = scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;

    const handleScroll = () => {
      if (isDragging) return;
      const currentScrollY = scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;
      
      // Only snap to vertical scroll progress if there is a real vertical scroll event
      if (Math.abs(currentScrollY - lastScrollY.current) > 2) {
        lastScrollY.current = currentScrollY;
        const rect = el.getBoundingClientRect();
        const scrollerHeight = scroller === window ? window.innerHeight : (scroller as HTMLElement).clientHeight;
        const totalRange = scrollerHeight + rect.height;
        
        // Calculate progress of scroll through the viewport
        const scrollProgress = (scrollerHeight - rect.top) / totalRange;
        const clamped = Math.max(0, Math.min(1, scrollProgress));
        
        // Map vertical scroll progress to the first 350px of parallax alignment
        targetOffset.current = clamped * 350;
      }
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const dx = dragStart.current.x - e.clientX;
      const newOffset = Math.max(0, Math.min(maxShift, dragStart.current.offset + dx * 1.5));
      targetOffset.current = newOffset;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const dx = dragStart.current.x - e.touches[0].clientX;
      const newOffset = Math.max(0, Math.min(maxShift, dragStart.current.offset + dx * 1.5));
      targetOffset.current = newOffset;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="w-full flex flex-col items-center bg-transparent select-none overflow-hidden pb-12">
      
      {/* Dynamic Info Header */}
      <div className="text-center mb-8 px-4">
        {ticketNumber && accountName && (
          <p className="text-sm font-bold text-primary dark:text-[#8AB4F8] bg-primary/10 dark:bg-primary/20 px-4 py-1.5 rounded-full inline-block">
            Case #{ticketNumber} · {accountName}
          </p>
        )}
      </div>

      {/* ── Chrome Mosaic Horizontal Parallax Slider ── */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="w-full cursor-grab overflow-hidden py-10 relative flex justify-center active:cursor-grabbing"
      >
        <div 
          ref={wrapperRef}
          className="flex flex-nowrap gap-8 pl-[180px] w-full max-w-[1200px]"
          style={{ 
            transform: 'translate3d(0px, 0px, 0px)',
            willChange: 'transform'
          }}
        >
          {/* Card 1: Landscape Canyon View */}
          <div 
            style={{ transform: 'translate3d(-40px, -20px, 0) scale(0.96)', willChange: 'transform' }}
            className="flex-shrink-0 w-[260px] h-[380px] rounded-[24px] bg-white dark:bg-[#201F24] border border-outline-variant/50 dark:border-white/10 overflow-hidden shadow-sm flex flex-col"
          >
            <div className="bg-surface-container-low dark:bg-black/20 px-4 py-2.5 border-b border-outline-variant/30 dark:border-white/10 flex items-center justify-between -mt-[2px] -mx-[2px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="text-[10px] font-mono text-on-surface-variant/70">Scenic View</span>
              </div>
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50">star</span>
            </div>
            <div 
              className="flex-1 relative bg-cover bg-center overflow-hidden -mb-[2px] -mx-[2px]" 
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80')` }}
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 text-white">
                <span className="text-[9px] uppercase font-black text-orange-300 tracking-wider">Nature Canvas</span>
                <p className="text-[11px] font-medium mt-1 leading-snug">Stunning canyon landscapes customize your default homepage background.</p>
              </div>
            </div>
          </div>

          {/* Card 2: Login / Autofill with popover */}
          <div 
            style={{ transform: 'translate3d(-70px, 60px, 0) scale(0.88)', willChange: 'transform' }}
            className="flex-shrink-0 w-[300px] h-[380px] rounded-[24px] bg-white dark:bg-[#201F24] border border-outline-variant/50 dark:border-white/10 overflow-hidden shadow-sm flex flex-col relative"
          >
            <div className="bg-surface-container-low dark:bg-black/20 px-4 py-2.5 border-b border-outline-variant/30 dark:border-white/10 flex items-center justify-between -mt-[2px] -mx-[2px]">
              <span className="text-[10px] text-on-surface-variant/70 font-medium font-mono">login.store.com</span>
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50">lock</span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between bg-white dark:bg-[#1E1D22] -mx-[2px] -mb-[2px]">
              <div className="space-y-3.5">
                <h4 className="text-[18px] font-bold text-on-surface dark:text-inverse-on-surface leading-none">Sign in</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-primary dark:text-[#8AB4F8] mb-1">Username</label>
                    <input type="text" value="elisa" readOnly
                           className="w-full bg-surface-container-low dark:bg-black/20 border border-outline-variant/40 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-on-surface outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">Password</label>
                    <div className="relative">
                      <input type="password" value="secret_pass_mock" readOnly
                             className="w-full bg-surface-container-low dark:bg-black/20 border border-outline-variant/40 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-on-surface-variant/50 tracking-widest outline-none" />
                      <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[14px] text-on-surface-variant/50">visibility</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password manager prompt overlay */}
              <div className="absolute left-4 right-4 top-[105px] bg-white dark:bg-[#2D2C33] border border-outline-variant/75 dark:border-white/15 rounded-xl p-3 shadow-lg z-20">
                <div className="flex items-center justify-between pb-1 border-b border-outline-variant/30 dark:border-white/10">
                  <p className="text-[9px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Use saved password?</p>
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50 cursor-pointer hover:text-on-surface transition-colors">close</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2 bg-primary/10 dark:bg-primary/20 hover:bg-primary/15 p-1.5 rounded-lg border border-primary/20 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/25 flex items-center justify-center text-primary dark:text-[#8AB4F8]">
                      <span className="material-symbols-outlined text-[14px]">vpn_key</span>
                    </div>
                    <div className="text-[10px] leading-tight text-on-surface font-semibold">
                      <p>elisa.g.beckett</p>
                      <p className="text-on-surface-variant/50 font-mono tracking-tighter">•••••••••••••</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50">chevron_right</span>
                </div>
              </div>

              <button className="w-full bg-primary hover:bg-primary/95 text-white text-xs font-bold py-2 rounded-full transition-colors mt-4">
                Sign in
              </button>
            </div>
          </div>

          {/* Card 3: Custom Yellow Artwork Theme (Centerpiece) */}
          <div 
            style={{ transform: 'translate3d(0, -15px, 0) scale(0.98)', willChange: 'transform' }}
            className="flex-shrink-0 w-[640px] h-[380px] rounded-[24px] bg-white dark:bg-[#201F24] border border-outline-variant/50 dark:border-white/10 overflow-hidden shadow-sm flex flex-col"
          >
            <div className="bg-[#f2f3f5] dark:bg-black/25 px-4 py-2 border-b border-outline-variant/30 dark:border-white/10 flex items-center justify-between -mt-[2px] -mx-[2px]">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white dark:bg-[#201F24] rounded-t-lg text-[9px] text-on-surface font-bold flex items-center gap-1.5 shadow-sm">
                  New Tab
                </span>
                <span className="px-2.5 py-0.5 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 rounded-full text-[9px] font-bold">Favourite places</span>
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 rounded-full text-[9px] font-bold">Artist to follow</span>
                <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300 rounded-full text-[9px] font-bold">Art inspo</span>
                <span className="text-on-surface-variant/50 text-sm ml-1 cursor-pointer hover:text-on-surface">+</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#201F24] px-4 py-1.5 border-b border-outline-variant/15 dark:border-white/5 flex items-center gap-2 -mx-[2px]">
              <div className="flex items-center gap-2 text-on-surface-variant/60">
                <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-on-surface">arrow_back</span>
                <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-on-surface">arrow_forward</span>
                <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-on-surface">refresh</span>
              </div>
              <div className="flex-1 bg-surface-container-low dark:bg-black/20 rounded-full py-0.5 px-3.5 text-[10px] text-on-surface-variant/60 flex items-center gap-1.5 border border-outline-variant/20">
                <span className="material-symbols-outlined text-[12px] text-on-surface-variant/50">lock</span> Search Google or type a URL
              </div>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant/60">menu</span>
            </div>

            {/* Google artwork theme */}
            <div className="flex-1 bg-[#fbbd05] p-5 flex flex-col justify-between relative overflow-hidden -mx-[2px] -mb-[2px]">
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 640 280" fill="none">
                  {/* Left Figure */}
                  <g>
                    <path d="M40,280 C40,180 80,160 120,150 C130,170 140,195 135,230 L160,280 Z" fill="#1e3a8a" />
                    <path d="M100,180 C80,160 60,130 70,90 C80,50 120,40 140,70 C160,95 150,145 120,170 Z" fill="#ea4335" />
                    <circle cx="140" cy="90" r="12" fill="#fde047" />
                    <circle cx="105" cy="125" r="14" fill="#fde047" />
                  </g>

                  {/* Right Figure */}
                  <g>
                    <path d="M600,280 C600,180 560,160 510,140 L460,280 Z" fill="#ea4335" />
                    <path d="M510,180 C530,150 565,120 555,80 C545,40 500,40 485,70 C470,95 480,145 495,170 Z" fill="#1a73e8" />
                  </g>

                  {/* Center clouds */}
                  <circle cx="180" cy="230" r="26" fill="#202124" />
                  <circle cx="240" cy="210" r="22" fill="#202124" />
                  <circle cx="290" cy="200" r="20" fill="#202124" />
                  <circle cx="350" cy="205" r="22" fill="#202124" />
                  <circle cx="400" cy="215" r="24" fill="#202124" />
                  <circle cx="450" cy="230" r="26" fill="#202124" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="text-white text-4xl font-extrabold tracking-tight mb-6 drop-shadow-sm flex select-none">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </div>

                <div className="w-full max-w-md bg-white dark:bg-[#201F24] rounded-full shadow-lg border border-outline-variant/30 px-5 py-2.5 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant/50">search</span>
                  <input type="text" placeholder="Search Google or type a URL" readOnly
                         className="flex-1 bg-transparent border-none text-xs outline-none text-on-surface placeholder-on-surface-variant/40" />
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-blue-500 cursor-pointer">mic</span>
                    <span className="material-symbols-outlined text-[16px] text-red-500 cursor-pointer">camera_alt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Custom Shortcuts Mobile Device Mockup */}
          <div 
            style={{ transform: 'translate3d(80px, -60px, 0) scale(0.86)', willChange: 'transform' }}
            className="flex-shrink-0 w-[240px] h-[380px] rounded-[24px] bg-white dark:bg-[#201F24] border border-outline-variant/50 dark:border-white/10 overflow-hidden shadow-sm flex flex-col"
          >
            <div className="bg-surface-container-low dark:bg-black/20 px-4 py-2 border-b border-outline-variant/30 dark:border-white/10 flex items-center justify-between text-[9px] text-on-surface-variant/70 -mt-[2px] -mx-[2px]">
              <span>9:41</span>
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/65"></span>
                <span className="w-2.5 h-1.5 bg-on-surface-variant/65 rounded-sm"></span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between bg-white dark:bg-[#1E1D22] -mx-[2px] -mb-[2px]">
              <div className="flex flex-col items-center">
                <div className="text-center font-bold text-on-surface/30 tracking-widest text-lg mb-3">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </div>

                <div className="w-full bg-surface-container-low dark:bg-black/20 rounded-full px-3 py-1.5 flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50">search</span>
                  <span className="text-[10px] text-on-surface-variant/50 font-medium">Search or type URL</span>
                </div>

                <div className="grid grid-cols-4 gap-3 w-full">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/10">
                      <span className="material-symbols-outlined text-[16px]">play_circle</span>
                    </div>
                    <span className="text-[8px] text-on-surface-variant font-semibold">YouTube</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/10">
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                    </div>
                    <span className="text-[8px] text-on-surface-variant font-semibold">Gmail</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/10">
                      <span className="material-symbols-outlined text-[16px]">map</span>
                    </div>
                    <span className="text-[8px] text-on-surface-variant font-semibold">Maps</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/10">
                      <span className="material-symbols-outlined text-[16px]">cloud_queue</span>
                    </div>
                    <span className="text-[8px] text-on-surface-variant font-semibold">Drive</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant/30 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] text-on-surface-variant/70 font-semibold">Sync is on</span>
                </div>
                <button className="w-6 h-6 rounded-full bg-surface-container-low dark:bg-black/20 border border-outline-variant/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 5: Deep Space Theme */}
          <div 
            style={{ transform: 'translate3d(110px, 40px, 0) scale(0.93)', willChange: 'transform' }}
            className="flex-shrink-0 w-[300px] h-[380px] rounded-[24px] bg-[#121214] border border-outline-variant/20 overflow-hidden shadow-sm flex flex-col"
          >
            <div className="bg-[#1e1e21] px-4 py-2.5 border-b border-gray-800 flex items-center justify-between -mt-[2px] -mx-[2px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-700"></span>
                <span className="text-[10px] font-mono text-gray-400">Deep Space Surfer</span>
              </div>
              <span className="material-symbols-outlined text-[14px] text-blue-400">dark_mode</span>
            </div>
            <div 
              className="flex-1 relative bg-cover bg-center overflow-hidden -mx-[2px] -mb-[2px]" 
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80')` }}
            >
              <div className="absolute inset-0 bg-indigo-950/70 mix-blend-multiply"></div>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white z-10">
                <span className="text-[8px] uppercase font-bold text-blue-400 tracking-widest bg-blue-950/40 px-2 py-0.5 rounded-full inline-block">Dark Theme</span>
                <h5 className="text-[12px] font-bold mt-1.5 leading-snug">Sleek, low-contrast, custom aesthetic</h5>
                <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">Chrome dark mode protects your eyes during late-night productivity sessions.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Checklist box with "Get started" button overlay ── */}
      <section className="w-full max-w-3xl px-4 mt-6">
        <div className="border-2 border-primary dark:border-primary-fixed rounded-[32px] p-8 md:p-10 relative bg-white dark:bg-[#1E1D22] shadow-sm flex flex-col items-center">
          
          {/* Overlay CTA Button */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <button 
              onClick={onStart}
              className="bg-primary hover:bg-[#1967D2] text-white font-bold text-[16px] px-12 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get started
            </button>
          </div>

          {/* Checklist content */}
          <div className="mt-4 space-y-5 w-full max-w-xl text-left">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[20px] text-primary dark:text-[#8AB4F8] shrink-0 mt-0.5" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
              <p className="text-[14px] md:text-[15px] text-on-surface-variant dark:text-inverse-on-surface/80 leading-relaxed font-medium">
                I'll work through this case step by step — root cause, authentication, deliverability, engagement and precedent from similar cases.
              </p>
            </div>

            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[20px] text-primary dark:text-[#8AB4F8] shrink-0 mt-0.5" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
              <p className="text-[14px] md:text-[15px] text-on-surface-variant dark:text-inverse-on-surface/80 leading-relaxed font-medium">
                Each step is AI-drafted from this ticket's own data for you to review, edit or refresh.
              </p>
            </div>

            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[20px] text-primary dark:text-[#8AB4F8] shrink-0 mt-0.5" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
              <p className="text-[14px] md:text-[15px] text-on-surface-variant dark:text-inverse-on-surface/80 leading-relaxed font-medium">
                Accept a step to continue; at the end you'll have a ready-to-send customer response.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
