import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 12400, suffix: '+', label: 'Meals Rescued', color: '#FF6B35', prefix: '' },
  { value: 8, suffix: '', label: 'Blockchains', color: '#4CC9F0', prefix: '' },
  { value: 3.2, suffix: 's', label: 'Avg. List Time', color: '#2ECC71', prefix: '' },
  { value: 47, suffix: 'K', label: 'Saved by Consumers', color: '#FF6B35', prefix: '$' },
];

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Animate numbers
    stats.forEach((stat, i) => {
      const el = numberRefs.current[i];
      if (!el) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: stat.value,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          if (stat.value % 1 !== 0) {
            el.textContent = stat.prefix + obj.val.toFixed(1) + stat.suffix;
          } else {
            el.textContent = stat.prefix + Math.floor(obj.val).toLocaleString() + stat.suffix;
          }
        },
      });
    });

    // Animate labels
    const labels = sectionRef.current.querySelectorAll('.stat-label');
    gsap.fromTo(
      labels,
      { opacity: 0 },
      {
        opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.3,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#03045E]"
      style={{ padding: '100px 24px' }}
    >
      <div className="mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10" style={{ maxWidth: 1280 }}>
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <span
              ref={(el) => { numberRefs.current[i] = el; }}
              className="font-display block"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: stat.color }}
            >
              {stat.prefix}0{stat.suffix}
            </span>
            <span className="stat-label font-mono-label text-[#A0A0B0] opacity-0">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
