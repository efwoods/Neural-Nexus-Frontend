// src/components/Landing/Hero.jsx

import React, { useEffect, useRef } from 'react';
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';

export default function Hero() {
  const vantaRef = useRef(null);
  useEffect(() => {
    let vantaEffect;
    if (vantaRef.current && !vantaEffect) {
      vantaEffect = NET({
        el: vantaRef.current,
        THREE,
        color: 0x14b8a6, // Teal lines
        backgroundColor: 0x301934,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        points: 10.0,
        maxDistance: 20.0,
        spacing: 15.0,
      });
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return (
    <section
      id="home"
      ref={vantaRef}
      className="h-screen flex items-center justify-center text-white relative"
    >
      <div className="text-center z-10">
        <h2 className="text-4xl md:text-6xl font-bold mb-4">
          Revolutionize Communication with AI Avatars
        </h2>
        <p className="text-lg md:text-xl mb-6">
          Create custom AI avatars powered by neural data for seamless,
          personalized interactions.
        </p>
        <a
          href="/app"
          className="bg-white text-purple-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200"
        >
          Get Started
        </a>
      </div>
    </section>
  );
}
