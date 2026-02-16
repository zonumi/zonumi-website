# Zonumi Website

A portfolio-style website for Zonumi built with Next.js 15, React 19, and TypeScript.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Markdown-based content

## Project Structure

- `src/app/` - App Router pages, layout, and global styles
- `src/components/` - Reusable UI components
- `src/lib/` - Utility and data-loading helpers
- `content/` - Markdown content (`profile`, `experience`, `projects`)
- `public/` - Static assets

## Getting Started

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Contact Form (Formspree)

The contact window uses Formspree via `@formspree/react`.

Set this environment variable:

```bash
NEXT_PUBLIC_FORMSPREE_FORM_ID=<your-formspree-form-id>
```

For local development, put it in `.env.local`.  
For deployment, set it in your hosting provider environment settings.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run test:unit` - Run Jest unit/integration tests
- `npm run test:e2e` - Run Playwright e2e tests

## Validation

Before merging changes, run:

```bash
npm run lint && npm run build
```
