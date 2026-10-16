import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Download,
  Trash2,
  Maximize2,
  RotateCw,
  Image as ImageIcon,
  Sliders,
  AlertCircle,
  X,
  Upload,
  Layers,
  ArrowRight,
  ShieldCheck,
  SplitSquareVertical,
  Columns,
} from 'lucide-react';
import { GeneratedImage } from '../types';
import nanoBananaAsset from '../assets/images/nano_banana_creative_1789128067861.jpg';
import { ImageCompareModal } from './ImageCompareModal';

interface ImageStudioProps {
  history: GeneratedImage[];
  onSaveImage: (img: GeneratedImage) => void;
  onDeleteImage: (id: string) => void;
  autoFocusPrompt?: boolean;
}

const STYLES = [
  'Exact (Prompt As Is)',
  'Realistic',
  'Cinematic',
  '3D',
  'Cartoon',
  'Anime',
  'Illustration',
  'Digital Art',
  'Product',
  'Fantasy',
  'Minimal',
  'Professional',
];

const ASPECT_RATIOS = [
  { label: '1:1 Square', value: '1:1' },
  { label: '16:9 Landscape', value: '16:9' },
  { label: '9:16 Portrait', value: '9:16' },
  { label: '4:3 Standard', value: '4:3' },
  { label: '3:4 Mobile', value: '3:4' },
];

const PROMPT_SUGGESTIONS = [
  'A hyper-creative microscopic nano banana with glowing cybernetic circuits on a fingertip',
  'നാനോ ബനാന (Creative Nano Banana) മൈക്രോസ്കോപ്പിക് നിയോൺ ആർട്ട്',
  'ഒരു ചുവന്ന കാർ റോഡിൽ പോകുന്നു',
  'A cute golden retriever puppy sitting on green grass',
  'ഒരു മനോഹരമായ കേരള പ്രകൃതിദൃശ്യം morning tea plantation',
  'Majestic snow-covered mountains during sunset',
];

