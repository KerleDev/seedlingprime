import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SectionCard from "../Sectioncard/Sectioncard";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();
  return (
    <>
    <section className="landing">
      <div className="p-structure">
        <div>
          <h1>Discover Undervalued Investment Opportunities</h1>
          <p>
            Advanced fundamental analysis platform that identifies "too cheap"
            stocks through sophisticated financial analysis and AI-powered
            insights.
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
        </div>
        <div className="lottie-container">
          <DotLottieReact
            src="https://lottie.host/912f864c-0ec5-48b7-8225-23e9e0f6d384/udwSg4KyuB.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    </section>
    <SectionCard title="Powerful Investment Analysis Tool">
      dd
    </SectionCard>
    </>
  )
}

export default Landing;
