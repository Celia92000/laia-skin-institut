// Système de synchronisation complet pour tous les onglets du dashboard admin
// Gère : Calendrier, CRM, Dashboard, Validation, Fidélisation, Paiements

class AdminCompleteSync {
    constructor() {
        this.apiUrl = window.API_CONFIG ? window.API_CONFIG.baseURL : 'https://laia-skin-api.onrender.com';
        this.appointments = [];
        this.clients = new Map();
        this.pendingValidations = [];
        this.loyaltyData = new Map();
        this.statistics = {
            totalReservations: 0,
            totalRevenue: 0,
            pendingRevenue: 0,
            validatedRevenue: 0,
            newClients: 0,
            returningClients: 0,
            todayAppointments: 0,
            weekAppointments: 0,
            monthRevenue: 0
        };
    }

    // ========== INITIALISATION ==========
    async init() {
        console.log('🚀 Initialisation du système de synchronisation complet...');
        
        // Charger toutes les données
        await this.loadAllData();
        
        // Initialiser tous les onglets
        this.initAllTabs();
        
        // Actualisation automatique toutes les 30 secondes
        setInterval(() => this.loadAllData(), 30000);
        
        // Écouter les changements localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'laia-new-booking' || e.key === 'allReservations') {
                console.log('📡 Nouvelle donnée détectée');
                this.loadAllData();
            }
        });
    }

    // ========== CHARGEMENT DES DONNÉES ==========
    async loadAllData() {
        try {
            // Récupérer depuis l'API
            const response = await fetch(`${this.apiUrl}/api/admin/appointments`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || 'admin-token'}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.appointments = data.appointments || [];
                console.log(`✅ ${this.appointments.length} réservations chargées`);
            }
        } catch (error) {
            console.error('❌ Erreur API, utilisation du localStorage:', error);
            this.appointments = JSON.parse(localStorage.getItem('allReservations') || '[]');
        }

        // Traiter les données
        this.processAllData();
        
        // Mettre à jour tous les onglets
        this.updateAllTabs();
    }

    // ========== TRAITEMENT DES DONNÉES ==========
    processAllData() {
        // Réinitialiser
        this.clients.clear();
        this.pendingValidations = [];
        this.loyaltyData.clear();
        this.statistics = {
            totalReservations: 0,
            totalRevenue: 0,
            pendingRevenue: 0,
            validatedRevenue: 0,
            newClients: 0,
            returningClients: 0,
            todayAppointments: 0,
            weekAppointments: 0,
            monthRevenue: 0
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const currentMonth = today.getMonth();

        // Traiter chaque réservation
        this.appointments.forEach(apt => {
            // Infos de base
            const clientEmail = apt.email || apt.client?.email || 'unknown';
            const clientName = apt.clientName || apt.client?.name || 'Client';
            const clientPhone = apt.phone || apt.client?.phone || '';
            const price = apt.price || apt.amount || 0;
            const aptDate = new Date(apt.datetime || apt.date);
            
            // Statistiques générales
            this.statistics.totalReservations++;
            
            // ========== CRM CLIENT ==========
            if (!this.clients.has(clientEmail)) {
                this.clients.set(clientEmail, {
                    id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    email: clientEmail,
                    name: clientName,
                    phone: clientPhone,
                    appointments: [],
                    totalSpent: 0,
                    validatedSpent: 0,
                    pendingSpent: 0,
                    loyaltyPoints: 0,
                    firstVisit: aptDate,
                    lastVisit: aptDate,
                    status: 'active',
                    notes: '',
                    tags: []
                });
                this.statistics.newClients++;
            } else {
                this.statistics.returningClients++;
            }
            
            const client = this.clients.get(clientEmail);
            client.appointments.push(apt);
            
            // Mise à jour des dates
            if (aptDate < client.firstVisit) client.firstVisit = aptDate;
            if (aptDate > client.lastVisit) client.lastVisit = aptDate;
            
            // ========== VALIDATION & PAIEMENTS ==========
            if (apt.status === 'confirmé' || !apt.status) {
                // En attente de validation
                this.pendingValidations.push(apt);
                this.statistics.pendingRevenue += price;
                client.pendingSpent += price;
            } else if (apt.status === 'terminé' || apt.status === 'validé') {
                // Déjà validé
                this.statistics.validatedRevenue += price;
                client.validatedSpent += price;
                client.totalSpent += price;
                
                // Points de fidélité (10% du montant)
                const points = Math.floor(price * 0.1);
                client.loyaltyPoints += points;
                
                // Enregistrer dans la fidélisation
                if (!this.loyaltyData.has(clientEmail)) {
                    this.loyaltyData.set(clientEmail, {
                        points: 0,
                        history: []
                    });
                }
                const loyalty = this.loyaltyData.get(clientEmail);
                loyalty.points += points;
                loyalty.history.push({
                    date: aptDate,
                    service: apt.service,
                    points: points,
                    amount: price
                });
            }
            
            // ========== CALENDRIER ==========
            // Rendez-vous du jour
            if (aptDate.toDateString() === today.toDateString()) {
                this.statistics.todayAppointments++;
            }
            
            // Rendez-vous de la semaine
            if (aptDate >= today && aptDate <= weekFromNow) {
                this.statistics.weekAppointments++;
            }
            
            // Revenus du mois
            if (aptDate.getMonth() === currentMonth) {
                this.statistics.monthRevenue += price;
            }
            
            // Calcul du CA total
            this.statistics.totalRevenue = this.statistics.pendingRevenue + this.statistics.validatedRevenue;
        });
    }

    // ========== MISE À JOUR DES ONGLETS ==========
    initAllTabs() {
        // Ajouter les event listeners pour les onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    updateAllTabs() {
        this.updateDashboard();
        this.updateCalendar();
        this.updateCRM();
        this.updateValidation();
        this.updateLoyalty();
        this.updatePayments();
    }

    // ========== 1. DASHBOARD (Tableau de bord) ==========
    updateDashboard() {
        console.log('📊 Mise à jour du Dashboard');
        
        // Cartes statistiques
        this.updateElement('stat-total-reservations', this.statistics.totalReservations);
        this.updateElement('stat-total-revenue', `${this.statistics.totalRevenue}€`);
        this.updateElement('stat-total-clients', this.clients.size);
        this.updateElement('stat-month-revenue', `${this.statistics.monthRevenue}€`);
        this.updateElement('stat-today-appointments', this.statistics.todayAppointments);
        this.updateElement('stat-week-appointments', this.statistics.weekAppointments);
        this.updateElement('stat-new-clients', this.statistics.newClients);
        this.updateElement('stat-returning-clients', this.statistics.returningClients);
        this.updateElement('stat-pending-revenue', `${this.statistics.pendingRevenue}€`);
        this.updateElement('stat-validated-revenue', `${this.statistics.validatedRevenue}€`);
        
        // Graphiques si présents
        if (window.updateCharts) {
            window.updateCharts(this.statistics, this.appointments);
        }
    }

    // ========== 2. CALENDRIER ==========
    updateCalendar() {
        console.log('📅 Mise à jour du Calendrier');
        
        const calendarElement = document.getElementById('calendar-view');
        if (!calendarElement) return;
        
        // Créer une vue calendrier
        const calendarData = {};
        
        this.appointments.forEach(apt => {
            const date = new Date(apt.datetime || apt.date);
            const dateKey = date.toISOString().split('T')[0];
            
            if (!calendarData[dateKey]) {
                calendarData[dateKey] = [];
            }
            
            calendarData[dateKey].push({
                time: apt.time || date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                client: apt.clientName || apt.client?.name,
                service: apt.service,
                status: apt.status || 'confirmé',
                duration: apt.duration || 60,
                price: apt.price || apt.amount || 0
            });
        });
        
        // Mettre à jour le calendrier visuel
        if (window.renderCalendar) {
            window.renderCalendar(calendarData);
        }
        
        // Stocker pour d'autres composants
        localStorage.setItem('calendarData', JSON.stringify(calendarData));
    }

    // ========== 3. CRM (Gestion clients) ==========
    updateCRM() {
        console.log('👥 Mise à jour du CRM');
        
        const crmTable = document.querySelector('#crm-table tbody, .clients-table tbody');
        if (!crmTable) return;
        
        crmTable.innerHTML = '';
        
        // Trier les clients par CA décroissant
        const sortedClients = Array.from(this.clients.values())
            .sort((a, b) => b.totalSpent - a.totalSpent);
        
        sortedClients.forEach(client => {
            const row = document.createElement('tr');
            const lastVisitStr = client.lastVisit.toLocaleDateString('fr-FR');
            const firstVisitStr = client.firstVisit.toLocaleDateString('fr-FR');
            
            // Déterminer le statut du client
            const daysSinceLastVisit = Math.floor((new Date() - client.lastVisit) / (1000 * 60 * 60 * 24));
            let statusBadge = 'badge-success';
            let statusText = 'Actif';
            
            if (daysSinceLastVisit > 90) {
                statusBadge = 'badge-danger';
                statusText = 'Inactif';
            } else if (daysSinceLastVisit > 30) {
                statusBadge = 'badge-warning';
                statusText = 'À relancer';
            }
            
            row.innerHTML = `
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td>${client.phone || 'N/A'}</td>
                <td>${client.appointments.length}</td>
                <td>${client.totalSpent}€</td>
                <td>${client.loyaltyPoints} pts</td>
                <td>${firstVisitStr}</td>
                <td>${lastVisitStr}</td>
                <td><span class="badge ${statusBadge}">${statusText}</span></td>
                <td>
                    <button class="btn-action" onclick="adminCompleteSync.viewClientDetails('${client.email}')">👁️</button>
                    <button class="btn-action" onclick="adminCompleteSync.sendClientMessage('${client.email}')">📧</button>
                    <button class="btn-action" onclick="adminCompleteSync.addClientNote('${client.email}')">📝</button>
                </td>
            `;
            
            crmTable.appendChild(row);
        });
        
        // Sauvegarder les données CRM
        localStorage.setItem('crmData', JSON.stringify(Array.from(this.clients.entries())));
    }

    // ========== 4. VALIDATION ==========
    updateValidation() {
        console.log('✅ Mise à jour des Validations');
        
        const validationTable = document.querySelector('#validation-table tbody, .validation-list tbody');
        if (!validationTable) return;
        
        validationTable.innerHTML = '';
        
        // Afficher seulement les rendez-vous en attente
        this.pendingValidations.forEach(apt => {
            const row = document.createElement('tr');
            const date = new Date(apt.datetime || apt.date);
            const dateStr = date.toLocaleDateString('fr-FR');
            const timeStr = apt.time || date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            
            row.innerHTML = `
                <td>${dateStr}</td>
                <td>${timeStr}</td>
                <td>${apt.clientName || apt.client?.name}</td>
                <td>${apt.service}</td>
                <td>${apt.price || apt.amount || 0}€</td>
                <td><span class="badge badge-warning">En attente</span></td>
                <td>
                    <button class="btn-success" onclick="adminCompleteSync.validateAppointment('${apt._id}')">
                        ✅ Valider
                    </button>
                    <button class="btn-danger" onclick="adminCompleteSync.cancelAppointment('${apt._id}')">
                        ❌ Annuler
                    </button>
                </td>
            `;
            
            validationTable.appendChild(row);
        });
        
        // Afficher le nombre de validations en attente
        this.updateElement('pending-validations-count', this.pendingValidations.length);
        this.updateElement('pending-validations-amount', `${this.statistics.pendingRevenue}€`);
    }

    // ========== 5. FIDÉLISATION ==========
    updateLoyalty() {
        console.log('🎁 Mise à jour de la Fidélisation');
        
        const loyaltyTable = document.querySelector('#loyalty-table tbody, .loyalty-list tbody');
        if (!loyaltyTable) return;
        
        loyaltyTable.innerHTML = '';
        
        // Afficher les clients avec leurs points
        this.loyaltyData.forEach((loyalty, email) => {
            const client = this.clients.get(email);
            if (!client) return;
            
            const row = document.createElement('tr');
            
            // Calculer les récompenses disponibles
            const rewards = this.calculateRewards(loyalty.points);
            
            row.innerHTML = `
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td>${loyalty.points} pts</td>
                <td>${rewards.available}</td>
                <td>${loyalty.history.length} soins</td>
                <td>
                    <button class="btn-action" onclick="adminCompleteSync.viewLoyaltyHistory('${email}')">📊</button>
                    <button class="btn-action" onclick="adminCompleteSync.useReward('${email}')">🎁</button>
                </td>
            `;
            
            loyaltyTable.appendChild(row);
        });
    }

    // ========== 6. PAIEMENTS ==========
    updatePayments() {
        console.log('💰 Mise à jour des Paiements');
        
        const paymentsTable = document.querySelector('#payments-table tbody, .payments-list tbody');
        if (!paymentsTable) return;
        
        paymentsTable.innerHTML = '';
        
        // Afficher tous les paiements (validés)
        this.appointments
            .filter(apt => apt.status === 'terminé' || apt.status === 'validé')
            .sort((a, b) => new Date(b.datetime || b.date) - new Date(a.datetime || a.date))
            .forEach(apt => {
                const row = document.createElement('tr');
                const date = new Date(apt.datetime || apt.date);
                const dateStr = date.toLocaleDateString('fr-FR');
                
                row.innerHTML = `
                    <td>${dateStr}</td>
                    <td>${apt.clientName || apt.client?.name}</td>
                    <td>${apt.service}</td>
                    <td>${apt.price || apt.amount || 0}€</td>
                    <td>${apt.paymentMethod || 'Espèces'}</td>
                    <td><span class="badge badge-success">Payé</span></td>
                    <td>
                        <button class="btn-action" onclick="adminCompleteSync.printReceipt('${apt._id}')">🖨️</button>
                        <button class="btn-action" onclick="adminCompleteSync.sendReceipt('${apt._id}')">📧</button>
                    </td>
                `;
                
                paymentsTable.appendChild(row);
            });
        
        // Mettre à jour les totaux
        this.updateElement('total-payments', `${this.statistics.validatedRevenue}€`);
        this.updateElement('pending-payments', `${this.statistics.pendingRevenue}€`);
    }

    // ========== ACTIONS ==========
    async validateAppointment(id) {
        if (!confirm('Valider ce rendez-vous ? Les points de fidélité seront attribués.')) return;
        
        try {
            // Mettre à jour localement d'abord
            const apt = this.appointments.find(a => a._id === id);
            if (apt) {
                apt.status = 'terminé';
                
                // Sauvegarder
                localStorage.setItem('allReservations', JSON.stringify(this.appointments));
                
                // Envoyer à l'API
                await fetch(`${this.apiUrl}/api/appointments/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                    },
                    body: JSON.stringify({ status: 'terminé' })
                });
                
                alert('✅ Rendez-vous validé ! Points de fidélité attribués.');
                this.loadAllData();
            }
        } catch (error) {
            console.error('Erreur validation:', error);
            alert('❌ Erreur lors de la validation');
        }
    }

    async cancelAppointment(id) {
        if (!confirm('Annuler ce rendez-vous ?')) return;
        
        try {
            // Mettre à jour localement
            const index = this.appointments.findIndex(a => a._id === id);
            if (index !== -1) {
                this.appointments[index].status = 'annulé';
                localStorage.setItem('allReservations', JSON.stringify(this.appointments));
                
                // Envoyer à l'API
                await fetch(`${this.apiUrl}/api/appointments/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                    },
                    body: JSON.stringify({ status: 'annulé' })
                });
                
                alert('❌ Rendez-vous annulé');
                this.loadAllData();
            }
        } catch (error) {
            console.error('Erreur annulation:', error);
        }
    }

    viewClientDetails(email) {
        const client = this.clients.get(email);
        if (!client) return;
        
        const details = `
=== FICHE CLIENT ===
Nom: ${client.name}
Email: ${client.email}
Téléphone: ${client.phone || 'N/A'}

=== STATISTIQUES ===
Nombre de visites: ${client.appointments.length}
Première visite: ${client.firstVisit.toLocaleDateString('fr-FR')}
Dernière visite: ${client.lastVisit.toLocaleDateString('fr-FR')}

=== FINANCIER ===
Total dépensé: ${client.totalSpent}€
En attente: ${client.pendingSpent}€
Points fidélité: ${client.loyaltyPoints} pts

=== HISTORIQUE ===
${client.appointments.map(apt => 
    `- ${new Date(apt.datetime || apt.date).toLocaleDateString('fr-FR')} : ${apt.service} (${apt.price || apt.amount}€)`
).join('\n')}
        `;
        
        alert(details);
    }

    calculateRewards(points) {
        // 100 points = 10€ de réduction
        const reductionValue = Math.floor(points / 100) * 10;
        return {
            available: reductionValue > 0 ? `${reductionValue}€ de réduction` : 'Aucune',
            points: points
        };
    }

    // ========== HELPERS ==========
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    switchTab(tabName) {
        // Masquer tous les contenus
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Afficher le contenu sélectionné
        const selectedContent = document.getElementById(`${tabName}-content`);
        if (selectedContent) {
            selectedContent.style.display = 'block';
        }
        
        // Mettre à jour les boutons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
        
        // Rafraîchir les données de l'onglet
        switch(tabName) {
            case 'dashboard': this.updateDashboard(); break;
            case 'calendar': this.updateCalendar(); break;
            case 'crm': this.updateCRM(); break;
            case 'validation': this.updateValidation(); break;
            case 'loyalty': this.updateLoyalty(); break;
            case 'payments': this.updatePayments(); break;
        }
    }

    // Autres méthodes d'action...
    sendClientMessage(email) {
        alert(`Envoi d'un message à ${email} (à implémenter avec service email)`);
    }

    addClientNote(email) {
        const note = prompt('Ajouter une note pour ce client:');
        if (note) {
            const client = this.clients.get(email);
            if (client) {
                client.notes += `\n[${new Date().toLocaleDateString('fr-FR')}] ${note}`;
                alert('Note ajoutée');
            }
        }
    }

    viewLoyaltyHistory(email) {
        const loyalty = this.loyaltyData.get(email);
        if (!loyalty) return;
        
        const history = loyalty.history.map(h => 
            `${h.date.toLocaleDateString('fr-FR')} : ${h.service} (+${h.points} pts)`
        ).join('\n');
        
        alert(`Historique fidélité:\n${history}\n\nTotal: ${loyalty.points} points`);
    }

    useReward(email) {
        const loyalty = this.loyaltyData.get(email);
        if (!loyalty || loyalty.points < 100) {
            alert('Points insuffisants (minimum 100 points)');
            return;
        }
        
        if (confirm(`Utiliser 100 points pour 10€ de réduction ?`)) {
            loyalty.points -= 100;
            alert('✅ Réduction appliquée !');
            this.updateLoyalty();
        }
    }

    printReceipt(id) {
        const apt = this.appointments.find(a => a._id === id);
        if (!apt) return;
        
        const receipt = `
LAIA SKIN INSTITUT
================
Date: ${new Date(apt.datetime || apt.date).toLocaleDateString('fr-FR')}
Client: ${apt.clientName || apt.client?.name}
Service: ${apt.service}
Montant: ${apt.price || apt.amount}€
Statut: PAYÉ

Merci de votre confiance !
        `;
        
        // Créer une fenêtre d'impression
        const printWindow = window.open('', '', 'width=400,height=600');
        printWindow.document.write('<pre>' + receipt + '</pre>');
        printWindow.print();
    }

    sendReceipt(id) {
        alert('Reçu envoyé par email (à implémenter avec service email)');
    }
}

// Créer l'instance globale
window.adminCompleteSync = new AdminCompleteSync();

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adminCompleteSync.init();
    });
} else {
    window.adminCompleteSync.init();
}