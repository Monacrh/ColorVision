'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  SquarePen,
  Library,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
} from 'lucide-react';
import SidebarView from './page';
import { TestHistory } from '@/types/history';

const SidebarController = () => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Static menu items
  const menuItems = [
    { icon: SquarePen, label: 'New Test' },
    { icon: Library, label: 'History' },
    { icon: Settings, label: 'Settings' },
  ];

  const submenuItems = [
    { icon: Activity, label: 'Activity' },
    { icon: TrendingUp, label: 'Traffic' },
    { icon: BarChart3, label: 'Statistic' },
  ];

  // Fetch test history on component mount
  useEffect(() => {
    fetchTestHistory();
  }, []);

  const fetchTestHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/test-results?limit=20');
      
      if (!response.ok) {
        throw new Error('Failed to fetch test history');
      }

      const data = await response.json();
      
      if (data.success) {
        setTestHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching test history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) setIsDashboardOpen(false);
  };

  const handleDashboardClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => setIsDashboardOpen(true), 50);
    } else {
      setIsDashboardOpen(!isDashboardOpen);
    }
  };

  const handleMessageClick = async (id: string) => {
    setSelectedMessageId(id);
    
    try {
      // Fetch detailed result
      const response = await fetch(`/api/test-results?id=${id}`);
      const data = await response.json();
      
      if (data.success) {
        // Navigate to results page with data
        router.push(`/results?id=${id}`);
      }
    } catch (error) {
      console.error('Error fetching test detail:', error);
    }
  };

  const handleMenuClick = (label: string) => {
    setSelectedMessageId(null);
  
    switch (label) {
      case 'New Test':
        router.push('/dashboard');
        break;
      case 'History':
        router.push('/history');
        break;
      case 'Settings':
        router.push('/settings');
        break;
      default:
        break;
    }
  };

  const handleRefreshHistory = () => {
    fetchTestHistory();
  };

  return (
    <SidebarView
      isDashboardOpen={isDashboardOpen}
      isCollapsed={isCollapsed}
      menuItems={menuItems}
      submenuItems={submenuItems}
      messages={testHistory}
      isLoading={isLoading}
      onToggleCollapse={handleToggleCollapse}
      onDashboardClick={handleDashboardClick}
      onMenuClick={handleMenuClick}
      onMessageClick={handleMessageClick}
      onRefreshHistory={handleRefreshHistory}
      selectedMessageId={selectedMessageId}
    />
  );
};

export default SidebarController;
