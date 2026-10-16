import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  Copy,
  Check,
  Globe,
  Sliders,
  ExternalLink,
  Bot,
  Sparkles,
  Smartphone,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  HelpCircle,
  X,
} from 'lucide-react';

interface EmbedWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedWidgetModal: React.FC<EmbedWidgetModalProps> = ({ isOpen, onClose }) => {
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [theme, setTheme] = useState<'dark' | 'light' | 'midnight-blue'>('dark');
  const [greeting, setGreeting] = useState('ഹലോ! ഞാൻ MR TECH AI. എന്താണ് സഹായിക്കേണ്ടത്?');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activePlatformTab, setActivePlatformTab] = useState<'html' | 'wordpress' | 'react' | 'blogger'>('html');

  // Derive origin from window.location or fallback to production URL
  const currentOrigin =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : 'https://ais-pre-fwlcrm5obzksnypge4ge3m-923948869532.asia-southeast1.run.app';

  const scriptUrl = `${currentOrigin}/widget.js`;
  const iframeUrl = `${currentOrigin}/?embed=true&mode=widget&theme=${theme}`;

  // 1-line simple script
  const simpleScriptCode = `<script src="${scriptUrl}" defer></script>`;

  // Customized script code
  const customScriptCode = `<!-- MR TECH AI Floating Chat Widget -->
<script 
  src="${scriptUrl}" 
  data-position="${position}" 
  data-theme="${theme}" 
  data-greeting="${greeting}"
  defer>
</script>`;

  // Direct iframe embed code
  const iframeEmbedCode = `<iframe 
  src="${iframeUrl}" 
  width="100%" 
  height="650" 
  style="border: none; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);"
  allow="clipboard-write; microphone;">
</iframe>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-[#0a0f1d] border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    Website Floating Widget (ഫ്ലോട്ടിംഗ് ചാറ്റ് വിഡ്ജറ്റ്)
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    Ready to Embed
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  ഏതൊരു വെബ്സൈറ്റിലും MR TECH AI ഒരു ഫ്ലോട്ടിംഗ് ബബിളായി ചേർക്കാനുള്ള കോഡ്
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-6 text-sm flex-1">
            {/* Quick Summary Banner in Malayalam */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-cyan-950/40 border border-blue-500/30 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                <span className="font-semibold text-cyan-300">നിങ്ങളുടെ വെബ്സൈറ്റിൽ എങ്ങനെ ചേർക്കാം: </span>
                താഴെ നൽകിയിരിക്കുന്ന 1-ലൈൻ സ്ക്രിപ്റ്റ് കോഡ് കോപ്പി ചെയ്ത് നിങ്ങളുടെ വെബ്സൈറ്റിന്റെ HTML കോഡിലെ{' '}
                <code className="px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-200 font-mono text-xs">
                  &lt;/body&gt;
                </code>{' '}
                ടാഗിന് തൊട്ടുമുകളിൽ പേസ്റ്റ് ചെയ്താൽ മതി! തനിയെ താഴെ വലതുഭാഗത്ത് ഫ്ലോട്ടിംഗ് ചാറ്റ് ബട്ടൺ പ്രത്യക്ഷപ്പെടും.
              </div>
            </div>

            {/* Customization Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              {/* Position */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>സ്ഥാനം (Position)</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPosition('bottom-right')}
                    className={`py-1.5 px-2 rounded-md font-medium transition-all ${
                      position === 'bottom-right'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Bottom Right (വലത്)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition('bottom-left')}
                    className={`py-1.5 px-2 rounded-md font-medium transition-all ${
                      position === 'bottom-left'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Bottom Left (ഇടത്)
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>തീം (Theme)</span>
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="dark">Dark Theme (ഡാർക്ക് - ഡിഫോൾട്ട്)</option>
                  <option value="midnight-blue">Midnight Blue (മിഡ്നൈറ്റ് ബ്ലൂ)</option>
                  <option value="light">Light Theme (ലൈറ്റ്)</option>
                </select>
              </div>

              {/* Greeting */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ഗ്രീറ്റിംഗ് സന്ദേശം (Greeting)</span>
                </label>
                <input
                  type="text"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="ഹലോ! MR TECH AI-യോട് ചോദിക്കൂ..."
                  className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Primary Script Code Option (Most Popular) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  1. ഏറ്റവും ലളിതമായ കോഡ് (1-Line Embed Script):
                </span>
                <button
                  onClick={() => copyToClipboard(simpleScriptCode, 'simple')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  {copiedType === 'simple' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Script</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto shadow-inner">
                <code>{simpleScriptCode}</code>
              </div>
            </div>

            {/* Configured Script Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  2. കസ്റ്റമൈസ് ചെയ്ത കോഡ് (Position & Greeting ഉള്ളത്):
                </span>
                <button
                  onClick={() => copyToClipboard(customScriptCode, 'custom')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedType === 'custom' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Custom Code</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto whitespace-pre shadow-inner">
                <code>{customScriptCode}</code>
              </div>
            </div>

            {/* Platform Specific Step-by-Step Instructions */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
                വിവിധ വെബ്സൈറ്റുകളിൽ ചേർക്കേണ്ട വിധം (Platform Guide):
              </h3>

              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
                <button
                  onClick={() => setActivePlatformTab('html')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activePlatformTab === 'html'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  HTML / PHP / Custom Site
                </button>
                <button
                  onClick={() => setActivePlatformTab('wordpress')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activePlatformTab === 'wordpress'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  WordPress
                </button>
                <button
                  onClick={() => setActivePlatformTab('react')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activePlatformTab === 'react'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  React / Next.js
                </button>
                <button
                  onClick={() => setActivePlatformTab('blogger')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activePlatformTab === 'blogger'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Blogger / Shopify / Wix
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2.5">
                {activePlatformTab === 'html' && (
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>നിങ്ങളുടെ വെബ്സൈറ്റിന്റെ HTML ഫയൽ (<code className="text-cyan-300 font-mono">index.html</code> അല്ലെങ്കിൽ <code className="text-cyan-300 font-mono">footer.php</code>) തുറക്കുക.</li>
                    <li>ഫയലിന്റെ ഏറ്റവും താഴെ <code className="text-cyan-300 font-mono">&lt;/body&gt;</code> എന്ന ക്ലോസിംഗ് ടാഗ് കണ്ടെത്തുക.</li>
                    <li>മുകളിൽ നൽകിയിരിക്കുന്ന സ്ക്രിപ്റ്റ് കോഡ് കോപ്പി ചെയ്ത് <code className="text-cyan-300 font-mono">&lt;/body&gt;</code> ടാഗിന്റെ തൊട്ടുമുകളിൽ പേസ്റ്റ് ചെയ്യുക.</li>
                    <li>ഫയൽ സേവ് ചെയ്യുക. നിങ്ങളുടെ വെബ്സൈറ്റ് റീലോഡ് ചെയ്യുമ്പോൾ താഴെ വലതുഭാഗത്ത് MR TECH AI ഫ്ലോട്ടിംഗ് ഐക്കൺ കാണാം!</li>
                  </ol>
                )}

                {activePlatformTab === 'wordpress' && (
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>WordPress അഡ്മിൻ ഡാഷ്‌ബോർഡിൽ ലോഗിൻ ചെയ്യുക.</li>
                    <li>
                      <strong>രീതി 1 (Plugin വഴി):</strong> <span className="text-blue-300 font-medium">Plugins &gt; Add New</span> എടുത്ത് &quot;WPCode&quot; അല്ലെങ്കിൽ &quot;Insert Headers and Footers&quot; ഇൻസ്റ്റാൾ ചെയ്യുക. ശേഷം <strong>Footer</strong> സെക്ഷനിൽ ഈ സ്ക്രിപ്റ്റ് പേസ്റ്റ് ചെയ്യുക.
                    </li>
                    <li>
                      <strong>രീതി 2 (Elementor വഴി):</strong> Footer ടെംപ്ലേറ്റിൽ ഒരു &quot;HTML&quot; widget ചേർത്ത് ഈ കോഡ് അതിൽ നൽകുക.
                    </li>
                    <li>
                      <strong>രീതി 3 (Theme File Editor വഴി):</strong> <span className="text-blue-300 font-medium">Appearance &gt; Theme File Editor &gt; footer.php</span> ഫയലിൽ <code className="text-cyan-300 font-mono">&lt;/body&gt;</code>-ക്ക് മുകളിൽ പേസ്റ്റ് ചെയ്യുക.
                    </li>
                  </ol>
                )}

                {activePlatformTab === 'react' && (
                  <div className="space-y-2">
                    <p className="text-slate-300">
                      Next.js ആപ്പിൽ <code className="text-cyan-300 font-mono">app/layout.tsx</code> അല്ലെങ്കിൽ <code className="text-cyan-300 font-mono">pages/_app.tsx</code>-ൽ Next Script ഉപയോഗിക്കാം:
                    </p>
                    <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-cyan-300 overflow-x-auto">
{`import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script 
          src="${scriptUrl}" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}`}
                    </pre>
                  </div>
                )}

                {activePlatformTab === 'blogger' && (
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li><strong>Blogger / Blogspot:</strong> Theme &gt; Edit HTML എടുക്കുക. ഫയലിന്റെ അവസാനഭാഗത്ത് <code className="text-cyan-300 font-mono">&lt;/body&gt;</code> തിരഞ്ഞ് അതിന് തൊട്ടുമുകളിൽ ഈ സ്ക്രിപ്റ്റ് നൽകി Save ചെയ്യുക.</li>
                    <li><strong>Shopify:</strong> Online Store &gt; Themes &gt; Edit code &gt; <code className="text-cyan-300 font-mono">theme.liquid</code> ഫയലിൽ <code className="text-cyan-300 font-mono">&lt;/body&gt;</code> ടാഗിന് മുകളിൽ പേസ്റ്റ് ചെയ്യുക.</li>
                    <li><strong>Wix:</strong> Settings &gt; Custom Code &gt; Add Custom Code &gt; Paste code and place it in <strong>Body - end</strong>.</li>
                  </ol>
                )}
              </div>
            </div>

            {/* Alternative Direct iFrame Code */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  3. ഒരു പ്രത്യേക പേജിൽ ഫുൾ-സൈസ് ചാറ്റ്ബോക്സ് ആയി എംബഡ് ചെയ്യണമെങ്കിൽ (iFrame Code):
                </span>
                <button
                  onClick={() => copyToClipboard(iframeEmbedCode, 'iframe')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedType === 'iframe' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy iframe</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre shadow-inner">
                <code>{iframeEmbedCode}</code>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Clock, Ultra-Fast Streaming & Voice സപ്പോർട്ട് ഉൾപ്പെടുത്തിയിട്ടുണ്ട്.</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              Done / പൂർത്തിയായി
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
