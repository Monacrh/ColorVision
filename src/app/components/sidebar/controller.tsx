'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  SquarePen,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
  PieChartIcon,
} from 'lucide-react';
import SidebarView from './page';
import { TestHistory } from '@/types/history';

const SidebarController = () => {
  // State Management
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State khusus untuk mobile menu
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const router = useRouter();

  // 1. Handle Responsive Check & Resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false); // Di mobile tidak ada konsep 'collapsed' mini, adanya buka/tutup penuh
      }
    };
    
    // Check on mount
    checkMobile();
    
    // Check on resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 2. Fetch Data
  useEffect(() => {
    const fetchTestHistory = async () => {
      try {
        setIsLoading(true);
        // Simulasi fetch atau ganti dengan endpoint aslimu
        const response = await fetch('/api/test-results?limit=20');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (data.success) setTestHistory(data.data);
      } catch (error) {
        console.error('Error:', error);
        // Optional: Set dummy data if fetch fails for UI testing
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestHistory();
  }, []);

  // Menu Config
  const menuItems = [
    { icon: SquarePen, label: 'New Test' },
    { icon: PieChartIcon, label: 'Analytics' },
    { icon: Settings, label: 'Settings' },
  ];

  const submenuItems = [
    { icon: Activity, label: 'Activity' },
    { icon: TrendingUp, label: 'Traffic' },
    { icon: BarChart3, label: 'Statistic' },
  ];

  // 3. Handlers
  const handleToggleCollapse = () => {
    if (isMobile) return;
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) setIsDashboardOpen(false);
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDashboardClick = () => {
    if (isCollapsed && !isMobile) {
      setIsCollapsed(false);
      setTimeout(() => setIsDashboardOpen(true), 50);
    } else {
      setIsDashboardOpen(!isDashboardOpen);
    }
  };

  const handleMessageClick = async (id: string) => {
    setSelectedMessageId(id);
    setIsMobileMenuOpen(false); // Tutup menu mobile jika item diklik
    router.push(`/results/${id}`);
  };

  const handleMenuClick = (label: string) => {
    setSelectedMessageId(null);
    setIsMobileMenuOpen(false); // Tutup menu mobile jika menu diklik

    switch (label) {
      case 'New Test': router.push('/dashboard'); break;
      case 'Analytics': router.push('/analytics'); break;
      case 'Settings': router.push('/settings'); break;
      default: break;
    }
  };

  const handleRefreshHistory = () => {
    // Logic refresh
    console.log("Refreshing...");
  };

  return (
    <SidebarView
      isMobile={isMobile}
      isDashboardOpen={isDashboardOpen}
      isCollapsed={isCollapsed}
      isMobileMenuOpen={isMobileMenuOpen}
      menuItems={menuItems}
      submenuItems={submenuItems}
      messages={testHistory}
      isLoading={isLoading}
      selectedMessageId={selectedMessageId}
      onToggleCollapse={handleToggleCollapse}
      onToggleMobileMenu={handleToggleMobileMenu}
      onDashboardClick={handleDashboardClick}
      onMenuClick={handleMenuClick}
      onMessageClick={handleMessageClick}
      onRefreshHistory={handleRefreshHistory}
    />
  );
};

export default SidebarController;