#!/usr/bin/env python3
"""
Résolveur d'intégrales LaTeX avec démarche étape par étape.

Usage:
    réponse, demarche = resoudre_integrale(r"\int x^2 \, dx")
    print(demarche)
    print("Réponse :", réponse)
"""

import re
from sympy import (
    symbols, latex, integrate, simplify, diff, Symbol,
    Rational, oo, pi, E, I
)
from sympy.parsing.latex import parse_latex
from sympy.integrals.manualintegrate import integral_steps

# Extraction de l'intégralle, variable d'intégration, bornes (si définie) à partir du LaTeX.

def _nettoyer_latex(s):
    """Retire les espaces LaTeX (\, \; \quad) et \left/\right autour de l'expression."""
    s = re.sub(r'\\[,;!]', ' ', s)
    s = re.sub(r'\\quad\b', ' ', s)
    s = re.sub(r'\\left', '', s)
    s = re.sub(r'\\right', '', s)
    return s.strip()


def extraire_composantes(latex_str):
    """
    Extrait (integrand, variable, borne_inf, borne_sup) d'une chaîne LaTeX.
    Supporte :
        - \\int f(x) dx
        - \\int f(x) \\, dx
        - \\int_{a}^{b} f(x) dx
        - \\int^{b}_{a} f(x) dx
        - bornes simples sans accolades : \\int_0^1
    """
    s = _nettoyer_latex(latex_str)

    # Normalise les bornes : \int_0^1 → \int_{0}^{1}
    s = re.sub(r'\\int_([^{\\s])(\^)', r'\\int_{\1}\2', s)
    s = re.sub(r'\\int(\^[^{])_', lambda m: m.group(0), s)
    s = re.sub(r'\^([^{])', r'^{\1}', s)

    # Intégrale définie, deux ordres possibles : _{a}^{b} ou ^{b}_{a}
    pat_def_ab = (r'\\int\s*_\{([^}]*)\}\s*\^\{([^}]*)\}'
                  r'\s*(.*?)\s*\\?d\s*([a-zA-Z])\s*$')
    pat_def_ba = (r'\\int\s*\^\{([^}]*)\}\s*_\{([^}]*)\}'
                  r'\s*(.*?)\s*\\?d\s*([a-zA-Z])\s*$')

    m = re.search(pat_def_ab, s, re.DOTALL)
    if m:
        return m.group(3).strip(), m.group(4), m.group(1), m.group(2)

    m = re.search(pat_def_ba, s, re.DOTALL)
    if m:
        return m.group(3).strip(), m.group(4), m.group(2), m.group(1)

    # Intégrale indéfinie
    pat_indef = r'\\int\s*(.*?)\s*\\?d\s*([a-zA-Z])\s*$'
    m = re.search(pat_indef, s, re.DOTALL)
    if m:
        return m.group(1).strip(), m.group(2), None, None

    raise ValueError(
        f"Format d'intégrale non reconnu : « {latex_str} »\n"
        "Exemples valides :\n"
        r"  \int x^2 \, dx" "\n"
        r"  \int_{0}^{1} x^2 \, dx"
    )


def _normaliser_constantes(expr):
    """
    Remplace les symboles génériques que parse_latex crée pour les constantes
    par les vrais objets SymPy :
        Symbol('pi')  → pi
        Symbol('e')   → E  (nombre d'Euler)
        Symbol('i')   → I  (unité imaginaire)
    """
    from sympy import pi as SPI, E as SE, I as SI
    mapping = {Symbol('pi'): SPI, Symbol('e'): SE, Symbol('i'): SI}
    return expr.subs(mapping)


def _parser_expression(expr_latex, var_sym=None):
    """Parse un fragment LaTeX en expression SymPy et normalise les constantes."""
    try:
        expr = parse_latex(expr_latex)
        return _normaliser_constantes(expr)
    except Exception as e:
        raise ValueError(f"Impossible de parser « {expr_latex} » : {e}")


# Faire les étapes d'intégration manuellement à partir de integral_steps de SymPy

