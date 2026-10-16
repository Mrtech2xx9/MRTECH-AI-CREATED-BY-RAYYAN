import React, { useState } from 'react';
import {
  X,
  Columns,
  SplitSquareVertical,
  Check,
  Trash2,
  Download,
  RotateCw,
  Sparkles,
  Layers,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Info,
  Maximize2,
} from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImage: GeneratedImage;
  variationImage?: GeneratedImage | null;
  availableImages: GeneratedImage[];
  onSelectVariation: (img: GeneratedImage) => void;
  onKeepImage: (chosen: GeneratedImage, discardOtherId?: string) => void;
  onDeleteImage: (id: string) => void;
}

export const ImageCompareModal: React.FC<ImageCompareModalProps> = ({
  isOpen,
  onClose,
  originalImage,
  variationImage,
  availableImages,
  onSelectVariation,
  onKeepImage,
  onDeleteImage,
}) => {
  // Compare view modes: 'side-by-side' (split columns) or 'slider' (interactive drag curtain)
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider'>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'compare' | 'details'>('compare');

  if (!isOpen) return null;

  // Fallback variation candidate if none explicitly passed:
  // pick the most recent image that is different from originalImage
  const currentVariation =
    variationImage ||
    availableImages.find((img) => img.id !== originalImage.id) ||
    null;

  const handleDownload = async (img: GeneratedImage, filenameSuffix: string) => {
    try {
      if (img.imageUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = img.imageUrl;
        a.download = `mr-tech-compare-${filenameSuffix}-${img.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const res = await fetch(img.imageUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `mr-tech-compare-${filenameSuffix}-${img.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      }
    } catch {
      window.open(img.imageUrl, '_blank');
    }
  };

  const handleSliderMove = (clientX: number, rect: DOMRect) => {
    const offsetX = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (offsetX / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <div
      id="image-compare-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-7xl max-h-[96vh] flex flex-col rounded-2xl bg-[#090e1a] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <SplitSquareVertical className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                  Image Compare & Variation Inspector
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  Side-by-Side Review
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md hidden sm:block">
                Evaluate details, lighting, and fidelity between original prompt and new variation before keeping
              </p>
            </div>
          </div>

          {/* Controls & Mode Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'side-by-side'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Side-by-Side Dual View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Side-by-Side</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'slider'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Interactive Slider Curtain View"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Curtain Slider</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
              title="Close Compare (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Stage */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col gap-4">
          {currentVariation ? (
            <>
              {viewMode === 'side-by-side' ? (
                /* SIDE-BY-SIDE VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {/* Image A: Original Result */}
                  <div className="flex flex-col rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-lg group hover:border-slate-700 transition-all">
                    <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold uppercase tracking-wider">
                          Option A • Original
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {originalImage.aspectRatio}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownload(originalImage, 'original')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Download Original"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Image Canvas Container */}
                    <div className="relative flex-1 min-h-[280px] sm:min-h-[380px] bg-slate-900/50 flex items-center justify-center p-2 overflow-hidden">
                      <img
                        src={originalImage.imageUrl}
                        alt={originalImage.prompt}
                        className="max-h-[55vh] w-auto max-w-full object-contain rounded-lg shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Prompt & Decision Bar */}
                    <div className="p-3.5 bg-slate-900/80 border-t border-slate-800 flex flex-col gap-2.5">
                      <p className="text-xs text-slate-300 line-clamp-2 italic" title={originalImage.prompt}>
                        "{originalImage.prompt}"
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {originalImage.style}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onKeepImage(originalImage, currentVariation.id);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 hover:text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            title="Keep Original and delete Variation"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Keep Original (A)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image B: Variation Result */}
                  <div className="flex flex-col rounded-xl bg-slate-950/80 border border-amber-500/30 overflow-hidden shadow-lg group hover:border-amber-500/50 transition-all">
                    <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Option B • Variation
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {currentVariation.aspectRatio}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownload(currentVariation, 'variation')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Download Variation"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Image Canvas Container */}
                    <div className="relative flex-1 min-h-[280px] sm:min-h-[380px] bg-slate-900/50 flex items-center justify-center p-2 overflow-hidden">
                      <img
                        src={currentVariation.imageUrl}
                        alt={currentVariation.prompt}
                        className="max-h-[55vh] w-auto max-w-full object-contain rounded-lg shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Prompt & Decision Bar */}
                    <div className="p-3.5 bg-slate-900/80 border-t border-slate-800 flex flex-col gap-2.5">
                      <p className="text-xs text-slate-300 line-clamp-2 italic" title={currentVariation.prompt}>
                        "{currentVariation.prompt}"
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {currentVariation.style}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onKeepImage(currentVariation, originalImage.id);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            title="Keep Variation and delete Original"
                          >
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                            <span>Keep Variation (B)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* INTERACTIVE CURTAIN SLIDER VIEW */
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="relative w-full max-w-3xl aspect-square max-h-[60vh] rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-2xl select-none cursor-ew-resize"
                    onMouseDown={(e) => {
                      setIsDragging(true);
                      handleSliderMove(e.clientX, e.currentTarget.getBoundingClientRect());
                    }}
                    onMouseMove={(e) => {
                      if (isDragging) {
                        handleSliderMove(e.clientX, e.currentTarget.getBoundingClientRect());
                      }
                    }}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onTouchMove={(e) => {
                      if (e.touches[0]) {
                        handleSliderMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
                      }
                    }}
                  >
                    {/* Background Layer: Variation Image (Option B) */}
                    <img
                      src={currentVariation.imageUrl}
                      alt={currentVariation.prompt}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                      referrerPolicy="no-referrer"
                    />

                    {/* Foreground Layer (Clipped): Original Image (Option A) */}
                    <div
                      className="absolute inset-0 overflow-hidden pointer-events-none"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={originalImage.imageUrl}
                        alt={originalImage.prompt}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        style={{
                          width: '100%',
                          maxWidth: 'none',
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Divider Line & Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_#06b6d4] z-20 pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-cyan-400 shadow-xl flex items-center justify-center text-cyan-300 text-xs">
                        <SplitSquareVertical className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Left & Right Labels */}
                    <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-[11px] font-bold text-cyan-300 pointer-events-none">
                      A: Original ({Math.round(sliderPosition)}%)
                    </span>
                    <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-[11px] font-bold text-amber-300 pointer-events-none">
                      B: Variation ({Math.round(100 - sliderPosition)}%)
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 text-center">
                    Drag the handle horizontally to visually wipe between Original (Left) and Variation (Right)
                  </p>
                </div>
              )}

              {/* Bottom Variation Picker & Action Shelf */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Compare With Other Variations in Studio ({availableImages.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Keep Both images (just close)
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
                    >
                      Keep Both In Gallery
                    </button>
                  </div>
                </div>

                {/* Thumbnails list to switch variation on the fly */}
                <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                  {availableImages
                    .filter((img) => img.id !== originalImage.id)
                    .map((img) => {
                      const isSelected = img.id === currentVariation.id;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => onSelectVariation(img)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105'
                              : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                          }`}
                          title={`Select variation: ${img.prompt}`}
                        >
                          <img
                            src={img.imageUrl}
                            alt={img.prompt}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {isSelected && (
                            <span className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-slate-950 text-[9px] font-black uppercase text-center py-0.2">
                              Active B
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Layers className="w-12 h-12 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No other variation available to compare yet</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Generate at least one variation or another image in Image Studio to inspect them side-by-side.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Return to Studio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
