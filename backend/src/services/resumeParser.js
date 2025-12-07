const pdf = require("pdf-parse");
const crypto = require("crypto");

/**
 * Resume Parser Service
 * Extracts entities and information from resume documents
 */
class ResumeParser {
  constructor() {
    this.supportedFormats = ["application/pdf", "text/plain"];
  }

  /**
   * Parse resume document
   */
  async parseResume(fileBuffer, mimeType) {
    try {
      let text = "";
      
      if (mimeType === "application/pdf") {
        const data = await pdf(fileBuffer);
        text = data.text;
      } else if (mimeType === "text/plain") {
        text = fileBuffer.toString("utf-8");
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }

      // Generate hash
      const hash = this.generateHash(fileBuffer);

      // Extract entities using pattern matching (can be enhanced with AI)
      const entities = this.extractEntities(text);

      return {
        text,
        hash,
        entities,
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
      };
    } catch (error) {
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  /**
   * Generate SHA-256 hash of document
   */
  generateHash(buffer) {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  /**
   * Extract entities from resume text
   */
  extractEntities(text) {
    const entities = {
      universities: [],
      degrees: [],
      employers: [],
      dates: {
        education: [],
        employment: [],
      },
      skills: [],
      certifications: [],
    };

    // Extract universities (pattern matching)
    const universityPatterns = [
      /University of [A-Z][a-z]+/g,
      /[A-Z][a-z]+ University/g,
      /[A-Z][a-z]+ College/g,
      /[A-Z][a-z]+ Institute/g,
    ];
    
    universityPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        entities.universities.push(...matches);
      }
    });

    // Extract degrees
    const degreePatterns = [
      /Bachelor of (?:Science|Arts|Engineering) in [A-Z][a-z]+/gi,
      /Master of (?:Science|Arts|Business Administration|Engineering)/gi,
      /Ph\.?D\.?/gi,
      /Doctor of Philosophy/gi,
    ];
    
    degreePatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        entities.degrees.push(...matches);
      }
    });

    // Extract dates
    const datePattern = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b|\b\d{1,2}\/\d{4}\b|\b\d{4}\b/gi;
    const dates = text.match(datePattern) || [];

    // Extract employers (simplified - would use NLP in production)
    const employerPatterns = [
      /at ([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Ltd|Company))/g,
      /([A-Z][a-zA-Z\s&]+(?:Technologies|Systems|Solutions|Group))/g,
    ];

    employerPatterns.forEach((pattern) => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach((match) => {
        if (match[1]) entities.employers.push(match[1].trim());
      });
    });

    // Extract skills (common keywords)
    const skillKeywords = [
      "JavaScript", "Python", "Java", "React", "Node.js",
      "Blockchain", "Solidity", "Web3", "AI", "Machine Learning",
    ];
    
    entities.skills = skillKeywords.filter((skill) =>
      new RegExp(`\\b${skill}\\b`, "i").test(text)
    );

    // Remove duplicates
    entities.universities = [...new Set(entities.universities)];
    entities.degrees = [...new Set(entities.degrees)];
    entities.employers = [...new Set(entities.employers)];

    return entities;
  }

  /**
   * Validate resume format
   */
  validateFormat(mimeType) {
    return this.supportedFormats.includes(mimeType);
  }
}

module.exports = new ResumeParser();

