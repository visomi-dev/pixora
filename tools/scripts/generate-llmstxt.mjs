import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.resolve(__dirname, '../../');
const docsContentDir = path.join(workspaceRoot, 'apps/docs/content/docs');
const outputDir = path.join(workspaceRoot, 'libs/pixora');
const readmePath = path.join(workspaceRoot, 'libs/pixora/README.md');

// Simple regex to match frontmatter between --- and ---
const frontmatterRegex = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;

function readAndCleanMarkdown(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: File not found - ${filePath}`);
    return '';
  }
  let content = fs.readFileSync(filePath, 'utf-8');
  // Remove frontmatter
  return content.replace(frontmatterRegex, '').trim();
}

function scanDocsDir(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDocsDir(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function generate() {
  console.log('Generating LLM documentation files...');

  // 1. Generate llms-full.txt
  let fullContent = `# Pixora - Full Documentation\n\n`;

  // Add README first as an overview
  const readmeContent = readAndCleanMarkdown(readmePath);
  if (readmeContent) {
    fullContent += `## README Overview\n\n${readmeContent}\n\n---\n\n`;
  }

  // Find all doc files
  const docFiles = scanDocsDir(docsContentDir);

  // Sort files logically: getting-started, api, examples, guides, etc.
  const order = ['getting-started', 'api', 'examples', 'guides'];
  docFiles.sort((a, b) => {
    const aRelative = path.relative(docsContentDir, a);
    const bRelative = path.relative(docsContentDir, b);

    const aCategory = order.findIndex((c) => aRelative.startsWith(c));
    const bCategory = order.findIndex((c) => bRelative.startsWith(c));

    if (aCategory !== bCategory) {
      // If one is not in the order list, put it at the end
      if (aCategory === -1) return 1;
      if (bCategory === -1) return -1;
      return aCategory - bCategory;
    }

    // Sort _index.md first within a category
    if (a.endsWith('_index.md')) return -1;
    if (b.endsWith('_index.md')) return 1;

    return a.localeCompare(b);
  });

  for (const file of docFiles) {
    const relativePath = path.relative(docsContentDir, file);
    const sectionName = relativePath.replace(/\\/g, '/').replace('.md', '');
    const content = readAndCleanMarkdown(file);

    if (content) {
      fullContent += `## Section: ${sectionName}\n\n${content}\n\n---\n\n`;
    }
  }

  const fullOutputPath = path.join(outputDir, 'llms-full.txt');
  fs.writeFileSync(fullOutputPath, fullContent.trim() + '\n');
  console.log(`Created: ${fullOutputPath}`);

  // 2. Generate llms.txt (index)
  const llmsContent = `# Pixora AI Documentation

Pixora is a lightweight reactive 2D game framework built on PixiJS.

## Full Documentation

The complete, context-rich documentation for LLMs and AI agents is available at:
[llms-full.txt](./llms-full.txt)

This file contains the complete API reference, getting started guides, examples, and architecture overview of Pixora.
`;

  const llmsOutputPath = path.join(outputDir, 'llms.txt');
  fs.writeFileSync(llmsOutputPath, llmsContent);
  console.log(`Created: ${llmsOutputPath}`);
}

generate().catch(console.error);
