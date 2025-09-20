import TopBar from "./Components/Topbar/Topbar";
import Footer from "./Components/Footer/Footer";
import { Outlet } from "react-router-dom";
import './Layout.css'

function Layout() {
  return (
    <div className="page">
      <TopBar />
      <main className="page-content">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
