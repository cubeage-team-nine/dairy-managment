/**
 * GauVikas Logo
 * Place the logo file at:  public/Img/gauVikas-logo.png
 */
function Logo({ iconOnly = false }) {
  return (
    <img
      src="/Img/GauVikas Logo.png"
      alt="GauVikas"
      className={iconOnly ? 'h-8 w-8 object-contain' : 'h-16 w-auto object-contain'}
    />
  )
}

export default Logo
