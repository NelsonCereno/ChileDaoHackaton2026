import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

function MonolithicSlab() {
  const groupRef = useRef<THREE.Group>(null);
  const emblemRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.cos(t / 4) / 8;
      groupRef.current.rotation.y = Math.sin(t / 2) / 8;
      groupRef.current.position.y = Math.sin(t / 1.5) / 8;
    }
  });

  // Brushed metal texture approximation using noise
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#262626',
      roughness: 0.7,
      metalness: 0.3,
    });
  }, []);

  const goldMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#ffd900',
      transparent: true,
      opacity: 0.9,
    });
  }, []);

  return (
    <group ref={groupRef}>
      {/* Main slab */}
      <mesh material={material} castShadow receiveShadow>
        <boxGeometry args={[3.5, 5, 0.8]} />
      </mesh>

      {/* Gold emblem on face */}
      <mesh ref={emblemRef} position={[0, 0.5, 0.41]} material={goldMaterial}>
        <circleGeometry args={[0.6, 32]} />
      </mesh>

      {/* Emblem symbol - book icon */}
      <Text
        position={[0, 0.5, 0.42]}
        fontSize={0.4}
        color="#0e0e0e"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        📚
      </Text>

      {/* Vertical gold line accent */}
      <mesh position={[-1.2, 0, 0.41]} material={goldMaterial}>
        <boxGeometry args={[0.05, 3.5, 0.02]} />
      </mesh>

      {/* Bottom base plate */}
      <mesh position={[0, -3, 0]} material={material} receiveShadow>
        <boxGeometry args={[5, 0.3, 2]} />
      </mesh>
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      vel[i * 3] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArray[i * 3] += velocities[i * 3];
      posArray[i * 3 + 1] += velocities[i * 3 + 1];
      posArray[i * 3 + 2] += velocities[i * 3 + 2];

      if (Math.abs(posArray[i * 3]) > 10) velocities[i * 3] *= -1;
      if (Math.abs(posArray[i * 3 + 1]) > 10) velocities[i * 3 + 1] *= -1;
      if (Math.abs(posArray[i * 3 + 2]) > 10) velocities[i * 3 + 2] *= -1;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffd900"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export function MonolithicBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        shadows
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          color="#ffd900"
          intensity={1.5}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} color="#fbf5dc" intensity={0.5} />
        <MonolithicSlab />
        <FloatingParticles />
        <Environment preset="night" />
        <fog attach="fog" args={['#0e0e0e', 5, 25]} />
      </Canvas>
    </div>
  );
}
