// Synchronisation du tableau des réservations
console.log('📊 Sync Reservations Table chargé');

// Fonction pour rafraîchir le tableau des réservations
window.refreshReservationsTable = function(force = false) {
    console.log('🔄 [TABLE] Rafraîchissement du tableau des réservations...');
    
    try {
        // Récupérer toutes les réservations
        const allReservations = getAllReservationsFromSources();
        console.log(`📋 [TABLE] ${allReservations.length} réservations trouvées`);
        
        // Mettre à jour le tableau dans l'onglet Réservations
        updateReservationsDisplay(allReservations);
        
        // Mettre à jour les compteurs
        updateReservationCounters(allReservations);
        
        // Sauvegarder dans localStorage
        localStorage.setItem('allReservations', JSON.stringify(allReservations));
        localStorage.setItem('lastTableUpdate', Date.now().toString());
        
        console.log('✅ [TABLE] Tableau des réservations mis à jour');
        return allReservations.length;
        
    } catch (error) {
        console.error('❌ [TABLE] Erreur rafraîchissement:', error);
        return 0;
    }
};

// Récupérer toutes les réservations depuis toutes les sources
function getAllReservationsFromSources() {
    let allReservations = [];
    
    // Source 1: localStorage modernCalendarAppointments
    try {
        const calendarData = localStorage.getItem('modernCalendarAppointments');
        if (calendarData) {
            const calendarReservations = JSON.parse(calendarData);
            allReservations = allReservations.concat(calendarReservations);
            console.log(`📅 [SOURCES] ${calendarReservations.length} depuis calendrier`);
        }
    } catch (e) {
        console.warn('⚠️ [SOURCES] Erreur lecture calendrier:', e);
    }
    
    // Source 2: localStorage allReservations
    try {
        const reservationsData = localStorage.getItem('allReservations');
        if (reservationsData) {
            const existingReservations = JSON.parse(reservationsData);
            // Éviter les doublons par ID
            existingReservations.forEach(res => {
                if (!allReservations.find(r => r._id === res._id)) {
                    allReservations.push(res);
                }
            });
            console.log(`📊 [SOURCES] ${existingReservations.length} depuis réservations existantes`);
        }
    } catch (e) {
        console.warn('⚠️ [SOURCES] Erreur lecture réservations:', e);
    }
    
    // Dédoublonner et nettoyer
    const uniqueReservations = removeDuplicateReservations(allReservations);
    console.log(`🔧 [SOURCES] ${uniqueReservations.length} réservations uniques après déduplication`);
    
    // Trier par date
    uniqueReservations.sort((a, b) => {
        const dateA = new Date(a.datetime || a.date);
        const dateB = new Date(b.datetime || b.date);
        return dateB - dateA; // Plus récent en premier
    });
    
    return uniqueReservations;
}

