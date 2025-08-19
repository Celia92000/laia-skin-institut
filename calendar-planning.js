// Système de calendrier pour l'onglet Planning de l'admin
class PlanningCalendar {
    constructor() {
        this.currentDate = new Date();
        this.appointments = [];
        this.selectedDate = null;
    }

    init() {
        console.log('📅 Initialisation du calendrier Planning');
        this.loadAppointments();
        this.render();
        
        // Actualisation toutes les 30 secondes
        setInterval(() => this.loadAppointments(), 30000);
    }

    async loadAppointments() {
        try {
            // Charger depuis localStorage ou API
            const stored = localStorage.getItem('allReservations');
            if (stored) {
                this.appointments = JSON.parse(stored);
            }
            
            // Essayer de charger depuis l'API
            const apiUrl = window.API_CONFIG ? window.API_CONFIG.baseURL : 'https://laia-skin-api.onrender.com';
            const response = await fetch(`${apiUrl}/api/appointments`);
            if (response.ok) {
                const data = await response.json();
                this.appointments = data.appointments || [];
            }
        } catch (error) {
            console.error('Erreur chargement rendez-vous:', error);
        }
        
        this.updateCalendar();
    }

    render() {
        const container = document.getElementById('planning');
        if (!container) {
            console.warn('⚠️ Onglet Planning non trouvé');
            return;
        }

        // Chercher le div qui contient "Le calendrier interactif apparaîtra ici..."
        const placeholderDivs = container.querySelectorAll('div');
        let targetDiv = null;
        
        placeholderDivs.forEach(div => {
            if (div.textContent.includes('calendrier interactif apparaîtra ici')) {
                targetDiv = div.parentElement; // Prendre le parent (le div avec background white)
            }
        });
        
        if (!targetDiv) {
            console.warn('⚠️ Zone calendrier non trouvée, création...');
            targetDiv = document.createElement('div');
            targetDiv.style.cssText = 'background: white; padding: 2rem; border-radius: 12px; margin-top: 2rem;';
            
            // L'insérer après les cartes de stats
            const statsDiv = container.querySelector('div[style*="display: flex"]');
            if (statsDiv && statsDiv.nextSibling) {
                container.insertBefore(targetDiv, statsDiv.nextSibling.nextSibling);
            } else {
                container.appendChild(targetDiv);
            }
        }

        const calendarSection = targetDiv;

        calendarSection.innerHTML = `
            <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h3 style="margin: 0; font-size: 1.5rem; color: #2c3e50;">
                    📅 Calendrier des Rendez-vous
                </h3>
                <div class="calendar-nav" style="display: flex; gap: 1rem; align-items: center;">
                    <button onclick="planningCalendar.previousMonth()" style="background: #d4b5a0; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;">
                        ◀ Précédent
                    </button>
                    <span id="current-month" style="font-weight: 600; min-width: 150px; text-align: center; color: #2c3e50;">
                        ${this.getMonthYear()}
                    </span>
                    <button onclick="planningCalendar.nextMonth()" style="background: #d4b5a0; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;">
                        Suivant ▶
                    </button>
                    <button onclick="planningCalendar.today()" style="background: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; margin-left: 1rem;">
                        Aujourd'hui
                    </button>
                </div>
            </div>
            
            <div id="calendar-grid" class="calendar-grid">
                ${this.generateCalendarHTML()}
            </div>
            
            <div id="selected-date-appointments" style="margin-top: 2rem; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; display: none;">
                <h4 style="margin-top: 0; color: #2c3e50;">Rendez-vous du <span id="selected-date-label"></span></h4>
                <div id="appointments-list"></div>
            </div>
        `;

        this.updateCalendar();
    }

    generateCalendarHTML() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        let html = `
            <style>
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 1px;
                    background: #e9ecef;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .calendar-cell {
                    background: white;
                    padding: 0.5rem;
                    min-height: 80px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }
                .calendar-cell:hover {
                    background: #f8f9fa;
                }
                .calendar-cell.selected {
                    background: #fff3cd;
                    border: 2px solid #d4b5a0;
                }
                .calendar-cell.today {
                    background: #d1ecf1;
                }
                .calendar-cell.other-month {
                    background: #f8f9fa;
                    color: #adb5bd;
                }
                .calendar-cell.has-appointments {
                    background: #d4edda;
                }
                .day-header {
                    background: #d4b5a0;
                    color: white;
                    padding: 0.75rem;
                    text-align: center;
                    font-weight: 600;
                }
                .day-number {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                .appointment-indicator {
                    font-size: 0.75rem;
                    color: #28a745;
                    margin-top: 0.25rem;
                }
                .appointment-dot {
                    width: 8px;
                    height: 8px;
                    background: #28a745;
                    border-radius: 50%;
                    display: inline-block;
                    margin: 0 2px;
                }
            </style>
        `;
        
        // Headers des jours
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        days.forEach(day => {
            html += `<div class="day-header">${day}</div>`;
        });
        
        // Générer les jours
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            const isToday = cellDate.toDateString() === today.toDateString();
            const isCurrentMonth = cellDate.getMonth() === month;
            const dateStr = cellDate.toISOString().split('T')[0];
            
            // Compter les rendez-vous pour cette date
            const dayAppointments = this.getAppointmentsForDate(dateStr);
            const hasAppointments = dayAppointments.length > 0;
            
