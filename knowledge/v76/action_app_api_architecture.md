# V76 — Actions, Apps and API Architecture

Les actions/API doivent être traitées comme des capacités réelles, pas comme des promesses.

Règles :
- ne jamais dire qu'une action externe a été réalisée sans appel réel ;
- ne jamais inventer un fichier, un rendez-vous, un paiement, un message envoyé ou un lien ;
- afficher clairement quand une action est seulement proposée ;
- demander confirmation avant action sensible ;
- prévoir une politique de confidentialité pour toute intégration publique ;
- garder les secrets dans les variables d'environnement, jamais dans le code.
