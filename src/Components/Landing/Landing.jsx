import { useNavigate } from "react-router-dom";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <section className="landing">
      <h1>Welcome to Seedling Analytics 🌱</h1>
      <p>
        Make smarter investment decisions with clean dashboards and insights.
      </p>

      <div className="landing-buttons">
        <button className="btn btn--dark">Sign In</button>
        <button 
          className="btn btn--light "
          onClick={() => navigate("/dashboard")}
        >
          Start Free Analysis
        </button>
      </div>
    </section>
  );
}

export default Landing;
