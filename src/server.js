/**
 * =============================================================================
 * ZeroHost — Main Application Server
 * =============================================================================
 * Production Web Interface for Non-Technical Users to Host Websites & APIs
 * Powered automatically by GitHub + jsDelivr + Cloudflare / Serverless.
 * =============================================================================
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieSession = require('cookie-session');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const templateRoutes = require('./routes/templates');
const { router: databaseRoutes, publicRouter: publicDbRoutes } = require('./routes/database');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for GitHub OAuth credentials
app.use(
  cookieSession({
    name: 'zerohost_session',
    keys: [process.env.SESSION_SECRET || 'zerohost-secret-dev'],
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  })
);

// Static frontend dashboard files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/db', publicDbRoutes);

// Catch-all route to serve the dashboard SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`✨ ZeroHost Cloud Interface is running!`);
    console.log(`🌐 Dashboard: http://localhost:${PORT}`);
    console.log(`🔑 GitHub OAuth: ${process.env.GITHUB_CLIENT_ID ? 'Configured' : 'Demo/Sandbox Mode Active'}`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;