// Supprimer les doublons
function removeDuplicateReservations(reservations) {
    const seen = new Set();
    return reservations.filter(res => {
        // Clé unique basée sur client, date et heure
        const key = `${res.client || ''}:${res.datetime || res.date}:${res.time || ''}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

// Mettre à jour l'affichage du tableau des réservations
function updateReservationsDisplay(reservations) {
    // Chercher le tableau des réservations
    const tableBody = document.querySelector('#reservations-table tbody') || 
                     document.querySelector('.reservations-table tbody') ||
                     document.querySelector('#all-reservations-table tbody');
    
    if (!tableBody) {
        console.warn('⚠️ [TABLE] Tableau des réservations non trouvé');
        // Créer le tableau s'il n'existe pas
        createReservationsTable(reservations);
        return;
    }
    
    console.log('📊 [TABLE] Mise à jour du tableau existant');
    
    // Vider le tableau
    tableBody.innerHTML = '';
    
    // Ajouter chaque réservation
    reservations.forEach((res, index) => {
        const row = createReservationRow(res, index);
        tableBody.appendChild(row);
    });
}

// Créer une ligne du tableau pour une réservation
function createReservationRow(reservation, index) {
    const row = document.createElement('tr');
    row.style.cssText = 'border-bottom: 1px solid #e9ecef; transition: background-color 0.2s ease;';
    
    const date = new Date(reservation.datetime || reservation.date);
    const formattedDate = date.toLocaleDateString('fr-FR');
    const formattedTime = reservation.time || date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    const serviceName = getServiceDisplayName(reservation.service);
    const statusBadge = getStatusBadge(reservation.status);
    const originBadge = getOriginBadge(reservation.origine || reservation.source);
    
    row.innerHTML = `
        <td style="padding: 1rem; font-weight: 500;">${index + 1}</td>
        <td style="padding: 1rem;">
            <div style="font-weight: 600; color: #2c3e50;">${reservation.client || 'Client non défini'}</div>
            <div style="font-size: 0.9rem; color: #6c757d;">${reservation.phone || ''}</div>
        </td>
        <td style="padding: 1rem;">
            <div style="font-weight: 500;">${serviceName}</div>
            <div style="font-size: 0.9rem; color: #6c757d;">${getServiceDuration(reservation.service)}min</div>
        </td>
        <td style="padding: 1rem;">
            <div style="font-weight: 500;">${formattedDate}</div>
            <div style="font-size: 0.9rem; color: #6c757d;">${formattedTime}</div>
        </td>
        <td style="padding: 1rem;">${statusBadge}</td>
        <td style="padding: 1rem;">${originBadge}</td>
        <td style="padding: 1rem;">
            <button onclick="viewReservationDetails('${reservation._id || reservation.id}')" style="background: #17a2b8; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; margin-right: 0.5rem;">
                👁️ Voir
            </button>
            <button onclick="editReservation('${reservation._id || reservation.id}')" style="background: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; margin-right: 0.5rem;">
                ✏️ Modifier
            </button>
            <button onclick="deleteReservation('${reservation._id || reservation.id}')" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">
                🗑️ Supprimer
            </button>
        </td>
    `;
    
    // Hover effect
    row.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#f8f9fa';
    });
    
    row.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
    
    return row;
}

// Créer le tableau des réservations s'il n'existe pas
function createReservationsTable(reservations) {
    console.log('🔧 [TABLE] Création du tableau des réservations');
    
    const reservationsTab = document.querySelector('#reservations-content') || 
                           document.querySelector('.reservations-tab') ||
                           document.querySelector('[data-tab="reservations"]');
    
    if (!reservationsTab) {
        console.error('❌ [TABLE] Onglet réservations non trouvé');
        return;
    }
    
    const tableContainer = document.createElement('div');
    tableContainer.style.cssText = 'margin-top: 2rem; overflow-x: auto;';
    
    tableContainer.innerHTML = `
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
            <h3 style="color: #2c3e50; margin: 0;">📊 Toutes les Réservations (${reservations.length})</h3>
            <button onclick="refreshReservationsTable(true)" style="background: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">
                🔄 Actualiser
            </button>
        </div>
        <table id="all-reservations-table" style="width: 100%; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <thead style="background: linear-gradient(135deg, #D4AF37, #B8860B); color: white;">
                <tr>
                    <th style="padding: 1rem; text-align: left;">#</th>
                    <th style="padding: 1rem; text-align: left;">Client</th>
                    <th style="padding: 1rem; text-align: left;">Service</th>
                    <th style="padding: 1rem; text-align: left;">Date & Heure</th>
                    <th style="padding: 1rem; text-align: left;">Statut</th>
                    <th style="padding: 1rem; text-align: left;">Origine</th>
                    <th style="padding: 1rem; text-align: left;">Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    
    reservationsTab.appendChild(tableContainer);
    
    // Remplir le tableau
    updateReservationsDisplay(reservations);
}

// Fonctions utilitaires pour l'affichage
function getServiceDisplayName(service) {
    if (typeof service === 'object' && service.name) {
        return service.name;
    } else if (typeof service === 'string') {
        return service;
    }
    return 'Service non défini';
}

function getServiceDuration(service) {
    const durations = {
        'Hydro\'Cleaning': 60,
        'Renaissance': 60,
        'LED Thérapie': 45,
        'BB Glow': 60,
        'Hydro\'Naissance': 90
    };
    
    const serviceName = getServiceDisplayName(service);
    return durations[serviceName] || 60;
}

function getStatusBadge(status) {
    const statusConfig = {
        'confirmé': { bg: '#28a745', text: 'Confirmé', icon: '✅' },
        'confirmed': { bg: '#28a745', text: 'Confirmé', icon: '✅' },
        'en_attente': { bg: '#ffc107', text: 'En attente', icon: '⏳' },
        'pending': { bg: '#ffc107', text: 'En attente', icon: '⏳' },
        'annulé': { bg: '#dc3545', text: 'Annulé', icon: '❌' },
        'cancelled': { bg: '#dc3545', text: 'Annulé', icon: '❌' }
    };
    
    const config = statusConfig[status] || statusConfig['confirmé'];
    return `<span style="background: ${config.bg}; color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; font-weight: 600;">${config.icon} ${config.text}</span>`;
}

function getOriginBadge(origin) {
    const originConfig = {
        'Site internet': { bg: '#17a2b8', icon: '🌐' },
        'Admin': { bg: '#6c757d', icon: '👨‍💼' },
        'planning': { bg: '#6f42c1', icon: '📅' },
        'reservations': { bg: '#fd7e14', icon: '📋' }
    };
    
    const config = originConfig[origin] || { bg: '#6c757d', icon: '❓' };
    return `<span style="background: ${config.bg}; color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; font-weight: 600;">${config.icon} ${origin || 'Non défini'}</span>`;
}

// Mettre à jour les compteurs
function updateReservationCounters(reservations) {
    const counters = {
        total: reservations.length,
        confirmed: reservations.filter(r => r.status === 'confirmé' || r.status === 'confirmed').length,
        pending: reservations.filter(r => r.status === 'en_attente' || r.status === 'pending').length,
        web: reservations.filter(r => r.origine === 'Site internet' || r.source === 'Homepage').length
    };
    
    // Mettre à jour les éléments de compteur s'ils existent
    Object.keys(counters).forEach(key => {
        const element = document.getElementById(`${key}-count`);
        if (element) {
            element.textContent = counters[key];
        }
    });
    
    console.log('📊 [COUNTERS] Compteurs mis à jour:', counters);
}

// Actions sur les réservations
window.viewReservationDetails = function(reservationId) {
    console.log('👁️ [ACTION] Voir détails:', reservationId);
    
    // Trouver la réservation
    const reservations = getAllReservationsFromSources();
    const reservation = reservations.find(r => r._id === reservationId || r.id === reservationId);
    
    if (reservation && typeof window.showAppointmentDetails === 'function') {
        window.showAppointmentDetails(reservation);
    } else {
        alert('Réservation non trouvée');
    }
};

window.editReservation = function(reservationId) {
    console.log('✏️ [ACTION] Modifier:', reservationId);
    alert('Fonction de modification à implémenter');
};

window.deleteReservation = function(reservationId) {
    console.log('🗑️ [ACTION] Supprimer:', reservationId);
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
        // Supprimer de toutes les sources
        ['modernCalendarAppointments', 'allReservations'].forEach(storageKey => {
            try {
                const data = localStorage.getItem(storageKey);
                if (data) {
                    const items = JSON.parse(data);
                    const filtered = items.filter(item => item._id !== reservationId && item.id !== reservationId);
                    localStorage.setItem(storageKey, JSON.stringify(filtered));
                }
            } catch (e) {}
        });
        
        // Rafraîchir l'affichage
        refreshReservationsTable(true);
        
        // Rafraîchir le calendrier
        if (typeof window.renderCurrentView === 'function') {
            window.renderCurrentView();
        }
        
        alert('✅ Réservation supprimée');
    }
};

// Auto-initialisation et synchronisation
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🚀 [INIT] Initialisation synchronisation tableau...');
        refreshReservationsTable();
        
        // Synchronisation automatique toutes les 30 secondes
        setInterval(() => {
            const lastUpdate = localStorage.getItem('lastTableUpdate');
            const now = Date.now();
            
            // Vérifier s'il y a eu des modifications
            if (!lastUpdate || (now - parseInt(lastUpdate)) > 30000) {
                console.log('🔄 [AUTO] Synchronisation automatique...');
                refreshReservationsTable();
            }
        }, 30000);
    }, 2000);
});

// Écouter les événements de nouvelles réservations
window.addEventListener('newAppointmentCreated', function(e) {
    console.log('🔔 [EVENT] Nouvelle réservation détectée, rafraîchissement...');
    setTimeout(() => refreshReservationsTable(true), 500);
});

console.log('✅ [TABLE] Sync Reservations Table prêt');
console.log('🎮 [TABLE] Fonction disponible: window.refreshReservationsTable()');