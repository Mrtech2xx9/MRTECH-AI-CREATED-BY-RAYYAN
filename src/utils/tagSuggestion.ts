/**
 * Real-Time Tag Suggestion & Content Analysis Engine
 * Analyzes document titles, content (Markdown/plain text/JSON), and category context
 * to generate high-confidence, domain-relevant tags in real-time.
 */

export interface TagSuggestion {
  tag: string;
  score: number; // 0 to 100 confidence
  source: 'title' | 'heading' | 'domain' | 'keyword' | 'category' | 'acronym';
  reasonLabel: string;
}

// Stop words to exclude from tag extraction
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
  'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
  'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re',
  'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who',
  'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re',
  'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'also', 'overview', 'details', 'notes', 'spec', 'data',
  'using', 'based', 'provide', 'provides', 'including', 'across', 'within', 'example', 'features', 'summary'
]);

// Domain dictionary mapping multi-word concepts, tech standards, and specialized topics
const DOMAIN_KNOWLEDGE_MAP: Record<string, { tag: string; category?: string; aliases?: string[] }[]> = {
  ai: [
    { tag: 'Large Language Models', aliases: ['llm', 'llms', 'large language model'] },
    { tag: 'Neural Networks', aliases: ['neural network', 'deep neural network'] },
    { tag: 'RAG Architecture', aliases: ['rag', 'retrieval-augmented', 'retrieval augmented'] },
    { tag: 'Vector Database', aliases: ['vector db', 'vector databases', 'chroma', 'pinecone', 'qdrant'] },
    { tag: 'Autonomous Agents', aliases: ['ai agent', 'agents', 'autonomous agent'] },
    { tag: 'Deep Learning', aliases: ['deep learning'] },
    { tag: 'Machine Learning', aliases: ['machine learning', 'ml model'] },
    { tag: 'Transformers', aliases: ['transformer architecture', 'attention mechanism'] },
    { tag: 'Computer Vision', aliases: ['computer vision', 'object detection'] },
    { tag: 'Natural Language Processing', aliases: ['nlp', 'natural language'] },
    { tag: 'Model Context Protocol', aliases: ['mcp', 'context protocol'] },
    { tag: 'Fine-Tuning', aliases: ['fine tuning', 'lora', 'peft'] },
    { tag: 'Prompt Engineering', aliases: ['prompt engineering', 'system prompt'] },
  ],
  web: [
    { tag: 'React 19', aliases: ['react 19', 'react', 'actions', 'useactionstate'] },
    { tag: 'Vite 6', aliases: ['vite 6', 'vite', 'environment api'] },
    { tag: 'Next.js', aliases: ['next.js', 'nextjs'] },
    { tag: 'TypeScript', aliases: ['typescript', 'ts'] },
    { tag: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss'] },
    { tag: 'Local-First', aliases: ['local first', 'local-first', 'crdt', 'crdts', 'yjs', 'automerge'] },
    { tag: 'WebSockets', aliases: ['websocket', 'websockets'] },
    { tag: 'WebAssembly', aliases: ['wasm', 'webassembly'] },
    { tag: 'PWA', aliases: ['progressive web app', 'pwa', 'service worker'] },
    { tag: 'Microservices', aliases: ['microservices', 'microservice'] },
    { tag: 'Serverless', aliases: ['serverless', 'lambda', 'edge function', 'edge functions'] },
  ],
  security: [
    { tag: 'Post-Quantum Cryptography', aliases: ['post quantum', 'pqc', 'post-quantum'] },
    { tag: 'NIST Standards', aliases: ['nist', 'fips 203', 'fips 204', 'fips 205'] },
    { tag: 'ML-KEM', aliases: ['ml-kem', 'kyber', 'crystals-kyber'] },
    { tag: 'ML-DSA', aliases: ['ml-dsa', 'dilithium', 'crystals-dilithium'] },
    { tag: 'Zero-Trust', aliases: ['zero trust', 'zero-trust'] },
    { tag: 'Cryptography', aliases: ['cryptography', 'cryptographic', 'encryption'] },
    { tag: 'TLS 1.3', aliases: ['tls 1.3', 'hybrid tls', 'x25519'] },
    { tag: 'OWASP', aliases: ['owasp', 'xss', 'csrf', 'sql injection'] },
  ],
  hardware: [
    { tag: 'Semiconductor', aliases: ['semiconductor', 'foundry', 'tsmc', 'asml'] },
    { tag: 'Silicon Architecture', aliases: ['silicon', 'transistor', 'gaafet', 'nanosheet'] },
    { tag: '2nm Process', aliases: ['2nm', 'n2', '18a', 'intel 18a', 'high-na euv'] },
    { tag: 'RISC-V', aliases: ['risc-v', 'riscv'] },
    { tag: 'PCIe 6.0', aliases: ['pcie 6.0', 'pcie 7.0', 'pam4', 'flit mode'] },
    { tag: 'Quantum Computing', aliases: ['quantum computer', 'quantum computing', 'qubits'] },
    { tag: 'GPU & TPU', aliases: ['gpu', 'tpu', 'npu', 'tensor core'] },
  ],
  kerala: [
    { tag: 'Kerala Geography', aliases: ['kerala geography', '14 districts', 'western ghats', 'anamudi'] },
    { tag: 'Districts of Kerala', aliases: ['kasaragod', 'kannur', 'wayanad', 'kozhikode', 'malappuram', 'palakkad', 'thrissur', 'ernakulam', 'idukki', 'kottayam', 'alappuzha', 'pathanamthitta', 'kollam', 'thiruvananthapuram'] },
    { tag: 'Kerala Rivers', aliases: ['periyar', 'bharathapuzha', 'nila', 'pamba', 'chaliyar', 'chalakudy', 'kabini', 'bhavani', 'pambar'] },
    { tag: 'Kerala Lakes & Backwaters', aliases: ['vembanad', 'ashtamudi', 'sasthamkotta', 'kayal', 'backwaters'] },
    { tag: 'Kerala History', aliases: ['kerala history', 'marakkars', 'zamorin', 'travancore', 'marthanda varma', 'battle of colachel', 'pazhassi raja', 'velu thampi'] },
    { tag: 'Kerala Renaissance', aliases: ['sree narayana guru', 'ayyankali', 'chattampi swamikal', 'vakkom moulavi', 'v.t. bhattathiripad', 'navodhanam', 'aruvippuram'] },
    { tag: 'Malayalam Literature', aliases: ['ezhuthachan', 'kumaran asan', 'vallathol', 'ulloor', 'jnanpith', 'basheer', 'm.t. vasudevan nair', 'akkitham'] },
    { tag: 'Performing Arts of Kerala', aliases: ['kathakali', 'mohiniyattam', 'koodiyattam', 'theyyam', 'thullal', 'panchavadyam'] },
    { tag: 'Kerala PSC & GK', aliases: ['kerala psc', 'psc exam', 'kas', 'ldc', 'kerala model', 'kudumbashree'] },
    { tag: 'Kerala Tech & Infrastructure', aliases: ['technopark', 'infopark', 'cyberpark', 'ksum', 'vizhinjam', 'water metro', 'kochi metro', 'cial'] },
    { tag: 'State Symbols', aliases: ['great indian hornbill', 'kanikkonna', 'karimeen', 'jackfruit'] },
  ],
};

// Category to Tag Affinities (boosts relevance if user selects this category)
const CATEGORY_TAG_AFFINITIES: Record<string, string[]> = {
  'Technology & Architecture': ['Architecture', 'System Design', 'Scalability', 'Cloud'],
  'Current Trends (2026)': ['2026 Trends', 'Emerging Tech', 'Innovation', 'Next-Gen'],
  'Kerala Studies & Geography': ['Kerala', 'Geography', 'Districts', 'Western Ghats', 'Rivers'],
  'Kerala Studies & History': ['Kerala History', 'Renaissance', 'Colonial Resistance', 'Navodhanam'],
  'Malayalam Literature & Arts': ['Malayalam', 'Literature', 'Performing Arts', 'Classical Arts'],
  'Kerala PSC & Education': ['Kerala PSC', 'General Studies', 'Kerala GK', 'Syllabus'],
  'Kerala Economy & Tech': ['Technopark', 'Startups', 'Infrastructure', 'Kerala Tech'],
  'AI & Neural Systems': ['Artificial Intelligence', 'Machine Learning', 'Neural Networks', 'LLM'],
  'Software & APIs': ['API', 'Frontend', 'Backend', 'Software Engineering'],
  'Cyber Security': ['Cyber Security', 'Cryptography', 'Zero-Trust', 'Data Protection'],
  'Hardware & Silicon': ['Silicon', 'Hardware', 'Semiconductor', 'Processors'],
  'Custom Research': ['Research', 'Analysis', 'Documentation'],
};

/**
 * Normalizes a string into a clean, display-ready tag
 */
export function normalizeTag(tag: string): string {
  const trimmed = tag.trim().replace(/^#+/, '').replace(/[^\w\s-./]/g, '');
  if (!trimmed) return '';

  // Preserve recognized acronyms in all uppercase
  const upper = trimmed.toUpperCase();
  if (['AI', 'ML', 'LLM', 'RAG', 'API', 'REST', 'PQC', 'NIST', 'FIPS', 'TLS', 'EUV', 'TSMC', 'GPU', 'TPU', 'NPU', 'EUV', 'PCIe', 'CRDT', 'PWA', 'SSR', 'OWASP', 'JWT', 'PSC', 'KAS', 'LDC', 'SSLC', 'SCERT', 'CIAL', 'KSUM', 'ISRO', 'VSSC'].includes(upper)) {
    return upper;
  }

  // Capitalize first letter of each significant word
  return trimmed
    .split(/[\s_-]+/)
    .map((word) => {
      if (word.length <= 2 && word.toUpperCase() === word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Analyzes document text and extracts candidate tags with confidence scores
 */
export function analyzeDocumentForTags(params: {
  title: string;
  content: string;
  category?: string;
  existingTags?: string[];
  maxSuggestions?: number;
}): TagSuggestion[] {
  const { title = '', content = '', category = '', existingTags = [], maxSuggestions = 12 } = params;
  const existingSet = new Set(existingTags.map((t) => t.trim().toLowerCase()));

  const suggestionsMap = new Map<string, TagSuggestion>();

  const addOrUpdate = (
    rawTag: string,
    score: number,
    source: TagSuggestion['source'],
    reasonLabel: string
  ) => {
    const cleanTag = normalizeTag(rawTag);
    if (!cleanTag || cleanTag.length < 2 || cleanTag.length > 32) return;
    const lower = cleanTag.toLowerCase();

    // Do not suggest pure stop words or already applied tags
    if (STOP_WORDS.has(lower) || existingSet.has(lower)) return;

    const existing = suggestionsMap.get(lower);
    if (!existing) {
      suggestionsMap.set(lower, {
        tag: cleanTag,
        score: Math.min(Math.round(score), 99),
        source,
        reasonLabel,
      });
    } else {
      // Accumulate score and upgrade reason if higher
      const newScore = Math.min(Math.round(existing.score + score * 0.45), 99);
      if (score > existing.score) {
        existing.score = newScore;
        existing.source = source;
        existing.reasonLabel = reasonLabel;
      } else {
        existing.score = newScore;
      }
    }
  };

  const combinedFullText = `${title}\n${content}`;
  const lowerFull = combinedFullText.toLowerCase();

  // 1. Analyze Category Affinities
  if (category && CATEGORY_TAG_AFFINITIES[category]) {
    const affinities = CATEGORY_TAG_AFFINITIES[category];
    affinities.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      // If the category tag or any word of it appears in title or content, boost heavily
      if (lowerFull.includes(lowerTag)) {
        addOrUpdate(tag, 92, 'category', `Core Category match (${category})`);
      } else {
        // Base category suggestion
        addOrUpdate(tag, 70, 'category', `Recommended for ${category}`);
      }
    });
  }

  // 2. Domain Knowledge Mapping
  Object.values(DOMAIN_KNOWLEDGE_MAP).forEach((domainList) => {
    domainList.forEach((entry) => {
      const matches: string[] = [];
      if (lowerFull.includes(entry.tag.toLowerCase())) {
        matches.push(entry.tag);
      }
      if (entry.aliases) {
        for (const alias of entry.aliases) {
          // Exact boundary match for short aliases like 'rag', 'pqc', 'tsmc', 'nist'
          if (alias.length <= 4) {
            const regex = new RegExp(`\\b${alias}\\b`, 'i');
            if (regex.test(combinedFullText)) {
              matches.push(alias);
            }
          } else if (lowerFull.includes(alias.toLowerCase())) {
            matches.push(alias);
          }
        }
      }

      if (matches.length > 0) {
        const inTitle = title.toLowerCase().includes(entry.tag.toLowerCase());
        const score = inTitle ? 98 : 88;
        addOrUpdate(entry.tag, score, 'domain', inTitle ? 'Dominant Title Concept' : 'Key Domain Concept');
      }
    });
  });

  // 3. Title Analysis & Salient Phrases
  if (title.trim()) {
    // Extract title acronyms (e.g. NIST, PQC, FIPS, AI, React, Vite)
    const titleAcronyms = title.match(/\b[A-Z]{2,6}\b/g) || [];
    titleAcronyms.forEach((acr) => {
      addOrUpdate(acr, 95, 'acronym', 'Title Acronym');
    });

    // Parentheses content in titles, e.g. "Kerala Studies (കേരള ഭൂമിശാസ്ത്രം)" or "(NIST FIPS 203)"
    const parens = title.match(/\(([^)]+)\)/g) || [];
    parens.forEach((p) => {
      const inner = p.replace(/[()]/g, '').trim();
      if (inner.length >= 3 && inner.length <= 25) {
        addOrUpdate(inner, 90, 'title', 'Parenthetical Specifier');
      }
    });

    // Clean title words and 2-word bi-grams
    const cleanTitleTokens = title
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()));

    cleanTitleTokens.forEach((token) => {
      if (token.length > 3) {
        addOrUpdate(token, 84, 'title', 'From Document Title');
      }
    });

    for (let i = 0; i < cleanTitleTokens.length - 1; i++) {
      const bigram = `${cleanTitleTokens[i]} ${cleanTitleTokens[i + 1]}`;
      if (bigram.length > 6 && bigram.length < 28) {
        addOrUpdate(bigram, 89, 'title', 'Title Keyphrase');
      }
    }
  }

  // 4. Markdown Headings Analysis (#, ##, ###, or bullet leads)
  const headingLines = content.split('\n').filter((l) => {
    const trimmed = l.trim();
    return trimmed.startsWith('#') || trimmed.startsWith('##') || trimmed.startsWith('###');
  });

  headingLines.forEach((line) => {
    const headingText = line.replace(/^#+\s*/, '').trim();
    const acronyms = headingText.match(/\b[A-Z]{2,6}\b/g) || [];
    acronyms.forEach((acr) => addOrUpdate(acr, 86, 'acronym', 'Section Acronym'));

    const tokens = headingText
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t.toLowerCase()));

    for (let i = 0; i < tokens.length - 1; i++) {
      const pair = `${tokens[i]} ${tokens[i + 1]}`;
      if (pair.length >= 6 && pair.length <= 28) {
        addOrUpdate(pair, 82, 'heading', 'Major Heading Subject');
      }
    }
  });

  // 5. Content Acronyms & Salient Keywords
  const contentAcronyms = content.match(/\b[A-Z0-9-]{2,8}\b/g) || [];
  const acronymCounts = new Map<string, number>();
  contentAcronyms.forEach((a) => {
    if (!STOP_WORDS.has(a.toLowerCase()) && a.length >= 2) {
      acronymCounts.set(a, (acronymCounts.get(a) || 0) + 1);
    }
  });

  acronymCounts.forEach((count, acr) => {
    if (count >= 2) {
      addOrUpdate(acr, Math.min(75 + count * 3, 93), 'acronym', `Repeated Tech Term (${count}x)`);
    }
  });

  // 6. Term Frequency Analysis for Prominent Capitalized Words
  const capitalizedTerms = content.match(/\b[A-Z][a-z]{3,}\b/g) || [];
  const termCounts = new Map<string, number>();
  capitalizedTerms.forEach((w) => {
    const lower = w.toLowerCase();
    if (!STOP_WORDS.has(lower)) {
      termCounts.set(w, (termCounts.get(w) || 0) + 1);
    }
  });

  termCounts.forEach((count, word) => {
    if (count >= 3) {
      addOrUpdate(word, Math.min(68 + count * 2, 85), 'keyword', `Frequent Content Entity (${count}x)`);
    }
  });

  // Convert map to array, sort by score descending
  const sorted = Array.from(suggestionsMap.values())
    .filter((s) => !existingSet.has(s.tag.toLowerCase()))
    .sort((a, b) => b.score - a.score);

  return sorted.slice(0, maxSuggestions);
}

/**
 * Helper to compute an overall content summary for tags
 */
export function getTagsSummaryMetric(tags: string[] = []): { count: number; status: 'empty' | 'minimal' | 'optimal' | 'rich' } {
  const count = tags.length;
  if (count === 0) return { count, status: 'empty' };
  if (count <= 2) return { count, status: 'minimal' };
  if (count <= 6) return { count, status: 'optimal' };
  return { count, status: 'rich' };
}
