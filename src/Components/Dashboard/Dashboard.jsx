import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopBar from '../Topbar/Topbar'

function Dashboard() {


  return (
    <div className="page">
      <TopBar />
      <section className="page-content">
        {/* your dashboard content */}
      </section>
    </div>
  );
}
  

export default Dashboard