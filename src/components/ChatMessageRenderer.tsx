import React, { useState, useMemo } from 'react';
import { Copy, Check, ExternalLink, Code2, Sparkles, Hash, Download } from 'lucide-react';
import { GroundingSource } from '../types';
import { StreamingSkeleton } from './StreamingSkeleton';
import { useTypewriter } from '../hooks/useTypewriter';
import { highlightCodeDetailed, HighlightResult } from '../utils/prismHighlighter';

interface ChatMessageRendererProps {
  content: string;
  groundingSources?: GroundingSource[];
  isStreaming?: boolean;
  fontSize?: 'normal' | 'large' | 'xlarge';
}

const EXTENSION_MAP: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  jsx: 'jsx',
  tsx: 'tsx',
  python: 'py',
  markup: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  bash: 'sh',
  powershell: 'ps1',
  sql: 'sql',
  rust: 'rs',
  go: 'go',
  cpp: 'cpp',
  c: 'c',
  csharp: 'cs',
  java: 'java',
  php: 'php',
  ruby: 'rb',
  swift: 'swift',
  kotlin: 'kt',
  dart: 'dart',
  yaml: 'yaml',
  toml: 'toml',
  docker: 'dockerfile',
  markdown: 'md',
};

interface CodeBlockViewProps {
  code: string;
  rawLang?: string;
  isStreaming?: boolean;
  index: number;
}

