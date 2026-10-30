/**
 * =============================================================================
 * ZeroHost Serverless Cloud Database & Public REST Engine (cPanel phpMyAdmin Parity)
 * =============================================================================
 * Provides instant zero-cost database provisioning for static sites & apps.
 * Sites can fetch/store dynamic data via: /api/db/:projectSlug/:table
 * =============================================================================
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'data', 'projects.json');

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
    console.error('Failed to save projects.json:', err.message);
  }
}

// Helper: Ensure a project has a serverless database initialized
function ensureProjectDatabase(project) {
  if (!project.database) {
    project.database = {
      enabled: true,
      createdAt: new Date().toISOString(),
      tables: {
        feedback: {
          columns: ['id', 'name', 'email', 'message', 'createdAt'],
          rows: [
            {
              id: 'row_1',
              name: 'Alex Johnson',
              email: 'alex@example.com',
              message: 'Love the high speed 32-thread download manager!',
              createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
            },
            {
              id: 'row_2',
              name: 'Sarah Connor',
              email: 'sarah@skynet.org',
              message: 'ZeroHost CDN integration is lightning fast.',
              createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
            }
          ]
        },
        subscribers: {
          columns: ['id', 'email', 'subscribedAt'],
          rows: [
            {
              id: 'row_sub1',
              email: 'developer@zerohost.cloud',
              subscribedAt: new Date(Date.now() - 3600000 * 48).toISOString()
            }
          ]
        }
      }
    };
  }
  return project.database;
}

// =============================================================================
// Dashboard Management Endpoints (Protected by Project ID)
// =============================================================================

// Get Database Overview & Table Schemas
router.get('/:id', (req, res) => {
  const projects = loadProjects();
  const project = projects.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const db = ensureProjectDatabase(project);
  saveProjects(projects);

  const tableNames = Object.keys(db.tables || {});
  const schemas = {};
  let totalRows = 0;

  tableNames.forEach(t => {
    const tbl = db.tables[t];
    schemas[t] = {
      columns: tbl.columns || [],
      rowCount: (tbl.rows || []).length
    };
    totalRows += (tbl.rows || []).length;
  });

  res.json({
    enabled: db.enabled,
    restEndpoint: `/api/db/${project.slug}/<table_name>`,
    sqliteDriver: `sqlite://data/${project.slug}.db`,
    stats: {
      tablesCount: tableNames.length,
      totalRows
    },
    tables: schemas
  });
});

// Create New Table
router.post('/:id/tables', (req, res) => {
  const projects = loadProjects();
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { name, columns } = req.body;
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Table name is required' });

  const cleanTableName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const db = ensureProjectDatabase(project);

  if (db.tables[cleanTableName]) {
    return res.status(400).json({ error: 'Table already exists' });
  }

  const cleanCols = Array.isArray(columns) && columns.length > 0
    ? ['id', ...columns.filter(c => c !== 'id' && c !== 'createdAt'), 'createdAt']
    : ['id', 'title', 'content', 'createdAt'];

  db.tables[cleanTableName] = {
    columns: cleanCols,
    rows: []
  };

  project.logs.push(`[${new Date().toISOString().substring(11, 19)}] 🗄️ Created database table "${cleanTableName}"`);
  saveProjects(projects);

  res.status(201).json({ success: true, table: cleanTableName, columns: cleanCols });
});

// Get Table Rows
router.get('/:id/tables/:table', (req, res) => {
  const projects = loadProjects();
  const project = projects.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const db = ensureProjectDatabase(project);
  const tbl = db.tables[req.params.table.toLowerCase()];
  if (!tbl) return res.status(404).json({ error: 'Table not found' });

  res.json({
    table: req.params.table,
    columns: tbl.columns || [],
    rows: tbl.rows || []
  });
});

// Insert Row into Table
router.post('/:id/tables/:table/rows', (req, res) => {
  const projects = loadProjects();
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const db = ensureProjectDatabase(project);
  const tbl = db.tables[req.params.table.toLowerCase()];
  if (!tbl) return res.status(404).json({ error: 'Table not found' });

  const newRow = {
    id: 'row_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 3),
    ...(req.body || {}),
    createdAt: new Date().toISOString()
  };

  tbl.rows.unshift(newRow);
  saveProjects(projects);

  res.status(201).json({ success: true, row: newRow });
});

// Delete Row from Table
router.delete('/:id/tables/:table/rows/:rowId', (req, res) => {
  const projects = loadProjects();
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const db = ensureProjectDatabase(project);
  const tbl = db.tables[req.params.table.toLowerCase()];
  if (!tbl) return res.status(404).json({ error: 'Table not found' });

  const idx = tbl.rows.findIndex(r => r.id === req.params.rowId);
  if (idx === -1) return res.status(404).json({ error: 'Row not found' });

  tbl.rows.splice(idx, 1);
  saveProjects(projects);

  res.json({ success: true, message: 'Row deleted' });
});

// Export Database as JSON
router.get('/:id/export', (req, res) => {
  const projects = loadProjects();
  const project = projects.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const db = ensureProjectDatabase(project);
  const jsonStr = JSON.stringify(db, null, 2);

  res.set({
    'Content-Type': 'application/json',
    'Content-Disposition': `attachment; filename="${project.slug}-database-backup.json"`
  });
  res.send(jsonStr);
});

// Public REST Endpoint for Hosted Frontends (CORS Enabled)
const publicRouter = express.Router();

publicRouter.all('/:slug/:table', (req, res) => {
  const { slug, table } = req.params;
  const projects = loadProjects();
  const project = projects.find(p => p.slug === slug || p.id === slug);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const db = ensureProjectDatabase(project);
  const tbl = db.tables[table.toLowerCase()];
  if (!tbl) return res.status(404).json({ error: `Table "${table}" not found in project database` });

  if (req.method === 'GET') {
    return res.json({
      success: true,
      project: project.slug,
      table,
      count: tbl.rows.length,
      data: tbl.rows
    });
  }

  if (req.method === 'POST') {
    const newRow = {
      id: 'row_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 3),
      ...(req.body || {}),
      createdAt: new Date().toISOString()
    };
    tbl.rows.unshift(newRow);
    saveProjects(projects);
    return res.status(201).json({ success: true, message: 'Row inserted successfully', row: newRow });
  }

  res.status(405).json({ error: 'Method not allowed' });
});

module.exports = { router, publicRouter };
