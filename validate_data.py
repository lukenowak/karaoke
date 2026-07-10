#!/usr/bin/env python3
"""Validate data.yml for the browser-rendered karaoke table."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

import yaml


DAYS = ("Pn", "Wt", "Śr", "Czw", "Pt", "Sb", "Nd")


def is_mapping(value: Any) -> bool:
    return isinstance(value, dict)


def validate(data: Any) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    if not is_mapping(data):
        return ['data.yml must contain a mapping of venue names to venue data.'], warnings

    for name, venue in data.items():
        label = str(name)

        if not is_mapping(venue):
            errors.append(f'{label}: venue data must be a mapping.')
            continue

        city = venue.get('Miasto')
        url = venue.get('url')

        if not isinstance(city, str) or not city.strip():
            errors.append(f'{label}: missing or empty required field "Miasto".')

        if not isinstance(url, str) or not url.strip():
            errors.append(f'{label}: missing or empty required field "url".')

        has_recurring = 'Cyklicznie' in venue

        if has_recurring:
            recurring = venue['Cyklicznie']

            if not is_mapping(recurring):
                errors.append(f'{label}: "Cyklicznie" must be a mapping.')
            else:
                unknown_days = sorted(str(day) for day in recurring if day not in DAYS)

                for day in unknown_days:
                    warnings.append(f'{label}: unknown day "{day}" will be ignored by the page.')

                if not any(day in recurring for day in DAYS):
                    warnings.append(f'{label}: "Cyklicznie" contains no recognized days.')
        else:
            occurrence = venue.get('Występowanie')

            if occurrence is not None and not isinstance(occurrence, str):
                warnings.append(f'{label}: "Występowanie" should be text.')

            if occurrence is None or not str(occurrence).strip():
                warnings.append(f'{label}: missing "Występowanie"; the page will use a fallback.')

        presenter = venue.get('Prowadzący')

        if presenter is not None and not isinstance(presenter, str):
            warnings.append(f'{label}: "Prowadzący" should be text.')

        description = venue.get('Opis')

        if description is not None and not isinstance(description, str):
            warnings.append(f'{label}: "Opis" should be text.')

    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description='Validate karaoke data.yml.')
    parser.add_argument('path', nargs='?', default='data.yml', help='YAML file to validate.')
    args = parser.parse_args()

    path = Path(args.path)

    try:
        with path.open(encoding='utf-8') as fh:
            data = yaml.safe_load(fh)
    except FileNotFoundError:
        print(f'ERROR: {path} does not exist.', file=sys.stderr)
        return 1
    except yaml.YAMLError as exc:
        print(f'ERROR: {path} is not valid YAML: {exc}', file=sys.stderr)
        return 1

    errors, warnings = validate(data)

    for warning in warnings:
        print(f'WARNING: {warning}', file=sys.stderr)

    for error in errors:
        print(f'ERROR: {error}', file=sys.stderr)

    if errors:
        return 1

    print(f'OK: {path} is valid ({len(data)} venues).')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
