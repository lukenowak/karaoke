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

TODO
====

 - [ ] mobile first
 - [ ] alternating rows
 - [ ] better mobile version
 - [ ] move from table to grid
 - [ ] complete data coverage for the current target region
 - [x] add updated date
 - [x] make the table searchable
 - [ ] replace the table with div/grid layout
 - [x] data assertion
 - [ ] image printout
 - [x] stick header (computer)
 - [ ] stick header (mobile)