const CodeBlockView: React.FC<CodeBlockViewProps> = ({
  code,
  rawLang,
  isStreaming,
  index,
}) => {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const highlightResult: HighlightResult = useMemo(() => {
    return highlightCodeDetailed(code, rawLang);
  }, [code, rawLang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = EXTENSION_MAP[highlightResult.language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code-snippet-${index + 1}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Split highlighted HTML into lines for line number gutters
  const highlightedLines = useMemo(() => {
    return highlightResult.html.split('\n');
  }, [highlightResult.html]);

  return (
    <div className="my-3.5 rounded-xl overflow-hidden border border-slate-800/90 hover:border-slate-700 bg-[#0d1117] shadow-xl transition-all">
      {/* Code Block Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#161b22] border-b border-slate-800/80 text-xs font-mono text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 flex items-center gap-1.5 font-semibold text-[11px] tracking-wide">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{highlightResult.displayName}</span>
          </span>

          {highlightResult.isAutoDetected && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-sans"
              title="Programming language automatically detected by MR TECH AI Engine"
            >
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              <span>Auto-detected</span>
            </span>
          )}

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {highlightResult.lineCount} {highlightResult.lineCount === 1 ? 'line' : 'lines'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isStreaming ? (
            <span className="text-[10px] text-cyan-400 font-mono animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              generating code...
            </span>
          ) : (
            <>
              {/* Toggle Line Numbers */}
              <button
                type="button"
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                className={`p-1.5 rounded-md text-[11px] transition-colors cursor-pointer ${
                  showLineNumbers
                    ? 'text-cyan-300 bg-slate-800/90 hover:bg-slate-700'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
                }`}
                title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
              >
                <Hash className="w-3 h-3" />
              </button>

              {/* Download Code Snippet */}
              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Download code snippet"
              >
                <Download className="w-3 h-3" />
              </button>

              {/* Copy Code */}
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-sans font-medium cursor-pointer shadow-sm active:scale-95"
                title="Copy code to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Code Body with Prism Syntax Highlighting */}
      <pre className="prism-code-block p-3.5 sm:p-4 text-xs sm:text-[13px] font-mono text-slate-200 overflow-x-auto leading-relaxed bg-[#0d1117] m-0">
        <code className={`language-${highlightResult.language} block min-w-full`}>
          {showLineNumbers ? (
            <div className="table w-full border-collapse">
              {highlightedLines.map((lineHtml, lineIdx) => (
                <div key={lineIdx} className="table-row hover:bg-white/[0.03] transition-colors">
                  <span className="table-cell select-none text-slate-600 text-right pr-3.5 pl-0.5 min-w-[2.2rem] font-mono text-[11.5px] border-r border-slate-800/60 align-top">
                    {lineIdx + 1}
                  </span>
                  <span
                    className="table-cell pl-3.5 whitespace-pre align-top"
                    dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="whitespace-pre leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightResult.html }}
            />
          )}
        </code>
      </pre>
    </div>
  );
};

export const ChatMessageRenderer: React.FC<ChatMessageRendererProps> = ({
  content,
  groundingSources,
  isStreaming,
  fontSize = 'large',
}) => {
  // Smooth typewriter streaming animation
  const displayedContent = useTypewriter(content, Boolean(isStreaming));

  const fontClasses = {
    normal: 'text-[15px] sm:text-[16px] leading-relaxed',
    large: 'text-[16.5px] sm:text-[18px] leading-relaxed tracking-normal',
    xlarge: 'text-[18.5px] sm:text-[20px] leading-relaxed tracking-normal',
  }[fontSize] || 'text-[16.5px] sm:text-[18px] leading-relaxed';

  // Robust parser for markdown blocks with Prism.js code highlight support
  const renderFormattedText = (raw: string) => {
    if (!raw) return null;

    // Split text by markdown code fences
    const codeBlockRegex = /```([a-zA-Z0-9_#+.-]*)[ \t]*\r?\n([\s\S]*?)```/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let codeIndex = 0;

    while ((match = codeBlockRegex.exec(raw)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        const textBefore = raw.substring(lastIndex, match.index);
        elements.push(
          <div key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed my-2">
            {formatInlineMarkdown(textBefore)}
          </div>
        );
      }

      const lang = match[1] || '';
      const code = match[2];
      const currentIndex = codeIndex++;

      elements.push(
        <CodeBlockView
          key={`code-${currentIndex}`}
          code={code}
          rawLang={lang}
          isStreaming={false}
          index={currentIndex}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    // Check for unclosed code block during active streaming
    if (isStreaming && lastIndex < raw.length) {
      const remaining = raw.substring(lastIndex);
      const unclosedMatch = remaining.match(/^```([a-zA-Z0-9_#+.-]*)[ \t]*\r?\n([\s\S]*)$/);
      if (unclosedMatch) {
        const lang = unclosedMatch[1] || '';
        const code = unclosedMatch[2];
        const currentIndex = codeIndex++;
        elements.push(
          <CodeBlockView
            key={`code-streaming-${currentIndex}`}
            code={code}
            rawLang={lang}
            isStreaming={true}
            index={currentIndex}
          />
        );
        lastIndex = raw.length;
      }
    }

    // Remaining text after last code block
    if (lastIndex < raw.length) {
      const remainingText = raw.substring(lastIndex);
      elements.push(
        <div key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed my-2">
          {formatInlineMarkdown(remainingText)}
        </div>
      );
    }

    return elements;
  };

  // Helper for inline markdown: bold, tables, lists, inline code
  const formatInlineMarkdown = (text: string) => {
    // Process line by line
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Heading 3: ###
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-white mt-3 mb-1">
            {parseInlineStyles(line.replace('### ', ''))}
          </h3>
        );
      }
      // Heading 2: ##
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-lg font-bold text-slate-100 mt-4 mb-1.5 border-b border-slate-800 pb-1">
            {parseInlineStyles(line.replace('## ', ''))}
          </h2>
        );
      }
      // Heading 1: #
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-xl font-extrabold text-white mt-4 mb-2">
            {parseInlineStyles(line.replace('# ', ''))}
          </h1>
        );
      }
      // Bullet list item: * or -
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-2.5 ml-2 my-1">
            <span className="text-cyan-400 text-base leading-tight shrink-0">•</span>
            <span className="text-slate-100">{parseInlineStyles(line.trim().substring(2))}</span>
          </div>
        );
      }
      // Numbered list item: 1. or 2.
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2.5 ml-2 my-1">
            <span className="font-mono text-cyan-400 text-sm font-bold shrink-0">{numMatch[1]}.</span>
            <span className="text-slate-100">{parseInlineStyles(numMatch[2])}</span>
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Standalone markdown image: ![alt](url)
      const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const altText = imgMatch[1] || 'Generated Image';
        const imgUrl = imgMatch[2];
        return (
          <div key={idx} className="my-3 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 p-2 max-w-lg">
            <img
              src={imgUrl}
              alt={altText}
              className="w-full h-auto rounded-xl object-contain max-h-96"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            {altText && (
              <div className="mt-1.5 px-1 text-xs text-slate-400 font-mono flex items-center justify-between">
                <span>{altText}</span>
                <a
                  href={imgUrl}
                  download="generated-image.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-[11px] underline"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        );
      }

      return (
        <div key={idx} className="text-slate-200 my-0.5 leading-relaxed">
          {parseInlineStyles(line)}
        </div>
      );
    });
  };

  const parseInlineStyles = (str: string) => {
    // Split by bold, inline code, and links
    const parts = str.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={pIdx}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-850 border border-slate-700/80 text-cyan-300 font-mono text-[12.5px] font-medium"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <a
            key={pIdx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  const wordCount = displayedContent ? displayedContent.trim().split(/\s+/).filter(Boolean).length : 0;

  // Initial thinking / synthesizing state before any tokens arrive
  if (isStreaming && (!displayedContent || !displayedContent.trim())) {
    return (
      <div className={`w-full ${fontClasses} text-slate-100`}>
        <StreamingSkeleton isInitial={true} />
      </div>
    );
  }

  return (
    <div className={`w-full ${fontClasses} text-slate-100`}>
      {renderFormattedText(displayedContent)}

      {isStreaming && (
        <span
          className="inline-block w-2 h-4 ml-1 rounded-sm bg-gradient-to-b from-blue-400 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.9)] animate-pulse align-middle"
          title="Streaming response..."
        />
      )}

      {/* Active Streaming Progress Indicator */}
      {isStreaming && (
        <StreamingSkeleton isInitial={false} wordCount={wordCount} />
      )}

      {/* Grounding Citations */}
      {groundingSources && groundingSources.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-col gap-1.5">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span>Verified Sources</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {groundingSources.map((src, sIdx) => {
              if (!src.uri) return null;
              return (
                <a
                  key={sIdx}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-blue-300 hover:text-blue-200 text-[11px] font-mono transition-colors max-w-xs truncate"
                >
                  <span className="truncate">{src.title || src.uri.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
