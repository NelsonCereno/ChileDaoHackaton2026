import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router';
import { FileText, Github, ExternalLink, Smartphone, Bot, Volume2, ArrowRightLeft } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const WORDS_CYCLE = ['RESCUE', 'FOOD', 'CHAIN'];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Particle field effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.offsetWidth;
    const h = parent.offsetHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.z = 2.0;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);

    // Create particle texture
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 32;
    spriteCanvas.height = 32;
    const sctx = spriteCanvas.getContext('2d')!;
    const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 32, 32);
    const spriteTexture = new THREE.CanvasTexture(spriteCanvas);

    // Particles
    const PARTICLE_COUNT = 4096; // Reduced for performance
    const gridSize = Math.sqrt(PARTICLE_COUNT);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);

    const color1 = new THREE.Color(WORDS_CYCLE[0] === 'RESCUE' ? '#FF6B35' : '#4CC9F0');
    const color2 = new THREE.Color(WORDS_CYCLE[1] === 'FOOD' ? '#4CC9F0' : '#2ECC71');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (i % gridSize) / gridSize;
      const y = Math.floor(i / gridSize) / gridSize;

      positions[i * 3] = (x - 0.5) * 2;
      positions[i * 3 + 1] = (y - 0.5) * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      seeds[i] = Math.random();
      sizes[i] = 0.5 + Math.random() * 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.015,
      map: spriteTexture,
      transparent: true,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let time = 0;
    const animate = () => {
      time += 0.002;

      // Slow rotation
      particles.rotation.y = time * 0.1;
      particles.rotation.x = Math.sin(time * 0.05) * 0.05;

      // Subtle drift
      const posArr = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const seed = seeds[i];
        posArr[i * 3 + 1] += Math.sin(time + seed * Math.PI * 2) * 0.0001;
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const cw = parent.offsetWidth;
      const ch = parent.offsetHeight;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      spriteTexture.dispose();
    };
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!footerRef.current) return;

    const columns = footerRef.current.querySelectorAll('.footer-col');
    gsap.fromTo(
      columns,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: footerRef.current, start: 'top 85%', toggleActions: 'play none none none' },
      }
    );

    const largeText = footerRef.current.querySelector('.footer-large-text');
    if (largeText) {
      gsap.fromTo(
        largeText,
        { opacity: 0 },
        {
          opacity: 1, duration: 2,
          scrollTrigger: { trigger: largeText, start: 'top 90%', toggleActions: 'play none none none' },
        }
      );
    }
  }, []);

  return (
    <footer
      id="footer"
      ref={footerRef}
      className="relative w-full bg-[#03045E] overflow-hidden"
      style={{ padding: '140px 24px 60px' }}
    >
      <div className="mx-auto relative z-10" style={{ maxWidth: 1280 }}>
        {/* Row 1: Three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1: Logo + Tagline */}
          <div className="footer-col">
            <Link to="/" className="flex items-center gap-1 mb-4">
              <span className="font-display font-bold text-white" style={{ fontSize: 20 }}>
                RESCUE
              </span>
              <span className="inline-block rounded-full bg-[#FF6B35]" style={{ width: 8, height: 8 }} />
            </Link>
            <p className="text-[#A0A0B0]" style={{ fontSize: 14 }}>
              The future of food is voice, chain, and machine.
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="footer-col">
            <p className="font-mono-label text-[#A0A0B0] mb-4">RESOURCES</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Documentation', icon: FileText },
                { label: 'GitHub', icon: Github },
                { label: 'Solana Explorer', icon: ExternalLink },
                { label: 'Testnet Demo', icon: ExternalLink },
              ].map((link) => (
                <a
                  key={link.label}
                  href="#"
                  className="flex items-center gap-2 text-[#A0A0B0] hover:text-white transition-colors duration-300"
                  style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  <link.icon size={14} />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Partners */}
          <div className="footer-col">
            <p className="font-mono-label text-[#A0A0B0] mb-4">PARTNERS</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'ElevenLabs', icon: Volume2 },
                { label: 'LI.FI Protocol', icon: ArrowRightLeft },
                { label: 'Virtuals', icon: Bot },
                { label: 'Solana Mobile', icon: Smartphone },
              ].map((link) => (
                <a
                  key={link.label}
                  href="#"
                  className="flex items-center gap-2 text-[#A0A0B0] hover:text-white transition-colors duration-300"
                  style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  <link.icon size={14} />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Large text with particle canvas background */}
        <div className="relative mt-24" style={{ height: 200 }}>
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 0,
            }}
          />
          <h2
            className="footer-large-text font-display text-center relative z-10"
            style={{
              fontSize: 'clamp(48px, 10vw, 120px)',
              color: 'rgba(255, 255, 255, 0.03)',
              lineHeight: 1,
              paddingTop: 40,
            }}
          >
            RESCUE THE BLOCKS
          </h2>
        </div>

        {/* Row 3: Copyright */}
        <div className="mt-12 text-center">
          <p className="font-mono-label text-[#A0A0B0]" style={{ fontSize: 11 }}>
            2025 Web3 Food Rescue. Built for the Colosseum Hackathon.
          </p>
        </div>
      </div>
    </footer>
  );
}
