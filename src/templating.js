/**
 * AeroVista Templating System
 * A simple templating system using Mustache.js to generate HTML pages from templates
 */

const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');

// Template paths
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const HEADER_TEMPLATE = fs.readFileSync(path.join(TEMPLATES_DIR, 'header.html'), 'utf-8');
const FOOTER_TEMPLATE = fs.readFileSync(path.join(TEMPLATES_DIR, 'footer.html'), 'utf-8');

// Cache templates for performance
const templateCache = {
  header: HEADER_TEMPLATE,
  footer: FOOTER_TEMPLATE
};

/**
 * Load a template from the templates directory
 * @param {string} templateName - The name of the template (without .html extension)
 * @returns {string} The template content
 */
function loadTemplate(templateName) {
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }
  
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template ${templateName} not found`);
  }
  
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  templateCache[templateName] = templateContent;
  return templateContent;
}

/**
 * Register partials for use in templates
 * @returns {Object} An object with partial templates
 */
function registerPartials() {
  return {
    header: HEADER_TEMPLATE,
    footer: FOOTER_TEMPLATE
  };
}

/**
 * Render a template with data
 * @param {string} templateName - The name of the template (without .html extension)
 * @param {Object} data - The data to render the template with
 * @returns {string} The rendered HTML
 */
function renderTemplate(templateName, data) {
  const template = loadTemplate(templateName);
  const partials = registerPartials();
  return Mustache.render(template, data, partials);
}

/**
 * Generate a page from a template and write it to file
 * @param {string} templateName - The name of the template (without .html extension)
 * @param {Object} data - The data to render the template with
 * @param {string} outputPath - The path to write the output to
 */
function generatePage(templateName, data, outputPath) {
  const renderedHtml = renderTemplate(templateName, data);
  
  // Ensure the output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, renderedHtml);
  console.log(`Generated ${outputPath}`);
}

/**
 * Generate multiple pages from the same template
 * @param {string} templateName - The name of the template (without .html extension)
 * @param {Array<Object>} dataItems - Array of data objects for each page
 * @param {Function} getOutputPath - Function that takes a data item and returns the output path
 */
function generatePages(templateName, dataItems, getOutputPath) {
  dataItems.forEach(data => {
    const outputPath = getOutputPath(data);
    generatePage(templateName, data, outputPath);
  });
}

module.exports = {
  renderTemplate,
  generatePage,
  generatePages,
  loadTemplate
}; 