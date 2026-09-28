# QuoteDrop

**Words worth keeping.**

QuoteDrop is a polished quote discovery, collection, sharing, and quote-card creation app built with React and TypeScript.

## Features

- 108 bundled quotes across 12 categories
- Deterministic Quote of the Day
- Random quote discovery without immediate repeats
- Search across quote text, authors, categories, and tags
- Category browsing with live quote counts
- Local favorites with a dedicated saved-words view
- Recent quote history stored as IDs only
- Clipboard copy
- Web Share API support with clipboard fallback
- Focused quote detail view
- Quote-card creator with six presets:
  - Paper
  - Midnight
  - Sunset
  - Ocean
  - Rose
  - Forest
- Export formats:
  - Square 1080×1080
  - Portrait 1080×1350
  - Landscape 1200×675
- Card customization:
  - background and blend colors
  - text and accent colors
  - alignment
  - serif or sans type
  - quote size
  - quotation marks
  - author visibility
  - QuoteDrop branding
- High-resolution client-side PNG export
- Automatic long-quote text scaling
- Light, dark, and system theme modes
- Responsive desktop, tablet, and mobile layout

## Privacy

QuoteDrop has no accounts, backend database, analytics profile, or API keys.

Only harmless browser preferences are stored locally:

- favorite quote IDs
- recently viewed quote IDs
- theme preference

## Tech stack

- React 19
- TypeScript
- Vite
- Lucide React
- Radix UI primitives
- Sonner
- localStorage
- Canvas API

## Run locally

```bash
git clone https://github.com/jkeraso-cpu/quotedrop.git
cd quotedrop
npm install
npm run dev
```

Open the local Vite URL shown in your terminal.

## Production build

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test
```

The utility tests cover dataset integrity, search/filtering, random quote behavior, daily quote stability, copy formatting, filename sanitization, long-text scaling, favorites persistence, and recent-history limits.

## Project structure

```text
src/
  components/
    QuoteCard.tsx
    QuoteCardCreator.tsx
    shared UI components
  helpers/
    quoteData.tsx
    quoteUtils.tsx
    quotePrefs.tsx
    cardExport.tsx
    themeMode.tsx
  pages/
    _index.tsx
  base.css
  global.css
  main.tsx
```

## Future ideas

- Copy exported quote cards directly to the system clipboard where supported
- User-uploaded card backgrounds
- More curated public-domain collections
- Saved creator presets
- Keyboard shortcuts for faster discovery

## License

MIT
