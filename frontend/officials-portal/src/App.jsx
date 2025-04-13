import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/SignUp';
import Dashboard from './pages/Dashboard';
import Layout from './Layout';
import GrievanceList from './components/GrievanceList';
import AreaHeatmap from './pages/AreaHeatmap';
import Chat from './pages/Chat';
import Announcements from './pages/Announcements';
import { ThemeProvider } from './components/ThemeProvider';
import TaskManagement from './pages/TaskManagement';
import Feedback from './pages/Feedback';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState('');

  const handleLogin = (role, data) => {
    setIsAuthenticated(true);
    setUserData(data);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    setUserRole('');
  };

  const grievances = [
    {
      id: 1,
      title: 'Broken Street Light',
      category: 'Infrastructure',
      status: 'Pending',
      description: 'The street light near the park is broken for weeks.',
      attachments: [{ name: 'image1.pdf', url: 'https://example.com/image1.pdf' }],
    },
    {
      id: 2,
      title: 'Water Leakage Issue',
      category: 'Water Supply',
      status: 'Resolved',
      description: 'There is a major water leakage near the main road.',
      attachments: [{ name: 'report.pdf', url: 'https://example.com/report.pdf' }],
    },
  ];

  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route path="/signup" element={<Signup />} />

          {isAuthenticated && (
            <Route element={<Layout userRole={userRole} onLogout={handleLogout} userAuth={userData} />}>
              <Route path="/dashboard" element={<Dashboard userAuth={userData} />} />
              <Route path="/grievances" element={<GrievanceList grievances={grievances} />} />
              <Route path="/heatmap" element={<AreaHeatmap />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/announcements" element={<Announcements userRole={userRole} />} />
              <Route path="/tasks" element={<TaskManagement />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          )}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
