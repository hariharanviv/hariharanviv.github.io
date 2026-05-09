# Static Academic Website — README

This folder contains a minimal, build-free static academic website using plain HTML, CSS and vanilla JavaScript. No build process required.

**Features:**
- Light/dark mode toggle with localStorage persistence
- Responsive sidebar with profile card, tidbit, and avatar
- Sticky header navigation
- Jean Fan-inspired blog post cards
- Markdown-based content (no database)
- Works with any static server (GitHub Pages, Python, nginx, etc.)

Folder structure
```
/
├── index.html               # Main site
├── styles.css              # Styles
├── app.js                  # Markdown loader
├── README.md               # This file
├── about.md                # About page
├── publications.md         # Publications page
├── tidbit.md               # Sidebar tidbit
├── /assets/
│   ├── avatar.jpg          # Profile photo
│   ├── icon-email.svg      # Email icon
│   ├── icon-x.svg          # X icon
│   ├── icon-scholar.svg    # Google Scholar icon
│   ├── icon-orcid.svg      # ORCID icon
│   └── icon-github.svg     # GitHub icon
├── /blog/
│   ├── index.md            # Blog hub
│   ├── post-1.md           # Example post
│   └── post-2.md           # Add more posts here
├── /cvs/
│   ├── cv.md               # CV page
│   └── cv.pdf              # CV PDF (optional)
└── /papers/
    ├── paper1.pdf          # Add papers here
    └── paper2.pdf          # ...
```

Core files
- [index.html](index.html) — main site shell and navigation
- [styles.css](styles.css) — visual styles (Roboto font, light/dark mode variables)
- [app.js](app.js) — client-side Markdown loader and renderer

Content files (root level)
- [about.md](about.md) — about page
- [publications.md](publications.md) — publications page
- [tidbit.md](tidbit.md) — sidebar tidbit text

Blog folder (`/blog/`)
- [blog/index.md](blog/index.md) — blog hub (aggregates all posts)
- [blog/post-1.md](blog/post-1.md) — example blog post
- Add more: `blog/post-2.md`, `blog/post-3.md`, etc.

CV folder (`/cvs/`)
- [cvs/cv.md](cvs/cv.md) — web-friendly CV summary
- `cvs/cv.pdf` — optional CV PDF for download

Papers folder (`/papers/`)
- `papers/paper1.pdf` — add research papers or PDFs here

Assets folder (`/assets/`)
- `assets/avatar.jpg` — optional profile photo (~200x200px)

How it works
- The site fetches Markdown files on page load and renders them to HTML using a minimal parser.
- Theme preference is stored in localStorage and persists across sessions.
- No build step or server-side processing—just static files.

Add or edit content

**Main pages (About, Publications, CV):**
Edit the corresponding `.md` files directly. The site reloads content when you click nav buttons.

**Blog posts:**
1. Create a new `.md` file in the `/blog/` folder (e.g., `blog/post-2.md`) with your post content.
2. Add an entry to [blog/index.md](blog/index.md) using this format:

```
### Category | Month Day, Year
Post Title
First paragraph or excerpt...

---
```

For example:
```
### Commentary | May 9, 2026
Five Ways Data Can Transform Your Perspective
A short intro to the post. This excerpt will appear in the blog hub...

---
```

The blog hub automatically extracts the title and first ~300 characters as an excerpt.

Advanced: link titles directly to post files

If you prefer the blog hub entry's title to be a direct link to the full post file (so clicking the title opens the post in-place), write the title line as a Markdown link to the post file, e.g.:

```
### Commentary | May 9, 2026
[Five Ways Data Can Transform Your Perspective](blog/post-5.md)
The short intro paragraph...

---
```

The site will detect `[...] (path/to/post.md)` and make the card's title open that file inside the main content area.

**Add sidebar content:**
- Edit [tidbit.md](tidbit.md) for the short personal tidbit under your name
- Place `avatar.jpg` in `/assets/` for a profile photo
- Edit [cvs/cv.md](cvs/cv.md) and drop a `cv.pdf` in `/cvs/` for the CV page
- Add research papers or PDFs to `/papers/` for reference

**Social links (sidebar):**
- Edit the social link URLs in `index.html` in the sidebar `section.social-section`.
- Replace the placeholder URLs with your own handles:
  - Email: `mailto:you@example.com`
  - X: `https://x.com/YOUR_USERNAME`
  - Google Scholar: `https://scholar.google.com/citations?user=YOUR_ID`
  - ORCID: `https://orcid.org/YOUR_ORCID`
  - GitHub: `https://github.com/YOUR_USERNAME`
- Icons are SVG files in `/assets/` (email, X, scholar, ORCID, GitHub).
- In light mode, icons are black; in dark mode, they are automatically inverted for contrast.
- To use custom icons, replace the `src` paths in `index.html` or create new SVG files in `/assets/`.

**Add new nav items:**
Add a button to the navigation in `index.html`:

```html
<button data-md="path/to/file.md" class="nav-link">Label</button>
```

Markdown features supported
- Headings `#` through `######`
- Unordered lists (`-`, `*`, `+`)
- Code blocks with triple backticks
- Inline code `` `code` ``
- Bold `**text**` and italics `*text*`
- Links `[text](url)` and images `![alt](path)`

Customization

**Theme toggle:**
The 🌙/☀️ button in the header toggles light and dark mode. Edit `:root` and `body.dark-mode` in `styles.css` to customize colors.

**Typography:**
- Font: Roboto (sans-serif)
- Base size: 1.05rem with 1.6 line-height
- Headings: 4rem (h1), 3rem (h2), 2.2rem (h3)

To change fonts or sizes, edit `styles.css`.

Preview locally

```bash
cd /path/to/website
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

Deploy to GitHub Pages (user site)

1. Create a GitHub repository named `hariharanviv.github.io` under your account (hariharanviv). You can do this on the web or via the GitHub CLI:

```bash
# using GitHub CLI (optional)
gh repo create hariharanviv/hariharanviv.github.io --public --source=. --remote=origin --push
```

2. If you didn't use `gh`, create the repo on GitHub, then run locally:

```bash
git remote add origin git@github.com:hariharanviv/hariharanviv.github.io.git
git branch -M main
git push -u origin main
```

3. For a user site, GitHub Pages will serve `https://hariharanviv.github.io` automatically from the `main` branch. No additional configuration is required. If you prefer `gh-pages` branch, configure Pages in the repo settings.

Notes
- Ensure the repository name is exactly `hariharanviv.github.io` for a user site.
- You can add a `CNAME` file if you want a custom domain.
- A `.nojekyll` file is included to prevent GitHub from ignoring files that start with an underscore.

Notes
- This is a minimal markdown renderer. For advanced Markdown (tables, GFM), consider replacing `app.js` with `marked.js` or `markdown-it`.
- The site uses CSS Grid for layout (sidebar + content). Adjust `grid-template-columns` in `styles.css` for different widths.
- All theme colors use CSS variables, so changing light/dark mode colors is simple—edit `--bg`, `--accent`, `--text`, etc. in `styles.css`.