export const ImageStudio: React.FC<ImageStudioProps> = ({
  history,
  onSaveImage,
  onDeleteImage,
  autoFocusPrompt = false,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Exact (Prompt As Is)');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);
  const [noWatermark, setNoWatermark] = useState(true);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocusPrompt) {
      const timer = setTimeout(() => {
        promptTextareaRef.current?.focus();
        promptTextareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [autoFocusPrompt]);

  // Image Compare Overlay States
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareOriginalImage, setCompareOriginalImage] = useState<GeneratedImage | null>(null);
  const [compareVariationImage, setCompareVariationImage] = useState<GeneratedImage | null>(null);

  // Keep chosen image and optionally delete discarded variation
  const handleKeepImage = (chosen: GeneratedImage, discardOtherId?: string) => {
    if (discardOtherId) {
      onDeleteImage(discardOtherId);
    }
  };

  const handleOpenCompare = (original: GeneratedImage, variation?: GeneratedImage) => {
    setCompareOriginalImage(original);
    setCompareVariationImage(variation || null);
    setIsCompareOpen(true);
  };

  const handleGenerate = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt.trim(),
          aspectRatio,
          style: selectedStyle,
          referenceImage,
          noWatermark,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Failed to generate image (${res.status})`);
      }

      const newImage: GeneratedImage = {
        id: `img_${Date.now()}`,
        prompt: activePrompt,
        imageUrl: data.imageUrl,
        aspectRatio: data.aspectRatio || aspectRatio,
        style: selectedStyle,
        createdAt: new Date().toISOString(),
        description: data.description,
      };

      onSaveImage(newImage);
    } catch (err: any) {
      console.error('Image generation error:', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('failed to fetch')) {
        setErrorMessage('Unable to reach the server. Please check your connection and try again.');
      } else {
        setErrorMessage(msg || 'Image generation failed. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async (img: GeneratedImage) => {
    try {
      if (img.imageUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = img.imageUrl;
        a.download = `mr-tech-ai-${img.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const res = await fetch(img.imageUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `mr-tech-ai-${img.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      }
    } catch {
      window.open(img.imageUrl, '_blank');
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-full flex flex-col p-4 sm:p-6 lg:p-8 bg-[#090d16] text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            {/* Header Subtitle */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                AI Image Studio
              </h1>
              <span className="text-xs font-mono text-cyan-400">
                Powered by AI 1 Visual Engine
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300">
            Model: AI 1 Image Engine
          </span>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
            {history.length} Generated
          </span>
        </div>
      </div>

      {/* Main Studio Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Prompt Input & Config Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Image Creator</span>
            </h2>

            {/* Prompt */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Describe the image to generate:
                </label>
                <span className="text-[10px] text-cyan-400 font-mono">Malayalam & English supported</span>
              </div>
              <textarea
                ref={promptTextareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. ഒരു സുന്ദരമായ റോബോട്ട് പൂച്ച glowing cyber eyes, or a futuristic supercar..."
                rows={3}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 placeholder:text-slate-600 resize-none"
              />

              {/* Quick Prompt Suggestions */}
              <div className="mt-2">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">Quick Suggestions:</span>
                <div className="flex flex-wrap gap-1">
                  {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(suggestion)}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-cyan-950/60 border border-slate-700/60 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-200 transition-colors text-left"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Aspect Ratio</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.value}
                    type="button"
                    onClick={() => setAspectRatio(ratio.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border text-center transition-colors ${
                      aspectRatio === ratio.value
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ratio.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Aesthetic Style</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                      selectedStyle === style
                        ? 'border-teal-400 bg-teal-500/20 text-teal-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Image (for Image-to-Image editing) */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Optional Reference Image (Image-to-Image)
              </label>
              {referenceImage ? (
                <div className="relative w-24 h-24 rounded-xl border border-cyan-500/50 overflow-hidden group">
                  <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 hover:border-cyan-500/50 cursor-pointer text-xs text-slate-400 transition-colors">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Upload reference image for variation or edit</span>
                  <input type="file" accept="image/*" onChange={handleReferenceUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Clean Output: No Text / No Watermark (Part 2 Feature) */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    noWatermark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200">No Text / No Watermark</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                      Clean Output
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Strictly prevents text, letters, watermarks, and logos in generated images
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNoWatermark(!noWatermark)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border shrink-0 ${
                  noWatermark
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={
                  noWatermark
                    ? 'Clean output active (No text or watermark)'
                    : 'Click to enable clean no-text/watermark output'
                }
              >
                {noWatermark ? 'ACTIVE' : 'OFF'}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-semibold text-red-100">Image generation is currently unavailable.</span>
                </div>
                <p className="text-[11px] text-red-300/90 leading-relaxed">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  className="self-start mt-1 px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-100 text-xs font-bold border border-red-500/50 transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Generating with AI 1...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Gallery / History Column */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Featured Creative Spotlight: Nano Banana */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-cyan-500/10 to-slate-900/90 border border-amber-500/30 shadow-xl relative overflow-hidden group">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-amber-400/40 shrink-0 bg-slate-950 shadow-lg">
                <img
                  src={nanoBananaAsset}
                  alt="Creative Nano Banana"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                  onClick={() =>
                    setFullscreenImage({
                      id: 'nano_banana_featured',
                      prompt:
                        'A hyper-creative microscopic nano banana resting delicately on the ridge of a human fingertip to show scale, futuristic nano-tech aesthetic, glowing golden cybernetic circuits, translucent bio-luminescent peel with neon cyan microchip lines, macro photography, ultra-detailed 8k render, shallow depth of field, dramatic cinematic lighting',
                      imageUrl: nanoBananaAsset,
                      aspectRatio: '1:1',
                      style: 'Exact (Prompt As Is)',
                      createdAt: new Date().toISOString(),
                    })
                  }
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500/90 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                  Creative Art
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <h3 className="text-sm font-bold text-white truncate">
                    ക്രിയേറ്റീവ് നാനോ ബനാന (Nano Banana Creative)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">
                  മൈക്രോസ്കോപ്പിക് ഫ്യൂച്ചറിസ്റ്റിക് നാനോ-ടെക് ബനാന: വിരൽത്തുമ്പിൽ തിളങ്ങുന്ന സൈബർ സർക്യൂട്ടുകളും നിയോൺ ലൂമിനസെൻസും ഉള്ള മാക്രോ ആർട്ട്.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const nanoPrompt =
                        'A hyper-creative microscopic nano banana with glowing golden cybernetic circuits and neon cyan microchip lines resting on a fingertip';
                      setPrompt(nanoPrompt);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Remix Prompt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFullscreenImage({
                        id: 'nano_banana_featured',
                        prompt: 'A hyper-creative microscopic nano banana on a fingertip',
                        imageUrl: nanoBananaAsset,
                        aspectRatio: '1:1',
                        style: 'Exact (Prompt As Is)',
                        createdAt: new Date().toISOString(),
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3 text-cyan-400" />
                    <span>Fullscreen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCompare(
                        {
                          id: 'nano_banana_featured',
                          prompt: 'A hyper-creative microscopic nano banana with glowing golden cybernetic circuits and neon cyan microchip lines resting on a fingertip',
                          imageUrl: nanoBananaAsset,
                          aspectRatio: '1:1',
                          style: 'Exact (Prompt As Is)',
                          createdAt: new Date().toISOString(),
                        },
                        history[0] || undefined
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Compare Nano Banana with variations in your gallery"
                  >
                    <SplitSquareVertical className="w-3 h-3 text-cyan-400" />
                    <span>Compare</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload({
                        id: 'nano_banana_creative',
                        prompt: 'Nano Banana Creative Artwork',
                        imageUrl: nanoBananaAsset,
                        aspectRatio: '1:1',
                        style: 'Exact (Prompt As Is)',
                        createdAt: new Date().toISOString(),
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-teal-400" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex-1 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-teal-400" />
                <span>Studio Gallery ({history.length})</span>
              </h2>

              {history.length >= 2 && (
                <button
                  type="button"
                  onClick={() => handleOpenCompare(history[0], history[1])}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group"
                  title="Open side-by-side Image Compare overlay to compare original and variations"
                >
                  <SplitSquareVertical className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Compare Variations ({history.length})</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl p-6">
                <ImageIcon className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-sm font-semibold text-slate-400">No images generated yet</p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Type a prompt on the left to create your first visual asset with AI 1.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {history.map((img) => (
                  <div
                    key={img.id}
                    className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col shadow-md hover:border-cyan-500/50 transition-all"
                  >
                    <div className="relative w-full aspect-square bg-slate-900 overflow-hidden flex items-center justify-center">
                      <img
                        src={img.imageUrl}
                        alt={img.prompt}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                        onClick={() => setFullscreenImage(img)}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      {/* Clean Output Badge */}
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-[9px] font-mono text-emerald-300 flex items-center gap-1 shadow-md">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                        <span>No Watermark</span>
                      </div>
                      {/* Overlay buttons on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setFullscreenImage(img)}
                          title="Full Screen Preview"
                          className="p-2 rounded-lg bg-slate-900/90 text-white hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenCompare(img)}
                          title="Compare with Variations"
                          className="p-2 rounded-lg bg-slate-900/90 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                        >
                          <SplitSquareVertical className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(img)}
                          title="Download Image"
                          className="p-2 rounded-lg bg-slate-900/90 text-white hover:bg-teal-500 hover:text-slate-950 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteImage(img.id)}
                          title="Delete"
                          className="p-2 rounded-lg bg-slate-900/90 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col gap-1.5">
                      <p className="text-xs text-slate-200 line-clamp-2 font-medium">{img.prompt}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">{img.style}</span>
                        <span>{img.aspectRatio}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenCompare(img)}
                            className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                            title="Side-by-side compare"
                          >
                            <SplitSquareVertical className="w-3 h-3" />
                            <span>Compare</span>
                          </button>
                          <button
                            onClick={() => {
                              setPrompt(img.prompt);
                              handleGenerate(undefined, img.prompt);
                            }}
                            className="text-teal-400 hover:underline flex items-center gap-1"
                            title="Generate variation"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Regen</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={fullscreenImage.imageUrl}
              alt={fullscreenImage.prompt}
              className="max-h-[75vh] w-auto object-contain rounded-xl border border-cyan-500/40 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="mt-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between w-full">
              <div className="text-xs text-slate-200 max-w-xl truncate">{fullscreenImage.prompt}</div>
              <button
                onClick={() => handleDownload(fullscreenImage)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 flex items-center gap-1.5 shrink-0 ml-3"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Image Compare Overlay */}
      {compareOriginalImage && (
        <ImageCompareModal
          isOpen={isCompareOpen}
          onClose={() => {
            setIsCompareOpen(false);
            setCompareOriginalImage(null);
            setCompareVariationImage(null);
          }}
          originalImage={compareOriginalImage}
          variationImage={compareVariationImage}
          availableImages={history}
          onSelectVariation={(img) => setCompareVariationImage(img)}
          onKeepImage={handleKeepImage}
          onDeleteImage={onDeleteImage}
        />
      )}
    </div>
  );
};
