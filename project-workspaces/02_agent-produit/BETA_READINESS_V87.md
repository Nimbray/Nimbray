# Beta Readiness Produit — V87

- Date : 2026-04-27
- Agent : Produit
- Branche de travail : `agent/product/v87-beta-readiness`
- Base officielle : GitHub `main` selon `CURRENT_SOURCE.json` et protocole V84
- Statut : prêt pour Pull Request Produit vers `main`

## Objectif V87

La V87 doit transformer NimbrayAI en première bêta utilisable par des testeurs encadrés. La priorité n’est pas d’ajouter toutes les ambitions IA, mais de rendre les parcours essentiels compréhensibles, stables, testables et honnêtes.

Une bêta V87 est considérée utilisable si un testeur peut :

1. ouvrir NimbrayAI sans friction majeure ;
2. envoyer un message et recevoir une réponse utile ;
3. joindre une image ou un fichier supporté avec un état clair ;
4. comprendre ce que l’IA peut et ne peut pas faire ;
5. utiliser le chat sur mobile ;
6. signaler un problème ou donner un retour ;
7. retrouver une documentation simple de déploiement et de rollback côté équipe.

## Définition de “première bêta utilisable”

### Inclus

- Chat stable pour les demandes courantes.
- Upload image/fichier avec preview ou état prêt avant envoi.
- Messages d’erreur compréhensibles côté utilisateur.
- Réponses Nimbray plus naturelles, moins répétitives, sans promesse exagérée.
- Expérience mobile propre sur les parcours chat et upload.
- Déploiement Vercel reproductible avec variables d’environnement documentées.
- Checklist de test manuel avant ouverture à un petit groupe.

### Non inclus

- Mémoire cloud complète.
- RAG avancé multi-documents persistant.
- Actions autonomes réelles sur services externes.
- Vision universelle sur tous les formats.
- Ouverture publique large sans contrôle.

## Priorisation des fonctionnalités restantes

### P0 — Bloquant avant testeurs

| Sujet | Attendu produit | Propriétaire principal |
| --- | --- | --- |
| Chat de base | Le message part, la réponse arrive, les erreurs ne bloquent pas définitivement l’interface | Frontend / Backend / IA |
| Upload message + pièce jointe | Le fichier sélectionné est visible avant envoi, transmis à l’API ou refusé proprement | Frontend / Backend |
| Erreurs utilisateur | Les erreurs taille, type, réseau, provider IA et parsing sont distinctes et actionnables | Backend / Frontend |
| Mobile chat | Saisie, scroll, boutons, preview et envoi restent utilisables sur écran mobile | Frontend |
| Honnêteté IA | Nimbray ne prétend pas lire un fichier ou accéder au web si ce n’est pas réellement disponible | IA |
| Déploiement Vercel | Build et variables minimales documentés, rollback possible | Backend / Validation |
| Feedback testeur | Moyen simple de collecter un retour ou de noter un bug | Produit / Frontend |

### P1 — Important pendant bêta privée

| Sujet | Attendu produit | Propriétaire principal |
| --- | --- | --- |
| Sources temporaires | Clarifier si un fichier sert uniquement au message courant | Produit / IA / Backend |
| Onboarding court | Expliquer en une minute quoi essayer et quelles limites existent | Produit / Frontend |
| Tests conversationnels | Jeux de prompts pour naturel, solitude, silence, technique, projet | IA / Validation |
| Observabilité légère | Identifier succès message, succès upload, erreurs API sans exposer de secrets | Backend |
| Handoff agent standardisé | Chaque agent livre objectif, fichiers, risques, tests, statut | Tous agents |

### P2 — Après stabilisation V87

| Sujet | Attendu produit | Version cible |
| --- | --- | --- |
| Mémoire projet persistante | Sources et préférences réutilisables dans un projet | V88-V89 |
| RAG avancé | Recherche multi-documents avec citations internes | V89-V90 |
| Vision enrichie | Analyse image fiable selon provider réellement connecté | V89-V90 |
| Comptes et espaces | Parcours utilisateur plus complet si Supabase est validé | V90+ |
| Marketplace de capacités | À repousser après validation usage réel | Post V90 |

## Critères d’acceptation V87

### Chat

- Un message texte simple peut être envoyé depuis desktop et mobile.
- L’interface affiche un état d’envoi puis une réponse ou une erreur claire.
- Un échec provider IA ne laisse pas l’utilisateur sans explication.
- Les réponses ne répètent pas systématiquement les mêmes phrases d’accueil ou de clôture.
- Les demandes projet peuvent recevoir une réponse structurée avec plan, priorités et prochaine action.

### Upload

