// Système de synchronisation centralisé pour LAIA SKIN INSTITUT
// Ce fichier unifie toutes les réservations et synchronise l'admin dashboard

class SyncManager {
    constructor() {
        this.apiBaseUrl = '';
        this.syncInterval = null;
        this.lastSync = Date.now();
        this.callbacks = [];
        this.debug = true;
    }

    log(message, type = 'info') {
        if (this.debug) {
            const timestamp = new Date().toLocaleTimeString('fr-FR');
            const emoji = {
                'info': '📘',
                'success': '✅',
                'error': '❌',
                'warning': '⚠️',
                'sync': '🔄'
            }[type] || '📘';
            console.log(`[${timestamp}] ${emoji} [SyncManager] ${message}`);
        }
    }

    // Initialiser le système de synchronisation
    init() {
        this.log('Initialisation du système de synchronisation', 'info');
        
        // Écouter les événements de stockage local
        window.addEventListener('storage', (e) => {
            if (e.key && (e.key.includes('appointment') || e.key.includes('reservation') || e.key.includes('booking'))) {
                this.log(`Changement détecté: ${e.key}`, 'sync');
                this.syncFromLocalStorage();
            }
        });

        // Écouter les événements personnalisés
        window.addEventListener('newBooking', (e) => {
            this.log('Nouvelle réservation détectée', 'sync');
            this.handleNewBooking(e.detail);
        });

        // Démarrer la synchronisation périodique
        this.startPeriodicSync();
        
        // Synchronisation initiale
        this.syncAll();
    }

    // Créer une réservation unifiée depuis n'importe quelle source
    async createBooking(bookingData, source = 'website') {
        this.log(`Création de réservation depuis: ${source}`, 'info');
        
        try {
            // Normaliser les données de réservation
            const normalizedData = this.normalizeBookingData(bookingData, source);
            
            // Sauvegarder dans MongoDB via API
            const response = await fetch(`${window.API_CONFIG ? window.API_CONFIG.baseURL : 'https://laia-skin-api.onrender.com'}/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                },
                body: JSON.stringify(normalizedData)
            });

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }

            const result = await response.json();
            this.log(`Réservation créée avec succès: ${result._id}`, 'success');
            
            // Sauvegarder dans localStorage pour backup
            this.saveToLocalStorage(result);
            
            // Notifier tous les composants
            this.notifyAllComponents(result, 'new');
            
            // Déclencher la synchronisation
            this.triggerSync();
            
            return result;
            
        } catch (error) {
            this.log(`Erreur création réservation: ${error.message}`, 'error');
            
            // Fallback: sauvegarder localement si l'API échoue
            const localBooking = this.saveLocalBooking(normalizedData);
            this.notifyAllComponents(localBooking, 'new-local');
            
            return localBooking;
        }
    }

    // Normaliser les données de réservation depuis différentes sources
    normalizeBookingData(data, source) {
        const normalized = {
            datetime: data.datetime || data.date || new Date().toISOString(),
            client: {
                name: data.clientName || data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                email: data.email || data.clientEmail || '',
                phone: data.phone || data.phoneNumber || data.clientPhone || ''
            },
            service: data.service || data.serviceName || {
                name: data.serviceName || 'Service non spécifié',
                price: data.price || 0,
                duration: data.duration || 60
            },
            status: data.status || 'confirmé',
            origine: source,
            paymentMethod: data.paymentMethod || 'cash',
            notes: data.notes || '',
            createdAt: new Date().toISOString(),
            syncStatus: 'pending'
        };

        // Ajouter les champs spécifiques selon la source
        if (source === 'admin') {
            normalized.createdBy = 'admin';
        } else if (source === 'client-space') {
            normalized.clientId = data.clientId || localStorage.getItem('clientId');
        }

        return normalized;
    }

    // Sauvegarder dans localStorage
    saveToLocalStorage(booking) {
        try {
            // Récupérer toutes les réservations existantes
            const allBookings = JSON.parse(localStorage.getItem('allReservations') || '[]');
            
            // Éviter les doublons
            const exists = allBookings.find(b => b._id === booking._id);
            if (!exists) {
                allBookings.push(booking);
                localStorage.setItem('allReservations', JSON.stringify(allBookings));
                
                // Mettre à jour les timestamps
                localStorage.setItem('lastBookingUpdate', Date.now().toString());
                localStorage.setItem('laia-calendar-update', Date.now().toString());
                localStorage.setItem('laia-new-booking', JSON.stringify(booking));
            }
            
            this.log('Sauvegardé dans localStorage', 'success');
        } catch (error) {
            this.log(`Erreur localStorage: ${error.message}`, 'error');
        }
    }

    // Sauvegarder localement en cas d'échec API
    saveLocalBooking(bookingData) {
        const localBooking = {
            ...bookingData,
            _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isLocal: true,
            syncStatus: 'pending'
        };

        const pendingBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
        pendingBookings.push(localBooking);
        localStorage.setItem('pendingBookings', JSON.stringify(pendingBookings));
        
        this.saveToLocalStorage(localBooking);
        
        return localBooking;
    }

    // Notifier tous les composants de l'application
    notifyAllComponents(booking, action = 'update') {
        this.log(`Notification: ${action} pour tous les composants`, 'sync');
        
        // Déclencher un événement personnalisé
        const event = new CustomEvent('bookingUpdate', {
            detail: {
                booking,
                action,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);

        // Mettre à jour les indicateurs localStorage pour déclencher les listeners
        localStorage.setItem('sync-trigger', Date.now().toString());
        
        // Exécuter les callbacks enregistrés
        this.callbacks.forEach(callback => {
            try {
                callback(booking, action);
            } catch (error) {
                this.log(`Erreur callback: ${error.message}`, 'error');
            }
        });
    }

    // Synchroniser depuis localStorage
    syncFromLocalStorage() {
        try {
            const allBookings = JSON.parse(localStorage.getItem('allReservations') || '[]');
            const pendingBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
            
            // Synchroniser les réservations en attente
            pendingBookings.forEach(booking => {
                if (booking.syncStatus === 'pending') {
                    this.syncPendingBooking(booking);
                }
            });
            
            this.log(`Synchronisé ${allBookings.length} réservations depuis localStorage`, 'sync');
            
        } catch (error) {
            this.log(`Erreur sync localStorage: ${error.message}`, 'error');
        }
    }

    // Synchroniser une réservation en attente
    async syncPendingBooking(booking) {
        try {
            const response = await fetch(`${window.API_CONFIG ? window.API_CONFIG.baseURL : 'https://laia-skin-api.onrender.com'}/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                },
                body: JSON.stringify(booking)
            });

