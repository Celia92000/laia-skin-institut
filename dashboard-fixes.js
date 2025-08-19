// 🔧 Correctifs spécifiques pour les problèmes restants
console.log('🔧 Chargement des correctifs dashboard...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Application des correctifs...');
    
    // 1. ✅ Correction de la fonction createQuickReservation
    window.createQuickReservation = function(serviceId) {
        console.log('🏥 Création RDV rapide pour:', serviceId);
        
        const serviceNames = {
            'hydrocleaning': 'Hydro\'Cleaning',
            'renaissance': 'Renaissance', 
            'led': 'LED Thérapie',
            'bbglow': 'BB Glow',
            'eclat': 'Hydro\'Naissance'
        };
        
        // Sauvegarder le service pour le formulaire
        sessionStorage.setItem('selectedServiceForReservation', serviceId);
        sessionStorage.setItem('selectedServiceName', serviceNames[serviceId] || serviceId);
        
        // Naviguer vers les réservations
        if (window.showSection) {
            window.showSection('reservations');
        } else {
            // Fallback si showSection n'existe pas
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
            
            const reservationsSection = document.getElementById('reservations');
            const reservationsLink = document.querySelector('[data-section="reservations"]');
            
            if (reservationsSection) reservationsSection.classList.add('active');
            if (reservationsLink) reservationsLink.classList.add('active');
        }
        
        // Afficher le formulaire après un petit délai
        setTimeout(() => {
            const newReservationForm = document.getElementById('new-reservation-form');
            if (newReservationForm) {
                newReservationForm.style.display = 'block';
                newReservationForm.scrollIntoView({ behavior: 'smooth' });
                
                // Pré-remplir le service
                const serviceSelect = document.getElementById('appointment-service');
                if (serviceSelect && serviceId) {
                    serviceSelect.value = serviceId;
                }
                
                console.log('✅ Formulaire de réservation ouvert avec service:', serviceNames[serviceId]);
            }
        }, 300);
    };
    
    // 2. ✅ Fonction pour basculer le formulaire de nouvelle réservation
    window.toggleNewReservationForm = function() {
        console.log('🔄 Basculement formulaire réservation...');
        
        const form = document.getElementById('new-reservation-form');
        if (form) {
            const isVisible = form.style.display !== 'none';
            form.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                form.scrollIntoView({ behavior: 'smooth' });
                console.log('✅ Formulaire de réservation ouvert');
            } else {
                console.log('✅ Formulaire de réservation fermé');
            }
        } else {
            console.error('❌ Formulaire de réservation introuvable');
        }
    };
    
    // 3. ✅ Correction pour les validations de soins
    window.validateAppointment = function(appointmentId) {
        console.log('✅ Validation du soin:', appointmentId);
        
        const modal = document.getElementById('validation-modal');
        const clientName = document.getElementById('modal-client-name');
        const appointmentDate = document.getElementById('modal-appointment-date');
        const serviceType = document.getElementById('modal-service-type');
        
        // Données exemple (normalement viendraient de votre base de données)
        const appointments = {
            'rdv001': { client: 'Marie Dupont', date: 'Aujourd\'hui 14:00', service: 'Hydro\'Naissance' },
            'rdv002': { client: 'Sophie Martin', date: 'Aujourd\'hui 16:30', service: 'BB Glow' },
            'rdv003': { client: 'Julie Bernard', date: 'Demain 10:00', service: 'Renaissance' }
        };
        
        const appointment = appointments[appointmentId];
        
        if (appointment && modal && clientName && appointmentDate && serviceType) {
            clientName.textContent = appointment.client;
            appointmentDate.textContent = appointment.date;
            serviceType.textContent = appointment.service;
            
            modal.style.display = 'flex';
            
            // Sauvegarder l'ID pour la validation finale
            modal.setAttribute('data-appointment-id', appointmentId);
            
            console.log('✅ Modal de validation ouverte pour:', appointment.client);
        } else {
            console.error('❌ Données de RDV introuvables ou éléments DOM manquants');
        }
    };
    
    // 4. ✅ Fonction de validation finale (client présent/absent)
    window.confirmValidation = function(wasPresent) {
        console.log('✅ Confirmation validation:', wasPresent ? 'Présent' : 'Absent');
        
        const modal = document.getElementById('validation-modal');
        const appointmentId = modal ? modal.getAttribute('data-appointment-id') : null;
        
        if (appointmentId) {
            const statusText = wasPresent ? 'Présent ✅' : 'Absent ❌';
            
            // Mettre à jour l'affichage dans le tableau
            const appointmentRow = document.querySelector(`[data-appointment-id="${appointmentId}"]`);
            if (appointmentRow) {
                const statusCell = appointmentRow.querySelector('.appointment-status');
                if (statusCell) {
                    statusCell.innerHTML = `<span class="status-badge ${wasPresent ? 'status-validated' : 'status-cancelled'}">${statusText}</span>`;
                }
            }
            
            // Si présent, ajouter +1 à la fidélité
            if (wasPresent) {
                const clientName = document.getElementById('modal-client-name').textContent;
                addLoyaltyPoint(clientName);
                
                // Notification
                showNotification(`✅ ${clientName} validé présent - +1 soin fidélité ajouté !`, 'success');
            } else {
                showNotification(`❌ Absence enregistrée`, 'info');
            }
            
            // Fermer le modal
            modal.style.display = 'none';
            
            console.log('✅ Validation terminée pour RDV:', appointmentId);
        }
    };
    
    // 5. ✅ Fonction pour ajouter un point de fidélité
    function addLoyaltyPoint(clientName) {
        console.log('🎆 Ajout point fidélité pour:', clientName);
        
        // Récupérer ou créer les données de fidélité
        let loyaltyData = JSON.parse(localStorage.getItem('loyaltyProgram')) || {};
        
        if (!loyaltyData[clientName]) {
            loyaltyData[clientName] = {
                totalServices: 0,
                lastService: new Date().toISOString(),
                status: 'Bronze'
            };
        }
        
        // Ajouter +1 soin
        loyaltyData[clientName].totalServices += 1;
        loyaltyData[clientName].lastService = new Date().toISOString();
        
        // Recalculer le statut
        const services = loyaltyData[clientName].totalServices;
        if (services >= 10) {
            loyaltyData[clientName].status = 'Diamant';
        } else if (services >= 5) {
            loyaltyData[clientName].status = 'Or';
        } else if (services >= 3) {
            loyaltyData[clientName].status = 'Argent';
        }
        
        // Sauvegarder
        localStorage.setItem('loyaltyProgram', JSON.stringify(loyaltyData));
        
        console.log('✅ Point fidélité ajouté - Nouveau total:', services + 1);
        return loyaltyData[clientName];
    }
    
    // 6. ✅ Fonction de notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            z-index: 10000;
            font-weight: 500;
            border-left: 4px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
    
    // 7. ✅ Fermer les modals
    window.closeValidationModal = function() {
        const modal = document.getElementById('validation-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
    
    console.log('✅ Correctifs dashboard appliqués avec succès !');
    console.log('🔧 Fonctions disponibles: createQuickReservation, toggleNewReservationForm, validateAppointment, confirmValidation');
});