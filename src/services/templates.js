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

