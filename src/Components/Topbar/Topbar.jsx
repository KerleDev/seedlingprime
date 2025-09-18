import React from "react";
import "./TopBar.css"; 
import logo from "../../assets/seed.svg";

function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-start">
        <img src={logo} alt="App Logo" className="logo" />
        <span className="logo-text">
          <span className="seed">Seed</span>
          <span className="ling">ling</span>
        </span>
      </div>
      <div className="actions">
        <button className="btn btn--light">Sign in</button>
        <button className="btn btn--dark">Sign up</button>
      </div>
    </header>
  );
}

export default TopBar;
