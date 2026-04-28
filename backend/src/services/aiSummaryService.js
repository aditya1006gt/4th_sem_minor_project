const Groq = require('groq-sdk');
const { GoogleGenAI } = require('@google/genai');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SUMMARY_PROMPT = (title, abstract) => `
You are an expert academic researcher. Based on the following research paper, provide a clear and structured summary that is easy for a student to understand.

Paper Title: "${title}"
Abstract: "${abstract}"

Please provide:
1. **Overview**: A 2-3 sentence plain-language explanation of what this paper is about.
2. **Problem**: What specific problem is this paper trying to solve?
3. **Methodology**: How did the researchers approach solving the problem?
4. **Key Findings**: List the 5 most important results or contributions of this paper, each as a separate point.
5. **Limitations**: What are the known limitations or weaknesses of this research?
6. **Real-World Impact**: Why does this research matter? Who does it benefit?
7. **Future Work**: What follow-up research directions do the authors suggest?

Format your response clearly using the numbered sections above. Be thorough and detailed for each section.
`;

/**
 * Generates an AI summary using Groq (primary) with Gemini as fallback.
 * @param {string} title - The paper title.
 * @param {string} abstract - The paper abstract.
 * @returns {Promise<{summary: string, provider: string}>}
 */
exports.generateSummary = async (title, abstract) => {
  // --- Primary: Try Groq ---
  try {
    console.log('[AI Service] Attempting summarization via Groq...');
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: SUMMARY_PROMPT(title, abstract) }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 1800,
    });
    const summary = completion.choices[0]?.message?.content;
    console.log('[AI Service] ✅ Groq summarization successful.');
    return { summary, provider: 'Groq (Llama 3)' };
  } catch (groqError) {
    console.warn('[AI Service] ⚠️ Groq failed:', groqError.message);
    console.log('[AI Service] Falling back to Google Gemini...');
  }

  // --- Fallback: Try Gemini ---
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: SUMMARY_PROMPT(title, abstract),
    });
    const summary = response.text;
    console.log('[AI Service] ✅ Gemini fallback summarization successful.');
    return { summary, provider: 'Google Gemini' };
  } catch (geminiError) {
    console.error('[AI Service] ❌ Gemini fallback also failed:', geminiError.message);
    throw new Error('All AI summarization providers failed. Please try again later.');
  }
};
