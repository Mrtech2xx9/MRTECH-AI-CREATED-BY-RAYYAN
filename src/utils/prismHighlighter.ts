import Prism from 'prismjs';

// Import essential & extended Prism language modules for multi-language support
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-git';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-powershell';

// Import Tomorrow Night theme for rich, high-contrast syntax highlighting
import 'prismjs/themes/prism-tomorrow.css';

export const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  node: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  py: 'python',
  python: 'python',
  python3: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  bash: 'bash',
  terminal: 'bash',
  cmd: 'bash',
  ps: 'powershell',
  powershell: 'powershell',
  posh: 'powershell',
  json: 'json',
  json5: 'json',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  md: 'markdown',
  markdown: 'markdown',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  markup: 'markup',
  css: 'css',
  scss: 'scss',
  sass: 'scss',
  sql: 'sql',
  mysql: 'sql',
  pgsql: 'sql',
  postgres: 'sql',
  postgresql: 'sql',
  sqlite: 'sql',
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',
  cs: 'csharp',
  csharp: 'csharp',
  'c#': 'csharp',
  java: 'java',
  rs: 'rust',
  rust: 'rust',
  golang: 'go',
  go: 'go',
  php: 'php',
  rb: 'ruby',
  ruby: 'ruby',
  swift: 'swift',
  kt: 'kotlin',
  kts: 'kotlin',
  kotlin: 'kotlin',
  dart: 'dart',
  flutter: 'dart',
  docker: 'docker',
  dockerfile: 'docker',
  graphql: 'graphql',
  gql: 'graphql',
  git: 'git',
  diff: 'diff',
};

export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'React JSX',
  tsx: 'React TSX',
  python: 'Python',
  json: 'JSON',
  bash: 'Bash / Shell',
  powershell: 'PowerShell',
  markup: 'HTML / XML',
  css: 'CSS',
  scss: 'SCSS',
  sql: 'SQL',
  yaml: 'YAML',
  toml: 'TOML',
  markdown: 'Markdown',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  java: 'Java',
  rust: 'Rust',
  go: 'Go',
  php: 'PHP',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  dart: 'Dart / Flutter',
  docker: 'Dockerfile',
  graphql: 'GraphQL',
  git: 'Git',
  diff: 'Diff',
  text: 'Plain Text',
};

/**
 * Intelligent heuristic algorithm to automatically detect code language
 * when code fence lacks a language tag (e.g. ``` without lang or with generic "code" / "text").
 */
