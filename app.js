const DAYS = ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Nd'];

const rows = document.querySelector('#karaoke-rows');

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

  if (venue.Opis) {
    cell.appendChild(document.createElement('br'));
    appendText(cell, venue.Opis);
  }

  return cell;
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

async function loadKaraokeData() {
  const response = await fetch('data.yml');

  if (!response.ok) {
    throw new Error(`Could not fetch data.yml: ${response.status} ${response.statusText}`);
  }

  const yaml = await response.text();
  return jsyaml.load(yaml);
}

loadKaraokeData()
  .then(renderVenues)
  .catch(renderError);
