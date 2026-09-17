# EDC Discord Music Night LIVE — site

A self-hosted rebuild of edcdiscordmusicnight.live, off Blogger. Built with
[Eleventy](https://www.11ty.dev/) (11ty), a **static site generator**: there's
no server, no database, and no CMS rendering pages on the fly. Eleventy is a
build tool — you run it once, it reads your source files, and it spits out
plain `.html` files into a `_site/` folder. Those plain HTML files are what
actually get hosted; a static host like GitHub Pages just serves them, the
same way any web host serves hand-written HTML. The difference from a
typical hand-built site is that you never hand-write the HTML pages
themselves — Eleventy generates every one of them from small data files and
a couple of shared templates, every time you build.

That's also the direct answer to "how does this stay online without the
usual index.html-per-page structure": Eleventy *does* produce a real
`index.html` for every episode, it just does it automatically from a
`permalink` field, instead of you creating and maintaining each file by
hand.

## How it's organized

```
edcmnl-site/
├── .eleventy.js          ← build configuration — collections, filters, I/O paths
├── package.json           ← npm scripts (build, serve) + Eleventy as a dependency
├── src/                    ← everything Eleventy reads
│   ├── _data/
│   │   └── site.json        ← site-wide values: nav links, footer links, description
│   ├── _includes/
│   │   ├── base.njk           ← outer HTML shell every page shares (head, header, footer)
│   │   └── episode.njk         ← the template that turns one episode's data into a page
│   ├── css/
│   │   └── style.css            ← all styling, one file
│   ├── episodes/
│   │   ├── vol-47.md              ← ONE FILE PER EPISODE — this is what you'll edit
│   │   ├── vol-46.md
│   │   └── ... (48 total, oldest to newest)
│   ├── index.njk                  ← homepage template
│   └── CNAME                       ← tells GitHub Pages which custom domain to serve
└── .github/workflows/
    └── deploy.yml                   ← CI script that builds + publishes on every push
```

## How a single episode file works

Open any file in `src/episodes/`, e.g. `vol-47.md`. It has two parts:

1. **Front matter** — the YAML block between the `---` lines at the top.
   This is structured data: title, date, cover image, the DJ list with
   links. Eleventy reads this as data, not content.
2. **Markdown body**, below the front matter — the free-text intro blurb,
   written in plain Markdown (`**bold**`, `[link](url)`, blank lines
   between paragraphs).

```yaml
---
layout: episode.njk
title: "EDC Discord Music Night LIVE Vol 47"
permalink: /episodes/vol-47/
date: 2026-09-12
coverImage: "https://..."
djs:
  - name: Delanada
    link: "https://soundcloud.com/..."
    items:
      - label: VOD
        url: "https://mega.nz/..."
---
Your intro paragraph goes here in **markdown**.
```

The `layout: episode.njk` line tells Eleventy "wrap this file's data and
content in the episode template." Eleventy then:

- Takes the front matter fields (`title`, `date`, `djs`, etc.) and makes
  them available as variables inside `episode.njk`
- Converts the Markdown body to HTML and drops it wherever `episode.njk`
  says `{{ content | safe }}`
- Wraps the whole result in `base.njk` (because `episode.njk` itself has
  `layout: base.njk` in its own front matter — layouts can chain)
- Writes the final HTML to `_site/episodes/vol-47/index.html`, using the
  `permalink` field to decide the path

## Front matter field reference

- `title` — the episode title as it should appear
- `permalink` — the URL path, e.g. `/episodes/vol-48/`
- `date` — `YYYY-MM-DD`, controls sort order and the displayed date
- `coverImage` — a URL to the cover art (see "Hosting images" below)
- `excerpt` — one sentence shown on the homepage card
- `nextShow` — optional callout box (next go-live date, etc). Delete this
  line entirely if you don't want the box.
- `series` — optional; set to `"Music Night REWIND"` for a Rewind episode.
  Changes the small eyebrow label above the title.
- `djs` — the set order list. Each entry is a name, an optional `link`
  (their socials/music), and an `items` list of extra links (VOD,
  SoundCloud, etc.) — add as many `items` as you want per DJ.

## The templates (`_includes/`)

- **`base.njk`** — the shell every page shares: `<head>`, fonts, the header
  nav bar, the footer with your Discord/Twitch/EDC links. Edit this for
  anything site-wide, like a new nav link or footer entry (though most of
  that actually lives in `site.json` — see below).
- **`episode.njk`** — the shape of one episode page: hero image,
  title/date, intro, the numbered DJ set-order list. Uses Nunjucks
  templating (`{{ variable }}`, `{% for dj in djs %}`) to loop over the
  `djs` array from front matter.
- **`index.njk`** (homepage) — loops over `collections.episodes` (every
  file in `src/episodes/`) and prints a card for each.

## `.eleventy.js` — the config file

This is the closest thing to "backend logic" here:

- Tells Eleventy where source files live (`src/`) and where to output
  (`_site/`)
- Defines the `episodes` collection: grab every file in
  `src/episodes/*.md`, sort by date descending — this is what makes new
  episodes automatically appear at the top of the homepage with zero
  manual list-editing
- Defines the `readableDate` / `shortDate` filters used in the templates

## Making edits yourself

- **Fix a typo / grammar in one episode** — open that episode's `.md`
  file, edit the Markdown text below the front matter, save.
- **Add a link to the nav or footer** — edit `src/_data/site.json`
  (the `links` array is the footer list; `twitch` / `discord` feed the
  header). One place, used everywhere.
- **Add a new episode** — copy an existing `.md` file, change the front
  matter, write the intro. No HTML touched.
- **Change colors / fonts / spacing** — `src/css/style.css`, plain CSS.
- **Change the structure of every episode page** — edit `episode.njk`.

## Hosting images

Episode files currently point at their original Blogger-hosted image URLs,
which will keep working indefinitely. For full independence going forward,
drop new cover art into `src/img/episodes/` and reference it as
`/img/episodes/your-file.jpg` in `coverImage`.

## Running it locally

```bash
npm install         # once, installs Eleventy
npm run serve        # local dev server, live-reloads on file changes
npm run build         # one-shot build into _site/ — this is what deploy runs
```

## Pushing to GitHub for the first time

This repo doesn't exist on GitHub yet, so you'll need to create one and push
this project into it.

1. **Create a new, empty repository** on GitHub: go to
   [github.com/new](https://github.com/new), name it (e.g.
   `edcmnl-site`), leave it empty (no README/gitignore/license — this
   project already has those), and click **Create repository**.
2. **From inside this project folder**, initialize git and push:

   ```bash
   cd edcmnl-site
   git init
   git add .
   git commit -m "Initial commit: migrate from Blogger to Eleventy"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

   (If you use SSH instead of HTTPS for GitHub, use the `git@github.com:...`
   remote URL from the repo's "Code" button instead.)

## Deploying (GitHub Pages)

`.github/workflows/deploy.yml` is a **GitHub Actions** workflow that builds
and publishes automatically on every push to `main`. No server for you to
maintain, patch, or pay for — GitHub rebuilds and republishes the whole
site on every push, and "hosting" is just files sitting in a
GitHub-managed static bucket.

1. In the repo on GitHub, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
2. Push to `main` (the first push above already triggers this). Watch it
   run under the repo's **Actions** tab.
3. Once it finishes, your site is live at
   `https://<your-username>.github.io/<repo-name>/` — but you'll point
   your real domain at it next.
4. **Point your custom domain at GitHub Pages:**
   - In your domain's DNS (wherever `edcdiscordmusicnight.live` is
     registered — Blogger's custom-domain setup uses your registrar's
     DNS, not Blogger itself, so this doesn't touch Blogger at all), set
     the `www` record to `CNAME` → `<your-username>.github.io`.
   - `src/CNAME` in this repo already contains
     `www.edcdiscordmusicnight.live` — GitHub Pages reads this file on
     every deploy to know which custom domain to serve.
   - Back in **Settings → Pages**, add the same custom domain in the
     "Custom domain" field and enable **Enforce HTTPS** once GitHub
     finishes verifying it (can take a few minutes to a few hours).
5. Once DNS and GitHub Pages both confirm the domain is live, you can turn
   off or delete the Blogger site.

## What happens on every future push

```
git add .
git commit -m "Add Vol 48"
git push
```

GitHub Actions then, automatically:

1. Spins up a temporary Linux runner
2. Checks out the repo, runs `npm ci` and `npm run build`
3. Uploads the resulting `_site/` folder to GitHub Pages
4. Your live site updates within a minute or two — no manual deploy step,
   ever.

## Design notes

Colors, type, and layout are defined in `src/css/style.css`. The palette is
a deep violet-navy base with one magenta accent and one cyan accent (used
only for links). Headlines use "Unbounded," body text uses "Inter," both
loaded from Google Fonts in `base.njk`.
