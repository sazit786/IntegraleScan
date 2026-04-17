#!/usr/bin/env python3
"""
Serveur API pour le résolveur d'intégrales.
Expose une route POST /resoudre qui reçoit une intégrale en LaTeX
et retourne la réponse et la démarche en JSON.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from resolveur_integrales import resoudre_integrale

app = FastAPI(title="Résolveur d'intégrales", version="1.0.0")


# --- MODÈLE DE REQUÊTE ---
class RequeteIntegrale(BaseModel):
    latex: str  # ex: r"\int x^2 \, dx"


# --- MODÈLE DE RÉPONSE ---
class ReponseIntegrale(BaseModel):
    reponse: str    # ex: "$\frac{x^3}{3} + C$"
    demarche: str   # Démarche complète étape par étape


# --- ROUTE PRINCIPALE ---
@app.post("/resoudre", response_model=ReponseIntegrale)
def resoudre(requete: RequeteIntegrale):
    try:
        reponse, demarche = resoudre_integrale(requete.latex)
        return ReponseIntegrale(reponse=reponse, demarche=demarche)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne : {str(e)}")


# --- ROUTE DE SANTÉ (pour vérifier que le serveur tourne) ---
@app.get("/health")
def health():
    return {"statut": "ok"}