            if (response.ok) {
                const result = await response.json();
                
                // Mettre à jour le statut
                this.updatePendingBookingStatus(booking._id, 'synced', result._id);
                this.log(`Réservation locale synchronisée: ${booking._id}`, 'success');
                
                // Notifier
                this.notifyAllComponents(result, 'synced');
            }
        } catch (error) {
            this.log(`Échec sync réservation ${booking._id}: ${error.message}`, 'error');
        }
    }

    // Mettre à jour le statut d'une réservation en attente
    updatePendingBookingStatus(localId, status, serverId = null) {
        const pendingBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
        const index = pendingBookings.findIndex(b => b._id === localId);
        
        if (index !== -1) {
            if (status === 'synced' && serverId) {
                // Remplacer l'ID local par l'ID serveur
                pendingBookings[index]._id = serverId;
                pendingBookings[index].syncStatus = 'synced';
                pendingBookings[index].isLocal = false;
                
                // Mettre à jour aussi dans allReservations
                const allBookings = JSON.parse(localStorage.getItem('allReservations') || '[]');
                const bookingIndex = allBookings.findIndex(b => b._id === localId);
                if (bookingIndex !== -1) {
                    allBookings[bookingIndex] = pendingBookings[index];
                    localStorage.setItem('allReservations', JSON.stringify(allBookings));
                }
                
                // Supprimer de pending si synchronisé
                pendingBookings.splice(index, 1);
            } else {
                pendingBookings[index].syncStatus = status;
            }
            
            localStorage.setItem('pendingBookings', JSON.stringify(pendingBookings));
        }
    }

    // Synchroniser toutes les données
    async syncAll() {
        this.log('Synchronisation complète démarrée', 'sync');
        
        try {
            // Récupérer toutes les réservations depuis l'API
            const apiUrl = window.API_CONFIG ? window.API_CONFIG.baseURL : 'https://laia-skin-api.onrender.com';
            const response = await fetch(`${apiUrl}/api/admin/appointments`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || 'default-admin-token'}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const appointments = data.appointments || [];
                
                // Sauvegarder dans localStorage
                localStorage.setItem('allReservations', JSON.stringify(appointments));
                localStorage.setItem('lastFullSync', Date.now().toString());
                
                this.log(`Synchronisé ${appointments.length} réservations depuis le serveur`, 'success');
                
                // Notifier tous les composants
                this.notifyAllComponents(appointments, 'full-sync');
                
                // Synchroniser les réservations locales en attente
                this.syncFromLocalStorage();
                
                return appointments;
            }
        } catch (error) {
            this.log(`Erreur sync complète: ${error.message}`, 'error');
            
            // Utiliser les données locales en fallback
            return JSON.parse(localStorage.getItem('allReservations') || '[]');
        }
    }

    // Déclencher une synchronisation
    triggerSync() {
        this.log('Déclenchement synchronisation', 'sync');
        
        // Notifier via localStorage
        localStorage.setItem('laia-sync-trigger', Date.now().toString());
        
        // Synchroniser immédiatement
        this.syncAll();
    }

    // Démarrer la synchronisation périodique
    startPeriodicSync(interval = 5000) {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            this.syncAll();
        }, interval);
        
        this.log(`Synchronisation périodique démarrée (${interval}ms)`, 'info');
    }

    // Arrêter la synchronisation périodique
    stopPeriodicSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            this.log('Synchronisation périodique arrêtée', 'info');
        }
    }

    // Enregistrer un callback pour les mises à jour
    onUpdate(callback) {
        this.callbacks.push(callback);
        this.log('Nouveau callback enregistré', 'info');
    }

    // Obtenir toutes les réservations (avec cache)
    async getAllBookings(forceRefresh = false) {
        if (!forceRefresh) {
            // Utiliser le cache si récent (moins de 10 secondes)
            const lastSync = parseInt(localStorage.getItem('lastFullSync') || '0');
            if (Date.now() - lastSync < 10000) {
                return JSON.parse(localStorage.getItem('allReservations') || '[]');
            }
        }
        
        return await this.syncAll();
    }

    // Obtenir les créneaux occupés
    async getOccupiedSlots() {
        try {
            const response = await fetch(`${window.API_CONFIG ? window.API_CONFIG.baseURL : 'https://laia-skin-api.onrender.com'}/api/appointments/occupied-slots');
            if (response.ok) {
                const data = await response.json();
                return data.occupiedSlots || [];
            }
        } catch (error) {
            this.log(`Erreur récupération créneaux: ${error.message}`, 'error');
        }
        
        // Fallback: calculer depuis les réservations locales
        const bookings = await this.getAllBookings();
        return bookings.filter(b => b.status !== 'annulé').map(b => ({
            datetime: b.datetime,
            duration: b.service?.duration || 60
        }));
    }

    // Gestion des points de fidélité
    async updateLoyaltyPoints(clientId, points, reason = 'appointment') {
        this.log(`Mise à jour points fidélité: ${clientId} +${points}`, 'info');
        
        try {
            const response = await fetch(`${window.API_CONFIG ? window.API_CONFIG.baseURL : 'https://laia-skin-api.onrender.com'}/api/loyalty/points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                },
                body: JSON.stringify({
                    clientId,
                    points,
                    reason,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.log(`Points fidélité mis à jour: ${result.totalPoints}`, 'success');
                
                // Notifier
                this.notifyAllComponents({
                    clientId,
                    points: result.totalPoints,
                    action: 'loyalty-update'
                }, 'loyalty');
                
                return result;
            }
        } catch (error) {
            this.log(`Erreur points fidélité: ${error.message}`, 'error');
        }
    }

    // Valider un rendez-vous et attribuer les points
    async validateAppointment(appointmentId) {
        this.log(`Validation rendez-vous: ${appointmentId}`, 'info');
        
        try {
            // Mettre à jour le statut
            const response = await fetch(`${window.API_CONFIG ? window.API_CONFIG.baseURL : 'https://laia-skin-api.onrender.com'}/api/appointments/${appointmentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                },
                body: JSON.stringify({
                    status: 'terminé',
                    completedAt: new Date().toISOString()
                })
            });

            if (response.ok) {
                const appointment = await response.json();
                
                // Attribuer les points de fidélité (10 points par rendez-vous)
                if (appointment.client?.id || appointment.clientId) {
                    await this.updateLoyaltyPoints(
                        appointment.client?.id || appointment.clientId,
                        10,
                        `Rendez-vous terminé: ${appointment.service?.name || 'Service'}`
                    );
                }
                
                this.log(`Rendez-vous validé: ${appointmentId}`, 'success');
                
                // Synchroniser
                this.triggerSync();
                
                return appointment;
            }
        } catch (error) {
            this.log(`Erreur validation: ${error.message}`, 'error');
        }
    }
}

// Créer une instance globale
window.syncManager = new SyncManager();

// Auto-initialiser si DOM prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.syncManager.init();
    });
} else {
    window.syncManager.init();
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyncManager;
}