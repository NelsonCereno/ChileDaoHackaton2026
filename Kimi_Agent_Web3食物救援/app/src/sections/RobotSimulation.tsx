import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type RobotPhase = 'scan' | 'validate' | 'dispense';

const PHASE_TEXT: Record<RobotPhase, { eyebrow: string; h2: string; body: string; status: string; statusColor: string }> = {
  scan: {
    eyebrow: 'AUTOMATED PICKUP',
    h2: 'Scan Wallet',
    body: 'The consumer approaches the dispenser and scans their wallet QR code. The system queries the Solana blockchain for a valid purchase ticket.',
    status: 'STATUS: VERIFYING...',
    statusColor: '#4CC9F0',
  },
  validate: {
    eyebrow: 'BLOCKCHAIN VALIDATION',
    h2: 'Validate On-Chain',
    body: 'The smart contract verifies the cryptographic ticket against the purchase record. Tamper-proof and instant.',
    status: 'STATUS: CONFIRMED',
    statusColor: '#2ECC71',
  },
  dispense: {
    eyebrow: 'PHYSICAL DISPENSING',
    h2: 'Dispense Order',
    body: 'The robot arm retrieves the correct container from refrigerated storage and delivers it through the pickup hatch.',
    status: 'STATUS: DISPENSING',
    statusColor: '#FF6B35',
  },
};

