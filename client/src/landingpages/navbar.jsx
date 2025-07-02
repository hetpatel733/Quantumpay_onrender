import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 w-full bg-[#b5f4f6] border-b-2 border-gray-600 z-50 font-raleway">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="no-underline">
            <img
              src="/images/Logo.webp"
              alt="QuantumPay Logo"
              className="h-12 w-48 rounded-2xl"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex space-x-6 text-black font-medium">
              <li
                className={`hover:bg-[#97e5e9] rounded-2xl px-4 py-2 transition-all ${
                  isActiveRoute("/") ? "bg-[#97e5e9]" : ""
                }`}
              >
                <Link to="/" className="block no-underline text-black">
                  Home
                </Link>
              </li>
              <li className="hover:bg-[#97e5e9] rounded-2xl px-4 py-2 transition-all">
                <a href="#" className="block no-underline text-black">
                  Supported Cryptocurrencies
                </a>
              </li>
              <li className="hover:bg-[#97e5e9] rounded-2xl px-4 py-2 transition-all">
                <a href="#" className="block no-underline text-black">
                  Pricing
                </a>
              </li>
              <li
                className={`hover:bg-[#97e5e9] rounded-2xl px-4 py-2 transition-all ${
                  isActiveRoute("/contact") ? "bg-[#97e5e9]" : ""
                }`}
              >
                <Link to="/contact" className="block no-underline text-black">
                  Contact Us
                </Link>
              </li>
              <li
                className={`hover:bg-[#97e5e9] rounded-2xl px-4 py-2 transition-all ${
                  isActiveRoute("/login") ? "bg-[#97e5e9]" : ""
                }`}
              >
                <Link to="/login" className="block no-underline text-black">
                  Login <i className="bi bi-chevron-right"></i>
                </Link>
              </li>
              <li
                className={`hover:bg-[#97e5e9] rounded-2xl px-4 py-2 transition-all ${
                  isActiveRoute("/signup") ? "bg-[#97e5e9]" : ""
                }`}
              >
                <Link to="/signup" className="block no-underline text-black">
                  Sign up <i className="bi bi-chevron-right"></i>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1 border-none bg-transparent focus:outline-none"
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-0.5 bg-black transition-all duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-black transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-black transition-all duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <nav
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 border-t border-gray-300 mt-2">
            <ul className="space-y-2">
              <li
                className={`rounded-lg transition-all ${
                  isActiveRoute("/") ? "bg-[#97e5e9]" : ""
                }`}
              >
                <Link
                  to="/"
                  className="block px-4 py-3 text-black hover:bg-[#97e5e9] rounded-lg no-underline"
                  onClick={closeMenu}
                >
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-3 text-black hover:bg-[#97e5e9] rounded-lg no-underline"
                  onClick={closeMenu}
                >
                  Supported Cryptocurrencies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-3 text-black hover:bg-[#97e5e9] rounded-lg no-underline"
                  onClick={closeMenu}
                >
                  Pricing
                </a>
              </li>
              <li
                className={`rounded-lg transition-all ${
                  isActiveRoute("/contact") ? "bg-[#97e5e9]" : ""
                }`}
              >
                <Link
                  to="/contact"
                  className="block px-4 py-3 text-black hover:bg-[#97e5e9] rounded-lg no-underline"
                  onClick={closeMenu}
                >
                  Contact Us
                </Link>
              </li>
              <li
                className={`rounded-lg transition-all ${
                  isActiveRoute("/login") ? "bg-[#97e5e9]" : ""
                }`}
              >
                <Link
                  to="/login"
                  className="block px-4 py-3 text-black hover:bg-[#97e5e9] rounded-lg no-underline"
                  onClick={closeMenu}
                >
                  Login <i className="bi bi-chevron-right"></i>
                </Link>
              </li>
              <li
                className={`rounded-lg transition-all ${
                  isActiveRoute("/signup") ? "bg-[#97e5e9]" : ""
                }`}
              >
                <Link
                  to="/signup"
                  className="block px-4 py-3 text-black hover:bg-[#97e5e9] rounded-lg no-underline"
                  onClick={closeMenu}
                >
                  Sign up <i className="bi bi-chevron-right"></i>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
