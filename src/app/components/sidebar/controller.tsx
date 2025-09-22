'use client';

import { useState } from 'react';
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

const SidebarController = () => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const router = useRouter();

  // Static data
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

  const messages = [
    { title: "HAPPY - Dec 15", id: "1" },
    { title: "SAD - Dec 14", id: "2" },
    { title: "ANGRY - Dec 13", id: "3" },
    { title: "NEUTRAL - Dec 12", id: "4" },
  ];

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

  const handleMessageClick = (id: string) => {
    setSelectedMessageId(id);
    router.push(`/dashboard?session=${id}`);
  };

  const handleMenuClick = (label: string) => {
    setSelectedMessageId(null);
  
    switch (label) {
      case 'Inventory':
        router.push('/inventory');
        break;
      case 'New Chat':
        router.push('/dashboard');
        break;
      default:
        break;
    }
  };

  return (
    <SidebarView
      isDashboardOpen={isDashboardOpen}
      isCollapsed={isCollapsed}
      menuItems={menuItems}
      submenuItems={submenuItems}
      messages={messages}
      onToggleCollapse={handleToggleCollapse}
      onDashboardClick={handleDashboardClick}
      onMenuClick={handleMenuClick}
      onMessageClick={handleMessageClick}
      selectedMessageId={selectedMessageId}
    />
  );
};

export default SidebarController;