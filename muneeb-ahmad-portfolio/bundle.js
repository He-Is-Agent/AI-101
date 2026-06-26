import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const htmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error('dist/index.html not found! Build first.');
  process.exit(1);
}

let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

console.log('Inlining assets from dist/ directory...');

// Replace all CSS link tags
const cssRegex = /<link\s+[^>]*href=["']([^"']*\.css)["'][^>]*>/g;
htmlContent = htmlContent.replace(cssRegex, (match, relativePath) => {
  const cleanedPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  const diskPath = path.join(distDir, cleanedPath);
  if (fs.existsSync(diskPath)) {
    const cssContent = fs.readFileSync(diskPath, 'utf-8');
    console.log(`Successfully inlined CSS: ${relativePath}`);
    return `<style>${cssContent}</style>`;
  } else {
    console.warn(`CSS file not found at: ${diskPath}`);
    return match;
  }
});

// Extract JS scripts and remove them from head, then inject them right before </body>
const jsRegex = /<script\s+[^>]*src=["']([^"']*\.js)["'][^>]*><\/script>/g;
let inlinedJsContent = '';

htmlContent = htmlContent.replace(jsRegex, (match, relativePath) => {
  const cleanedPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  const diskPath = path.join(distDir, cleanedPath);
  if (fs.existsSync(diskPath)) {
    let jsContent = fs.readFileSync(diskPath, 'utf-8');
    // Escape `<script` and `</script` inside JS to prevent browser HTML parser from prematurely terminating or getting confused by inline script blocks
    jsContent = jsContent.replace(/<script/gi, '\\x3Cscript').replace(/<\/script/gi, '\\x3C/script');
    console.log(`Successfully read and escaped JS for inlining: ${relativePath}`);
    inlinedJsContent += `<script>${jsContent}</script>\n`;
    return ''; // Remove the script tag from its original location
  } else {
    console.warn(`JS file not found at: ${diskPath}`);
    return match;
  }
});

// Inject the inlined scripts right before the true closing </body> tag (using lastIndexOf to avoid minified JS matches)
if (inlinedJsContent) {
  const lastBodyIndex = htmlContent.lastIndexOf('</body>');
  if (lastBodyIndex !== -1) {
    htmlContent = htmlContent.substring(0, lastBodyIndex) + inlinedJsContent + htmlContent.substring(lastBodyIndex);
  } else {
    htmlContent = htmlContent + '\n' + inlinedJsContent;
  }
}

// Save back to dist/index.html
// Convert any remaining module script tags (like Vite's modulepreload polyfill) to regular scripts to avoid CORS issues on file:// protocol
htmlContent = htmlContent.replace(/<script\s+type=["']module["']>/g, '<script>');

// Remove any modulepreload link tags since everything is fully inlined
const preloadRegex = /<link\s+[^>]*rel=["']modulepreload["'][^>]*>/g;
htmlContent = htmlContent.replace(preloadRegex, '');

fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log('Successfully written standalone file to dist/index.html');

// Save a copy to the workspace root for direct download/export
fs.writeFileSync(path.resolve('standalone.html'), htmlContent, 'utf-8');
console.log('Successfully saved copy of standalone file to /standalone.html');