def _fmt_regle(step, niveau=0):
    """
    Traduit récursivement un objet Rule de SymPy en liste de lignes texte.
    niveau : profondeur d'indentation.
    """
    ind = "    " * niveau
    nom = type(step).__name__
    var = step.variable
    lignes = []

    # Constante
    if nom == 'ConstantRule':
        c = step.integrand
        lignes.append(f"{ind}• Intégrale d'une constante :")
        lignes.append(f"{ind}    ∫ {latex(c)} d{var} = {latex(c)}·{var}")

    # Constante * autre
    elif nom == 'ConstantTimesRule':
        lignes.append(f"{ind}• Facteur constant : sortir {latex(step.constant)} de l'intégrale")
        lignes.append(f"{ind}    ∫ {latex(step.integrand)} d{var}"
                      f"  =  {latex(step.constant)} · ∫ {latex(step.other)} d{var}")
        lignes += _fmt_regle(step.substep, niveau + 1)

    # Règle de puissance
    elif nom == 'PowerRule':
        exp_val = step.exp
        if exp_val == -1:
            lignes.append(f"{ind}• Règle de puissance (n = -1) → logarithme :")
            lignes.append(f"{ind}    ∫ 1/{var} d{var} = ln|{var}|")
        else:
            lignes.append(f"{ind}• Règle de puissance :")
            lignes.append(f"{ind}    ∫ {var}^{{{latex(exp_val)}}} d{var}"
                          f"  =  {var}^{{{latex(exp_val + 1)}}} / {latex(exp_val + 1)}")

    # Puissance imbriquée
    elif nom == 'NestedPowRule':
        lignes.append(f"{ind}• Puissance composée :")
        lignes.append(f"{ind}    ∫ {latex(step.integrand)} d{var}")

    # Somme / différence
    elif nom == 'AddRule':
        lignes.append(f"{ind}• Linéarité — intégrer terme par terme :")
        for sub in step.substeps:
            lignes += _fmt_regle(sub, niveau + 1)

    # Substitution en u
    elif nom == 'URule':
        u_sym = step.u_var
        u_fn  = step.u_func
        du    = diff(u_fn, var)
        lignes.append(f"{ind}• Substitution u = {latex(u_fn)} :")
        lignes.append(f"{ind}    Pose  u = {latex(u_fn)}")
        lignes.append(f"{ind}    Alors du = {latex(du)} d{var}"
                      f"  →  d{var} = du / ({latex(du)})")
        lignes.append(f"{ind}  Intégrale transformée :")
        lignes += _fmt_regle(step.substep, niveau + 1)

    # Intégration par parties
    elif nom == 'PartsRule':
        u_expr = step.u
        dv_expr = step.dv
        v_expr  = integrate(dv_expr, var)
        du_expr = diff(u_expr, var)
        lignes.append(f"{ind}• Intégration par parties :  ∫ u dv = u·v − ∫ v du")
        lignes.append(f"{ind}    u  = {latex(u_expr)}"
                      f"       →  du = {latex(du_expr)} d{var}")
        lignes.append(f"{ind}    dv = {latex(dv_expr)} d{var}"
                      f"  →  v  = {latex(v_expr)}")
        lignes.append(f"{ind}  ─ Calcul de la primitive de v :")
        lignes += _fmt_regle(step.v_step, niveau + 1)
        lignes.append(f"{ind}  ─ Intégrale restante  ∫ v du :")
        lignes += _fmt_regle(step.second_step, niveau + 1)

    # Intégration par parties cyclique
    elif nom == 'CyclicPartsRule':
        lignes.append(f"{ind}• Intégration par parties cyclique")
        lignes.append(f"{ind}  (l'intégrale réapparaît — on résout l'équation) :")
        for i, part in enumerate(step.parts_rules, 1):
            lignes.append(f"{ind}    Tour {i} : u = {latex(part.u)}, "
                          f"dv = {latex(part.dv)} d{var}")

    # Trigonométrie
    elif nom == 'SinRule':
        lignes.append(f"{ind}• Formule standard : ∫ sin({var}) d{var} = −cos({var})")

    elif nom == 'CosRule':
        lignes.append(f"{ind}• Formule standard : ∫ cos({var}) d{var} = sin({var})")

    elif nom == 'Sec2Rule':
        lignes.append(f"{ind}• Formule standard : ∫ sec²({var}) d{var} = tan({var})")

    elif nom == 'Csc2Rule':
        lignes.append(f"{ind}• Formule standard : ∫ csc²({var}) d{var} = −cot({var})")

    elif nom == 'SecTanRule':
        lignes.append(f"{ind}• Formule standard : ∫ sec·tan d{var} = sec({var})")

    elif nom == 'CscCotRule':
        lignes.append(f"{ind}• Formule standard : ∫ csc·cot d{var} = −csc({var})")

    # Hyperboliques
    elif nom == 'SinhRule':
        lignes.append(f"{ind}• Formule standard : ∫ sinh({var}) d{var} = cosh({var})")

    elif nom == 'CoshRule':
        lignes.append(f"{ind}• Formule standard : ∫ cosh({var}) d{var} = sinh({var})")

    elif nom in ('TrigRule', 'HyperbolicRule'):
        lignes.append(f"{ind}• Formule trigonométrique standard :")
        lignes.append(f"{ind}    ∫ {latex(step.integrand)} d{var}")

    # Exponentielle
    elif nom == 'ExpRule':
        base = step.base
        exp_ = step.exp
        if base == E:
            lignes.append(f"{ind}• Formule exponentielle : ∫ e^{{{latex(exp_)}}} d{var} = e^{{{latex(exp_)}}}")
        else:
            lignes.append(f"{ind}• Formule exponentielle : ∫ {latex(base)}^{{{latex(exp_)}}} d{var}"
                          f" = {latex(base)}^{{{latex(exp_)}}} / ln({latex(base)})")

    # Réciproque / log
    elif nom == 'ReciprocalRule':
        lignes.append(f"{ind}• Règle réciproque : ∫ 1/{latex(step.base)} d{var}"
                      f" = ln|{latex(step.base)}|")

    # Arctan
    elif nom == 'ArctanRule':
        lignes.append(f"{ind}• Formule arctan :")
        lignes.append(f"{ind}    ∫ 1/(a·{var}² + c) d{var}"
                      f" = (1/√(a·c))·arctan({var}·√(a/c))")

    # Arcsin
    elif nom == 'ArcsinRule':
        lignes.append(f"{ind}• Formule arcsin :")
        lignes.append(f"{ind}    ∫ 1/√(1−{var}²) d{var} = arcsin({var})")

    # Arcsinh
    elif nom == 'ArcsinhRule':
        lignes.append(f"{ind}• Formule arcsinh :")
        lignes.append(f"{ind}    ∫ 1/√(1+{var}²) d{var} = arcsinh({var})")

    # Réécriture algébrique
    elif nom == 'RewriteRule':
        lignes.append(f"{ind}• Réécriture de l'expression :")
        lignes.append(f"{ind}    {latex(step.integrand)}  →  {latex(step.rewritten)}")
        lignes += _fmt_regle(step.substep, niveau + 1)

    # Alternatives (prendre la première)
    elif nom == 'AlternativeRule':
        lignes.append(f"{ind}• Méthode choisie parmi les alternatives disponibles :")
        lignes += _fmt_regle(step.alternatives[0], niveau + 1)

    # Morceaux
    elif nom == 'PiecewiseRule':
        lignes.append(f"{ind}• Intégrale définie par morceaux :")
        for sub, cond in step.subfunctions:
            lignes.append(f"{ind}    Si {cond} :")
            lignes += _fmt_regle(sub, niveau + 2)

    # Substitution trigonométrique
    elif nom == 'TrigSubstitutionRule':
        lignes.append(f"{ind}• Substitution trigonométrique :")
        lignes.append(f"{ind}    {var} = {latex(step.func)}")

    # Complétion du carré
    elif nom == 'CompleteSquareRule':
        lignes.append(f"{ind}• Complétion du carré :")
        lignes += _fmt_regle(step.substep, niveau + 1)

    # Fonctions spéciales
    elif nom == 'EiRule':
        lignes.append(f"{ind}• Intégrale exponentielle  Ei(x)")
    elif nom == 'ErfRule':
        lignes.append(f"{ind}• Intégrale de l'erreur  erf(x)")
    elif nom in ('SiRule', 'CiRule', 'ShiRule', 'ChiRule', 'LiRule',
                 'PolylogRule', 'EllipticFRule', 'EllipticERule',
                 'FresnelSRule', 'FresnelCRule', 'UpperGammaRule',
                 'DiracDeltaRule', 'HeavisideRule', 'DerivativeRule'):
        lignes.append(f"{ind}• Formule spéciale — {nom[:-4]} :")
        lignes.append(f"{ind}    ∫ {latex(step.integrand)} d{var}")

    # Polynômes orthogonaux
    elif nom in ('LegendreRule', 'HermiteRule', 'LaguerreRule',
                 'AssocLaguerreRule', 'ChebyshevTRule', 'ChebyshevURule',
                 'GegenbauerRule', 'JacobiRule', 'OrthogonalPolyRule'):
        lignes.append(f"{ind}• Polynôme orthogonal — {nom[:-4]} :")
        lignes.append(f"{ind}    ∫ {latex(step.integrand)} d{var}")

    # Cas inconnu / non décomposable
    elif nom == 'DontKnowRule':
        lignes.append(f"{ind}• (Étape non décomposable manuellement — SymPy utilise des méthodes avancées)")

    else:
        lignes.append(f"{ind}• [{nom}] : ∫ {latex(step.integrand)} d{var}")

    return lignes


