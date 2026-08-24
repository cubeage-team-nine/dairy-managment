import React from "react";
import "./css/VisionMision.css";

const VisionMision = () => {
    return(
        <>
             <section className="vision-mission">
        <div className="vm-container">

          <div className="vm-card vm-mission">
            <div className="vm-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
              </svg>
            </div>

            <h2>Our mission</h2>

            <p>
              To put professional-grade herd management in the hands of every
              dairy farmer — however small the farm — so that milk production
              becomes more profitable, more predictable and kinder to the
              animals that make it possible.
            </p>
          </div>

          <div className="vm-card vm-vision">
            <div className="vm-icon vision-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M2.8 12s3.4-5.5 9.2-5.5S21.2 12 21.2 12s-3.4 5.5-9.2 5.5S2.8 12 2.8 12Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="2.7"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            </div>

            <h2>Our vision</h2>

            <p>
              A dairy sector where every litre is traceable, every animal is
              cared for on time, and every farmer can see exactly how their
              farm is performing — making India's dairy farms among the most
              efficient and transparent in the world.
            </p>
          </div>

        </div>
      </section>
        </>
    )
}

export default  VisionMision;
