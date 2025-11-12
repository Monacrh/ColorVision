// src/types/analytics.ts
export interface AnalyticsOverview {
  totalTests: number;
  avgAccuracy: number;
  completionRate: string;
  recommendationsGenerated: number;
}

export interface TrendData {
  date: string;
  count: number;
  [key: string]: string | number; // Allow additional properties for Recharts
}

export interface DistributionData {
  name: string;
  value: number;
  [key: string]: string | number; // Allow additional properties for Recharts
}

export interface AccuracyRangeData {
  range: string;
  count: number;
  [key: string]: string | number; // Allow additional properties for Recharts
}

export interface AccuracyStats {
  average: number;
  max: number;
  min: number;
}

export interface TimeBySevirity {
  severity: string;
  avgTime: number;
  count: number;
  [key: string]: string | number; // Allow additional properties for Recharts
}

export interface RecentTest {
  id: string;
  date: Date;
  diagnosis: string;
  severity: string;
  accuracy: number;
  deficiencyType: string;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  trends: {
    testsByDate: TrendData[];
  };
  distributions: {
    severity: DistributionData[];
    deficiencyType: DistributionData[];
    accuracyRanges: AccuracyRangeData[];
  };
  performance: {
    accuracyStats: AccuracyStats;
    timeBySevirity: TimeBySevirity[];
  };
  recentTests: RecentTest[];
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
  timestamp: string;
}