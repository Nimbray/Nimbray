export type TruthfulnessReply = {
  intent: string;
  content: string;
  confidence: "medium" | "high";
};

type ChatMessage = { role: string; content: string };

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9\s\.\-:\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(q: string, terms: string[]) {
  return terms.some((term) => q.includes(normalize(term)));
}

function recentContext(messages: ChatMessage[], count = 8) {
  return messages.slice(-count).map((m) => normalize(m.content || "")).join(" | ");
}

function isEmergencyNumberQuestion(q: string) {
  const asksNumbers = includesAny(q, [
    "numero d urgence", "numeros d urgence", "numéro d urgence", "numéros d urgence",
    "numero appel urgence", "appel d urgence", "appeler en urgence", "qui appeler", "j appelle qui",
    "urgence qui appeler", "danger qui appeler", "malentendant", "sourd", "sourde", "sms urgence", "tchat urgence"
  ]);
  const hasEmergencyContext = includesAny(q, ["urgence", "danger", "secours", "police", "samu", "pompiers", "malentendant", "sourd", "sourde"]);
  return asksNumbers || (hasEmergencyContext && includesAny(q, ["numero", "numéros", "numeros", "appeler", "appel", "sms", "tchat", "qui"]));
}

function emergencyNumbersReply(text: string): string {
  const q = normalize(text);
  const accessibility = includesAny(q, ["malentendant", "sourd", "sourde", "aphasique", "entendre", "parler", "sms", "tchat"]);

  if (accessibility) {
    return `Oui. Si tu es malentendant, sourd, sourdaveugle, aphasique ou si tu ne peux pas parler au téléphone, le numéro prioritaire en France est **114**.

Tu peux contacter le **114** par **SMS**, **tchat**, **visio** ou **fax**, 24h/24 et 7j/7. Le 114 transmet ensuite l’alerte au bon service : SAMU, police/gendarmerie ou pompiers.

À retenir :

- **114** : urgence accessible par SMS/tchat/visio/fax pour personnes sourdes, malentendantes, sourdaveugles, aphasiques ou ne pouvant pas téléphoner.
- **112** : urgence européenne, danger immédiat.
- **15** : SAMU, urgence médicale.
- **17** : police/gendarmerie.
- **18** : pompiers.

Si tu es en danger maintenant et que tu ne peux pas parler : envoie un SMS au **114** avec ton adresse, ce qui se passe, et si possible ton nom.`;
  }

  return `Oui — pour la France, les principaux numéros d’urgence à connaître sont :

- **112** : urgence européenne, danger immédiat.
- **15** : SAMU, urgence médicale.
- **17** : police / gendarmerie.
- **18** : pompiers.
- **114** : urgence par SMS/tchat/visio/fax pour personnes sourdes, malentendantes, aphasiques ou ne pouvant pas téléphoner.
- **3114** : prévention du suicide, gratuit, 24h/24 et 7j/7.
- **119** : enfance en danger.
- **115** : Samu social / hébergement d’urgence.
- **196** : secours en mer.
- **191** : urgence aéronautique.

Si le danger est immédiat : **112**. Si tu ne peux pas parler ou entendre : **114**.`;
}

function asksForGeneratedDownloadLink(q: string) {
  return includesAny(q, [
    "cree moi un lien", "crée moi un lien", "creer un lien", "créer un lien", "genere un lien", "génère un lien",
    "lien mp4", "fichier mp4", "video mp4", "vidéo mp4", "lien de telechargement", "lien téléchargement",
    "telecharger la video", "télécharger la vidéo", "fais moi un mp4", "cree une video", "crée une vidéo"
  ]);
}

function mentionsCyberCleanup(q: string) {
  return includesAny(q, ["cheval de troie", "trojan", "virus", "malware", "powershell", "supprimer un virus", "retirer un virus"]);
}

