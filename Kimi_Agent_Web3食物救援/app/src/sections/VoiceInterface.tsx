import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mic, Loader2 } from 'lucide-react';
import { trpc } from '@/providers/trpc';

gsap.registerPlugin(ScrollTrigger);

type Phase = 'idle' | 'recording' | 'processing' | 'success';

const PHASES: Record<Phase, { eyebrow: string; h2: string; body: string }> = {
  idle: {
    eyebrow: 'ELEVENLABS INTEGRATION',
    h2: 'Speak to List',
    body: 'Restaurant owners tap the mic and describe surplus food naturally — no forms, no typing, no friction. The AI extracts product, quantity, and price automatically.',
  },
  recording: {
    eyebrow: 'LISTENING...',
    h2: '"Five shepherd\'s pies at three dollars each"',
    body: 'Real-time transcription with intent recognition. The system understands context — quantities, pricing, food categories — and structures the data for blockchain storage.',
  },
  processing: {
    eyebrow: 'AI PROCESSING',
    h2: 'Structuring Data',
    body: 'The agent validates the input, checks for duplicates, and formats a blockchain-ready transaction. No human intervention required.',
  },
  success: {
    eyebrow: 'LISTED ON-CHAIN',
    h2: 'Live in 3 Seconds',
    body: 'The offer is now visible to every consumer in the network. Cross-chain buyers can purchase immediately with any token.',
  },
};

