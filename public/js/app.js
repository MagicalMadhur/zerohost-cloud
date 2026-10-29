/**
 * =============================================================================
 * ZeroHost — Front-End Application Logic
 * =============================================================================
 */

let state = {
  user: null,
  hasCliLogin: false,
  projects: [],
  templates: [],
  selectedTemplateId: 'velocity-showcase',
  selectedCompute: 'github_pages_jsdelivr',
  wizardStep: 1,
  activeFileManagerProjectId: null,
  activeFileManagerFilePath: null,
  activeFileManagerTargetFolder: 'src',
  activeEditorProjectId: null,
  activeEditorFilePath: null,
};

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupDropzone();
  handleUrlParams();
  await checkAuth();
  await loadTemplates();
  if (state.user) {
    await loadProjects();
  }
});

// Handle URL query notices / errors
function handleUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const notice = params.get('notice');
  const error = params.get('error');

  if (notice) {
    let msg = 'Notice: System message received.';
    if (notice === 'oauth_not_configured_demo_enabled') {
      msg = 'ℹ️ GitHub OAuth credentials not detected yet. Add GITHUB_CLIENT_ID in Render Environment settings to enable global 1-click login.';
    }
    showNotification(msg, 'info');
  } else if (error) {
    showNotification(`⚠️ Authentication notice: ${error}`, 'error');
  }
}

function showNotification(msg, type = 'info') {
  const banner = document.getElementById('notification-banner');
  const text = document.getElementById('notification-text');
  if (!banner || !text) return;
  text.textContent = msg;
  banner.style.display = 'flex';
  if (type === 'error') {
    banner.style.background = 'rgba(239, 68, 68, 0.2)';
    banner.style.color = '#fca5a5';
  } else {
    banner.style.background = 'rgba(99, 102, 241, 0.15)';
    banner.style.color = '#c7d2fe';
  }
}

function dismissNotification() {
  const banner = document.getElementById('notification-banner');
  if (banner) banner.style.display = 'none';
  window.history.replaceState({}, document.title, window.location.pathname);
}

// Navigation & Tab Switching
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-menu .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const tab = item.getAttribute('data-tab');
      if (tab) {
        e.preventDefault();
        switchTab(tab);
      }
    });
  });

  // Project search
  const searchInput = document.getElementById('project-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      renderProjects(state.projects.filter(p => p.name.toLowerCase().includes(query) || p.slug.includes(query)));
    });
  }
}

function switchTab(tabName) {
  if (tabName === 'editor') tabName = 'filemanager';

  document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
  });

  const views = ['projects', 'wizard', 'filemanager', 'architecture'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.style.display = (v === tabName) ? 'block' : 'none';
  });

  if (tabName === 'filemanager') {
    populateFileManagerProjectDropdown();
  }
}

// View Mode Switching (Public Marketing Site vs Protected Console)
function updateAppViewMode() {
  const publicView = document.getElementById('public-view');
  const appView = document.getElementById('app-view');
  const publicAuthActions = document.getElementById('public-auth-actions');

  if (state.user) {
    // Authenticated user -> Show Console Dashboard, Hide Public Site
    if (publicView) publicView.style.display = 'none';
    if (appView) appView.style.display = 'flex';
    switchTab('projects');
    renderAuth();

    if (publicAuthActions) {
      publicAuthActions.innerHTML = `
        <button class="btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.85rem;" onclick="showAppConsole()">
          <span>⚡</span> Open Console →
        </button>
      `;
    }
  } else {
    // Guest / Unauthenticated -> Show Public Marketing Site, Hide Console Dashboard
    if (publicView) publicView.style.display = 'block';
    if (appView) appView.style.display = 'none';

    if (publicAuthActions) {
      publicAuthActions.innerHTML = `
        <button class="btn-github-login" style="padding: 0.5rem 1.1rem; font-size: 0.85rem;" onclick="openSignInModal()">
          <span>🐙</span> Sign In with GitHub
        </button>
        <button class="btn-primary" style="padding: 0.5rem 1.1rem; font-size: 0.85rem;" onclick="openSignInModal()">
          <span>🚀</span> Get Started Free
        </button>
      `;
    }
    updateCalculator();
  }
}

