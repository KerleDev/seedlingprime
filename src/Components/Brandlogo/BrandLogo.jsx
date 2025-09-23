import SeedIcon from "../../assets/seed.svg";
import "./BrandLogo.css";


export default function BrandLogo({ inline = false }) {
    return (
      <span className={`brand-logo ${inline ? 'brand-logo--inline' : ''}`} aria-label="Seedling">
        <img src={SeedIcon} alt="" className="brand-logo-icon" />
        <span className="brand-logo-text">
          <span className="brand-logo-seed">Seed</span>
          <span className="brand-logo-ling">ling</span>
        </span>
      </span>
    );
  }
  
