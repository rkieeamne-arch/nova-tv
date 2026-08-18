import { useState, useEffect } from 'react';
import { Tv, Sparkles, ChevronLeft } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState<'initial' | 'flare' | 'assemble' | 'tagline' | 'fadeout'>('initial');

  useEffect(() => {
    // Sequence timing
    const t0 = setTimeout(() => setPhase('flare'), 300);
    const t1 = setTimeout(() => setPhase('assemble'), 900);
    const t2 = setTimeout(() => setPhase('tagline'), 1700);
    const t3 = setTimeout(() => setPhase('fadeout'), 3200);
    const t4 = setTimeout(() => onComplete(), 3800);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      id="cinematic-intro-screen"
      className={`fixed inset-0 z-[999] bg-[#030407] flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-700 ${
        phase === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Atmospheric Background & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.22)_0%,rgba(10,12,20,0.85)_50%,#030407_100%)] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-red-600/15 blur-[100px] pointer-events-none animate-pulse" />

      {/* Center Cinematic Assembly Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* Glowing TV Emblem */}
        <div
          className={`relative mb-6 transition-all duration-1000 ease-out transform ${
            phase === 'initial'
              ? 'scale-50 opacity-0 blur-lg translate-y-6'
              : 'scale-100 opacity-100 blur-0 translate-y-0'
          }`}
        >
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 opacity-75 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-tr from-red-700 via-red-600 to-amber-500 p-1 shadow-[0_0_50px_rgba(220,38,38,0.7)] flex items-center justify-center">
            <div className="w-full h-full bg-[#08090f] rounded-[22px] flex items-center justify-center border border-white/20">
              <Tv className="w-10 h-10 md:w-12 md:h-12 text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,0.9)]" />
            </div>
          </div>
        </div>

        {/* Letters Assembly: NOVA TV */}
        <div
          className={`flex items-center justify-center gap-2 mb-3 transition-all duration-1000 ease-out ${
            phase === 'initial' || phase === 'flare'
              ? 'opacity-0 scale-75 tracking-[-0.3em] blur-md'
              : 'opacity-100 scale-100 tracking-[0.2em] blur-0'
          }`}
        >
          <span className="font-['Outfit'] font-black text-4xl md:text-6xl text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            NOVA
          </span>
          <span className="font-['Outfit'] font-black text-4xl md:text-6xl text-red-600 drop-shadow-[0_0_35px_rgba(220,38,38,0.9)]">
            TV
          </span>
        </div>

        {/* Cinematic Laser Flare Line */}
        <div
          className={`h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent transition-all duration-1000 ease-out my-2 ${
            phase === 'assemble' || phase === 'tagline' || phase === 'fadeout' ? 'w-64 md:w-96 opacity-100' : 'w-0 opacity-0'
          }`}
        />

        {/* Subtitle / Tagline Reveal */}
        <p
          className={`text-xs md:text-sm text-neutral-300 font-medium tracking-widest mt-2 transition-all duration-700 ease-out ${
            phase === 'tagline' || phase === 'fadeout'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          مشاهدة جميع الأفلام خالية من الإعلانات 100%
        </p>
      </div>
    </div>
  );
}
