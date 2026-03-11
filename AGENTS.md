# AGENTS.md

## Cursor Cloud specific instructions

This is a Jekyll 4.4.1 static site (personal blog). See `README.md` for basic commands (`just serve`, `just deploy`).

### Tooling

- **Ruby 3.3.10** managed via `mise` (reads `.tool-versions`). The `.tool-versions` file uses `ruby local 3.3.10` format (asdf convention); mise shows a harmless `missing: ruby@local` warning — ignore it.
- **Bundler 2.7.2** for gem dependency management (`Gemfile` / `Gemfile.lock`).
- **Just** command runner (`Justfile`).

### Gotchas

- The default C++ compiler in this VM is `clang++`, which cannot compile the `eventmachine` native extension because it cannot find `<iostream>`. The update script switches `/usr/bin/c++` to `g++` via `update-alternatives` before running `bundle install`.
- `bundle exec jekyll build` produces Sass deprecation warnings from the upstream `minima` theme — these are not errors and can be ignored.
- There is no test suite or linter in this repo. Verification is done by building (`bundle exec jekyll build`) and serving (`just serve` / `bundle exec jekyll serve`).
- The dev server runs on port 4000 by default. Use `--host 0.0.0.0` to make it accessible outside localhost.
