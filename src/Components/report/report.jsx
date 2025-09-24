import { useParams } from 'react-router-dom';
import SeedIcon from '../../assets/seed.svg';
import './Report.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPDF from './ReportPDF';
// import BrandLogo from '../BrandLogo/BrandLogo';

export default function Report({ stockData, geminiData }) {
  const { symbol } = useParams();

  // Log the symbol from URL for debugging
  console.log('Report loaded for symbol:', symbol);

  // Get base data from localStorage
  const getStorageData = () => {
    try {
      const stored = localStorage.getItem('reportData');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to parse localStorage reportData:', error);
      return null;
    }
  };

  // Get Gemini data from localStorage if not provided as prop
  const getGeminiData = () => {
    if (geminiData) return geminiData;

    try {
      const stored = localStorage.getItem('geminiData');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to parse localStorage geminiData:', error);
      return null;
    }
  };

  // Default fallback data structure
  const defaultData = {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    currentPrice: 150.25,
    marketCap: '2.45T',
    peRatio: 25.4,
    sector: 'Technology',
    introduction: 'Loading company overview...',
    recommendation: 'ANALYZING',
    confidence: 'PENDING',
    targetPrice: 0,
    strengths: [
      'Analysis in progress...',
      'Please wait for AI analysis...',
      'Content loading...',
    ],
    weaknesses: [
      'Analysis in progress...',
      'Please wait for AI analysis...',
      'Content loading...',
    ],
    marketPosition: 'AI analysis in progress...',
    ratios: {
      peRatio: 0,
      pbRatio: 0,
      psRatio: 0,
      deRatio: 0,
      roe: 0,
      netIncome: 0,
      freeCashFlowMargin: 0,
      revenueGrowth: 0,
      netIncomeGrowth: 0,
    },
  };

  // Merge data sources: localStorage -> stockData -> geminiData (priority order)
  const storageData = getStorageData();
  const currentGeminiData = getGeminiData();
  const baseData = { ...defaultData, ...storageData, ...stockData };

  // Apply Gemini-generated content with highest priority
  const data = {
    ...baseData,
    ...(currentGeminiData?.introduction && {
      introduction: currentGeminiData.introduction,
    }),
    ...(currentGeminiData?.recommendation && {
      recommendation: currentGeminiData.recommendation,
    }),
    ...(currentGeminiData?.confidence && {
      confidence: currentGeminiData.confidence,
    }),
    ...(currentGeminiData?.strengths && {
      strengths: currentGeminiData.strengths,
    }),
    ...(currentGeminiData?.weaknesses && {
      weaknesses: currentGeminiData.weaknesses,
    }),
    ...(currentGeminiData?.marketPosition && {
      marketPosition: currentGeminiData.marketPosition,
    }),
  };

  // Debug logs
  // console.log('Report data loaded:');
  // console.log('- Symbol:', symbol);
  // console.log('- StorageData:', storageData);
  // console.log('- StockData prop:', stockData);
  // console.log('- GeminiData:', currentGeminiData);
  // console.log('- Final data object:', data);
  // console.log('- Final ratios:', data.ratios);
  // console.log('- Upside:', data.upside);
  // console.log('- MoS:', data.mos);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined || isNaN(value))
      return '0%';
    return `${parseFloat(value).toFixed(1)}%`;
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation?.toUpperCase()) {
      case 'LONG':
        // case 'STRONG BUY':
        return '#65A30D';
      case 'SHORT':
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
                {({ loading }) => (loading ? '' : 'Download PDF')}
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
                <span className="metric-value">{data.marketCap}</span>
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

            <div
              className="key-metrics valuation-metrics"
              style={{ marginTop: '0.6rem' }}
            >
              {data.upside && (
                <div className="metric-item">
                  <span className="metric-label">
                    Upside Potential
                  </span>
                  <span
                    className={`metric-value ${data.upside > 0 ? 'positive' : 'negative'}`}
                  >
                    {formatPercent(data.upside)}
                  </span>
                </div>
              )}
              {data.mos && (
                <div className="metric-item">
                  <span className="metric-label">
                    Margin of Safety
                  </span>
                  <span
                    className={`metric-value ${data.mos > 0 ? 'positive' : 'negative'}`}
                  >
                    {formatPercent(data.mos)}
                  </span>
                </div>
              )}
            </div>
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
            </div>

            <div className="financial-ratios">
              <h4 className="ratios-title">Key Financial Ratios</h4>
              <div className="ratios-grid">
                <div className="ratio-item">
                  <span className="ratio-label">P/E Ratio</span>
                  <span className="ratio-value">
                    {data.ratios?.peRatio || data.peRatio || '—'}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">P/B Ratio</span>
                  <span className="ratio-value">
                    {data.ratios?.pbRatio || '—'}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">P/S Ratio</span>
                  <span className="ratio-value">
                    {data.ratios?.psRatio || '—'}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">D/E Ratio</span>
                  <span className="ratio-value">
                    {data.ratios?.deRatio || '—'}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">ROE</span>
                  <span className="ratio-value">
                    {data.ratios?.roe
                      ? formatPercent(data.ratios.roe)
                      : '—'}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">Net Income</span>
                  <span className="ratio-value">
                    {data.ratios?.netIncome
                      ? `$${(data.ratios.netIncome / 1000000000).toFixed(0)} B`
                      : '—'}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">FCF Margin</span>
                  <span className="ratio-value">
                    {data.ratios?.freeCashFlowMargin
                      ? formatPercent(data.ratios.freeCashFlowMargin)
                      : '—'}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">Revenue Growth</span>
                  <span className="ratio-value growth-positive">
                    {data.ratios?.revenueGrowth
                      ? formatPercent(data.ratios.revenueGrowth)
                      : '—'}
                  </span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">Income Growth</span>
                  <span className="ratio-value growth-positive">
                    {data.ratios?.netIncomeGrowth
                      ? formatPercent(data.ratios.netIncomeGrowth)
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="analysis-section">
          <h4 className="analysis-title">Market Position</h4>
          <p className="market-position-text">
            {data.marketPosition}
          </p>
        </div>
        <br />
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
