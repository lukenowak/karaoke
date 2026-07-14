const DAYS = ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Nd'];

const rows = document.querySelector('#karaoke-rows');
const warningsContainer = document.querySelector('#data-warnings');
const updatedContainer = document.querySelector('#last-updated');

function appendText(parent, text) {
  parent.appendChild(document.createTextNode(text ?? ''));
}

function createCell(text, options = {}) {
  const cell = document.createElement('td');

  if (options.colSpan) {
    cell.colSpan = options.colSpan;
  }

  if (options.align) {
    cell.align = options.align;
  }

  appendText(cell, text);
  return cell;
}

function createVenueCell(name, venue) {
  const cell = document.createElement('td');
  const link = document.createElement('a');

  link.href = venue.url;
  link.textContent = name;
  cell.appendChild(link);

  return cell;
}

function createIrregularCell(venue) {
  const cell = document.createElement('td');
  cell.colSpan = DAYS.length;
  cell.align = 'center';

  appendText(cell, venue.Występowanie ?? '');
  cell.appendChild(document.createElement('br'));

  if (venue.Opis) {
    appendText(cell, venue.Opis);
  }

  return cell;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toOptionalString(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value);
}

function sanitizeData(data) {
  const sanitized = {};
  const warnings = [];

  if (!isPlainObject(data)) {
    return {
      data: sanitized,
      warnings: ['data.yml musi zawierać mapę miejsc karaoke.'],
    };
  }

  for (const [rawName, rawVenue] of Object.entries(data)) {
    const name = String(rawName);

    if (!isPlainObject(rawVenue)) {
      warnings.push(`${name}: pominięto wpis, bo nie jest mapą danych.`);
      continue;
    }

    const city = toOptionalString(rawVenue.Miasto)?.trim();
    const url = toOptionalString(rawVenue.url)?.trim();

    if (!city) {
      warnings.push(`${name}: pominięto wpis bez pola "Miasto".`);
      continue;
    }

    if (!url) {
      warnings.push(`${name}: pominięto wpis bez pola "url".`);
      continue;
    }

    const venue = {
      Miasto: city,
      url,
      Prowadzący: toOptionalString(rawVenue.Prowadzący) ?? '???',
    };

    if ('Cyklicznie' in rawVenue) {
      if (!isPlainObject(rawVenue.Cyklicznie)) {
        warnings.push(`${name}: pole "Cyklicznie" nie jest mapą; użyto trybu nieregularnego.`);
        venue.Występowanie = toOptionalString(rawVenue.Występowanie) ?? 'sprawdź u źródła';
        venue.Opis = toOptionalString(rawVenue.Opis);
      } else {
        venue.Cyklicznie = {};

        for (const [day, time] of Object.entries(rawVenue.Cyklicznie)) {
          if (!DAYS.includes(day)) {
            warnings.push(`${name}: pominięto nieznany dzień "${day}".`);
            continue;
          }

          venue.Cyklicznie[day] = toOptionalString(time) ?? '';
        }
      }
    } else {
      venue.Występowanie = toOptionalString(rawVenue.Występowanie) ?? 'sprawdź u źródła';
      venue.Opis = toOptionalString(rawVenue.Opis);
    }

    sanitized[name] = venue;
  }

  return { data: sanitized, warnings };
}

function sortVenues(data) {
  return Object.entries(data).sort(([nameA, venueA], [nameB, venueB]) => {
    const cityA = String(venueA.Miasto);
    const cityB = String(venueB.Miasto);

    if (cityA < cityB) {
      return -1;
    }

    if (cityA > cityB) {
      return 1;
    }

    if (nameA < nameB) {
      return -1;
    }

    if (nameA > nameB) {
      return 1;
    }

    return 0;
  });
}

function renderWarnings(warnings) {
  if (!warningsContainer) {
    return;
  }

  warningsContainer.replaceChildren();

  if (warnings.length === 0) {
    warningsContainer.classList.add('d-none');
    return;
  }

  const title = document.createElement('strong');
  title.textContent = 'Problemy w data.yml:';
  warningsContainer.appendChild(title);

  const list = document.createElement('ul');
  list.classList.add('mb-0');

  for (const warning of warnings) {
    const item = document.createElement('li');
    item.textContent = warning;
    list.appendChild(item);
  }

  warningsContainer.appendChild(list);
  warningsContainer.classList.remove('d-none');
}

function renderVenues(data) {
  rows.replaceChildren();

  for (const [name, venue] of sortVenues(data)) {
    const row = document.createElement('tr');

    const cityCell = createCell(venue.Miasto);
    cityCell.setAttribute('scope', 'row');
    row.appendChild(cityCell);
    row.appendChild(createVenueCell(name, venue));
    row.appendChild(createCell(venue.Prowadzący ?? '???'));

    if (venue.Cyklicznie) {
      for (const day of DAYS) {
        row.appendChild(createCell(venue.Cyklicznie[day] ?? '', { align: 'center' }));
      }
    } else {
      row.appendChild(createIrregularCell(venue));
    }

    rows.appendChild(row);
  }
}

function renderError(error) {
  console.error(error);

  const row = document.createElement('tr');
  const cell = createCell('Nie udało się załadować danych karaoke.', {
    colSpan: 10,
    align: 'center',
  });

  cell.classList.add('text-danger');
  row.appendChild(cell);
  rows.replaceChildren(row);
}

function renderUpdated(lastModified) {
  if (!updatedContainer) {
    return;
  }

  const date = lastModified ? new Date(lastModified) : null;

  if (!date || Number.isNaN(date.getTime())) {
    updatedContainer.textContent = '';
    return;
  }

  const formatted = date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  updatedContainer.textContent = `Zaktualizowano: ${formatted}`;
}

async function loadKaraokeData() {
  const response = await fetch('data.yml');

  if (!response.ok) {
    throw new Error(`Could not fetch data.yml: ${response.status} ${response.statusText}`);
  }

  const lastModified = response.headers.get('Last-Modified');
  const yaml = await response.text();
  return { data: jsyaml.load(yaml), lastModified };
}

loadKaraokeData()
  .then(({ data: rawData, lastModified }) => {
    const { data, warnings } = sanitizeData(rawData);

    renderWarnings(warnings);
    renderUpdated(lastModified);
    renderVenues(data);
  })
  .catch(renderError);
