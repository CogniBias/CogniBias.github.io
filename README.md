# CogniBias

101 cognitive biases, organised by psychological process — bilingual French / English.
101 biais cognitifs classés par processus psychologique — site bilingue français / anglais.

## Structure

```
index.html                page unique
assets/style.css          styles (thèmes clair et sombre automatiques)
assets/app.js             interface : filtres, recherche, biais au hasard, fiches, bascule FR/EN
assets/logo.jpg           logo
assets/favicon.png        icône d'onglet
data/data.js              données lues par la page (fonctionne aussi en local / sur clé USB)
data/biases.json          mêmes données, pour réutilisation (PsyCodex, flashcards…)
tools/Biais101.xlsx       classeur source (onglets Biais, Biases (EN), Processus, Codex Benson)
tools/excel_to_json.py    régénère data/ à partir du classeur
```

## Langue

- Au premier chargement : français si la langue principale du navigateur est le français, anglais sinon.
- Le bouton FR / EN reste visible en haut à droite ; le choix est mémorisé dans le navigateur.
- Chaque fiche a une adresse partageable : `#fr-B027`, `#en-B027`. L'adresse impose la langue.

## Mettre à jour le contenu

1. Modifier `tools/Biais101.xlsx` (les onglets « Biais » et « Biases (EN) » sont reliés par la colonne ID).
   Ne pas renommer les onglets ni les en-têtes de colonnes : le script s'appuie dessus.
2. Depuis la racine du dépôt : `python3 tools/excel_to_json.py tools/Biais101.xlsx`
   (dépendance : `pip install openpyxl`)
3. Commit + push : GitHub Pages republie le site.

Le script refuse de générer les données si une fiche n'existe que dans une langue ou si un « biais voisin » pointe vers un ID inexistant.

## Publication sur GitHub Pages

Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`.
