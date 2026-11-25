# Rabbit's Apps

Toutes mes petites applis, publiées avec GitHub Pages : https://rabbith00d.github.io/RabbitH00d-apps/

Chaque appli vit dans son dossier, avec son propre `manifest.webmanifest` et ses icônes : sur Android, chacune s'installe séparément depuis Chrome.

| Dossier | Appli | Données |
|---|---|---|
| `projets/` | Mes projets : suivi de projets, priorités, rappels | Supabase (projet `apps`, table `projets`, accès limité au compte connecté) |
| `pense-bete/` | Pense-bête : capture rapide de choses à faire (`!` urgent, `#étiquette`, dictée) | Supabase (projet `apps`, table `pense_bete`, accès limité au compte connecté) |
| `decouverte-maker/` | Découverte maker : une découverte par jour | `decouverte-maker/decouvertes.json`, complété chaque matin par une tâche programmée |

Style des icônes : carré de couleur pleine, pictogramme blanc simple, une couleur par appli.

`.github/workflows/garde-eveil.yml` appelle la base Supabase chaque jour pour éviter sa mise en pause (offre gratuite).
