export interface IshiharaPlate {
  id: number;
  image: string;
  normalAnswer: string | null;
  deficientAnswer: string | null;
  plateType: 'control' | 'number' | 'diagnostic' | 'hidden_number' | 'trace';
}

export interface TestAnswer {
  questionId: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeToAnswer: number;
}

export interface TestResult {
  conclusion: string;
  confidence: number;
  deficiencyType?: 'protanopia' | 'deuteranopia' | 'general' | 'none';
  severity?: 'mild' | 'moderate' | 'severe' | 'none';
  details: string[];
  correctAnswers: number;
  accuracy: number;
  recommendation: string;
}