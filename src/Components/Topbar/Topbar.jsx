import React from "react";
import { Link } from "react-router-dom";
import "./TopBar.css";
import logo from "../../assets/seed.svg";

function TopBar() {
  return (
    <header className="topbar">
      {/* Make the entire brand area clickable */}
      <Link to="/" className="topbar-start" aria-label="Go to home">
        <img src={logo} alt="App Logo" className="logo" />
        <span className="logo-text">
          <span className="seed">Seed</span>
          <span className="ling">ling</span>
        </span>
      </Link>

      <div className="actions">
        <button className="btn btn--light" type="button">Sign in</button>
        <button className="btn btn--dark" type="button">Sign up</button>
      </div>
    </header>
  );
}

export default TopBar;
