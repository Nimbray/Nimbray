# Roadmap Produit NimbrayAI — V85 à V90

- Agent responsable : Produit
- Source de départ : V84 — GitHub Agent Automation
- Date : 2026-04-27
- Branche conseillée : `agent/product/v85-roadmap-v85-v90`
- Statut : prêt pour PR produit

## Vision produit

NimbrayAI doit évoluer d’un assistant conversationnel prometteur vers une plateforme IA personnelle claire, fiable et agréable à utiliser. La priorité n’est pas d’ajouter le maximum de promesses, mais de rendre chaque capacité visible, testable et utile : chat naturel, upload robuste, cerveau IA honnête, contexte projet, déploiement stable et expérience mobile premium.

## Principes de priorisation

1. Corriger d’abord les blocages visibles : upload, erreurs, répétitions, états incomplets.
2. Transformer chaque promesse IA en comportement vérifiable.
3. Garder Vercel comme contrainte produit : léger, rapide, sans dépendances lourdes inutiles.
4. Ne jamais annoncer une capacité non disponible sans garde-fou honnête.
5. Livrer par versions courtes, avec critères d’acceptation et validation multi-agents.

## Axes produit V85 à V90

| Axe | Objectif | Agents concernés | Importance |
| --- | --- | --- | --- |
| Upload image/fichier | Sélection, preview, envoi, erreur et lecture côté IA | Frontend, Backend, IA | Critique |
| UX chat | Chat mobile, états visibles, réponses moins robotiques, confiance utilisateur | Frontend, IA, Produit | Critique |
| Cerveau IA | Personnalité Nimbray, contexte projet, orchestration agents, réponses naturelles | IA, Produit | Critique |
| Déploiement | CI GitHub, Vercel, variables, rollback, logs d’erreur | Backend, Frontend | Haut |
| Produit plateforme | Projets, sources, mémoire, packs de connaissances, onboarding | Produit, IA, Backend | Moyen à haut |

## V85 — Stabilisation chat, upload et personnalité

### Objectif

Rendre l’expérience actuelle fiable : l’utilisateur doit pouvoir envoyer un message avec ou sans pièce jointe, comprendre l’état de l’envoi, recevoir une réponse naturelle et ne pas rencontrer de promesse produit mensongère.

### Priorités

- Corriger le parcours upload image/fichier de bout en bout.
- Ajouter ou améliorer la preview avant envoi.
- Afficher clairement : fichier prêt, envoi en cours, succès, erreur.
- Réduire les réponses répétitives, froides ou trop mécaniques.
- Renforcer le contexte projet IA dans le cerveau conversationnel.
- Garder le build Vercel et les checks GitHub au vert.

### Critères d’acceptation

- Un fichier sélectionné apparaît visuellement avant l’envoi avec son nom, son type ou un aperçu adapté.
- Un message avec pièce jointe arrive bien dans la route chat et ne se perd pas silencieusement.
- En cas d’échec upload/API, l’utilisateur voit une erreur claire et actionnable.
- Sur mobile, les boutons d’upload, d’envoi et la zone de saisie restent accessibles.
- Les conversations courtes ne répètent pas la même formule plusieurs fois.
- NimbrayAI dit clairement ce qu’elle peut faire maintenant et ce qui est encore en préparation.
- `npm run source:check` et `npm run agent:merge-check` passent.

### Hors périmètre V85

- Stockage cloud complet des fichiers par projet.
- Vision multimodale avancée sur tous les formats.
- Marketplace publique de compétences IA.

## V86 — Sources, mémoire projet et fiabilité documentaire

### Objectif

Transformer l’upload en vraie base de travail : les documents doivent pouvoir servir de contexte dans la conversation, avec limites honnêtes et comportement stable.

### Priorités

- Définir les formats supportés en V86 : texte, markdown, PDF simple, images selon capacité backend disponible.
- Ajouter une logique produit claire entre pièce jointe temporaire et source projet persistante.
- Créer les premiers écrans ou états pour “sources du projet”.
- Améliorer les réponses IA sur documents : résumé, questions/réponses, limites si le contenu n’est pas lisible.
- Préparer la mémoire projet sans gonfler le ZIP.

### Critères d’acceptation

- L’utilisateur sait si son fichier est utilisé uniquement pour le message actuel ou ajouté à un projet.
- NimbrayAI peut résumer un document texte simple et répondre à une question dessus.
- Si un fichier est illisible, l’interface et l’IA expliquent la limite sans inventer.
- Les erreurs de taille, type ou parsing sont distinguées.
- Une checklist documentaire V86 existe dans le workspace validation.

## V87 — Orchestration agents internes et mode projet

### Objectif

Faire de NimbrayAI un assistant capable d’organiser le travail, pas seulement de répondre : plan, rôles, décisions, suivi et handoff.

### Priorités

- Formaliser les agents internes visibles : Produit, IA, Backend, Frontend, Validation.
- Ajouter un mode “projet” avec objectif, tâches, décisions et prochains pas.
- Permettre à NimbrayAI de proposer une orchestration simple quand la demande est complexe.
- Harmoniser les réponses projet avec le protocole `project-workspaces/`.
- Éviter la sur-complexité : un seul résultat commun avant les détails par agent.

### Critères d’acceptation

