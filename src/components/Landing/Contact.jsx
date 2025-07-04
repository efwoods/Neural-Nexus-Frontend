// src/components/Landing/Contact.jsx

import React from 'react';
import { FaXTwitter, FaLinkedin, FaGithub } from 'react-icons/fa6'; // Modern Twitter & LinkedIn

export default function Contact() {
  return (
    <section id="contact" className="py-16 bg-gray-100 text-gray-800">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
        <div className="max-w-md mx-auto">
          <div>
            <input
              type="text"
              placeholder="Name"
              className="w-full p-2 mb-4 border focus:border-purple-900 focus:ring-4 focus:ring-purple-400 focus:outline-none rounded transition-all"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-4 border focus:border-purple-900 focus:ring-4 focus:ring-purple-400 focus:outline-none rounded transition-all"
            />
            <textarea
              placeholder="Message"
              className="w-full p-2 mb-4 border focus:border-purple-900 focus:ring-4 focus:ring-purple-400 focus:outline-none rounded transition-all"
            ></textarea>
            <button
              type="button"
              className="bg-purple-700 text-white px-6 py-2 rounded-full w-full"
            >
              Send
            </button>
          </div>
          <div className="flex justify-center mt-4">
            {/* <a
              href="https://x.com/neuralnexus"
              className="mx-2 text-purple-700 hover:text-purple-500 transition"
            >
              <FaXTwitter />
            </a> */}
            {/* <a
              href="https://linkedin.com/company/neuralnexus"
              className="mx-2 text-purple-700 hover:text-purple-500 transition"
            >
              <FaLinkedin />
            </a> */}
            <a
              href="https://github.com/sponsors/efwoods"
              className="mx-2 text-purple-700 hover:text-purple-500 transition"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
