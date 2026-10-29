const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const GitHubService = require('../services/githubService');
const { getTemplate } = require('../services/templates');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'data', 'projects.json');

// Multer memory storage for uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper to classify file: Run (code/web) vs Storage (CDN asset/binary)
function classifyFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const storageExts = ['.exe', '.zip', '.tar', '.gz', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.mp4', '.mp3', '.pdf', '.woff', '.woff2'];
  if (storageExts.includes(ext) || filePath.startsWith('assets/') || filePath.startsWith('downloads/')) {
    return 'storage'; // Delivered via CDN
  }
  return 'run'; // Executed / rendered as web page or server script
}

// Load persisted projects
function loadProjects() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load projects.json:', err.message);
  }
  return [];
}

function saveProjects(projects) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write projects.json:', err.message);
  }
}

let globalProjects = loadProjects();

// Sync project files dynamically from GitHub repository
async function syncProjectFromGitHub(project, token) {
  if (!project || !token || token === 'demo-token' || !project.slug) return;
  const owner = project.owner || 'MagicalMadhur';
  const repo = `${project.slug}-source`;

  try {
    const service = new GitHubService(token, false);
    const treeRes = await service.api.get(`/repos/${owner}/${repo}/git/trees/main?recursive=1`);
    if (!treeRes.data || !Array.isArray(treeRes.data.tree)) return;

    const tree = treeRes.data.tree;
    const blobItems = tree.filter(item => item.type === 'blob');

    const updatedFiles = [];
    for (const item of blobItems) {
      const existing = (project.files || []).find(f => f.path === item.path);
      const isText = /\.(html|css|js|json|md|txt|py|env|yml|yaml|svg|xml|ini|toml)$/i.test(item.path);

      if (existing && existing.sha === item.sha && existing.content) {
        updatedFiles.push(existing);
        continue;
      }

      if (isText && item.size < 500000) {
        try {
          const blobRes = await service.api.get(`/repos/${owner}/${repo}/git/blobs/${item.sha}`);
          const content = Buffer.from(blobRes.data.content, 'base64').toString('utf-8');
          updatedFiles.push({
            path: item.path,
            content,
            size: item.size,
            sha: item.sha,
            isBinary: false
          });
        } catch (bErr) {
          if (existing) updatedFiles.push(existing);
        }
      } else {
        updatedFiles.push({
          path: item.path,
          content: `[Binary file: ${path.basename(item.path)}]`,
          size: item.size,
          sha: item.sha,
          isBinary: true
        });
      }
    }

    if (updatedFiles.length > 0) {
      project.files = updatedFiles;
      saveProjects(globalProjects);
    }
  } catch (err) {
    // Silently continue if repo tree can't be reached
  }
}

// List Projects (Strictly Isolated to the Logged-in User)
router.get('/', async (req, res) => {
  const user = req.session?.user;

  if (!user) {
    // If visitor is not authenticated, show zero stats and no private projects
    return res.json({
      authenticated: false,
      projects: [],
      totalMonthlyCost: '$0.00',
      totalBandwidthSaved: '0.0 GB',
      totalCostSaved: '$0.00'
    });
  }

  // Filter projects belonging exclusively to this authenticated user
  const userProjects = globalProjects.filter(p => p.owner === user.login || (!p.owner && user.login === 'MagicalMadhur'));

  // Ensure known projects (e.g. velocity) have correct liveUrl and gateway mappings
  userProjects.forEach(p => {
    if (p.slug === 'velocity' || p.name === 'velocity') {
      p.owner = 'MagicalMadhur';
      p.privateRepo = 'https://github.com/MagicalMadhur/velocity-source';
      p.publicRepo = 'https://github.com/MagicalMadhur/velocity-cdn';
      p.liveUrl = 'https://magicalmadhur.github.io/velocity-cdn/';
      p.cdnUrl = 'https://cdn.jsdelivr.net/gh/MagicalMadhur/velocity-cdn@latest/';
    }
  });

  // Sync projects from GitHub if user has an active token
  const token = req.session?.githubToken;
  if (token && token !== 'demo-token') {
    await Promise.all(userProjects.map(p => syncProjectFromGitHub(p, token)));
  }

  const activeCount = userProjects.filter(p => p.status === 'active').length;

  // Calculate actual file sizes stored
  let totalBytes = 0;
  userProjects.forEach(p => {
    (p.files || []).forEach(f => {
      totalBytes += (f.size || (f.content ? f.content.length : 2048));
    });
  });

  // Calculate dynamic stats
  const bandwidthGB = activeCount === 0 ? '0.0 GB' : (((totalBytes * 12) / (1024 * 1024 * 1024)) + (activeCount * 0.8)).toFixed(1) + ' GB';
  const costSaved = '$' + (activeCount * 12.00).toFixed(2);

  res.json({
    authenticated: true,
    user: user.login,
    projects: userProjects,
    totalMonthlyCost: '$0.00',
    totalBandwidthSaved: bandwidthGB,
    totalCostSaved: costSaved
  });
});

