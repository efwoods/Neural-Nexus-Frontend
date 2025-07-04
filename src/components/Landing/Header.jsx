// src/components/Landing/Header.jsx
import React from 'react';
import NeuralNexusLogo from '../../assets/NeuralNexus.png';
export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-teal-500 to-white text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">Neural Nexus</h1>
        <img
          src={NeuralNexusLogo}
          alt="Logo"
          className="w-20 h-20 bg-transparent"
        />
        <nav>
          <a
            href="#home"
            className="mx-2 text-purple-800 hover:text-purple-500 transition"
          >
            Home
          </a>
          <a
            href="#product"
            className="mx-2 text-purple-800 hover:text-purple-500 transition"
          >
            Product
          </a>
          <a
            href="#about"
            className="mx-2 text-purple-800 hover:text-purple-500 transition"
          >
            About
          </a>
          <a
            href="#careers"
            className="mx-2 text-purple-800 hover:text-purple-500 transition"
          >
            Careers
          </a>
          <a
            href="#contact"
            className="mx-2 text-purple-800 hover:text-purple-500 transition"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
