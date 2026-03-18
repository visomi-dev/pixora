import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

export type DocEntry = {
  body: string;
  description: string;
  href: string;
  isSection: boolean;
  parentSlug: string | null;
  slug: string;
  title: string;
  weight: number | null;
};

const docsRoot = resolveDocsRoot();

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  langPrefix: 'language-',
  highlight(code, language) {
    const escapedCode = escapeHtml(code);
    const escapedAttributeCode = escapeAttribute(code);
    const escapedLanguage = escapeHtml(language || 'text');

    return [
      '<div class="code-block-wrapper not-prose relative group my-6">',
      `<pre class="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100 dark:border-slate-800"><code class="language-${escapedLanguage}">${escapedCode}</code></pre>`,
      `<button class="copy-btn absolute top-2 right-2 rounded border px-3 py-1 text-xs transition-opacity opacity-0 group-hover:opacity-100" data-code="${escapedAttributeCode}">Copy</button>`,
      '</div>',
    ].join('');
  },
});

let cachedDocs: DocEntry[] | undefined;

export function getAllDocs(): DocEntry[] {
  cachedDocs ??= walkDirectory(docsRoot)
    .filter((filePath) => filePath.endsWith('.md'))
    .map(readDoc)
    .sort(compareDocs);

  return cachedDocs;
}

export function getDocBySlug(slug: string): DocEntry | undefined {
  const normalizedSlug = normalizeSlug(slug);

  return getAllDocs().find((entry) => entry.slug === normalizedSlug);
}

export function getSectionChildren(parentSlug: string): DocEntry[] {
  const normalizedParentSlug = normalizeSlug(parentSlug);

  return getAllDocs()
    .filter((entry) => entry.parentSlug === normalizedParentSlug)
    .sort(compareDocs);
}

export function renderDocBody(body: string, basePath: string): string {
  return markdown.render(replaceShortcodes(body, basePath));
}

export function withBasePath(basePath: string, targetPath: string): string {
  const normalizedBasePath = basePath === '/' ? '' : basePath.replace(/\/$/, '');
  const normalizedTargetPath = targetPath.replace(/^\//, '');

  return `${normalizedBasePath}/${normalizedTargetPath}`;
}

function compareDocs(left: DocEntry, right: DocEntry): number {
  const leftWeight = left.weight ?? Number.MAX_SAFE_INTEGER;
  const rightWeight = right.weight ?? Number.MAX_SAFE_INTEGER;

  if (leftWeight !== rightWeight) {
    return leftWeight - rightWeight;
  }

  return left.title.localeCompare(right.title);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('\n', '&#10;');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getSectionHref(slug: string): string {
  return slug ? `/docs/${slug}/` : '/docs/';
}

function getSpaceInvadersShowcaseHtml(basePath: string): string {
  const exampleHref = withBasePath(basePath, 'examples/space-invaders/');
  const quickStartHref = withBasePath(basePath, 'docs/getting-started/quick-start/');

  return `
<section class="my-8">
  <div class="rounded-3xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900">
    <p class="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Playable example</p>
    <h2 class="mb-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
      Space Invaders ships with the docs build.
    </h2>
    <p class="text-slate-600 dark:text-slate-400">
      This page embeds the exact production output that gets copied into the GitHub Pages artifact, so
      you can validate the declarative runtime and the documentation experience together.
    </p>
    <div class="mt-6 flex flex-wrap gap-4">
      <a
        href="${exampleHref}"
        class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white no-underline transition-colors hover:bg-blue-700"
      >
        Open standalone build
      </a>
      <a
        href="${quickStartHref}"
        class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-medium text-slate-900 no-underline transition-colors hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Read the quick start
      </a>
    </div>
  </div>

  <div class="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
    <iframe
      src="${exampleHref}"
      class="min-h-[26.25rem] w-full rounded-2xl border-0 bg-slate-950 md:min-h-[35rem]"
      title="Space Invaders demo built with Pixora"
      loading="lazy"
    ></iframe>
  </div>

  <div class="my-6 grid gap-4 md:grid-cols-3">
    <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
      <strong class="mb-1 block text-base font-semibold text-slate-900 dark:text-slate-100">Scenes</strong>
      <span class="text-slate-600 dark:text-slate-400">Main menu, instructions, gameplay, game over, and victory flows.</span>
    </div>
    <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
      <strong class="mb-1 block text-base font-semibold text-slate-900 dark:text-slate-100">Runtime primitives</strong>
      <span class="text-slate-600 dark:text-slate-400"><code>pixora()</code>, <code>pixora.scene()</code>, layout helpers, and reactive events.</span>
    </div>
    <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
      <strong class="mb-1 block text-base font-semibold text-slate-900 dark:text-slate-100">Deployment shape</strong>
      <span class="text-slate-600 dark:text-slate-400">The same Pages deploy publishes the docs shell and the standalone game output.</span>
    </div>
  </div>
</section>
  `.trim();
}

function normalizeSlug(slug: string): string {
  return slug.replace(/^\/+|\/+$/g, '');
}

function readDoc(filePath: string): DocEntry {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { content, data } = matter(fileContents);
  const relativePath = path.relative(docsRoot, filePath).replaceAll(path.sep, '/');
  const isSection = path.basename(relativePath) === '_index.md';
  const slug = isSection
    ? path.dirname(relativePath) === '.'
      ? ''
      : path.dirname(relativePath)
    : relativePath.slice(0, -'.md'.length);
  const parentSlug = getParentSlug(relativePath, isSection);

  return {
    body: content.trim(),
    description: typeof data.description === 'string' ? data.description : '',
    href: getSectionHref(slug),
    isSection,
    parentSlug,
    slug,
    title: typeof data.title === 'string' ? data.title : humanizeTitle(slug),
    weight: typeof data.weight === 'number' ? data.weight : null,
  };
}

function getParentSlug(relativePath: string, isSection: boolean): string | null {
  const currentDirectory = path.dirname(relativePath).replaceAll(path.sep, '/');

  if (isSection) {
    if (currentDirectory === '.') {
      return null;
    }

    const parentDirectory = path.dirname(currentDirectory).replaceAll(path.sep, '/');

    return parentDirectory === '.' ? '' : parentDirectory;
  }

  return currentDirectory === '.' ? '' : currentDirectory;
}

function humanizeTitle(slug: string): string {
  const lastSegment = slug.split('/').at(-1) || 'Documentation';

  return lastSegment
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function replaceShortcodes(content: string, basePath: string): string {
  return content.replaceAll('{{< space-invaders-showcase >}}', getSpaceInvadersShowcaseHtml(basePath));
}

function walkDirectory(directoryPath: string): string[] {
  return fs.readdirSync(directoryPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return walkDirectory(entryPath);
    }

    return entryPath;
  });
}

function resolveDocsRoot(): string {
  const candidatePaths = [
    path.resolve(process.cwd(), 'apps/docs/content/docs'),
    path.resolve(process.cwd(), 'content/docs'),
  ];

  const matchingPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));

  if (!matchingPath) {
    throw new Error('Unable to locate the documentation content directory.');
  }

  return matchingPath;
}
