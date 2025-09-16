// Gemini AI Service for JobPal
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class GeminiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
  }

  async optimizeBullets(bullets, jobDescription, structureType = 'star') {
    if (!this.apiKey) {
      console.warn('Gemini API key not found, using mock responses');
      return this.getMockResponses(bullets, structureType);
    }

    try {
      const prompt = this.buildPrompt(bullets, jobDescription, structureType);
      
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        return this.parseGeminiResponse(text, bullets);
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to mock responses if API fails
      return this.getMockResponses(bullets, structureType);
    }
  }

  buildPrompt(bullets, jobDescription, structureType) {
    const formatInstructions = {
      star: "Use the STAR method (Situation, Task, Action, Result) with specific metrics and achievements.",
      xyz: "Use the XYZ format: 'Accomplished [X] by [Y] resulting in [Z]' with quantifiable outcomes.",
      standard: "Create professional, action-oriented bullets with quantifiable achievements and impact."
    };

    return `You are an expert resume writer. Please optimize these resume bullets for a job application.

JOB DESCRIPTION:
${jobDescription}

ORIGINAL BULLETS:
${bullets.map((bullet, i) => `${i + 1}. ${bullet}`).join('\n')}

INSTRUCTIONS:
- Format: ${formatInstructions[structureType]}
- Include specific metrics, percentages, and quantifiable achievements
- Use strong action verbs
- Align with the job requirements
- Each bullet should be 1-2 lines maximum
- Make them compelling and professional

IMPROVED BULLETS:`;
  }

  parseGeminiResponse(text, originalBullets) {
    // Parse the Gemini response and extract improved bullets
    const lines = text.split('\n').filter(line => line.trim());
    const bullets = [];
    
    for (const line of lines) {
      // Look for numbered lists, bullet points, or standalone sentences
      const cleaned = line.replace(/^\d+\.\s*/, '').replace(/^[•\-*]\s*/, '').trim();
      if (cleaned && cleaned.length > 20) { // Filter out short/incomplete responses
        bullets.push(cleaned);
      }
    }
    
    // Ensure we have at least as many bullets as input
    while (bullets.length < originalBullets.length) {
      bullets.push(`Enhanced: ${originalBullets[bullets.length]}`);
    }
    
    return bullets.slice(0, originalBullets.length);
  }

  getMockResponses(bullets, structureType) {
    // Enhanced mock responses as fallback
    const bulletImprovements = {
      "Managed a team of 5 developers": {
        star: "Situation: Leading a cross-functional development team in an agile environment, Task: Coordinate 5 developers across frontend and backend projects, Action: Implemented daily standups, code review processes, and mentorship programs, Result: Increased team velocity by 40% and reduced bug count by 60% over 6 months.",
        xyz: "Accomplished 40% increase in team productivity by leading 5 developers through agile methodologies and structured mentorship, resulting in 25% faster feature delivery and 60% reduction in production bugs.",
        standard: "Led and mentored a team of 5 developers, implementing agile practices and code review processes that increased productivity by 40% and reduced defects by 60%."
      },
      "Increased website traffic by 20%": {
        star: "Situation: Company website experiencing declining organic reach and user engagement, Task: Optimize SEO performance and user experience, Action: Implemented comprehensive SEO strategy, page speed optimization, and content restructuring, Result: Achieved 20% increase in organic traffic and 35% improvement in user engagement metrics.",
        xyz: "Accomplished 20% increase in website traffic by implementing comprehensive SEO optimization and UX improvements, resulting in 35% higher user engagement and 15% boost in conversion rates.",
        standard: "Optimized website performance through SEO implementation and UX enhancements, driving 20% increase in organic traffic and 35% improvement in user engagement."
      },
      "Implemented new CRM system": {
        star: "Situation: Legacy CRM causing data silos and inefficient customer management, Task: Research, select, and implement modern CRM solution, Action: Led system evaluation, data migration strategy, and comprehensive team training, Result: Reduced customer response time by 50% and improved data accuracy by 85%.",
        xyz: "Accomplished seamless CRM system implementation by leading vendor selection and change management process, resulting in 50% faster customer response times and 85% improvement in data accuracy.",
        standard: "Spearheaded CRM system implementation and migration, streamlining customer management processes and achieving 50% reduction in response times."
      }
    };

    return bullets.map(bullet => {
      const cleanBullet = bullet.trim();
      if (bulletImprovements[cleanBullet]) {
        return bulletImprovements[cleanBullet][structureType];
      }
      
      // Generate enhanced version for unknown bullets
      const fallbacks = {
        star: `Situation: In a professional work environment requiring ${cleanBullet.toLowerCase()}, Task: Execute strategic initiatives, Action: Implemented data-driven solutions and best practices, Result: Achieved measurable improvements in efficiency and organizational outcomes.`,
        xyz: `Accomplished enhanced operational performance by ${cleanBullet.toLowerCase()} through strategic implementation and process optimization, resulting in improved efficiency and stakeholder satisfaction.`,
        standard: `Successfully ${cleanBullet.toLowerCase()} through strategic planning and execution, delivering measurable improvements and contributing to organizational growth.`
      };
      
      return fallbacks[structureType] || cleanBullet;
    });
  }
}

export default new GeminiService();
