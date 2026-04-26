# Debugging code et déploiement

Méthode :
1. lire la première vraie erreur ;
2. identifier le fichier et la ligne ;
3. corriger la cause minimale ;
4. relancer le build ;
5. seulement ensuite déployer.

Ne pas recommander npm audit fix --force pour un build cassé sauf justification claire.
