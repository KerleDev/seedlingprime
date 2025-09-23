// src/Components/SmallCard/SmallCard.jsx
import React from "react";
import "./SmallCard.css";

function SmallCard({ icon: Icon, imgSrc, imgAlt = "", title, description }) {
  const isImage = Boolean(imgSrc);

  return (
    <div className="small-card">
      <div className={`small-card-media ${isImage ? "image" : ""}`}>
        {isImage ? (
          <img src={imgSrc} alt={imgAlt} loading="lazy" />
        ) : Icon ? (
          <Icon className="icon" />
        ) : null}
      </div>

      <h3 className="small-card-title">{title}</h3>
      <p className="small-card-description">{description}</p>
    </div>
  );
}

export default SmallCard;
