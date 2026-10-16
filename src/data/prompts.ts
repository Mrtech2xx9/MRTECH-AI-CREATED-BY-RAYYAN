import { PromptItem } from '../types';

export const DEFAULT_PROMPTS: PromptItem[] = [
  {
    id: 'p1',
    title: 'Full-Stack Security Audit',
    category: 'Coding',
    prompt: 'Perform an in-depth cyber security code review on the following code. Identify vulnerabilities (SQL injection, XSS, SSRF, memory leaks, unauthenticated routes) and provide hardened production fixes.',
    tags: ['Security', 'Audit', 'Clean Code'],
  },
  {
    id: 'p2',
    title: 'Algorithmic Optimization',
    category: 'Coding',
    prompt: 'Analyze this algorithm for time and space complexity (Big-O). Propose a more performant implementation with explanatory comments.',
    tags: ['Algorithms', 'Performance'],
  },
  {
    id: 'p3',
    title: 'Cyberpunk Hexagonal Emblem',
    category: 'Image',
    prompt: 'A futuristic holographic cyber emblem with metallic teal circuit traces, glowing neon cyan lock shield in center, dark slate metallic backdrop, 8k render, octane style.',
    tags: ['Logo', 'Futuristic', 'Cyber'],
  },
  {
    id: 'p4',
    title: 'Cinematic Tech Product Showcase',
    category: 'Image',
    prompt: 'Studio shot of a minimalist futuristic quantum computing processor with glowing turquoise fiber optics and brushed titanium chassis, soft studio rim lighting.',
    tags: ['Product', 'Cinematic'],
  },
  {
    id: 'p5',
    title: 'Executive PDF Summary',
    category: 'Research',
    prompt: 'Summarize the attached document into: 1. Executive Summary, 2. Key Quantitative Findings, 3. Strategic Recommendations, and 4. Actionable Next Steps.',
    tags: ['Document', 'Summary'],
  },
  {
    id: 'p6',
    title: 'Master Study Flashcard Generator',
    category: 'Study',
    prompt: 'Extract 10 core concepts from this topic. Format each concept into a high-yield study question, simple explanation, real-world analogy, and a self-test question.',
    tags: ['Learning', 'Study'],
  },
  {
    id: 'p7',
    title: 'High-Conversion Tech Proposal',
    category: 'Business',
    prompt: 'Draft a client-facing proposal for modernizing enterprise AI and cyber security architecture. Focus on ROI, zero-trust security, and scalable cloud deployment.',
    tags: ['Proposal', 'Business'],
  },
  {
    id: 'p8',
    title: 'Viral Tech Thread & Hook',
    category: 'Content',
    prompt: 'Write an engaging 5-tweet educational thread explaining a breakthrough in AI. Include a gripping hook, visual analogies, and actionable takeaways.',
    tags: ['Social', 'Engagement'],
  },
];
