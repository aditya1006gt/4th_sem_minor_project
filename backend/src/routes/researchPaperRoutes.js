const express = require('express');
const router = express.Router();
const { searchPapers, summarizePaper } = require('../controllers/researchPaperController');

// GET /api/research-papers/search?q=query&limit=10
router.get('/search', searchPapers);

// POST /api/research-papers/summarize
// Body: { title, abstract }
router.post('/summarize', summarizePaper);

module.exports = router;
