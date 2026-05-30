# Hermans Turnering

Nettside for å holde oversikt over resultater, ledertavler, statistikk og bilder fra turneringen.

## Krav

- Python 3.12 eller nyere
- Node.js 20 eller nyere
- npm

## Komme i gang

### 1. Sett opp miljøvariabler

```bash
cp backend/.env.example backend/.env
```

Åpne `backend/.env` og fyll inn:

| Variabel | Beskrivelse |
|---|---|
| `ADMIN_TOKEN` | Bootstrap-token for å opprette første admin-bruker |
| `JWT_SECRET` | Lang, tilfeldig hemmelig streng (hold hemmelig!) |
| `SMTP_HOST` | SMTP-server for utsending av passord (f.eks. `smtp.gmail.com`) |
| `SMTP_PORT` | Vanligvis `587` |
| `SMTP_USER` | Din e-postadresse |
| `SMTP_PASS` | App-passord fra e-postleverandøren |
| `SMTP_FROM` | Avsender-navn og adresse |

> **Tips:** Uten SMTP-konfigurasjon logges midlertidige passord til konsollet istedenfor å sendes på e-post — nyttig under utvikling.

### 2. Installer avhengigheter

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt  # Windows
# eller: .venv/bin/pip install -r requirements.txt  # Linux/Mac

cd ../frontend
npm install
```

### 3. Kjør migrasjoner

```bash
cd backend
.venv/Scripts/alembic upgrade head
```

### 4. Start i utviklingsmodus

Start to terminaler:

**Terminal 1 — backend:**
```bash
cd backend
.venv/Scripts/uvicorn main:app --reload --port 8000
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```

Åpne [http://localhost:5173](http://localhost:5173).

### 5. Opprette første admin-bruker

Bruk `ADMIN_TOKEN` fra `.env`-filen (standard under utvikling: `dev-admin-token`):

```bash
curl -X POST http://localhost:8000/api/v1/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-admin-token" \
  -d '{"username":"admin","email":"din@epost.no","role":"admin"}'
```

Det midlertidige passordet logges til konsollet (eller sendes på e-post hvis SMTP er konfigurert).

Logg deretter inn på [http://localhost:5173/logg-inn](http://localhost:5173/logg-inn).

## Produksjon (én prosess)

```bash
cd frontend && npm run build
cd ../backend
.venv/Scripts/uvicorn main:app --host 0.0.0.0 --port 8000
```

FastAPI serverer da både API og det bygde frontende på port 8000.

## API-dokumentasjon

Tilgjengelig på [http://localhost:8000/docs](http://localhost:8000/docs) når backend kjører.

## Mappestruktur

```
hermans_nettside/
  backend/        Python/FastAPI backend
    app/
      models.py   Alle databasemodeller
      schemas.py  Pydantic-skjemaer
      routers/    API-endepunkter
      services/   Forretningslogikk (ledertavle, statistikk)
      data/       SQLite-database (opprettet automatisk)
    uploads/      Opplastede bilder (opprettet automatisk)
  frontend/       React/TypeScript frontend
    src/
      api/        API-hooks (React Query)
      pages/      Sider
      components/ Gjenbrukbare komponenter
```
