# Déploiement Vercel propre

Un zip de version ne doit pas inclure :
- node_modules/
- .next/
- .vercel/
- .env.local
- .env
- dist/
- build/
- .cache/
- .turbo/

Vercel et npm régénèrent ces éléments.
