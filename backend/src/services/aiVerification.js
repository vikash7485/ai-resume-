const OpenAI = require("openai");

/**
 * AI Verification Service
 * Uses AI models to detect fraud, inconsistencies, and verify claims
 */
class AIVerificationService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
    
    this.model = process.env.OPENAI_MODEL || "gpt-4-turbo-preview";
  }

  /**
   * Analyze resume for fraud indicators and inconsistencies
   */
  async analyzeResume(resumeText, extractedEntities) {
    try {
      if (!this.openai) {
        console.warn("OpenAI API key not configured, using fallback analysis");
        return this.fallbackAnalysis(resumeText, extractedEntities);
      }

      const prompt = this.buildAnalysisPrompt(resumeText, extractedEntities);
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert resume verification analyst. Analyze resumes for fraud indicators, inconsistencies, and verify claims.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const analysisResult = JSON.parse(
        response.choices[0].message.content || "{}"
      );

      return this.processAnalysisResult(analysisResult, extractedEntities);
    } catch (error) {
      console.error("AI analysis error:", error);
      return this.fallbackAnalysis(resumeText, extractedEntities);
    }
  }

  /**
   * Build analysis prompt for AI
   */
  buildAnalysisPrompt(resumeText, entities) {
    return `
Analyze the following resume for fraud indicators and inconsistencies.

RESUME TEXT:
${resumeText.substring(0, 8000)}...

EXTRACTED ENTITIES:
- Universities: ${entities.universities.join(", ") || "None"}
- Degrees: ${entities.degrees.join(", ") || "None"}
- Employers: ${entities.employers.join(", ") || "None"}
- Dates: ${JSON.stringify(entities.dates)}

Provide a JSON response with the following structure:
{
  "inconsistencies": ["list of inconsistencies found"],
  "fraudIndicators": ["list of fraud indicators"],
  "warnings": ["list of warnings"],
  "timelineIssues": ["timeline problems"],
  "credibilityScore": 0-100,
  "recommendations": ["verification recommendations"]
}
`;
  }

  /**
   * Process AI analysis result
   */
  processAnalysisResult(aiResult, entities) {
    const flags = {
      inconsistencies: aiResult.inconsistencies || [],
      fraudIndicators: aiResult.fraudIndicators || [],
      warnings: aiResult.warnings || [],
      timelineIssues: aiResult.timelineIssues || [],
    };

    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(
      entities,
      flags
    );

    return {
      flags,
      credibilityScore: aiResult.credibilityScore || 75,
      consistencyScore,
      recommendations: aiResult.recommendations || [],
    };
  }

  /**
   * Fallback analysis when AI is unavailable
   */
  fallbackAnalysis(resumeText, entities) {
    const flags = {
      inconsistencies: [],
      fraudIndicators: [],
      warnings: [],
      timelineIssues: [],
    };

    // Basic checks
    if (entities.universities.length === 0) {
      flags.warnings.push("No universities found in resume");
    }

    if (entities.employers.length === 0) {
      flags.warnings.push("No employers found in resume");
    }

    // Timeline validation
    const timelineIssues = this.validateTimeline(entities.dates);
    flags.timelineIssues = timelineIssues;

    const consistencyScore = this.calculateConsistencyScore(entities, flags);

    return {
      flags,
      credibilityScore: 70,
      consistencyScore,
      recommendations: ["Manual verification recommended"],
    };
  }

  /**
   * Validate timeline consistency
   */
  validateTimeline(dates) {
    const issues = [];

    // Check education dates
    dates.education?.forEach((edu) => {
      if (edu.start && edu.end) {
        const start = parseInt(edu.start);
        const end = parseInt(edu.end);
        if (start >= end) {
          issues.push(`Invalid education dates: ${edu.start} to ${edu.end}`);
        }
      }
    });

    // Check employment dates
    dates.employment?.forEach((emp) => {
      if (emp.start && emp.end) {
        const start = parseInt(emp.start);
        const end = parseInt(emp.end);
        if (start >= end) {
          issues.push(`Invalid employment dates: ${emp.start} to ${emp.end}`);
        }
      }
    });

    return issues;
  }

  /**
   * Calculate consistency score (0-10)
   */
  calculateConsistencyScore(entities, flags) {
    let score = 10;

    // Deduct for inconsistencies
    score -= flags.inconsistencies.length * 2;
    score -= flags.fraudIndicators.length * 3;
    score -= flags.timelineIssues.length * 1;
    score -= flags.warnings.length * 0.5;

    // Ensure score is within bounds
    return Math.max(0, Math.min(10, score));
  }
}

module.exports = new AIVerificationService();

