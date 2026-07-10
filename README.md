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

TODO
====

 - [ ] move from table to grid
 - [ ] mobile first
 - [ ] alternating rows
 - [ ] better mobile version
 - [ ] finish data.yml
 - [ ] add updated date
 - [ ] make the table searchable
 - [ ] be WWW 66.6 and drop table for divs
 - [ ] data assertion
 - [ ] image printout
 - [x] stick header (computer)
 - [ ] stick header (mobile)
