import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Shield,
  Home,
  BarChart2,
  Megaphone,
  Vote,
  MessageCircle,
  FileText,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import ThemeSwitcher from './ThemeSwitcher';
import { translations } from '../translations';

interface NavbarProps {
  language: 'en' | 'hi';
  setLanguage: (language: 'en' | 'hi') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const Navbar: React.FC<NavbarProps> = ({ language, setLanguage, theme, setTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Grievances', path: '/grievances', icon: FileText },

    { label: 'Statistics', path: '/statistics', icon: BarChart2 },
    { label: 'Announcements', path: '/announcements', icon: Megaphone },
 //   { label: 'Community', path: '/community-polls', icon: Vote },
    { label: 'Community', path: '/discussion-forum', icon: MessageCircle },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Shield className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                {"JanMitra-AI"}
              </h1>
              <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">
                Public Grievance and Accountment Portal
              </p>
            </div>
          </div>

          {/* Desktop/Tablet Menu */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200
                  group flex items-center gap-2
                  ${theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {/* Show text only on large screens */}
                <span className="hidden lg:inline text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-[90]" 
               onClick={() => setIsOpen(false)} />
          <nav className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl z-[95]">
            <div className="max-w-7xl mx-auto py-2 px-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
                <div className="px-4 py-2 space-y-3 flex items-center gap-4">
                  <button
                    onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
