const arxivService = require('../services/arxivService');
const aiSummaryService = require('../services/aiSummaryService');

/**
 * GET /api/research-papers/search?q=query&limit=10
 * Searches arXiv for papers matching the query.
 */
exports.searchPapers = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required.' });
    }
    const papers = await arxivService.searchPapers(q.trim(), parseInt(limit));
    res.status(200).json({ papers, total: papers.length, query: q });
  } catch (error) {
    console.error('[Research Paper Controller] Search error:', error.message);
    res.status(500).json({ message: 'Failed to search papers. Please try again.' });
  }
};

/**
 * POST /api/research-papers/summarize
 * Body: { title, abstract }
 * Generates an AI summary for the given paper.
 */
exports.summarizePaper = async (req, res) => {
  try {
    const { title, abstract } = req.body;
    if (!title || !abstract) {
      return res.status(400).json({ message: 'Paper title and abstract are required.' });
    }
    const result = await aiSummaryService.generateSummary(title, abstract);
    res.status(200).json({ summary: result.summary, provider: result.provider });
  } catch (error) {
    console.error('[Research Paper Controller] Summarize error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to generate summary.' });
  }
};
