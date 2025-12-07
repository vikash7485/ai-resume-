const OpenAI = require("openai");

/**
 * AI Verification Service
 * Uses OpenAI GPT-4 to detect fraud, inconsistencies, and verify claims
 * API key is stored securely in backend/.env and never exposed to frontend
 */
class AIVerificationService {
  constructor() {
    // Initialize OpenAI client only if API key is provided
    // API key is stored in backend/.env file (never in frontend!)
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ 
          apiKey: process.env.OPENAI_API_KEY,
          timeout: 60000, // 60 second timeout
        })
      : null;
    
    this.model = process.env.OPENAI_MODEL || "gpt-4-turbo-preview";
    this.isConfigured = !!this.openai;
  }

  /**
   * Analyze resume for fraud indicators and inconsistencies
   * This is called from backend only - API key never exposed to frontend
   */
  async analyzeResume(resumeText, extractedEntities) {
    try {
      if (!this.openai) {
        console.warn("OpenAI API key not configured, using fallback analysis");
        return this.fallbackAnalysis(resumeText, extractedEntities);
      }

      const prompt = this.buildAnalysisPrompt(resumeText, extractedEntities);
      
      console.log("🤖 Calling OpenAI API for resume analysis...");
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 2000,
        response_format: { type: "json_object" }, // Force JSON response
      });

      const content = response.choices[0]?.message?.content || "{}";
      let analysisResult;

      try {
        analysisResult = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError);
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          throw new Error("Invalid AI response format");
        }
      }

      console.log("✅ OpenAI analysis completed successfully");
      
      return this.processAnalysisResult(analysisResult, extractedEntities);
    } catch (error) {
      console.error("❌ AI analysis error:", error.message);
      // Fall back to basic analysis if OpenAI fails
      return this.fallbackAnalysis(resumeText, extractedEntities);
    }
  }

  /**
   * System prompt for OpenAI - defines the AI's role and behavior
   */
  getSystemPrompt() {
    return `You are an expert resume verification analyst specializing in detecting fraud, inconsistencies, and verifying credentials. Your task is to analyze resumes with extreme attention to detail.

Your analysis should identify:
1. **Fraud Indicators**: Impossible dates, fake universities, suspicious patterns
2. **Inconsistencies**: Contradictory information, mismatched dates, impossible achievements
3. **Timeline Issues**: Overlapping dates, impossible career progression, age-related inconsistencies
4. **Credibility Issues**: Unrealistic claims, suspicious patterns, red flags

You must be thorough but fair. Only flag genuine issues. Return your analysis as valid JSON only.`;
  }

  /**
   * Build comprehensive analysis prompt for AI
   */
  buildAnalysisPrompt(resumeText, entities) {
    // Limit resume text to avoid token limits (keep important parts)
    const resumePreview = resumeText.length > 12000 
      ? resumeText.substring(0, 10000) + "\n... [Content truncated for analysis]"
      : resumeText;

    return `Analyze the following resume for fraud indicators, inconsistencies, and verification issues.

=== RESUME TEXT ===
${resumePreview}

=== EXTRACTED ENTITIES ===
Universities: ${entities.universities.join(", ") || "None found"}
Degrees: ${entities.degrees.join(", ") || "None found"}
Employers: ${entities.employers.join(", ") || "None found"}
Education Dates: ${JSON.stringify(entities.dates.education || [])}
Employment Dates: ${JSON.stringify(entities.dates.employment || [])}
Skills: ${entities.skills.join(", ") || "None found"}

=== ANALYSIS REQUIREMENTS ===
Please provide a comprehensive JSON analysis with the following structure:

{
  "inconsistencies": ["specific inconsistencies found - be detailed"],
  "fraudIndicators": ["clear fraud indicators - be specific"],
  "warnings": ["warnings and concerns"],
  "timelineIssues": ["any timeline problems"],
  "credibilityScore": 0-100,
  "recommendations": ["verification recommendations"],
  "detailedFindings": {
    "educationIssues": ["education-related issues"],
    "employmentIssues": ["employment-related issues"],
    "identityIssues": ["identity/name consistency issues"],
    "otherIssues": ["any other concerns"]
  }
}

CRITICAL: Return ONLY valid JSON. No markdown, no explanation outside JSON. Be specific and detailed in your findings.`;
  }

  /**
   * Process AI analysis result and convert to standardized format
   */
  processAnalysisResult(aiResult, entities) {
    const flags = {
      inconsistencies: aiResult.inconsistencies || [],
      fraudIndicators: aiResult.fraudIndicators || [],
      warnings: aiResult.warnings || [],
      timelineIssues: aiResult.timelineIssues || [],
      detailedFindings: aiResult.detailedFindings || {},
    };

    // Calculate consistency score based on AI findings
    const consistencyScore = this.calculateConsistencyScore(entities, flags);

    // Use AI credibility score or calculate from findings
    let credibilityScore = aiResult.credibilityScore;
    if (!credibilityScore || credibilityScore < 0 || credibilityScore > 100) {
      // Calculate from issues found
      credibilityScore = this.calculateCredibilityScore(flags);
    }

    return {
      flags,
      credibilityScore: Math.max(0, Math.min(100, credibilityScore)),
      consistencyScore,
      recommendations: aiResult.recommendations || [],
      aiAnalysisUsed: true,
    };
  }

  /**
   * Calculate credibility score from AI findings
   */
  calculateCredibilityScore(flags) {
    let score = 100;
    
    // Deduct for serious issues
    score -= flags.fraudIndicators.length * 15;
    score -= flags.inconsistencies.length * 10;
    score -= flags.timelineIssues.length * 5;
    score -= flags.warnings.length * 2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Fallback analysis when AI is unavailable
   */
  fallbackAnalysis(resumeText, extractedEntities) {
    console.log("Using fallback analysis (no AI)");
    
    const flags = {
      inconsistencies: [],
      fraudIndicators: [],
      warnings: [],
      timelineIssues: [],
      detailedFindings: {},
    };

    // Basic checks
    if (extractedEntities.universities.length === 0) {
      flags.warnings.push("No universities found in resume");
    }

    if (extractedEntities.employers.length === 0) {
      flags.warnings.push("No employers found in resume");
    }

    // Timeline validation
    const timelineIssues = this.validateTimeline(extractedEntities.dates);
    flags.timelineIssues = timelineIssues;

    const consistencyScore = this.calculateConsistencyScore(extractedEntities, flags);

    return {
      flags,
      credibilityScore: 70,
      consistencyScore,
      recommendations: ["Manual verification recommended - AI analysis unavailable"],
      aiAnalysisUsed: false,
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
        if (isNaN(start) || isNaN(end)) return;
        
        if (start >= end) {
          issues.push(`Invalid education dates: ${edu.start} to ${edu.end}`);
        }
        if (end > new Date().getFullYear() + 1) {
          issues.push(`Future graduation year: ${edu.end}`);
        }
        if (start < 1950) {
          issues.push(`Suspiciously old education start date: ${edu.start}`);
        }
      }
    });

    // Check employment dates
    dates.employment?.forEach((emp) => {
      if (emp.start && emp.end) {
        const start = parseInt(emp.start);
        const end = parseInt(emp.end);
        if (isNaN(start) || isNaN(end)) return;
        
        if (start >= end) {
          issues.push(`Invalid employment dates: ${emp.start} to ${emp.end}`);
        }
        if (end > new Date().getFullYear() + 1) {
          issues.push(`Future employment end date: ${emp.end}`);
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

  /**
   * Check if OpenAI is configured
   */
  isAIConfigured() {
    return this.isConfigured;
  }
}

module.exports = new AIVerificationService();
