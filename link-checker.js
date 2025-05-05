/**
 * AeroVista Link Checker
 * A simple script to validate links on the AeroVista website
 * Run with: node link-checker.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const rootDir = '.';
const reportFile = 'link-report.txt';
const extensions = ['.html'];
const ignoreLinks = [
  '#', 
  '#contact', 
  '#main-content', 
  'javascript:void(0)',
  'https://'  // Ignore external links in basic check
];

// Results storage
let allFiles = [];
let brokenLinks = [];
let missingFiles = [];
let report = '';

// Find all HTML files
function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      findHtmlFiles(filePath);
    } else if (extensions.includes(path.extname(file).toLowerCase())) {
      allFiles.push(filePath);
    }
  }
}

// Check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Normalize a link path
function normalizePath(link, basePath) {
  if (link.startsWith('#') || link.startsWith('http') || link.startsWith('mailto:')) {
    return link;
  }
  
  // Handle relative paths
  return path.normalize(path.join(path.dirname(basePath), link));
}

// Check links in a file
function checkLinks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(content);
  const links = dom.window.document.querySelectorAll('a');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    
    if (!href || ignoreLinks.some(ignore => href.startsWith(ignore))) {
      return;
    }
    
    const normalizedPath = normalizePath(href, filePath);
    
    if (href.startsWith('#')) {
      // Check if the ID exists in the document
      const id = href.substring(1);
      const element = dom.window.document.getElementById(id);
      
      if (!element) {
        brokenLinks.push({
          source: filePath,
          link: href,
          text: link.textContent.trim(),
          reason: `Anchor "${id}" not found in document`
        });
      }
    } else if (!href.startsWith('http') && !href.startsWith('mailto:')) {
      // Only check local files (not external URLs or mailto links)
      if (!fileExists(normalizedPath)) {
        // Check for case sensitivity issues
        const dir = path.dirname(normalizedPath);
        const base = path.basename(normalizedPath);
        
        try {
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            const matchingFile = files.find(f => f.toLowerCase() === base.toLowerCase());
            
            if (matchingFile && matchingFile !== base) {
              brokenLinks.push({
                source: filePath,
                link: href,
                text: link.textContent.trim(),
                reason: `Case sensitivity issue: "${base}" should be "${matchingFile}"`
              });
            } else if (!matchingFile) {
              missingFiles.push(normalizedPath);
              brokenLinks.push({
                source: filePath,
                link: href,
                text: link.textContent.trim(),
                reason: 'File not found'
              });
            }
          } else {
            missingFiles.push(normalizedPath);
            brokenLinks.push({
              source: filePath,
              link: href,
              text: link.textContent.trim(),
              reason: 'Directory not found'
            });
          }
        } catch (err) {
          brokenLinks.push({
            source: filePath,
            link: href,
            text: link.textContent.trim(),
            reason: `Error: ${err.message}`
          });
        }
      }
    }
  });
}

// Generate report
function generateReport() {
  report = `AeroVista Link Checker Report
Generated: ${new Date().toLocaleString()}
Total Files Checked: ${allFiles.length}
Total Broken Links: ${brokenLinks.length}
Total Missing Files: ${new Set(missingFiles).size}

=== BROKEN LINKS ===\n\n`;

  if (brokenLinks.length === 0) {
    report += 'No broken links found! 🎉\n';
  } else {
    brokenLinks.forEach(link => {
      report += `Source: ${link.source}\n`;
      report += `Link: ${link.link}\n`;
      report += `Text: ${link.text}\n`;
      report += `Reason: ${link.reason}\n\n`;
    });
  }
  
  fs.writeFileSync(reportFile, report);
  console.log(`Report generated: ${reportFile}`);
}

// Main function
function main() {
  console.log('Starting link checker...');
  findHtmlFiles(rootDir);
  console.log(`Found ${allFiles.length} HTML files.`);
  
  allFiles.forEach(file => {
    console.log(`Checking ${file}...`);
    checkLinks(file);
  });
  
  generateReport();
  
  if (brokenLinks.length > 0) {
    console.log(`Found ${brokenLinks.length} broken links across ${new Set(brokenLinks.map(link => link.source)).size} files.`);
    console.log(`Check ${reportFile} for details.`);
    process.exit(1);
  } else {
    console.log('All links are valid!');
    process.exit(0);
  }
}

main(); 