            let classes = 'calendar-cell';
            if (isToday) classes += ' today';
            if (!isCurrentMonth) classes += ' other-month';
            if (hasAppointments) classes += ' has-appointments';
            
            html += `
                <div class="${classes}" data-date="${dateStr}" onclick="planningCalendar.selectDate('${dateStr}')">
                    <div class="day-number">${cellDate.getDate()}</div>
                    ${hasAppointments ? `
                        <div class="appointment-indicator">
                            ${dayAppointments.length} RDV
                            <div>${dayAppointments.slice(0, 3).map(() => '<span class="appointment-dot"></span>').join('')}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        return html;
    }

    getAppointmentsForDate(dateStr) {
        return this.appointments.filter(apt => {
            const aptDate = new Date(apt.datetime || apt.date);
            const aptDateStr = aptDate.toISOString().split('T')[0];
            return aptDateStr === dateStr;
        });
    }

    selectDate(dateStr) {
        this.selectedDate = dateStr;
        
        // Mettre à jour l'affichage
        document.querySelectorAll('.calendar-cell').forEach(cell => {
            cell.classList.remove('selected');
            if (cell.dataset.date === dateStr) {
                cell.classList.add('selected');
            }
        });
        
        // Afficher les rendez-vous du jour sélectionné
        const appointments = this.getAppointmentsForDate(dateStr);
        const container = document.getElementById('selected-date-appointments');
        const label = document.getElementById('selected-date-label');
        const list = document.getElementById('appointments-list');
        
        if (container && label && list) {
            const date = new Date(dateStr + 'T00:00:00');
            label.textContent = date.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            if (appointments.length === 0) {
                list.innerHTML = '<p style="color: #6c757d;">Aucun rendez-vous pour cette date</p>';
            } else {
                list.innerHTML = appointments.map(apt => {
                    const aptDate = new Date(apt.datetime || apt.date);
                    const time = apt.time || aptDate.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    return `
                        <div style="padding: 1rem; background: white; border-radius: 8px; margin-bottom: 0.5rem; border-left: 4px solid #d4b5a0;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <strong>${time}</strong> - ${apt.clientName || apt.client?.name || 'Client'}
                                    <div style="color: #6c757d; font-size: 0.9rem; margin-top: 0.25rem;">
                                        ${apt.service || 'Service'} 
                                        ${apt.duration ? `(${apt.duration} min)` : ''}
                                    </div>
                                    ${apt.phone ? `<div style="color: #6c757d; font-size: 0.9rem;">📞 ${apt.phone}</div>` : ''}
                                </div>
                                <div style="text-align: right;">
                                    <span style="background: ${apt.status === 'confirmé' ? '#d4edda' : '#fff3cd'}; color: ${apt.status === 'confirmé' ? '#155724' : '#856404'}; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">
                                        ${apt.status || 'confirmé'}
                                    </span>
                                    ${apt.price ? `<div style="margin-top: 0.5rem; font-weight: 600;">${apt.price}€</div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            container.style.display = 'block';
        }
    }

    updateCalendar() {
        const grid = document.getElementById('calendar-grid');
        if (grid) {
            grid.innerHTML = this.generateCalendarHTML();
        }
    }

    getMonthYear() {
        return this.currentDate.toLocaleDateString('fr-FR', { 
            month: 'long', 
            year: 'numeric' 
        });
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        document.getElementById('current-month').textContent = this.getMonthYear();
        this.updateCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        document.getElementById('current-month').textContent = this.getMonthYear();
        this.updateCalendar();
    }

    today() {
        this.currentDate = new Date();
        document.getElementById('current-month').textContent = this.getMonthYear();
        this.updateCalendar();
        
        // Sélectionner aujourd'hui
        const todayStr = new Date().toISOString().split('T')[0];
        this.selectDate(todayStr);
    }
}

// Créer une instance globale
window.planningCalendar = new PlanningCalendar();

// Fonction pour initialiser le calendrier quand l'onglet Planning est cliqué
window.initPlanningCalendar = function() {
    console.log('🚀 Initialisation calendrier Planning demandée');
    if (!window.planningCalendar.initialized) {
        window.planningCalendar.init();
        window.planningCalendar.initialized = true;
    } else {
        window.planningCalendar.render();
        window.planningCalendar.loadAppointments();
    }
};

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Attendre un peu pour que l'admin dashboard soit chargé
        setTimeout(() => {
            // Vérifier si l'onglet Planning est déjà visible
            const planningTab = document.getElementById('planning');
            if (planningTab && planningTab.style.display !== 'none') {
                window.planningCalendar.init();
                window.planningCalendar.initialized = true;
            }
        }, 1000);
    });
} else {
    setTimeout(() => {
        // Vérifier si l'onglet Planning est déjà visible
        const planningTab = document.getElementById('planning');
        if (planningTab && planningTab.style.display !== 'none') {
            window.planningCalendar.init();
            window.planningCalendar.initialized = true;
        }
    }, 1000);
}

// Écouter les changements d'onglets
document.addEventListener('click', function(e) {
    if (e.target.textContent && e.target.textContent.includes('Planning')) {
        setTimeout(() => {
            window.initPlanningCalendar();
        }, 100);
    }
});