export default function RobotSimulation() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    animFrame: number;
    base: THREE.Group;
    joint1: THREE.Group;
    arm1: THREE.Group;
    joint2: THREE.Group;
    arm2: THREE.Group;
    gripperL: THREE.Mesh;
    gripperR: THREE.Mesh;
    container: THREE.Mesh;
  } | null>(null);
  const [phase, setPhase] = useState<RobotPhase>('scan');
  const phaseRef = useRef<RobotPhase>('scan');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const domContainer = canvasContainerRef.current;
    if (!domContainer) return;

    const w = domContainer.offsetWidth;
    const h = domContainer.offsetHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0A1A');
    scene.fog = new THREE.Fog('#0A0A1A', 10, 30);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(5, 5, 10);
    camera.lookAt(0, 1, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    domContainer.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight('#FF6B35', 0.5, 10);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // Materials
    const baseMat = new THREE.MeshStandardMaterial({ color: '#1A1A2E', metalness: 0.8, roughness: 0.3 });
    const jointMat = new THREE.MeshStandardMaterial({ color: '#FF6B35', metalness: 0.6, roughness: 0.4, emissive: '#FF6B35', emissiveIntensity: 0.2 });
    const armMat = new THREE.MeshStandardMaterial({ color: '#2A2A3E', metalness: 0.7, roughness: 0.3 });
    const gripperMat = new THREE.MeshStandardMaterial({ color: '#4CC9F0', metalness: 0.5, roughness: 0.4 });
    const containerMat = new THREE.MeshStandardMaterial({ color: '#2ECC71', transparent: true, opacity: 0.8 });

    // Robot Hierarchy
    const base = new THREE.Group();
    scene.add(base);

    // Base platform
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 2), baseMat);
    baseMesh.position.y = 0.25;
    baseMesh.castShadow = true;
    base.add(baseMesh);

    // Joint 1 (rotating)
    const joint1 = new THREE.Group();
    joint1.position.y = 0.5;
    base.add(joint1);

    const joint1Mesh = new THREE.Mesh(new THREE.SphereGeometry(0.6), jointMat);
    joint1Mesh.castShadow = true;
    joint1.add(joint1Mesh);

    // Arm 1
    const arm1 = new THREE.Group();
    joint1.add(arm1);

    const arm1Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 0.3), armMat);
    arm1Mesh.position.y = 1.5;
    arm1Mesh.castShadow = true;
    arm1.add(arm1Mesh);

    // Joint 2
    const joint2 = new THREE.Group();
    joint2.position.y = 3;
    arm1.add(joint2);

    const joint2Mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5), jointMat);
    joint2Mesh.castShadow = true;
    joint2.add(joint2Mesh);

    // Arm 2
    const arm2 = new THREE.Group();
    joint2.add(arm2);

    const arm2Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.5, 0.25), armMat);
    arm2Mesh.position.y = 1.25;
    arm2Mesh.castShadow = true;
    arm2.add(arm2Mesh);

    // Gripper
    const gripperGroup = new THREE.Group();
    gripperGroup.position.y = 2.5;
    arm2.add(gripperGroup);

    const gripperL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.3), gripperMat);
    gripperL.position.x = -0.2;
    gripperL.castShadow = true;
    gripperGroup.add(gripperL);

    const gripperR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.3), gripperMat);
    gripperR.position.x = 0.2;
    gripperR.castShadow = true;
    gripperGroup.add(gripperR);

    // Food Container on shelf
    const container = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.6), containerMat);
    container.position.set(3, 1.5, 0);
    container.castShadow = true;
    scene.add(container);

    // Shelf
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.1, 0.8),
      new THREE.MeshStandardMaterial({ color: '#1A1A2E', metalness: 0.5, roughness: 0.5 })
    );
    shelf.position.set(3, 1.25, 0);
    shelf.castShadow = true;
    scene.add(shelf);

    // Shelf support
    const shelfSupport = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.25, 0.8),
      new THREE.MeshStandardMaterial({ color: '#1A1A2E', metalness: 0.5, roughness: 0.5 })
    );
    shelfSupport.position.set(3, 0.625, 0);
    scene.add(shelfSupport);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: '#0A0A1A', roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper
    const grid = new THREE.GridHelper(20, 20, '#1A1A2E', '#1A1A2A');
    scene.add(grid);

    sceneRef.current = {
      renderer, scene, camera, animFrame: 0,
      base, joint1, arm1, joint2, arm2, gripperL, gripperR, container,
    };

    // Scroll-driven animation
    const scrollProxy = { t: 0 };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=400%',
        pin: true,
        scrub: 1,
      },
    });

    // Phase transitions based on scroll progress
    tl.to(scrollProxy, {
      t: 1,
      duration: 1,
      ease: 'none',
      onUpdate: () => {
        const t = scrollProxy.t;
        const { joint1, joint2, gripperL, gripperR } = sceneRef.current!;

        if (t < 0.33) {
          setPhase('scan');
          // Base rotates slowly
          sceneRef.current!.base.rotation.y = t * Math.PI * 3;
          joint1.rotation.z = 0;
          joint2.rotation.z = 0;
          gripperL.position.x = -0.2;
          gripperR.position.x = 0.2;
        } else if (t < 0.66) {
          setPhase('validate');
          const localT = (t - 0.33) / 0.33;
          // Arm extends to pick up
          joint1.rotation.z = -Math.PI / 4 * localT;
          joint2.rotation.z = Math.PI / 3 * localT;
          // Gripper closes
          gripperL.position.x = -0.2 + 0.15 * localT;
          gripperR.position.x = 0.2 - 0.15 * localT;
        } else {
          setPhase('dispense');
          const localT = (t - 0.66) / 0.34;
          // Arm lifts and rotates to delivery
          joint1.rotation.z = -Math.PI / 4 + (Math.PI / 3 + Math.PI / 4) * localT;
          joint2.rotation.z = Math.PI / 3 - (Math.PI / 3 - Math.PI / 6) * localT;
          // Gripper opens at end
          if (localT > 0.7) {
            const openT = (localT - 0.7) / 0.3;
            gripperL.position.x = -0.05 - 0.15 * openT;
            gripperR.position.x = 0.05 + 0.15 * openT;
          }
        }
      },
    });

    // Camera orbit animation
    const cameraProxy = { angle: 0 };
    gsap.to(cameraProxy, {
      angle: Math.PI * 2,
      duration: 20,
      repeat: -1,
      ease: 'none',
      onUpdate: () => {
        const r = 12;
        camera.position.x = Math.cos(cameraProxy.angle) * r;
        camera.position.z = Math.sin(cameraProxy.angle) * r;
        camera.lookAt(0, 1.5, 0);
      },
    });

    // Animate
    const animate = () => {
      sceneRef.current!.animFrame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const cw = domContainer.offsetWidth;
      const ch = domContainer.offsetHeight;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(sceneRef.current!.animFrame);
      tl.kill();
      renderer.dispose();
      if (domContainer.contains(renderer.domElement)) {
        domContainer.removeChild(renderer.domElement);
      }
    };
  }, []);

  const currentPhase = PHASE_TEXT[phase];

  return (
    <section
      id="robot"
      ref={sectionRef}
      className="relative w-full"
      style={{ background: '#0A0A1A', minHeight: '100vh' }}
    >
      <div className="mx-auto" style={{ maxWidth: 1000 }}>
        {/* 3D Canvas */}
        <div
          ref={canvasContainerRef}
          className="relative w-full rounded-2xl overflow-hidden"
          style={{ height: '70vh', minHeight: 500 }}
        >
          {/* Status Overlay */}
          <div
            className="absolute top-4 right-4 z-10 p-4 rounded-lg"
            style={{
              background: 'rgba(10, 10, 26, 0.8)',
              border: '1px solid rgba(76, 201, 240, 0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: currentPhase.statusColor }}
              />
              <span className="font-mono-label" style={{ fontSize: 11, color: currentPhase.statusColor }}>
                {currentPhase.status}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-32 h-1 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: phase === 'scan' ? '33%' : phase === 'validate' ? '66%' : '100%',
                  background: currentPhase.statusColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Phase Text */}
        <div
          className="text-center mt-8 px-6"
          style={{ maxWidth: 700, margin: '32px auto 0' }}
        >
          <p className="font-mono-label text-[#FF6B35] mb-3">{currentPhase.eyebrow}</p>
          <h2 className="font-display text-white" style={{ fontSize: 'clamp(36px, 4vw, 48px)' }}>
            {currentPhase.h2}
          </h2>
          <p className="text-[#A0A0B0] mt-4" style={{ fontSize: 18, lineHeight: 1.7 }}>
            {currentPhase.body}
          </p>
        </div>
      </div>
    </section>
  );
}
