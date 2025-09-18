"use client";

import { Warp } from "@paper-design/shaders-react"
import { useEffect, useState } from "react"

export default function WarpShaderHero() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 to-teal-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-teal-800/80" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.45}
          softness={1}
          distortion={0.25}
          swirl={0.8}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={1}
          colors={["hsl(200, 100%, 20%)", "hsl(160, 100%, 75%)", "hsl(180, 90%, 30%)", "hsl(170, 100%, 80%)"]}
        />
      </div>


    </main>
  )
}