- Pour une demande complexe, NimbrayAI propose un plan clair et répartit les responsabilités si utile.
- Les rôles d’agents sont cohérents avec `AGENTS.md`.
- Les handoffs générés sont structurés : objectif, fichiers, changements, risques, tests, statut.
- L’utilisateur peut comprendre où en est le projet sans lire tous les fichiers techniques.

## V88 — Qualité conversationnelle premium

### Objectif

Améliorer fortement le ressenti humain : moins de répétitions, meilleur ton, réponses adaptées à l’émotion et au contexte, sans perdre l’honnêteté.

### Priorités

- Mettre en place une matrice produit de styles : aide rapide, coaching, technique, émotionnel, projet.
- Renforcer les micro-variations pour éviter les boucles de phrases.
- Définir les comportements attendus sur solitude, stress, identité, silence, refus et reprise de conversation.
- Ajouter des tests conversationnels récurrents.
- Garder un style Nimbray : chaleureux, direct, fiable, ambitieux.

### Critères d’acceptation

- Les réponses à “rien”, “arrête”, “merci”, “je me sens seul”, “bonjour” sont variées et adaptées.
- NimbrayAI respecte un silence demandé jusqu’à reprise claire.
- Les sujets sensibles sont traités avec douceur, sans diagnostic ni cliché.
- Les réponses techniques restent structurées, mais moins robotiques.
- Un jeu de tests conversationnels V88 est documenté.

## V89 — Déploiement public contrôlé et onboarding

### Objectif

Préparer NimbrayAI à être testée par de vrais utilisateurs avec un parcours d’entrée simple, des limites visibles et une collecte de retours propre.

### Priorités

- Clarifier l’onboarding : ce que NimbrayAI sait faire, comment utiliser l’upload, comment créer un projet.
- Ajouter une page ou section “capacités et limites”.
- Définir les métriques produit minimales : succès message, succès upload, erreur API, feedback utilisateur.
- Préparer un plan de beta publique léger.
- Renforcer la documentation de déploiement Vercel et rollback.

### Critères d’acceptation

- Un nouvel utilisateur comprend en moins d’une minute quoi essayer.
- Les limites actuelles sont expliquées sans casser l’ambition du produit.
- Les erreurs critiques sont traçables côté produit sans exposer de secrets.
- Une checklist beta publique V89 existe.

## V90 — Plateforme IA personnelle consolidée

### Objectif

Regrouper les acquis V85-V89 dans une version solide : chat, upload, sources, projets, personnalité, agents internes et déploiement forment une base cohérente.

### Priorités

- Audit complet des parcours : premier message, upload, projet, document, erreur, mobile, déploiement.
- Stabiliser la promesse “NimbrayAI, intelligence personnelle et projet”.
- Décider ce qui devient officiel, expérimental ou repoussé.
- Préparer la prochaine grande trajectoire après V90 : mémoire cloud, RAG avancé, vision, actions, comptes utilisateurs.
- Nettoyer la documentation obsolète ou contradictoire.

### Critères d’acceptation

- Tous les parcours critiques V85-V89 ont une checklist validée.
- Les fichiers de référence ne se contredisent pas sur la source active et le protocole agent.
- La documentation utilisateur et agent est assez claire pour continuer sans repartir de zéro.
- Les futures ambitions sont classées par impact, coût, risque et dépendances.

## Décisions produit immédiates pour V85

1. L’upload est prioritaire sur toute nouvelle fonctionnalité visible.
2. Le cerveau IA doit être amélioré dans le réel : naturel, honnêteté, contexte projet, pas slogans.
3. Le mobile est un critère d’acceptation, pas un bonus.
4. La PR V85 doit rester légère : workspace produit + documentation, sans changement risqué dans le runtime si non nécessaire.
5. Les agents Frontend, Backend et IA peuvent travailler en parallèle, mais doivent documenter leurs changements dans leurs workspaces respectifs avant intégration.

## Backlog priorisé

### P0 — À faire avant V85 merge

- Parcours upload message + pièce jointe validé par Frontend/Backend.
- Erreurs utilisateur compréhensibles.
- Handoff de chaque agent à jour.
- Checks source et merge-check OK.

### P1 — À planifier V86-V87

- Sources projet temporaires/persistantes.
- Résumé et Q/R documentaire fiable.
- Mode projet avec orchestration agents.
- Tests conversationnels standards.

### P2 — À planifier V88-V90

- Onboarding public.
- Métriques produit minimales.
- Nettoyage documentation historique.
- Préparation mémoire cloud et RAG avancé.

## Risques produit

| Risque | Impact | Mitigation |
| --- | --- | --- |
| Promettre “tout Internet dans le cerveau” sans capacité réelle | Perte de confiance | Formuler les capacités comme sources, recherche, documents et outils progressifs |
| Upload partiellement corrigé seulement côté UI | Frustration utilisateur | Tester UI + API + message final ensemble |
| Documentation trop dispersée | Agents désynchronisés | Maintenir handoffs courts et changelog agent |
| Ambition IA trop large pour une version | Retards et bugs | Découper V85-V90 en jalons vérifiables |
| Vercel incompatible avec dépendances lourdes | Déploiement cassé | Garder parsing et stockage progressifs, éviter `node_modules` dans ZIP |

## Validation minimale par version

- V85 : upload + chat + personnalité + mobile.
- V86 : documents simples + sources projet.
- V87 : mode projet + agents internes.
- V88 : qualité conversationnelle premium.
- V89 : onboarding + beta publique.
- V90 : consolidation et audit plateforme.
