# 📋 TODO - À faire demain

## 🔴 Priorité haute

### 1. **URGENT - Corriger l'affichage des conversations dans les fiches clients**
- Problème : "je ne vois pas les conversations email et what app via le crm dans les fiches clients"
- Le bouton "Communications" n'apparaît que pour les rôles CLIENT
- Ajouter l'accès aux communications pour TOUS les clients depuis leur fiche
- Vérifier que les endpoints API fonctionnent correctement
- Tester avec de vraies données

### 2. **Finaliser l'éditeur de texte riche pour les emails**
- L'utilisateur veut : "modification de la taille, style d'écriture"
- L'éditeur existe déjà dans EmailCompleteInterface mais doit être amélioré
- Ajouter une barre d'outils complète avec :
  - Tailles de police (petit, normal, grand, très grand)
  - Styles (gras, italique, souligné, barré)
  - Couleurs de texte (palette de couleurs)
  - Couleurs de fond
  - Alignement (gauche, centre, droite, justifié)
  - Listes (puces, numérotées)
  - Liens hypertexte
  - Insertion d'images
- Prévisualisation en temps réel
- Templates d'emails préformatés

### 3. **Finaliser les campagnes WhatsApp**
- L'utilisateur a mentionné : "il y a déjà un sous onglet campagne dans l'onglet what app"
- Vérifier et compléter la fonctionnalité existante des campagnes WhatsApp
- Ajouter la possibilité d'envoyer des campagnes groupées via WhatsApp
- Implémenter les templates de messages pour les campagnes

### 4. **Test des campagnes email**
- Finaliser la modal de test pour les campagnes email
- Permettre d'envoyer un email de test avant l'envoi aux clients
- Ajouter la prévisualisation du rendu email

### 5. **Corriger l'aperçu des campagnes email**
- Problème : "l'apercu il y a que l'objet dans les campagnes emailing"
- L'aperçu ne montre actuellement que l'objet de l'email
- Ajouter le contenu complet de l'email dans l'aperçu
- Afficher : objet, contenu formaté, pièces jointes
- Modal d'aperçu avec le rendu final de l'email

### 6. **Statistiques détaillées des campagnes**
- L'utilisateur veut : "les statistiques de chaque campagne avec le détail"
- Ajouter un dashboard de statistiques pour chaque campagne
- Taux d'ouverture, clics, conversions
- Graphiques de performance

## 🟡 Priorité moyenne

### 4. **Configuration WhatsApp**
- Ajouter une interface de configuration pour les identifiants Twilio
- Permettre de configurer le numéro WhatsApp Business
- Tester la connexion et afficher le statut

### 5. **Améliorer les automatisations**
- Ajouter plus de types d'automatisations
- Permettre de créer des workflows complexes
- Ajouter des conditions et des délais

### 6. **Optimisations CRM**
- Ajouter la possibilité de taguer les clients
- Segmentation avancée pour les campagnes
- Export des données clients

## 🟢 Améliorations futures

### 7. **Notifications et alertes**
- Notifications en temps réel pour les nouveaux messages
- Alertes pour les automatisations déclenchées
- Rappels pour les suivis clients

### 8. **Rapports et analytics**
- Tableau de bord général avec KPIs
- Rapports périodiques automatiques
- Export PDF des statistiques

### 9. **Intégrations tierces**
- Google Calendar pour les RDV
- Stripe pour les paiements
- Instagram DM (si possible)

## 📝 Notes de l'utilisateur

- **Email de test** : "j'aimerais aussi qu'on créer un test pour la campagne avant d'envoyer au client pour que je puisse tester mon message"
- **WhatsApp existant** : "il y a déjà un sous onglet campagne dans l'onglet what app"
- **Statistiques** : "et les statistiques de chaque campagne avec le détail"
- **CRM connecté** : "j'aimerais aussi que le crm soit relié au mail et what app pour avoir les derniere discussions" ✅ FAIT

## 🔧 Corrections techniques

- Vérifier que le modèle MessageHistory est bien dans le schema.prisma
- Tester la synchronisation email avec de vrais comptes Gandi
- Optimiser les performances de chargement des conversations
- Ajouter la pagination pour les longues listes de messages

## 💡 Idées d'amélioration

- Mode sombre pour l'interface admin
- Application mobile pour gérer les RDV
- Chatbot automatique pour les questions fréquentes
- Système de loyalty cards digitales
