import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MonolithicAvatarProps {
  hash: string;
  size?: number;
  spinning?: boolean;
}

function hashToColor(hash: string, index: number): string {
  const start = (index * 6) % (hash.length - 6);
  const hex = hash.slice(start, start + 6);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Map to gold/cream range
  const hr = 20 + Math.floor((r / 255) * 60);
  const hg = 100 + Math.floor((g / 255) * 155);
  const hb = Math.floor((b / 255) * 80);
  return `rgb(${hr},${hg},${hb})`;
}

function hashToGeometry(hash: string) {
  // Extract values from hash to determine geometry parameters
  const values = hash.split('').map((c) => parseInt(c, 16));
  return {
    height: 1 + (values[0] / 15) * 1.5,
    width: 0.5 + (values[1] / 15) * 0.8,
    depth: 0.5 + (values[2] / 15) * 0.8,
    segments: 2 + Math.floor((values[3] / 15) * 4),
    twist: (values[4] / 15) * Math.PI * 0.3,
  };
}

function AvatarMesh({ hash, spinning }: { hash: string; spinning?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  const geo = useMemo(() => hashToGeometry(hash), [hash]);
  const color1 = useMemo(() => hashToColor(hash, 0), [hash]);
  const color2 = useMemo(() => hashToColor(hash, 1), [hash]);
  const color3 = useMemo(() => hashToColor(hash, 2), [hash]);

  const material1 = useMemo(() => new THREE.MeshStandardMaterial({
    color: color1,
    roughness: 0.6,
    metalness: 0.4,
  }), [color1]);

  const material2 = useMemo(() => new THREE.MeshStandardMaterial({
    color: color2,
    roughness: 0.4,
    metalness: 0.5,
  }), [color2]);

  const material3 = useMemo(() => new THREE.MeshStandardMaterial({
    color: color3,
    roughness: 0.8,
    metalness: 0.2,
    emissive: color3,
    emissiveIntensity: 0.2,
  }), [color3]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (spinning) {
      timeRef.current += delta;
      groupRef.current.rotation.y += delta * 3;
      const lerpFactor = Math.min(timeRef.current / 2, 1);
      groupRef.current.rotation.y *= 1 - lerpFactor * 0.95;
    } else {
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
    }
  });

  // Build a unique composition based on the hash
  const hashValues = hash.split('').map((c) => parseInt(c, 16));
  const blockCount = 2 + (hashValues[5] % 4);

  return (
    <group ref={groupRef}>
      {/* Central pillar */}
      <mesh ref={meshRef} material={material1} position={[0, 0, 0]}>
        <boxGeometry args={[geo.width, geo.height, geo.depth]} />
      </mesh>

      {/* Accent blocks */}
      {Array.from({ length: blockCount }).map((_, i) => {
        const offset = (hashValues[i + 6] / 15 - 0.5) * 1.2;
        const yOffset = (hashValues[i + 10] / 15 - 0.5) * geo.height * 0.8;
        const scale = 0.2 + (hashValues[i + 14] / 15) * 0.4;
        const mat = [material2, material3][i % 2];

        return (
          <mesh
            key={i}
            material={mat}
            position={[offset, yOffset, geo.depth / 2 + 0.1]}
          >
            <boxGeometry args={[scale, scale * 1.5, 0.1]} />
          </mesh>
        );
      })}

      {/* Top cap */}
      <mesh material={material2} position={[0, geo.height / 2 + 0.05, 0]}>
        <boxGeometry args={[geo.width * 1.1, 0.1, geo.depth * 1.1]} />
      </mesh>

      {/* Bottom cap */}
      <mesh material={material3} position={[0, -geo.height / 2 - 0.05, 0]}>
        <boxGeometry args={[geo.width * 1.1, 0.1, geo.depth * 1.1]} />
      </mesh>
    </group>
  );
}

export function MonolithicAvatar({ hash, size = 80, spinning = false }: MonolithicAvatarProps) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <spotLight position={[5, 5, 5]} angle={0.2} penumbra={0.8} color="#ffd900" intensity={1} />
        <pointLight position={[-3, -3, -3]} color="#fbf5dc" intensity={0.3} />
        <AvatarMesh hash={hash} spinning={spinning} />
      </Canvas>
    </div>
  );
}
