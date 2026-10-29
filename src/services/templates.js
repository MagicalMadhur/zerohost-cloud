/**
 * =============================================================================
 * ZeroHost - Pre-built Project Starters
 * =============================================================================
 * Templates designed for non-technical users to launch in 1-click.
 * Each template generates:
 *  - Starter source files (HTML/CSS/JS or backend code)
 *  - Auto-deploy GitHub Actions workflow
 * =============================================================================
 */

const TEMPLATES = [
{
  "id": "velocity-showcase",
  "name": "Velocity Download Manager Site",
  "category": "frontend",
  "language": "HTML / CSS / JS",
  "icon": "⚡",
  "description": "Global launch site for Velocity with live speed benchmark simulation, 4K/8K specs, and v1.0.3 installer downloads.",
  "compute": "github_pages_jsdelivr",
  "recommendedCompute": "GitHub Pages + jsDelivr CDN (100% Free)",
  "badge": "Featured",
  "files": [
    {
      "path": "src/index.html",
      "content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Velocity — The Free 32-Thread Download Manager Built to Destroy IDM</title>\n  <meta name=\"description\" content=\"Velocity is a free, open-source multi-threaded download manager that bypasses browser throttling with up to 32 parallel connections, native 4K/8K video extraction, and bundled FFmpeg audio merge.\">\n  <link rel=\"icon\" href=\"https://cdn.jsdelivr.net/gh/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle@main/download_manager/velocity.ico\">\n  <link rel=\"stylesheet\" href=\"css/style.css\">\n  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n  <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap\" rel=\"stylesheet\">\n</head>\n<body>\n\n  <!-- Navigation -->\n  <header class=\"navbar\">\n    <div class=\"nav-container\">\n      <a href=\"#\" class=\"brand\">\n        <img src=\"https://cdn.jsdelivr.net/gh/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle@main/edge_store_logo_300x300.png\" alt=\"Velocity Logo\" class=\"brand-logo\">\n        <span class=\"brand-text\">Velocity</span>\n      </a>\n\n      <nav class=\"nav-links\">\n        <a href=\"#features\">Features</a>\n        <a href=\"#benchmark\">Benchmark</a>\n        <a href=\"#compare\">Velocity vs IDM</a>\n        <a href=\"#screenshots\">Screenshots</a>\n        <a href=\"#download\" class=\"nav-download-btn\">Download v1.0.3</a>\n      </nav>\n    </div>\n  </header>\n\n  <!-- Hero Section -->\n  <main>\n    <section class=\"hero\">\n      <div class=\"hero-glow\"></div>\n      <div class=\"hero-container\">\n        <div class=\"release-pill\">\n          <span class=\"pill-dot\"></span>\n          <span class=\"pill-text\">Latest Release v1.0.3 • 100% Free & Open Source</span>\n          <span class=\"pill-arrow\">→</span>\n        </div>\n\n        <h1 class=\"hero-title\">\n          Bypass Browser Throttling.<br>\n          <span class=\"gradient-text\">Download at Terminal Velocity.</span>\n        </h1>\n\n        <p class=\"hero-subtitle\">\n          Browsers artificially restrict downloads to a single slow connection. \n          <strong>Velocity</strong> unleashes up to <strong>32 parallel range threads</strong>, extracts hidden 4K/8K streams via <code>yt-dlp</code>, and merges high-res audio automatically using bundled <code>FFmpeg</code>.\n        </p>\n\n        <div class=\"hero-actions\">\n          <a href=\"https://github.com/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle/releases/download/v1.0.3/Velocity_Setup.exe\" class=\"btn btn-primary\">\n            <span class=\"btn-icon\">⚡</span>\n            <div class=\"btn-text\">\n              <span class=\"btn-main\">Download for Windows</span>\n              <span class=\"btn-sub\">Velocity_Setup.exe • v1.0.3 (64-bit)</span>\n            </div>\n          </a>\n\n          <a href=\"https://github.com/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle/releases/download/v1.0.3/Velocity_Extension.zip\" class=\"btn btn-secondary\">\n            <span class=\"btn-icon\">🧩</span>\n            <div class=\"btn-text\">\n              <span class=\"btn-main\">Browser Extension</span>\n              <span class=\"btn-sub\">Chrome, Edge & Brave</span>\n            </div>\n          </a>\n\n          <a href=\"https://github.com/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle\" target=\"_blank\" class=\"btn btn-github\">\n            <span class=\"btn-icon\">⭐️</span>\n            <div class=\"btn-text\">\n              <span class=\"btn-main\">Star on GitHub</span>\n              <span class=\"btn-sub\">Open Source (MIT)</span>\n            </div>\n          </a>\n        </div>\n\n        <!-- Live Simulated Speed Visualizer -->\n        <div class=\"benchmark-card\" id=\"benchmark\">\n          <div class=\"benchmark-header\">\n            <div class=\"bench-badge\">LIVE SPEED BENCHMARK</div>\n            <div class=\"bench-title\">3GB ISO File Download Acceleration</div>\n          </div>\n\n          <div class=\"bench-streams\">\n            <!-- Browser throttled single connection -->\n            <div class=\"stream-item\">\n              <div class=\"stream-info\">\n                <span class=\"stream-name\">❌ Standard Browser (Chrome / Edge / Firefox)</span>\n                <span class=\"stream-stat\" id=\"browser-speed\">1 Stream • 2.4 MB/s (Throttled)</span>\n              </div>\n              <div class=\"progress-track\">\n                <div class=\"progress-bar bar-browser\" id=\"browser-bar\"></div>\n              </div>\n            </div>\n\n            <!-- Velocity multi-connection -->\n            <div class=\"stream-item\">\n              <div class=\"stream-info\">\n                <span class=\"stream-name\">⚡ Velocity Download Manager</span>\n                <span class=\"stream-stat highlight\" id=\"velocity-speed\">32 Parallel Threads • 16.8 MB/s (Saturated)</span>\n              </div>\n              <div class=\"progress-track\">\n                <div class=\"progress-bar bar-velocity\" id=\"velocity-bar\"></div>\n              </div>\n            </div>\n          </div>\n          <div class=\"benchmark-footer\">\n            <span>Result: Velocity delivers <strong>3x to 5x faster downloads</strong> by saturating available network bandwidth.</span>\n          </div>\n        </div>\n      </div>\n    </section>\n\n    <!-- Key Features Grid -->\n    <section class=\"section\" id=\"features\">\n      <div class=\"section-container\">\n        <div class=\"section-tag\">ENGINEERED FOR RAW SPEED</div>\n        <h2 class=\"section-title\">Everything IDM does. Plus everything browsers withhold.</h2>\n        <p class=\"section-subtitle\">No subscriptions, no serial keys, and no artificial limitations.</p>\n\n        <div class=\"features-grid\">\n          <div class=\"feature-card\">\n            <div class=\"feature-icon\">🚀</div>\n            <h3>32-Thread Parallel Acceleration</h3>\n            <p>Splits every file into concurrent byte-range requests. Assembles segments directly on disk with preallocated seek offsets to completely bypass single-socket throttling.</p>\n          </div>\n\n          <div class=\"feature-card\">\n            <div class=\"feature-icon\">🎬</div>\n            <h3>4K, 1440p & 8K Video Extraction</h3>\n            <p>Browsers only give you 720p streams. Velocity uses embedded <code>yt-dlp</code> to capture hidden master-quality video files from YouTube, Vimeo, and video platforms worldwide.</p>\n          </div>\n\n          <div class=\"feature-card\">\n            <div class=\"feature-icon\">🔊</div>\n            <h3>Bundled FFmpeg & Loudness Norm</h3>\n            <p>High-res video and audio streams are merged seamlessly on the fly. Applies FFmpeg <code>loudnorm</code> calibration to eliminate jarring volume spikes.</p>\n          </div>\n\n          <div class=\"feature-card\">\n            <div class=\"feature-icon\">🎛️</div>\n            <h3>Token-Bucket Rate Limiting</h3>\n            <p>A true global rate limiter governs all active threads across all downloads. Cap your bandwidth consumption precisely so gaming and streaming stay buffer-free.</p>\n          </div>\n\n          <div class=\"feature-card\">\n            <div class=\"feature-icon\">📁</div>\n            <h3>Smart File Auto-Categorization</h3>\n            <p>Automatically organizes downloads into Videos, Music, Documents, Images, Compressed Archives, and Software based on file extensions.</p>\n          </div>\n\n          <div class=\"feature-card\">\n            <div class=\"feature-icon\">🧩</div>\n            <h3>Seamless Browser Interception</h3>\n            <p>Lightweight extension communicates with Velocity on local port <code>127.0.0.1:6800</code> to catch download clicks and inject overlay buttons directly onto video players.</p>\n          </div>\n        </div>\n      </div>\n    </section>\n\n    <!-- Velocity vs Competitors Matrix -->\n    <section class=\"section section-dark\" id=\"compare\">\n      <div class=\"section-container\">\n        <div class=\"section-tag\">THE COMPARISON</div>\n        <h2 class=\"section-title\">Why switch from IDM or standard browsers?</h2>\n\n        <div class=\"table-wrapper\">\n          <table class=\"compare-table\">\n            <thead>\n              <tr>\n                <th>Feature</th>\n                <th class=\"col-highlight\">⚡ Velocity</th>\n                <th>Standard Browser</th>\n                <th>Internet Download Manager (IDM)</th>\n              </tr>\n            </thead>\n            <tbody>\n              <tr>\n                <td>Price & Licensing</td>\n                <td class=\"col-highlight\"><strong>100% Free & Open Source (MIT)</strong></td>\n                <td>Free (Built-in)</td>\n                <td>$24.95 / year (Paid License)</td>\n              </tr>\n              <tr>\n                <td>Max Parallel Streams</td>\n                <td class=\"col-highlight\"><strong>Up to 32 Threads</strong></td>\n                <td>1 Thread (Throttled)</td>\n                <td>8 – 16 Threads</td>\n              </tr>\n              <tr>\n                <td>Video Resolution Capture</td>\n                <td class=\"col-highlight\"><strong>Up to 8K (yt-dlp engine)</strong></td>\n                <td>Max 720p (Browser stream)</td>\n                <td>1080p (Requires manual codecs)</td>\n              </tr>\n              <tr>\n                <td>Audio-Video Auto Merge</td>\n                <td class=\"col-highlight\"><strong>Bundled FFmpeg + Loudness Filter</strong></td>\n                <td>None</td>\n                <td>Requires external tools</td>\n              </tr>\n              <tr>\n                <td>Rate Limiting Algorithm</td>\n                <td class=\"col-highlight\"><strong>True Global Token-Bucket</strong></td>\n                <td>None</td>\n                <td>Per-download approximation</td>\n              </tr>\n              <tr>\n                <td>System Tray & Auto-Shutdown</td>\n                <td class=\"col-highlight\"><strong>Yes (Windows Native)</strong></td>\n                <td>No</td>\n                <td>Yes</td>\n              </tr>\n              <tr>\n                <td>Telemetry & Ads</td>\n                <td class=\"col-highlight\"><strong>Zero Telemetry • Zero Ads</strong></td>\n                <td>Telemetry Enabled</td>\n                <td>Periodic upgrade popups</td>\n              </tr>\n            </tbody>\n          </table>\n        </div>\n      </div>\n    </section>\n\n    <!-- App Screenshots -->\n    <section class=\"section\" id=\"screenshots\">\n      <div class=\"section-container\">\n        <div class=\"section-tag\">NATIVE WINDOWS EXPERIENCE</div>\n        <h2 class=\"section-title\">Clean, Dark-Themed & Distraction Free</h2>\n        <p class=\"section-subtitle\">Crafted with modern CustomTkinter, real-time speed graphs, and system tray minimization.</p>\n\n        <div class=\"screenshots-grid\">\n          <div class=\"screenshot-box\">\n            <img src=\"https://cdn.jsdelivr.net/gh/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle@main/edge_screenshot_1.png\" alt=\"Velocity Main Download Queue\" class=\"screen-img\">\n            <div class=\"screen-caption\">Main Download Queue — Real-time thread progress, speed graph & category filters</div>\n          </div>\n          <div class=\"screenshot-box\">\n            <img src=\"https://cdn.jsdelivr.net/gh/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle@main/edge_screenshot_2.png\" alt=\"Velocity Browser Extension Popup\" class=\"screen-img\">\n            <div class=\"screen-caption\">Native Browser Integration — Seamless video capture overlay on Edge, Brave & Chrome</div>\n          </div>\n        </div>\n      </div>\n    </section>\n\n    <!-- Downloads Call to Action -->\n    <section class=\"section section-cta\" id=\"download\">\n      <div class=\"section-container\">\n        <div class=\"cta-box\">\n          <div class=\"cta-badge\">GET STARTED IN SECONDS</div>\n          <h2 class=\"cta-title\">Ready to unlock your true internet speed?</h2>\n          <p class=\"cta-subtitle\">Download Velocity today. Pre-bundled with FFmpeg, setup wizard, and browser extension.</p>\n\n          <div class=\"download-cards\">\n            <div class=\"dl-card\">\n              <div class=\"dl-icon\">🖥️</div>\n              <div class=\"dl-name\">Velocity for Windows</div>\n              <div class=\"dl-version\">Version 1.0.3 • 64-bit Installer</div>\n              <div class=\"dl-desc\">Includes standalone installer, desktop shortcut creation, bundled FFmpeg runtime, and system chime alerts.</div>\n              <a href=\"https://github.com/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle/releases/download/v1.0.3/Velocity_Setup.exe\" class=\"btn btn-primary dl-btn\">\n                <span>⬇️</span> Download Velocity_Setup.exe\n              </a>\n            </div>\n\n            <div class=\"dl-card\">\n              <div class=\"dl-icon\">🧩</div>\n              <div class=\"dl-name\">Browser Extension Package</div>\n              <div class=\"dl-version\">Version 1.3 • Chromium Extension</div>\n              <div class=\"dl-desc\">Lightweight packed extension for Google Chrome, Microsoft Edge, and Brave. Automatic download detection.</div>\n              <a href=\"https://github.com/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle/releases/download/v1.0.3/Velocity_Extension.zip\" class=\"btn btn-secondary dl-btn\">\n                <span>⬇️</span> Download Extension (.zip)\n              </a>\n            </div>\n          </div>\n\n          <div class=\"cta-install-note\">\n            <span>💡 Running from source? Run <code>git clone https://github.com/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle.git</code> and <code>pip install -r requirements.txt</code></span>\n          </div>\n        </div>\n      </div>\n    </section>\n  </main>\n\n  <!-- Footer -->\n  <footer class=\"footer\">\n    <div class=\"footer-container\">\n      <div class=\"footer-left\">\n        <div class=\"brand\">\n          <img src=\"https://cdn.jsdelivr.net/gh/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle@main/edge_store_logo_300x300.png\" alt=\"Velocity\" class=\"brand-logo sm\">\n          <span class=\"brand-text\">Velocity</span>\n        </div>\n        <p class=\"footer-quote\"><em>\"Built with love, to destroy IDM.\"</em></p>\n        <p class=\"footer-copy\">Crafted by <a href=\"https://github.com/MagicalMadhur\" target=\"_blank\">Madhur Chavan (@MagicalMadhur)</a>. Licensed under the MIT License.</p>\n      </div>\n\n      <div class=\"footer-right\">\n        <div class=\"footer-links-col\">\n          <h4>Project</h4>\n          <a href=\"https://github.com/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle\" target=\"_blank\">GitHub Repository</a>\n          <a href=\"https://github.com/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle/releases\" target=\"_blank\">Releases & Changelog</a>\n          <a href=\"https://github.com/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle/issues\" target=\"_blank\">Issue Tracker</a>\n        </div>\n        <div class=\"footer-links-col\">\n          <h4>Hosting & Infrastructure</h4>\n          <span class=\"footer-tag\">⚡ Powered by ZeroHost</span>\n          <span class=\"footer-tag\">🌍 GitHub Pages + jsDelivr CDN</span>\n          <span class=\"footer-tag\">💰 $0.00 / month Global Hosting</span>\n        </div>\n      </div>\n    </div>\n  </footer>\n\n  <script src=\"js/main.js\"></script>\n</body>\n</html>\n\n"
    },
    {
      "path": "src/css/style.css",
      "content": "/* =============================================================================\n   Velocity Download Manager — Global Launch Landing Page Styles\n   ============================================================================= */\n\n:root {\n  --bg-dark: #07090e;\n  --bg-card: #0e131f;\n  --bg-surface: #151d30;\n  --border: rgba(255, 255, 255, 0.08);\n  --border-glow: rgba(0, 242, 254, 0.35);\n\n  --cyan: #00f2fe;\n  --blue: #4facfe;\n  --purple: #8b5cf6;\n  --green: #10b981;\n  --danger: #ef4444;\n\n  --text-main: #f8fafc;\n  --text-muted: #94a3b8;\n  --text-dim: #64748b;\n\n  --font-main: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;\n  --font-mono: 'Fira Code', monospace;\n}\n\n* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nhtml {\n  scroll-behavior: smooth;\n}\n\nbody {\n  font-family: var(--font-main);\n  background-color: var(--bg-dark);\n  color: var(--text-main);\n  line-height: 1.6;\n  overflow-x: hidden;\n  -webkit-font-smoothing: antialiased;\n}\n\n/* ---- Navbar ---- */\n.navbar {\n  position: sticky;\n  top: 0;\n  z-index: 100;\n  background: rgba(7, 9, 14, 0.75);\n  backdrop-filter: blur(14px);\n  border-bottom: 1px solid var(--border);\n}\n\n.nav-container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 1rem 1.5rem;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.brand {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  text-decoration: none;\n}\n\n.brand-logo {\n  width: 36px;\n  height: 36px;\n  border-radius: 8px;\n  object-fit: cover;\n}\n\n.brand-logo.sm {\n  width: 28px;\n  height: 28px;\n}\n\n.brand-text {\n  font-size: 1.35rem;\n  font-weight: 800;\n  letter-spacing: -0.02em;\n  background: linear-gradient(135deg, #fff 40%, var(--cyan) 100%);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n.nav-links {\n  display: flex;\n  align-items: center;\n  gap: 1.8rem;\n}\n\n.nav-links a {\n  color: var(--text-muted);\n  text-decoration: none;\n  font-size: 0.95rem;\n  font-weight: 500;\n  transition: color 0.2s;\n}\n\n.nav-links a:hover {\n  color: var(--cyan);\n}\n\n.nav-download-btn {\n  background: linear-gradient(135deg, var(--blue), var(--cyan)) !important;\n  color: #000 !important;\n  font-weight: 700 !important;\n  padding: 0.55rem 1.25rem;\n  border-radius: 9999px;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n\n.nav-download-btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 18px rgba(0, 242, 254, 0.4);\n}\n\n/* ---- Hero Section ---- */\n.hero {\n  position: relative;\n  padding: 6.5rem 1.5rem 5rem;\n  text-align: center;\n  overflow: hidden;\n}\n\n.hero-glow {\n  position: absolute;\n  top: -150px;\n  left: 50%;\n  transform: translateX(-50%);\n  width: 700px;\n  height: 500px;\n  background: radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, rgba(79, 172, 254, 0.08) 50%, transparent 80%);\n  filter: blur(80px);\n  pointer-events: none;\n}\n\n.hero-container {\n  max-width: 950px;\n  margin: 0 auto;\n  position: relative;\n  z-index: 10;\n}\n\n.release-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.6rem;\n  background: rgba(0, 242, 254, 0.08);\n  border: 1px solid rgba(0, 242, 254, 0.3);\n  padding: 0.4rem 1.2rem;\n  border-radius: 9999px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: var(--cyan);\n  margin-bottom: 2rem;\n  box-shadow: 0 0 20px rgba(0, 242, 254, 0.1);\n}\n\n.pill-dot {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  background: var(--green);\n  box-shadow: 0 0 8px var(--green);\n}\n\n.pill-arrow {\n  color: var(--text-dim);\n}\n\n.hero-title {\n  font-size: 3.8rem;\n  font-weight: 800;\n  line-height: 1.12;\n  letter-spacing: -0.03em;\n  margin-bottom: 1.5rem;\n}\n\n.gradient-text {\n  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #8b5cf6 100%);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n.hero-subtitle {\n  font-size: 1.25rem;\n  color: var(--text-muted);\n  max-width: 720px;\n  margin: 0 auto 3rem;\n  line-height: 1.6;\n}\n\n.hero-subtitle strong {\n  color: #fff;\n}\n\n.hero-subtitle code {\n  font-family: var(--font-mono);\n  background: rgba(255, 255, 255, 0.08);\n  padding: 2px 6px;\n  border-radius: 4px;\n  color: var(--cyan);\n}\n\n/* Buttons */\n.hero-actions {\n  display: flex;\n  gap: 1.25rem;\n  justify-content: center;\n  flex-wrap: wrap;\n  margin-bottom: 4rem;\n}\n\n.btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.85rem;\n  padding: 0.85rem 1.6rem;\n  border-radius: 12px;\n  text-decoration: none;\n  font-size: 0.95rem;\n  font-weight: 600;\n  transition: all 0.25s ease;\n  text-align: left;\n}\n\n.btn-icon {\n  font-size: 1.5rem;\n}\n\n.btn-text {\n  display: flex;\n  flex-direction: column;\n}\n\n.btn-main {\n  font-size: 1rem;\n  font-weight: 700;\n}\n\n.btn-sub {\n  font-size: 0.75rem;\n  opacity: 0.8;\n  font-weight: 500;\n}\n\n.btn-primary {\n  background: linear-gradient(135deg, var(--blue), var(--cyan));\n  color: #050a14;\n  box-shadow: 0 4px 25px rgba(0, 242, 254, 0.35);\n}\n\n.btn-primary:hover {\n  transform: translateY(-3px);\n  box-shadow: 0 8px 32px rgba(0, 242, 254, 0.5);\n}\n\n.btn-secondary {\n  background: var(--bg-card);\n  color: var(--text-main);\n  border: 1px solid var(--border);\n}\n\n.btn-secondary:hover {\n  background: var(--bg-surface);\n  border-color: rgba(255, 255, 255, 0.2);\n  transform: translateY(-2px);\n}\n\n.btn-github {\n  background: rgba(255, 255, 255, 0.04);\n  color: var(--text-main);\n  border: 1px solid var(--border);\n}\n\n.btn-github:hover {\n  background: rgba(255, 255, 255, 0.08);\n  border-color: rgba(255, 255, 255, 0.25);\n  transform: translateY(-2px);\n}\n\n/* Benchmark Card */\n.benchmark-card {\n  background: var(--bg-card);\n  border: 1px solid var(--border-glow);\n  border-radius: 20px;\n  padding: 2rem;\n  max-width: 820px;\n  margin: 0 auto;\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 242, 254, 0.08);\n}\n\n.benchmark-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 1.75rem;\n}\n\n.bench-badge {\n  font-size: 0.75rem;\n  font-family: var(--font-mono);\n  background: rgba(0, 242, 254, 0.1);\n  color: var(--cyan);\n  padding: 3px 10px;\n  border-radius: 6px;\n  font-weight: 700;\n}\n\n.bench-title {\n  font-size: 0.95rem;\n  color: var(--text-muted);\n}\n\n.bench-streams {\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n  margin-bottom: 1.5rem;\n}\n\n.stream-info {\n  display: flex;\n  justify-content: space-between;\n  font-size: 0.9rem;\n  font-weight: 600;\n  margin-bottom: 0.5rem;\n}\n\n.stream-name {\n  color: #fff;\n}\n\n.stream-stat {\n  font-family: var(--font-mono);\n  color: var(--text-dim);\n}\n\n.stream-stat.highlight {\n  color: var(--cyan);\n  font-weight: 700;\n}\n\n.progress-track {\n  height: 12px;\n  background: rgba(255, 255, 255, 0.06);\n  border-radius: 9999px;\n  overflow: hidden;\n  position: relative;\n}\n\n.progress-bar {\n  height: 100%;\n  border-radius: 9999px;\n  transition: width 1s linear;\n}\n\n.bar-browser {\n  width: 22%;\n  background: #64748b;\n}\n\n.bar-velocity {\n  width: 88%;\n  background: linear-gradient(90deg, var(--blue), var(--cyan));\n  box-shadow: 0 0 15px rgba(0, 242, 254, 0.6);\n}\n\n.benchmark-footer {\n  font-size: 0.85rem;\n  color: var(--text-muted);\n  border-top: 1px solid var(--border);\n  padding-top: 1rem;\n}\n\n.benchmark-footer strong {\n  color: var(--green);\n}\n\n/* Sections */\n.section {\n  padding: 6rem 1.5rem;\n}\n\n.section-dark {\n  background: #05070b;\n  border-top: 1px solid var(--border);\n  border-bottom: 1px solid var(--border);\n}\n\n.section-container {\n  max-width: 1200px;\n  margin: 0 auto;\n}\n\n.section-tag {\n  font-size: 0.8rem;\n  font-family: var(--font-mono);\n  color: var(--cyan);\n  font-weight: 700;\n  letter-spacing: 0.1em;\n  text-transform: uppercase;\n  margin-bottom: 0.75rem;\n  text-align: center;\n}\n\n.section-title {\n  font-size: 2.6rem;\n  font-weight: 800;\n  text-align: center;\n  letter-spacing: -0.02em;\n  margin-bottom: 0.75rem;\n}\n\n.section-subtitle {\n  font-size: 1.15rem;\n  color: var(--text-muted);\n  text-align: center;\n  max-width: 650px;\n  margin: 0 auto 3.5rem;\n}\n\n/* Features Grid */\n.features-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));\n  gap: 1.75rem;\n}\n\n.feature-card {\n  background: var(--bg-card);\n  border: 1px solid var(--border);\n  border-radius: 16px;\n  padding: 2.25rem 2rem;\n  transition: all 0.3s;\n}\n\n.feature-card:hover {\n  transform: translateY(-4px);\n  border-color: var(--border-glow);\n  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);\n}\n\n.feature-icon {\n  font-size: 2.5rem;\n  margin-bottom: 1.25rem;\n}\n\n.feature-card h3 {\n  font-size: 1.35rem;\n  font-weight: 700;\n  margin-bottom: 0.6rem;\n  color: #fff;\n}\n\n.feature-card p {\n  color: var(--text-muted);\n  font-size: 0.95rem;\n  line-height: 1.6;\n}\n\n.feature-card code {\n  font-family: var(--font-mono);\n  background: rgba(0, 242, 254, 0.1);\n  color: var(--cyan);\n  padding: 2px 6px;\n  border-radius: 4px;\n}\n\n/* Comparison Table */\n.table-wrapper {\n  overflow-x: auto;\n  margin-top: 3rem;\n  background: var(--bg-card);\n  border: 1px solid var(--border);\n  border-radius: 16px;\n  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);\n}\n\n.compare-table {\n  width: 100%;\n  border-collapse: collapse;\n  text-align: left;\n}\n\n.compare-table th,\n.compare-table td {\n  padding: 1.25rem 1.5rem;\n  border-bottom: 1px solid var(--border);\n}\n\n.compare-table th {\n  font-size: 0.85rem;\n  text-transform: uppercase;\n  color: var(--text-dim);\n  font-weight: 700;\n  letter-spacing: 0.05em;\n  background: rgba(0, 0, 0, 0.2);\n}\n\n.compare-table td {\n  font-size: 0.95rem;\n  color: var(--text-muted);\n}\n\n.compare-table tr:last-child td {\n  border-bottom: none;\n}\n\n.col-highlight {\n  background: rgba(0, 242, 254, 0.04);\n  color: #fff !important;\n  border-left: 1px solid rgba(0, 242, 254, 0.2);\n  border-right: 1px solid rgba(0, 242, 254, 0.2);\n}\n\n/* Screenshots */\n.screenshots-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));\n  gap: 2rem;\n  margin-top: 2rem;\n}\n\n.screenshot-box {\n  background: var(--bg-card);\n  border: 1px solid var(--border);\n  border-radius: 16px;\n  overflow: hidden;\n  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);\n}\n\n.screen-img {\n  width: 100%;\n  height: auto;\n  display: block;\n  transition: transform 0.3s ease;\n}\n\n.screenshot-box:hover .screen-img {\n  transform: scale(1.02);\n}\n\n.screen-caption {\n  padding: 1rem 1.25rem;\n  font-size: 0.85rem;\n  color: var(--text-muted);\n  background: rgba(0, 0, 0, 0.3);\n  border-top: 1px solid var(--border);\n}\n\n/* CTA Box */\n.section-cta {\n  background: linear-gradient(180deg, var(--bg-dark) 0%, #0a1120 100%);\n}\n\n.cta-box {\n  background: linear-gradient(135deg, rgba(14, 19, 31, 0.9), rgba(21, 29, 48, 0.8));\n  border: 1px solid var(--border-glow);\n  border-radius: 24px;\n  padding: 4rem 2rem;\n  text-align: center;\n  position: relative;\n  overflow: hidden;\n  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);\n}\n\n.cta-badge {\n  display: inline-block;\n  font-size: 0.75rem;\n  font-family: var(--font-mono);\n  color: var(--cyan);\n  background: rgba(0, 242, 254, 0.1);\n  padding: 4px 12px;\n  border-radius: 9999px;\n  font-weight: 700;\n  margin-bottom: 1rem;\n}\n\n.cta-title {\n  font-size: 2.8rem;\n  font-weight: 800;\n  letter-spacing: -0.02em;\n  margin-bottom: 0.75rem;\n}\n\n.cta-subtitle {\n  font-size: 1.15rem;\n  color: var(--text-muted);\n  max-width: 600px;\n  margin: 0 auto 3rem;\n}\n\n.download-cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1.5rem;\n  max-width: 800px;\n  margin: 0 auto 2.5rem;\n}\n\n.dl-card {\n  background: var(--bg-card);\n  border: 1px solid var(--border);\n  border-radius: 16px;\n  padding: 2rem;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  text-align: center;\n  transition: transform 0.2s, border-color 0.2s;\n}\n\n.dl-card:hover {\n  transform: translateY(-3px);\n  border-color: var(--cyan);\n}\n\n.dl-icon {\n  font-size: 3rem;\n  margin-bottom: 1rem;\n}\n\n.dl-name {\n  font-size: 1.25rem;\n  font-weight: 700;\n  color: #fff;\n  margin-bottom: 0.25rem;\n}\n\n.dl-version {\n  font-size: 0.8rem;\n  font-family: var(--font-mono);\n  color: var(--cyan);\n  margin-bottom: 0.75rem;\n}\n\n.dl-desc {\n  font-size: 0.85rem;\n  color: var(--text-muted);\n  margin-bottom: 1.5rem;\n  flex: 1;\n}\n\n.dl-btn {\n  width: 100%;\n  justify-content: center;\n  text-align: center;\n}\n\n.cta-install-note {\n  font-size: 0.85rem;\n  color: var(--text-dim);\n}\n\n.cta-install-note code {\n  font-family: var(--font-mono);\n  color: var(--text-muted);\n}\n\n/* Footer */\n.footer {\n  border-top: 1px solid var(--border);\n  background: #04060a;\n  padding: 4rem 1.5rem 3rem;\n}\n\n.footer-container {\n  max-width: 1200px;\n  margin: 0 auto;\n  display: flex;\n  justify-content: space-between;\n  flex-wrap: wrap;\n  gap: 3rem;\n}\n\n.footer-left {\n  max-width: 380px;\n}\n\n.footer-quote {\n  color: var(--cyan);\n  font-size: 1rem;\n  margin: 1rem 0 0.5rem;\n}\n\n.footer-copy {\n  font-size: 0.85rem;\n  color: var(--text-muted);\n}\n\n.footer-copy a {\n  color: #fff;\n  text-decoration: none;\n}\n\n.footer-right {\n  display: flex;\n  gap: 4rem;\n  flex-wrap: wrap;\n}\n\n.footer-links-col {\n  display: flex;\n  flex-direction: column;\n  gap: 0.6rem;\n}\n\n.footer-links-col h4 {\n  font-size: 0.9rem;\n  color: #fff;\n  font-weight: 700;\n  margin-bottom: 0.5rem;\n}\n\n.footer-links-col a {\n  color: var(--text-muted);\n  text-decoration: none;\n  font-size: 0.85rem;\n  transition: color 0.2s;\n}\n\n.footer-links-col a:hover {\n  color: var(--cyan);\n}\n\n.footer-tag {\n  font-size: 0.8rem;\n  color: var(--text-dim);\n}\n\n/* Responsive */\n@media (max-width: 768px) {\n  .hero-title { font-size: 2.5rem; }\n  .section-title { font-size: 2rem; }\n  .nav-links { display: none; }\n  .benchmark-card { padding: 1.5rem; }\n  .screenshots-grid { grid-template-columns: 1fr; }\n}\n\n"
    },
    {
      "path": "src/js/main.js",
      "content": "/**\n * =============================================================================\n * Velocity Download Manager — Interactive Front-End Script\n * =============================================================================\n */\n\ndocument.addEventListener('DOMContentLoaded', () => {\n  initBenchmarkSimulation();\n  fetchGitHubStats();\n});\n\n// Interactive Speed Benchmark Animation\nfunction initBenchmarkSimulation() {\n  const browserBar = document.getElementById('browser-bar');\n  const velocityBar = document.getElementById('velocity-bar');\n  const browserSpeed = document.getElementById('browser-speed');\n  const velocitySpeed = document.getElementById('velocity-speed');\n\n  if (!browserBar || !velocityBar) return;\n\n  let browserProgress = 0;\n  let velocityProgress = 0;\n\n  function runCycle() {\n    browserProgress = 0;\n    velocityProgress = 0;\n    browserBar.style.width = '0%';\n    velocityBar.style.width = '0%';\n\n    const interval = setInterval(() => {\n      // Browser advances slowly (1x single thread)\n      browserProgress += 0.8;\n      // Velocity advances rapidly (32 threads parallel)\n      velocityProgress += 3.8;\n\n      if (browserBar) browserBar.style.width = Math.min(browserProgress, 100) + '%';\n      if (velocityBar) velocityBar.style.width = Math.min(velocityProgress, 100) + '%';\n\n      // Dynamic speed fluctuations\n      if (browserSpeed && browserProgress < 100) {\n        const jitter = (2.2 + Math.random() * 0.4).toFixed(1);\n        browserSpeed.textContent = `1 Stream • ${jitter} MB/s (Throttled)`;\n      }\n\n      if (velocitySpeed && velocityProgress < 100) {\n        const jitter = (16.2 + Math.random() * 1.8).toFixed(1);\n        velocitySpeed.textContent = `32 Parallel Threads • ${jitter} MB/s (Saturated)`;\n      }\n\n      if (velocityProgress >= 100 && browserProgress >= 28) {\n        if (velocitySpeed) velocitySpeed.textContent = `✅ Completed in 3.1s! (32 Threads)`;\n        clearInterval(interval);\n        setTimeout(runCycle, 4000); // Restart simulation after pause\n      }\n    }, 100);\n  }\n\n  runCycle();\n}\n\n// Fetch live GitHub Stars\nasync function fetchGitHubStats() {\n  try {\n    const res = await fetch('https://api.github.com/repos/MagicalMadhur/Velocity-Download-Manager-Anti-Browser-Throttle');\n    if (!res.ok) return;\n    const data = await res.json();\n    if (data.stargazers_count !== undefined) {\n      const starText = document.querySelector('.btn-github .btn-sub');\n      if (starText) {\n        starText.textContent = `⭐ ${data.stargazers_count} Stars on GitHub`;\n      }\n    }\n  } catch (e) {\n    // Silent fallback\n  }\n}\n\n"
    }
  ]
},
  {
    id: "landing-page",
    name: "Modern Landing Page",
    category: "frontend",
    language: "HTML / CSS / JS",
    icon: "🚀",
    description: "High-converting modern landing page with glassmorphism, responsive mobile layout, and dark mode.",
    compute: "github_pages_jsdelivr",
    recommendedCompute: "GitHub Pages + jsDelivr CDN (100% Free)",
    badge: "Most Popular",
    files: [
      {
        path: "src/index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PROJECT_NAME}} — Launched on ZeroHost</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="navbar">
    <div class="logo">✨ {{PROJECT_NAME}}</div>
    <a href="#cta" class="nav-btn">Get Started</a>
  </header>

  <main class="hero">
    <span class="pill">⚡ Hosted for $0 with ZeroHost</span>
    <h1>The Next Generation of <br><span class="gradient-text">Zero-Cost Hosting</span></h1>
    <p>Your source files are private. Your assets stream at lightspeed via jsDelivr CDN. Zero server costs.</p>
    <div class="actions">
      <a href="#features" class="btn primary">Learn More</a>
      <a href="#contact" class="btn secondary">Contact Us</a>
    </div>
  </main>

  <section id="features" class="features">
    <div class="card">
      <div class="icon">🔒</div>
      <h3>Private Source Code</h3>
      <p>Nobody can view your backend algorithms, configurations, or unpublished files.</p>
    </div>
    <div class="card">
      <div class="icon">🌍</div>
      <h3>Global CDN Edge</h3>
      <p>Served by jsDelivr and GitHub Pages edge networks in under 30ms worldwide.</p>
    </div>
    <div class="card">
      <div class="icon">💰</div>
      <h3>100% Free Forever</h3>
      <p>No credit card required. No surprise invoices. Free bandwidth and storage.</p>
    </div>
  </section>

  <footer>
    <p>&copy; 2026 {{PROJECT_NAME}}. Built with ZeroHost.</p>
  </footer>

  <script src="js/main.js"></script>
</body>
</html>`
      },
      {
        path: "src/css/style.css",
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: #090d16;
  --surface: #121927;
  --primary: #6366f1;
  --accent: #06b6d4;
  --text: #f8fafc;
  --muted: #94a3b8;
}
body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2.5rem;
  background: rgba(18, 25, 39, 0.7);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.logo { font-size: 1.25rem; font-weight: 700; color: var(--accent); }
.nav-btn {
  background: var(--primary);
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: opacity 0.2s;
}
.nav-btn:hover { opacity: 0.9; }
.hero {
  text-align: center;
  padding: 6rem 1.5rem 4rem;
  max-width: 900px;
  margin: 0 auto;
}
.pill {
  display: inline-block;
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent);
  border: 1px solid rgba(6, 182, 212, 0.3);
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
}
.gradient-text {
  background: linear-gradient(135deg, #818cf8 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero p {
  font-size: 1.25rem;
  color: var(--muted);
  max-width: 650px;
  margin: 0 auto 2.5rem;
}
.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.btn {
  padding: 0.85rem 2rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s, background 0.2s;
}
.btn.primary { background: var(--primary); color: #fff; }
.btn.primary:hover { transform: translateY(-2px); }
.btn.secondary { background: var(--surface); color: var(--text); border: 1px solid rgba(255,255,255,0.12); }
.btn.secondary:hover { background: rgba(255,255,255,0.05); }

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1100px;
  margin: 4rem auto;
  padding: 0 1.5rem;
}
.card {
  background: var(--surface);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2.25rem 1.75rem;
  transition: transform 0.2s, border-color 0.2s;
}
.card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.4);
}
.icon { font-size: 2.2rem; margin-bottom: 1rem; }
.card h3 { font-size: 1.3rem; margin-bottom: 0.6rem; color: #fff; }
.card p { color: var(--muted); font-size: 0.95rem; }

footer {
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--muted);
  font-size: 0.9rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}

@media (max-width: 768px) {
  h1 { font-size: 2.3rem; }
  .navbar { padding: 1rem; }
}`
      },
      {
        path: "src/js/main.js",
        content: `console.log("✨ {{PROJECT_NAME}} initialized via ZeroHost!");
document.addEventListener("DOMContentLoaded", () => {
  console.log("Page ready. Assets delivered via jsDelivr CDN.");
});`
      }
    ]
  },
  {
    id: "nodejs-api",
    name: "Node.js REST API",
    category: "backend",
    language: "Node.js / Express",
    icon: "🟢",
    description: "Complete REST API backend with JSON endpoints, CORS enabled, and instant serverless deployment.",
    compute: "cloudflare_workers",
    recommendedCompute: "Cloudflare Workers (100k requests/day Free)",
    badge: "Backend Ready",
    files: [
      {
        path: "src/worker.js",
        content: `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'online',
        app: '{{PROJECT_NAME}}',
        uptime: (typeof process !== 'undefined' && process.uptime) ? process.uptime() : 'active',
        cost: '$0/mo',
        runtime: 'Cloudflare Worker'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (url.pathname === '/api/data') {
      return new Response(JSON.stringify({
        project: '{{PROJECT_NAME}}',
        items: [
          { id: 1, title: 'Item 1', status: 'Ready' },
          { id: 2, title: 'Item 2', status: 'Pending' }
        ]
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      message: 'Welcome to {{PROJECT_NAME}} API!',
      endpoints: ['/api/health', '/api/data']
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};`
      },
      {
        path: "package.json",
        content: `{
  "name": "{{PROJECT_SLUG}}",
  "version": "1.0.0",
  "main": "src/worker.js",
  "scripts": {
    "start": "node src/worker.js"
  }
}`
      }
    ]
  },
  {
    id: "portfolio",
    name: "Developer & Creator Portfolio",
    category: "frontend",
    language: "HTML / Tailwind Style",
    icon: "💼",
    description: "Sleek portfolio showcasing projects, bio, skills, and direct contact form.",
    compute: "github_pages_jsdelivr",
    recommendedCompute: "GitHub Pages + jsDelivr CDN",
    badge: "Personal",
    files: [
      {
        path: "src/index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PROJECT_NAME}} — Portfolio</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="container">
    <header>
      <div class="avatar">👨‍💻</div>
      <h1>{{PROJECT_NAME}}</h1>
      <p class="tagline">Developer • Creator • Problem Solver</p>
    </header>

    <section class="section">
      <h2>About Me</h2>
      <p>I build elegant software, websites, and digital experiences hosted completely on high-performance cloud networks.</p>
    </section>

    <section class="section">
      <h2>Featured Works</h2>
      <div class="grid">
        <div class="project-box">
          <h3>⚡ Cloud Project A</h3>
          <p>Zero-cost web server utilizing GitHub repositories and jsDelivr CDN architecture.</p>
        </div>
        <div class="project-box">
          <h3>📱 Mobile Application</h3>
          <p>Real-time cross platform app connected to modern edge backend.</p>
        </div>
      </div>
    </section>
  </div>
</body>
</html>`
      },
      {
        path: "src/css/style.css",
        content: `body {
  font-family: -apple-system, system-ui, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
  margin: 0;
  padding: 40px 20px;
}
.container { max-width: 720px; margin: 0 auto; }
header { text-align: center; margin-bottom: 40px; }
.avatar { font-size: 60px; margin-bottom: 10px; }
h1 { font-size: 2.2rem; margin: 5px 0; color: #38bdf8; }
.tagline { color: #94a3b8; font-size: 1.1rem; }
.section { margin-bottom: 35px; }
.section h2 { border-bottom: 1px solid #334155; padding-bottom: 8px; color: #f1f5f9; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
.project-box { background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; }
.project-box h3 { margin-top: 0; color: #38bdf8; font-size: 1.1rem; }
.project-box p { color: #94a3b8; font-size: 0.9rem; }
@media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }`
      }
    ]
  },
  {
    id: "python-microservice",
    name: "Python API Microservice",
    category: "backend",
    language: "Python / Flask",
    icon: "🐍",
    description: "Lightweight Python microservice for data processing and API webhooks.",
    compute: "render",
    recommendedCompute: "Render / Vercel Python Runtime (Free Tier)",
    badge: "Python",
    files: [
      {
        path: "app.py",
        content: `from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "service": "{{PROJECT_NAME}}",
        "framework": "Python Flask",
        "cost": "$0/mo"
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}
    return jsonify({
        "received": data,
        "result": "Processed successfully by Python backend"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
`
      },
      {
        path: "requirements.txt",
        content: `Flask==3.0.3
flask-cors==4.0.1
gunicorn==22.0.0
`
      },
      {
        path: "Procfile",
        content: "web: gunicorn app:app\n"
      }
    ]
  }
];

function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}

module.exports = {
  TEMPLATES,
  getTemplate,
};

