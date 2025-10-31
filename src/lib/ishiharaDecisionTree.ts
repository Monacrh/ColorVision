import { IshiharaPlate, TestAnswer, TestResult } from '@/types/ishihara';

export class IshiharaDecisionTree {
  private plates: IshiharaPlate[];
  
  constructor(plates: IshiharaPlate[]) {
    this.plates = plates;
  }

  analyzeResults(userAnswers: TestAnswer[]): TestResult {
    const details: string[] = [];
    
    // NODE 1: Check control plate
    const controlCheck = this.checkControl(userAnswers);
    if (!controlCheck.passed) {
      return {
        conclusion: "TEST INVALID",
        confidence: 0,
        deficiencyType: 'none',
        severity: 'none',
        details: ["❌ Failed to read control plate. Possible poor lighting or misunderstanding of instructions."],
        correctAnswers: 0,
        accuracy: 0,
        recommendation: "Please retake the test in good lighting conditions and ensure you understand the instructions."
      };
    }
    details.push("✓ Control plate read correctly");

    // NODE 2: Check standard plates (ID 2-7)
    const standardPlatesCheck = this.checkStandardPlates(userAnswers);
    details.push(`📊 Standard plates: ${standardPlatesCheck.normalCount} correct out of 6 plates`);
    
    // Calculate basic statistics
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / userAnswers.length) * 100;

    // NODE 3: Normal vision path (≥5 normal answers from standard plates)
    if (standardPlatesCheck.normalCount >= 5) {
      const confirmationCheck = this.checkConfirmationPlates(userAnswers);
      
      if (confirmationCheck.allNormalVisible && !confirmationCheck.hiddenVisible) {
        return {
          conclusion: "NORMAL COLOR VISION",
          confidence: 95,
          deficiencyType: 'none',
          severity: 'none',
          details: [
            ...details,
            "✓ All standard plates read perfectly",
            "✓ No color deficiency pattern detected",
            "✓ Unable to see hidden numbers (normal)"
          ],
          correctAnswers,
          accuracy,
          recommendation: "Your color vision is normal. No further testing required."
        };
      }
      
      // Possible mild deficiency
      details.push("⚠ Some inconsistencies detected");
    }

    // NODE 4: Deficiency path (≥4 deficient answers from standard plates)
    if (standardPlatesCheck.deficientCount >= 4) {
      details.push("⚠ Color deficiency pattern detected");
      
      // NODE 5: Determine deficiency type
      const diagnosticCheck = this.checkDiagnosticPlates(userAnswers);
      details.push(`🔍 ${diagnosticCheck.explanation}`);
      
      // NODE 6: Determine severity
      const visibilityCheck = this.checkVisibilityPlates(userAnswers);
      const severity = this.determineSeverity(visibilityCheck);
      details.push(`📈 Severity: ${severity.toUpperCase()} (${visibilityCheck.missedCount}/${visibilityCheck.totalPlates} plates missed)`);
      
      // NODE 7: Confirm with hidden plates
      const hiddenCheck = this.checkHiddenPlates(userAnswers);
      if (hiddenCheck.canSeeHidden) {
        details.push("⚠ Can see hidden numbers (confirms deficiency)");
      }
      
      const severityRecommendations = {
        mild: "Mild color deficiency detected. Consultation with a professional is recommended for further evaluation.",
        moderate: "Moderate color deficiency detected. It is strongly recommended to consult an eye care professional.",
        severe: "Significant color deficiency detected. Please consult an eye care professional immediately for comprehensive examination."
      };
      
      return {
        conclusion: "COLOR VISION DEFICIENCY DETECTED",
        confidence: 85,
        deficiencyType: diagnosticCheck.type,
        severity: severity,
        details,
        correctAnswers,
        accuracy,
        recommendation: severityRecommendations[severity]
      };
    }

    // NODE 8: Ambiguous/Borderline case
    const visibilityCheck = this.checkVisibilityPlates(userAnswers);
    
    if (visibilityCheck.missedCount >= 1 && visibilityCheck.missedCount <= 3) {
      details.push(`⚠ Some plates not read correctly (${visibilityCheck.missedCount}/${visibilityCheck.totalPlates})`);
      
      return {
        conclusion: "POSSIBLE MILD COLOR DEFICIENCY",
        confidence: 60,
        deficiencyType: 'general',
        severity: 'mild',
        details: [
          ...details,
          "📋 Results show inconsistent pattern",
          "💡 Possible mild deficiency or suboptimal testing conditions"
        ],
        correctAnswers,
        accuracy,
        recommendation: "It is recommended to retest or consult with a professional for more accurate evaluation."
      };
    }

