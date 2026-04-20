# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `just serve` — local dev server with live reload (runs `bundle exec jekyll serve`)
- `just deploy` — builds and pushes to the `public` branch (which is what GitHub Pages serves)
- `bundle install` — install dependencies (Ruby 3.3.10 via `.tool-versions`)

## Architecture

This is a Jekyll personal site using the **minima** theme (pinned to commit `b3385fe` from the minima repo). It's hosted on GitHub Pages at xhocquet.github.io.

### Two distinct sites in one repo

1. **Personal site** — uses minima theme defaults with custom overrides. Pages: index, code, recipes, reflections, blogroll, reviews.
2. **Consulting site** (`/consulting/`) — a standalone page with its own layout (`_layouts/consulting.html`, `layout: null` at the HTML level), its own CSS (`assets/css/consulting.css`), and its own set of includes (`_includes/consulting/`). It does not use the minima theme at all.

### Navigation

Site nav is defined in `_includes/nav-items.html` (hardcoded links, not auto-generated from pages). The header include (`_includes/header.html`) wraps it.

### Collections

Four Jekyll collections configured in `_config.yml`:

- **recipes** (`output: true`, `sort_by: title`) — frontmatter uses `layout: page` or `layout: post`
- **reflections** (`output: true`) — blog posts with `date` and `tags` in frontmatter. The index page separates pinned (tagged `pinned`) from recent posts.
- **blogroll** (`output: false`) — external link entries with `title`, `link`, `date`, and `tags`. Not rendered as individual pages.
- **reviews** (`output: true`) — subdirectory-based (e.g., `_reviews/civ6/`) with HTML index files and image assets alongside them.

### Styles

- Personal site: SASS overrides in `_sass/minima/` — `custom-variables.scss`, `custom-styles.scss`, and a `custom-styles-christmass.scss` variant.
- Consulting site: self-contained CSS in `assets/css/consulting.css` with its own design system (CSS custom properties for colors, typography via Plus Jakarta Sans).

### Deployment

The `master` branch holds source. `just deploy` builds to `_site/`, copies it into a temporary git worktree on the `public` branch, commits, and pushes. GitHub Pages serves from `public`.
