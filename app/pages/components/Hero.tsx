import type { LoadingCompletePayload } from "./LoadingScreen";

export type HeroProps = {
  /** When present, loading has fired "ignition". Use origin (x,y = center; width, height = terminal rect) to start 3D pipes from the terminal position. */
  ignition?: LoadingCompletePayload | null;
};

export function Hero(props: HeroProps) {
  const { ignition = null } = props;
  // ignition.origin available for 3D pipes: start growth from (origin.x, origin.y); origin.width/origin.height for initial bounds
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-white px-6 dark:bg-black">
      <h1 className="font-sans text-4xl font-semibold tracking-tight text-black dark:text-white sm:text-5xl">
        Hello World
      </h1>
    </section>
  );
}
