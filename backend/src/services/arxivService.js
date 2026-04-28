const axios = require('axios');
const xml2js = require('xml2js');

/**
 * Searches the arXiv API for papers matching the query.
 * @param {string} query - The search query.
 * @param {number} maxResults - Maximum number of results to return.
 * @returns {Promise<Array>} Array of paper objects.
 */
exports.searchPapers = async (query, maxResults = 10) => {
  try {
    // Construct the arXiv API URL. 'all:' searches across all fields.
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;
    
    const response = await axios.get(url);
    const xmlData = response.data;
    
    // Parse the XML response from arXiv
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);
    
    // ArXiv returns a single entry as an object, multiple as an array, none as undefined.
    let entries = result.feed.entry;
    if (!entries) {
      return [];
    }
    if (!Array.isArray(entries)) {
      entries = [entries];
    }
    
    // Map to a cleaner format
    const papers = entries.map(entry => {
      // Authors can be an array or a single object
      let authors = entry.author;
      if (!Array.isArray(authors)) {
        authors = [authors];
      }
      const authorNames = authors.map(a => a.name);
      
      // Find the PDF link
      let pdfLink = null;
      let links = entry.link;
      if (!Array.isArray(links)) {
        links = [links];
      }
      const pdfLinkObj = links.find(l => l.$ && l.$.title === 'pdf');
      if (pdfLinkObj) {
        pdfLink = pdfLinkObj.$.href;
      } else {
        // Fallback: sometimes it's just rel='related' or rel='alternate'
        pdfLink = entry.id.replace('abs', 'pdf') + '.pdf';
      }

      return {
        id: entry.id,
        title: entry.title.replace(/\n/g, ' ').trim(),
        summary: entry.summary.replace(/\n/g, ' ').trim(),
        authors: authorNames,
        published: entry.published,
        pdfLink: pdfLink
      };
    });
    
    return papers;
  } catch (error) {
    console.error('Error fetching from arXiv:', error.message);
    throw new Error('Failed to fetch papers from arXiv.');
  }
};
