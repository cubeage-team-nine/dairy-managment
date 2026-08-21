import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

import RoutePath from "../../core/constants/routes.constant";

const quickLinks = [
  {
    label: "Home",
    to: RoutePath.HOME,
  },
  {
    label: "About Us",
    to: RoutePath.ABOUT,
  },
  {
    label: "Features",
    to: RoutePath.FEATURES,
  },
  {
    label: "Contact Us",
    to: RoutePath.CONTACT,
  },
];

const featureLinks = [
  "Animal Management",
  "Milk Tracking",
  "Feed & DMI",
  "Health Records",
  "Breeding",
  "Finance & Reports",
];

const supportLinks = [
  {
    label: "Features",
    to: RoutePath.FEATURES,
  },
  {
    label: "FAQs",
    to: RoutePath.HELP_CENTER,
  },
  {
    label: "Request a Demo",
    to: RoutePath.CONTACT,
  },
  {
    label: "Onboarding & Training",
    to: RoutePath.CONTACT,
  },
];

const socialLinks = [
  {
    label: "Facebook",
    Icon: FaFacebook,
    href: "#",
  },
  {
    label: "Instagram",
    Icon: FaInstagram,
    href: "#",
  },
  {
    label: "LinkedIn",
    Icon: FaLinkedin,
    href: "#",
  },
  {
    label: "YouTube",
    Icon: FaYoutube,
    href: "#",
  },
];

export function Footer() {
  return (
    <footer className="hero-gradient overflow-hidden rounded-t-[28px] text-white">
      <div className="mx-auto max-w-7xl px-6 pt-14 sm:px-8 lg:px-10 lg:pt-16">
        {/* =====================================================
            MAIN FOOTER
        ====================================================== */}

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* ===================================================
              BRAND
          ==================================================== */}

          <div className="lg:col-span-5">
            <Link
              to={RoutePath.HOME}
              className="inline-flex items-center gap-3"
            >
              {/* Logo */}
              <div className="flex size-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                {/* <Logo onDark /> */}
              </div>

              <div>
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">
                  Smart Dairy
                </h2>

                <span className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                  Manager
                </span>
              </div>
            </Link>

            <p className="mt-6 max-w-md font-body text-sm leading-7 text-white/80 sm:text-base">
              Smart Dairy Manager helps dairy farmers and cooperatives
              record every animal, litre and rupee in one simple app —
              so decisions are made on data, not guesswork.
            </p>

            {/* Social Icons */}
            <div className="mt-7 flex items-center gap-3">
              {socialLinks.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="
                    flex size-12 items-center justify-center
                    rounded-full
                    border border-white/20
                    bg-white/5
                    text-white
                    transition-all duration-200
                    hover:border-white/40
                    hover:bg-white/15
                    hover:-translate-y-0.5
                  "
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ===================================================
              QUICK LINKS
          ==================================================== */}

          <div className="lg:col-span-2">
            <h3 className="eyebrow text-white/70">
              Quick Links
            </h3>

            <ul className="mt-6 space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="
                      font-body text-sm text-white/85
                      transition-colors
                      hover:text-white
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ===================================================
              FEATURES
          ==================================================== */}

          <div className="lg:col-span-2">
            <h3 className="eyebrow text-white/70">
              Features
            </h3>

            <ul className="mt-6 space-y-4">
              {featureLinks.map((feature) => (
                <li key={feature}>
                  <Link
                    to={RoutePath.HOME}
                    className="
                      font-body text-sm text-white/85
                      transition-colors
                      hover:text-white
                    "
                  >
                    {feature}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ===================================================
              SUPPORT + CONTACT
          ==================================================== */}

          <div className="lg:col-span-3">
            <h3 className="eyebrow text-white/70">
              Support
            </h3>

            <ul className="mt-6 space-y-4">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="
                      font-body text-sm text-white/85
                      transition-colors
                      hover:text-white
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact */}
            <h3 className="eyebrow mt-10 text-white/70">
              Contact
            </h3>

            <ul className="mt-6 space-y-4">
              {/* Phone */}
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-white/80" />

                <a
                  href="tel:+919876543210"
                  className="
                    font-body text-sm text-white/85
                    transition-colors
                    hover:text-white
                  "
                >
                  +91 98765 43210
                </a>
              </li>

              {/* Email */}
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-white/80" />

                <a
                  href="mailto:hello@smartdairymanager.com"
                  className="
                    break-all
                    font-body text-sm text-white/85
                    transition-colors
                    hover:text-white
                  "
                >
                  hello@smartdairymanager.com
                </a>
              </li>

              {/* Address */}
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white/80" />

                <span className="font-body text-sm leading-6 text-white/85">
                  Baner Road, Pune,
                  <br />
                  Maharashtra 411045
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* =====================================================
            BOTTOM FOOTER
        ====================================================== */}

        <div
          className="
            mt-14 flex flex-col gap-4
            border-t border-white/15
            py-7
            font-body text-sm text-white/70
            sm:flex-row sm:items-center
            sm:justify-between
          "
        >
          {/* Copyright */}
          <p>
            © {new Date().getFullYear()} Smart Dairy Manager.
            All rights reserved.
          </p>

          {/* Legal */}
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            <Link
              to={RoutePath.HOME}
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              to={RoutePath.HOME}
              className="transition-colors hover:text-white"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;