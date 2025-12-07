/**
 * Fraud Detection Service
 * Analyzes resumes for fraud indicators using ML-based rules
 */
class FraudDetector {
  constructor() {
    this.fraudPatterns = this.initializeFraudPatterns();
  }

  /**
   * Initialize fraud detection patterns
   */
  initializeFraudPatterns() {
    return {
      suspiciousUniversities: [
        "University of Phoenix",
        "Diploma Mill",
        "Fake University",
      ],
      impossibleDates: {
        maxAge: 100,
        minGraduationYear: 1950,
        maxFutureYear: new Date().getFullYear() + 1,
      },
      suspiciousPatterns: [
        /all\s+[A-Z]/gi, // All capital letters
        /perfect\s+4\.0/gi,
        /CEO\s+at\s+age\s+\d{1,2}/gi,
      ],
    };
  }

  /**
   * Detect fraud indicators in resume
   */
  detectFraud(resumeText, entities, aiAnalysis) {
    const fraudIndicators = [];
    const warnings = [];

    // Check for suspicious universities
    entities.universities.forEach((university) => {
      if (this.fraudPatterns.suspiciousUniversities.some((sus) =>
        university.toLowerCase().includes(sus.toLowerCase())
      )) {
        fraudIndicators.push(`Suspicious university: ${university}`);
      }
    });

    // Check for impossible dates
    entities.dates.education.forEach((edu) => {
      if (edu.end) {
        const year = parseInt(edu.end);
        if (
          year < this.fraudPatterns.impossibleDates.minGraduationYear ||
          year > this.fraudPatterns.impossibleDates.maxFutureYear
        ) {
          fraudIndicators.push(`Impossible graduation year: ${year}`);
        }
      }
    });

    // Check for suspicious patterns in text
    this.fraudPatterns.suspiciousPatterns.forEach((pattern) => {
      const matches = resumeText.match(pattern);
      if (matches) {
        warnings.push(`Suspicious pattern detected: ${pattern}`);
      }
    });

    // Check timeline consistency
    const timelineIssues = this.checkTimelineConsistency(entities.dates);
    fraudIndicators.push(...timelineIssues);

    // Check for AI analysis fraud indicators
    if (aiAnalysis && aiAnalysis.fraudIndicators) {
      fraudIndicators.push(...aiAnalysis.fraudIndicators);
    }

    return {
      fraudIndicators: [...new Set(fraudIndicators)],
      warnings: [...new Set(warnings)],
      riskLevel: this.calculateRiskLevel(fraudIndicators, warnings),
    };
  }

  /**
   * Check timeline consistency
   */
  checkTimelineConsistency(dates) {
    const issues = [];

    // Check education timeline
    dates.education?.forEach((edu, index) => {
      if (index > 0) {
        const prevEdu = dates.education[index - 1];
        if (prevEdu.end && edu.start) {
          const prevEnd = parseInt(prevEdu.end);
          const currentStart = parseInt(edu.start);
          if (currentStart < prevEnd) {
            issues.push(
              `Overlapping education: ${prevEdu.institution} and ${edu.institution}`
            );
          }
        }
      }
    });

    // Check employment timeline
    dates.employment?.forEach((emp, index) => {
      if (index > 0) {
        const prevEmp = dates.employment[index - 1];
        if (prevEmp.end && emp.start) {
          const prevEnd = parseInt(prevEmp.end);
          const currentStart = parseInt(emp.start);
          if (currentStart < prevEnd) {
            issues.push(
              `Overlapping employment: ${prevEmp.employer} and ${emp.employer}`
            );
          }
        }
      }
    });

    // Check education-employment overlap
    dates.education?.forEach((edu) => {
      dates.employment?.forEach((emp) => {
        if (edu.end && emp.start) {
          const eduEnd = parseInt(edu.end);
          const empStart = parseInt(emp.start);
          // Allow some overlap (e.g., part-time work during studies)
          if (empStart < eduEnd - 2) {
            // More than 2 years before education ended
            issues.push(
              `Employment starts before education completed: ${emp.employer}`
            );
          }
        }
      });
    });

    return issues;
  }

  /**
   * Calculate risk level
   */
  calculateRiskLevel(fraudIndicators, warnings) {
    const totalIssues = fraudIndicators.length + warnings.length * 0.5;

    if (totalIssues >= 5) return "high";
    if (totalIssues >= 2) return "medium";
    if (totalIssues > 0) return "low";
    return "none";
  }

  /**
   * Generate fraud detection report
   */
  generateReport(fraudDetection, aiAnalysis, fdcResults) {
    return {
      fraudIndicators: fraudDetection.fraudIndicators,
      warnings: fraudDetection.warnings,
      riskLevel: fraudDetection.riskLevel,
      aiCredibilityScore: aiAnalysis?.credibilityScore || 0,
      fdcVerified: fdcResults?.verified || false,
      overallRisk: this.calculateOverallRisk(
        fraudDetection,
        aiAnalysis,
        fdcResults
      ),
    };
  }

  /**
   * Calculate overall risk score
   */
  calculateOverallRisk(fraudDetection, aiAnalysis, fdcResults) {
    let riskScore = 0;

    // Fraud indicators increase risk
    riskScore += fraudDetection.fraudIndicators.length * 20;
    riskScore += fraudDetection.warnings.length * 5;

    // Low AI credibility increases risk
    if (aiAnalysis) {
      riskScore += Math.max(0, 70 - aiAnalysis.credibilityScore);
    }

    // Unverified FDC increases risk
    if (!fdcResults?.verified) {
      riskScore += 15;
    }

    // Risk levels: 0-30 = low, 31-60 = medium, 61+ = high
    if (riskScore >= 60) return "high";
    if (riskScore >= 30) return "medium";
    return "low";
  }
}

module.exports = new FraudDetector();