export default function VoiceInterface() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const phaseRef = useRef<Phase>('idle');
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  const processVoice = trpc.voice.processVoice.useMutation();

  // Keep phase ref in sync
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Voice wave canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();

    let time = 0;
    const lineCount = 80;
    const radius = 100;
    const mouseScale = 2.0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      time += 0.005;
      const currentPhase = phaseRef.current;

      let globalAmp: number;
      if (currentPhase === 'idle') globalAmp = 0.1;
      else if (currentPhase === 'recording') globalAmp = 0.5 + 0.4 * Math.sin(time * 0.3);
      else if (currentPhase === 'processing') globalAmp = 0.15;
      else globalAmp = 0.05;

      const activeFreq = 0.008 + 0.004 * Math.sin(time * 0.2);

      for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
        const baseY = h * 0.25 + lineIndex * (h * 0.55 / lineCount);

        ctx.beginPath();

        for (let x = 0; x < w; x += 2) {
          const mouseDist = Math.sqrt(
            Math.pow(x - mouseRef.current.x, 2) + Math.pow(baseY - mouseRef.current.y, 2)
          );
          const mouseInfluence = mouseRef.current.active
            ? Math.max(0, 1 - mouseDist / radius) * mouseScale
            : 0;

          const amp = (lineIndex / lineCount) * (globalAmp + mouseInfluence * 0.5);

          let y: number;
          if (currentPhase === 'processing') {
            // Traveling pulse
            const pulsePos = ((time * 80) % (w + 200)) - 100;
            const pulseDist = Math.abs(x - pulsePos);
            const pulseAmp = Math.max(0, 1 - pulseDist / 150) * 30;
            y = baseY + Math.sin(x * 0.02) * 3 + pulseAmp * (lineIndex / lineCount);
          } else {
            y = baseY + Math.sin(x * activeFreq + time + lineIndex * 0.05) * amp * 50 * Math.sin(time + x * 0.01);
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        const alpha = (lineIndex / lineCount) * 0.8 + 0.1;
        ctx.strokeStyle = `rgba(255, 107, 53, ${alpha})`;
        ctx.lineWidth = 0.5 + (lineIndex / lineCount) * 1.0;
        ctx.stroke();
      }

      // Recording indicator
      if (currentPhase === 'recording' || currentPhase === 'idle') {
        const pulseR = currentPhase === 'recording' ? 10 + Math.sin(time * 3) * 3 : 8;
        const indicatorColor = currentPhase === 'recording' ? 'rgba(255, 107, 53, 0.6)' : 'rgba(255, 107, 53, 0.3)';

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FF6B35';

        ctx.beginPath();
        ctx.arc(w / 2, h - 60, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = indicatorColor;
        ctx.fill();

        // Inner dot
        ctx.beginPath();
        ctx.arc(w / 2, h - 60, 5, 0, Math.PI * 2);
        ctx.fillStyle = currentPhase === 'recording' ? '#FF6B35' : 'rgba(255, 107, 53, 0.5)';
        ctx.fill();

        ctx.restore();

        // Text
        ctx.font = "300 12px 'IBM Plex Mono'";
        ctx.fillStyle = '#FF6B35';
        ctx.textAlign = 'center';
        ctx.fillText(
          currentPhase === 'recording' ? 'LISTENING...' : 'TAP MIC TO START',
          w / 2,
          h - 30
        );
      }

      // Success indicator
      if (currentPhase === 'success') {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#2ECC71';

        ctx.beginPath();
        ctx.arc(w / 2, h - 60, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(46, 204, 113, 0.6)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(w / 2, h - 60, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#2ECC71';
        ctx.fill();

        ctx.restore();

        ctx.font = "300 12px 'IBM Plex Mono'";
        ctx.fillStyle = '#2ECC71';
        ctx.textAlign = 'center';
        ctx.fillText('LISTED!', w / 2, h - 30);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener('resize', resizeCanvas);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Scroll-driven phase transitions
  useEffect(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: 1,
      },
    });

    tl.to({}, { duration: 1, onUpdate: () => setPhase('idle') })
      .to({}, { duration: 1, onStart: () => setPhase('recording'), onUpdate: () => setPhase('recording') })
      .to({}, { duration: 1, onStart: () => setPhase('processing'), onUpdate: () => setPhase('processing') })
      .to({}, { duration: 1, onStart: () => setPhase('success'), onUpdate: () => setPhase('success') });

    // Entrance animation for text
    const textEl = sectionRef.current.querySelector('.voice-text');
    if (textEl) {
      gsap.fromTo(
        textEl,
        { opacity: 0, x: 30 },
        {
          opacity: 1, x: 0, duration: 1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', toggleActions: 'play none none none' },
        }
      );
    }

    return () => { tl.kill(); };
  }, []);

  // Handle voice recording simulation
  const handleRecord = useCallback(async () => {
    if (isRecording) return;
    setIsRecording(true);
    setPhase('recording');

    // Simulate voice recording with demo transcript
    const demoTranscript = "We have 5 portions of shepherd's pie for 3 dollars each";
    setTranscript(demoTranscript);

    // Simulate recording duration
    setTimeout(() => {
      setPhase('processing');

      // Process the voice
      processVoice.mutate(
        { transcript: demoTranscript },
        {
          onSuccess: (_data) => {
            setTimeout(() => {
              setPhase('success');
              setIsRecording(false);
            }, 1500);
          },
          onError: () => {
            setPhase('idle');
            setIsRecording(false);
          },
        }
      );
    }, 3000);
  }, [isRecording, processVoice]);

  const currentPhase = PHASES[phase];

  return (
    <section
      id="voice"
      ref={sectionRef}
      className="relative w-full bg-[#03045E]"
      style={{ minHeight: '100vh', padding: '140px 24px' }}
    >
      <div className="mx-auto flex flex-col lg:flex-row items-center gap-12" style={{ maxWidth: 1280 }}>
        {/* Canvas - Left */}
        <div className="w-full lg:w-[55%] relative" style={{ height: 600 }}>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-pointer"
            onClick={handleRecord}
            title="Click to simulate voice recording"
          />
          {/* Mic button overlay */}
          <button
            onClick={handleRecord}
            disabled={isRecording}
            className="absolute top-6 right-6 flex items-center justify-center rounded-full border border-[#FF6B35] transition-all duration-300 hover:bg-[#FF6B35] hover:text-[#03045E] disabled:opacity-50"
            style={{ width: 48, height: 48, color: '#FF6B35' }}
          >
            {isRecording ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}
          </button>
        </div>

        {/* Text - Right */}
        <div className="voice-text w-full lg:w-[45%]">
          <p className="font-mono-label text-[#FF6B35] mb-4 transition-all duration-400">
            {currentPhase.eyebrow}
          </p>
          <h2
            className="font-display text-white transition-all duration-400"
            style={{ fontSize: 'clamp(36px, 4vw, 48px)', lineHeight: 1.2 }}
          >
            {currentPhase.h2}
          </h2>
          <p className="text-[#A0A0B0] mt-6 transition-all duration-400" style={{ fontSize: 18, lineHeight: 1.7 }}>
            {currentPhase.body}
          </p>

          {/* Simulated transcript display */}
          {transcript && (
            <div
              className="mt-8 p-4 rounded-lg border transition-all duration-500"
              style={{
                borderColor: phase === 'success' ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255, 107, 53, 0.3)',
                background: 'rgba(10, 10, 26, 0.6)',
              }}
            >
              <p className="font-mono-label text-[#A0A0B0] mb-2">TRANSCRIPT</p>
              <p className="text-white font-display text-lg">"{transcript}"</p>
              {phase === 'success' && processVoice.data?.extracted && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono-label bg-[rgba(76,201,240,0.15)] text-[#4CC9F0]">
                    {processVoice.data.extracted.foodName}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono-label bg-[rgba(255,107,53,0.15)] text-[#FF6B35]">
                    Qty: {processVoice.data.extracted.quantity}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono-label bg-[rgba(46,204,113,0.15)] text-[#2ECC71]">
                    ${processVoice.data.extracted.price} USDC
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Phase indicators */}
          <div className="flex gap-3 mt-8">
            {(['idle', 'recording', 'processing', 'success'] as Phase[]).map((p) => (
              <div
                key={p}
                className="flex items-center gap-2 transition-all duration-300"
                style={{ opacity: phase === p ? 1 : 0.3 }}
              >
                <div
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: phase === p ? 10 : 6,
                    height: phase === p ? 10 : 6,
                    background: p === 'success' ? '#2ECC71' : p === 'processing' ? '#4CC9F0' : '#FF6B35',
                    boxShadow: phase === p ? `0 0 10px ${p === 'success' ? '#2ECC71' : p === 'processing' ? '#4CC9F0' : '#FF6B35'}` : 'none',
                  }}
                />
                <span className="font-mono-label text-[10px] text-[#A0A0B0]">
                  {p.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
