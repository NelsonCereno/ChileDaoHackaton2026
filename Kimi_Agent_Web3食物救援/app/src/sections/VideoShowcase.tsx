import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function VideoShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const els = sectionRef.current.querySelectorAll('.video-anim');
    gsap.fromTo(
      els[0],
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none none' },
      }
    );

    const videoContainer = sectionRef.current.querySelector('.video-container');
    if (videoContainer) {
      gsap.fromTo(
        videoContainer,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1, scale: 1, duration: 1, ease: 'power2.out',
          scrollTrigger: { trigger: videoContainer, start: 'top 80%', toggleActions: 'play none none none' },
        }
      );
    }
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <section
      id="video"
      ref={sectionRef}
      className="w-full bg-[#03045E]"
      style={{ padding: '140px 24px' }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <p className="video-anim font-mono-label text-[#4CC9F0] mb-4">THE EXPERIENCE</p>
        <h2 className="video-anim font-display text-white" style={{ fontSize: 'clamp(48px, 6vw, 80px)' }}>
          See It In Action
        </h2>
        <p className="video-anim text-[#A0A0B0] mt-6" style={{ fontSize: 18, maxWidth: 600 }}>
          Watch how a restaurant owner lists surplus food with a single voice command, a consumer pays cross-chain, and a robot dispenses the order — all in under 60 seconds.
        </p>

        <div
          className="video-container relative mx-auto mt-16 overflow-hidden cursor-pointer group"
          style={{
            maxWidth: 1000,
            aspectRatio: '16/9',
            borderRadius: 16,
            border: '1px solid rgba(76, 201, 240, 0.2)',
          }}
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster="/images/kitchen.jpg"
            loop
            muted
            playsInline
          >
            <source src="/videos/demo.mp4" type="video/mp4" />
          </video>

          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all duration-300">
            <button
              className="flex items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
              style={{
                width: 80,
                height: 80,
                background: 'rgba(255, 107, 53, 0.9)',
              }}
            >
              {isPlaying ? (
                <Pause size={32} className="text-white" />
              ) : (
                <Play size={32} className="text-white ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