    // DEFAULT: Inconclusive results
    return {
      conclusion: "INCONCLUSIVE RESULTS",
      confidence: 40,
      deficiencyType: 'none',
      severity: 'none',
      details: [
        ...details,
        "❓ Inconsistent answer pattern",
        "🔄 Recommend retaking the test"
      ],
      correctAnswers,
      accuracy,
      recommendation: "Results are inconclusive. Please retake the test in good lighting conditions with full concentration."
    };
  }

  // Helper Methods for Decision Tree Nodes
  
  private checkControl(answers: TestAnswer[]): { passed: boolean } {
    const controlAnswer = answers.find(a => a.questionId === 1);
    const controlPlate = this.plates.find(p => p.id === 1);
    
    return {
      passed: controlAnswer?.userAnswer === controlPlate?.normalAnswer
    };
  }

  private checkStandardPlates(answers: TestAnswer[]): {
    normalCount: number;
    deficientCount: number;
  } {
    const standardPlateIds = [2, 3, 4, 5, 6, 7];
    let normalCount = 0;
    let deficientCount = 0;

    for (const id of standardPlateIds) {
      const answer = answers.find(a => a.questionId === id);
      const plate = this.plates.find(p => p.id === id);
      
      if (answer && plate) {
        if (answer.userAnswer === plate.normalAnswer) {
          normalCount++;
        } else if (answer.userAnswer === plate.deficientAnswer) {
          deficientCount++;
        }
      }
    }

    return { normalCount, deficientCount };
  }

  private checkConfirmationPlates(answers: TestAnswer[]): {
    allNormalVisible: boolean;
    hiddenVisible: boolean;
  } {
    const visibilityPlateIds = [8, 9, 10, 11, 12, 13, 16, 17];
    const hiddenPlateIds = [19, 20, 21];
    
    let normalVisibleCount = 0;
    for (const id of visibilityPlateIds) {
      const answer = answers.find(a => a.questionId === id);
      const plate = this.plates.find(p => p.id === id);
      if (answer && plate && answer.userAnswer === plate.normalAnswer) {
        normalVisibleCount++;
      }
    }

    let hiddenVisibleCount = 0;
    for (const id of hiddenPlateIds) {
      const answer = answers.find(a => a.questionId === id);
      const plate = this.plates.find(p => p.id === id);
      if (answer && plate && answer.userAnswer === plate.deficientAnswer) {
        hiddenVisibleCount++;
      }
    }

    return {
      allNormalVisible: normalVisibleCount >= 6,
      hiddenVisible: hiddenVisibleCount > 0
    };
  }

  private checkDiagnosticPlates(answers: TestAnswer[]): {
    type: 'protanopia' | 'deuteranopia' | 'general';
    explanation: string;
  } {
    const plate14 = answers.find(a => a.questionId === 14);
    const plate15 = answers.find(a => a.questionId === 15);

    let protanopiaScore = 0;
    let deuteranopiaScore = 0;

    // Plate 14: Normal=26, Protanopia=6, Deuteranopia=2
    if (plate14?.userAnswer === '6') protanopiaScore++;
    if (plate14?.userAnswer === '2') deuteranopiaScore++;
    
    // Plate 15: Normal=42, Protanopia=2, Deuteranopia=4
    if (plate15?.userAnswer === '2') protanopiaScore++;
    if (plate15?.userAnswer === '4') deuteranopiaScore++;

    if (protanopiaScore > deuteranopiaScore) {
      return {
        type: 'protanopia',
        explanation: 'Protanopia detected (red deficiency)'
      };
    } else if (deuteranopiaScore > protanopiaScore) {
      return {
        type: 'deuteranopia',
        explanation: 'Deuteranopia detected (green deficiency)'
      };
    }

    return {
      type: 'general',
      explanation: 'General color deficiency (red-green)'
    };
  }

  private checkVisibilityPlates(answers: TestAnswer[]): {
    totalPlates: number;
    missedCount: number;
  } {
    const visibilityPlateIds = [8, 9, 10, 11, 12, 13, 16, 17];
    let missedCount = 0;

    for (const id of visibilityPlateIds) {
      const answer = answers.find(a => a.questionId === id);
      const plate = this.plates.find(p => p.id === id);
      
      if (!answer || !plate) continue;
      
      if (answer.userAnswer !== plate.normalAnswer) {
        missedCount++;
      }
    }

    return {
      totalPlates: visibilityPlateIds.length,
      missedCount
    };
  }

  private checkHiddenPlates(answers: TestAnswer[]): {
    canSeeHidden: boolean;
  } {
    const hiddenPlateIds = [19, 20, 21];
    let hiddenSeenCount = 0;

    for (const id of hiddenPlateIds) {
      const answer = answers.find(a => a.questionId === id);
      const plate = this.plates.find(p => p.id === id);
      
      if (answer && plate && answer.userAnswer === plate.deficientAnswer) {
        hiddenSeenCount++;
      }
    }

    return {
      canSeeHidden: hiddenSeenCount >= 2
    };
  }

  private determineSeverity(visibilityCheck: { totalPlates: number; missedCount: number }): 'mild' | 'moderate' | 'severe' {
    const missedPercentage = (visibilityCheck.missedCount / visibilityCheck.totalPlates) * 100;
    
    if (missedPercentage <= 30) return 'mild';
    if (missedPercentage <= 60) return 'moderate';
    return 'severe';
  }
}