function showPublicSite() {
  const publicView = document.getElementById('public-view');
  const appView = document.getElementById('app-view');
  if (publicView) publicView.style.display = 'block';
  if (appView) appView.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateCalculator();
}

function showAppConsole() {
  const publicView = document.getElementById('public-view');
  const appView = document.getElementById('app-view');
  if (state.user) {
    if (publicView) publicView.style.display = 'none';
    if (appView) appView.style.display = 'flex';
    switchTab('projects');
  } else {
    openSignInModal();
  }
}

// Interactive Hosting Savings Calculator
function updateCalculator() {
  const sitesInput = document.getElementById('calc-slider-sites');
  const bandwidthInput = document.getElementById('calc-slider-bandwidth');
  const storageInput = document.getElementById('calc-slider-storage');

  if (!sitesInput || !bandwidthInput) return;

  const sites = parseInt(sitesInput.value, 10) || 1;
  const bandwidth = parseInt(bandwidthInput.value, 10) || 50;
  const storage = parseInt(storageInput.value, 10) || 500;

  const elSites = document.getElementById('calc-val-sites');
  const elBw = document.getElementById('calc-val-bandwidth');
  const elStorage = document.getElementById('calc-val-storage');

  if (elSites) elSites.textContent = `${sites} site${sites > 1 ? 's' : ''}`;
  if (elBw) elBw.textContent = bandwidth >= 1000 ? `${(bandwidth / 1000).toFixed(1)} TB` : `${bandwidth} GB`;
  if (elStorage) elStorage.textContent = storage >= 1000 ? `${(storage / 1000).toFixed(1)} GB` : `${storage} MB`;

  // Hostinger renewal calculation ($11.99/mo + extra sites fees)
  const hostingerAnnual = (sites <= 1 ? 47.88 : (sites * 38 + 140));

  // Vercel Pro: $20/mo/user ($240/yr) + $40 per 100GB over 100GB
  const vercelOverage = Math.max(0, bandwidth - 100);
  const vercelAnnual = (sites > 1 ? 240 : 0) + (vercelOverage > 0 ? (vercelOverage / 100 * 40 * 12) : 0);

  // AWS Cloud: $15/mo base EC2 + $0.09/GB egress bandwidth + S3 storage
  const awsAnnual = (sites * 15 * 12) + (bandwidth * 0.09 * 12) + (sites * (storage / 1000) * 0.023 * 12);

  const costH = document.getElementById('calc-cost-hostinger');
  const costV = document.getElementById('calc-cost-vercel');
  const costA = document.getElementById('calc-cost-aws');
  const totalSaved = document.getElementById('calc-total-saved');

  if (costH) costH.textContent = `$${Math.round(hostingerAnnual)} / yr`;
  if (costV) costV.textContent = `$${Math.round(vercelAnnual)} / yr`;
  if (costA) costA.textContent = `$${Math.round(awsAnnual)} / yr`;

  const avgSaved = Math.round((hostingerAnnual + vercelAnnual + awsAnnual) / 3);
  if (totalSaved) totalSaved.textContent = `$${avgSaved.toLocaleString()}.00`;
}

// Setup drag & drop on File Manager dropzone
function setupDropzone() {
  const dropzone = document.getElementById('filemanager-dropzone');
  if (!dropzone) return;

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--accent)';
    dropzone.style.background = 'rgba(99, 102, 241, 0.15)';
  });

  dropzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    dropzone.style.background = 'rgba(0, 0, 0, 0.15)';
  });

  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    dropzone.style.background = 'rgba(0, 0, 0, 0.15)';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFilesToProject(e.dataTransfer.files, 'assets');
    }
  });
}

// Authentication
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    state.user = data.user;
    state.hasCliLogin = data.hasCliLogin;
  } catch (err) {
    console.error('Auth check error:', err);
    state.user = null;
  }
  updateAppViewMode();
}

