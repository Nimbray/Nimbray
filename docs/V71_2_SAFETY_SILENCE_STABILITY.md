# NimbrayAI V71.2 — Safety, Silence & Stability

V71.2 consolide la V71 avant les grandes évolutions V72. Cette version renforce le cœur conversationnel sans refonte inutile de l’interface.

## Priorités

1. La sécurité passe toujours avant le silence.
2. Le silence persistant devient plus strict.
3. Les réponses répétitives sont réduites.
4. Les micro-dialogues restent naturels.
5. Les scénarios critiques deviennent testables.

## Changements principaux

### Safety Override

Le routeur de sécurité intercepte mieux :

- `je vais mourir`
- `je veux mourir`
- `je vais me tuer`
- `je vais me faire du mal`
- `adieu`
- `dernier message`
- `je vais tuer quelqu’un`
- `je vais faire du mal à quelqu’un`
- variantes courtes comme `jvais mourir` ou `jvais tuer`

Même après `ne réponds plus`, un message de crise doit recevoir une réponse immédiate.

### Silence intelligent V2

- `ne réponds plus` active un silence persistant.
- `bonjour`, `salut`, `coucou` ne réactivent plus l’assistant après ce silence.
- La reprise demande une consigne claire : `tu peux répondre`, `reprends`, `parle`, `on reprend`.
- Les messages dangereux cassent toujours le silence.

### Stop simple vs silence fort

V71.2 distingue :

- stop simple : `arrête`, `stop`, `pause` ;
- silence fort : `ne réponds plus`, `tais-toi`, `ne parle plus`, `laisse-moi tranquille`.

Un stop simple est respecté immédiatement, mais ne bloque pas forcément toute la suite de la conversation.

### Anti-répétition V2

La couche naturelle évite davantage :

- `je reste disponible`
- `comment puis-je t’aider ?`
- `je suis là` répété
- deux confirmations de silence identiques d’affilée

## Fichiers modifiés

- `lib/safety-router.ts`
- `lib/natural-intelligence.ts`
- `app/api/chat/route.ts`
- `package.json`

## Commandes

```powershell
npm install
npm run build
vercel --prod
```

## Suite recommandée

Après validation de V71.2 : **V72 — Memory & Project Intelligence**.
