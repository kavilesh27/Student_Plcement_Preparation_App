const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class ResumeParser {
  /**
   * Extract readable text from uploaded resume
   * @param {Object} file - Multer file object
   */
  async extractText(file) {
    if (!file || !file.path) {
      throw new Error('No resume file provided');
    }

    const filePath = file.path;
    const mimeType = file.mimetype || '';
    const ext = path.extname(file.originalname).toLowerCase();

    try {
      if (mimeType.includes('pdf') || ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return this.cleanText(data.text);
      }

      if (mimeType.includes('word') || mimeType.includes('officedocument') || ext === '.docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        return this.cleanText(result.value);
      }

      if (mimeType.includes('text') || ext === '.txt') {
        const raw = fs.readFileSync(filePath, 'utf8');
        return this.cleanText(raw);
      }

      throw new Error(`Unsupported file type: ${ext}. Please upload a PDF or DOCX file.`);
    } catch (err) {
      console.error('[ResumeParser] Error extracting text:', err.message);
      throw new Error(`Failed to extract text from resume: ${err.message}`);
    }
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}

module.exports = new ResumeParser();