// Create / Deploy Project (Hostinger-style Automated 2-Repo Provisioning)
router.post('/', async (req, res) => {
  const { projectName, templateId, computeProvider, customFiles } = req.body;

  if (!projectName) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const user = req.session?.user;
  if (!user) {
    return res.status(401).json({ error: 'Please connect your GitHub account or use Demo Access before deploying.' });
  }

  const token = req.session?.githubToken || 'demo-token';
  const isDemo = !req.session?.githubToken || req.session?.githubToken === 'demo-token';

  const template = getTemplate(templateId || 'landing-page');
  const service = new GitHubService(token, isDemo);

  try {
    const project = await service.deployProject({
      projectName,
      template,
      computeProvider: computeProvider || template.compute,
      customFiles
    });

    // Tag the project with the current user's login ID
    project.owner = user.login;

    globalProjects.unshift(project);
    saveProjects(globalProjects);

    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live In-Browser Web Preview
router.get('/:id/preview', (req, res) => {
  const project = globalProjects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).send('<h1>Project not found</h1>');

  // Immediately redirect to real live URL if deployed (e.g. GitHub Pages)
  if (project.liveUrl && project.liveUrl.startsWith('http')) {
    return res.redirect(project.liveUrl);
  }

  const htmlFile = project.files.find(f => f.path.endsWith('.html') || f.path === 'src/index.html');
  if (!htmlFile) {
    return res.send(`
      <!DOCTYPE html><html><body style="font-family:sans-serif; background:#0f172a; color:#fff; padding:2rem;">
        <h2>API / Backend Project: ${project.name}</h2>
        <p>This is a backend service. Live endpoint: <code>/api/health</code></p>
      </body></html>
    `);
  }

  let html = htmlFile.content;

  // Inline CSS files
  const cssFiles = project.files.filter(f => f.path.endsWith('.css'));
  if (cssFiles.length > 0) {
    const styleBlock = cssFiles.map(css => `<style>\n/* ${css.path} */\n${css.content}\n</style>`).join('\n');
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${styleBlock}\n</head>`);
    } else {
      html = styleBlock + '\n' + html;
    }
  }

  // Inline JS files
  const jsFiles = project.files.filter(f => f.path.endsWith('.js') && !f.path.includes('worker'));
  if (jsFiles.length > 0) {
    const scriptBlock = jsFiles.map(js => `<script>\n// ${js.path}\n${js.content}\n</script>`).join('\n');
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${scriptBlock}\n</body>`);
    } else {
      html = html + '\n' + scriptBlock;
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Get Project Details & Classified Files
router.get('/:id', async (req, res) => {
  const project = globalProjects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Sync latest from GitHub if authenticated
  const token = req.session?.githubToken;
  if (token && token !== 'demo-token') {
    await syncProjectFromGitHub(project, token);
  }

  // Enrich files with classification and CDN URLs
  const enrichedFiles = (project.files || []).map(f => ({
    path: f.path,
    category: classifyFile(f.path),
    size: f.content ? Buffer.byteLength(f.content, 'utf-8') : (f.size || 0),
    cdnUrl: `${project.cdnUrl}${f.path.replace(/^src\//, '')}`
  }));

  res.json({ project: { ...project, fileDetails: enrichedFiles } });
});

// Upload Files into Project (File Manager)
router.post('/:id/upload', upload.array('files'), async (req, res) => {
  const project = globalProjects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const targetFolder = req.body.targetFolder || 'src/'; // 'src/' or 'assets/' or 'downloads/'
  const uploadedFiles = [];

  const token = req.session?.githubToken;
  const isDemo = !token || token === 'demo-token';
  const service = isDemo ? null : new GitHubService(token, false);
  const user = isDemo ? null : await service.getUser();

  for (const file of req.files) {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fullPath = `${targetFolder.replace(/\/$/, '')}/${cleanName}`;
    const isText = file.mimetype.startsWith('text/') || /\.(html|css|js|json|md|txt|py)$/i.test(cleanName);
    const content = isText ? file.buffer.toString('utf-8') : file.buffer.toString('base64');

    // Update in project
    const existingIndex = project.files.findIndex(f => f.path === fullPath);
    const fileObj = {
      path: fullPath,
      content: isText ? content : '[Binary file: ' + cleanName + ']',
      isBinary: !isText,
      size: file.size
    };

    if (existingIndex >= 0) {
      project.files[existingIndex] = fileObj;
    } else {
      project.files.push(fileObj);
    }

    uploadedFiles.push(fileObj);

    // Commit to real GitHub repo if authenticated
    if (!isDemo && service && user) {
      try {
        await service.createOrUpdateFile(
          user.login,
          `${project.slug}-source`,
          fullPath,
          isText ? content : file.buffer.toString('base64'),
          `Upload via ZeroHost File Manager: ${cleanName}`
        );
      } catch (err) {
        console.error('Failed to commit uploaded file to GitHub:', err.message);
      }
    }
  }

  project.logs.push(`[${new Date().toISOString().substring(11, 19)}] 📤 Uploaded ${uploadedFiles.length} file(s) into ${targetFolder}`);
  saveProjects(globalProjects);

  res.json({ success: true, uploaded: uploadedFiles, project });
});

// Save / Edit File in In-Browser Editor
router.put('/:id/file', async (req, res) => {
  const { path: filePath, content } = req.body;
  const project = globalProjects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  let file = project.files.find((f) => f.path === filePath);
  if (file) {
    file.content = content;
  } else {
    project.files.push({ path: filePath, content });
  }

  project.logs.push(`[${new Date().toISOString().substring(11, 19)}] ✏️ Edited ${filePath} & triggered auto-deploy.`);

  // Commit to real GitHub if authenticated
  const token = req.session?.githubToken;
  const isDemo = !token || token === 'demo-token';
  if (!isDemo) {
    try {
      const service = new GitHubService(token, false);
      const user = await service.getUser();
      await service.createOrUpdateFile(
        user.login,
        `${project.slug}-source`,
        filePath,
        content,
        `Web Editor Update: ${filePath}`
      );
    } catch (err) {
      console.error('Failed to commit edit to GitHub:', err.message);
    }
  }

  saveProjects(globalProjects);
  res.json({ success: true, message: 'File saved & redeployed!', project });
});

// Create New File
router.post('/:id/file', async (req, res) => {
  let { path: filePath, content } = req.body;
  const project = globalProjects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (!filePath) return res.status(400).json({ error: 'File path is required' });
  filePath = filePath.replace(/\\/g, '/').replace(/^\/+/, '');

  if (project.files.find((f) => f.path === filePath)) {
    return res.status(400).json({ error: 'File already exists' });
  }

  const newFile = { path: filePath, content: content || '' };
  project.files.push(newFile);
  project.logs.push(`[${new Date().toISOString().substring(11, 19)}] ➕ Created file ${filePath}`);

  const token = req.session?.githubToken;
  const isDemo = !token || token === 'demo-token';
  if (!isDemo) {
    try {
      const service = new GitHubService(token, false);
      const user = await service.getUser();
      await service.createOrUpdateFile(
        user.login,
        `${project.slug}-source`,
        filePath,
        content || '',
        `Created: ${filePath}`
      );
    } catch (err) {
      console.error('Failed to commit new file:', err.message);
    }
  }

  saveProjects(globalProjects);
  res.status(201).json({ success: true, file: newFile, project });
});

// Delete File
router.delete('/:id/file', async (req, res) => {
  const { path: filePath } = req.body;
  const project = globalProjects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const index = project.files.findIndex(f => f.path === filePath);
  if (index === -1) return res.status(404).json({ error: 'File not found' });

  project.files.splice(index, 1);
  project.logs.push(`[${new Date().toISOString().substring(11, 19)}] 🗑️ Deleted file ${filePath}`);
  saveProjects(globalProjects);

  res.json({ success: true, message: `Deleted ${filePath}` });
});

// Delete Project
router.delete('/:id', (req, res) => {
  const index = globalProjects.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });

  globalProjects.splice(index, 1);
  saveProjects(globalProjects);
  res.json({ success: true });
});

module.exports = router;
