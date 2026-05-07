print("start")
import sys
sys.stdout.reconfigure(encoding="utf-8")
print("encoding ok")

from resolveur_integrales import resoudre_integrale
print("import ok")

try:
    reponse, demarche = resoudre_integrale(r"\int_{1}^{2} \frac{2x}{x^{2} + 1} dx")
    print(demarche)
    print("Réponse :", reponse)
except Exception as e:
    print(f"Erreur : {type(e).__name__}: {e}")