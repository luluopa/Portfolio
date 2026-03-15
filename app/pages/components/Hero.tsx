  "use client";
  import { Canvas } from "@react-three/fiber";
  import { PipeSystem } from "./PipeSystem";
  // 1. Only import the types that actually exist in LoadingScreen
  import type { LoadingCompletePayload } from "./LoadingScreen";
  import { EffectComposer, Bloom } from "@react-three/postprocessing";
  import { useRef } from "react";

  // 2. Define HeroProps here (or export it from here if other files need it)
  export type HeroProps = {
    ignition?: LoadingCompletePayload | null;
  };

  export function Hero({ ignition }: HeroProps) {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center bg-black overflow-hidden">
        {/* The 3D Layer */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <PipeSystem ignition={ignition} />
          
          <EffectComposer>
            <Bloom 
              intensity={1.5} 
              luminanceThreshold={0.1} 
              mipmapBlur 
            />
          </EffectComposer>
        </Canvas>
        </div>

        {/* The Content Layer */}
        <div className="relative z-10 text-center">
          <h1 className="font-sans text-6xl font-bold tracking-tighter text-white sm:text-8xl">
            John Doe
          </h1>
          <p className="mt-4 font-mono text-zinc-500">
            Senior Software Engineer // Systems Architect
          </p>
        </div>
      </section>
    );
  }