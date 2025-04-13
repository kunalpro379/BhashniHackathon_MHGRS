import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, Bell, UserCircle, ChevronRight, BarChart2, Users2, Target, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import GrievanceStats from '../components/GrievanceStats';
import DepartmentPerformance from '../components/DepartmentPerformance';
import CriticalAlerts from '../components/CriticalAlerts';
import TaskAssignments from '../components/TaskAssignments';
import NotificationPanel from '../components/NotificationPanel';
import dashboardData from '../data/dashboardData';
import PerformanceChart from '../components/PerformanceChart';
import ComparativeMetrics from '../components/ComparativeMetrics';
import ProfileCard from '../components/ProfileCard';

const Dashboard = ({ userAuth }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0.2]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const handleShowAnalysis = () => navigate('/analysis');
  const handleShowAlerts = () => navigate('/alerts');
  const handleShowTimeline = () => navigate('/timeline');

  const features = [
    {
      title: 'Real-time Monitoring',
      description: 'Track grievances and their resolution status in real-time',
      icon: <Clock className="w-6 h-6" />,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      path: '/grievances',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics to make informed decisions',
      icon: <BarChart2 className="w-6 h-6" />,
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      path: '/heatmap',
    },
    {
      title: 'Department Coordination',
      description: 'Seamless coordination between different departments',
      icon: <Users2 className="w-6 h-6" />,
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      path: '/chat',
    },
  ];

  const handleFeatureClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen duration-300">
      {/* Content Container */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/90 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center border border-white/5">
          <div className="flex-1 max-w-xl w-full mb-4 md:mb-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search grievances, departments, or locations..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </motion.button>
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowProfile(!showProfile)}
            >
              <UserCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              <span className="text-white text-sm font-medium dark:text-gray-200">
                {userAuth?.name || 'Admin'}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Welcome Section with Stats */}
        <div className="container mx-auto px-4 mb-8">
          <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Welcome Message - Now spans 3 columns */}
            <motion.div
              variants={itemVariants}
              style={{ opacity }}
              className="lg:col-span-3 bg-[#2d2d2d] rounded-lg overflow-hidden shadow-lg"
            >
              <div className="relative p-6">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-full opacity-5">
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                    <rect width="100" height="100" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Content */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className='flex items-center gap-4 justify-center flex-col md:flex-row'>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Welcome back, {userAuth?.name || 'Admin'}
                    </h1>
                    <p className="text-white/80">
                      Here's what's happening in your jurisdiction today
                    </p>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowProfile(!showProfile)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <UserCircle size={20} />
                      View Profile
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats Bar */}
              <div className="bg-[#252525] border-t border-[#3d3d3d] p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'New Grievances', value: '12', trend: '+2 today', color: 'text-purple-400' },
                  { label: 'Pending Actions', value: '5', trend: '3 urgent', color: 'text-amber-400' },
                  { label: 'Resolved Today', value: '8', trend: '94% success', color: 'text-emerald-400' },
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="text-center py-2 px-4 rounded-lg bg-[#2d2d2d] border border-[#3d3d3d]"
                  >
                    <p className="text-sm text-white/60 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-white/40 mt-1">{stat.trend}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Today's Activity Card */}
            <motion.div
              variants={itemVariants}
              className="bg-[#2d2d2d] rounded-lg shadow-lg border border-[#3d3d3d] p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Today's Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <p className="text-white/80 text-sm">12 new cases registered</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <p className="text-white/80 text-sm">5 cases need attention</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <p className="text-white/80 text-sm">8 cases resolved</p>
                </div>
                <button className="w-full mt-4 py-2 px-4 bg-[#353535] hover:bg-[#404040] text-white/80 rounded-lg text-sm transition-colors">
                  View All Activity
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 mb-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Platform Features</h2>
            <p className="text-gray-400">Explore the tools and features available to you</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                onClick={() => handleFeatureClick(feature.path)}
                className="group bg-[#2d2d2d] rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="h-48 overflow-hidden">
                  <motion.img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ scale: 1.05 }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#3d3d3d] rounded-lg text-white">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-gray-400 mb-4">{feature.description}</p>
                  <motion.button
                    whileHover={{ x: 5 }}
                    className="flex items-center text-white/70 hover:text-white gap-2 text-sm"
                  >
                    Learn more <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Profile Card Modal */}
        {showProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowProfile(false);
            }}
          >
            <ProfileCard 
              user={userAuth} 
              onClose={() => setShowProfile(false)} 
            />
          </motion.div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Stats Overview */}
            <motion.div 
              variants={itemVariants} 
              className="col-span-full bg-[#2d2d2d] rounded-lg shadow-lg border border-[#3d3d3d] p-6"
            >
              <GrievanceStats data={dashboardData.overallStats} />
            </motion.div>

            {/* Performance Chart */}
            <motion.div 
              variants={itemVariants} 
              className="lg:col-span-2 bg-[#2d2d2d] rounded-lg shadow-lg border border-[#3d3d3d] p-6"
            >
              <PerformanceChart 
                data={dashboardData.overallStats} 
                onShowMore={handleShowAnalysis}
              />
            </motion.div>
            {/* Comparative Metrics */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#2d2d2d] rounded-lg shadow-lg border border-[#3d3d3d] p-6 dark:text-gray-100">
              <ComparativeMetrics data={dashboardData.comparativeAnalytics} />
            </motion.div>

            {/* Critical Alerts */}
            <motion.div variants={itemVariants} className="bg-[#2d2d2d] rounded-lg shadow-lg border border-[#3d3d3d] p-6 dark:text-gray-100">
              <CriticalAlerts 
                alerts={dashboardData.criticalAlerts}
                onShowMore={handleShowAlerts}
              />
            </motion.div>

            {/* Task Assignments */}
            <motion.div variants={itemVariants} className="col-span-full bg-[#2d2d2d] rounded-lg shadow-lg border border-[#3d3d3d] p-6 dark:text-gray-100">
              <TaskAssignments tasks={dashboardData.tasks} />
            </motion.div>
          </motion.div>
        </div>

        {/* Notification Panel */}
        {showNotifications && (
          <NotificationPanel
            notifications={dashboardData.recentNotifications}
            onClose={() => setShowNotifications(false)}
            className="dark:bg-gray-800 dark:text-gray-100"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;