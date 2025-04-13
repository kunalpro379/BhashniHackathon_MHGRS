import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { translations } from './translations';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import Announcements from './components/Announcements';
import CommunityPolls from './components/CommunityPolls';
import DiscussionForum from './components/DiscussionForum';
import GrievanceList from './components/GrievanceList';
// import { MobileIcon } from 'lucide-react'; // Add this import

function App() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [showForm, setShowForm] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const t = translations[language];

  return (
    <Router>
      <div className="min-h-screen relative bg-gray-900 text-white">
        <Navbar language={language} setLanguage={setLanguage} theme="dark" setTheme={() => {}} />
        
        <div className="fixed bottom-4 right-4 z-50 md:hidden">
          <div className="bg-gradient-to-r from-[#1a4a7c] to-[#134074] p-3 rounded-full shadow-lg">
            <img 
              src="/app-icon.png" 
              alt="MH-IGRS"
              className="w-10 h-10"
            />
          </div>
        </div>

        <main className="relative container mx-auto px-4 pt-28 md:pt-32 pb-12 z-0">
          <Routes>
            <Route path="/" element={<Dashboard language={language} theme="dark" setShowForm={setShowForm} />} />
            <Route path="/statistics" element={<Statistics language={language} theme="dark" />} />
            <Route path="/announcements" element={<Announcements language={language} theme="dark" />} />
            <Route path="/community-polls" element={<CommunityPolls language={language} theme="dark" />} />
            <Route path="/discussion-forum" element={<DiscussionForum language={language} theme="dark" />} />
            <Route path="/grievances" element={<GrievanceList language={language} />} />
          </Routes>
        </main>
        
        <footer className="bg-gray-800 text-gray-200 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="mb-2">{t.footerText}</p>
              <p className="text-gray-400">© 2025 Janmitra-AI</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;