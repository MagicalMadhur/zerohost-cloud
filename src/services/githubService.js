/**
 * =============================================================================
 * GitHub Service — Automatic Repository & Deployment Orchestrator
 * =============================================================================
 * Manages GitHub API calls:
 * - Creates private source repo
 * - Creates public CDN repo
 * - Pushes template files & GitHub Action deploy workflows
 * - Encrypts & sets secrets (DEPLOY_TOKEN) via libsodium / tweetsodium
 * - Configures GitHub Pages
 * Includes instant Sandbox/Demo Engine for testing without OAuth keys.
 * =============================================================================
 */

const axios = require('axios');
const sodium = require('tweetsodium');

const wait = (ms) => new Promise(res => setTimeout(res, ms));

class GitHubService {
  constructor(token, isDemo = false) {
    this.token = token;
    this.isDemo = isDemo || !token || token.startsWith('demo-');
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'ZeroHost-Cloud-Platform'
      }
    });
  }

  /**
   * Get user profile details
   */
  async getUser() {
    if (this.isDemo) {
      return {
        login: 'demo-creator',
        name: 'Creator Demo',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        public_repos: 12,
        email: 'creator@zerohost.dev',
        isDemo: true
      };
    }
    const res = await this.api.get('/user');
    return {
      login: res.data.login,
      name: res.data.name || res.data.login,
      avatar_url: res.data.avatar_url,
      email: res.data.email,
      public_repos: res.data.public_repos,
      isDemo: false
    };
  }

  /**
   * Encrypt and store a GitHub Actions Secret using LibSodium sealed box with retry
   */
  async setRepoSecret(owner, repo, secretName, secretValue) {
    if (this.isDemo) return true;

    // GitHub Actions API can take a moment after repo initialization
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await wait(1200 * attempt);
        const keyRes = await this.api.get(`/repos/${owner}/${repo}/actions/secrets/public-key`);
        const { key_id, key } = keyRes.data;

        const messageBytes = Buffer.from(secretValue);
        const keyBytes = Buffer.from(key, 'base64');
        const encryptedBytes = sodium.seal(messageBytes, keyBytes);
        const encrypted_value = Buffer.from(encryptedBytes).toString('base64');

        await this.api.put(`/repos/${owner}/${repo}/actions/secrets/${secretName}`, {
          encrypted_value,
          key_id
        });
        return true;
      } catch (err) {
        if (attempt === 3) {
          console.error(`Failed to set GitHub Actions secret "${secretName}":`, err.response?.data?.message || err.message);
          return false;
        }
      }
    }
  }

  /**
   * Complete 1-Click Provisioning Flow
   */
  async deployProject({ projectName, template, computeProvider, customFiles }) {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'app';
    const privateRepoName = `${slug}-source`;
    const publicRepoName = `${slug}-cdn`;

    const logs = [];
    const addLog = (msg) => logs.push(`[${new Date().toISOString().substring(11, 19)}] ${msg}`);

    addLog(`🚀 Starting deployment for "${projectName}"...`);
    addLog(`Selected Template: ${template.name} (${template.language})`);
    addLog(`Compute Runtime: ${computeProvider}`);

    if (this.isDemo) {
      // Simulate real-time deployment steps
      addLog(`[Step 1/5] Creating private repository: ${privateRepoName} (🔒 Hidden)`);
      addLog(`[Step 2/5] Creating public gateway repository: ${publicRepoName} (🌍 Public)`);
      addLog(`[Step 3/5] Committing initial files & GitHub Actions workflow...`);
      addLog(`[Step 4/5] Injecting DEPLOY_TOKEN secret into ${privateRepoName}`);
      addLog(`[Step 5/5] Provisioning jsDelivr CDN route & GitHub Pages...`);
      addLog(`✅ Deployed successfully! Global CDN edge initialized.`);

      const liveUrl = `https://demo-creator.github.io/${publicRepoName}/`;
      const cdnUrl = `https://cdn.jsdelivr.net/gh/demo-creator/${publicRepoName}@latest/`;

      return {
        id: 'proj_' + Math.random().toString(36).substring(2, 9),
        name: projectName,
        slug,
        templateId: template.id,
        computeProvider,
        privateRepo: `https://github.com/demo-creator/${privateRepoName}`,
        publicRepo: `https://github.com/demo-creator/${publicRepoName}`,
        liveUrl,
        cdnUrl,
        status: 'active',
        createdAt: new Date().toISOString(),
        logs,
        files: customFiles || template.files.map(f => ({
          path: f.path,
          content: f.content.replace(/{{PROJECT_NAME}}/g, projectName).replace(/{{PROJECT_SLUG}}/g, slug)
        }))
      };
    }

    // REAL GITHUB API EXECUTION
    try {
      const user = await this.getUser();
      const owner = user.login;

      // 1. Create Private Repository
      addLog(`[Step 1/5] Creating private repository: ${privateRepoName}...`);
      await this.api.post('/user/repos', {
        name: privateRepoName,
        private: true,
        description: `ZeroHost Source: ${projectName} (Private Codebase)`,
        auto_init: true
      });

      // 2. Create Public Repository
      addLog(`[Step 2/5] Creating public gateway repository: ${publicRepoName}...`);
      await this.api.post('/user/repos', {
        name: publicRepoName,
        private: false,
        description: `ZeroHost Gateway: ${projectName} (Auto-deployed Assets & Pages)`,
        auto_init: true
      });

      // 3. Prepare Files
      const filesToPush = customFiles || template.files.map(f => ({
        path: f.path,
        content: f.content.replace(/{{PROJECT_NAME}}/g, projectName).replace(/{{PROJECT_SLUG}}/g, slug)
      }));

      // Add workflow file
      const workflowContent = this.generateWorkflow(owner, publicRepoName);
      filesToPush.push({
        path: '.github/workflows/deploy.yml',
        content: workflowContent
      });

      // 4. Push Files to Private Repo
      addLog(`[Step 3/5] Pushing starter code & workflow to ${privateRepoName}...`);
      for (const file of filesToPush) {
        await this.createOrUpdateFile(owner, privateRepoName, file.path, file.content, 'Initial ZeroHost commit');
      }

      // 5. Automatically Inject DEPLOY_TOKEN secret into private repo
      addLog(`[Step 4/5] Encrypting & injecting DEPLOY_TOKEN secret...`);
      const secretSet = await this.setRepoSecret(owner, privateRepoName, 'DEPLOY_TOKEN', this.token);
      if (secretSet) {
        addLog(`✅ DEPLOY_TOKEN secret configured for automated sync.`);
      } else {
        addLog(`⚠️ Automated token injection skipped (can be set in Repo Settings).`);
      }

      // 6. Enable GitHub Pages on public repo
      addLog(`[Step 5/5] Configuring GitHub Pages on ${publicRepoName}...`);
      try {
        await this.api.post(`/repos/${owner}/${publicRepoName}/pages`, {
          source: { branch: 'main', path: '/' }
        });
        addLog(`✅ GitHub Pages active.`);
      } catch (pagesErr) {
        addLog(`GitHub Pages will activate upon first build commit.`);
      }

      const liveUrl = `https://${owner}.github.io/${publicRepoName}/`;
      const cdnUrl = `https://cdn.jsdelivr.net/gh/${owner}/${publicRepoName}@latest/`;

      addLog(`✅ Deployed successfully! Global CDN edge initialized.`);

      return {
        id: 'proj_' + Math.random().toString(36).substring(2, 9),
        name: projectName,
        slug,
        templateId: template.id,
        computeProvider,
        privateRepo: `https://github.com/${owner}/${privateRepoName}`,
        publicRepo: `https://github.com/${owner}/${publicRepoName}`,
        liveUrl,
        cdnUrl,
        status: 'active',
        createdAt: new Date().toISOString(),
        logs,
        files: filesToPush
      };
    } catch (err) {
      addLog(`❌ Error: ${err.response?.data?.message || err.message}`);
      throw new Error(err.response?.data?.message || err.message);
    }
  }

  /**
   * Commit a single file to a GitHub repository
   */
  async createOrUpdateFile(owner, repo, filePath, content, commitMessage) {
    let sha = null;
    try {
      const existing = await this.api.get(`/repos/${owner}/${repo}/contents/${filePath}`);
      sha = existing.data.sha;
    } catch (e) {
      // file doesn't exist yet
    }

    const payload = {
      message: commitMessage,
      content: Buffer.from(content).toString('base64')
    };
    if (sha) payload.sha = sha;

    return this.api.put(`/repos/${owner}/${repo}/contents/${filePath}`, payload);
  }

  /**
   * GitHub Action generator with resilient asset prep & jsDelivr cache purge
   */
  generateWorkflow(owner, publicRepo) {
    return `name: ZeroHost Auto Deploy
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Prepare Assets
        run: |
          mkdir -p dist
          if [ -d "src" ]; then
            cp -r src/* dist/
          else
            find . -maxdepth 1 ! -name '.' ! -name '.git' ! -name '.github' ! -name 'dist' -exec cp -r {} dist/ \\;
          fi
          touch dist/.nojekyll
      - name: Deploy to Public Gateway
        run: |
          mkdir -p gateway
          git clone https://x-access-token:\${{ secrets.DEPLOY_TOKEN }}@github.com/${owner}/${publicRepo}.git gateway || true
          cd gateway
          if [ ! -d ".git" ]; then
            git init
            git remote add origin https://x-access-token:\${{ secrets.DEPLOY_TOKEN }}@github.com/${owner}/${publicRepo}.git
          fi
          git checkout -B main
          find . -maxdepth 1 -not -name '.git' -not -name '.' -not -name '..' -exec rm -rf {} + 2>/dev/null || true
          cp -r ../dist/* ./
          git config user.name "ZeroHost Bot"
          git config user.email "bot@zerohost.dev"
          git add -A
          git diff --staged --quiet || (git commit -m "🚀 Auto Deploy: $(date -u '+%Y-%m-%d %H:%M:%S')" && git push -u origin main --force)
      - name: Purge jsDelivr CDN Cache
        run: |
          curl -s "https://purge.jsdelivr.net/gh/${owner}/${publicRepo}@latest/" || true
`;
  }
}

module.exports = GitHubService;
