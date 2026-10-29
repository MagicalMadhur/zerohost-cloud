const express = require('express');
const axios = require('axios');
const { execSync } = require('child_process');
const GitHubService = require('../services/githubService');

const router = express.Router();

// Helper to check if gh CLI is logged in
function getLocalCliToken() {
  try {
    const token = execSync('gh auth token', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (token && token.startsWith('gho_') || token.startsWith('ghp_')) {
      return token;
    }
  } catch (e) {
    // gh CLI not authenticated or not installed
  }
  return null;
}

// Redirect to GitHub OAuth
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const redirectUri = process.env.GITHUB_CALLBACK_URL || `${protocol}://${host}/api/auth/github/callback`;

  if (!clientId || clientId === 'your_github_client_id_here') {
    return res.redirect('/?notice=oauth_not_configured_demo_enabled');
  }

  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,workflow,user`;
  res.redirect(url);
});

// OAuth Callback
router.get('/github/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.redirect('/?error=missing_code');
  }

  try {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.redirect('/?error=oauth_failed');
    }

    const service = new GitHubService(accessToken, false);
    const user = await service.getUser();

    req.session.githubToken = accessToken;
    req.session.user = user;

    res.redirect('/');
  } catch (err) {
    console.error('OAuth Error:', err.message);
    res.redirect('/?error=' + encodeURIComponent(err.message));
  }
});

// 1-Click Connect with Local GitHub Account (e.g. MagicalMadhur via gh CLI)
router.post('/cli-login', async (req, res) => {
  const cliToken = getLocalCliToken();
  if (!cliToken) {
    return res.status(400).json({ error: 'No active GitHub CLI login detected on this machine. Run "gh auth login" or use OAuth/Demo.' });
  }

  try {
    const service = new GitHubService(cliToken, false);
    const user = await service.getUser();

    req.session.githubToken = cliToken;
    req.session.user = user;

    res.json({ success: true, user, message: `Connected as @${user.login}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to authenticate via GitHub CLI: ' + err.message });
  }
});

// 1-Click Demo Login
router.post('/demo-login', async (req, res) => {
  const service = new GitHubService(null, true);
  const user = await service.getUser();
  req.session.githubToken = 'demo-token';
  req.session.user = user;
  res.json({ success: true, user });
});

// Get Current User Profile & CLI availability
router.get('/me', (req, res) => {
  const cliToken = getLocalCliToken();
  res.json({
    authenticated: !!req.session?.user,
    user: req.session?.user || null,
    hasCliLogin: !!cliToken
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ success: true });
});

module.exports = router;
