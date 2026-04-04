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

      // Distance-based clipping for the start point
      float dist = distance(vLocalPosition.xy, uOrigin.xy);
      if (dist < uClipRadius) discard;

      // Soften the edge fade
      float edgeFade = smoothstep(uClipRadius, uClipRadius + 0.1, dist);
      float baseOpacity = 0.05 * edgeFade;
      
      // Energy bursts moving along the line - SLOWER
      float pulse = fract(vUv.x * 2.0 - uTime * 0.5);
      pulse = pow(pulse, 40.0) * 0.6;
      
      // The "Spark" at the tip - SMOOTHER
      float tipDist = abs(vUv.x - uProgress);
      float spark = 1.0 - smoothstep(0.0, 0.03, tipDist);
      spark = pow(spark, 3.0) * 1.2;

      // Final energy pulse/burst logic - SLOWER
      float burst = fract(vUv.x * 1.0 - uTime * 0.3 + 0.5);
      burst = pow(burst, 60.0) * 0.5;

      float finalEnergy = max(max(pulse, burst), spark) * edgeFade;
      
      // Increase brightness near the tip (the "energy head")
      vec3 finalColor = uColor + (uPulseColor * finalEnergy * 8.0);
      
      // Add a slight glow boost when progress is high (reaching target)
      float reachBoost = smoothstep(0.95, 1.0, uProgress) * spark * 2.0;
      finalColor += uPulseColor * reachBoost;

      float finalOpacity = baseOpacity + finalEnergy * 0.6 + reachBoost;

      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `,
};

function PathfindingPipe({ 
  origin, 
  target, 
  index, 
  onReached,
  startTime: globalStartTime
}: { 
  origin: THREE.Vector3; 
  target: THREE.Vector3; 
  index: number;
  onReached: (index: number) => void;
  startTime: number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [hasReached, setHasReached] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [localStartTime, setLocalStartTime] = useState(0);
  const [isActivated, setIsActivated] = useState(false);

  // ... (curve and geometry useMemo stay the same)
  const curve = useMemo(() => {
    const points = [origin.clone()];
    const seed = (index * 7.7) + (iteration * 13.33);
    const rnd = (s: number) => (Math.sin(s) + 1) / 2;
    const isFromSide = Math.abs(origin.x) > 1.0; 
    
    if (isFromSide) {
      const laneX = THREE.MathUtils.lerp(origin.x, target.x, 0.2 + rnd(seed) * 0.3);
      points.push(new THREE.Vector3(laneX, origin.y, origin.z));
      const midY = THREE.MathUtils.lerp(origin.y, target.y, 0.4 + rnd(seed + 1) * 0.2);
      points.push(new THREE.Vector3(laneX, midY, THREE.MathUtils.lerp(origin.z, target.z, 0.3)));
      const secondX = THREE.MathUtils.lerp(laneX, target.x, 0.5 + rnd(seed + 2) * 0.3);
      points.push(new THREE.Vector3(secondX, midY, THREE.MathUtils.lerp(origin.z, target.z, 0.6)));
      points.push(new THREE.Vector3(secondX, target.y, THREE.MathUtils.lerp(origin.z, target.z, 0.8)));
    } else {
      const firstX = origin.x + (rnd(seed) - 0.5) * 2.0;
      points.push(new THREE.Vector3(firstX, origin.y, origin.z));
      const midY = THREE.MathUtils.lerp(origin.y, target.y, 0.3 + rnd(seed + 1) * 0.3);
      const midX = firstX + (rnd(seed + 2) - 0.5) * 1.5;
      points.push(new THREE.Vector3(firstX, midY, origin.z));
      points.push(new THREE.Vector3(midX, midY, THREE.MathUtils.lerp(origin.z, target.z, 0.3)));
      const secondY = THREE.MathUtils.lerp(origin.y, target.y, 0.6 + rnd(seed + 3) * 0.2);
      points.push(new THREE.Vector3(midX, secondY, THREE.MathUtils.lerp(origin.z, target.z, 0.6)));
      points.push(new THREE.Vector3(target.x, secondY, THREE.MathUtils.lerp(origin.z, target.z, 0.85)));
    }
    
    points.push(target.clone());
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < points.length - 1; i++) {
      path.add(new THREE.LineCurve3(points[i], points[i+1]));
    }
    return path;
  }, [origin, target, index, iteration]);

  const geometry = useMemo(() => {
    const geo = new THREE.TubeGeometry(curve, 160, 0.0018, 6, false);
    return geo;
  }, [curve]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  const uniforms = useMemo(() => {
    const u = THREE.UniformsUtils.clone(PulseShader.uniforms);
    u.uColor.value = new THREE.Color("#18181b"); 
    u.uPulseColor.value = new THREE.Color("#ffffff"); 
    const isFromSide = Math.abs(origin.x) > 1.0;
    u.uClipRadius.value = isFromSide ? 0.0 : 0.15;
    return { ...u, uOrigin: { value: origin.clone() } };
  }, [origin]); 

  useFrame((state) => {
    if (globalStartTime > 0) {
      // Check for proximity activation
      if (!isActivated) {
        // Camera Y position is -scrollRatio * viewport.height
        // If the target is within a certain distance from the current camera view, activate it
        const camY = state.camera.position.y;
        const distToCam = Math.abs(target.y - camY);
        
        // Activate if it's in the Hero area OR if we scrolled near it
        if (index < 10 || distToCam < 5) {
          setIsActivated(true);
          setLocalStartTime(state.clock.elapsedTime);
        }
        return;
      }

      const effectiveStartTime = iteration === 0 ? localStartTime : localStartTime;
      const timeSinceStart = state.clock.elapsedTime - effectiveStartTime;
      
      // Small sequential delay for groups, but much faster than before
      const pipeDelay = iteration === 0 ? (index % 4) * 0.2 : 0.1; 
      const growthTime = timeSinceStart - pipeDelay;
      
      const progress = Math.min(Math.max(growthTime * 0.8, 0), 1);
      uniforms.uProgress.value = progress;
      uniforms.uTime.value = state.clock.elapsedTime;

      if (progress >= 1 && !hasReached) {
        setHasReached(true);
        onReached(index);
      }

      // Loop after some time
      if (progress >= 1 && growthTime > 8.0) {
        setIteration(i => i + 1);
        setLocalStartTime(state.clock.elapsedTime);
        setHasReached(false);
        uniforms.uProgress.value = 0;
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
      const depth = t.z ?? -1;
      
      // Calculate the visible area at the specific depth of this target
      // Camera is at z=5, so distance to depth is 5 - (depth)
      const distance = 5 - depth;
      const vAtDepth = 2 * Math.tan(THREE.MathUtils.degToRad(50) / 2) * distance;
      const wAtDepth = vAtDepth * (viewport.width / viewport.height);

      const targetVec = new THREE.Vector3(
        (t.x * wAtDepth) / 2,
        (t.y * vAtDepth) / 2,
        depth
      );

      let originVec: THREE.Vector3;

      // First 6 targets emerge from a wider area or the extreme left
      if (i < 6) {
        // Spread the origin further out to the left, beyond the viewport
        originVec = new THREE.Vector3(-wAtDepth * 0.6, 0, depth);
      } else {
        // Others emerge from the extreme sides of the viewport at their own depth
        const side = i % 2 === 0 ? 1 : -1;
        const edgeX = (side * wAtDepth) / 2 * 1.2; // 20% beyond the edge
        
        const edgeY = targetVec.y + (i % 3 - 1) * 3.0; 
        originVec = new THREE.Vector3(edgeX, edgeY, depth);
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
