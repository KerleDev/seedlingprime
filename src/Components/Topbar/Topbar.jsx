import { Link, useLocation, useParams } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPDF from '../report/ReportPDF';
import { getMergedReportData } from '../../utils/reportUtils';
import './TopBar.css';
import logo from '../../assets/seed.svg';

function TopBar() {
  const location = useLocation();
  const { symbol } = useParams();

  // Check if we're on the report route
  const isReportRoute = location.pathname.startsWith('/report/');

  // Get report data using utility function
  const reportData = isReportRoute ? getMergedReportData(symbol) : null;

  return (
    <header className="topbar">
      {/* Make the entire brand area clickable */}
      <Link
        to="/"
        className="topbar-start"
        aria-label="Go to home"
      >
        <img
          src={logo}
          alt="App Logo"
          className="logo"
        />
        <span className="logo-text">
          <span className="seed">Seed</span>
          <span className="ling">ling</span>
        </span>
      </Link>

      <div className="actions">
        {isReportRoute && reportData && (
          <PDFDownloadLink
            document={<ReportPDF stockData={reportData} />}
            fileName={`${reportData.symbol}_investment_report.pdf`}
            className="btn btn--light pdf-download-topbar"
          >
            {({ loading }) => (loading ? 'Loading...' : 'Download PDF')}
          </PDFDownloadLink>
        )}
        <button
          className="btn btn--light"
          type="button"
        >
          Sign in
        </button>
        <button
          className="btn btn--dark"
          type="button"
        >
          Sign up
        </button>
      </div>
    </header>
  );
}

export default TopBar;
