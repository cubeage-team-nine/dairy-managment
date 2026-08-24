import React from "react";
import "./css/hero.css";
import logo from "./img/img.jpg"
const Hero = () => {
  return (
    <>
      <section className="about-hero">
        <div className="about-hero-container">
          <div className="about-hero-content">
            <span className="about-eyebrow">ABOUT US</span>

            <h1>
              A dairy platform shaped by
              <br className="desktop-break" />
              barn floors, not
              <br className="desktop-break" />
              boardrooms
            </h1>

            <p>
              Smart Dairy Manager began in 2019 when a group of dairy
              technologists and second generation farmers realised the same
              truth: Indian dairy farms produce enormous amounts of data every
              day, and almost all of it disappears into notebooks.
            </p>

            <p>
              We built one platform that captures animal, milk, feed, health,
              breeding and financial records in a way a busy farmer can
              actually maintain — and turns them into decisions worth money.
            </p>
          </div>

          <div className="about-hero-image">
            <img
              src={logo}
              alt="Milk storage containers in a dairy"
            />
          </div>
        </div>
      </section>

    </>
  );
};

export default Hero;