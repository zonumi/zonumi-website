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
- `content/` - Markdown content (`profile`, `skills`, `projects`)
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

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

## Validation

Before merging changes, run:

```bash
npm run lint && npm run build
```
