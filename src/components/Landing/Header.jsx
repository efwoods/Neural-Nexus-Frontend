// src/components/Landing/Header.jsx
import React, { useState, useEffect } from 'react';
import NeuralNexusLogo from '../../assets/NeuralNexus.png';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Product', href: '#product' },
    { name: 'About', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-2xl border-b border-teal-500/30 shadow-2xl shadow-teal-500/20'
          : 'bg-black/20 backdrop-blur-sm'
      }`}
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-teal-400/20 to-teal-500/10 opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black bg-gradient-to-r from-teal-300 via-teal-400 to-teal-500 bg-clip-text text-transparent drop-shadow-sm">
                Neural Nexus
              </span>
              <span className="text-xs sm:text-sm text-teal-300/70 font-light tracking-[0.2em] hidden sm:block uppercase">
                Innovative Brain-Computer Interface Solutions
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 text-gray-300 hover:text-white transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="relative z-10 font-medium tracking-under">
                  {item.name}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-teal-400/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-teal-400 group-hover:w-full transition-all duration-300"></div>
              </a>
            ))}
          </nav>

          {/* CTA Button - Desktop */}
          <div className="hidden lg:flex items-center">
            <a
              href="/app"
              className="relative px-6 py-3 bg-gradient-to-r bg-white/5 text-white font-bold rounded-xl overflow-hidden group hover:shadow-2xl hover:shadow-teal-500/40 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 tracking-wide">Try Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-700 skew-x-12"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-teal-400 rounded-xl opacity-0 group-hover:opacity-50 blur transition-all duration-300"></div>
            </a>
          </div>

          {/* Mobile Right Section - Try Now + Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Try Now Button */}
            <a
              href="/app"
              className="relative px-3 py-2 bg-gradient-to-r bg-white/5 text-white font-bold rounded-lg overflow-hidden group hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 tracking-wide text-sm">
                Try Now
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-700 skew-x-12"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-teal-400 rounded-lg opacity-0 group-hover:opacity-50 blur transition-all duration-300"></div>
            </a>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="relative p-2 text-gray-300 hover:text-white transition-colors duration-300 hover:bg-teal-500/10 rounded-lg"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                    isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                  }`}
                ></span>
                <span
                  className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                ></span>
                <span
                  className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                    isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`lg:hidden transition-all duration-500 ease-out ${
          isMenuOpen
            ? 'max-h-screen opacity-100'
            : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-black/5 backdrop-blur-2xl border-t border-teal-500/30">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-300 hover:text-white py-3 px-4 rounded-xl hover:bg-teal-500/10 transition-all duration-300 transform hover:translate-x-2 hover:shadow-lg border border-transparent hover:border-teal-500/20"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? 'translateY(0)'
                      : 'translateY(-10px)',
                  }}
                >
                  <span className="font-medium tracking-wide text-lg">
                    {item.name}
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
