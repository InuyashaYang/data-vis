# Math Dataset Showcase (GitHub Pages)

Static dataset "showcase" site for math annotation samples.

- Render: Markdown + LaTeX (KaTeX)
- Data: JSON files in `public/data/`
- Deploy: GitHub Actions -> GitHub Pages

## Local dev

```bash
npm install
npm run dev
```

## Data layout

- `public/data/index.json`: dataset list (cards)
- `public/data/datasets/<id>/meta.json`: dataset metadata
- `public/data/datasets/<id>/pages/<n>.json`: paged samples

### Math markdown note

If your JSON contains LaTeX commands, you must escape backslashes.

- Wrong: `"$\frac{a}{b}$"`
- Right: `"$\\frac{a}{b}$"`

## Deploy

Push to `main`. Workflow: `.github/workflows/deploy-pages.yml`.

Note: GitHub Pages is usually served under `/<repo>/`, so the workflow sets `VITE_BASE` automatically.
