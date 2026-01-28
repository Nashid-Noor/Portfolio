"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function InteractiveAvatar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance from center normalized (-1 to 1)
      const x = (e.clientX - centerX) / (window.innerWidth / 2);
      const y = (e.clientY - centerY) / (window.innerHeight / 2);

      // Clamp values
      const moveX = Math.max(-10, Math.min(10, x * 10));
      const moveY = Math.max(-10, Math.min(10, y * 10));

      setPupilPos({ x: moveX, y: moveY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-64 h-64 md:w-80 md:h-80 mx-auto animate-fade-in"
    >
      <Image
        src="/avatar-interactive.png"
        alt="Interactive Avatar"
        fill
        className="object-contain"
        priority
      />
      
      {/* Eyes Container - Positioned manually based on the generated image */}
      {/* You may need to tweak top/left/gap values depending on the image */}
      <div className="absolute top-[42%] left-[50%] -translate-x-1/2 flex gap-8">
        {/* Left Eye */}
        <div className="relative w-8 h-8 bg-white rounded-full overflow-hidden shadow-inner">
          <div 
            className="absolute w-4 h-4 bg-black rounded-full top-1/2 left-1/2 transition-transform duration-75 ease-out"
            style={{ 
              transform: `translate(calc(-50% + ${pupilPos.x}px), calc(-50% + ${pupilPos.y}px))` 
            }}
          />
        </div>

        {/* Right Eye */}
        <div className="relative w-8 h-8 bg-white rounded-full overflow-hidden shadow-inner">
          <div 
            className="absolute w-4 h-4 bg-black rounded-full top-1/2 left-1/2 transition-transform duration-75 ease-out"
            style={{ 
              transform: `translate(calc(-50% + ${pupilPos.x}px), calc(-50% + ${pupilPos.y}px))` 
            }}
          />
        </div>
      </div>
    </div>
  );
}