function truthfulMediaReply(text: string): string {
  const q = normalize(text);
  const cyber = mentionsCyberCleanup(q);

  if (cyber) {
    return `Je ne peux pas inventer un lien MP4 ni prétendre qu’un fichier vidéo existe si je ne l’ai pas réellement généré ou hébergé.

Par contre, je peux te préparer le contenu proprement. Pour une vidéo sur la suppression d’un cheval de Troie, je peux faire :

1. un script vidéo complet ;
2. un plan en chapitres ;
3. une voix-off ;
4. une checklist de sécurité ;
5. une version PowerShell prudente, sans commandes dangereuses.

Base sûre à expliquer dans la vidéo :

- déconnecter l’ordinateur d’Internet ;
- lancer Microsoft Defender ou un antivirus fiable ;
- faire une analyse complète puis une analyse hors ligne ;
- vérifier les programmes au démarrage ;
- supprimer uniquement ce qui est confirmé comme malveillant ;
- mettre Windows et les logiciels à jour ;
- changer les mots de passe depuis un appareil sain si des comptes sensibles ont été touchés.

Je peux te rédiger directement le script MP4, mais je ne dois pas fabriquer un faux lien de téléchargement.`;
  }

  return `Je ne peux pas inventer un lien de téléchargement ni prétendre avoir créé un fichier MP4 si le fichier n’existe pas réellement.

Ce que je peux faire à la place :

1. écrire le script complet de la vidéo ;
2. créer un storyboard ;
3. préparer le texte de voix-off ;
4. te donner les étapes pour générer le MP4 avec un outil vidéo ;
5. préparer une page ou un bouton qui pointera vers un vrai fichier une fois hébergé.

La règle est simple : pas de faux lien, pas de fausse ressource. On crée d’abord le contenu réel, puis on génère ou héberge le fichier.`;
}

export function truthfulnessEmergencyReply(text: string, messages: ChatMessage[] = []): TruthfulnessReply | null {
  const q = normalize(text);
  const context = recentContext(messages);

  if (isEmergencyNumberQuestion(q)) {
    return { intent: "v75-1-emergency-numbers-local-knowledge", confidence: "high", content: emergencyNumbersReply(text) };
  }

  if (asksForGeneratedDownloadLink(q)) {
    return { intent: "v75-1-no-fake-download-link", confidence: "high", content: truthfulMediaReply(text) };
  }

  if (includesAny(context, ["je vais mourir", "je vais tuer", "me faire du mal", "adieu", "danger", "urgence"]) && includesAny(q, ["numero", "numéros", "numeros", "qui appeler", "appel", "appeler", "malentendant", "sms"])) {
    return { intent: "v75-1-contextual-emergency-numbers", confidence: "high", content: emergencyNumbersReply(text) };
  }

  return null;
}

export function truthfulnessQualityGate(content: string, latestUser: string, messages: ChatMessage[] = []): string {
  const text = String(content || "").trim();
  const q = normalize(latestUser);

  if (!text) {
    const local = truthfulnessEmergencyReply(latestUser, messages);
    if (local) return local.content;
    return "Je n’ai pas réussi à générer une réponse correcte cette fois. Reformule en une phrase, et je reprends proprement.";
  }

  const generatedFakeMediaLink = /(https?:\/\/[^\s)]+\.(?:mp4|mov|avi|zip|pdf)|nimbrayai\.com\/[^\s)]+)/i.test(text);
  const nakedMarkdownLink = /\[[^\]]{2,80}\]\(https?:\/\/[^)]+\)/i.test(text);
  if (asksForGeneratedDownloadLink(q) && (generatedFakeMediaLink || nakedMarkdownLink)) {
    return truthfulMediaReply(latestUser);
  }

  return text;
}

export function truthfulnessEmergencyGuidance() {
  return `V75.1 Truthfulness & Emergency Fix :
- Ne jamais inventer de lien, fichier, vidéo, MP4, PDF, ZIP ou ressource hébergée.
- Si un utilisateur demande un lien vers un fichier que NimbrayAI n’a pas réellement créé, expliquer clairement la limite et proposer script, storyboard ou étapes de création.
- Les questions sur les numéros d’urgence doivent recevoir une réponse locale, non vide, claire et actionnable.
- En France : 112 urgence européenne, 15 SAMU, 17 police/gendarmerie, 18 pompiers, 114 SMS/tchat/visio/fax pour personnes sourdes, malentendantes, aphasiques ou ne pouvant pas téléphoner, 3114 prévention suicide.
- Toute réponse vide doit être remplacée par une réponse utile de secours.`;
}