function renderAuth() {
  const container = document.getElementById('auth-container');
  if (!container) return;

  if (state.user) {
    container.innerHTML = `
      <div class="user-badge" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); padding: 0.35rem 0.85rem; border-radius: 9999px; display: flex; align-items: center; gap: 0.6rem;">
        <img src="${state.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="user-avatar" alt="Avatar" style="width: 24px; height: 24px; border-radius: 50%;">
        <span class="user-name" style="font-weight: 700; font-size: 0.85rem; color: #fff;">@${state.user.login || state.user.name}</span>
        <span style="font-size: 0.65rem; background: var(--success); color: #000; font-weight: 800; padding: 1px 5px; border-radius: 4px;">PRO ($0)</span>
        <button class="btn-logout" title="Log out" onclick="logout()" style="background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 1.1rem; line-height: 1;">×</button>
      </div>
    `;
  } else {
    container.innerHTML = '';
  }
}

function openSignInModal() {
  const modal = document.getElementById('signin-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  const cliBox = document.getElementById('signin-cli-box');
  if (cliBox) {
    if (state.hasCliLogin) {
      cliBox.innerHTML = `
        <button class="btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem; margin-bottom: 1rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%);" onclick="cliLogin()">
          <span>⚡</span> Quick Sign-In via Local GitHub CLI (@MagicalMadhur)
        </button>
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
          <div style="flex: 1; height: 1px; background: var(--border);"></div>
          <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">or</span>
          <div style="flex: 1; height: 1px; background: var(--border);"></div>
        </div>
      `;
      cliBox.style.display = 'block';
    } else {
      cliBox.innerHTML = '';
      cliBox.style.display = 'none';
    }
  }
}

function closeSignInModal() {
  const modal = document.getElementById('signin-modal');
  if (modal) modal.style.display = 'none';
}

async function handleTokenLogin() {
  const input = document.getElementById('input-pat-token');
  const token = input ? input.value.trim() : '';

  if (!token) {
    alert('Please enter a valid GitHub token.');
    return;
  }

  showNotification('Authenticating with GitHub...');

  try {
    const res = await fetch('/api/auth/token-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication failed');

    state.user = data.user;
    closeSignInModal();
    updateAppViewMode();
    await loadProjects();
    showNotification(`⚡ Successfully signed in as @${data.user.login}! Ready to manage deployments.`);
  } catch (err) {
    alert('Sign in error: ' + err.message);
  }
}

async function cliLogin() {
  try {
    const res = await fetch('/api/auth/cli-login', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      state.user = data.user;
      closeSignInModal();
      updateAppViewMode();
      await loadProjects();
      showNotification(`⚡ Signed in as @${data.user.login}! Ready to manage your cloud deployments.`);
    } else {
      showNotification(`⚠️ ${data.error}`, 'error');
    }
  } catch (err) {
    showNotification('Sign in error: ' + err.message, 'error');
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  state.user = null;
  state.projects = [];
  updateAppViewMode();
}

// Templates Loader
async function loadTemplates() {
  try {
    const res = await fetch('/api/templates');
    const data = await res.json();
    state.templates = data.templates || [];
    renderTemplates();
  } catch (err) {
    console.error('Failed to load templates:', err);
  }
}

function renderTemplates() {
  const container = document.getElementById('template-options');
  if (!container) return;

  container.innerHTML = state.templates.map(t => `
    <div class="template-card ${t.id === state.selectedTemplateId ? 'selected' : ''}" 
         onclick="selectTemplate('${t.id}')">
      <span class="template-badge">${t.badge}</span>
      <div class="template-icon">${t.icon}</div>
      <div class="template-title">${t.name}</div>
      <div class="template-desc">${t.description}</div>
      <div style="margin-top: 0.75rem; font-size: 0.75rem; color: var(--accent); font-weight: 600;">
        ⚡ ${t.language}
      </div>
    </div>
  `).join('');
}

function selectTemplate(templateId) {
  state.selectedTemplateId = templateId;
  const tmpl = state.templates.find(t => t.id === templateId);
  if (tmpl) {
    state.selectedCompute = tmpl.compute;
    updateComputeCardsSelection();
  }
  renderTemplates();
}

function selectCompute(cardEl) {
  document.querySelectorAll('.compute-card').forEach(c => c.classList.remove('selected'));
  cardEl.classList.add('selected');
  state.selectedCompute = cardEl.getAttribute('data-compute');
}

function updateComputeCardsSelection() {
  document.querySelectorAll('.compute-card').forEach(c => {
    c.classList.toggle('selected', c.getAttribute('data-compute') === state.selectedCompute);
  });
}

// Wizard Steps Flow
function goToWizardStep(step) {
  state.wizardStep = step;
  [1, 2, 3].forEach(s => {
    const stepEl = document.getElementById(`wizard-step-${s}`);
    const indEl = document.getElementById(`step-ind-${s}`);
    if (stepEl) stepEl.style.display = (s === step) ? 'block' : 'none';
    if (indEl) indEl.classList.toggle('active', s <= step);
  });
}

// Project Deployment Submission
async function handleWizardSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('wizard-project-name');
  const launchBtn = document.getElementById('btn-launch-deploy');
  const projectName = nameInput.value.trim();
  if (!projectName) return;

  if (launchBtn) {
    launchBtn.disabled = true;
    launchBtn.innerHTML = '<span>⏳</span> Launching...';
  }

  openDeployModal(projectName);

  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName,
        templateId: state.selectedTemplateId,
        computeProvider: state.selectedCompute,
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to deploy project');

    // Stream logs into terminal
    await streamLogs(data.project.logs || []);

    // Show completion box
    document.getElementById('terminal-step-badge').textContent = 'Live!';
    document.getElementById('terminal-success-box').style.display = 'block';
    document.getElementById('modal-live-link').href = data.project.liveUrl;
    document.getElementById('modal-preview-link').href = `/api/projects/${data.project.id}/preview`;

    nameInput.value = '';
    goToWizardStep(1);
    await loadProjects();
  } catch (err) {
    appendLog(`❌ Deployment Error: ${err.message}`);
    document.getElementById('terminal-step-badge').textContent = 'Failed';
    const errBox = document.getElementById('terminal-error-box');
    if (errBox) {
      document.getElementById('terminal-error-desc').textContent = err.message;
      errBox.style.display = 'block';
    }
  } finally {
    if (launchBtn) {
      launchBtn.disabled = false;
      launchBtn.innerHTML = '<span>🚀</span> Launch My Website Now';
    }
  }
}

