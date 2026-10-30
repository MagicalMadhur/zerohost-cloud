#!/usr/bin/env node

/**
 * =============================================================================
 * ZeroHost CLI (zh) — Direct Terminal Deployment & Cloud Management
 * =============================================================================
 * Deploy websites, roll back deployments, inspect logs, and manage variables
 * directly from your command line.
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');

const API_BASE = process.env.ZEROHOST_API || 'https://zerohost-platform.onrender.com';
const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
  console.log(`\x1b[36m⚡ ZeroHost CLI v1.0.0\x1b[0m — Zero-Cost Cloud Orchestrator\n`);

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;

    case 'list':
    case 'ls':
      await listProjects();
      break;

    case 'deploy':
      await deployFolder(args[1] || '.');
      break;

    case 'logs':
      await showLogs(args[1]);
      break;

    case 'health':
      await showHealth(args[1]);
      break;

    case 'rollback':
      await rollback(args[1], args[2]);
      break;

    default:
      console.log(`\x1b[31mUnknown command: ${command}\x1b[0m`);
      showHelp();
      process.exit(1);
  }
}

function showHelp() {
  console.log(`Usage: \x1b[33mzh <command> [options]\x1b[0m\n`);
  console.log(`Commands:`);
  console.log(`  \x1b[32mzh list\x1b[0m                  List all active cloud deployments`);
  console.log(`  \x1b[32mzh deploy [folder]\x1b[0m       Package and deploy a local folder to ZeroHost`);
  console.log(`  \x1b[32mzh logs <projectId>\x1b[0m      Stream live deployment logs & diagnostic doctor`);
  console.log(`  \x1b[32mzh health <projectId>\x1b[0m    Check live latency, HTTP status, and storage usage`);
  console.log(`  \x1b[32mzh rollback <id> <dep>\x1b[0m   Roll back to a previous deployment snapshot`);
  console.log(`  \x1b[32mzh help\x1b[0m                  Display this help message\n`);
}

async function listProjects() {
  try {
    const res = await axios.get(`${API_BASE}/api/projects`);
    const projects = res.data.projects || [];
    if (projects.length === 0) {
      console.log(`No active deployments found. Deploy one with: \x1b[33mzh deploy\x1b[0m`);
      return;
    }
    console.log(`Active Deployments (${projects.length}):\n`);
    projects.forEach(p => {
      console.log(`• \x1b[1m${p.name || p.slug}\x1b[0m (${p.id})`);
      console.log(`  Status:   \x1b[32m${p.status || 'online'}\x1b[0m`);
      console.log(`  Live URL: \x1b[34m${p.liveUrl || 'N/A'}\x1b[0m`);
      console.log(`  Cost:     \x1b[32m$0.00 / mo\x1b[0m (jsDelivr CDN)\n`);
    });
  } catch (err) {
    console.error(`\x1b[31mFailed to fetch projects:\x1b[0m ${err.message}`);
  }
}

async function deployFolder(targetFolder) {
  const absPath = path.resolve(targetFolder);
  if (!fs.existsSync(absPath)) {
    console.error(`\x1b[31mDirectory not found:\x1b[0m ${absPath}`);
    return;
  }

  console.log(`📦 Packaging local directory: ${absPath}`);
  const zip = new AdmZip();
  zip.addLocalFolder(absPath);
  const zipBuffer = zip.toBuffer();
  console.log(`Compressed size: ${(zipBuffer.length / 1024).toFixed(1)} KB`);

  // Target default project or ask
  const projectId = 'proj_velocity'; // Default showcase project
  console.log(`🚀 Uploading to ZeroHost project: ${projectId}...`);

  const FormData = require('form-data');
  const form = new FormData();
  form.append('zipfile', zipBuffer, { filename: 'cli-deploy.zip', contentType: 'application/zip' });

  try {
    const res = await axios.post(`${API_BASE}/api/projects/${projectId}/upload-zip`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    console.log(`\x1b[32m🎉 Successfully deployed ${res.data.count} files via ZeroHost CLI!\x1b[0m`);
    console.log(`🌐 Live URL: ${res.data.project.liveUrl}`);
  } catch (err) {
    console.error(`\x1b[31mDeployment failed:\x1b[0m ${err.message}`);
  }
}

async function showLogs(projectId) {
  const id = projectId || 'proj_velocity';
  console.log(`Fetching diagnostic logs for: ${id}...`);
  try {
    const res = await axios.get(`${API_BASE}/api/projects/${id}/logs`);
    const p = res.data.project;
    console.log(`\n--- Diagnostic Doctor ---`);
    (p.diagnostics || []).forEach(d => {
      const icon = d.level === 'pass' ? '✅' : (d.level === 'warn' ? '⚠️' : '❌');
      console.log(`${icon} [${d.level.toUpperCase()}] ${d.title}: ${d.desc}`);
    });
    console.log(`\n--- Recent Deployment Logs ---`);
    (p.logs || []).slice(-8).forEach(l => console.log(l));
  } catch (err) {
    console.error(`\x1b[31mFailed to fetch logs:\x1b[0m ${err.message}`);
  }
}

async function showHealth(projectId) {
  const id = projectId || 'proj_velocity';
  try {
    const res = await axios.get(`${API_BASE}/api/projects/${id}/health`);
    console.log(`Live Health for ${id}:`);
    console.log(`  Status:   \x1b[32m${res.data.status}\x1b[0m`);
    console.log(`  Latency:  \x1b[33m${res.data.pingLatencyMs} ms\x1b[0m`);
    console.log(`  Uptime:   \x1b[32m${res.data.uptimePercentage}\x1b[0m`);
    console.log(`  Storage:  ${res.data.storage.formatted} (${res.data.storage.filesCount} files)`);
  } catch (err) {
    console.error(`\x1b[31mHealth check failed:\x1b[0m ${err.message}`);
  }
}

async function rollback(projectId, deploymentId) {
  const id = projectId || 'proj_velocity';
  if (!deploymentId) {
    console.log(`Fetching available snapshots for ${id}...`);
    try {
      const res = await axios.get(`${API_BASE}/api/projects/${id}/deployments`);
      const list = res.data.deployments || [];
      console.log(`Available snapshots:`);
      list.forEach(d => console.log(`  • ${d.id}: ${d.message} (${new Date(d.timestamp).toLocaleString()})`));
      console.log(`\nRun: \x1b[33mzh rollback ${id} <snapshotId>\x1b[0m`);
    } catch (e) {
      console.error(e.message);
    }
    return;
  }

  try {
    const res = await axios.post(`${API_BASE}/api/projects/${id}/rollback`, { deploymentId });
    console.log(`\x1b[32m🎉 Successfully rolled back to ${deploymentId}!\x1b[0m`);
  } catch (err) {
    console.error(`\x1b[31mRollback failed:\x1b[0m ${err.message}`);
  }
}

main();

