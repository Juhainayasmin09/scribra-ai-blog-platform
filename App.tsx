import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import PublicPost from './pages/PublicPost';
import ProfileSetup from './pages/ProfileSetup';
import ReadingList from './pages/ReadingList';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/setup-profile" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reading-list" element={<ReadingList />} />
          <Route path="/editor/:id" element={<Editor />} />
          <Route path="/post/:id" element={<PublicPost />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;