# HeidiSQL for Raycast

Search and open your HeidiSQL saved database connections directly from Raycast.

## Features

- **Search & filter** connections by name, host, user, or database type
- **Open in HeidiSQL** — launch directly into the selected session
- **Copy** host, password, or session name to clipboard
- **Grouped by folder** — sessions are organized just like in HeidiSQL's session manager
- Supports MySQL, PostgreSQL, MSSQL, SQLite, Firebird, ProxySQL

## Prerequisites

- [HeidiSQL](https://www.heidisql.com/) installed on Windows
- [Raycast for Windows](https://raycast.com/)

## How It Works

The extension reads saved sessions from the Windows Registry at:

```
HKCU\SOFTWARE\HeidiSQL\Servers\
```

Each session's connection details (host, port, user, database type, etc.) are parsed and displayed in a searchable Raycast list. Selecting a session launches HeidiSQL with the appropriate command-line arguments.

If `heidisql.exe` isn't found automatically in Program Files, set its location in the extension preferences.

## Development

```bash
git clone https://github.com/hjord/raycast-heidisql.git
cd raycast-heidisql
npm install
npm run dev
```

Other scripts:

- `npm run build` — build the extension
- `npm run lint` — run ESLint + Prettier
- `npm run fix-lint` — auto-fix lint issues

## License

[MIT](LICENSE)
