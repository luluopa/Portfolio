"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Shader optimized for thin energy lines
const PulseShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#ffffff") },
    uPulseColor: { value: new THREE.Color("#ffffff") },
    uProgress: { value: 0 },
    uClipRadius: { value: 0.15 }, 
    uOrigin: { value: new THREE.Vector3(0, 0, 0) },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vLocalPosition;
    void main() {
      vUv = uv;
      vLocalPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
    varying vec3 vLocalPosition;

    void main() {
      if (vUv.x > uProgress) discard;

      // Use local position for clipping so it follows the pipe as it moves
      float dist = distance(vLocalPosition.xy, uOrigin.xy);
      if (dist < uClipRadius) discard;

      // Soften the edge fade for better appearance
      float edgeFade = smoothstep(uClipRadius, uClipRadius + 0.1, dist);
      float baseOpacity = 0.04 * edgeFade; // Much lower base opacity
      
      // Energy bursts moving along the line - slowed down and subtler
      float pulse = fract(vUv.x * 2.0 - uTime * 1.0);
      pulse = pow(pulse, 50.0);
      
      float burst = fract(vUv.x * 1.0 - uTime * 0.7 + 0.5);
      burst = pow(burst, 60.0) * 0.8;

      float finalPulse = max(pulse, burst) * edgeFade;
      
      // Significantly reduced glow intensity
      vec3 finalColor = uColor + (uPulseColor * finalPulse * 5.0);
      float finalOpacity = baseOpacity + finalPulse * 0.4;

      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `,
};

function PathfindingPipe({ 
  origin, 
  target, 
  index, 
  onReached,
  startTime
}: { 
  origin: THREE.Vector3; 
  target: THREE.Vector3; 
  index: number;
  onReached: (index: number) => void;
  startTime: number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [hasReached, setHasReached] = useState(false);

  // Generate a multi-step "Manhattan Detour" path for a cleaner look
  const curve = useMemo(() => {
    const points = [origin.clone()];
    
    // Deterministic randomness based on index
    const seed = index * 2.1;
    const rnd = (s: number) => (Math.sin(s) + 1) / 2;
    
    const isFromSide = Math.abs(origin.x) > 1.0; // Simple check if it's an edge origin
    
    if (isFromSide) {
      // Step 1: Long horizontal entry from the side
      // Move to a vertical "lane"
      const laneX = THREE.MathUtils.lerp(origin.x, target.x, 0.3 + rnd(seed) * 0.2);
      points.push(new THREE.Vector3(laneX, origin.y, origin.z));
      
      // Step 2: Vertical travel
      const midY = THREE.MathUtils.lerp(origin.y, target.y, 0.5);
      points.push(new THREE.Vector3(laneX, midY, THREE.MathUtils.lerp(origin.z, target.z, 0.4)));
      
      // Step 3: Secondary horizontal
      const secondX = THREE.MathUtils.lerp(laneX, target.x, 0.6);
      points.push(new THREE.Vector3(secondX, midY, THREE.MathUtils.lerp(origin.z, target.z, 0.7)));
      
      // Step 4: Vertical alignment
      points.push(new THREE.Vector3(secondX, target.y, THREE.MathUtils.lerp(origin.z, target.z, 0.9)));
    } else {
      // Original logic for central ignition pipes
      const firstX = origin.x + (rnd(seed) - 0.5) * 1.5;
      points.push(new THREE.Vector3(firstX, origin.y, origin.z));
      
      const midY = THREE.MathUtils.lerp(origin.y, target.y, 0.4 + rnd(seed + 1) * 0.2);
      const midX = firstX + (rnd(seed + 2) - 0.5) * 1.0;
      points.push(new THREE.Vector3(firstX, midY, origin.z));
      points.push(new THREE.Vector3(midX, midY, THREE.MathUtils.lerp(origin.z, target.z, 0.3)));
      
      const secondY = THREE.MathUtils.lerp(origin.y, target.y, 0.7 + rnd(seed + 3) * 0.15);
      points.push(new THREE.Vector3(midX, secondY, THREE.MathUtils.lerp(origin.z, target.z, 0.6)));
      points.push(new THREE.Vector3(target.x, secondY, THREE.MathUtils.lerp(origin.z, target.z, 0.85)));
    }
    
    points.push(target.clone());

    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < points.length - 1; i++) {
      path.add(new THREE.LineCurve3(points[i], points[i+1]));
    }
    return path;
  }, [origin, target, index]);

  // Thinner lines for a much cleaner background look
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 160, 0.0018, 6, false), [curve]);

  // Stable uniforms object
  const uniforms = useMemo(() => {
    const u = THREE.UniformsUtils.clone(PulseShader.uniforms);
    u.uColor.value = new THREE.Color("#18181b"); // Very dark zinc base
    u.uPulseColor.value = new THREE.Color("#ffffff"); // Bright white pulse
    
    // Disable clipping for side-entry pipes so they emerge directly from the edge
    const isFromSide = Math.abs(origin.x) > 1.0;
    if (isFromSide) {
      u.uClipRadius.value = 0.0;
    }
    
    return {
      ...u,
      uOrigin: { value: origin.clone() }
    };
  }, []); 

  // Update origin if it changes
  useEffect(() => {
    if (uniforms.uOrigin) {
      uniforms.uOrigin.value.copy(origin);
      
      const isFromSide = Math.abs(origin.x) > 1.0;
      uniforms.uClipRadius.value = isFromSide ? 0.0 : PulseShader.uniforms.uClipRadius.value;
    }
  }, [origin, uniforms]);

  useFrame((state) => {
    if (startTime > 0) {
      // Update values on the stable uniforms object
      uniforms.uTime.value = state.clock.elapsedTime;
      
      const timeSinceStart = state.clock.elapsedTime - startTime;
      const pipeDelay = index * 0.12; 
      const growthTime = timeSinceStart - pipeDelay;
      
      const progress = Math.min(Math.max(growthTime * 2.0, 0), 1);
      uniforms.uProgress.value = progress;

      if (progress >= 1 && !hasReached) {
        setHasReached(true);
        onReached(index);
      }
    }
  });

  return (
    <mesh geometry={geometry}>
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

export function PipeSystem({ 
  ignition,
  targets, 
  onTargetReached 
}: { 
  ignition: any;
  targets: PipeTarget[]; 
  onTargetReached: (index: number) => void;
}) {
  const { viewport } = useThree();
  const [startTime, setStartTime] = useState<number>(0);

  useFrame((state) => {
    // Start timing
    if (ignition && startTime === 0) {
      setStartTime(state.clock.elapsedTime);
    }

    // Scroll handling: Move the CAMERA instead of the group
    // This provides natural parallax for deep objects and 1:1 scroll for front objects
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const scrollRatio = scrollY / (typeof window !== "undefined" ? window.innerHeight : 1);
    
    // Map scroll pixels to camera Y (scrolling down = camera moves down)
    state.camera.position.y = -scrollRatio * viewport.height;
  });

  const worldData = useMemo(() => {
    return targets.map((t, i) => {
      const targetVec = new THREE.Vector3(
        (t.x * viewport.width) / 2,
        (t.y * viewport.height) / 2,
        t.z ?? -1
      );

      let originVec: THREE.Vector3;

      // First 6 targets stay with the central ignition origin (the name)
      if (i < 6) {
        originVec = new THREE.Vector3(-viewport.width * 0.28, 0, 0);
      } else {
        // Others emerge from the sides of the viewport
        const side = i % 2 === 0 ? 1 : -1; // Alternate left/right
        const edgeX = (side * viewport.width) / 2;
        
        // Start slightly higher or lower than the target to create a diagonal entry
        const edgeY = targetVec.y + (i % 3 - 1) * 2.0; 
        originVec = new THREE.Vector3(edgeX, edgeY, t.z ?? -2);
      }

      return { origin: originVec, target: targetVec };
    });
  }, [targets, viewport.width, viewport.height]);

  if (!ignition) return null;

  return (
    <group>
      {worldData.map((data, i) => (
        <PathfindingPipe 
          key={i} 
          index={i} 
          origin={data.origin} 
          target={data.target} 
          onReached={onTargetReached}
          startTime={startTime}
        />
      ))}
      <ambientLight intensity={0.1} />
    </group>
  );
}
