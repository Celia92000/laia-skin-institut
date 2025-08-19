// ================================
// SCRIPT DE SYNCHRONISATION DES RÉSERVATIONS LAIA SKIN
// ================================

(function() {
    console.log('🔄 Initialisation du système de synchronisation des réservations...');
    
    const API_URL = 'http://localhost:3001/api';
    let isAdmin = false;
    let currentUser = null;

    // Déterminer si on est sur une page admin
    if (window.location.pathname.includes('admin')) {
        isAdmin = true;
        console.log('👨‍💼 Mode Admin détecté');
        initAdminSync();
    } else if (window.location.pathname.includes('client-dashboard')) {
        console.log('👤 Mode Client détecté');
        initClientSync();
    } else if (window.location.pathname.includes('booking')) {
        console.log('📅 Page de réservation détectée');
        enhanceBookingPage();
    } else if (window.location.pathname.includes('prestations')) {
        console.log('💆‍♀️ Page prestations détectée');
        enhancePrestationsPage();
    }

    // ================================
    // SYNCHRONISATION ADMIN
    // ================================
    function initAdminSync() {
        console.log('Initialisation de la synchronisation admin...');
        
        // Actualiser les données toutes les 30 secondes
        loadAdminData();
        setInterval(loadAdminData, 30000);
        
        // Ajouter les gestionnaires pour la validation des soins
        setupValidationHandlers();
        
        // Ajouter les gestionnaires pour la fidélité
        setupLoyaltyHandlers();
    }

    function loadAdminData() {
        const token = localStorage.getItem('token') || 'admin_admin';
        
        // Charger tous les rendez-vous
        fetch(`${API_URL}/admin/appointments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(appointments => {
            console.log(`📊 ${appointments.length} rendez-vous chargés`);
            updateAdminDashboard(appointments);
        })
        .catch(error => console.error('Erreur chargement RDV admin:', error));
        
        // Charger les RDV à valider
        fetch(`${API_URL}/admin/appointments/to-validate`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(appointments => {
            console.log(`✅ ${appointments.length} soins à valider`);
            displayServicesToValidate(appointments);
        })
        .catch(error => console.error('Erreur chargement validation:', error));
    }

    function updateAdminDashboard(appointments) {
        // Mettre à jour le tableau des prochaines réservations
        const upcomingContainer = document.getElementById('upcoming-reservations');
        if (upcomingContainer && appointments.length > 0) {
            const upcoming = appointments
                .filter(apt => new Date(apt.datetime) > new Date() && apt.status === 'confirmé')
                .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
                .slice(0, 10);
            
            if (upcoming.length > 0) {
                upcomingContainer.innerHTML = `
                    <h3 style="color: #d4b5a0; margin-bottom: 1rem;">📅 Prochaines Réservations (Synchronisées)</h3>
                    <table style="width: 100%; background: white; border-radius: 8px; overflow: hidden;">
                        <thead style="background: linear-gradient(135deg, #d4b5a0, #c9a084); color: white;">
                            <tr>
                                <th style="padding: 1rem;">Date</th>
                                <th style="padding: 1rem;">Heure</th>
                                <th style="padding: 1rem;">Client</th>
                                <th style="padding: 1rem;">Service</th>
                                <th style="padding: 1rem;">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${upcoming.map(apt => `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 1rem;">${new Date(apt.datetime).toLocaleDateString('fr-FR')}</td>
                                    <td style="padding: 1rem;">${new Date(apt.datetime).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</td>
                                    <td style="padding: 1rem;">${apt.client?.name || 'Client'}</td>
                                    <td style="padding: 1rem;">${apt.service?.name || 'Service'}</td>
                                    <td style="padding: 1rem;">
                                        <span style="background: #d4f4dd; color: #28a745; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.875rem;">
                                            ✅ ${apt.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        }
        
        // Mettre à jour le planning si présent
        const planningSection = document.getElementById('planning');
        if (planningSection && planningSection.classList.contains('active')) {
            updateCalendarWithAppointments(appointments);
        }
    }

    function displayServicesToValidate(appointments) {
        const container = document.getElementById('services-to-validate');
        if (!container) return;
        
        if (appointments.length === 0) {
            container.innerHTML = '<p style="color: #666;">Aucun soin à valider pour le moment</p>';
            return;
        }
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
                ${appointments.map(apt => `
                    <div style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h4 style="color: #d4b5a0; margin-bottom: 0.5rem;">${apt.service?.name || 'Service'}</h4>
                        <p><strong>Client:</strong> ${apt.client?.name || 'Client'}</p>
                        <p><strong>Date:</strong> ${new Date(apt.datetime).toLocaleDateString('fr-FR')}</p>
                        <p><strong>Prix:</strong> ${apt.pricing?.servicePrice || 0}€</p>
                        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                            <button onclick="validateService('${apt._id}')" style="flex: 1; padding: 0.5rem; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                ✅ Valider le soin
                            </button>
                            <button onclick="markNoShow('${apt._id}')" style="flex: 1; padding: 0.5rem; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                ❌ Client absent
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function setupValidationHandlers() {
        window.validateService = async function(appointmentId) {
            const token = localStorage.getItem('token') || 'admin_admin';
            
            try {
                const response = await fetch(`${API_URL}/admin/appointments/${appointmentId}/validate`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    alert('✅ Soin validé avec succès !');
                    loadAdminData(); // Recharger les données
                }
            } catch (error) {
                console.error('Erreur validation:', error);
                alert('Erreur lors de la validation');
            }
        };
        
        window.markNoShow = async function(appointmentId) {
            const token = localStorage.getItem('token') || 'admin_admin';
            
            try {
                const response = await fetch(`${API_URL}/admin/appointments/${appointmentId}/no-show`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    alert('Client marqué comme absent');
                    loadAdminData();
                }
            } catch (error) {
                console.error('Erreur marquage absence:', error);
            }
        };
    }

    function setupLoyaltyHandlers() {
        // À implémenter selon les besoins
    }

    function updateCalendarWithAppointments(appointments) {
        // Chercher le calendrier existant
        const calendar = document.querySelector('#calendar-days');
        if (!calendar) return;
        
        // Marquer les jours avec des rendez-vous
        appointments.forEach(apt => {
            const date = new Date(apt.datetime);
            const day = date.getDate();
            const dayElement = Array.from(calendar.querySelectorAll('.calendar-day')).find(el => 
                el.textContent.trim() === day.toString()
            );
            
            if (dayElement && !dayElement.classList.contains('has-appointment')) {
                dayElement.classList.add('has-appointment');
                dayElement.style.background = 'linear-gradient(135deg, #d4b5a0, #c9a084)';
                dayElement.style.color = 'white';
                dayElement.title = `RDV: ${apt.client?.name || 'Client'} - ${apt.service?.name || 'Service'}`;
            }
        });
    }

    // ================================
    // SYNCHRONISATION CLIENT
    // ================================
    function initClientSync() {
        console.log('Initialisation de la synchronisation client...');
        
        // Charger les rendez-vous du client
        loadClientAppointments();
        
        // Actualiser toutes les minutes
        setInterval(loadClientAppointments, 60000);
        
        // Améliorer le bouton de nouvelle réservation
        const newBookingBtn = document.getElementById('new-booking-btn');
        if (newBookingBtn) {
            newBookingBtn.addEventListener('click', function(e) {
                if (!window.showBookingModal) {
                    e.preventDefault();
                    window.location.href = '/booking.html';
                }
            });
        }
    }

    function loadClientAppointments() {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        fetch(`${API_URL}/appointments/my-appointments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(appointments => {
            console.log(`📅 ${appointments.length} rendez-vous client chargés`);
            updateClientDashboard(appointments);
        })
        .catch(error => console.error('Erreur chargement RDV client:', error));
    }

    function updateClientDashboard(appointments) {
        // Mettre à jour la section des rendez-vous à venir
        const upcomingContainer = document.getElementById('upcomingAppointments');
        if (upcomingContainer) {
            const upcoming = appointments
                .filter(apt => new Date(apt.datetime) > new Date())
                .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
            
            if (upcoming.length > 0) {
                upcomingContainer.innerHTML = upcoming.map(apt => `
                    <div style="background: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="color: #d4b5a0; margin: 0;">${apt.service?.name || 'Service'}</h4>
                                <p style="margin: 0.5rem 0; color: #666;">
                                    📅 ${new Date(apt.datetime).toLocaleDateString('fr-FR')} 
                                    à ${new Date(apt.datetime).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                            <div>
                                ${apt.status === 'en_attente' ? `
                                    <button onclick="confirmAppointment('${apt._id}')" style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 0.5rem;">
                                        Confirmer
                                    </button>
                                ` : ''}
                                <button onclick="cancelAppointment('${apt._id}')" style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                upcomingContainer.innerHTML = '<p style="color: #666;">Aucun rendez-vous à venir</p>';
            }
        }
        
        // Mettre à jour le prochain rendez-vous
        const nextContainer = document.getElementById('nextAppointment');
        if (nextContainer && appointments.length > 0) {
            const next = appointments
                .filter(apt => new Date(apt.datetime) > new Date())
                .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))[0];
            
            if (next) {
                nextContainer.innerHTML = `
                    <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); color: white; padding: 1.5rem; border-radius: 10px;">
                        <h3 style="margin: 0 0 1rem 0;">${next.service?.name || 'Service'}</h3>
                        <p style="margin: 0.5rem 0;">📅 ${new Date(next.datetime).toLocaleDateString('fr-FR')}</p>
                        <p style="margin: 0.5rem 0;">🕐 ${new Date(next.datetime).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                        <p style="margin: 0.5rem 0;">⏱️ Durée: ${next.duration || 60} minutes</p>
                    </div>
                `;
            }
        }
    }

    // Fonctions globales pour les actions client
    window.confirmAppointment = async function(appointmentId) {
        const token = localStorage.getItem('token');
        
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
                loadClientAppointments();
            }
        } catch (error) {
            console.error('Erreur confirmation:', error);
        }
    };
    
    window.cancelAppointment = async function(appointmentId) {
        if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;
        
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'annulé' })
            });
            
            if (response.ok) {
                alert('Rendez-vous annulé');
                loadClientAppointments();
            }
        } catch (error) {
            console.error('Erreur annulation:', error);
        }
    };

    // ================================
    // AMÉLIORATION PAGE RÉSERVATION
    // ================================
    function enhanceBookingPage() {
        console.log('Amélioration de la page de réservation...');
        
        // Intercepter la soumission du formulaire
        const bookingForm = document.getElementById('booking-form') || document.querySelector('form');
        if (bookingForm) {
            const originalSubmit = bookingForm.onsubmit;
            bookingForm.onsubmit = function(e) {
                console.log('📤 Soumission du formulaire de réservation interceptée');
                
                // Laisser le formulaire original s'exécuter
                if (originalSubmit) {
                    originalSubmit.call(this, e);
                }
                
                // Notifier l'admin (optionnel)
                setTimeout(() => {
                    notifyAdmin('Nouvelle réservation reçue');
                }, 1000);
            };
        }
    }

    // ================================
    // AMÉLIORATION PAGE PRESTATIONS
    // ================================
    function enhancePrestationsPage() {
        console.log('Amélioration de la page prestations...');
        
        // Améliorer tous les boutons de réservation
        document.querySelectorAll('.book-service-btn, a[href*="booking"]').forEach(btn => {
            if (!btn.dataset.enhanced) {
                btn.dataset.enhanced = 'true';
                
                btn.addEventListener('click', function(e) {
                    const serviceName = this.dataset.serviceName || this.closest('.service-detail')?.querySelector('h2')?.textContent;
                    const servicePrice = this.dataset.servicePrice;
                    
                    if (serviceName) {
                        console.log(`🎯 Réservation initiée pour: ${serviceName}`);
                        
                        // Stocker les infos du service pour pré-remplir le formulaire
                        localStorage.setItem('selectedService', JSON.stringify({
                            name: serviceName,
                            price: servicePrice,
                            timestamp: Date.now()
                        }));
                    }
                });
            }
        });
    }

    // ================================
    // NOTIFICATION ADMIN
    // ================================
    function notifyAdmin(message) {
        fetch(`${API_URL}/admin/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'info',
                message: message,
                timestamp: new Date()
            })
        }).catch(error => console.error('Erreur notification:', error));
    }

    // ================================
    // INDICATEUR DE SYNCHRONISATION
    // ================================
    function addSyncIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'sync-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #d4b5a0, #c9a084);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        indicator.innerHTML = `
            <span style="display: inline-block; width: 8px; height: 8px; background: #00ff00; border-radius: 50%; animation: pulse 2s infinite;"></span>
            Synchronisation active
        `;
        
        // Ajouter l'animation pulse
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(indicator);
    }
    
    // Ajouter l'indicateur sur toutes les pages
    if (document.body) {
        addSyncIndicator();
    }
    
    console.log('✅ Système de synchronisation initialisé avec succès !');
})();