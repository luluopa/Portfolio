"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Configuration for the "Senior" look
const PIPE_COUNT = 12;
const GROWTH_SPEED = 0.8;

function GrowingPipe({ origin, index }: { origin: THREE.Vector3; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate a random path for each pipe
  const curve = useMemo(() => {
    const points = [];
    points.push(origin.clone());
    
    // Create random mid-points to give it a "system" look
    for (let i = 1; i <= 3; i++) {
      points.push(
        new THREE.Vector3(
          origin.x + (Math.random() - 0.5) * (i * 4),
          origin.y + (Math.random() - 0.5) * (i * 4),
          -i // Move deeper into the screen
        ) 
      );
    }
    return new THREE.CatmullRomCurve3(points);
  }, [origin]);

  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.02, 8, false), [curve]);

  useFrame((state) => {
    if (meshRef.current) {
      // Animate the 'drawRange' to make it grow from the center
      const time = state.clock.getElapsedTime() * GROWTH_SPEED;
      const progress = Math.min(time, 1);
      meshRef.current.geometry.setDrawRange(0, progress * 64 * 8 * 6); // Total vertices
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial 
        color="white" 
        emissive="white" 
        emissiveIntensity={2} 
        transparent 
        opacity={0.8} 
      />
    </mesh>
  );
}

export function PipeSystem({ ignition }: { ignition: any }) {
  const { viewport } = useThree();

  const worldOrigin = useMemo(() => {
    // Guard: If ignition is null, return a zeroed vector or null
    if (!ignition || !ignition.origin) return new THREE.Vector3(0, 0, 0);

    const { x, y } = ignition.origin;
    const nx = (x / window.innerWidth) * 2 - 1;
    const ny = -(y / window.innerHeight) * 2 + 1;
    
    return new THREE.Vector3(
      (nx * viewport.width) / 2, 
      (ny * viewport.height) / 2, 
      0
    );
  }, [ignition, viewport]);

  if (!ignition) return null;

  return (
    <group>
      {/* Central Node */}
      <mesh position={worldOrigin}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Growing Network */}
      {Array.from({ length: PIPE_COUNT }).map((_, i) => (
        <GrowingPipe key={i} index={i} origin={worldOrigin} />
      ))}

      {/* Lighting to give the B&W depth */}
      <ambientLight intensity={0.2} />
      <pointLight position={worldOrigin} intensity={5} distance={10} color="white" />
    </group>
  );
}