export function autoDetectLanguage(code: string): { language: string; confidence: number } {
  const trimmed = code.trim();
  if (!trimmed) {
    return { language: 'text', confidence: 0 };
  }

  // 1. JSON
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      JSON.parse(trimmed);
      return { language: 'json', confidence: 0.95 };
    } catch {
      // Might be relaxed JSON or JS object
      if (/^\{\s*"[a-zA-Z0-9_-]+"\s*:/m.test(trimmed)) {
        return { language: 'json', confidence: 0.85 };
      }
    }
  }

  // 2. HTML / XML / SVG
  if (
    /^<!DOCTYPE\s+html/i.test(trimmed) ||
    /^<html[\s>]/i.test(trimmed) ||
    /<\?xml[\s>]/i.test(trimmed) ||
    /<\/?[a-z][\w-]*(\s+[^>]*)?>[\s\S]*<\/[a-z][\w-]*>/i.test(trimmed) ||
    /^<svg[\s>]/i.test(trimmed)
  ) {
    return { language: 'markup', confidence: 0.9 };
  }

  // 3. Shell / Bash
  if (
    /^#!\s*\/bin\/(ba)?sh/m.test(trimmed) ||
    /^#!\s*\/usr\/bin\/env\s+(ba)?sh/m.test(trimmed) ||
    /^(npm|npx|pnpm|yarn|bun|git|docker|kubectl|curl|wget|sudo|chmod|chown|mkdir|export|brew)\s+/m.test(trimmed)
  ) {
    return { language: 'bash', confidence: 0.9 };
  }

  // 4. SQL
  if (
    /\b(SELECT\s+[\s\S]+?\s+FROM|INSERT\s+INTO\s+\w+|UPDATE\s+\w+\s+SET|DELETE\s+FROM\s+\w+|CREATE\s+TABLE\s+\w+|ALTER\s+TABLE\s+\w+|DROP\s+TABLE\s+\w+)\b/i.test(trimmed)
  ) {
    return { language: 'sql', confidence: 0.9 };
  }

  // 5. Python
  if (
    /\b(def\s+[a-zA-Z_]\w*\s*\(|class\s+[a-zA-Z_]\w*(\s*\(.*\))?\s*:|import\s+[a-zA-Z_]\w+|from\s+[a-zA-Z_]\w+\s+import|elif\s+.*:|print\s*\(|if\s+__name__\s*==\s*['"]__main__['"])\b/m.test(trimmed)
  ) {
    return { language: 'python', confidence: 0.9 };
  }

  // 6. Rust
  if (
    /\b(fn\s+main\s*\(|pub\s+fn\s+|let\s+mut\s+|impl\s+[A-Z]\w*|println!\s*\(|use\s+std::|match\s+\w+\s*\{)\b/m.test(trimmed)
  ) {
    return { language: 'rust', confidence: 0.9 };
  }

  // 7. Go
  if (
    /\b(package\s+main|func\s+main\s*\(|func\s+\(?[a-zA-Z_]\w*\)?\s+[a-zA-Z_]\w*|fmt\.Print|import\s*\()\b/m.test(trimmed)
  ) {
    return { language: 'go', confidence: 0.9 };
  }

  // 8. C / C++
  if (
    /#include\s+[<"][a-zA-Z0-9_./]+[>"]|\bint\s+main\s*\(|std::cout|std::cin|printf\s*\(|cout\s*<</.test(trimmed)
  ) {
    return { language: 'cpp', confidence: 0.85 };
  }

  // 9. Java / C#
  if (
    /\b(public\s+static\s+void\s+main|System\.out\.println|import\s+java\.|@Override)\b/m.test(trimmed)
  ) {
    return { language: 'java', confidence: 0.9 };
  }
  if (
    /\b(using\s+System;|namespace\s+[A-Z]\w*|Console\.WriteLine|public\s+async\s+Task)\b/m.test(trimmed)
  ) {
    return { language: 'csharp', confidence: 0.9 };
  }

  // 10. PHP
  if (/<\?php|\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/.test(trimmed)) {
    return { language: 'php', confidence: 0.85 };
  }

  // 11. CSS / SCSS
  if (
    /[a-zA-Z0-9#._-]+\s*\{\s*(display|color|margin|padding|background|font-size|border|border-radius|box-shadow|align-items|justify-content)\s*:/i.test(trimmed)
  ) {
    return { language: 'css', confidence: 0.85 };
  }

  // 12. React JSX / TSX
  if (
    /\b(import\s+React|useState\s*\(|useEffect\s*\(|<[A-Z][a-zA-Z0-9]+\s+[^>]*>|<\/[A-Z][a-zA-Z0-9]+>)\b/.test(trimmed)
  ) {
    return { language: 'tsx', confidence: 0.85 };
  }

  // 13. TypeScript
  if (
    /\b(interface\s+[A-Z]\w*|type\s+[A-Z]\w*\s*=|:\s*(string|number|boolean|any|unknown|never)\[\]|as\s+const|:\s*Promise<)\b/m.test(trimmed)
  ) {
    return { language: 'typescript', confidence: 0.85 };
  }

  // 14. JavaScript
  if (
    /\b(const\s+[a-zA-Z_]\w*\s*=|let\s+[a-zA-Z_]\w*\s*=|function\s+[a-zA-Z_]\w*\s*\(|console\.(log|error|warn)\(|export\s+default|async\s+function|=>\s*\{)\b/m.test(trimmed)
  ) {
    return { language: 'javascript', confidence: 0.8 };
  }

  // 15. YAML / TOML
  if (/^[a-zA-Z0-9_-]+:\s+[a-zA-Z0-9_"\s-]/m.test(trimmed) && !trimmed.includes('{')) {
    return { language: 'yaml', confidence: 0.75 };
  }

  // 16. Markdown
  if (/^(#{1,6}\s+.+|\s*-\s+\[[ x]\]|\*\*.*\*\*|__.*__)/m.test(trimmed)) {
    return { language: 'markdown', confidence: 0.7 };
  }

  // 17. Dockerfile
  if (/^(FROM|RUN|COPY|ADD|WORKDIR|ENTRYPOINT|CMD|EXPOSE|ENV)\s+[A-Z0-9_./]/m.test(trimmed)) {
    return { language: 'docker', confidence: 0.85 };
  }

  return { language: 'text', confidence: 0 };
}

export interface HighlightResult {
  html: string;
  language: string;
  displayName: string;
  isAutoDetected: boolean;
  lineCount: number;
}

/**
 * Highlights a code snippet with Prism.js.
 * Automatically resolves language aliases or auto-detects language when missing/generic.
 */
export function highlightCode(code: string, language?: string): string {
  const result = highlightCodeDetailed(code, language);
  return result.html;
}

/**
 * Comprehensive code highlight with full language auto-detection,
 * display naming, and line count metadata.
 */
export function highlightCodeDetailed(code: string, language?: string): HighlightResult {
  if (!code) {
    return {
      html: '',
      language: 'text',
      displayName: 'Plain Text',
      isAutoDetected: false,
      lineCount: 0,
    };
  }

  const rawLang = (language || '').toLowerCase().trim();
  let normalizedLang = LANGUAGE_ALIASES[rawLang] || rawLang;
  let isAutoDetected = false;

  // If language is missing, generic ('code', 'text', 'unknown', ''), or unrecognized:
  const isGeneric = !normalizedLang || normalizedLang === 'code' || normalizedLang === 'text' || normalizedLang === 'unknown';
  if (isGeneric || !Prism.languages[normalizedLang]) {
    const detected = autoDetectLanguage(code);
    if (detected.language && detected.language !== 'text') {
      normalizedLang = detected.language;
      isAutoDetected = true;
    } else if (isGeneric) {
      normalizedLang = 'text';
    }
  }

  const displayName = LANGUAGE_DISPLAY_NAMES[normalizedLang] || (normalizedLang ? normalizedLang.toUpperCase() : 'Code');
  const lineCount = code.split('\n').length;

  const grammar = Prism.languages[normalizedLang] || (normalizedLang !== 'text' ? Prism.languages.javascript : null);

  if (grammar) {
    try {
      const highlighted = Prism.highlight(code, grammar, normalizedLang);
      return {
        html: highlighted,
        language: normalizedLang,
        displayName,
        isAutoDetected,
        lineCount,
      };
    } catch (err) {
      console.warn('[Prism] Highlight error:', err);
    }
  }

  // Safe HTML escape fallback
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  return {
    html: escaped,
    language: normalizedLang || 'text',
    displayName,
    isAutoDetected,
    lineCount,
  };
}

