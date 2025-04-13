import React, { useState } from 'react'; // Remove useEffect if not used
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { translations } from '../translations';
import { 
  ChevronRight, 
  Megaphone, 
  Vote, 
  // Remove BuildingIcon if not used
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  Clock as ClockIcon,
  MessageSquare,
  HelpCircle 
} from 'lucide-react';
import GrievanceForm from './GrievanceForm';
import features from '../data/features.json';
import { faqs } from '../data/faqs.json';
import { ads, governmentAds, announcements, activePolls } from '../data/content.json';

interface DashboardProps {
  language: 'en' | 'hi';
  theme: 'light' | 'dark';
  setShowForm: (show: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ language, theme, setShowForm }) => {
  const navigate = useNavigate();
  const t = translations[language];
  const [showLocalForm, setShowLocalForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const { citizenFeatures } = features;

  const renderFeatureCarousel = () => (
    <div className="relative overflow-hidden mb-8 h-[200px]">
      <div className="flex justify-center items-center">
        <div className="relative w-full max-w-7xl">
          <motion.div 
            className="flex gap-6"
            initial={{ x: 0 }}
            animate={{ 
              x: [-20, -(citizenFeatures.length * 320)],
              transition: {
                duration: 30,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 0.5,
              }
            }}
          >
            {citizenFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-80"
              >
                <div className="p-6 rounded-lg bg-[#0B2447]/30 border border-[#19376D]/50 h-[280px]">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 text-[#FFA41B]">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </div>
              </motion.div>
            ))}
            
            {/* First few cards repeated at end for seamless loop */}
            {citizenFeatures.slice(0, 3).map((feature, index) => (
              <motion.div
                key={`repeat-${index}`}
                className="flex-shrink-0 w-80"
              >
                <div className="p-6 rounded-lg bg-[#0B2447]/30 border border-[#19376D]/50 h-[280px]">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 text-[#FFA41B]">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-16 -mt-8"> {/* Add negative margin to compensate for navbar padding */}
      {/* Hero Section with Animation */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative rounded-2xl overflow-hidden ${showLocalForm ? 'min-h-[calc(100vh-8rem)]' : 'min-h-[90vh]'}`}
      >
        <div className="absolute inset-0">
          <div className={`absolute inset-0 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-[#0B2447]/90 to-black/90'
              : 'bg-gradient-to-r from-[#1a4a7c]/95 to-[#134074]/95'
          } z-10`} />
          {/* <video
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          > */}
            {/* <source src="/govt-buildings.mp4" type="video/mp4" /> */}
          {/* </video> */}
        </div>

        {!showLocalForm ? (
          // Show title and button when form is hidden
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative z-20 container mx-auto px-2 sm:px-4 h-full flex flex-col items-center justify-center text-center"
          >
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-4 sm:mb-6"
              >
                <div className="flex flex-col items-center gap-4 sm:gap-6">
                  <div 
                    className="my-1 sm:my-2 mx-auto drop-shadow-2xl filter brightness-125" 
                  />
                  {/* Ashok Stambh */}
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                    alt="Ashok Stambh" 
                    className="h-16 sm:h-20 md:h-24 mx-auto drop-shadow-2xl" 
                  />
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 text-white mt-4 sm:mt-6">
                  JanMitra-AI
                  <span className="block text-lg sm:text-2xl md:text-3xl mt-1 sm:mt-2 text-[#FFA41B]">
                    A Stop Solution To Your Problems
                  </span>
                </h1>
              </motion.div>
              
              <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 text-gray-300 px-4 sm:px-0">
                AI-powered citizen grievance resolution platform for transparent and efficient governance
              </p>

              {/* Feature Cards with Subtle Glow */}
              {renderFeatureCarousel()}

              <motion.button 
                onClick={() => setShowLocalForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 my-4 sm:my-5 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-[#19376D] to-[#0B2447] rounded-lg font-semibold text-white hover:from-[#FFA41B] hover:to-[#FF8C00] transition-all duration-300 shadow-lg"
              >
                Submit Your Grievance
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // Show form when button is clicked
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-4xl mx-auto pt-8 px-4"
          >
            <button 
              onClick={() => setShowLocalForm(false)}
              className="mb-8 px-6 py-2 bg-white/5 backdrop-blur-sm rounded-lg font-semibold text-white hover:bg-white/10 transition-colors"
            >
              ← Back
            </button>
            <div className="backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-2xl">
              <GrievanceForm
                isAnonymous={false}
                onClose={() => setShowLocalForm(false)}
                language={language}
              />
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* Only show other sections when form is not visible */}
      {!showLocalForm && (
        <>
          {/* Quick Stats with Animation */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { title: "Total Grievances", value: "12,345", change: "+12%", icon: TrendingUpIcon },
              { title: "Resolved Cases", value: "10,890", change: "+8%", icon: ClockIcon },
              { title: "Average Resolution Time", value: "48h", change: "-25%", icon: UsersIcon }
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="relative group"
              >
                {/* Minimal outer glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFA41B]/5 to-[#FFD700]/5 rounded-xl blur-sm group-hover:blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                
                {/* Border highlight */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FFA41B]/20 to-[#FFD700]/20 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                
                {/* Card content */}
                <div className="relative p-6 rounded-xl bg-[#0B2447]/10 backdrop-blur-lg border border-[#19376D]/30 hover:border-[#FFA41B]/50 transition-all duration-300">
                  <div className="relative flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-[#19376D]/20">
                      <stat.icon className="w-6 h-6 text-[#FFA41B]" />
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm">{stat.title}</h3>
                      <div className="flex items-end gap-2 mt-1">
                        <span className="text-2xl font-bold text-white">{stat.value}</span>
                        <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Latest Announcements */}
            <section className="p-6 rounded-xl bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-semibold">Latest Announcements</h2>
                </div>
                <button className="text-sm text-purple-400 hover:text-purple-300">View all</button>
              </div>
              <div className="space-y-4">
                {announcements.map((announcement, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/5 dark:bg-gray-800/50 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{announcement.title}</h3>
                      <span className="text-xs text-gray-400">{announcement.date}</span>
                    </div>
                    <span className="text-sm text-purple-400">{announcement.category}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Active Public Polls */}
            <section className="p-6 rounded-xl bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Vote className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-semibold">Active Public Polls</h2>
                </div>
                <button className="text-sm text-purple-400 hover:text-purple-300">View all</button>
              </div>
              <div className="space-y-4">
                {activePolls.map((poll, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/5 dark:bg-gray-800/50 hover:bg-white/10 transition-colors">
                    <h3 className="font-medium mb-2">{poll.title}</h3>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{poll.votes} votes</span>
                      <span>Ends in {poll.endsIn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Government Initiatives Section */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4 md:px-6"
          >
            {governmentAds.map((ad, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-[#0B2447]/90 to-black/90 border border-[#19376D]/30"
              >
                <div className="relative">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img 
                      src={ad.image} 
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <motion.div 
                      className="flex items-center gap-2 mb-2"
                      whileHover={{ x: 5 }}
                    >
                      <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                        {React.createElement(ad.icon, { className: "w-4 h-4 text-purple-300" })}
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-purple-300 line-clamp-1">
                        {ad.title}
                      </h3>
                    </motion.div>
                    <p className="text-xs sm:text-sm text-gray-300 mb-2 line-clamp-2">
                      {ad.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-purple-300 font-medium">{ad.stats}</span>
                      <motion.button
                        whileHover={{ x: 5 }}
                        className="text-white/80 hover:text-white flex items-center gap-1 text-xs sm:text-sm"
                      >
                        Learn more
                        <ChevronRight className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.section>

          {/* Advertisements Grid with Animation */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4 md:px-6"
          >
            {ads.map((ad, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="group relative overflow-hidden rounded-lg bg-black/50 backdrop-blur-sm border border-white/10"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img 
                    src={ad.image} 
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 backdrop-blur-sm">
                      {React.createElement(ad.icon, { className: "w-4 h-4 text-purple-400" })}
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-purple-400 line-clamp-1">
                      {ad.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 mb-2 line-clamp-2">
                    {ad.description}
                  </p>
                  <motion.a 
                    href={ad.link}
                    whileHover={{ x: 5 }}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm text-purple-400 hover:text-purple-300"
                  >
                    Learn more
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                    >
                      →
                    </motion.span>
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </motion.section>

          {/* FAQs Section */}
          <section className="p-8 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#FFA41B]" />
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-lg bg-[#0B2447]/30 border border-[#19376D]/50 hover:border-[#FFA41B]/50 transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold mb-3 text-[#FFA41B]">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* AI Support Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowAIChat(true)}
            className="fixed bottom-20 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-[#1a4a7c] to-[#134074] shadow-lg border border-white/20"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </motion.button>

          {/* AI Chat Modal */}
          {showAIChat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-36 right-6 z-50 w-96 rounded-xl bg-[#0B2447]/95 backdrop-blur-lg border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h3 className="font-semibold text-white">AI Support</h3>
                </div>
                <button 
                  onClick={() => setShowAIChat(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <div className="h-96 p-4 overflow-y-auto">
                {/* Add your chat interface here */}
                <div className="text-center text-gray-400">
                  How can I help you today?
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
