# Server Diagnostic Knowledge Portal

A local, frontend-only React and Vite presentation of the Phase 1 thesis in `dell_test/THESIS.pdf`.

## Run locally

```bash
cd "/Users/sagandheesh/Documents/1. Research/Server Diagnostic Knowledge System"
npm install
npm run dev
```

Open the local URL printed by Vite. To check the production build, run `npm run build`.

The portal presents thesis results and selected static query examples. It does not run SPARQL in the browser or connect to a graph database. The thesis PDF and diagrams are included in `public/` so the website remains self-contained.

## Deploy to GitHub Pages

The Vite base path and GitHub Actions workflow are configured for this repository. Push changes to the `main` branch to build and publish the site automatically.

On GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. After the workflow succeeds, the site will be available at:

<https://gandheesh-sa.github.io/Server-Diagnostic-Knowledge-System/>

The site uses hash-based section navigation and does not require a `.env` file or client-side router configuration.
