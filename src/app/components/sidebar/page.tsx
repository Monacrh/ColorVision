'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';
// import Image from "next/image";
import { useRouter } from 'next/navigation';

interface MenuItem {
  icon: React.ComponentType<{size?: number; className?: string}>;
  label: string;
  hasSubmenu?: boolean;
}

interface SubmenuItem {
  icon: React.ComponentType<{size?: number; className?: string}>;
  label: string;
}

interface Message {
  title: string;
  id: string;
}

interface SidebarViewProps {
  isDashboardOpen: boolean;
  isCollapsed: boolean;
  menuItems: MenuItem[];
  submenuItems: SubmenuItem[];
  messages: Message[];
  selectedMessageId: string | null;
  onToggleCollapse: () => void;
  onDashboardClick: () => void;
  onMenuClick: (label: string) => void;
  onMessageClick: (id: string) => void;
}

const SidebarView: React.FC<SidebarViewProps> = ({
  isDashboardOpen,
  isCollapsed,
  menuItems,
  submenuItems,
  messages,
  selectedMessageId,
  onToggleCollapse,
  onDashboardClick,
  onMenuClick,
  onMessageClick,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCollapsed && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [isCollapsed]);

  const sidebarVariants = {
    expanded: { width: 320 },
    collapsed: { width: 80 },
  };

  const contentVariants = {
    expanded: { opacity: 1, width: 'auto', display: 'block' },
    collapsed: { opacity: 0, width: 0, display: 'none' },
  };
  
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <motion.div
        className="h-[95vh] bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden"
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <motion.div
              className="flex items-center space-x-3"
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              variants={contentVariants}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">ColorVision</h1>
                <p className="text-xs text-gray-500">AI Testing</p>
              </div>
            </motion.div>

            <motion.button
              onClick={onToggleCollapse}
              className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all duration-200 border border-gray-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isCollapsed ? (
                <ChevronRight size={18} className="text-gray-600" />
              ) : (
                <ChevronLeft size={18} className="text-gray-600" />
              )}
            </motion.button>
          </div>

          {/* Scrollable content */}
          <div 
            ref={scrollContainerRef}
            className={`flex-1 p-6 ${isCollapsed ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}
          >
            {/* Menu Section */}
            <div className="mb-8">
              <motion.div
                className="mb-4"
                animate={isCollapsed ? 'collapsed' : 'expanded'}
                variants={contentVariants}
              >
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Main Menu
                </h2>
              </motion.div>

              <nav className="space-y-2">
                {menuItems.map((item, index) => (
                  <div key={index} className="relative">
                    <motion.button
                      className={`group relative flex items-center w-full rounded-xl transition-all duration-200 font-medium ${
                        isCollapsed ? 'justify-center p-3' : 'px-4 py-3 space-x-3'
                      } ${
                        item.label === 'Dashboard' && isDashboardOpen
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => item.hasSubmenu ? onDashboardClick() : onMenuClick(item.label)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className={`flex items-center justify-center ${
                        item.label === 'Dashboard' && isDashboardOpen
                          ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                      }`}>
                        <item.icon size={20} />
                      </div>
                      
                      <motion.span
                        className="flex-1 text-left text-sm"
                        animate={isCollapsed ? 'collapsed' : 'expanded'}
                        variants={contentVariants}
                      >
                        {item.label}
                      </motion.span>
                      
                      {item.hasSubmenu && !isCollapsed && (
                        <motion.div 
                          animate={{ rotate: isDashboardOpen ? 180 : 0 }} 
                          transition={{ duration: 0.2 }}
                          className="text-gray-400"
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Submenu */}
                    <AnimatePresence>
                      {item.hasSubmenu && isDashboardOpen && (
                        <motion.div
                          className={`${
                            isCollapsed
                              ? 'absolute left-full top-0 ml-3 bg-white rounded-xl shadow-lg border border-gray-200 p-4 min-w-48 z-50'
                              : 'overflow-hidden'
                          }`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {isCollapsed && (
                            <div className="absolute left-0 top-4 transform -translate-x-2">
                              <div className="w-0 h-0 border-r-[8px] border-r-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                              <div className="absolute left-0 top-0 w-0 h-0 border-r-[9px] border-r-gray-200 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent transform -translate-x-px"></div>
                            </div>
                          )}
                          
                          <div className={`${isCollapsed ? 'space-y-2' : 'ml-4 mt-2 space-y-1'}`}>
                            {submenuItems.map((subItem, subIndex) => (
                              <motion.button
                                key={subIndex}
                                className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: subIndex * 0.05 }}
                              >
                                {!isCollapsed && (
                                  <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                                )}
                                <subItem.icon size={16} />
                                <span className="font-medium">{subItem.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>
            </div>

            {/* History Section */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Test History
                    </h2>
                    <motion.button 
                      onClick={() => router.push('/dashboard')}
                      className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>

                  <div className="space-y-2">
                    {messages.map((message, index) => (
                      <motion.button
                        key={message.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => onMessageClick(message.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                          selectedMessageId === message.id
                            ? 'bg-blue-50 border border-blue-200 text-blue-900'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedMessageId === message.id ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-sm font-medium truncate">
                            {message.title}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA Section */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Plus size={20} className="text-white" />
                  </div>
                  <h3 className="text-gray-900 text-base font-semibold mb-2">
                    Start New Test
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Begin a comprehensive color vision screening with AI-powered analysis
                  </p>
                  <motion.button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Begin Assessment
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Collapsed CTA */}
          {isCollapsed && (
            <motion.div 
              className="p-4" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
            >
              <motion.button 
                className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center mx-auto transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} />
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SidebarView;