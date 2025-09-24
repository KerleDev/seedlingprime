import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './Components/Dashboard/Dashboard';
import Landing from './Components/Landing/Landing';
import './App.css';
import Report from './Components/Report/Report';

function App() {
  return (
    <Routes>
      {/* All pages share the same Layout (TopBar + Footer) */}
      <Route
        path="/"
        element={<Layout />}
      >
        {/* Default page → Landing */}
        <Route
          index
          element={<Landing />}
        />

        {/* Dashboard page */}
        <Route
          path="dashboard"
          element={<Dashboard />}
        />
        <Route
          path="report"
          element={<Report />}
        />
      </Route>

      {/* Fallback: any unknown route redirects to "/" (Landing) */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