# Résoudre une intégrale LaTeX et retourner la réponse avec la démarche étape par étape.

def resoudre_integrale(latex_input: str):
    """
    Résout une intégrale donnée en notation LaTeX.

    Paramètre
    ---------
    latex_input : str
        L'intégrale en LaTeX.
        Exemples :
            r"\\int x^2 \\, dx"
            r"\\int_{0}^{\\pi} \\sin(x) \\, dx"
            r"\\int x e^x \\, dx"

    Retourne
    --------
    réponse : str
        Le résultat final en notation LaTeX (entre $…$).
    demarche : str
        La démarche complète étape par étape.
    """

    # Extraire les composantes
    integrand_latex, var_str, borne_inf_latex, borne_sup_latex = \
        extraire_composantes(latex_input)

    var_sym = Symbol(var_str)

    # Parser l'intégrande
    integrand_sym = _parser_expression(integrand_latex, var_sym)

    # Construire la démarche
    D = []   # lignes de la démarche
    SEP_LARGE = "═" * 64
    SEP_SMALL = "─" * 52

    D.append(SEP_LARGE)
    D.append("  DÉMARCHE DE RÉSOLUTION")
    D.append(SEP_LARGE)
    D.append(f"\n  Intégrale : {latex_input}\n")

    # Intégrale indéfinie
    if borne_inf_latex is None:
        D.append("  Type : Intégrale indéfinie\n")
        D.append(f"  {SEP_SMALL}")
        D.append("  ÉTAPES D'INTÉGRATION")
        D.append(f"  {SEP_SMALL}\n")

        try:
            step_tree = integral_steps(integrand_sym, var_sym)
            D.extend(_fmt_regle(step_tree, niveau=1))
        except Exception as e:
            D.append(f"    (décomposition non disponible : {e})")

        resultat = integrate(integrand_sym, var_sym)
        resultat_s = simplify(resultat)

        D.append(f"\n  {SEP_SMALL}")
        D.append("  RÉSULTAT")
        D.append(f"  {SEP_SMALL}\n")
        D.append(f"  F({var_str}) = {latex(resultat_s)} + C\n")

        réponse = f"${latex(resultat_s)} + C$"

    # Intégrale définie
    else:
        try:
            borne_inf = _parser_expression(borne_inf_latex)
            borne_sup = _parser_expression(borne_sup_latex)
        except Exception:
            from sympy import sympify
            borne_inf = sympify(borne_inf_latex)
            borne_sup = sympify(borne_sup_latex)

        D.append(f"  Type : Intégrale définie"
                 f"  [{borne_inf_latex} → {borne_sup_latex}]\n")

        # Calcul de la primitive
        D.append(f"  {SEP_SMALL}")
        D.append("  ÉTAPE 1 — Calcul de la primitive F(x)")
        D.append(f"  {SEP_SMALL}\n")

        try:
            step_tree = integral_steps(integrand_sym, var_sym)
            D.extend(_fmt_regle(step_tree, niveau=1))
        except Exception as e:
            D.append(f"    (décomposition non disponible : {e})")

        primitive = integrate(integrand_sym, var_sym)
        primitive_s = simplify(primitive)
        D.append(f"\n  Primitive : F({var_str}) = {latex(primitive_s)} + C\n")

        # Théorème fondamental (Barrow)
        D.append(f"  {SEP_SMALL}")
        D.append("  ÉTAPE 2 — Théorème fondamental du calcul (règle de Barrow)")
        D.append(f"  {SEP_SMALL}\n")
        D.append(f"  ∫_{{{borne_inf_latex}}}^{{{borne_sup_latex}}} f({var_str}) d{var_str}"
                 f"  =  F({borne_sup_latex}) − F({borne_inf_latex})\n")

        val_sup = primitive_s.subs(var_sym, borne_sup)
        val_inf = primitive_s.subs(var_sym, borne_inf)
        val_sup_s = simplify(val_sup)
        val_inf_s = simplify(val_inf)

        D.append(f"  F({borne_sup_latex}) = {latex(val_sup_s)}")
        D.append(f"  F({borne_inf_latex}) = {latex(val_inf_s)}\n")
        D.append(f"  F({borne_sup_latex}) − F({borne_inf_latex})"
                 f"  =  {latex(val_sup_s)} − ({latex(val_inf_s)})\n")

        # Résultat final
        resultat = integrate(integrand_sym, (var_sym, borne_inf, borne_sup))
        resultat_s = simplify(resultat)

        D.append(f"  {SEP_SMALL}")
        D.append("  RÉSULTAT")
        D.append(f"  {SEP_SMALL}\n")
        D.append(f"  = {latex(resultat_s)}\n")

        réponse = f"${latex(resultat_s)}$"

    D.append(SEP_LARGE)
    demarche = "\n".join(D)

    return réponse, demarche


