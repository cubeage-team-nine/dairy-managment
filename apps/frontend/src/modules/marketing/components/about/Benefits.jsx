import React from "react";
import "./css/Benifit.css";

const Benefits = () => {
  const benefits = [
    "One record per animal, from birth to culling",
    "Milk yield trends with fat and SNF quality",
    "Feed cost per litre, calculated daily",
    "Heat, insemination and calving reminders",
    "Vaccination and treatment history for audits",
    "Profit and loss per animal and per shed",
  ];

  return (
    <>
      <section className="benefits-section">
        <div className="benefits-container">

          <div className="benefits-intro">
            <span className="benefits-label">KEY BENEFITS</span>

            <h2>What changes on your farm</h2>

            <p>
              Within the first month most farms know their true feed cost per
              litre and stop missing breeding windows. Those two changes alone
              move the profit line.
            </p>
          </div>

          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div className="benefit-card" key={index}>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

    </>
  );
};

export default Benefits;