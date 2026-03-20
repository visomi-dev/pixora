#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { config } from 'dotenv';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The path to the generated llms-full.txt
const workspaceRoot = path.resolve(__dirname, '../../../');
const docsPath = path.join(workspaceRoot, 'libs/pixora/llms-full.txt');

// Initialize the MCP server
const server = new Server(
  {
    name: 'pixora-docs',
    version: '0.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

// Read docs safely
function getDocsContent() {
  if (fs.existsSync(docsPath)) {
    return fs.readFileSync(docsPath, 'utf-8');
  }
  return "Error: Pixora documentation file not found. Please run 'npm run generate-llmstxt' in the workspace root.";
}

// Register resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'pixora://docs/full',
        name: 'Pixora Full Documentation',
        description:
          'The complete, concatenated documentation for the Pixora game framework, including APIs, guides, and examples.',
        mimeType: 'text/plain',
      },
    ],
  };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === 'pixora://docs/full') {
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: 'text/plain',
          text: getDocsContent(),
        },
      ],
    };
  }

  throw new Error(`Resource not found: ${request.params.uri}`);
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_pixora_docs',
        description: 'Search the Pixora framework documentation for specific keywords or concepts.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: "The search query (e.g., 'Entity', 'Sprite', 'animation')",
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'search_pixora_docs') {
    const query = request.params.arguments?.query?.toString().toLowerCase();

    if (!query) {
      return {
        content: [{ type: 'text', text: 'Please provide a valid query string.' }],
        isError: true,
      };
    }

    const content = getDocsContent();
    const sections = content.split('## Section: ');

    const results = [];

    // Check main README overview
    if (sections[0].toLowerCase().includes(query)) {
      results.push('Overview / README section matches your query. Resource: pixora://docs/full');
    }

    // Check specific sections
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      const titleLine = section.split('\n')[0];

      if (section.toLowerCase().includes(query)) {
        // Extract a snippet around the match
        const index = section.toLowerCase().indexOf(query);
        const start = Math.max(0, index - 100);
        const end = Math.min(section.length, index + 200);
        const snippet = section.substring(start, end).trim();

        results.push(`--- Section: ${titleLine} ---\n...${snippet}...`);
      }
    }

    if (results.length === 0) {
      return {
        content: [
          { type: 'text', text: `No results found for '${query}'. Try reading the full docs at pixora://docs/full` },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Found ${results.length} matching sections:\n\n${results.slice(0, 5).join('\n\n')}\n\n(Showing max 5 snippets. Read pixora://docs/full for complete context.)`,
        },
      ],
    };
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

// Start the server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Pixora MCP Server running on stdio');
}

run().catch(console.error);
