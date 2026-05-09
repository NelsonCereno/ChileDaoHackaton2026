import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WORDS = [
  { text: 'FOOD', x: 0.55, y: 1.0, z: -2.4, scale: 0.7, color: '#4CC9F0', edgeColor: '#1A2A44' },
  { text: 'RESCUE', x: 0.8, y: 0.6, z: -1.8, scale: 0.8, color: '#FF6B35', edgeColor: '#2A1A0A' },
  { text: 'CHAIN', x: 0.65, y: 0.4, z: -1.3, scale: 0.75, color: '#2ECC71', edgeColor: '#0A2A14' },
  { text: 'VOICE', x: 0.5, y: 0.25, z: -0.95, scale: 0.65, color: '#4CC9F0', edgeColor: '#1A2A44' },
];

const CAMERA_PATH = [
  { px: 0.5, py: 0, pz: 0.2, lx: 0.45, ly: 0.8, lz: -2.3 },
  { px: 0.7, py: 0.2, pz: -0.5, lx: 0.6, ly: 0.4, lz: -1.2 },
  { px: 0.8, py: 0.5, pz: -2.5, lx: 0.7, ly: 0.8, lz: -2.0 },
  { px: 0.4, py: 0.7, pz: -2.8, lx: 0.8, ly: 0.9, lz: -2.0 },
  { px: 0.35, py: 0.85, pz: -3.4, lx: 0.85, ly: 1.15, lz: -2.6 },
  { px: 0.38, py: 0.8, pz: -3.6, lx: 0.55, ly: 0.7, lz: -1.4 },
  { px: 0.8, py: 0.8, pz: -3.0, lx: 1.0, ly: 1.4, lz: -3.8 },
  { px: 1.2, py: 1.0, pz: -2.9, lx: 1.1, ly: 1.0, lz: -2.9 },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    composer: EffectComposer;
    textGroup: THREE.Group;
    animFrame: number;
  } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#03045E');
    scene.fog = new THREE.Fog('#03045E', 5, 15);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0.5, 0, 0.2);
    camera.lookAt(0.45, 0.8, -2.3);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.5, 0.3, 0.85
    );
    composer.addPass(bloomPass);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const pointLight1 = new THREE.PointLight('#FF6B35', 0.8, 10);
    pointLight1.position.set(2, 2, -1);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight('#4CC9F0', 0.6, 10);
    pointLight2.position.set(-2, 1, -2);
    scene.add(pointLight2);

    // Text Group
    const textGroup = new THREE.Group();
    scene.add(textGroup);

    // Load font and create text
    const loader = new FontLoader();
    loader.load(
      'https://cdn.jsdelivr.net/npm/three@0.145.0/examples/fonts/helvetiker_bold.typeface.json',
      (font) => {
        WORDS.forEach((word) => {
          const textGeo = new TextGeometry(word.text, {
            font: font,
            size: 0.3 * word.scale,
            depth: 0.15 * word.scale,
            curveSegments: 6,
            bevelEnabled: true,
            bevelThickness: 0.02 * word.scale,
            bevelSize: 0.01 * word.scale,
            bevelSegments: 3,
          });
          textGeo.computeBoundingBox();
          textGeo.center();

          const color = new THREE.Color(word.color);
          const edgeColor = new THREE.Color(word.edgeColor);

          // Front face material
          const frontMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.4,
            emissive: color,
            emissiveIntensity: 0.1,
          });

          // Side material
          const sideMaterial = new THREE.MeshStandardMaterial({
            color: edgeColor,
            metalness: 0.5,
            roughness: 0.3,
          });

          const mesh = new THREE.Mesh(textGeo, [frontMaterial, sideMaterial]);
          mesh.position.set(word.x, word.y, word.z);
          mesh.castShadow = true;
          textGroup.add(mesh);

          // Add wireframe outline for tech feel
          const edges = new THREE.EdgesGeometry(textGeo);
          const lineMat = new THREE.LineBasicMaterial({
            color: word.color,
            transparent: true,
            opacity: 0.15,
          });
          const wireframe = new THREE.LineSegments(edges, lineMat);
          wireframe.position.set(word.x, word.y, word.z);
          textGroup.add(wireframe);
        });
      }
    );

    // Floating particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      particlePositions[i] = (Math.random() - 0.5) * 15;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#FF6B35',
      size: 0.02,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    sceneRef.current = { renderer, scene, camera, composer, textGroup, animFrame: 0 };

    // Camera proxy for GSAP
    const cameraProxy = { t: 0 };

    // Scroll-driven camera animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 2,
      },
    });

    CAMERA_PATH.forEach((_point, i) => {
      if (i === 0) return;
      const duration = [0.8, 1.0, 0.9, 0.7, 0.8, 0.5, 0.6][i - 1] || 0.6;
      tl.to(cameraProxy, {
        t: i,
        duration,
        ease: 'power1.inOut',
        onUpdate: () => {
          const idx = Math.min(Math.floor(cameraProxy.t), CAMERA_PATH.length - 1);
          const nextIdx = Math.min(idx + 1, CAMERA_PATH.length - 1);
          const frac = cameraProxy.t - idx;
          const curr = CAMERA_PATH[idx];
          const next = CAMERA_PATH[nextIdx];
          camera.position.x = curr.px + (next.px - curr.px) * frac;
          camera.position.y = curr.py + (next.py - curr.py) * frac;
          camera.position.z = curr.pz + (next.pz - curr.pz) * frac;
          camera.lookAt(
            curr.lx + (next.lx - curr.lx) * frac,
            curr.ly + (next.ly - curr.ly) * frac,
            curr.lz + (next.lz - curr.lz) * frac
          );
        },
      });
    });

    // Animate
    let time = 0;
    const animate = () => {
      time += 0.005;

      // Subtle rotation of text group
      textGroup.rotation.y = Math.sin(time * 0.3) * 0.05;
      textGroup.rotation.x = Math.cos(time * 0.2) * 0.02;

      // Animate particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(time + positions[i * 3]) * 0.001;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = time * 0.1;

      composer.render();
      sceneRef.current!.animFrame = requestAnimationFrame(animate);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animFrame);
      }
      tl.kill();
      renderer.dispose();
    };
  }, []);

  // Text entrance animation
  useEffect(() => {
    if (!textRef.current) return;
    const els = textRef.current.querySelectorAll('.hero-anim');
    gsap.fromTo(
      els,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power3.out', delay: 0.5 }
    );
  }, []);

  return (
    <section ref={containerRef} className="relative w-full" style={{ height: '100vh' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />
      <div
        ref={textRef}
        className="relative flex flex-col items-center justify-end text-center px-6"
        style={{
          zIndex: 10,
          position: 'absolute',
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 700,
          textShadow: '0 2px 40px rgba(0,0,0,0.7)',
        }}
      >
        <p className="hero-anim font-mono-label text-[#FF6B35] mb-6 opacity-0" style={{ letterSpacing: '0.15em' }}>
          SOLANA x ELEVENLABS x LIFI x VIRTUALS
        </p>
        <h1 className="hero-anim font-display text-white opacity-0" style={{ fontSize: 'clamp(48px, 10vw, 120px)', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
          RESCUE FOOD<br />
          <span className="text-[#4CC9F0]">RESCUE BLOCKS</span>
        </h1>
        <p className="hero-anim text-[#A0A0B0] mt-8 opacity-0" style={{ fontSize: 20, maxWidth: 560 }}>
          The first voice-powered, cross-chain surplus food marketplace. Restaurants list in seconds. Consumers pay with any crypto. Robots handle pickup.
        </p>
        <div className="hero-anim flex items-center gap-6 mt-8 opacity-0">
          <a
            href="#marketplace"
            className="inline-flex items-center bg-[#FF6B35] text-[#03045E] rounded-full px-10 py-4 font-display text-base hover:scale-105 transition-transform duration-300"
            style={{ boxShadow: '0 0 30px rgba(255, 107, 53, 0.4)' }}
          >
            Explore Marketplace
          </a>
          <a
            href="#video"
            className="text-[#4CC9F0] font-display text-base hover:underline transition-all duration-300"
          >
            View Demo
          </a>
        </div>
      </div>
    </section>
  );
}
