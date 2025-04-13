import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../components/ThemeProvider';
import { LayoutDashboard, Calendar, FolderKanban, BarChart3, PlusCircle, Sun, Moon, ListTodo, BarChart2 } from 'lucide-react';
import TaskStats from '../components/TaskManagement/TaskStats';
import UrgentTasks from '../components/TaskManagement/UrgentTasks';
import AssignedOfficers from '../components/TaskManagement/AssignedOfficers';
import TaskCalendar from '../components/TaskManagement/TaskCalendar';
import ResourceAllocation from '../components/TaskManagement/ResourceAllocation';
import TaskAnalytics from '../components/TaskManagement/TaskAnalytics';
import TaskDetails from '../components/TaskManagement/TaskDetails';
import Tasks from '../components/TaskManagement/Tasks';
import Dashboard from '../components/TaskManagement/Dashboard';

const NavButton = ({ active, icon: Icon, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
      active
        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </motion.button>
);

const TaskManagement = () => {
  const { theme, setTheme } = useTheme();
  const [activeView, setActiveView] = useState('overview');
  const [selectedTask, setSelectedTask] = useState(null);

  const views = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: FolderKanban },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const renderContent = () => {
    if (selectedTask) {
      return <TaskDetails task={selectedTask} />;
    }

    switch (activeView) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 gap-4">
              <TaskStats />
              <UrgentTasks />
            </div>
            <AssignedOfficers />
          </div>
        );
      case 'dashboard':
        return <Dashboard />;
      // case 'tasks':
      //   return <Tasks />;
      // case 'calendar':
      //   return (
      //     <motion.div
      //       initial={{ opacity: 0, x: 20 }}
      //       animate={{ opacity: 1, x: 0 }}
      //     >
      //       <TaskCalendar />
      //     </motion.div>
      //   );
      case 'resources':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ResourceAllocation />
          </motion.div>
        );
      case 'analytics':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <TaskAnalytics />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background dark:bg-zinc-900 transition-colors duration-200"
    >
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-white">
                Task Management
              </h1>
              <p className="text-sm md:text-base text-muted-foreground dark:text-zinc-400 mt-1">
                Manage and track your team's tasks efficiently
              </p>
            </div>
            {/* <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors ml-4"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button> */}
          </div>
          <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-700 text-primary-foreground px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto justify-center">
            <PlusCircle size={20} />
            <span>New Task</span>
          </button>
        </div>

        <div className="bg-card dark:bg-zinc-800/50 rounded-xl shadow-lg border dark:border-zinc-700/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-start gap-2 overflow-x-auto no-scrollbar mb-6">
            {views.map((view) => (
              <NavButton
                key={view.id}
                active={activeView === view.id}
                icon={view.icon}
                label={view.label}
                onClick={() => setActiveView(view.id)}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskManagement;