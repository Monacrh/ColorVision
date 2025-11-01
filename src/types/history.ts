export interface TestHistory {
  id: string;
  title: string;
  date: Date;
  diagnosis: string;
  severity: 'mild' | 'moderate' | 'severe' | 'none';
  accuracy: number;
  deficiencyType: 'protanopia' | 'deuteranopia' | 'general' | 'none';
  confidence: number;
}