// ================================
// SYNCHRONISATION COMPLÈTE DU DASHBOARD
// ================================

(function() {
    console.log('📊 Initialisation de la synchronisation complète du Dashboard...');
    
    const API_URL = 'http://localhost:3001/api';
    let appointments = [];
    let clients = [];
    let stats = {
        todayCount: 0,
        todayRevenue: 0,
        weekCount: 0,
        weekRevenue: 0,
        monthRevenue: 0,
        pendingCount: 0,
        newClients: 0,
        fillRate: 0,
        nextAppointment: null
    };
    
    // Initialiser au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboard);
    } else {
        initDashboard();
    }
    
    function initDashboard() {
        // Vérifier qu'on est sur la page admin
        if (!window.location.pathname.includes('admin')) return;
        
        // Charger les données
        loadDashboardData();
        
        // Actualiser toutes les 30 secondes
        setInterval(loadDashboardData, 30000);
        
        // Écouter les changements d'onglets
        setupTabSync();
    }
    
    async function loadDashboardData() {
        const token = localStorage.getItem('token') || 'admin_admin';
        
        try {
            const response = await fetch(`${API_URL}/admin/appointments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                appointments = await response.json();
                console.log(`📊 ${appointments.length} rendez-vous chargés pour le dashboard`);
                
                calculateStats();
                updateDashboard();
                updateActivityTable();
            }
        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
        }
    }
    
    function calculateStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Lundi
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Calculer les statistiques
        stats.todayCount = appointments.filter(apt => {
            const aptDate = new Date(apt.datetime);
            return aptDate >= today && aptDate < tomorrow && apt.status === 'confirmé';
        }).length;
        
        stats.weekCount = appointments.filter(apt => {
            const aptDate = new Date(apt.datetime);
            return aptDate >= weekStart && aptDate < weekEnd && apt.status === 'confirmé';
        }).length;
        
        stats.pendingCount = appointments.filter(apt => 
            apt.status === 'en_attente' && new Date(apt.datetime) > today
        ).length;
        
        // Calculer le CA du mois
        stats.monthRevenue = appointments
            .filter(apt => {
                const aptDate = new Date(apt.datetime);
                return aptDate >= monthStart && aptDate <= monthEnd && 
                       (apt.status === 'confirmé' || apt.status === 'terminé');
            })
            .reduce((sum, apt) => sum + (apt.pricing?.servicePrice || 0), 0);
        
        // Compter les nouveaux clients (simulé - ceux avec peu de RDV)
        const clientCounts = {};
        appointments.forEach(apt => {
            const clientId = apt.client?._id || apt.client;
            clientCounts[clientId] = (clientCounts[clientId] || 0) + 1;
        });
        stats.newClients = Object.values(clientCounts).filter(count => count === 1).length;
    }
    
    function updateDashboard() {
        const dashboardSection = document.getElementById('dashboard');
        if (!dashboardSection || !dashboardSection.classList.contains('active')) return;
        
        // Mettre à jour les cartes de statistiques
        const cards = dashboardSection.querySelectorAll('.cards-grid .card');
        if (cards.length >= 4) {
            // RDV Aujourd'hui
            cards[0].querySelector('.value').textContent = stats.todayCount;
            cards[0].style.borderLeft = '4px solid #28a745';
            
            // Nouveaux Clients
            cards[1].querySelector('.value').textContent = stats.newClients;
            cards[1].style.borderLeft = '4px solid #17a2b8';
            
            // CA du Jour (approximatif)
            const todayRevenue = appointments
                .filter(apt => {
                    const aptDate = new Date(apt.datetime);
                    const today = new Date();
                    return aptDate.toDateString() === today.toDateString() && 
                           apt.status === 'confirmé';
                })
                .reduce((sum, apt) => sum + (apt.pricing?.servicePrice || 0), 0);
            cards[2].querySelector('.value').textContent = `${todayRevenue}€`;
            cards[2].style.borderLeft = '4px solid #ffc107';
            
            // En Attente
            cards[3].querySelector('.value').textContent = stats.pendingCount;
            cards[3].style.borderLeft = '4px solid #dc3545';
        }
        
        // Ajouter des statistiques supplémentaires
        let statsContainer = document.getElementById('dashboard-extra-stats');
        if (!statsContainer) {
            statsContainer = document.createElement('div');
            statsContainer.id = 'dashboard-extra-stats';
            statsContainer.style.cssText = 'margin-top: 2rem;';
            
            const cardsGrid = dashboardSection.querySelector('.cards-grid');
            if (cardsGrid && cardsGrid.parentNode) {
                cardsGrid.parentNode.insertBefore(statsContainer, cardsGrid.nextSibling);
            }
        }
        
        statsContainer.innerHTML = `
            <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); color: white; padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem;">
                <h3 style="margin: 0 0 1rem 0;">📈 Vue d'ensemble</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: rgba(255,255,255,0.2); border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold;">${stats.weekCount}</div>
                        <div>RDV cette semaine</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(255,255,255,0.2); border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold;">${stats.monthRevenue}€</div>
                        <div>CA du mois</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(255,255,255,0.2); border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold;">${appointments.length}</div>
                        <div>Total RDV</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function updateActivityTable() {
        const dashboardSection = document.getElementById('dashboard');
        if (!dashboardSection || !dashboardSection.classList.contains('active')) return;
        
        // Mettre à jour le tableau d'activité récente
        const tbody = dashboardSection.querySelector('table tbody');
        if (!tbody) return;
        
        // Filtrer les RDV du jour et à venir
        const recentAppointments = appointments
            .filter(apt => new Date(apt.datetime) >= new Date())
            .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
            .slice(0, 5);
        
        if (recentAppointments.length > 0) {
            tbody.innerHTML = recentAppointments.map(apt => {
                const time = new Date(apt.datetime).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const statusColor = apt.status === 'confirmé' ? '#28a745' : 
                                  apt.status === 'en_attente' ? '#ffc107' : '#dc3545';
                const statusIcon = apt.status === 'confirmé' ? '✅' : 
                                 apt.status === 'en_attente' ? '⏳' : '❌';
                
                return `
                    <tr style="cursor: pointer;" onclick="showAppointmentDetails('${apt._id}')">
                        <td>${time}</td>
                        <td>${apt.client?.name || 'Client'}</td>
                        <td>${apt.service?.name || 'Service'}</td>
                        <td style="color: ${statusColor};">${statusIcon} ${apt.status}</td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #999;">
                        Aucune activité récente
                    </td>
                </tr>
            `;
        }
    }
    
    function setupTabSync() {
        // Synchroniser avec les changements d'onglets
        document.querySelectorAll('.menu-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.textContent.trim();
                
                // Si on revient sur le Dashboard, actualiser
                if (tabName.includes('Dashboard')) {
                    setTimeout(() => {
                        loadDashboardData();
                    }, 100);
                }
                
                // Si on va sur Planning, synchroniser le calendrier
                if (tabName.includes('Planning')) {
                    syncWithCalendar();
                }
                
                // Si on va sur Réservations, synchroniser
                if (tabName.includes('Réservations')) {
                    syncWithReservations();
                }
            });
        });
    }
    
    function syncWithCalendar() {
        // Envoyer les données au calendrier
        if (window.appointments !== appointments) {
            window.appointments = appointments;
            console.log('📅 Synchronisation avec le calendrier');
            
            // Déclencher une mise à jour du calendrier si la fonction existe
            if (typeof window.renderCalendar === 'function') {
                window.renderCalendar();
            }
        }
    }
    
    function syncWithReservations() {
        // Mettre à jour la section réservations
        const upcomingContainer = document.getElementById('upcoming-reservations');
        if (upcomingContainer) {
            const upcoming = appointments
                .filter(apt => new Date(apt.datetime) > new Date() && apt.status === 'confirmé')
                .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
                .slice(0, 10);
            
            console.log('📋 Synchronisation avec les réservations');
            
            // Réutiliser la fonction de sync-reservations.js si elle existe
            if (typeof window.updateAdminDashboard === 'function') {
                window.updateAdminDashboard(appointments);
            }
        }
    }
    
    // Fonction globale pour afficher les détails d'un RDV
    window.showAppointmentDetails = function(appointmentId) {
        const apt = appointments.find(a => a._id === appointmentId);
        if (!apt) return;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const statusColor = apt.status === 'confirmé' ? '#28a745' : 
                          apt.status === 'en_attente' ? '#ffc107' : '#dc3545';
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 10px; max-width: 500px; width: 90%;">
                <h3 style="color: #d4b5a0; margin-bottom: 1rem;">
                    📅 Détails du Rendez-vous
                </h3>
                
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Client:</strong>
                        <span>${apt.client?.name || 'Non spécifié'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Service:</strong>
                        <span>${apt.service?.name || 'Non spécifié'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Date:</strong>
                        <span>${new Date(apt.datetime).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Heure:</strong>
                        <span>${new Date(apt.datetime).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Durée:</strong>
                        <span>${apt.duration || 60} minutes</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Prix:</strong>
                        <span style="color: #28a745; font-weight: bold;">${apt.pricing?.servicePrice || 0}€</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <strong>Statut:</strong>
                        <span style="background: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.875rem;">
                            ${apt.status}
                        </span>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="padding: 0.5rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Fermer
                    </button>
                    ${apt.status === 'en_attente' ? `
                        <button onclick="confirmAppointmentFromDashboard('${apt._id}')" 
                                style="padding: 0.5rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Confirmer
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        };
    };
    
    window.confirmAppointmentFromDashboard = async function(appointmentId) {
        const token = localStorage.getItem('token') || 'admin_admin';
        
        try {
            const response = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'confirmé' })
            });
            
            if (response.ok) {
                alert('✅ Rendez-vous confirmé !');
                document.querySelector('[onclick*="remove"]').click(); // Fermer le modal
                loadDashboardData(); // Recharger les données
            }
        } catch (error) {
            console.error('Erreur confirmation:', error);
            alert('Erreur lors de la confirmation');
        }
    };
    
    // Ajouter un indicateur de synchronisation
    function addSyncBadge() {
        const dashboardTitle = document.querySelector('#dashboard h2');
        if (dashboardTitle && !document.getElementById('sync-badge')) {
            const badge = document.createElement('span');
            badge.id = 'sync-badge';
            badge.style.cssText = `
                margin-left: 1rem;
                background: #28a745;
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: 15px;
                font-size: 0.75rem;
                animation: pulse 2s infinite;
            `;
            badge.innerHTML = '🔄 Synchronisé';
            dashboardTitle.appendChild(badge);
        }
    }
    
    // Ajouter le badge au chargement
    setTimeout(addSyncBadge, 1000);
    
    console.log('✅ Synchronisation Dashboard activée !');
})();