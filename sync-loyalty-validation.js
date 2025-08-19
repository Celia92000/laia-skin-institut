// 🔄 Synchronisation entre Validation et Fidélité
console.log('🔄 Initialisation synchronisation Validation ↔ Fidélité...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Démarrage synchronisation...');
    
    // 🎆 SYSTÈME DE FIDÉLITÉ COMPLET
    const loyaltySystem = {
        // Initialiser les données de fidélité
        init() {
            if (!localStorage.getItem('loyaltyProgram')) {
                const initialData = {
                    'Marie Dupont': {
                        programType: 'soins', // 'soins' ou 'forfaits'
                        currentProgress: 4,   // séances actuelles
                        targetProgress: 5,    // objectif pour remise
                        discount: 10,         // remise en euros
                        hasAvailableDiscount: false,
                        phone: '06 12 34 56 78',
                        email: 'marie.dupont@email.com',
                        joinDate: '2023-08-15',
                        lastService: '2024-01-05T14:00:00.000Z', // Récent
                        totalSpent: 240
                    },
                    'Sophie Martin': {
                        programType: 'forfaits',
                        currentProgress: 1,
                        targetProgress: 2,
                        discount: 20,
                        hasAvailableDiscount: false,
                        phone: '06 87 65 43 21',
                        email: 'sophie.martin@email.com',
                        joinDate: '2023-06-20',
                        lastService: '2024-01-08T16:30:00.000Z', // Récent
                        totalSpent: 680
                    },
                    'Julie Bernard': {
                        programType: 'soins',
                        currentProgress: 5,
                        targetProgress: 5,
                        discount: 10,
                        hasAvailableDiscount: true, // cycle terminé !
                        phone: '06 55 44 33 22',
                        email: 'julie.bernard@email.com',
                        joinDate: '2023-12-22',
                        lastService: '2024-01-02T18:00:00.000Z', // Récent
                        totalSpent: 95
                    },
                    'Emma Dubois': {
                        programType: 'forfaits',
                        currentProgress: 2,
                        targetProgress: 2,
                        discount: 20,
                        hasAvailableDiscount: true, // cycle terminé !
                        phone: '06 99 88 77 66',
                        email: 'emma.dubois@email.com',
                        joinDate: '2023-03-10',
                        lastService: '2023-05-15T10:00:00.000Z', // Ancien (pour test "expirés")
                        totalSpent: 1240
                    }
                };
                
                localStorage.setItem('loyaltyProgram', JSON.stringify(initialData));
                console.log('✅ Données de fidélité initialisées');
            }
            
            this.updateLoyaltyDisplay();
        },
        
        // Ajouter un point de fidélité quand un soin est validé
        addPoint(clientName, servicePrice = 0) {
            let loyaltyData = JSON.parse(localStorage.getItem('loyaltyProgram')) || {};
            
            // Créer le client s'il n'existe pas
            if (!loyaltyData[clientName]) {
                loyaltyData[clientName] = {
                    programType: 'soins',
                    currentProgress: 0,
                    targetProgress: 5,
                    discount: 10,
                    hasAvailableDiscount: false,
                    phone: '',
                    email: '',
                    joinDate: new Date().toISOString().split('T')[0],
                    totalSpent: 0
                };
            }
            
            const client = loyaltyData[clientName];
            
            // Si le client a une remise disponible, on ne peut plus ajouter de points
            if (client.hasAvailableDiscount) {
                console.log(`⚠️ ${clientName} a déjà une remise disponible - cycle terminé`);
                return client;
            }
            
            // Ajouter +1 au programme en cours
            client.currentProgress += 1;
            client.totalSpent += servicePrice;
            
            // Vérifier si le cycle est terminé
            if (client.currentProgress >= client.targetProgress) {
                client.hasAvailableDiscount = true;
                console.log(`🏆 ${clientName} a terminé son cycle ${client.programType} ! Remise de ${client.discount}€ disponible`);
            }
            
            // Sauvegarder
            localStorage.setItem('loyaltyProgram', JSON.stringify(loyaltyData));
            
            console.log(`🎆 Point fidélité ajouté pour ${clientName} - Progression: ${client.currentProgress}/${client.targetProgress}`);
            
            // Mettre à jour l'affichage
            this.updateLoyaltyDisplay();
            
            return client;
        },
        
        // Mettre à jour l'affichage de l'onglet fidélité
        updateLoyaltyDisplay() {
            const loyaltyData = JSON.parse(localStorage.getItem('loyaltyProgram')) || {};
            
            // Mise à jour directe des éléments HTML existants
            Object.entries(loyaltyData).forEach(([clientName, data]) => {
                const clientKey = clientName.toLowerCase().split(' ')[0]; // 'marie', 'sophie', etc.
                
                // Mettre à jour la progression
                const progressBar = document.getElementById(`${clientKey}-progress`);
                const progressText = document.getElementById(`${clientKey}-progress-text`);
                const availableDiscount = document.getElementById(`${clientKey}-available-discount`);
                const nextInfo = document.getElementById(`${clientKey}-next-info`);
                
                if (progressBar && progressText && availableDiscount && nextInfo) {
                    // Calculer le pourcentage de progression
                    const progressPercent = (data.currentProgress / data.targetProgress) * 100;
                    progressBar.style.width = `${progressPercent}%`;
                    
                    // Mettre à jour le texte de progression
                    const progressString = data.currentProgress >= data.targetProgress ? 
                        `${data.targetProgress}/${data.targetProgress} ${data.programType === 'soins' ? 'séances' : 'forfaits'} ✅` : 
                        `${data.currentProgress}/${data.targetProgress} ${data.programType === 'soins' ? 'séances' : 'forfaits'}`;
                    progressText.textContent = progressString;
                    
                    // Mettre à jour les remises
                    if (data.hasAvailableDiscount) {
                        availableDiscount.innerHTML = `<span style="color: #28a745; font-weight: 600; font-size: 0.9rem; background: rgba(40, 167, 69, 0.1); padding: 0.3rem 0.8rem; border-radius: 12px;">-${data.discount}€ disponible!</span>`;
                        nextInfo.textContent = 'À redémarrer';
                        
                        // Changer le badge du programme pour "Terminé"
                        const programBadge = progressBar.closest('tr').querySelector('td:nth-child(2) span');
                        if (programBadge) {
                            programBadge.style.background = 'linear-gradient(135deg, #ffc107, #e0a800)';
                            programBadge.innerHTML = '🏆 Terminé';
                        }
                        
                        // Animation sur le bouton de remise
                        const discountButton = progressBar.closest('tr').querySelector('button[onclick*="applyLoyaltyDiscount"]');
                        if (discountButton) {
                            discountButton.style.animation = 'pulse 2s infinite';
                        }
                    } else {
                        availableDiscount.innerHTML = `<span style="color: #dc3545; font-weight: 600; font-size: 0.9rem;">Aucune</span>`;
                        const remaining = data.targetProgress - data.currentProgress;
                        nextInfo.innerHTML = `${remaining} ${data.programType === 'soins' ? 'séance' : 'forfait'}${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}`;
                    }
                    
                    console.log(`✅ Affichage mis à jour pour ${clientName}: ${data.currentProgress}/${data.targetProgress}`);
                }
            });
        },
        
        // Mettre à jour les statistiques de fidélité
        updateLoyaltyStats(loyaltyData) {
            const totalClients = Object.keys(loyaltyData).length;
            let bronzeCount = 0, silverCount = 0, goldCount = 0, diamondCount = 0;
            
            Object.values(loyaltyData).forEach(client => {
                switch (client.status) {
                    case 'Bronze': bronzeCount++; break;
                    case 'Argent': silverCount++; break;
                    case 'Or': goldCount++; break;
                    case 'Diamant': diamondCount++; break;
                }
            });
            
            // Mettre à jour les cartes de statistiques
            const stats = [
                { id: 'loyalty-total-clients', value: totalClients },
                { id: 'loyalty-bronze-count', value: bronzeCount },
                { id: 'loyalty-silver-count', value: silverCount },
                { id: 'loyalty-gold-count', value: goldCount },
                { id: 'loyalty-diamond-count', value: diamondCount }
            ];
            
            stats.forEach(stat => {
                const element = document.getElementById(stat.id);
                if (element) {
                    element.textContent = stat.value;
                }
            });
        }
    };
    
    // ✅ SYSTÈME DE VALIDATION AMÉLIORÉ
    const validationSystem = {
        // Validation d'un RDV
        validateAppointment(appointmentId) {
            console.log('✅ Ouverture validation pour:', appointmentId);
            
            const modal = document.getElementById('validation-modal');
            const clientName = document.getElementById('modal-client-name');
            const appointmentDate = document.getElementById('modal-appointment-date');
            const serviceType = document.getElementById('modal-service-type');
            
            // Données des RDV (normalement de votre base de données)
            const appointments = {
                'rdv001': { 
                    client: 'Marie Dupont', 
                    date: 'Aujourd\'hui 14:00', 
                    service: 'Hydro\'Naissance',
                    price: 120
                },
                'rdv002': { 
                    client: 'Sophie Martin', 
                    date: 'Aujourd\'hui 16:30', 
                    service: 'BB Glow',
                    price: 150
                },
                'rdv003': { 
                    client: 'Julie Bernard', 
                    date: 'Aujourd\'hui 18:00', 
                    service: 'Renaissance',
                    price: 95
                }
            };
            
            const appointment = appointments[appointmentId];
            
            if (appointment && modal && clientName && appointmentDate && serviceType) {
                clientName.textContent = appointment.client;
                appointmentDate.textContent = appointment.date;
                serviceType.textContent = appointment.service;
                
                modal.style.display = 'flex';
                modal.setAttribute('data-appointment-id', appointmentId);
                modal.setAttribute('data-service-price', appointment.price);
                
                console.log('✅ Modal de validation ouverte pour:', appointment.client);
            }
        },
        
        // Confirmation de la validation
        confirmValidation(wasPresent) {
            const modal = document.getElementById('validation-modal');
            const appointmentId = modal ? modal.getAttribute('data-appointment-id') : null;
            const servicePrice = parseInt(modal ? modal.getAttribute('data-service-price') : '0');
            const clientName = document.getElementById('modal-client-name').textContent;
            
            if (appointmentId && clientName) {
                // Mettre à jour le statut dans le tableau
                const appointmentRow = document.querySelector(`[data-appointment-id="${appointmentId}"]`);
                if (appointmentRow) {
                    const statusCell = appointmentRow.querySelector('.appointment-status');
                    if (statusCell) {
                        if (wasPresent) {
                            statusCell.innerHTML = '<span style="background: #d4edda; color: #155724; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">✅ Présent</span>';
                            
                            // SYNCHRONISATION : Ajouter le point de fidélité
                            const updatedClient = loyaltySystem.addPoint(clientName, servicePrice);
                            
                            // Notification détaillée
                            const progressText = updatedClient.hasAvailableDiscount ? 
                                `🏆 Cycle terminé ! Remise de ${updatedClient.discount}€ disponible` :
                                `Progression: ${updatedClient.currentProgress}/${updatedClient.targetProgress} ${updatedClient.programType === 'soins' ? 'séances' : 'forfaits'}`;
                            
                            this.showNotification(
                                `✅ ${clientName} validé présent\n🎆 +1 point fidélité\n${progressText}\n💰 +${servicePrice}€ CA`, 
                                'success'
                            );
                        } else {
                            statusCell.innerHTML = '<span style="background: #f8d7da; color: #721c24; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">❌ Absent</span>';
                            this.showNotification(`❌ Absence enregistrée pour ${clientName}`, 'info');
                        }
                    }
                }
                
                // Fermer le modal
                modal.style.display = 'none';
                
                // Mettre à jour les statistiques de validation
                this.updateValidationStats();
                
                console.log(`✅ Validation terminée: ${clientName} - ${wasPresent ? 'Présent' : 'Absent'}`);
            }
        },
        
        // Mettre à jour les statistiques de validation
        updateValidationStats() {
            let toValidate = 0, validated = 0, absent = 0, loyaltyPoints = 0;
            
            document.querySelectorAll('[data-appointment-id]').forEach(row => {
                const statusSpan = row.querySelector('.appointment-status span');
                if (statusSpan) {
                    const statusText = statusSpan.textContent;
                    if (statusText.includes('En attente')) {
                        toValidate++;
                        loyaltyPoints++; // Points potentiels
                    } else if (statusText.includes('Présent')) {
                        validated++;
                    } else if (statusText.includes('Absent')) {
                        absent++;
                    }
                }
            });
            
            // Mettre à jour les cartes de stats
            const statsCards = document.querySelectorAll('.stat-validation-card div:first-child');
            if (statsCards.length >= 4) {
                statsCards[0].textContent = toValidate; // À valider
                statsCards[1].textContent = validated; // Validés
                statsCards[2].textContent = absent; // Absents
                statsCards[3].textContent = `+${loyaltyPoints}`; // Points potentiels
            }
        },
        
        // Notification système
        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            const bgColor = {
                'success': '#d4edda',
                'error': '#f8d7da',
                'info': '#d1ecf1'
            }[type] || '#d1ecf1';
            
            const textColor = {
                'success': '#155724',
                'error': '#721c24', 
                'info': '#0c5460'
            }[type] || '#0c5460';
            
            const borderColor = {
                'success': '#28a745',
                'error': '#dc3545',
                'info': '#17a2b8'
            }[type] || '#17a2b8';
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${bgColor};
                color: ${textColor};
                padding: 1.5rem 2rem;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                z-index: 10000;
                font-weight: 500;
                border-left: 4px solid ${borderColor};
                max-width: 400px;
                white-space: pre-line;
                font-size: 0.95rem;
                line-height: 1.4;
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 6000);
        }
    };
    
    // 🌐 EXPOSITION GLOBALE DES FONCTIONS
    window.validateAppointment = validationSystem.validateAppointment.bind(validationSystem);
    window.confirmValidation = validationSystem.confirmValidation.bind(validationSystem);
    window.closeValidationModal = () => {
        const modal = document.getElementById('validation-modal');
        if (modal) modal.style.display = 'none';
    };
    
    // Fonctions globales pour la fidélité
    window.applyLoyaltyDiscount = function(clientKey) {
        const loyaltyData = JSON.parse(localStorage.getItem('loyaltyProgram')) || {};
        const clientName = Object.keys(loyaltyData).find(name => 
            name.toLowerCase().split(' ')[0] === clientKey
        );
        
        if (clientName && loyaltyData[clientName]) {
            const client = loyaltyData[clientName];
            
            if (client.hasAvailableDiscount) {
                if (confirm(`Appliquer la remise de ${client.discount}€ pour ${clientName} ?\n\nCela va :\n- Déduire ${client.discount}€ du prochain RDV\n- Redémarrer le cycle de fidélité\n- Réinitialiser la progression`)) {
                    
                    // Appliquer la remise et redémarrer le cycle
                    client.hasAvailableDiscount = false;
                    client.currentProgress = 0;
                    client.totalSpent += client.discount; // Ajout symbolique du discount utilisé
                    
                    // Sauvegarder
                    localStorage.setItem('loyaltyProgram', JSON.stringify(loyaltyData));
                    
                    // Mettre à jour l'affichage
                    loyaltySystem.updateLoyaltyDisplay();
                    
                    // Notification
                    validationSystem.showNotification(
                        `✅ Remise de ${client.discount}€ appliquée pour ${clientName}\n🔄 Nouveau cycle démarré (0/${client.targetProgress})`,
                        'success'
                    );
                    
                    console.log(`💰 Remise appliquée pour ${clientName}: ${client.discount}€`);
                }
            } else {
                alert(`${clientName} n'a pas de remise disponible actuellement.\n\nProgression actuelle : ${client.currentProgress}/${client.targetProgress} ${client.programType === 'soins' ? 'séances' : 'forfaits'}`);
            }
        }
    };
    
    window.viewLoyaltyHistory = function(clientKey) {
        const loyaltyData = JSON.parse(localStorage.getItem('loyaltyProgram')) || {};
        const clientName = Object.keys(loyaltyData).find(name => 
            name.toLowerCase().split(' ')[0] === clientKey
        );
        
        if (clientName && loyaltyData[clientName]) {
            const client = loyaltyData[clientName];
            const programIcon = client.programType === 'soins' ? '💆‍♀️' : '💎';
            const statusIcon = client.hasAvailableDiscount ? '🏆' : '🔄';
            const progressPercent = Math.round((client.currentProgress / client.targetProgress) * 100);
            
            alert(`${programIcon} Historique Fidélité - ${clientName}\n\n${statusIcon} Programme: ${client.programType === 'soins' ? 'Soins Individuels' : 'Forfaits'}\n📊 Progression: ${client.currentProgress}/${client.targetProgress} (${progressPercent}%)\n💰 Remise: ${client.discount}€\n${client.hasAvailableDiscount ? '✅ Remise disponible!' : '⏳ En cours...'}\n\n📅 Membre depuis: ${client.joinDate}\n💸 Total dépensé: ${client.totalSpent}€\n📞 Téléphone: ${client.phone}`);
        }
    };
    
    window.performInstantSearch = function() {
        const searchTerm = document.getElementById('loyalty-main-search').value.toLowerCase();
        const loyaltyData = JSON.parse(localStorage.getItem('loyaltyProgram')) || {};
        
        if (searchTerm.length > 0) {
            const matchingClients = Object.keys(loyaltyData).filter(name => 
                name.toLowerCase().includes(searchTerm) || 
                loyaltyData[name].email.toLowerCase().includes(searchTerm) ||
                loyaltyData[name].phone.includes(searchTerm)
            );
            
            // Afficher/masquer les lignes selon la recherche
            const allRows = document.querySelectorAll('#loyalty-clients-table tbody tr');
            allRows.forEach(row => {
                const clientNameElement = row.querySelector('td:first-child div div:first-child');
                if (clientNameElement) {
                    const clientName = clientNameElement.textContent;
                    if (matchingClients.includes(clientName)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
            
            // Afficher le bouton de nettoyage
            document.getElementById('clear-search-btn').style.display = 'block';
        } else {
            // Afficher toutes les lignes
            document.querySelectorAll('#loyalty-clients-table tbody tr').forEach(row => {
                row.style.display = '';
            });
            document.getElementById('clear-search-btn').style.display = 'none';
        }
        
        console.log('🔍 Recherche fidélité:', searchTerm);
    };
    
    window.clearSearch = function() {
        document.getElementById('loyalty-main-search').value = '';
        document.getElementById('clear-search-btn').style.display = 'none';
        
        // Réafficher toutes les lignes
        document.querySelectorAll('#loyalty-clients-table tbody tr').forEach(row => {
            row.style.display = '';
        });
    };
    
    window.filterByStatus = function(status) {
        console.log('🔄 Début filtrage par statut:', status);
        
        // Retirer la classe active de tous les boutons
        document.querySelectorAll('.loyalty-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activer le bouton cliqué
        const buttonMappings = {
            'all': 'filter-all',
            'cycles-completed': 'filter-cycles',
            'soins-progress': 'filter-soins',
            'forfaits-progress': 'filter-forfaits',
            'expired': 'filter-expired',
            'inactive': 'filter-inactive'
        };
        
        const buttonId = buttonMappings[status] || 'filter-all';
        const activeButton = document.getElementById(buttonId);
        if (activeButton) {
            activeButton.classList.add('active');
            console.log('✅ Bouton activé:', buttonId);
        } else {
            console.error('❌ Bouton non trouvé:', buttonId);
        }
        
        // Filtrer les lignes - chercher dans le bon tableau
        const loyaltyData = JSON.parse(localStorage.getItem('loyaltyProgram')) || {};
        console.log('📊 Données fidélité:', Object.keys(loyaltyData));
        
        // Essayer plusieurs sélecteurs pour trouver les bonnes lignes
        let allRows = document.querySelectorAll('#loyalty-clients-list tr');
        if (allRows.length === 0) {
            allRows = document.querySelectorAll('#loyalty-clients-table tbody tr');
        }
        if (allRows.length === 0) {
            allRows = document.querySelectorAll('.reservations-table tbody tr');
        }
        
        console.log('🔍 Lignes trouvées:', allRows.length);
        
        let visibleCount = 0;
        
        allRows.forEach((row, index) => {
            // Chercher le nom du client dans différents endroits possibles
            let clientName = null;
            
            // Essai 1: Structure complexe avec div
            let clientNameElement = row.querySelector('td:first-child div div:first-child');
            if (clientNameElement) {
                clientName = clientNameElement.textContent.trim();
            }
            
            // Essai 2: Structure simple
            if (!clientName) {
                clientNameElement = row.querySelector('td:first-child');
                if (clientNameElement) {
                    const textContent = clientNameElement.textContent.trim();
                    // Extraire juste le nom (première ligne)
                    clientName = textContent.split('\n')[0].trim();
                }
            }
            
            console.log(`🔍 Ligne ${index + 1}: "${clientName}"`);
            
            if (clientName && loyaltyData[clientName]) {
                const client = loyaltyData[clientName];
                let showRow = false;
                
                switch (status) {
                    case 'all':
                        showRow = true;
                        break;
                    case 'cycles-completed':
                        showRow = client.hasAvailableDiscount;
                        break;
                    case 'soins-progress':
                        showRow = client.programType === 'soins' && !client.hasAvailableDiscount;
                        break;
                    case 'forfaits-progress':
                        showRow = client.programType === 'forfaits' && !client.hasAvailableDiscount;
                        break;
                    case 'expired':
                        // Clients avec une progression qui stagne (plus de 6 mois sans activité)
                        const lastActivityDate = new Date(client.lastService || client.joinDate);
                        const sixMonthsAgo = new Date();
                        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                        showRow = lastActivityDate < sixMonthsAgo && !client.hasAvailableDiscount;
                        break;
                    case 'inactive':
                        // Clients inactifs depuis plus de 12 mois
                        const lastActivity12 = new Date(client.lastService || client.joinDate);
                        const twelveMonthsAgo = new Date();
                        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
                        showRow = lastActivity12 < twelveMonthsAgo;
                        break;
                }
                
                row.style.display = showRow ? '' : 'none';
                if (showRow) visibleCount++;
                
                console.log(`${showRow ? '✅' : '❌'} ${clientName}: ${client.programType} - ${client.hasAvailableDiscount ? 'Remise dispo' : 'En cours'}`);
            } else {
                // Si on ne trouve pas le client dans les données, masquer la ligne pour être sûr
                row.style.display = 'none';
                console.log(`❓ Client non trouvé dans les données: "${clientName}"`);
            }
        });
        
        console.log(`✅ Filtrage terminé: ${visibleCount} ligne(s) visible(s) sur ${allRows.length}`);
    };
    
    window.showSuggestions = function() {
        console.log('💡 Afficher suggestions');
    };
    
    window.hideSuggestions = function() {
        console.log('💡 Masquer suggestions');
    };
    
    // Fonction pour basculer l'affichage du menu d'actions
    window.toggleLoyaltyActions = function(clientKey) {
        const menu = document.getElementById(`${clientKey}-actions-menu`);
        const button = menu ? menu.previousElementSibling : null;
        
        // Fermer tous les autres menus d'abord
        document.querySelectorAll('.loyalty-actions-menu').forEach(otherMenu => {
            if (otherMenu.id !== `${clientKey}-actions-menu`) {
                otherMenu.style.display = 'none';
            }
        });
        
        // Basculer le menu actuel
        if (menu && button) {
            const isVisible = menu.style.display !== 'none';
            
            if (isVisible) {
                menu.style.display = 'none';
            } else {
                // Calculer la position optimale
                const buttonRect = button.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const menuHeight = 350; // hauteur approximative du menu
                
                // Reset styles pour mesurer
                menu.style.display = 'block';
                menu.style.top = '';
                menu.style.bottom = '';
                
                // Si pas assez de place en bas, afficher vers le haut
                if (buttonRect.bottom + menuHeight > viewportHeight - 20) {
                    menu.style.top = 'auto';
                    menu.style.bottom = '100%';
                    menu.style.marginTop = '0';
                    menu.style.marginBottom = '0.5rem';
                    console.log(`🔧 Menu affiché vers le HAUT pour ${clientKey}`);
                } else {
                    menu.style.top = '100%';
                    menu.style.bottom = 'auto';
                    menu.style.marginTop = '0.5rem';
                    menu.style.marginBottom = '0';
                    console.log(`🔧 Menu affiché vers le BAS pour ${clientKey}`);
                }
                
                console.log(`🔧 Menu d'actions ouvert pour ${clientKey}`);
            }
        }
    };
    
    // Fermer les menus quand on clique ailleurs
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.loyalty-actions')) {
            document.querySelectorAll('.loyalty-actions-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });
    
    // Fonction pour appliquer une remise manuelle
    window.applyManualDiscount = function(clientKey, amount) {
        const loyaltyData = JSON.parse(localStorage.getItem('loyaltyProgram')) || {};
        const clientName = Object.keys(loyaltyData).find(name => 
            name.toLowerCase().split(' ')[0] === clientKey
        );
        
        if (clientName) {
            if (confirm(`Appliquer une remise manuelle de ${amount}€ pour ${clientName} ?\n\n⚠️ Cette remise sera appliquée indépendamment du programme de fidélité.\n\nMotif : ${amount === 10 ? 'Remise soins' : 'Remise forfaits'}`)) {
                
                // Notification
                validationSystem.showNotification(
                    `🎁 Remise manuelle de ${amount}€ appliquée pour ${clientName}\n💰 Cette remise sera déduite du prochain RDV\n📝 Motif: ${amount === 10 ? 'Soins' : 'Forfaits'}`,
                    'success'
                );
                
                // Fermer le menu
                document.getElementById(`${clientKey}-actions-menu`).style.display = 'none';
                
                console.log(`🎁 Remise manuelle de ${amount}€ appliquée pour ${clientName}`);
            }
        }
    };
    
    // Fonction pour ajouter un soin ou forfait manuellement
    window.addManualService = function(clientKey, serviceType) {
        const loyaltyData = JSON.parse(localStorage.getItem('loyaltyProgram')) || {};
        const clientName = Object.keys(loyaltyData).find(name => 
            name.toLowerCase().split(' ')[0] === clientKey
        );
        
        if (clientName && loyaltyData[clientName]) {
            const client = loyaltyData[clientName];
            const serviceIcon = serviceType === 'soin' ? '💆‍♀️' : '📦';
            const servicePrice = serviceType === 'soin' ? 90 : 260;
            
            if (confirm(`Ajouter un ${serviceType} manuel pour ${clientName} ?\n\n${serviceIcon} Service: ${serviceType === 'soin' ? 'Soin individuel' : 'Forfait'}\n💰 Valeur: ${servicePrice}€\n🎆 Cela ajoutera +1 au programme de fidélité`)) {
                
                // Si le type de service ne correspond pas au programme actuel, demander confirmation
                const isCompatible = (serviceType === 'soin' && client.programType === 'soins') || 
                                   (serviceType === 'forfait' && client.programType === 'forfaits');
                
                if (!isCompatible) {
                    const shouldSwitch = confirm(`⚠️ ${clientName} est actuellement dans le programme "${client.programType}"\n\nVoulez-vous :\n✅ OUI - Changer son programme vers "${serviceType}s" et ajouter le ${serviceType}\n❌ NON - Annuler l'ajout`);
                    
                    if (shouldSwitch) {
                        // Changer de programme et reset la progression
                        client.programType = serviceType + 's';
                        client.currentProgress = 0;
                        client.targetProgress = serviceType === 'soin' ? 5 : 2;
                        client.discount = serviceType === 'soin' ? 10 : 20;
                        client.hasAvailableDiscount = false;
                    } else {
                        return; // Annuler
                    }
                }
                
                // Ajouter le service
                loyaltySystem.addPoint(clientName, servicePrice);
                
                // Notification
                validationSystem.showNotification(
                    `${serviceIcon} ${serviceType === 'soin' ? 'Soin' : 'Forfait'} manuel ajouté pour ${clientName}\n🎆 Nouvelle progression: ${client.currentProgress + 1}/${client.targetProgress}\n💰 +${servicePrice}€ CA`,
                    'success'
                );
                
                // Fermer le menu
                document.getElementById(`${clientKey}-actions-menu`).style.display = 'none';
                
                console.log(`${serviceIcon} ${serviceType} manuel ajouté pour ${clientName}`);
            }
        }
    };
    
    // Fonction pour envoyer un email de fidélité
    window.sendLoyaltyEmail = function(clientKey) {
        const loyaltyData = JSON.parse(localStorage.getItem('loyaltyProgram')) || {};
        const clientName = Object.keys(loyaltyData).find(name => 
            name.toLowerCase().split(' ')[0] === clientKey
        );
        
        if (clientName && loyaltyData[clientName]) {
            const client = loyaltyData[clientName];
            
            const emailOptions = [
                'Progression fidélité (état actuel)',
                'Remise disponible (si applicable)',
                'Invitation à prendre RDV',
                'Email personnalisé'
            ];
            
            const choice = prompt(`📧 Envoyer email à ${clientName} (${client.email})\n\nChoisissez le type d'email :\n1. ${emailOptions[0]}\n2. ${emailOptions[1]}\n3. ${emailOptions[2]}\n4. ${emailOptions[3]}\n\nTapez 1, 2, 3 ou 4:`);
            
            if (choice && choice.match(/^[1-4]$/)) {
                const selectedOption = emailOptions[parseInt(choice) - 1];
                
                // Simulation d'envoi d'email
                validationSystem.showNotification(
                    `📧 Email envoyé à ${clientName}\n📮 Type: ${selectedOption}\n📧 Adresse: ${client.email}\n✅ Envoi simulé avec succès`,
                    'success'
                );
                
                // Fermer le menu
                document.getElementById(`${clientKey}-actions-menu`).style.display = 'none';
                
                console.log(`📧 Email "${selectedOption}" envoyé à ${clientName} (${client.email})`);
            }
        }
    };
    
    // 🚀 INITIALISATION
    setTimeout(() => {
        loyaltySystem.init();
        validationSystem.updateValidationStats();
        
        console.log('✅ Synchronisation Validation ↔ Fidélité activée !');
        console.log('🎯 Toutes les validations mettront automatiquement à jour la fidélité');
    }, 500);
});