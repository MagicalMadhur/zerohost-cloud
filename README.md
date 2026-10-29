# ⚡ ZeroHost Cloud Platform

> **The Zero-Cost Cloud Hosting Platform for Non-Technical Users.**  
> Users sign in with GitHub, pick a starter or upload their site, and launch in 60 seconds. Everything behind the scenes—private repos, CDN routing, GitHub Actions, and serverless compute—is automated.

---

## 🌟 Key Features

1. **GitHub OAuth Authentication**: Users log in securely with their GitHub account (or use 1-Click Demo Login).
2. **1-Click 60-Second Deploy Wizard**:
   - **Step 1**: Choose Template (Landing Page, Node.js API, Creator Portfolio, Python Microservice).
   - **Step 2**: Auto-recommends compute engine (GitHub Pages + jsDelivr CDN, Cloudflare Workers, or Vercel).
   - **Step 3**: Enter project name & click **Launch My Website Now**.
3. **Automated Dual-Repo Architecture**:
   - Creates a **Private Repository** for the user's source code, keeping secrets & raw code hidden.
   - Creates a **Public Gateway Repository** for built, minified assets served via jsDelivr CDN.
   - Sets up GitHub Actions continuous integration & deploy workflow automatically.
4. **In-Browser Web Editor**:
   - Allows users with zero Git experience to edit HTML, CSS, or JS files directly in the browser.
   - Hitting "Save & Deploy" commits to the private repository and triggers an automatic redeployment.
5. **Real-Time Deployment Terminal**:
   - Users see live animated deployment progress (repository creation, workflow setup, CDN priming).
6. **Zero Hosting Cost**:
   - Storage: 100% Free (GitHub)
   - CDN Bandwidth: 100% Free (jsDelivr + GitHub Pages)
   - API Compute: 100% Free (Cloudflare Workers 100k requests/day)

---

## 🚀 Running the Platform

```bash
cd "d:\VIBE Code\Github Server\zerohost-platform"
npm install
npm start
```

Visit the dashboard in your browser:
👉 **`http://localhost:4000`**

---

## 🔑 Setting Up Real GitHub OAuth (Optional)

By default, **Demo/Sandbox Mode** is active so you and your users can test everything immediately without creating OAuth apps.

To connect your real GitHub account:
1. Go to [GitHub Developer Settings → OAuth Apps → New OAuth App](https://github.com/settings/applications/new).
2. Set:
   - **Application name**: `ZeroHost Cloud`
   - **Homepage URL**: `http://localhost:4000`
   - **Authorization callback URL**: `http://localhost:4000/api/auth/github/callback`
3. Copy your **Client ID** and generate a **Client Secret**.
4. In `zerohost-platform/.env`:
   ```ini
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   DEMO_MODE=false
   ```
5. Restart the server: `npm start`.