# Exemples de démonstration.

if __name__ == "__main__":
    import sys
    # Force UTF-8 output on Windows
    if sys.stdout.encoding != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    exemples = [
        (r"\int x^2 \, dx",                      "Puissance simple"),
        (r"\int_{0}^{1} x^2 \, dx",              "Definie - puissance"),
        (r"\int \sin(x) \, dx",                   "Sinus"),
        (r"\int_{0}^{\pi} \sin(x) \, dx",         "Definie - sinus"),
        (r"\int x e^{x} \, dx",                   "Parties (x * e^x)"),
        (r"\int \frac{1}{x} \, dx",               "Logarithmique"),
        (r"\int \frac{1}{1+x^2} \, dx",           "Arctan"),
        (r"\int x^2 + 3x + 1 \, dx",              "Polynome"),
        (r"\int e^{x^2} \cdot 2x \, dx",          "Substitution u"),
        (r"\int_{0}^{1} e^{x} \, dx",             "Definie - exponentielle"),
        (r"\int \frac{1}{\sqrt{1-x^2}} \, dx",    "Arcsin"),
    ]

    for latex_input, desc in exemples:
        print(f"\n{'#'*68}")
        print(f"# {desc}")
        print(f"{'#'*68}")
        try:
            réponse, demarche = resoudre_integrale(latex_input)
            print(demarche)
            print(f"\n  >>> reponse = \"{réponse}\"")
        except Exception as e:
            print(f"  ERREUR : {e}")
