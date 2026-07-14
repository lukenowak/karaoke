Karaoke
=======

Data for https://karaoke.nowak.io/

The site is a static single page application. It loads `data.yml` directly in
the browser, parses it with `js-yaml`, and renders the karaoke table with
client-side JavaScript.

Run locally
===========

Serve the directory over HTTP:

```
python3 -m http.server
```

Then open http://localhost:8000/.

Opening `index.html` directly from the filesystem may not work because browsers
restrict `fetch()` for local files.

Validate data
=============

Install the validation dependency if needed:

```
python3 -m pip install -r requirements.txt
```

Then validate the source data:

```
python3 validate_data.py
```

Generate images
===============

Render shareable images from the current page (needs Node.js; installs
Playwright + Chromium on first run):

```
image/make.sh
```

This writes two files (git-ignored):

 - `image/poster.png` — the full schedule, for posting.
 - `image/cover.png` — a Facebook cover banner (1640x624) with the live venue
   and city counts.

Re-run it whenever `data.yml` changes. The `image/` folder is dev-only tooling
and is excluded from deploys.

TODO
====

 - [x] mobile first
 - [x] alternating rows
 - [x] better mobile version
 - [x] add updated date
 - [x] make the table searchable
 - [x] data assertion
 - [x] image printout
 - [x] stick header (computer)
 - [x] stick header (mobile)
