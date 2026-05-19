import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import BillImport from './pages/BillImport';
import SmartSuggestions from './pages/SmartSuggestions';
import SpendingAnalysis from './pages/SpendingAnalysis';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="import" element={<BillImport />} />
          <Route path="suggestions" element={<SmartSuggestions />} />
          <Route path="analysis" element={<SpendingAnalysis />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
