// src/components/layout/Navbar.jsx

import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import RoutePath from "../../core/constants/routes.constant.js";
import Logo from "./Logo.jsx";

const navLinks = [
  {
    label: "Home",
    path: RoutePath.HOME,
  },
  {
    label: "About Us",
    path: RoutePath.ABOUT,
  },
  {
    label: "Features",
    path: RoutePath.FEATURES,
  },
  {
    label: "Contact Us",
    path: RoutePath.CONTACT,
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to={RoutePath.HOME}
          className="flex items-center"
          onClick={() => setIsMenuOpen(false)}
        >
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to={RoutePath.LOGIN}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="rounded-lg p-2 text-foreground hover:bg-muted md:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <X className="size-6" />
          ) : (
            <Menu className="size-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
                <Link
                  to={RoutePath.SIGNUP}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Register
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}