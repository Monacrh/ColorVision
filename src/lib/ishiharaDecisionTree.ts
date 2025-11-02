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
      
      if (confirmationCheck.allNormalVisible && !confirmationCheck.hasDeficiencyPattern) {
        return {
          conclusion: "NORMAL COLOR VISION",
          confidence: 95,
          deficiencyType: 'none',
          severity: 'none',
          details: [
            ...details,
            "✓ All standard plates read perfectly",
            "✓ No color deficiency pattern detected",
            "✓ Visibility plates read correctly"
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
      if (diagnosticCheck.type !== 'none') {
        details.push(`🔍 ${diagnosticCheck.explanation}`);
      }
      
      // NODE 6: Determine severity
      const visibilityCheck = this.checkVisibilityPlates(userAnswers);
      const severity = this.determineSeverity(visibilityCheck);
      details.push(`📈 Severity: ${severity.toUpperCase()} (${visibilityCheck.missedCount}/${visibilityCheck.totalPlates} plates missed)`);
      
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

    // NODE 7: Check for "Can't see" pattern (deficiency indicator)
    const cantSeeCheck = this.checkCantSeePattern(userAnswers);
    if (cantSeeCheck.cantSeeCount >= 3) {
      details.push(`⚠ Multiple "Can't see" responses detected (${cantSeeCheck.cantSeeCount} plates)`);
      
      const diagnosticCheck = this.checkDiagnosticPlates(userAnswers);
      const visibilityCheck = this.checkVisibilityPlates(userAnswers);
      const severity = this.determineSeverity(visibilityCheck);
      
      return {
        conclusion: "COLOR VISION DEFICIENCY DETECTED",
        confidence: 75,
        deficiencyType: diagnosticCheck.type,
        severity: severity,
        details: [
          ...details,
          "⚠ Unable to see numbers on multiple plates (deficiency indicator)",
          diagnosticCheck.type !== 'none' ? `🔍 ${diagnosticCheck.explanation}` : ''
        ].filter(Boolean),
        correctAnswers,
        accuracy,
        recommendation: "Significant difficulty reading color plates detected. Please consult an eye care professional for comprehensive evaluation."
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
    hasDeficiencyPattern: boolean;
  } {
    const visibilityPlateIds = [8, 9, 10, 11, 12, 13, 16, 17];
    
    let normalVisibleCount = 0;
    let deficiencyPatternCount = 0;

    for (const id of visibilityPlateIds) {
      const answer = answers.find(a => a.questionId === id);
      const plate = this.plates.find(p => p.id === id);
      
      if (answer && plate) {
        // Check if user saw the normal answer correctly
        if (answer.userAnswer === plate.normalAnswer) {
          normalVisibleCount++;
        } 
        // Check if user CANNOT see (indicates deficiency)
        // For plates where deficientAnswer is null, "Can't see" indicates deficiency
        else if (plate.deficientAnswer === null && 
                 (answer.userAnswer.toLowerCase().includes("can't see") || 
                  answer.userAnswer.toLowerCase() === "nothing" ||
                  answer.userAnswer.trim() === "")) {
          deficiencyPatternCount++;
        }
        // Check if user saw deficient answer (for plates with specific deficient values)
        else if (plate.deficientAnswer !== null && answer.userAnswer === plate.deficientAnswer) {
          deficiencyPatternCount++;
        }
      }
    }

    return {
      allNormalVisible: normalVisibleCount >= 6,
      hasDeficiencyPattern: deficiencyPatternCount >= 3
    };
  }

  private checkDiagnosticPlates(answers: TestAnswer[]): {
    type: 'protanopia' | 'deuteranopia' | 'general' | 'none';
    explanation: string;
  } {
    const plate14 = answers.find(a => a.questionId === 14);
    const plate15 = answers.find(a => a.questionId === 15);

    // If diagnostic plates weren't in the test, return none
    if (!plate14 && !plate15) {
      return {
        type: 'none',
        explanation: ''
      };
    }

    let protanopiaScore = 0;
    let deuteranopiaScore = 0;

    // Plate 14: Normal=26, Protanopia=6, Deuteranopia=2
    if (plate14?.userAnswer === '6') protanopiaScore++;
    if (plate14?.userAnswer === '2') deuteranopiaScore++;
    
    // Plate 15: Normal=42, Protanopia=2, Deuteranopia=4
    if (plate15?.userAnswer === '2') protanopiaScore++;
    if (plate15?.userAnswer === '4') deuteranopiaScore++;

    if (protanopiaScore > deuteranopiaScore && protanopiaScore > 0) {
      return {
        type: 'protanopia',
        explanation: 'Protanopia detected (red deficiency)'
      };
    } else if (deuteranopiaScore > protanopiaScore && deuteranopiaScore > 0) {
      return {
        type: 'deuteranopia',
        explanation: 'Deuteranopia detected (green deficiency)'
      };
    } else if (protanopiaScore === 0 && deuteranopiaScore === 0) {
      return {
        type: 'general',
        explanation: 'General color deficiency (red-green)'
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
    let totalTested = 0;

    for (const id of visibilityPlateIds) {
      const answer = answers.find(a => a.questionId === id);
      const plate = this.plates.find(p => p.id === id);
      
      if (!answer || !plate) continue;
      
      totalTested++;
      
      // If user didn't see the normal answer, count as missed
      if (answer.userAnswer !== plate.normalAnswer) {
        missedCount++;
      }
    }

    return {
      totalPlates: totalTested > 0 ? totalTested : visibilityPlateIds.length,
      missedCount
    };
  }

  // NEW METHOD: Check for "Can't see" pattern
  private checkCantSeePattern(answers: TestAnswer[]): {
    cantSeeCount: number;
    affectedPlates: number[];
  } {
    const cantSeeVariations = ["can't see", "cannot see", "can not see", "nothing", "none", ""];
    let cantSeeCount = 0;
    const affectedPlates: number[] = [];

    for (const answer of answers) {
      const normalizedAnswer = answer.userAnswer.toLowerCase().trim();
      
      // Check if answer indicates inability to see
      if (cantSeeVariations.some(variation => normalizedAnswer.includes(variation))) {
        cantSeeCount++;
        affectedPlates.push(answer.questionId);
      }
    }

    return {
      cantSeeCount,
      affectedPlates
    };
  }

  private determineSeverity(visibilityCheck: { totalPlates: number; missedCount: number }): 'mild' | 'moderate' | 'severe' {
    if (visibilityCheck.totalPlates === 0) return 'mild';
    
    const missedPercentage = (visibilityCheck.missedCount / visibilityCheck.totalPlates) * 100;
    
    if (missedPercentage <= 30) return 'mild';
    if (missedPercentage <= 60) return 'moderate';
    return 'severe';
  }
}