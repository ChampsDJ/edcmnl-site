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
│   │   └── site.json        ← site-wide values: nav links, footer links, logo/mascot, description
│   ├── _includes/
│   │   ├── base.njk           ← outer HTML shell every page shares (head, header, footer)
│   │   └── episode.njk         ← the template that turns one episode's data into a page
│   ├── css/
│   │   └── style.css            ← all styling, one file
│   ├── episodes/
│   │   ├── vol-47.md              ← ONE FILE PER EPISODE — this is what you'll edit
│   │   ├── vol-46.md
│   │   └── ... (48 total, oldest to newest)
│   ├── img/
│   │   ├── site/                  ← logo, mascot, favicon — see "Site-wide images" below
│   │   └── episodes/               ← per-episode cover art, named to match each .md slug
│   ├── index.njk                  ← homepage template
│   ├── 404.njk                     ← not-found page (see "SEO & crawler files" below)
│   ├── sitemap.njk                  ← generates sitemap.xml at build time
│   ├── robots.txt                    ← crawler rules, points at the sitemap
│   └── CNAME                          ← tells GitHub Pages which custom domain to serve
├── scripts/
│   └── migrate-images.mjs               ← one-off utility, not part of the normal workflow (see below)
└── .github/workflows/
    └── deploy.yml                         ← CI script that builds + publishes on every push
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
coverImage: "/img/episodes/vol-47.jpg"
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
- `coverImage` — path to the cover art, e.g. `/img/episodes/vol-48.jpg`
  (see "Site-wide and episode images" below for the naming convention)
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
  banner/nav icons, the footer with the mascot and Discord/Twitch/EDC
  links. Edit this for anything site-wide (though most of the actual
  content lives in `site.json` — see below).
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
  episodes automatically appear at the top of the homepage, and at the
  top of the sitemap, with zero manual list-editing
- Defines the `readableDate` / `shortDate` / `isoDate` filters used in the
  templates
- Passes `src/css`, `src/img`, `src/robots.txt`, and `src/CNAME` straight
  through to the output untouched

## Making edits yourself

- **Fix a typo / grammar in one episode** — open that episode's `.md`
  file, edit the Markdown text below the front matter, save.
- **Add a link to the nav or footer** — edit `src/_data/site.json`
  (the `links` array is the footer list; `twitch` / `discord` feed the
  header icons). One place, used everywhere.
- **Add a new episode** — copy an existing `.md` file, change the front
  matter, write the intro. No HTML touched.
- **Change colors / fonts / spacing** — `src/css/style.css`, plain CSS.
- **Change the structure of every episode page** — edit `episode.njk`.

## Site-wide and episode images

`src/img/site/` holds the header banner, the footer mascot, and the
favicon (`logo.jpg`, `mascot.jpg`, `edcfav.ico` — referenced from
`site.json` and `base.njk`). These almost never change.

`src/img/episodes/` holds cover art, one file per episode, named to match
that episode's slug — `vol-47.jpg` for `vol-47.md`, and so on. Keep using
that same `<slug>.<ext>` convention for new episodes: drop the file in,
point `coverImage` at `/img/episodes/<slug>.<ext>` in that episode's front
matter, done.

`scripts/migrate-images.mjs` is the one-time tool that originally pulled
every cover (plus the logo and mascot) off Blogger's CDN and rewrote the
front matter to point at local files — that migration is already done for
all 48 episodes, so it's not part of the regular workflow anymore. It's
still there if you ever need it again (a bulk re-fetch, a new batch of old
posts to migrate, etc.): `npm run migrate-images -- --dry-run` previews,
`npm run migrate-images` runs it for real, and it always skips anything
whose image path is already local.

## SEO & crawler files

- **`src/robots.txt`** — passed straight through to `_site/robots.txt`.
  Allows all crawlers and points them at the sitemap.
- **`src/sitemap.njk`** — builds `_site/sitemap.xml` at build time by
  looping over the same `collections.episodes` the homepage uses, plus the
  homepage itself. This means the sitemap **updates itself automatically**
  every time you add an episode file and push — there's no separate list
  to maintain by hand, and no way for it to drift out of sync with what's
  actually on the site.
- **`src/404.njk`** — a real 404 page, in the same visual language as the
  homepage (mascot, same type and color system), served whenever GitHub
  Pages can't find a matching path. Output as `_site/404.html`, which is
  the specific filename GitHub Pages looks for.

## Running it locally

```bash
npm install         # once, installs Eleventy
npm run serve        # local dev server, live-reloads on file changes
npm run build         # one-shot build into _site/ — this is what deploy runs
```

## Deploying (GitHub Pages)

`.github/workflows/deploy.yml` is a **GitHub Actions** workflow that builds
and publishes automatically on every push to `main`. No server to
maintain, patch, or pay for — GitHub rebuilds and republishes the whole
site on every push, and "hosting" is just files sitting in a
GitHub-managed static bucket.

```bash
git add .
git commit -m "Add Vol 48"
git push
```

That's it. From there, GitHub Actions automatically:

1. Spins up a temporary Linux runner
2. Checks out the repo, runs `npm ci` and `npm run build`
3. Uploads the resulting `_site/` folder to GitHub Pages
4. Your live site updates within a minute or two — no manual deploy step,
   ever, and the sitemap in that build always reflects exactly what got
   pushed.

## Design notes

Colors, type, and layout are defined in `src/css/style.css`. The palette is
a deep violet-navy base with one magenta accent and one cyan accent (used
only for links). Headlines use "Unbounded," body text uses "Inter," both
loaded from Google Fonts in `base.njk`. The header banner spans the same
`980px` content column as the rest of the site and is centered; the Twitch
and Discord icons below it are recolored via a CSS mask so any SVG dropped
into `src/img/site/` picks up the site's palette automatically, regardless
of what colors are baked into the file itself.
