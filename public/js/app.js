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
  selectedTemplateId: 'landing-page',
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

  const views = ['projects', 'wizard', 'filemanager', 'architecture', 'database'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.style.display = (v === tabName) ? 'block' : 'none';
  });

  if (tabName === 'filemanager') {
    populateFileManagerProjectDropdown();
    if (state.activeFileManagerProjectId) {
      fetch(`/api/projects/${state.activeFileManagerProjectId}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.project) {
            const idx = state.projects.findIndex(p => p.id === state.activeFileManagerProjectId);
            if (idx !== -1) {
              state.projects[idx] = data.project;
            } else {
              state.projects.push(data.project);
            }
            loadProjectForFileManager();
          }
        })
        .catch(() => {});
    }
  } else if (tabName === 'database') {
    populateDatabaseProjectDropdown();
    loadProjectDatabase();
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
        <a href="/api/auth/github" class="btn-github-login" style="padding: 0.5rem 1.1rem; font-size: 0.85rem; text-decoration: none;">
          <span>🐙</span> Sign In with GitHub
        </a>
        <a href="/api/auth/github" class="btn-primary" style="padding: 0.5rem 1.1rem; font-size: 0.85rem; text-decoration: none;">
          <span>🚀</span> Get Started Free
        </a>
      `;
    }
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
    window.location.href = '/api/auth/github';
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
      const firstFile = e.dataTransfer.files[0];
      if (firstFile.name.endsWith('.zip')) {
        await uploadZipFileToProject(firstFile);
      } else {
        await uploadFilesToProject(e.dataTransfer.files, 'assets');
      }
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

async function cliLogin() {
  try {
    const res = await fetch('/api/auth/cli-login', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      state.user = data.user;
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
  const container = document.getElementById('template-options') || document.getElementById('templates-list');
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
    state.selectedCompute = tmpl.compute || 'github_pages_jsdelivr';
    updateComputeCardsSelection();
  }
  renderTemplates();
}

function selectCompute(providerOrEl) {
  let provider = providerOrEl;
  if (typeof providerOrEl !== 'string' && providerOrEl && providerOrEl.getAttribute) {
    provider = providerOrEl.getAttribute('data-compute');
  }
  state.selectedCompute = provider;
  document.querySelectorAll('.compute-card').forEach(c => {
    const input = c.querySelector('input[name="compute_provider"]');
    const isMatch = (input && input.value === provider) || (c.getAttribute('data-compute') === provider);
    c.classList.toggle('selected', isMatch);
    if (input) input.checked = isMatch;
  });
}

function updateComputeCardsSelection() {
  selectCompute(state.selectedCompute);
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
          <a href="/api/auth/github" class="btn-github-login" style="padding: 0.6rem 1.4rem; font-size: 0.95rem; text-decoration: none;">
            <span>🐙</span> Sign In with GitHub
          </a>
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
          <span class="meta-val"><a href="${p.liveUrl || `/api/projects/${p.id}/preview`}" target="_blank" style="color: var(--accent); text-decoration: none;">Instant Preview 👁️</a></span>
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
        ${p.customDomain ? `
        <div class="meta-row">
          <span class="meta-key">Domain:</span>
          <span class="meta-val"><a href="https://${p.customDomain}" target="_blank" style="color: var(--accent); text-decoration: none;">🌐 ${p.customDomain}</a></span>
        </div>
        ` : ''}
      </div>

      <div class="project-actions">
        <a href="${p.liveUrl || `/api/projects/${p.id}/preview`}" target="_blank" class="btn-open-live" style="background: rgba(16, 185, 129, 0.15); color: var(--success); border-color: rgba(16, 185, 129, 0.3);">👁️ Preview</a>
        <a href="${p.liveUrl}" target="_blank" class="btn-card-action" title="Open Public Gateway / Pages">Pages ↗</a>
        <button class="btn-card-action" onclick="openProjectInFileManager('${p.id}')" title="Site File Manager">📂 Files</button>
        <button class="btn-card-action" onclick="openProjectLogs('${p.id}')" title="View Deployment Logs & Diagnostics">📜 Logs</button>
        <button class="btn-card-action" onclick="openProjectSettings('${p.id}')" title="Environment Variables & Custom Domain">⚙️</button>
        <button class="btn-card-action" onclick="openProjectHistory('${p.id}')" title="Deployment History & Instant Rollback">⏪</button>
        <button class="btn-card-action" style="color: var(--danger);" onclick="deleteProject('${p.id}')" title="Delete Deployment">🗑️</button>
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

async function openProjectInFileManager(projectId) {
  state.activeFileManagerProjectId = projectId;
  state.activeEditorProjectId = projectId;
  switchTab('filemanager');
  try {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.project) {
        const idx = state.projects.findIndex(p => p.id === projectId);
        if (idx !== -1) {
          state.projects[idx] = data.project;
        } else {
          state.projects.push(data.project);
        }
        loadProjectForFileManager();
      }
    }
  } catch (e) {
    console.warn('Sync on open failed:', e);
  }
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
  if (previewBtn) previewBtn.href = project.liveUrl || `/api/projects/${project.id}/preview`;
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

// =============================================================================
// Helper: Safe HTML Escaping
// =============================================================================

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =============================================================================
// How-To Guide & AI Master Architecture Sub-Navigation & Copy
// =============================================================================

function switchGuideTab(tabName) {
  const tabs = ['transfer', 'ai', 'methods'];
  tabs.forEach(t => {
    const pill = document.getElementById(`pill-guide-${t}`);
    const panel = document.getElementById(`guide-panel-${t}`);
    if (pill) pill.classList.toggle('active', t === tabName);
    if (panel) panel.classList.toggle('active', t === tabName);
  });
}

async function copyAiMasterPrompt() {
  const promptEl = document.getElementById('master-ai-prompt-text');
  if (!promptEl) return;
  const promptText = promptEl.textContent || promptEl.innerText;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(promptText);
    } else {
      const ta = document.createElement('textarea');
      ta.value = promptText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showNotification('📋 Master AI Prompt copied to clipboard! Paste it into ChatGPT, Claude, or Cursor.', 'success');
  } catch (err) {
    showNotification('Copied to clipboard!', 'info');
  }
}

// =============================================================================
// Dedicated Per-Project Deployment Logs & Diagnostic Doctor Modal
// =============================================================================

state.activeLogsProjectId = null;
state.currentLogsData = null;

async function openProjectLogs(projectId) {
  state.activeLogsProjectId = projectId;
  const modal = document.getElementById('project-logs-modal');
  if (!modal) return;

  modal.style.display = 'flex';
  
  // Set initial loading state
  const logsOutput = document.getElementById('project-logs-output');
  if (logsOutput) {
    logsOutput.innerHTML = '<div style="color: var(--text-dim); padding: 1rem;">🔄 Fetching real-time logs and running diagnostic doctor...</div>';
  }

  await fetchAndRenderProjectLogs(projectId);
}

function closeProjectLogsModal() {
  const modal = document.getElementById('project-logs-modal');
  if (modal) modal.style.display = 'none';
}

async function refreshProjectLogs() {
  if (!state.activeLogsProjectId) return;
  await fetchAndRenderProjectLogs(state.activeLogsProjectId);
  showNotification('🔄 Deployment logs & diagnostics refreshed!', 'info');
}

async function fetchAndRenderProjectLogs(projectId) {
  try {
    const res = await fetch(`/api/projects/${projectId}/logs`);
    if (!res.ok) throw new Error('Failed to load project logs');
    const data = await res.json();
    state.currentLogsData = data.project;
    renderProjectLogsData(data.project);
  } catch (err) {
    console.error('Error fetching project logs:', err);
    const logsOutput = document.getElementById('project-logs-output');
    if (logsOutput) {
      logsOutput.innerHTML = `<div style="color: var(--danger); padding: 1rem;">❌ Failed to load logs: ${err.message}</div>`;
    }
  }
}

function renderProjectLogsData(project) {
  // Title & status
  const titleEl = document.getElementById('logs-proj-name');
  const statusEl = document.getElementById('logs-proj-status');
  const modalTitle = document.getElementById('logs-modal-title');
  const timestampEl = document.getElementById('logs-timestamp');

  if (titleEl) titleEl.textContent = project.name || project.slug;
  if (modalTitle) modalTitle.textContent = `zerohost-logs (${project.slug})`;
  if (statusEl) {
    statusEl.innerHTML = `<span class="status-dot"></span> ${project.status || 'Online'}`;
  }
  if (timestampEl) {
    timestampEl.textContent = `Last synced: ${new Date().toLocaleTimeString()}`;
  }

  // Links
  const linkPreview = document.getElementById('logs-link-preview');
  const linkPages = document.getElementById('logs-link-pages');
  const linkSource = document.getElementById('logs-link-source');
  const pipeSourceName = document.getElementById('pipe-source-name');

  if (linkPreview) linkPreview.href = project.liveUrl || `/api/projects/${project.id}/preview`;
  if (linkPages) linkPages.href = project.liveUrl || '#';
  if (linkSource) linkSource.href = project.privateRepo || '#';
  if (pipeSourceName) pipeSourceName.textContent = `${project.slug}-source`;

  // Pipeline stepper state
  updatePipelineStepper(project);

  // Diagnostic Doctor checks
  renderDiagnosticDoctor(project.diagnostics || []);

  // System Logs
  renderSystemLogs(project.logs || []);

  // GitHub Actions Runs
  renderWorkflowRuns(project.runs || []);
}

function updatePipelineStepper(project) {
  const steps = [
    { id: 'pipe-step-1', div: 'pipe-div-1', complete: true },
    { id: 'pipe-step-2', div: 'pipe-div-2', complete: true },
    { id: 'pipe-step-3', div: 'pipe-div-3', complete: true },
    { id: 'pipe-step-4', div: 'pipe-div-4', complete: !!project.publicRepo },
    { id: 'pipe-step-5', div: null, complete: !!project.liveUrl }
  ];

  steps.forEach(s => {
    const el = document.getElementById(s.id);
    const div = s.div ? document.getElementById(s.div) : null;
    if (el) {
      el.classList.toggle('complete', s.complete);
      el.classList.toggle('active', !s.complete);
    }
    if (div) {
      div.classList.toggle('complete', s.complete);
    }
  });
}

function renderDiagnosticDoctor(diagnostics) {
  const container = document.getElementById('doctor-checklist');
  const overallBadge = document.getElementById('doctor-overall-badge');
  if (!container) return;

  if (!diagnostics || diagnostics.length === 0) {
    container.innerHTML = `<div style="color: var(--text-dim); font-size: 0.8rem;">No diagnostic checks recorded.</div>`;
    if (overallBadge) {
      overallBadge.className = 'doctor-badge-status';
      overallBadge.textContent = 'All Checks Passed';
    }
    return;
  }

  const hasFail = diagnostics.some(d => d.level === 'fail');
  const hasWarn = diagnostics.some(d => d.level === 'warn');

  if (overallBadge) {
    if (hasFail) {
      overallBadge.className = 'doctor-badge-status doctor-badge-fail';
      overallBadge.textContent = '❌ Action Required';
    } else if (hasWarn) {
      overallBadge.className = 'doctor-badge-status doctor-badge-warn';
      overallBadge.textContent = '⚠️ Recommendations Found';
    } else {
      overallBadge.className = 'doctor-badge-status';
      overallBadge.textContent = '✅ All Checks Passed';
    }
  }

  container.innerHTML = diagnostics.map(d => {
    let icon = '✅';
    let itemClass = 'pass';
    if (d.level === 'warn') {
      icon = '⚠️';
      itemClass = 'warn';
    } else if (d.level === 'fail') {
      icon = '❌';
      itemClass = 'fail';
    }

    return `
      <div class="doctor-item ${itemClass}">
        <span class="doctor-item-icon">${icon}</span>
        <div class="doctor-item-content">
          <div class="doctor-item-title">${d.title}</div>
          <div class="doctor-item-desc">${d.desc}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderSystemLogs(logs) {
  const container = document.getElementById('project-logs-output');
  if (!container) return;

  if (!logs || logs.length === 0) {
    container.innerHTML = '<div style="color: var(--text-dim); padding: 1rem;">No log lines available.</div>';
    return;
  }

  container.innerHTML = logs.map(line => {
    const isError = line.includes('❌') || line.toLowerCase().includes('error') || line.toLowerCase().includes('fail');
    const isSuccess = line.includes('✅') || line.includes('🎉') || line.toLowerCase().includes('success');
    const isWarn = line.includes('⚠️') || line.toLowerCase().includes('warn');

    let color = '#38bdf8';
    if (isError) color = '#f87171';
    else if (isSuccess) color = '#34d399';
    else if (isWarn) color = '#fbbf24';

    return `<div style="color: ${color}; line-height: 1.6; margin-bottom: 2px;">${escapeHtml(line)}</div>`;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function renderWorkflowRuns(runs) {
  const container = document.getElementById('project-runs-output');
  if (!container) return;

  if (!runs || runs.length === 0) {
    container.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.85rem; padding: 1.5rem; text-align: center;">
        <p>No recent GitHub Actions workflow runs found or token in demo mode.</p>
        <p style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.4rem;">
          Connect your GitHub account to stream live CI/CD run history directly from your source repository.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = runs.map(r => {
    const isSuccess = r.conclusion === 'success';
    const isFailed = r.conclusion === 'failure';
    const pillColor = isSuccess ? 'var(--success)' : (isFailed ? 'var(--danger)' : '#f59e0b');
    const statusText = r.conclusion || r.status || 'in_progress';

    return `
      <div class="run-card">
        <div>
          <div style="font-weight: 700; color: #fff; margin-bottom: 0.2rem;">
            ${escapeHtml(r.commitMessage)}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-dim); font-family: monospace;">
            Run #${r.id} • ${new Date(r.createdAt).toLocaleString()}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 0.75rem; font-weight: 700; color: ${pillColor}; text-transform: uppercase;">
            ${statusText}
          </span>
          ${r.htmlUrl ? `<a href="${r.htmlUrl}" target="_blank" class="btn-card-action" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; text-decoration: none;">View on GitHub ↗</a>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function switchLogTab(tabName) {
  const btnSystem = document.getElementById('logs-tab-btn-system');
  const btnGithub = document.getElementById('logs-tab-btn-github');
  const paneSystem = document.getElementById('project-logs-output');
  const paneGithub = document.getElementById('project-runs-output');

  if (tabName === 'system') {
    if (btnSystem) btnSystem.classList.add('active');
    if (btnGithub) btnGithub.classList.remove('active');
    if (paneSystem) paneSystem.style.display = 'block';
    if (paneGithub) paneGithub.style.display = 'none';
  } else {
    if (btnSystem) btnSystem.classList.remove('active');
    if (btnGithub) btnGithub.classList.add('active');
    if (paneSystem) paneSystem.style.display = 'none';
    if (paneGithub) paneGithub.style.display = 'flex';
  }
}

async function copyProjectLogs() {
  if (!state.currentLogsData || !state.currentLogsData.logs) {
    showNotification('No logs to copy.', 'error');
    return;
  }
  const text = state.currentLogsData.logs.join('\n');
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showNotification('📋 Deployment logs copied to clipboard!', 'success');
  } catch (err) {
    showNotification('Copied to clipboard!', 'info');
  }
}

// =============================================================================
// ZIP Archive Upload & Full Project Export (cPanel / Vercel style)
// =============================================================================

function triggerZipUpload() {
  const input = document.getElementById('filemanager-zip-input');
  if (input) input.click();
}

async function handleZipFileInput(event) {
  const file = event.target.files[0];
  if (!file) return;
  await uploadZipFileToProject(file);
  event.target.value = '';
}

async function uploadZipFileToProject(file) {
  const projectId = state.activeFileManagerProjectId;
  if (!projectId) {
    showNotification('Please select a project first.', 'error');
    return;
  }
  showNotification(`📦 Uploading & extracting ${file.name}...`, 'info');
  const formData = new FormData();
  formData.append('zipfile', file);

  try {
    const res = await fetch(`/api/projects/${projectId}/upload-zip`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to extract ZIP');

    showNotification(`🎉 Extracted ${data.count} file(s) from ZIP archive!`, 'success');
    const idx = state.projects.findIndex(p => p.id === projectId);
    if (idx !== -1 && data.project) {
      state.projects[idx] = data.project;
    }
    loadProjectForFileManager();
  } catch (err) {
    showNotification(`ZIP upload error: ${err.message}`, 'error');
  }
}

function exportProjectZip() {
  const projectId = state.activeFileManagerProjectId;
  if (!projectId) {
    showNotification('Please select a project first.', 'error');
    return;
  }
  showNotification('📦 Generating ZIP backup download...', 'info');
  window.location.href = `/api/projects/${projectId}/export-zip`;
}

// =============================================================================
// Project Settings, Environment Variables & Custom Domain
// =============================================================================

state.activeSettingsProjectId = null;
state.currentEnvVars = {};

async function openProjectSettings(projectId) {
  state.activeSettingsProjectId = projectId;
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return;

  const modal = document.getElementById('project-settings-modal');
  const title = document.getElementById('settings-modal-title');
  if (title) title.textContent = `Settings — ${project.name || project.slug}`;
  if (modal) modal.style.display = 'flex';

  switchSettingsTab('env');

  // Load domain
  const domainInput = document.getElementById('setting-domain-input');
  if (domainInput) domainInput.value = project.customDomain || '';
  const domainBox = document.getElementById('domain-verification-box');
  if (domainBox) domainBox.style.display = 'none';

  // Load build settings & env
  try {
    const res = await fetch(`/api/projects/${projectId}/env`);
    if (res.ok) {
      const data = await res.json();
      state.currentEnvVars = data.env || {};
      renderEnvVarsRows(state.currentEnvVars);
      if (data.buildSettings) {
        const fw = document.getElementById('setting-framework-select');
        const out = document.getElementById('setting-output-dir');
        const cmd = document.getElementById('setting-build-cmd');
        if (fw) fw.value = data.buildSettings.framework || 'static';
        if (out) out.value = data.buildSettings.outputDir || 'src/';
        if (cmd) cmd.value = data.buildSettings.buildCommand || '';
      }
    }
  } catch (err) {
    console.error('Failed to load project env settings:', err);
  }
}

function closeProjectSettingsModal() {
  const modal = document.getElementById('project-settings-modal');
  if (modal) modal.style.display = 'none';
}

function switchSettingsTab(tab) {
  const tabs = ['env', 'domain', 'build', 'analytics'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const pane = document.getElementById(`settings-pane-${t}`);
    if (btn) btn.classList.toggle('active', t === tab);
    if (pane) pane.style.display = (t === tab) ? 'block' : 'none';
  });
  if (tab === 'analytics' && state.activeSettingsProjectId) {
    loadProjectAnalytics(state.activeSettingsProjectId);
  }
}

function renderEnvVarsRows(envMap) {
  const container = document.getElementById('env-vars-container');
  if (!container) return;
  container.innerHTML = '';
  const keys = Object.keys(envMap);
  if (keys.length === 0) {
    addEnvVarRow('', '');
    return;
  }
  keys.forEach(k => {
    addEnvVarRow(k, envMap[k]);
  });
}

function addEnvVarRow(key = '', val = '') {
  const container = document.getElementById('env-vars-container');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'env-var-row';
  row.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;';
  row.innerHTML = `
    <input type="text" class="form-input env-key-input" placeholder="KEY (e.g. API_SECRET)" value="${escapeHtml(key)}" style="flex: 1; font-family: monospace; font-size: 0.85rem;">
    <input type="password" class="form-input env-val-input" placeholder="VALUE" value="${escapeHtml(val)}" style="flex: 1.5; font-family: monospace; font-size: 0.85rem;">
    <button type="button" class="btn-card-action" onclick="toggleEnvMask(this)" title="Show/Hide value" style="padding: 0.4rem 0.6rem;">👁️</button>
    <button type="button" class="btn-card-action" onclick="removeEnvVarRow(this)" title="Delete variable" style="color: var(--danger); padding: 0.4rem 0.6rem;">✕</button>
  `;
  container.appendChild(row);
}

function removeEnvVarRow(btn) {
  const row = btn.closest('.env-var-row');
  if (row) row.remove();
}

function toggleEnvMask(btn) {
  const row = btn.closest('.env-var-row');
  if (!row) return;
  const input = row.querySelector('.env-val-input');
  if (input) {
    input.type = (input.type === 'password') ? 'text' : 'password';
  }
}

async function saveProjectEnvVars() {
  const projectId = state.activeSettingsProjectId;
  if (!projectId) return;

  const rows = document.querySelectorAll('#env-vars-container .env-var-row');
  const newEnv = {};
  rows.forEach(r => {
    const k = r.querySelector('.env-key-input').value.trim();
    const v = r.querySelector('.env-val-input').value.trim();
    if (k) newEnv[k] = v;
  });

  try {
    const res = await fetch(`/api/projects/${projectId}/env`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ env: newEnv })
    });
    if (!res.ok) throw new Error('Failed to save environment variables');
    showNotification('✅ Environment variables saved securely!', 'success');
  } catch (err) {
    showNotification(`Error saving env vars: ${err.message}`, 'error');
  }
}

async function saveProjectCustomDomain() {
  const projectId = state.activeSettingsProjectId;
  if (!projectId) return;
  const domain = document.getElementById('setting-domain-input').value.trim();

  try {
    const res = await fetch(`/api/projects/${projectId}/domain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update custom domain');

    showNotification(domain ? `🌐 Domain ${domain} saved & CNAME configured!` : '🌐 Custom domain removed.', 'success');
    const project = state.projects.find(p => p.id === projectId);
    if (project) project.customDomain = domain || null;
    renderProjects(state.projects);
  } catch (err) {
    showNotification(`Domain error: ${err.message}`, 'error');
  }
}

async function verifyProjectDomainDNS() {
  const projectId = state.activeSettingsProjectId;
  if (!projectId) return;
  const box = document.getElementById('domain-verification-box');
  if (!box) return;

  box.style.display = 'block';
  box.innerHTML = '<div style="color: var(--text-dim);">🔍 Querying Google DNS over HTTPS for live records...</div>';

  try {
    const res = await fetch(`/api/projects/${projectId}/domain/verify`);
    const data = await res.json();

    if (!data.domain) {
      box.innerHTML = '<div style="color: var(--danger);">⚠️ No domain configured yet. Enter a domain and click Save Domain first.</div>';
      return;
    }

    const badge = data.verified 
      ? '<span class="status-tag" style="background: rgba(16, 185, 129, 0.2); color: var(--success);"><span class="status-dot"></span> DNS Verified & Active</span>'
      : '<span class="status-tag" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;"><span class="status-dot" style="background: #fbbf24;"></span> DNS Propagation Pending</span>';

    box.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <span style="font-weight: 700; color: #fff;">${escapeHtml(data.domain)}</span>
        ${badge}
      </div>
      <div style="color: var(--text-muted); font-size: 0.8rem; line-height: 1.6; margin-bottom: 0.75rem;">
        <strong>Detected CNAME:</strong> ${data.detected.cname.length > 0 ? data.detected.cname.join(', ') : 'None'}<br>
        <strong>Detected A Records:</strong> ${data.detected.aRecords.length > 0 ? data.detected.aRecords.join(', ') : 'None'}
      </div>
      <div style="background: rgba(255, 255, 255, 0.05); padding: 0.6rem; border-radius: 6px; font-size: 0.75rem; color: #cbd5e1; line-height: 1.5;">
        ${escapeHtml(data.instructions.subdomain)}<br>
        ${escapeHtml(data.instructions.apex)}
      </div>
    `;
  } catch (err) {
    box.innerHTML = `<div style="color: var(--danger);">Verification check failed: ${err.message}</div>`;
  }
}

async function saveProjectBuildSettings() {
  const projectId = state.activeSettingsProjectId;
  if (!projectId) return;

  const framework = document.getElementById('setting-framework-select').value;
  const outputDir = document.getElementById('setting-output-dir').value;
  const buildCommand = document.getElementById('setting-build-cmd').value;

  try {
    const res = await fetch(`/api/projects/${projectId}/env`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buildSettings: { framework, outputDir, buildCommand }
      })
    });
    if (!res.ok) throw new Error('Failed to save build settings');
    showNotification('⚙️ Build settings updated successfully!', 'success');
  } catch (err) {
    showNotification(`Error: ${err.message}`, 'error');
  }
}

// =============================================================================
// Deployment History & Instant Rollback
// =============================================================================

state.activeHistoryProjectId = null;

async function openProjectHistory(projectId) {
  state.activeHistoryProjectId = projectId;
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return;

  const modal = document.getElementById('project-history-modal');
  const title = document.getElementById('history-modal-title');
  if (title) title.textContent = `Deployments & Rollback — ${project.name || project.slug}`;
  if (modal) modal.style.display = 'flex';

  const list = document.getElementById('project-history-list');
  if (list) list.innerHTML = '<div style="color: var(--text-dim); padding: 1rem;">🔄 Loading deployment history...</div>';

  try {
    const res = await fetch(`/api/projects/${projectId}/deployments`);
    const data = await res.json();
    const deployments = data.deployments || [];

    if (deployments.length === 0) {
      list.innerHTML = '<div style="color: var(--text-muted); padding: 1.5rem; text-align: center;">No previous deployment snapshots found yet.</div>';
      return;
    }

    list.innerHTML = deployments.map((d, i) => `
      <div class="run-card" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; color: #fff; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>${escapeHtml(d.message)}</span>
            ${i === 0 ? '<span class="status-tag" style="background: rgba(16, 185, 129, 0.15); color: var(--success); font-size: 0.65rem;">CURRENT ACTIVE</span>' : ''}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-dim); font-family: monospace;">
            Snapshot #${d.id} • ${new Date(d.timestamp).toLocaleString()} • ${d.filesCount} files
          </div>
        </div>
        <div>
          ${i !== 0 ? `<button class="btn-card-action" onclick="rollbackToDeployment('${d.id}')" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3); font-size: 0.75rem; padding: 0.3rem 0.75rem;">⏪ Rollback</button>` : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<div style="color: var(--danger); padding: 1rem;">Failed to load history: ${err.message}</div>`;
  }
}

function closeProjectHistoryModal() {
  const modal = document.getElementById('project-history-modal');
  if (modal) modal.style.display = 'none';
}

async function rollbackToDeployment(deploymentId) {
  const projectId = state.activeHistoryProjectId;
  if (!projectId) return;

  if (!confirm('Are you sure you want to rollback to this deployment snapshot? This will restore files and redeploy.')) return;

  showNotification('⏪ Rolling back deployment files...', 'info');

  try {
    const res = await fetch(`/api/projects/${projectId}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deploymentId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Rollback failed');

    showNotification('🎉 Successfully rolled back to selected deployment!', 'success');
    closeProjectHistoryModal();
    await loadProjects();
  } catch (err) {
    showNotification(`Rollback error: ${err.message}`, 'error');
  }
}

// =============================================================================
// Serverless Cloud Database & Table Explorer (cPanel phpMyAdmin style)
// =============================================================================

state.activeDatabaseProjectId = null;
state.activeDatabaseTable = 'feedback';
state.currentDbData = null;

function populateDatabaseProjectDropdown() {
  const select = document.getElementById('database-project-select');
  if (!select) return;

  select.innerHTML = state.projects.map(p => `
    <option value="${p.id}" ${p.id === state.activeDatabaseProjectId ? 'selected' : ''}>
      ${p.name || p.slug}
    </option>
  `).join('');

  if (!state.activeDatabaseProjectId && state.projects.length > 0) {
    state.activeDatabaseProjectId = state.projects[0].id;
  }
}

function handleDatabaseProjectChange() {
  const select = document.getElementById('database-project-select');
  if (select) {
    state.activeDatabaseProjectId = select.value;
    loadProjectDatabase();
  }
}

async function loadProjectDatabase() {
  const projectId = state.activeDatabaseProjectId || (state.projects[0] && state.projects[0].id);
  if (!projectId) return;

  const endpointEl = document.getElementById('db-connection-endpoint');
  const project = state.projects.find(p => p.id === projectId);
  if (endpointEl && project) {
    endpointEl.textContent = `https://zerohost-platform.onrender.com/api/db/${project.slug}/<table_name>`;
  }

  try {
    const res = await fetch(`/api/database/${projectId}`);
    if (!res.ok) throw new Error('Failed to load database overview');
    const data = await res.json();
    state.currentDbData = data;

    renderDatabaseTablesList(data.tables || {});
    const tableNames = Object.keys(data.tables || {});
    if (!tableNames.includes(state.activeDatabaseTable)) {
      state.activeDatabaseTable = tableNames[0] || 'feedback';
    }
    await loadTableRows(state.activeDatabaseTable);
  } catch (err) {
    console.error('Error loading database:', err);
  }
}

function renderDatabaseTablesList(tablesMap) {
  const container = document.getElementById('database-tables-list');
  if (!container) return;

  const names = Object.keys(tablesMap);
  if (names.length === 0) {
    container.innerHTML = '<div style="color: var(--text-dim); padding: 0.5rem; font-size: 0.8rem;">No tables yet. Click + Table.</div>';
    return;
  }

  container.innerHTML = names.map(t => `
    <div class="tree-item ${t === state.activeDatabaseTable ? 'active' : ''}" 
         onclick="selectDatabaseTable('${t}')"
         style="padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
      <span style="font-weight: 600;">📊 ${escapeHtml(t)}</span>
      <span class="item-badge" style="background: rgba(255,255,255,0.08); font-size: 0.7rem;">${tablesMap[t].rowCount || 0}</span>
    </div>
  `).join('');
}

async function selectDatabaseTable(tableName) {
  state.activeDatabaseTable = tableName;
  const items = document.querySelectorAll('#database-tables-list .tree-item');
  items.forEach(el => {
    el.classList.toggle('active', el.textContent.includes(tableName));
  });
  await loadTableRows(tableName);
}

async function loadTableRows(tableName) {
  const projectId = state.activeDatabaseProjectId;
  if (!projectId || !tableName) return;

  const titleEl = document.getElementById('active-table-name');
  const countEl = document.getElementById('active-table-count');
  const container = document.getElementById('database-rows-container');

  if (titleEl) titleEl.textContent = tableName;
  if (container) container.innerHTML = '<div style="color: var(--text-dim); padding: 1rem;">🔄 Loading table rows...</div>';

  try {
    const res = await fetch(`/api/database/${projectId}/tables/${tableName}`);
    if (!res.ok) throw new Error('Table not found');
    const data = await res.json();
    const rows = data.rows || [];
    const cols = data.columns || ['id', 'createdAt'];

    if (countEl) countEl.textContent = `${rows.length} row(s)`;

    if (rows.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🗄️</div>
          <p style="font-weight: 600;">Table "${escapeHtml(tableName)}" is empty.</p>
          <p style="font-size: 0.8rem; color: var(--text-dim); margin-top: 0.25rem;">Click "+ Insert Row" to add a record or send a POST request from your website.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border); color: var(--text-dim); text-transform: uppercase; font-size: 0.7rem;">
            ${cols.map(c => `<th style="padding: 0.6rem 0.75rem;">${escapeHtml(c)}</th>`).join('')}
            <th style="padding: 0.6rem 0.75rem; text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); transition: background 0.15s;">
              ${cols.map(c => `
                <td style="padding: 0.6rem 0.75rem; color: ${c === 'id' ? 'var(--accent)' : '#fff'}; font-family: ${c === 'id' || c.toLowerCase().includes('date') ? 'monospace' : 'inherit'};">
                  ${escapeHtml(r[c] !== undefined ? String(r[c]) : '-')}
                </td>
              `).join('')}
              <td style="padding: 0.6rem 0.75rem; text-align: right;">
                <button class="btn-card-action" onclick="deleteTableRow('${r.id}')" style="color: var(--danger); padding: 0.2rem 0.5rem; font-size: 0.75rem;">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    if (container) container.innerHTML = `<div style="color: var(--danger); padding: 1rem;">Error: ${err.message}</div>`;
  }
}

async function createNewTablePrompt() {
  const projectId = state.activeDatabaseProjectId;
  if (!projectId) return showNotification('Please select a project first.', 'error');

  const tableName = prompt('Enter table name (e.g. leads, orders, messages):');
  if (!tableName || !tableName.trim()) return;

  const colsInput = prompt('Enter columns separated by commas (id and createdAt are added automatically):', 'name, email, phone');
  const cols = colsInput ? colsInput.split(',').map(s => s.trim()).filter(Boolean) : [];

  try {
    const res = await fetch(`/api/database/${projectId}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tableName, columns: cols })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create table');

    showNotification(`🗄️ Created table "${data.table}"!`, 'success');
    state.activeDatabaseTable = data.table;
    await loadProjectDatabase();
  } catch (err) {
    alert('Create table error: ' + err.message);
  }
}

function openInsertRowModal() {
  const modal = document.getElementById('insert-row-modal');
  const container = document.getElementById('insert-row-fields');
  const title = document.getElementById('insert-modal-title');
  if (!modal || !container) return;

  if (title) title.textContent = `Insert Record into "${state.activeDatabaseTable}"`;

  const db = state.currentDbData;
  const tblInfo = db && db.tables && db.tables[state.activeDatabaseTable];
  const cols = (tblInfo && tblInfo.columns) || ['title', 'content'];

  container.innerHTML = cols.filter(c => c !== 'id' && c !== 'createdAt').map(c => `
    <div style="margin-bottom: 0.75rem;">
      <label style="display: block; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.3rem;">${escapeHtml(c)}</label>
      <input type="text" class="form-input db-row-input" data-col="${escapeHtml(c)}" style="width: 100%;" placeholder="Enter ${escapeHtml(c)}...">
    </div>
  `).join('');

  modal.style.display = 'flex';
}

function closeInsertRowModal() {
  const modal = document.getElementById('insert-row-modal');
  if (modal) modal.style.display = 'none';
}

async function submitInsertRow() {
  const projectId = state.activeDatabaseProjectId;
  const table = state.activeDatabaseTable;
  if (!projectId || !table) return;

  const inputs = document.querySelectorAll('#insert-row-fields .db-row-input');
  const rowData = {};
  inputs.forEach(inp => {
    rowData[inp.dataset.col] = inp.value;
  });

  try {
    const res = await fetch(`/api/database/${projectId}/tables/${table}/rows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rowData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to insert row');

    showNotification(`✅ Record inserted into "${table}"!`, 'success');
    closeInsertRowModal();
    await loadProjectDatabase();
  } catch (err) {
    showNotification(`Insert error: ${err.message}`, 'error');
  }
}

async function deleteTableRow(rowId) {
  const projectId = state.activeDatabaseProjectId;
  const table = state.activeDatabaseTable;
  if (!confirm('Are you sure you want to delete this row?')) return;

  try {
    const res = await fetch(`/api/database/${projectId}/tables/${table}/rows/${rowId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete row');
    showNotification('🗑️ Record deleted.', 'info');
    await loadTableRows(table);
  } catch (err) {
    showNotification(`Delete error: ${err.message}`, 'error');
  }
}

function copyDbRestEndpoint() {
  const endpointEl = document.getElementById('db-connection-endpoint');
  if (!endpointEl) return;
  const text = endpointEl.textContent.trim();
  navigator.clipboard.writeText(text);
  showNotification('📋 Database REST endpoint URL copied!', 'success');
}

function exportProjectDatabase() {
  const projectId = state.activeDatabaseProjectId;
  if (!projectId) return showNotification('Please select a project first.', 'error');
  window.location.href = `/api/database/${projectId}/export`;
}

// Scaffold Helpers: 404 & Redirects
async function scaffold404Page() {
  const projectId = state.activeFileManagerProjectId;
  if (!projectId) return showNotification('Please select a project in File Manager first.', 'error');

  try {
    const res = await fetch(`/api/projects/${projectId}/scaffold-404`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create 404');
    showNotification('🎉 Created custom branded src/404.html page!', 'success');
    await loadProjectForFileManager();
    selectFileManagerFile('src/404.html');
  } catch (err) {
    showNotification(`Error: ${err.message}`, 'error');
  }
}

async function scaffoldRedirectsFile() {
  const projectId = state.activeFileManagerProjectId;
  if (!projectId) return showNotification('Please select a project in File Manager first.', 'error');

  try {
    const res = await fetch(`/api/projects/${projectId}/scaffold-redirects`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create _redirects');
    showNotification('🔀 Created SPA src/_redirects fallback routing rule!', 'success');
    await loadProjectForFileManager();
    selectFileManagerFile('src/_redirects');
  } catch (err) {
    showNotification(`Error: ${err.message}`, 'error');
  }
}

// Live Analytics Loader (Real Requests & Visitor Tracking)
async function loadProjectAnalytics(projectId) {
  try {
    const res = await fetch(`/api/projects/${projectId}/analytics`);
    if (!res.ok) return;
    const data = await res.json();

    const elReq = document.getElementById('analytics-requests');
    const elBand = document.getElementById('analytics-bandwidth');
    const elCache = document.getElementById('analytics-cache');
    const elStatus = document.getElementById('analytics-status-message');
    const elVisits = document.getElementById('analytics-visits-list');

    if (elReq) elReq.textContent = (data.metrics.totalRequests || 0).toLocaleString();
    if (elBand) elBand.textContent = data.metrics.bandwidthServed || '0.0 KB';
    if (elCache) elCache.textContent = data.metrics.cacheHitRatio || 'N/A';

    if (elStatus && data.statusMessage) {
      elStatus.textContent = data.statusMessage;
    }

    if (elVisits) {
      if (data.recentVisits && data.recentVisits.length > 0) {
        elVisits.innerHTML = data.recentVisits.map(v => {
          const time = new Date(v.timestamp).toLocaleTimeString();
          const bytesText = v.bytes ? (v.bytes >= 1024 ? (v.bytes / 1024).toFixed(1) + ' KB' : v.bytes + ' B') : '512 B';
          return `<div style="font-family: monospace; font-size: 0.78rem; display: flex; justify-content: space-between; padding: 0.25rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <span style="color: var(--accent);">${escapeHtml(time)}</span>
            <span style="color: #fff;">GET ${escapeHtml(v.path || '/')}</span>
            <span style="color: var(--text-dim);">${bytesText}</span>
          </div>`;
        }).join('');
      } else {
        elVisits.innerHTML = '<div style="color: var(--text-dim); font-size: 0.8rem;">No requests recorded yet today. Site was deployed recently.</div>';
      }
    }
  } catch (e) {
    console.error('Analytics load error:', e);
  }
}
