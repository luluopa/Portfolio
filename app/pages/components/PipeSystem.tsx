"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Shader for the "energy pulse" effect
const PulseShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#ffffff") },
    uPulseColor: { value: new THREE.Color("#ffffff") },
    uProgress: { value: 0 },
    uClipRadius: { value: 1.2 }, // Size of the 'dead zone' around the name
    uOrigin: { value: new THREE.Vector3(0, 0, 0) },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uPulseColor;
    uniform float uProgress;
    uniform float uClipRadius;
    uniform vec3 uOrigin;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      // Line visibility based on uProgress (growth)
      if (vUv.x > uProgress) discard;

      // Hide pipes inside the 'dead zone' (where the name is)
      float dist = distance(vWorldPosition.xy, uOrigin.xy);
      if (dist < uClipRadius) discard;

      // Fade in at the edge of the dead zone
      float edgeFade = smoothstep(uClipRadius, uClipRadius + 0.2, dist);

      // Base line is very thin and semi-transparent
      float baseOpacity = 0.15 * edgeFade;
      
      // The pulse/burst effect
      float pulse = fract(vUv.x * 2.0 - uTime * 1.2);
      pulse = pow(pulse, 40.0); 
      
      float burst = fract(vUv.x * 1.0 - uTime * 0.8 + 0.5);
      burst = pow(burst, 60.0) * 0.8;

      float finalPulse = max(pulse, burst) * edgeFade;
      
      vec3 finalColor = mix(uColor, uPulseColor, finalPulse * 2.0);
      float finalOpacity = baseOpacity + finalPulse * 0.8;

      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `,
};

function RectilinearPipe({ origin, target, index }: { origin: THREE.Vector3; target: THREE.Vector3; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Generate a rectilinear (Manhattan-style) path
  const curve = useMemo(() => {
    const points = [];
    points.push(origin.clone());

    // Create a geometric, rectilinear path
    // We alternate axes to create 90-degree turns
    const mid1 = new THREE.Vector3(target.x, origin.y, origin.z);
    const mid2 = new THREE.Vector3(target.x, target.y, origin.z);

    // Add some random "system noise" to the path if it's not a direct hit
    // This makes it look more like a complex pipeline
    if (Math.random() > 0.5) {
      const offsetX = (Math.random() - 0.5) * 2;
      const offsetY = (Math.random() - 0.5) * 2;
      const jitter1 = new THREE.Vector3(origin.x + offsetX, origin.y, origin.z);
      const jitter2 = new THREE.Vector3(origin.x + offsetX, target.y + offsetY, origin.z);
      points.push(jitter1, jitter2);
    }

    points.push(mid1, mid2, target.clone());

    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < points.length - 1; i++) {
      path.add(new THREE.LineCurve3(points[i], points[i+1]));
    }
    return path;
  }, [origin, target]);

  // Very thin geometry
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 128, 0.006, 8, false), [curve]);

  // Create uniforms for this specific pipe instance
  const uniforms = useMemo(() => ({
    ...THREE.UniformsUtils.clone(PulseShader.uniforms),
    uOrigin: { value: origin.clone() }
  }), [origin]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      const growthTime = state.clock.getElapsedTime() - index * 0.1;
      const progress = Math.min(Math.max(growthTime * 0.6, 0), 1);
      materialRef.current.uniforms.uProgress.value = progress;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={PulseShader.vertexShader}
        fragmentShader={PulseShader.fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export type PipeTarget = {
  x: number;
  y: number;
  z?: number;
};

export function PipeSystem({ ignition, targets }: { ignition: any; targets?: PipeTarget[] }) {
  const { viewport } = useThree();

  const worldOrigin = useMemo(() => {
    if (!ignition || !ignition.origin) return new THREE.Vector3(0, 0, 0);
    const { x, y } = ignition.origin;
    const nx = (x / window.innerWidth) * 2 - 1;
    const ny = -(y / window.innerHeight) * 2 + 1;
    return new THREE.Vector3((nx * viewport.width) / 2, (ny * viewport.height) / 2, 0);
  }, [ignition, viewport]);

  // Convert screen-space targets to world-space
  const worldTargets = useMemo(() => {
    if (!targets || targets.length === 0) {
      // Default fallback targets (e.g., top-right, top-left, etc.)
      return Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return new THREE.Vector3(
          Math.cos(angle) * (viewport.width / 2.5),
          Math.sin(angle) * (viewport.height / 2.5),
          -2 - Math.random() * 3
        );
      });
    }

    return targets.map(t => {
      // If t is already in world space (fractional -1 to 1), use it
      // If it's in pixel space, convert it. Let's assume fractional for now or handle both.
      const nx = t.x;
      const ny = t.y;
      return new THREE.Vector3(
        (nx * viewport.width) / 2,
        (ny * viewport.height) / 2,
        t.z ?? -2
      );
    });
  }, [targets, viewport]);

  if (!ignition) return null;

  return (
    <group>
      {/* Pipeline Network */}
      {worldTargets.map((target, i) => (
        <RectilinearPipe key={i} index={i} origin={worldOrigin} target={target} />
      ))}

      <ambientLight intensity={0.1} />
    </group>
  );
}
