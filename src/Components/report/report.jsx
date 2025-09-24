import SeedIcon from '../../assets/seed.svg';
import './Report.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPDF from './ReportPDF';
// import BrandLogo from '../BrandLogo/BrandLogo';

export default function Report({ stockData }) {
  // Default data structure for when no props are passed
  const defaultData = {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    currentPrice: 150.25,
    marketCap: '2.45T',
    peRatio: 25.4,
    sector: 'Technology',
    introduction:
      'Apple Inc. is a multinational technology company that designs, develops, and sells consumer electronics, computer software, and online services.',
    recommendation: 'BUY',
    confidence: 'HIGH',
    targetPrice: 175.0,
    strengths: [
      'Strong brand loyalty and ecosystem',
      'Consistent revenue growth',
      'Strong cash position',
      'Innovation leadership in consumer tech',
    ],
    weaknesses: [
      'High dependence on iPhone sales',
      'Premium pricing limits market reach',
      'Regulatory scrutiny in multiple markets',
    ],
    marketPosition:
      'Market leader in premium consumer electronics with strong competitive moats',
    ratios: {
      peRatio: 25.4,
      pbRatio: 8.2,
      psRatio: 6.8,
      deRatio: 1.73,
      roe: 26.4,
      netIncome: 94.3,
      freeCashFlowMargin: 25.8,
      revenueGrowth: 8.1,
      netIncomeGrowth: 5.4,
    },
  };

  const data = stockData || defaultData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value}%`;
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation?.toUpperCase()) {
      case 'BUY':
        // case 'STRONG BUY':
        return '#65A30D';
      case 'SELL':
        // case 'STRONG SELL':
        return '#ef4444';
      // case 'HOLD':
      //   return '#f59e0b';
      // default:
      //   return '#6b7280';
    }
  };

  return (
    <div className="report-container">
      <div className="report-body">
        {/* Brand Header */}
        <header className="brand-header">
          <div className="brand-content">
            <span className="brand-logo-text">
              <span className="brand-logo-seed">Seed</span>
              <span className="brand-logo-ling">ling</span>
            </span>
            <p className="brand-description">
              Getting you one big step closer to your financial goals
              by bringing you the most accurate stock findings powered
              with Perplexity Finance API and our advanced screening
              methods.
            </p>
            <div className="header-actions">
              <PDFDownloadLink
                document={<ReportPDF stockData={data} />}
                fileName={`${data.symbol}_investment_report.pdf`}
                className="pdf-download-btn"
              >
                {({ blob, url, loading, error }) =>
                  loading ? 'Generating PDF...' : 'Download PDF'
                }
              </PDFDownloadLink>
            </div>
          </div>
          <img
            src={SeedIcon}
            alt=""
            className="brand-logo-icon-bg"
          />
        </header>

        <hr className="section-divider" />

        {/* Stock Overview */}
        <section className="stock-overview">
          <div className="stock-metrics">
            <h2 className="stock-symbol">{data.symbol}</h2>
            <h3 className="company-name">{data.companyName}</h3>
            <div className="key-metrics">
              <div className="metric-item">
                <span className="metric-label">Current Price</span>
                <span className="metric-value">
                  {formatCurrency(data.currentPrice)}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Market Cap</span>
                <span className="metric-value">
                  ${data.marketCap}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">P/E Ratio</span>
                <span className="metric-value">{data.peRatio}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Sector</span>
                <span className="metric-value">{data.sector}</span>
              </div>
            </div>
          </div>

          <div className="stock-introduction">
            <h3 className="section-title">Company Overview</h3>
            <p className="introduction-text">{data.introduction}</p>
          </div>
        </section>

        <hr className="section-divider" />

        {/* Investment Recommendation */}
        <section className="recommendation-section">
          <div
            className="recommendation-badge"
            style={{
              backgroundColor: getRecommendationColor(
                data.recommendation
              ),
              color: 'white',
            }}
          >
            <span className="recommendation-text">
              {data.recommendation} - {data.confidence} CONFIDENCE
            </span>
          </div>
          {data.targetPrice && (
            <div className="target-price">
              <span className="target-label">Target Price: </span>
              <span className="target-value">
                {formatCurrency(data.targetPrice)}
              </span>
            </div>
          )}
        </section>

        <hr className="section-divider" />

        {/* Detailed Analysis */}
        <section className="detailed-analysis">
          <div className="analysis-content">
            <div className="sentiment-analysis">
              <div className="analysis-section">
                <h4 className="analysis-title">Strengths</h4>
                <ul className="analysis-list strengths">
                  {data.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-section">
                <h4 className="analysis-title">Weaknesses</h4>
                <ul className="analysis-list weaknesses">
                  {data.weaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-section">
                <h4 className="analysis-title">Market Position</h4>
                <p className="market-position-text">
                  {data.marketPosition}
                </p>
              </div>
            </div>

            <div className="financial-ratios">
              <h4 className="ratios-title">Key Financial Ratios</h4>
              <div className="ratios-grid">
                <div className="ratio-item">
                  <span className="ratio-label">P/E Ratio</span>
                  <span className="ratio-value">
                    {data.ratios.peRatio}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">P/B Ratio</span>
                  <span className="ratio-value">
                    {data.ratios.pbRatio}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">P/S Ratio</span>
                  <span className="ratio-value">
                    {data.ratios.psRatio}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">D/E Ratio</span>
                  <span className="ratio-value">
                    {data.ratios.deRatio}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">ROE</span>
                  <span className="ratio-value">
                    {formatPercent(data.ratios.roe)}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">Net Income</span>
                  <span className="ratio-value">
                    ${data.ratios.netIncome}B
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">FCF Margin</span>
                  <span className="ratio-value">
                    {formatPercent(data.ratios.freeCashFlowMargin)}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">Revenue Growth</span>
                  <span className="ratio-value growth-positive">
                    {formatPercent(data.ratios.revenueGrowth)}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">Income Growth</span>
                  <span className="ratio-value growth-positive">
                    {formatPercent(data.ratios.netIncomeGrowth)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="section-divider" />

        {/* Disclaimer */}
        <footer className="disclaimer-section">
          <p className="disclaimer-text">
            <strong>Disclaimer:</strong> This report is for
            informational purposes only and should not be considered
            as investment advice. Past performance does not guarantee
            future results. Please consult with a qualified financial
            advisor before making any investment decisions. All data
            is subject to change and may not reflect real-time market
            conditions.
          </p>
        </footer>
      </div>
    </div>
  );
}
