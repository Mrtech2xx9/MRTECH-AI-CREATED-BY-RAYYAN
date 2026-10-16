/**
 * MR TECH AI — Floating Chat Widget Embed Script
 * Created by RAYYAN
 * 
 * Embed instructions:
 * Add this script to any website right before the closing </body> tag:
 * <script src="https://ais-pre-fwlcrm5obzksnypge4ge3m-923948869532.asia-southeast1.run.app/widget.js" defer></script>
 */

(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.__MR_TECH_AI_WIDGET_LOADED__) return;
  window.__MR_TECH_AI_WIDGET_LOADED__ = true;

  // Locate the current script element to extract configuration options
  const currentScript =
    document.currentScript ||
    document.querySelector('script[src*="widget.js"]') ||
    document.querySelector('script[data-mrtech-ai]');

  // Derive host URL from script source, or fallback to current origin
  let hostUrl = 'https://ais-pre-fwlcrm5obzksnypge4ge3m-923948869532.asia-southeast1.run.app';
  if (currentScript && currentScript.src) {
    try {
      const parsed = new URL(currentScript.src);
      hostUrl = parsed.origin;
    } catch (e) {
      // Use default
    }
  }

  // Configuration options (supports data-attributes or window.MRTechAIConfig)
  const userConfig = window.MRTechAIConfig || {};
  const position = (currentScript && currentScript.getAttribute('data-position')) || userConfig.position || 'bottom-right';
  const theme = (currentScript && currentScript.getAttribute('data-theme')) || userConfig.theme || 'dark';
  const primaryColor = (currentScript && currentScript.getAttribute('data-color')) || userConfig.primaryColor || '#2563eb';
  const greeting = (currentScript && currentScript.getAttribute('data-greeting')) || userConfig.greeting || 'ഹലോ! MR TECH AI-യോട് എന്തും ചോദിക്കൂ...';
  const showGreetingBadge = (currentScript && currentScript.getAttribute('data-show-greeting')) !== 'false' && userConfig.showGreeting !== false;
  const buttonTitle = (currentScript && currentScript.getAttribute('data-title')) || userConfig.title || 'MR TECH AI';

  // Build target iframe URL
  const iframeUrl = `${hostUrl}/?embed=true&mode=widget&theme=${encodeURIComponent(theme)}`;

  // Inject CSS Styles
  const styleEl = document.createElement('style');
  styleEl.id = 'mrtech-widget-styles';
  styleEl.textContent = `
    .mrtech-widget-root {
      position: fixed;
      z-index: 99999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    .mrtech-widget-root * {
      box-sizing: border-box;
    }
    .mrtech-widget-root.pos-bottom-right {
      bottom: 24px;
      right: 24px;
    }
    .mrtech-widget-root.pos-bottom-left {
      bottom: 24px;
      left: 24px;
    }

    /* Floating Launcher Button */
    .mrtech-widget-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%);
      border: 2px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.5), 0 8px 10px -6px rgba(37, 99, 235, 0.5);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      outline: none;
      user-select: none;
    }
    .mrtech-widget-btn:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 14px 30px -4px rgba(6, 182, 212, 0.65), 0 10px 14px -5px rgba(37, 99, 235, 0.6);
    }
    .mrtech-widget-btn:active {
      transform: scale(0.95);
    }

    /* Pulsing Outer Ring */
    .mrtech-widget-btn::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid #06b6d4;
      opacity: 0.5;
      animation: mrtech-pulse 2.4s infinite ease-out;
      pointer-events: none;
    }
    @keyframes mrtech-pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 0; }
      100% { transform: scale(1.2); opacity: 0; }
    }

    /* Launcher Icon Container */
    .mrtech-widget-icon-wrap {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s ease;
    }
    .mrtech-widget-btn.is-open .mrtech-widget-icon-open {
      display: none;
    }
    .mrtech-widget-btn.is-open .mrtech-widget-icon-close {
      display: flex;
    }
    .mrtech-widget-btn:not(.is-open) .mrtech-widget-icon-close {
      display: none;
    }

    /* Greeting / Callout Badge */
    .mrtech-widget-badge {
      position: absolute;
      bottom: 72px;
      background: #0f172a;
      border: 1px solid rgba(6, 182, 212, 0.4);
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      animation: mrtech-fade-in 0.4s ease-out;
      transition: opacity 0.3s ease, transform 0.3s ease;
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pos-bottom-right .mrtech-widget-badge {
      right: 0;
    }
    .pos-bottom-left .mrtech-widget-badge {
      left: 0;
    }
    .mrtech-widget-badge-close {
      color: #94a3b8;
      background: transparent;
      border: none;
      font-size: 16px;
      cursor: pointer;
      padding: 0 0 0 6px;
      line-height: 1;
    }
    .mrtech-widget-badge-close:hover {
      color: #ffffff;
    }

    /* Floating Chat Container Modal */
    .mrtech-widget-frame-container {
      position: absolute;
      bottom: 78px;
      width: 420px;
      height: 640px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 100px);
      background: #090d16;
      border: 1px solid rgba(59, 130, 246, 0.35);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.7), 0 0 35px -5px rgba(6, 182, 212, 0.25);
      display: flex;
      flex-direction: column;
      transform-origin: bottom right;
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
      pointer-events: none;
      transform: scale(0.9) translateY(20px);
      visibility: hidden;
    }
    .pos-bottom-right .mrtech-widget-frame-container {
      right: 0;
      transform-origin: bottom right;
    }
    .pos-bottom-left .mrtech-widget-frame-container {
      left: 0;
      transform-origin: bottom left;
    }

    .mrtech-widget-frame-container.is-visible {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1) translateY(0);
      visibility: visible;
    }

    /* Widget Header */
    .mrtech-widget-header {
      height: 48px;
      background: linear-gradient(90deg, #0b1329 0%, #0d1b38 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      flex-shrink: 0;
      user-select: none;
    }
    .mrtech-widget-title-area {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .mrtech-widget-avatar {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background: linear-gradient(135deg, #1d4ed8, #06b6d4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: bold;
      font-size: 13px;
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
    }
    .mrtech-widget-info {
      display: flex;
      flex-direction: column;
    }
    .mrtech-widget-name {
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.2px;
      line-height: 1.2;
    }
    .mrtech-widget-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      color: #94a3b8;
    }
    .mrtech-widget-status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    .mrtech-widget-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .mrtech-widget-ctrl-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .mrtech-widget-ctrl-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    /* The iframe */
    .mrtech-widget-iframe {
      width: 100%;
      height: 100%;
      flex: 1;
      border: none;
      background: #000000;
    }

    /* Mobile full responsive behavior */
    @media (max-width: 480px) {
      .mrtech-widget-root {
        bottom: 16px !important;
        right: 16px !important;
        left: auto !important;
      }
      .mrtech-widget-frame-container {
        position: fixed;
        inset: 12px;
        width: auto;
        height: auto;
        max-width: none;
        max-height: none;
        border-radius: 18px;
      }
    }

    @keyframes mrtech-fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleEl);

  // Create Widget Root Container
  const root = document.createElement('div');
  root.className = `mrtech-widget-root pos-${position}`;
  root.setAttribute('id', 'mrtech-ai-widget');

  // HTML Structure
  root.innerHTML = `
    <!-- Greeting Bubble -->
    ${
      showGreetingBadge
        ? `
      <div class="mrtech-widget-badge" id="mrtech-widget-badge">
        <span>✨ ${greeting}</span>
        <button class="mrtech-widget-badge-close" id="mrtech-badge-close" title="Dismiss">&times;</button>
      </div>
    `
        : ''
    }

    <!-- Floating Chat Modal Frame -->
    <div class="mrtech-widget-frame-container" id="mrtech-frame-container">
      <div class="mrtech-widget-header">
        <div class="mrtech-widget-title-area">
          <div class="mrtech-widget-avatar">M</div>
          <div class="mrtech-widget-info">
            <span class="mrtech-widget-name">MR TECH AI</span>
            <span class="mrtech-widget-status">
              <span class="mrtech-widget-status-dot"></span>
              Ultra-Fast • Online
            </span>
          </div>
        </div>
        <div class="mrtech-widget-controls">
          <button class="mrtech-widget-ctrl-btn" id="mrtech-btn-refresh" title="Reset Chat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
          </button>
          <button class="mrtech-widget-ctrl-btn" id="mrtech-btn-expand" title="Open in Full Window">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
          <button class="mrtech-widget-ctrl-btn" id="mrtech-btn-close" title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <iframe class="mrtech-widget-iframe" id="mrtech-iframe" title="MR TECH AI Chat" allow="clipboard-write; microphone;"></iframe>
    </div>

    <!-- Floating Circular Button -->
    <button class="mrtech-widget-btn" id="mrtech-launcher" aria-label="Open MR TECH AI Chat" title="${buttonTitle}">
      <div class="mrtech-widget-icon-wrap">
        <!-- Open Icon (Sparkle/Robot) -->
        <svg class="mrtech-widget-icon-open" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="22"></line>
          <line x1="8" y1="22" x2="16" y2="22"></line>
        </svg>
        <!-- Close Icon -->
        <svg class="mrtech-widget-icon-close" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    </button>
  `;

  document.body.appendChild(root);

  // Element References
  const launcher = document.getElementById('mrtech-launcher');
  const frameContainer = document.getElementById('mrtech-frame-container');
  const iframe = document.getElementById('mrtech-iframe');
  const badge = document.getElementById('mrtech-widget-badge');
  const badgeClose = document.getElementById('mrtech-badge-close');
  const btnClose = document.getElementById('mrtech-btn-close');
  const btnRefresh = document.getElementById('mrtech-btn-refresh');
  const btnExpand = document.getElementById('mrtech-btn-expand');

  let isOpen = false;
  let isIframeLoaded = false;

  function loadIframeIfNeeded() {
    if (!isIframeLoaded) {
      iframe.src = iframeUrl;
      isIframeLoaded = true;
    }
  }

  function openWidget() {
    isOpen = true;
    loadIframeIfNeeded();
    frameContainer.classList.add('is-visible');
    launcher.classList.add('is-open');
    if (badge) badge.style.display = 'none';
  }

  function closeWidget() {
    isOpen = false;
    frameContainer.classList.remove('is-visible');
    launcher.classList.remove('is-open');
  }

  function toggleWidget() {
    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }

  // Event Listeners
  launcher.addEventListener('click', toggleWidget);

  if (badge) {
    badge.addEventListener('click', (e) => {
      if (e.target !== badgeClose) {
        openWidget();
      }
    });
  }

  if (badgeClose) {
    badgeClose.addEventListener('click', (e) => {
      e.stopPropagation();
      badge.style.display = 'none';
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', closeWidget);
  }

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      if (iframe && isIframeLoaded) {
        iframe.src = iframeUrl;
      }
    });
  }

  if (btnExpand) {
    btnExpand.addEventListener('click', () => {
      window.open(hostUrl, '_blank');
    });
  }

  // Pre-load iframe when page is idle for instantaneous snappy opening
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      setTimeout(loadIframeIfNeeded, 1200);
    });
  } else {
    setTimeout(loadIframeIfNeeded, 2000);
  }

  // Global API exposed to external developers
  window.MRTechAIWidget = {
    open: openWidget,
    close: closeWidget,
    toggle: toggleWidget,
    reload: () => {
      if (iframe) iframe.src = iframeUrl;
    },
    version: '1.0.0',
    creator: 'RAYYAN',
  };
})();
