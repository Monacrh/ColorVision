'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Menu,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TestHistory } from '@/types/history';

// --- Interfaces ---
interface MenuItem {
  icon: React.ComponentType<{size?: number; className?: string}>;
  label: string;
  hasSubmenu?: boolean;
}

interface SubmenuItem {
  icon: React.ComponentType<{size?: number; className?: string}>;
  label: string;
}

interface SidebarViewProps {
  isMobile: boolean;
  isDashboardOpen: boolean;
  isCollapsed: boolean;
  isMobileMenuOpen: boolean;
  menuItems: MenuItem[];
  submenuItems: SubmenuItem[];
  messages: TestHistory[];
  isLoading: boolean;
  selectedMessageId: string | null;
  onToggleCollapse: () => void;
  onToggleMobileMenu: () => void;
  onDashboardClick: () => void;
  onMenuClick: (label: string) => void;
  onMessageClick: (id: string) => void;
  onRefreshHistory: () => void;
}

const SidebarView: React.FC<SidebarViewProps> = ({
  isMobile,
  isDashboardOpen,
  isCollapsed,
  isMobileMenuOpen,
  menuItems,
  submenuItems,
  messages,
  isLoading,
  selectedMessageId,
  onToggleCollapse,
  onToggleMobileMenu,
  onDashboardClick,
  onMenuClick,
  onMessageClick,
  onRefreshHistory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 1. Scroll reset saat collapse
  useEffect(() => {
    if (isCollapsed && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isCollapsed]);

  // 2. Kunci scroll body saat menu mobile terbuka
  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobile, isMobileMenuOpen]);

  // --- Variants Animasi ---
  const sidebarVariants = {
    expanded: { width: 320 },
    collapsed: { width: 80 }, // Lebar saat icon saja
  };
  
  const mobileSidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  const contentVariants = {
    expanded: { opacity: 1, width: 'auto', display: 'block' },
    collapsed: { opacity: 0, width: 0, display: 'none' },
  };

  const submenuVariants = {
    open: { opacity: 1, height: 'auto' },
    closed: { opacity: 0, height: 0 }
  };

  // --- Helper Severity ---
  const getSeverityDisplay = (severity: string) => {
    switch (severity) {
      case 'none': return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Normal' };
      case 'mild': return { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Mild' };
      case 'moderate': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Moderate' };
      case 'severe': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Severe' };
      default: return { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Unknown' };
    }
  };

  return (
    <>
      <style jsx global>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* --- TOMBOL MENU MOBILE (Hanya muncul di HP) --- */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <motion.button
          onClick={onToggleMobileMenu}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-200 text-gray-700"
          whileTap={{ scale: 0.9 }}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
      </div>

      {/* --- OVERLAY GELAP (Mobile) --- */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggleMobileMenu}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* --- SIDEBAR CONTAINER --- */}
      <motion.div
        className={`
          bg-white border-r border-gray-100 flex flex-col
          ${isMobile 
            ? 'fixed inset-y-0 left-0 z-50 h-full shadow-2xl w-[85%] max-w-[320px]' 
            : 'h-screen sticky top-0'
          } 
        `}
        initial={false}
        animate={
          isMobile 
            ? (isMobileMenuOpen ? 'open' : 'closed') 
            : (isCollapsed ? 'collapsed' : 'expanded')
        }
        variants={isMobile ? mobileSidebarVariants : sidebarVariants}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 min-h-[80px]">
          <motion.div
            className="flex items-center space-x-3 overflow-hidden"
            animate={!isMobile && isCollapsed ? 'collapsed' : 'expanded'}
            variants={contentVariants}
          >
            {/* Logo */}
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
              </div>
            </div>
            <div className="whitespace-nowrap">
              <h1 className="text-lg font-semibold text-gray-900">ColorVision</h1>
              <p className="text-xs text-gray-500">AI Testing</p>
            </div>
          </motion.div>

          {/* Tombol Collapse Desktop */}
          {!isMobile && (
            <motion.button
              onClick={onToggleCollapse}
              // Jika collapsed, tombol ditaruh di tengah container agar rapi
              className={`
                w-8 h-8 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-all border border-gray-200
                ${isCollapsed ? 'mx-auto' : ''}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </motion.button>
          )}

          {/* Tombol Close di dalam Sidebar (Mobile only) */}
          {isMobile && (
             <button onClick={onToggleMobileMenu} className="p-2 text-gray-400 hover:text-gray-600">
               <X size={20} />
             </button>
          )}
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4"
        >
          {/* MENU SECTION */}
          <div className="mb-8">
             <motion.div
                className="mb-4 overflow-hidden whitespace-nowrap px-2"
                animate={!isMobile && isCollapsed ? 'collapsed' : 'expanded'}
                variants={contentVariants}
              >
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Main Menu
                </h2>
            </motion.div>

            <nav className="space-y-2">
              {menuItems.map((item, index) => (
                <div key={index} className="relative">
                  <button
                    onClick={() => item.hasSubmenu ? onDashboardClick() : onMenuClick(item.label)}
                    className={`
                      w-full flex items-center transition-all duration-200 rounded-xl group relative overflow-hidden
                      ${(!isMobile && isCollapsed) 
                        ? 'justify-center p-3' // Center icon saat collapsed
                        : 'px-4 py-3 space-x-3' 
                      }
                      ${item.label === 'Dashboard' && isDashboardOpen 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                    title={isCollapsed ? item.label : ''} // Tooltip native saat hover icon
                  >
                    {/* ICON: flex-shrink-0 AGAR TIDAK MENGECIL */}
                    <item.icon 
                      size={22} 
                      className={`
                        flex-shrink-0
                        ${item.label === 'Dashboard' && isDashboardOpen ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                      `} 
                    />
                    
                    {/* TEXT LABEL */}
                    <motion.span
                      className="font-medium text-sm whitespace-nowrap"
                      animate={!isMobile && isCollapsed ? 'collapsed' : 'expanded'}
                      variants={contentVariants}
                    >
                      {item.label}
                    </motion.span>

                    {/* SUBMENU ARROW */}
                    {item.hasSubmenu && (!isCollapsed || isMobile) && (
                      <ChevronDown 
                        size={16} 
                        className={`ml-auto flex-shrink-0 transition-transform duration-200 ${isDashboardOpen ? 'rotate-180' : ''}`} 
                      />
                    )}
                  </button>

                  {/* SUBMENU LIST */}
                  <AnimatePresence>
                    {item.hasSubmenu && isDashboardOpen && (!isCollapsed || isMobile) && (
                      <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={submenuVariants}
                        className="overflow-hidden"
                      >
                        <div className="ml-11 mt-2 space-y-1 border-l-2 border-gray-100 pl-3">
                          {submenuItems.map((sub, idx) => (
                            <button
                              key={idx}
                              className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <span>{sub.label}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </div>

          {/* HISTORY SECTION */}
          <div className="mb-6">
            {/* Header History (Hidden saat collapsed) */}
            <div className={`flex items-center justify-between mb-4 px-2 ${(!isMobile && isCollapsed) ? 'hidden' : ''}`}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">History</h2>
              <button onClick={onRefreshHistory} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Konten History */}
            {(!isMobile && isCollapsed) ? (
               // Tampilan saat Collapsed: Hanya Icon Refresh
               <div className="flex justify-center py-4 border-t border-gray-100">
                 <button 
                  onClick={onRefreshHistory}
                  className="w-10 h-10 hover:bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh History"
                 >
                   <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                 </button>
               </div>
            ) : (
              // Tampilan Normal
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400">No history yet</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const style = getSeverityDisplay(msg.severity);
                    const Icon = style.icon;
                    return (
                      <button
                        key={msg.id}
                        onClick={() => onMessageClick(msg.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all border ${
                          selectedMessageId === msg.id 
                            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' 
                            : 'hover:bg-gray-50 border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon size={14} className={style.color} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{msg.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{Math.round(msg.accuracy)}% accuracy</p>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- FOOTER CTA --- */}
        <div className="p-4 border-t border-gray-100 bg-white">
           {(!isMobile && isCollapsed) ? (
             // Tombol Kecil (Collapsed)
             <button 
               onClick={() => router.push('/dashboard')} 
               className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
               title="New Test"
             >
               <Plus size={20} />
             </button>
           ) : (
             // Tombol Besar (Normal)
             <button 
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-colors shadow-blue-100 shadow-lg hover:shadow-xl translate-y-0"
             >
               <Plus size={18} />
               <span className="font-medium text-sm">New Test</span>
             </button>
           )}
        </div>
      </motion.div>
    </>
  );
};

export default SidebarView;