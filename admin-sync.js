// Synchronisation des données pour le dashboard admin
// Ce script récupère les réservations et met à jour tous les onglets

class AdminDashboardSync {
    constructor() {
        this.apiUrl = window.API_CONFIG ? window.API_CONFIG.baseURL : 'https://laia-skin-api.onrender.com';
        this.appointments = [];
        this.clients = new Map();
        this.statistics = {
            totalReservations: 0,
            totalRevenue: 0,
            newClients: 0,
            returningClients: 0,
            servicesCount: {},
            monthlyRevenue: 0
        };
    }

    // Initialiser la synchronisation
    async init() {
        console.log('🔄 Initialisation du dashboard admin...');
        
        // Charger les données
        await this.loadAllData();
        
        // Mettre à jour l'interface
        this.updateDashboard();
        
        // Actualiser toutes les 30 secondes
        setInterval(() => this.loadAllData(), 30000);
    }

    // Charger toutes les données depuis l'API
    async loadAllData() {
        try {
            const response = await fetch(`${this.apiUrl}/api/admin/appointments`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || 'admin-token'}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.appointments = data.appointments || [];
                
                // Traiter les données
                this.processAppointments();
                
                // Mettre à jour l'interface
                this.updateDashboard();
                
                console.log(`✅ ${this.appointments.length} réservations chargées`);
            }
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
            // Utiliser les données locales en fallback
            this.loadFromLocalStorage();
        }
    }

    // Charger depuis localStorage en cas d'erreur
    loadFromLocalStorage() {
        const localData = localStorage.getItem('allReservations');
        if (localData) {
            this.appointments = JSON.parse(localData);
            this.processAppointments();
            this.updateDashboard();
        }
    }

    // Traiter les réservations pour extraire les statistiques
    processAppointments() {
        // Réinitialiser
        this.clients.clear();
        this.statistics = {
            totalReservations: this.appointments.length,
            totalRevenue: 0,
            newClients: 0,
            returningClients: 0,
            servicesCount: {},
            monthlyRevenue: 0
        };

        const currentMonth = new Date().getMonth();
        const clientAppointments = {};

        this.appointments.forEach(apt => {
            // Extraire les infos client
            const clientEmail = apt.email || apt.client?.email || 'unknown';
            const clientName = apt.clientName || apt.client?.name || 'Client';
            const clientPhone = apt.phone || apt.client?.phone || '';
            
            // Créer ou mettre à jour le client
            if (!this.clients.has(clientEmail)) {
                this.clients.set(clientEmail, {
                    email: clientEmail,
                    name: clientName,
                    phone: clientPhone,
                    appointments: [],
                    totalSpent: 0,
                    lastVisit: null
                });
            }
            
            const client = this.clients.get(clientEmail);
            client.appointments.push(apt);
            
            // Calculer les revenus
            const price = apt.price || apt.amount || 0;
            this.statistics.totalRevenue += price;
            client.totalSpent += price;
            
            // Mise à jour dernière visite
            const aptDate = new Date(apt.date || apt.datetime);
            if (!client.lastVisit || aptDate > client.lastVisit) {
                client.lastVisit = aptDate;
            }
            
            // Revenus du mois
            if (aptDate.getMonth() === currentMonth) {
                this.statistics.monthlyRevenue += price;
            }
            
            // Compter les services
            const serviceName = apt.service || 'Service';
            this.statistics.servicesCount[serviceName] = (this.statistics.servicesCount[serviceName] || 0) + 1;
            
            // Compter les visites par client
            clientAppointments[clientEmail] = (clientAppointments[clientEmail] || 0) + 1;
        });

        // Calculer nouveaux vs anciens clients
        Object.values(clientAppointments).forEach(count => {
            if (count === 1) {
                this.statistics.newClients++;
            } else {
                this.statistics.returningClients++;
            }
        });
    }

    // Mettre à jour le dashboard
    updateDashboard() {
        // Mettre à jour l'onglet Tableau de bord
        this.updateStatistics();
        
        // Mettre à jour l'onglet Réservations
        this.updateReservationsTable();
        
        // Mettre à jour l'onglet Clients
        this.updateClientsTable();
        
        // Mettre à jour les graphiques si présents
        this.updateCharts();
    }

    // Mettre à jour les statistiques
    updateStatistics() {
        // Cartes statistiques
        const updateCard = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        updateCard('totalReservations', this.appointments.length);
        updateCard('totalRevenue', `${this.statistics.totalRevenue}€`);
        updateCard('totalClients', this.clients.size);
        updateCard('monthlyRevenue', `${this.statistics.monthlyRevenue}€`);
        updateCard('newClients', this.statistics.newClients);
        updateCard('returningClients', this.statistics.returningClients);

        // Service le plus populaire
        const popularService = Object.entries(this.statistics.servicesCount)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (popularService) {
            const element = document.getElementById('popularService');
            if (element) element.textContent = `${popularService[0]} (${popularService[1]} réservations)`;
        }
    }

    // Mettre à jour le tableau des réservations
    updateReservationsTable() {
        const tableBody = document.querySelector('#reservations-table tbody, .reservations-list tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        
        // Trier par date décroissante
        const sortedAppointments = [...this.appointments].sort((a, b) => {
            const dateA = new Date(a.datetime || a.date);
            const dateB = new Date(b.datetime || b.date);
            return dateB - dateA;
        });

        sortedAppointments.forEach(apt => {
            const row = document.createElement('tr');
            const date = new Date(apt.datetime || apt.date);
            const dateStr = date.toLocaleDateString('fr-FR');
            const timeStr = apt.time || date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            
            row.innerHTML = `
                <td>${dateStr}</td>
                <td>${timeStr}</td>
                <td>${apt.clientName || apt.client?.name || 'Client'}</td>
                <td>${apt.service || 'Service'}</td>
                <td>${apt.price || apt.amount || 0}€</td>
                <td>
                    <span class="badge ${apt.status === 'confirmé' ? 'badge-success' : 'badge-warning'}">
                        ${apt.status || 'confirmé'}
                    </span>
                </td>
                <td>
                    <button class="btn-action" onclick="adminSync.viewAppointment('${apt._id}')">👁️</button>
                    <button class="btn-action" onclick="adminSync.validateAppointment('${apt._id}')">✅</button>
                    <button class="btn-action btn-danger" onclick="adminSync.cancelAppointment('${apt._id}')">❌</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    // Mettre à jour le tableau des clients
    updateClientsTable() {
        const tableBody = document.querySelector('#clients-table tbody, .clients-list tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        
        // Convertir Map en Array et trier par dépenses
        const sortedClients = Array.from(this.clients.values())
            .sort((a, b) => b.totalSpent - a.totalSpent);

        sortedClients.forEach(client => {
            const row = document.createElement('tr');
            const lastVisitStr = client.lastVisit 
                ? client.lastVisit.toLocaleDateString('fr-FR')
                : 'N/A';
            
            row.innerHTML = `
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td>${client.phone || 'N/A'}</td>
                <td>${client.appointments.length}</td>
                <td>${client.totalSpent}€</td>
                <td>${lastVisitStr}</td>
                <td>
                    <button class="btn-action" onclick="adminSync.viewClient('${client.email}')">👁️</button>
                    <button class="btn-action" onclick="adminSync.sendMessage('${client.email}')">📧</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    // Mettre à jour les graphiques
    updateCharts() {
        // Si vous avez des graphiques (Chart.js par exemple)
        // Mettez-les à jour ici
    }

    // Actions sur les réservations
    async validateAppointment(id) {
        if (confirm('Valider cette réservation ?')) {
            try {
                const response = await fetch(`${this.apiUrl}/api/appointments/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                    },
                    body: JSON.stringify({ status: 'terminé' })
                });

                if (response.ok) {
                    alert('✅ Réservation validée');
                    this.loadAllData();
                }
            } catch (error) {
                console.error('Erreur validation:', error);
            }
        }
    }

    async cancelAppointment(id) {
        if (confirm('Annuler cette réservation ?')) {
            try {
                const response = await fetch(`${this.apiUrl}/api/appointments/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                    }
                });

                if (response.ok) {
                    alert('❌ Réservation annulée');
                    this.loadAllData();
                }
            } catch (error) {
                console.error('Erreur annulation:', error);
            }
        }
    }

    viewAppointment(id) {
        const apt = this.appointments.find(a => a._id === id);
        if (apt) {
            alert(`
Réservation ${apt._id}
Client: ${apt.clientName || apt.client?.name}
Service: ${apt.service}
Date: ${apt.date || apt.datetime}
Prix: ${apt.price || apt.amount}€
Status: ${apt.status}
            `);
        }
    }

    viewClient(email) {
        const client = this.clients.get(email);
        if (client) {
            alert(`
Client: ${client.name}
Email: ${client.email}
Téléphone: ${client.phone || 'N/A'}
Nombre de visites: ${client.appointments.length}
Total dépensé: ${client.totalSpent}€
            `);
        }
    }

    sendMessage(email) {
        alert(`Envoi d'un message à ${email} (fonctionnalité à implémenter)`);
    }
}

// Créer une instance globale
window.adminSync = new AdminDashboardSync();

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adminSync.init();
    });
} else {
    window.adminSync.init();
}