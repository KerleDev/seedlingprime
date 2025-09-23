import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SectionCard from "../Sectioncard/Sectioncard";
import SmallCard from "../SmallCard/SmallCard"; // import the new component
import {
  Search,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  FileBarChart2,
  Bot,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import ScreeningImg from "../../assets/ScreeningImg.svg";
import DealsImg from "../../assets/DealsImg.svg";
import GoalImg from "../../assets/GoalImg.svg";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();
  return (
    <>
      <section className="page-look">
        <section className="landing">
          <div className="p-structure">
            <div>
              <h1>Discover Undervalued Investment Opportunities</h1>
              <p>
                Advanced fundamental analysis platform that identifies "too
                cheap" stocks through sophisticated financial analysis and
                AI-powered insights.
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
        <div className="landing-no-shadow">
          <SectionCard title="What We’re Looking For">
            <p className="section-subtitle">
              We use a data-based screening process to make the right choices
            </p>
            <div className="small-card-wrapper">
              <SmallCard
                imgSrc={ScreeningImg}
                imgAlt="Screening illustration"
                title="Screening Framework"
                description="Identify opportunities while avoiding financially distressed companies."
              />
              <SmallCard
                imgSrc={DealsImg}
                imgAlt="Hunting for deals illustration"
                title="Hunting for Deals"
                description="Target quality stocks trading below fair value."
              />
              <SmallCard
                imgSrc={GoalImg}
                imgAlt="Buy low, sell high illustration"
                title="The Goal"
                description="Buy low, sell high when the market realizes what you already figured out."
              />
            </div>
          </SectionCard>
          <SectionCard title="Powerful Investment Analysis Tool">
            <p className="section-subtitle">
              Everything you need to identify undervalued opportunities in the
              market
            </p>
            <div className="small-card-grid">
              <SmallCard
                icon={TrendingUp}
                title="Sector Analysis"
                description="Analyze stocks across Healthcare, Technology, Finance, Energy, and Retail sectors with real-time data."
              />
              <SmallCard
                icon={BarChart3}
                title="Interactive Charts"
                description="Professional visualizations with sector mean comparisons and advanced financial metrics."
              />
              <SmallCard
                icon={FileBarChart2}
                title="AI-Powered Reports"
                description="Comprehensive investment analysis combining fundamentals and executive insights."
              />
              <SmallCard
                icon={ShieldCheck}
                title="Risk Assessment"
                description="Undervaluation detection using multiple valuation metrics and sector comparisons."
              />
              <SmallCard
                icon={Users}
                title="Professional Tools"
                description="Sophisticated screening tools designed for value investors and financial analysts."
              />
              <SmallCard
                icon={Zap}
                title="Real-time Updates"
                description="Live market data with automated alerts for undervalued opportunities."
              />
            </div>
          </SectionCard>
        </div>
      </section>
      {/* CTA Hero */}
      <section className="cta-hero cta--flat">
        {" "}
        {/* or use cta--full for full-bleed */}
        <div className="cta-inner">
          <h2 className="cta-title">Ready to Find Your Next Investment?</h2>
          <p className="cta-subtitle">
            Join thousands of investors using{" "}
            <span className="brand-text">Seedling</span> to identify undervalued
            opportunities.
          </p>
          <button
            className="btn btn--cta"
            onClick={() => navigate("/dashboard")}
          >
            Get Started Free
          </button>
        </div>
      </section>
    </>
  );
}

export default Landing;