// Terminal Modal Animation
function openDeployModal(projectName) {
  const modal = document.getElementById('deploy-modal');
  const logBox = document.getElementById('terminal-log-output');
  const successBox = document.getElementById('terminal-success-box');
  const errorBox = document.getElementById('terminal-error-box');
  const title = document.getElementById('terminal-modal-title');

  title.textContent = `deploying://${projectName.toLowerCase().replace(/\s+/g, '-')}`;
  logBox.innerHTML = '';
  successBox.style.display = 'none';
  if (errorBox) errorBox.style.display = 'none';
  document.getElementById('terminal-step-badge').textContent = 'Provisioning...';
  modal.style.display = 'flex';
}

function closeDeployModal() {
  document.getElementById('deploy-modal').style.display = 'none';
  switchTab('projects');
}

async function streamLogs(logs) {
  for (const log of logs) {
    appendLog(log);
    await new Promise(r => setTimeout(r, 400));
  }
}

function appendLog(text) {
  const box = document.getElementById('terminal-log-output');
  const line = document.createElement('div');
  line.style.marginBottom = '4px';
  line.textContent = text;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

// Load & Render Projects
async function loadProjects() {
  try {
    const res = await fetch('/api/projects');
    const data = await res.json();
    state.projects = data.projects || [];
    
    // Update overview stats with real user data
    const statCount = document.getElementById('stat-active-count');
    const statBandwidth = document.getElementById('stat-bandwidth');
    const statCost = document.getElementById('stat-cost-saved');

    if (statCount) statCount.textContent = state.projects.length;
    if (statBandwidth) statBandwidth.textContent = data.totalBandwidthSaved || '0.0 GB';
    if (statCost) statCost.textContent = data.totalCostSaved || '$0.00';

    renderProjects(state.projects);
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

function renderProjects(projects) {
  const container = document.getElementById('projects-list');
  if (!container) return;

  if (!state.user) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔒</div>
        <h3>Sign In to Manage Your Deployments</h3>
        <p>Connect your GitHub account to access your private repositories, live web apps, and file manager.</p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.25rem;">
          <button onclick="openSignInModal()" class="btn-github-login" style="padding: 0.6rem 1.4rem; font-size: 0.95rem;">
            <span>🐙</span> Sign In with GitHub
          </button>
        </div>
      </div>
    `;
    return;
  }

  if (!projects || projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🚀</div>
        <h3>No Active Deployments</h3>
        <p>You haven't launched any websites yet. Deploy your first web application or API in under 60 seconds.</p>
        <button class="btn-primary" onclick="switchTab('wizard')">+ Deploy Your First Project</button>
      </div>
    `;
    return;
  }

  container.innerHTML = projects.map(p => `
    <div class="project-card">
      <div class="project-header">
        <span class="project-name">${p.name}</span>
        <span class="status-tag">
          <span class="status-dot"></span> Online
        </span>
      </div>

      <div class="project-meta">
        <div class="meta-row">
          <span class="meta-key">Live Web Page:</span>
          <span class="meta-val"><a href="/api/projects/${p.id}/preview" target="_blank" style="color: var(--accent); text-decoration: none;">Instant Preview 👁️</a></span>
        </div>
        <div class="meta-row">
          <span class="meta-key">Private Repo:</span>
          <span class="meta-val"><a href="${p.privateRepo}" target="_blank" style="color: var(--text-dim); text-decoration: none;">🔒 Source Code</a></span>
        </div>
        <div class="meta-row">
          <span class="meta-key">CDN Gateway:</span>
          <span class="meta-val"><a href="${p.publicRepo}" target="_blank" style="color: var(--text-dim); text-decoration: none;">🌍 Public CDN</a></span>
        </div>
        <div class="meta-row">
          <span class="meta-key">Hosting Cost:</span>
          <span class="meta-val" style="color: var(--success); font-weight: bold;">$0.00 / mo</span>
        </div>
      </div>

      <div class="project-actions">
        <a href="/api/projects/${p.id}/preview" target="_blank" class="btn-open-live" style="background: rgba(16, 185, 129, 0.15); color: var(--success); border-color: rgba(16, 185, 129, 0.3);">👁️ Preview</a>
        <a href="${p.liveUrl}" target="_blank" class="btn-card-action" title="Open Public Gateway / Pages">Pages ↗</a>
        <button class="btn-card-action" onclick="openProjectInFileManager('${p.id}')">📂 File Manager</button>
        <button class="btn-card-action" style="color: var(--danger);" onclick="deleteProject('${p.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this deployment?')) return;
  try {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (state.activeFileManagerProjectId === id) {
      state.activeFileManagerProjectId = null;
    }
    await loadProjects();
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

// =============================================================================
// Hostinger-Style Site File Manager & CDN Gateway
// =============================================================================

function openProjectInFileManager(projectId) {
  state.activeFileManagerProjectId = projectId;
  state.activeEditorProjectId = projectId;
  switchTab('filemanager');
}
const openProjectInEditor = openProjectInFileManager;

function populateFileManagerProjectDropdown() {
  const select = document.getElementById('filemanager-project-select');
  if (!select) return;

  if (state.projects.length === 0) {
    select.innerHTML = '<option value="">No projects available</option>';
    const runTree = document.getElementById('tree-run-files');
    const storageTree = document.getElementById('tree-storage-files');
    if (runTree) runTree.innerHTML = '<div style="padding: 1rem; color: var(--text-dim); font-size: 0.85rem;">No projects</div>';
    if (storageTree) storageTree.innerHTML = '<div style="padding: 1rem; color: var(--text-dim); font-size: 0.85rem;">No projects</div>';
    return;
  }

  select.innerHTML = state.projects.map(p => `
    <option value="${p.id}" ${p.id === state.activeFileManagerProjectId ? 'selected' : ''}>${p.name}</option>
  `).join('');

  if (!state.activeFileManagerProjectId && state.projects.length > 0) {
    state.activeFileManagerProjectId = state.projects[0].id;
  }
  handleFileManagerProjectChange();
}

function handleFileManagerProjectChange() {
  const select = document.getElementById('filemanager-project-select');
  if (select && select.value) {
    state.activeFileManagerProjectId = select.value;
  }
  loadProjectForFileManager();
}

function loadProjectForFileManager() {
  const projectId = state.activeFileManagerProjectId;
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return;

  // Set Preview & Public URL buttons
  const previewBtn = document.getElementById('btn-filemanager-preview');
  const publicBtn = document.getElementById('btn-filemanager-public');
  if (previewBtn) previewBtn.href = `/api/projects/${project.id}/preview`;
  if (publicBtn) publicBtn.href = project.liveUrl;

  const runContainer = document.getElementById('tree-run-files');
  const storageContainer = document.getElementById('tree-storage-files');
  const badgeRun = document.getElementById('badge-run-count');
  const badgeStorage = document.getElementById('badge-storage-count');

  const files = project.files || [];

  // Categorize files
  const isStorageFile = (path) => {
    return path.startsWith('assets/') ||
           path.startsWith('downloads/') ||
           path.startsWith('storage/') ||
           /\.(png|jpe?g|gif|webp|svg|ico|bmp|mp4|webm|zip|tar|gz|7z|exe|msi|dmg|apk|bin|iso|pdf)$/i.test(path);
  };

  const runFiles = files.filter(f => !isStorageFile(f.path) && !f.path.startsWith('.github/'));
  const storageFiles = files.filter(f => isStorageFile(f.path));

  if (badgeRun) badgeRun.textContent = runFiles.length;
  if (badgeStorage) badgeStorage.textContent = storageFiles.length;

  // Render Run Files (Code/Pages)
  if (runContainer) {
    if (runFiles.length === 0) {
      runContainer.innerHTML = '<div style="padding: 0.75rem 1.2rem; color: var(--text-dim); font-size: 0.8rem;">No run files in src/</div>';
    } else {
      runContainer.innerHTML = runFiles.map(f => {
        let icon = '📄';
        if (f.path.endsWith('.html')) icon = '🌐';
        else if (f.path.endsWith('.css')) icon = '🎨';
        else if (f.path.endsWith('.js')) icon = '📜';
        else if (f.path.endsWith('.py')) icon = '🐍';
        return `
          <div class="tree-item ${f.path === state.activeFileManagerFilePath ? 'active' : ''}" onclick="selectFileManagerFile('${f.path}')">
            <span style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span>${icon}</span> ${f.path}
            </span>
            <span class="item-badge badge-run">RUN</span>
          </div>
        `;
      }).join('');
    }
  }

  // Render Storage Files (CDN Assets / Binaries)
  if (storageContainer) {
    if (storageFiles.length === 0) {
      storageContainer.innerHTML = '<div style="padding: 0.75rem 1.2rem; color: var(--text-dim); font-size: 0.8rem;">No assets in assets/ or downloads/</div>';
    } else {
      storageContainer.innerHTML = storageFiles.map(f => {
        let icon = '📦';
        if (/\.(png|jpe?g|gif|webp|svg|ico)$/i.test(f.path)) icon = '🖼️';
        else if (/\.(zip|tar|gz|7z)$/i.test(f.path)) icon = '🧩';
        else if (/\.(exe|msi)$/i.test(f.path)) icon = '🖥️';
        return `
          <div class="tree-item ${f.path === state.activeFileManagerFilePath ? 'active' : ''}" onclick="selectFileManagerFile('${f.path}')">
            <span style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span>${icon}</span> ${f.path}
            </span>
            <span class="item-badge badge-storage">CDN</span>
          </div>
        `;
      }).join('');
    }
  }

  // Auto-select active file or first available file
  if (!state.activeFileManagerFilePath && (runFiles.length > 0 || storageFiles.length > 0)) {
    const first = runFiles[0] || storageFiles[0];
    selectFileManagerFile(first.path);
  } else if (state.activeFileManagerFilePath) {
    selectFileManagerFile(state.activeFileManagerFilePath);
  }
}

function selectFileManagerFile(filePath) {
  state.activeFileManagerFilePath = filePath;
  const project = state.projects.find(p => p.id === state.activeFileManagerProjectId);
  if (!project) return;

  const file = project.files.find(f => f.path === filePath);
  if (!file) return;

  // Highlight in tree
  document.querySelectorAll('.filemanager-tree .tree-item').forEach(item => {
    item.classList.toggle('active', item.textContent.includes(filePath));
  });

  const pathDisplay = document.getElementById('active-file-path');
  const iconDisplay = document.getElementById('active-file-icon');
  const btnDelete = document.getElementById('btn-filemanager-delete');
  const btnSave = document.getElementById('btn-filemanager-save');

  const codeView = document.getElementById('filemanager-code-view');
  const assetView = document.getElementById('filemanager-asset-view');
  const textarea = document.getElementById('filemanager-code-textarea');

  if (pathDisplay) pathDisplay.textContent = filePath;
  if (btnDelete) btnDelete.style.display = 'inline-flex';

  const isStorage = file.path.startsWith('assets/') ||
                    file.path.startsWith('downloads/') ||
                    /\.(png|jpe?g|gif|webp|svg|ico|exe|zip|mp4)$/i.test(file.path);

  if (isStorage) {
    // Show Asset / Binary View
    if (codeView) codeView.style.display = 'none';
    if (assetView) assetView.style.display = 'block';
    if (btnSave) btnSave.style.display = 'none';

    let icon = '📦';
    if (/\.(png|jpe?g|gif|webp|svg|ico)$/i.test(file.path)) icon = '🖼️';
    else if (/\.(zip|tar|gz|7z)$/i.test(file.path)) icon = '🧩';
    else if (/\.(exe|msi)$/i.test(file.path)) icon = '🖥️';
    if (iconDisplay) iconDisplay.textContent = icon;

    // Direct jsDelivr CDN URL
    const cdnUrl = `${project.cdnUrl.replace(/\/$/, '')}/${file.path.replace(/^\/+/, '')}`;
    const nameEl = document.getElementById('asset-view-name');
    const iconEl = document.getElementById('asset-view-icon');
    const sizeEl = document.getElementById('asset-view-size');
    const cdnInput = document.getElementById('asset-view-cdn-url');
    const openLink = document.getElementById('asset-view-open-link');

    if (nameEl) nameEl.textContent = file.path.split('/').pop();
    if (iconEl) iconEl.textContent = icon;
    if (sizeEl) sizeEl.textContent = file.size ? `${(file.size / 1024).toFixed(1)} KB • ZeroHost Global CDN Asset` : `Fast Edge CDN Asset`;
    if (cdnInput) cdnInput.value = cdnUrl;
    if (openLink) openLink.href = cdnUrl;

    const imgPreviewBox = document.getElementById('asset-view-img-preview');
    const imgPreview = document.getElementById('asset-view-img');
    if (/\.(png|jpe?g|gif|webp|svg|ico)$/i.test(file.path)) {
      if (imgPreviewBox) imgPreviewBox.style.display = 'block';
      if (imgPreview) imgPreview.src = cdnUrl;
    } else {
      if (imgPreviewBox) imgPreviewBox.style.display = 'none';
    }
  } else {
    // Show Code Editor
    if (codeView) codeView.style.display = 'flex';
    if (assetView) assetView.style.display = 'none';
    if (btnSave) btnSave.style.display = 'inline-flex';
    if (iconDisplay) iconDisplay.textContent = file.path.endsWith('.html') ? '🌐' : (file.path.endsWith('.css') ? '🎨' : '📜');

    if (textarea) textarea.value = file.content || '';
  }
}

async function saveActiveFileManagerFile() {
  const project = state.projects.find(p => p.id === state.activeFileManagerProjectId);
  if (!project || !state.activeFileManagerFilePath) return;

  const btnSave = document.getElementById('btn-filemanager-save');
  const textarea = document.getElementById('filemanager-code-textarea');
  const newContent = textarea.value;

  if (btnSave) {
    btnSave.disabled = true;
    btnSave.innerHTML = '<span>⏳</span> Saving...';
  }

  try {
    const res = await fetch(`/api/projects/${project.id}/file`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: state.activeFileManagerFilePath,
        content: newContent
      })
    });
    const data = await res.json();
    if (data.success) {
      showNotification(`✅ ${state.activeFileManagerFilePath} saved & redeployed!`);
      const file = project.files.find(f => f.path === state.activeFileManagerFilePath);
      if (file) file.content = newContent;
    } else {
      throw new Error(data.error || 'Save failed');
    }
  } catch (err) {
    alert('Save failed: ' + err.message);
  } finally {
    if (btnSave) {
      btnSave.disabled = false;
      btnSave.innerHTML = '<span>💾</span> Save & Deploy';
    }
  }
}

function copyActiveCdnUrl() {
  const input = document.getElementById('asset-view-cdn-url');
  if (!input || !input.value) return;

  input.select();
  navigator.clipboard.writeText(input.value);

  const btn = document.getElementById('btn-copy-cdn-url');
  if (btn) {
    const original = btn.innerHTML;
    btn.innerHTML = '<span>✅</span> Copied!';
    setTimeout(() => { btn.innerHTML = original; }, 2000);
  }
}

// Upload Handling
function triggerFileManagerUpload(targetFolder) {
  state.activeFileManagerTargetFolder = targetFolder || 'assets';
  const fileInput = document.getElementById('filemanager-file-input');
  if (fileInput) fileInput.click();
}

async function handleFileManagerFileInput(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  await uploadFilesToProject(files, state.activeFileManagerTargetFolder);
  event.target.value = ''; // Reset input
}

async function uploadFilesToProject(files, targetFolder) {
  const project = state.projects.find(p => p.id === state.activeFileManagerProjectId);
  if (!project) return alert('Please select a project first.');

  const formData = new FormData();
  formData.append('targetFolder', targetFolder === 'src' ? 'src/' : 'assets/');
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  showNotification(`Uploading ${files.length} file(s) into ${targetFolder}/...`);

  try {
    const res = await fetch(`/api/projects/${project.id}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');

    project.files = data.project.files;
    showNotification(`✅ Successfully uploaded ${data.uploaded.length} file(s)!`);
    loadProjectForFileManager();

    if (data.uploaded.length > 0) {
      selectFileManagerFile(data.uploaded[0].path);
    }
  } catch (err) {
    showNotification('Upload error: ' + err.message, 'error');
  }
}

async function createNewFilePrompt() {
  const project = state.projects.find(p => p.id === state.activeFileManagerProjectId);
  if (!project) return alert('Please select a project first.');

  const filePath = prompt('Enter new file path (e.g. src/pricing.html or assets/banner.png):', 'src/');
  if (!filePath || !filePath.trim()) return;

  try {
    const res = await fetch(`/api/projects/${project.id}/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: filePath.trim(),
        content: `<!-- Created via ZeroHost File Manager -->\n`
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create file');

    project.files.push(data.file);
    loadProjectForFileManager();
    selectFileManagerFile(data.file.path);
    showNotification(`✅ Created ${data.file.path}!`);
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function deleteActiveFile() {
  const project = state.projects.find(p => p.id === state.activeFileManagerProjectId);
  if (!project || !state.activeFileManagerFilePath) return;

  if (!confirm(`Are you sure you want to delete ${state.activeFileManagerFilePath}?`)) return;

  try {
    const res = await fetch(`/api/projects/${project.id}/file`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: state.activeFileManagerFilePath })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete file');

    project.files = project.files.filter(f => f.path !== state.activeFileManagerFilePath);
    state.activeFileManagerFilePath = null;
    loadProjectForFileManager();
    showNotification(`🗑️ Deleted file!`);
  } catch (err) {
    alert('Delete error: ' + err.message);
  }
}
