# MindSpark - AI Study Suite

Your personal AI study partner. Turn textbooks into summaries, notes, and flashcards.

## 🚀 GitHub Pages Deployment

This project is pre-configured for GitHub Pages deployment.

### Automatic Deployment (Recommended)
1. Push your code to the `main` branch of a GitHub repository.
2. The GitHub Action in `.github/workflows/deploy.yml` will automatically build and deploy your site.
3. On GitHub, go to **Settings > Pages** and ensure the source is set to the `gh-pages` branch.

### Manual Deployment
If you want to deploy manually from your local machine:
```bash
npm install
npm run deploy
```

## 🛠️ Configuration
For most GitHub Pages sites (e.g., `https://username.github.io/repo-name/`), the `base` in `vite.config.ts` is set to `./`. This should work automatically for assets.

## 🔑 Environment Variables
Remember that GitHub Pages is a public static host. **Do not put private API keys in your code.**
This app is designed to allow users to input their own keys via the **API Explorer** or **Settings**, which are stored securely in their local browser storage.
