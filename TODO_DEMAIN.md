# 📋 TODO - À faire demain

## 🔴 Priorité haute

### 1. **Finaliser les campagnes WhatsApp**
- L'utilisateur a mentionné : "il y a déjà un sous onglet campagne dans l'onglet what app"
- Vérifier et compléter la fonctionnalité existante des campagnes WhatsApp
- Ajouter la possibilité d'envoyer des campagnes groupées via WhatsApp
- Implémenter les templates de messages pour les campagnes

### 2. **Test des campagnes email**
- Finaliser la modal de test pour les campagnes email
- Permettre d'envoyer un email de test avant l'envoi aux clients
- Ajouter la prévisualisation du rendu email

### 3. **Statistiques détaillées des campagnes**
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
