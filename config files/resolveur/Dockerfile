FROM python:3.11-slim

WORKDIR /app

# Dépendances système pour sympy et antlr (requis par parse_latex)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Dépendances Python
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    sympy \
    antlr4-python3-runtime==4.11.0

# Copie des fichiers de l'app
COPY resolveur_integrales.py .
COPY api.py .

EXPOSE 8100

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8100"]
