import { useState, useEffect } from 'react';
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
import { supabase } from './utils/supabase';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuthenticated(true);
        fetchUserDetails(session.user.email);
      } else {
        setIsAuthenticated(false);
        setUserRole('');
        setUserData(null);
      }
    });

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        fetchUserDetails(session.user.email);
      }
    };
    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserDetails = async (email) => {
    const { data, error } = await supabase
      .from('Authority')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      console.error('Error fetching user details:', error);
      setIsAuthenticated(false);
    } else {
      const mappedRole = data.role.toLowerCase().replace(/_/g, '_');
      setUserRole(mappedRole);
      setUserData({
        id: data.id,
        email: data.email,
        role: mappedRole,
        department: data.departmentId,
        jurisdiction: data.jurisdiction || 'Default Jurisdiction',
        name: data.name || 'Admin',
        username: data.name || 'Admin',
      });
      console.log('Fetched User Details:', {
        id: data.id,
        email: data.email,
        role: mappedRole,
        department: data.departmentId,
        jurisdiction: data.jurisdiction,
        name: data.name,
      });
    }
  };

  const handleLogin = (role, data) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserData(data);
    console.log('Login Handled:', { role, data });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserRole('');
    setUserData(null);
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

  const isHighLevelRole = ['district_magistrate', 'department_head', 'admin'].includes(userRole);

  const handleSignupSuccess = () => {
    // Optionally redirect to login after signup
    // navigate('/'); // Uncomment if using useNavigate
  };

  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/signup"
            element={<Signup onSignupSuccess={handleSignupSuccess} />}
          />

          {
            <Route element={<Layout userRole={userRole} onLogout={handleLogout} userAuth={userData} />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard userAuth={userData} />} />
              <Route path="/grievances" element={<GrievanceList grievances={grievances} />} />
              <Route
                path="/heatmap"
                element={<AreaHeatmap />}
              />
              <Route path="/chat" element={<Chat />} />
              <Route path="/announcements" element={<Announcements userRole={userRole} />} />
              <Route path="/tasks" element={<TaskManagement />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          }
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;