- Un fichier sélectionné apparaît avant envoi avec nom, type et état “prêt”.
- L’utilisateur peut retirer le fichier avant envoi.
- Pendant l’envoi, l’état “en cours” est visible.
- En cas d’échec, l’interface distingue au minimum : fichier trop lourd, type non supporté, erreur réseau/API, lecture impossible.
- Le message final indique honnêtement si le fichier a été utilisé, ignoré ou refusé.

### IA

- Nimbray répond avec un ton naturel, direct et utile.
- Nimbray adapte sa réponse au contexte : aide rapide, technique, émotionnel, produit ou projet.
- Nimbray ne prétend pas posséder “tout Internet” en mémoire ; la promesse est formulée autour de sources, outils, documents et recherche quand ils sont réellement branchés.
- Sur document illisible ou capacité absente, Nimbray explique la limite sans inventer.
- Les réponses sensibles restent prudentes, respectueuses et non diagnostiques.

### Mobile

- Le champ de saisie reste visible et utilisable avec le clavier ouvert.
- Le bouton d’envoi ne masque pas l’upload.
- La preview d’une pièce jointe ne casse pas le scroll.
- Les états erreur/prêt/envoi sont lisibles sur petit écran.
- Le parcours complet “ouvrir → écrire → joindre → envoyer → lire” fonctionne sur mobile.

### Déploiement

- `npm run source:check` passe.
- `npm run agent:merge-check` passe.
- Le build GitHub Actions reste non cassé par les documents Produit.
- Les variables nécessaires sont listées dans les docs existantes ou dans le handoff technique concerné.
- Un rollback vers la dernière version stable reste possible via GitHub/Vercel.

## Roadmap courte V87 à V90

### V87 — Bêta privée utilisable

- Stabiliser chat, upload, mobile, erreurs et honnêteté IA.
- Ouvrir à un petit groupe de testeurs internes/amis.
- Collecter bugs, incompréhensions et irritants majeurs.
- Garder la bêta contrôlée : pas de promesse publique large.

### V88 — Qualité conversationnelle et onboarding

- Améliorer les styles de réponse Nimbray : naturel, émotionnel, technique, projet.
- Ajouter onboarding court : exemples d’usage, limites et premiers essais.
- Créer une checklist conversationnelle récurrente.
- Réduire les répétitions et les réponses trop robotiques.

### V89 — Sources projet et observabilité bêta

- Clarifier sources temporaires vs persistantes.
- Ajouter métriques minimales de succès/échec chat et upload.
- Documenter les problèmes fréquents et décisions produit.
- Préparer une bêta plus large si les P0 V87 restent stables.

### V90 — Consolidation plateforme

- Auditer tous les parcours critiques : chat, upload, mobile, IA, sources, déploiement.
- Nettoyer ou archiver les docs contradictoires.
- Décider ce qui est officiel, expérimental ou repoussé.
- Préparer la trajectoire post-V90 : mémoire cloud, RAG avancé, vision, actions.

## Risques avant ouverture à des testeurs

| Risque | Impact | Niveau | Mitigation |
| --- | --- | --- | --- |
| Upload visible côté UI mais non exploité côté API | Forte perte de confiance | Élevé | Tester le parcours de bout en bout avec fichier réel et message associé |
| Promesse IA trop ambitieuse | Déception rapide | Élevé | Afficher capacités réelles et limites dans onboarding et réponses IA |
| Mobile fragile | Abandon des testeurs | Élevé | Tester iPhone/Android ou au minimum responsive browser avant invitation |
| Erreurs backend génériques | Support difficile | Moyen | Normaliser les messages d’erreur utilisateur et les logs internes |
| Déploiement Vercel non reproductible | Bêta instable | Moyen | Vérifier variables, build, rollback et documentation |
| Trop de fonctionnalités P1/P2 avant P0 | Retard et dette produit | Moyen | Geler le périmètre bêta privée jusqu’à validation P0 |
| Absence de boucle feedback | Impossible d’apprendre de la bêta | Moyen | Ajouter un canal feedback simple dès V87 |

## Go / No-Go bêta V87

### Go si

- Tous les P0 sont validés manuellement au moins une fois.
- Les checks CI/source passent.
- Les limites upload/IA sont visibles.
- L’équipe sait collecter et trier les retours.
- Le rollback est clair.

### No-Go si

- Un message avec pièce jointe peut disparaître sans erreur.
- Le chat reste bloqué après une erreur.
- Le mobile empêche d’envoyer un message.
- Nimbray affirme une capacité non branchée.
- Le déploiement ne peut pas être reproduit.

## Recommandation Produit

La V87 doit rester une bêta privée de fiabilité. Le bon objectif n’est pas “montrer que Nimbray sait tout faire”, mais “faire confiance à Nimbray sur quelques parcours essentiels”. Une fois ces parcours stables, V88-V90 peuvent augmenter l’ambition sans casser la base.
