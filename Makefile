.PHONY: install migrate dev build start

PYTHON = backend/.venv/Scripts/python.exe
PIP    = backend/.venv/Scripts/pip.exe
ALEMBIC= backend/.venv/Scripts/alembic.exe
UVICORN= backend/.venv/Scripts/uvicorn.exe

install:
	cd backend && C:/Users/edvar/.local/bin/python3.14.exe -m venv .venv
	$(PIP) install -r backend/requirements.txt
	cd frontend && npm install

migrate:
	cd backend && $(ALEMBIC) upgrade head

dev:
	@echo "Start backend:  cd backend && $(UVICORN) main:app --reload --port 8000"
	@echo "Start frontend: cd frontend && npm run dev"

build:
	cd frontend && npm run build

start: migrate
	cd backend && $(UVICORN) main:app --host 0.0.0.0 --port 8000
