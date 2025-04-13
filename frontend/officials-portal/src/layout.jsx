import { Outlet, useNavigate, useLocation, Link } from "react-router-dom"
import { 
  LayoutDashboard, 
  FileText, 
  Map, 
  MessageSquare, 
  Megaphone,
  LogOut,
  ChevronLeft,
  Menu,
  MessageCircle,
  UserCircle
} from "lucide-react"
import React, { useState } from "react"
import Logo from "./components/Logo"
import ThemeToggle from './components/ThemeToggle'
import { useTheme } from './components/ThemeProvider';
import ProfileCard from './components/ProfileCard';

function Layout({ userRole, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { colors, theme, setTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);

  const mockUserData = {
    username: "admin",
    role: userRole || "administrator",
    jurisdiction: "Uttar Pradesh",
    department: "Administration"
  };

  // Update the navigation items paths
  const navItems = [
    { path: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "grievances", label: "Grievances", icon: FileText },
    { path: "heatmap", label: "Area Heatmap", icon: Map },
    { path: "chat", label: "Chat", icon: MessageSquare },
    { path: "announcements", label: "Announcements", icon: Megaphone },
    { path: "tasks", label: "Task Management", icon: FileText },
    { path: "feedback", label: "Feedback", icon: MessageCircle }
  ];

  // Update isActive to handle path matching correctly
  const isActive = (path) => {
    return location.pathname.endsWith(path);
  };

  // Update navigation handler
  const handleNavigation = (path) => {
    navigate(`/${path}`);
  };

  return (
    <div className="flex h-screen bg-gray-100 transition-colors duration-300 relative">
      {/* Sidebar with higher z-index */}
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-[#2d2d2d] border-r border-[#3d3d3d] transition-all duration-300 ease-in-out flex flex-col z-30 relative`}>
        {/* Logo section */}
        <div className="p-4 border-b border-[#3d3d3d] flex justify-between items-center">
          {isSidebarCollapsed ? (
            <img src="/up-logo.png" alt="UP-GRS" className="h-10 w-10 mx-auto" />
          ) : (
            <>
              <Logo />
              {/* <ThemeToggle /> */}
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 py-3 px-4 text-white/70 hover:bg-[#353535] hover:text-white transition-colors ${
                isActive(item.path) 
                  ? "bg-[#353535] text-white border-r-4 border-purple-500" 
                  : ""
              }`}
            >
              <item.icon size={20} />
              {!isSidebarCollapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Control buttons */}
        <div className="border-t border-[#3d3d3d] p-4">
          <button
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center gap-2 text-white/70 hover:text-white mb-4"
          >
            {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            {!isSidebarCollapsed && <span>Collapse</span>}
          </button>
          
          <button
            onClick={() => {
              onLogout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2 text-red-400 hover:bg-red-500/10 p-2 rounded-md"
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto relative">
        <div className="p-8">
          

          {/* Profile Card Modal */}
          {showProfile && (
            <>
              {/* Overlay */}
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setShowProfile(false)}
              />
              {/* Centered Profile Card */}
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                <ProfileCard
                  user={mockUserData}
                  onClose={() => setShowProfile(false)}
                />
              </div>
            </>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;

