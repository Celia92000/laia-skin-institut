// ================================
// FIX SYNCHRONISATION DASHBOARD
// ================================

(function() {
    console.log('🔧 Correction de la synchronisation du dashboard...');
    
    const API_URL = 'http://localhost:3001/api';
    
    // Fonction pour corriger et synchroniser le dashboard
    async function fixDashboardSync() {
        try {
            const token = localStorage.getItem('token') || 'admin_admin';
            
            // Charger les appointments
            const response = await fetch(`${API_URL}/admin/appointments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Erreur API');
            
            const data = await response.json();
            const appointments = data.appointments || data || [];
            
            console.log(`📅 ${appointments.length} rendez-vous trouvés`);
            
            // Date actuelle réelle
            const now = new Date();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(dayAfter.getDate() + 1);
            
            // Filtrer les RDV d'aujourd'hui
            const todayAppointments = appointments.filter(apt => {
                const aptDate = new Date(apt.datetime || apt.date);
                return aptDate >= today && aptDate < tomorrow && apt.status !== 'annulé';
            });
            
            // Filtrer les prochains RDV
            const upcomingAppointments = appointments
                .filter(apt => {
                    const aptDate = new Date(apt.datetime || apt.date);
                    return aptDate >= now && apt.status !== 'annulé';
                })
                .sort((a, b) => new Date(a.datetime || a.date) - new Date(b.datetime || b.date));
            
            console.log(`📊 RDV aujourd'hui: ${todayAppointments.length}`);
            console.log(`📅 Prochains RDV: ${upcomingAppointments.length}`);
            
            // Mettre à jour les éléments du dashboard
            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                    console.log(`✅ Mis à jour: ${id} = ${value}`);
                } else {
                    console.warn(`⚠️ Élément non trouvé: ${id}`);
                }
            };
            
            // Statistiques du jour
            updateElement('dashTodayRdvCount', todayAppointments.length);
            updateElement('dashTodayRdvDetails', 
                todayAppointments.length > 0 
                    ? `${todayAppointments.filter(a => a.status === 'confirmé').length} confirmés`
                    : 'Aucun RDV aujourd\'hui'
            );
            
            // CA du jour - Intégrer les paiements réels
            let todayRevenue = 0;
            const payments = JSON.parse(localStorage.getItem('payments') || '[]');
            const todayDateStr = today.toISOString().split('T')[0];
            const todayPayments = payments.filter(p => p.date === todayDateStr);
            
            if (todayPayments.length > 0) {
                // Utiliser les paiements réels si disponibles
                todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);
            } else {
                // Sinon, estimer depuis les RDV
                todayRevenue = todayAppointments.reduce((sum, apt) => {
                    return sum + (apt.pricing?.servicePrice || apt.price || 0);
                }, 0);
            }
            
            updateElement('dashTodayRevenue', `${todayRevenue}€`);
            updateElement('dashTodayRevenueDetails', `${todayPayments.length || todayAppointments.length} services`);
            
            // Prochain RDV
            const nextAppointment = upcomingAppointments[0];
            if (nextAppointment) {
                const nextTime = new Date(nextAppointment.datetime || nextAppointment.date);
                updateElement('dashNextAppointmentTime', 
                    nextTime.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})
                );
                updateElement('dashNextAppointmentClient', 
                    `${nextAppointment.client?.name || 'Client'} - ${nextAppointment.service?.name || 'Service'}`
                );
                console.log(`⏰ Prochain RDV: ${nextTime.toLocaleString('fr-FR')}`);
            } else {
                updateElement('dashNextAppointmentTime', '--:--');
                updateElement('dashNextAppointmentClient', 'Aucun RDV programmé');
            }
            
            // Calculer les statistiques de la semaine
            calculateWeeklyStats(appointments, payments);
            
            // Calculer les statistiques du mois
            calculateMonthlyStats(appointments, payments);
            
            // Calculer les statistiques annuelles
            calculateYearlyStats(appointments, payments);
            
            // Calculer l'évolution année par année
            calculateYearEvolution(payments);
            
            // Afficher les prochains RDV (dans l'onglet Planning maintenant)
            updateUpcomingAppointments(upcomingAppointments, now);
            
            console.log('✅ Dashboard synchronisé avec succès !');
            
        } catch (error) {
            console.error('❌ Erreur synchronisation:', error);
        }
    }
    
    // Lancer la synchronisation
    document.addEventListener('DOMContentLoaded', () => {
        // Synchronisation initiale
        setTimeout(fixDashboardSync, 1000);
        
        // Synchronisation périodique
        setInterval(fixDashboardSync, 30000);
        
        // Synchronisation au clic sur Dashboard ou Planning
        document.addEventListener('click', (e) => {
            if (e.target && e.target.textContent) {
                if (e.target.textContent.includes('Dashboard') || e.target.textContent.includes('Planning')) {
                    setTimeout(fixDashboardSync, 100);
                }
            }
        });
    });
    
    // Écouter les événements
    window.addEventListener('appointmentUpdated', fixDashboardSync);
    window.addEventListener('newBooking', fixDashboardSync);
    
    // Fonction pour calculer les stats hebdomadaires
    function calculateWeeklyStats(appointments, payments) {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1); // Lundi
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        // CA de la semaine depuis les paiements
        const weekPayments = payments.filter(p => {
            const pDate = new Date(p.date);
            return pDate >= weekStart && pDate < weekEnd;
        });
        const weekRevenue = weekPayments.reduce((sum, p) => sum + p.amount, 0);
        
        // CA semaine dernière pour comparaison
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(weekStart);
        const lastWeekPayments = payments.filter(p => {
            const pDate = new Date(p.date);
            return pDate >= lastWeekStart && pDate < lastWeekEnd;
        });
        const lastWeekRevenue = lastWeekPayments.reduce((sum, p) => sum + p.amount, 0);
        const weekProgress = lastWeekRevenue > 0 ? Math.round(((weekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100) : 0;
        
        // RDV de la semaine
        const weekAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.datetime || apt.date);
            return aptDate >= weekStart && aptDate < weekEnd && apt.status === 'confirmé';
        });
        
        // Service le plus populaire
        const serviceCount = {};
        weekAppointments.forEach(apt => {
            const service = apt.service?.name || 'Service';
            serviceCount[service] = (serviceCount[service] || 0) + 1;
        });
        const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0] || ['--', 0];
        
        // Nouveaux clients (simulation basée sur première visite)
        const newClients = Math.floor(weekAppointments.length * 0.3); // Estimation 30% nouveaux
        
        // Mettre à jour l'interface
        updateElement('dashWeekRevenue', `${weekRevenue}€`);
        updateElement('dashWeekRevenueProgress', `${weekProgress >= 0 ? '+' : ''}${weekProgress}% vs semaine dernière`);
        updateElement('dashWeekAppointments', weekAppointments.length);
        updateElement('dashWeekAppointmentsAvg', `Moy: ${Math.round(weekAppointments.length / 7)}/jour`);
        updateElement('dashTopService', topService[0]);
        updateElement('dashTopServiceCount', `${topService[1]} réservations`);
        updateElement('dashNewClientsWeek', newClients);
    }
    
    // Fonction pour calculer les stats mensuelles
    function calculateMonthlyStats(appointments, payments) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // CA du mois
        const monthPayments = payments.filter(p => {
            const pDate = new Date(p.date);
            return pDate >= monthStart && pDate <= monthEnd;
        });
        const monthRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
        
        // Mois dernier pour comparaison
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastMonthPayments = payments.filter(p => {
            const pDate = new Date(p.date);
            return pDate >= lastMonthStart && pDate <= lastMonthEnd;
        });
        const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);
        const monthProgress = lastMonthRevenue > 0 ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;
        
        // RDV du mois
        const monthAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.datetime || apt.date);
            return aptDate >= monthStart && aptDate <= monthEnd && apt.status === 'confirmé';
        });
        
        // Taux de conversion
        const totalRequests = appointments.filter(apt => {
            const aptDate = new Date(apt.datetime || apt.date);
            return aptDate >= monthStart && aptDate <= monthEnd;
        }).length;
        const conversionRate = totalRequests > 0 ? Math.round((monthAppointments.length / totalRequests) * 100) : 0;
        
        // Panier moyen
        const avgTicket = monthPayments.length > 0 ? Math.round(monthRevenue / monthPayments.length) : 0;
        
        // Mettre à jour l'interface
        updateElement('dashMonthRevenue', `${monthRevenue}€`);
        updateElement('dashMonthProgress', `${monthProgress >= 0 ? '+' : ''}${monthProgress}% vs mois dernier`);
        updateElement('dashMonthAppointments', monthAppointments.length);
        updateElement('dashMonthAvg', `Moy: ${Math.round(monthAppointments.length / now.getDate())}/jour`);
        updateElement('dashMonthConversion', `${conversionRate}%`);
        updateElement('dashMonthConversionDetails', `${monthAppointments.length} confirmés sur ${totalRequests}`);
        updateElement('dashMonthAvgTicket', `${avgTicket}€`);
        updateElement('dashMonthTicketTrend', 'Par client');
    }
    
    // Fonction pour calculer les stats annuelles
    function calculateYearlyStats(appointments, payments) {
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        
        // CA annuel
        const yearPayments = payments.filter(p => {
            const pDate = new Date(p.date);
            return pDate >= yearStart && pDate <= yearEnd;
        });
        const yearRevenue = yearPayments.reduce((sum, p) => sum + p.amount, 0);
        
        // RDV de l'année
        const yearAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.datetime || apt.date);
            return aptDate >= yearStart && aptDate <= yearEnd && apt.status === 'confirmé';
        });
        
        // Meilleur mois
        const monthlyRevenue = {};
        yearPayments.forEach(p => {
            const month = new Date(p.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
        });
        const bestMonth = Object.entries(monthlyRevenue).sort((a, b) => b[1] - a[1])[0] || ['--', 0];
        
        // Clients actifs (estimation)
        const uniqueClients = new Set();
        yearAppointments.forEach(apt => {
            if (apt.client?.name) uniqueClients.add(apt.client.name);
        });
        const activeClients = uniqueClients.size || Math.floor(yearAppointments.length * 0.7);
        const newClientsYear = Math.floor(activeClients * 0.4); // Estimation 40% nouveaux
        
        // Croissance vs année dernière
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
        const lastYearPayments = payments.filter(p => {
            const pDate = new Date(p.date);
            return pDate >= lastYearStart && pDate <= lastYearEnd;
        });
        const lastYearRevenue = lastYearPayments.reduce((sum, p) => sum + p.amount, 0);
        const yearGrowth = lastYearRevenue > 0 ? Math.round(((yearRevenue - lastYearRevenue) / lastYearRevenue) * 100) : 0;
        
        // Mettre à jour l'interface
        updateElement('dashYearRevenue', `${yearRevenue}€`);
        updateElement('dashYearTarget', `Objectif: 100 000€ (${Math.round((yearRevenue / 100000) * 100)}%)`);
        updateElement('dashYearAppointments', yearAppointments.length);
        updateElement('dashYearGrowth', `Croissance: ${yearGrowth >= 0 ? '+' : ''}${yearGrowth}%`);
        updateElement('dashYearClients', activeClients);
        updateElement('dashYearNewClients', `Nouveaux: ${newClientsYear}`);
        updateElement('dashBestMonth', bestMonth[0]);
        updateElement('dashBestMonthAmount', `${bestMonth[1]}€`);
    }
    
    // Fonction pour calculer l'évolution année par année
    function calculateYearEvolution(payments) {
        const currentYear = new Date().getFullYear();
        const yearlyData = {};
        
        // Calculer le CA pour les 3 dernières années
        for (let year = currentYear - 2; year <= currentYear; year++) {
            const yearPayments = payments.filter(p => {
                const pDate = new Date(p.date);
                return pDate.getFullYear() === year;
            });
            yearlyData[year] = yearPayments.reduce((sum, p) => sum + p.amount, 0);
        }
        
        // Créer le graphique d'évolution
        const evolutionContainer = document.getElementById('dashYearEvolution');
        if (evolutionContainer) {
            const maxRevenue = Math.max(...Object.values(yearlyData), 1);
            
            evolutionContainer.innerHTML = `
                <div style="display: flex; gap: 2rem; align-items: flex-end; justify-content: center; height: 200px;">
                    ${Object.entries(yearlyData).map(([year, revenue]) => {
                        const height = (revenue / maxRevenue) * 150;
                        const color = year == currentYear ? '#28a745' : year == currentYear - 1 ? '#17a2b8' : '#6c757d';
                        return `
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div style="background: ${color}; width: 80px; height: ${height}px; 
                                            border-radius: 5px 5px 0 0; display: flex; align-items: flex-start; 
                                            justify-content: center; padding-top: 10px; color: white; font-weight: bold;">
                                    ${revenue > 0 ? Math.round(revenue / 1000) + 'k€' : '0€'}
                                </div>
                                <div style="margin-top: 0.5rem; font-weight: bold;">${year}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        // Comparaison détaillée
        const comparisonContainer = document.getElementById('dashYearComparison');
        if (comparisonContainer) {
            const lastYear = yearlyData[currentYear - 1] || 0;
            const thisYear = yearlyData[currentYear] || 0;
            const evolution = lastYear > 0 ? Math.round(((thisYear - lastYear) / lastYear) * 100) : 0;
            
            comparisonContainer.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                    <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                        <div style="color: #666; font-size: 0.9rem;">${currentYear - 1}</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #17a2b8;">${lastYear}€</div>
                    </div>
                    <div style="padding: 1rem; background: linear-gradient(135deg, #28a745, #20c997); 
                                color: white; border-radius: 8px;">
                        <div style="font-size: 0.9rem;">Évolution</div>
                        <div style="font-size: 1.5rem; font-weight: bold;">
                            ${evolution >= 0 ? '↑' : '↓'} ${Math.abs(evolution)}%
                        </div>
                    </div>
                    <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                        <div style="color: #666; font-size: 0.9rem;">${currentYear}</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #28a745;">${thisYear}€</div>
                    </div>
                </div>
            `;
        }
    }
    
    // Helper pour mettre à jour les éléments
    function updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    // Fonction pour mettre à jour les prochains RDV (dans Planning)
    function updateUpcomingAppointments(upcomingAppointments, now) {
        // Mettre à jour dans l'onglet Planning
        const planningContainer = document.getElementById('planningUpcomingAppointments');
        
        if (planningContainer) {
            // Filtrer tous les RDV futurs
            const futureAppointments = upcomingAppointments
                .filter(apt => new Date(apt.datetime || apt.date) >= now)
                .slice(0, 20); // Afficher jusqu'à 20 RDV
            
            if (futureAppointments.length === 0) {
                planningContainer.innerHTML = `
                    <div style="text-align: center; color: #999; padding: 2rem;">
                        Aucun rendez-vous programmé
                    </div>
                `;
            } else {
                // Grouper par jour
                const appointmentsByDay = {};
                futureAppointments.forEach(apt => {
                    const date = new Date(apt.datetime || apt.date);
                    const dayKey = date.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    if (!appointmentsByDay[dayKey]) {
                        appointmentsByDay[dayKey] = [];
                    }
                    appointmentsByDay[dayKey].push(apt);
                });
                
                planningContainer.innerHTML = `
                    <div style="max-height: 600px; overflow-y: auto;">
                        ${Object.entries(appointmentsByDay).map(([day, dayAppointments]) => `
                            <div style="margin-bottom: 2rem;">
                                <h4 style="color: #d4b5a0; margin-bottom: 1rem; padding-bottom: 0.5rem; 
                                           border-bottom: 2px solid #f0f0f0;">
                                    📅 ${day}
                                </h4>
                                <div style="display: grid; gap: 1rem;">
                                    ${dayAppointments.map(apt => {
                                        const aptDate = new Date(apt.datetime || apt.date);
                                        const timeStr = aptDate.toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                        
                                        const statusColor = apt.status === 'confirmé' ? '#28a745' : 
                                                          apt.status === 'en_attente' ? '#ffc107' : '#dc3545';
                                        const statusText = apt.status === 'confirmé' ? 'Confirmé' : 
                                                         apt.status === 'en_attente' ? 'À confirmer' : 'Annulé';
                                        
                                        return `
                                            <div style="display: flex; justify-content: space-between; align-items: center; 
                                                        padding: 1rem; background: #f8f9fa; border-radius: 8px; 
                                                        border-left: 4px solid ${statusColor}; cursor: pointer;
                                                        transition: all 0.3s ease;"
                                                 onmouseover="this.style.transform='translateX(5px)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.1)';"
                                                 onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none';"
                                                 onclick="showAppointmentDetails('${apt._id}')">
                                                <div style="flex: 1;">
                                                    <div style="display: flex; gap: 1rem; align-items: center;">
                                                        <span style="font-size: 1.25rem; font-weight: bold; color: #333;">
                                                            ${timeStr}
                                                        </span>
                                                        <span style="color: #666; font-weight: 500;">
                                                            ${apt.client?.name || 'Client'}
                                                        </span>
                                                    </div>
                                                    <div style="margin-top: 0.5rem; color: #666;">
                                                        <span style="background: linear-gradient(135deg, #d4b5a0, #c9a084); 
                                                                   color: white; padding: 0.25rem 0.75rem; 
                                                                   border-radius: 15px; font-size: 0.875rem;">
                                                            ${apt.service?.name || 'Service'}
                                                        </span>
                                                        <span style="margin-left: 1rem;">
                                                            • ${apt.duration || 60} min
                                                        </span>
                                                        <span style="margin-left: 1rem; color: #28a745; font-weight: bold;">
                                                            ${apt.pricing?.servicePrice || apt.price || 0}€
                                                        </span>
                                                    </div>
                                                    ${apt.notes ? `
                                                        <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #999; font-style: italic;">
                                                            📝 ${apt.notes}
                                                        </div>
                                                    ` : ''}
                                                </div>
                                                <div style="text-align: right;">
                                                    <span style="background: ${statusColor}; color: white; 
                                                               padding: 0.5rem 1rem; border-radius: 20px; 
                                                               font-size: 0.875rem; font-weight: 500;">
                                                        ${statusText}
                                                    </span>
                                                    ${apt.client?.phone ? `
                                                        <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #666;">
                                                            📱 ${apt.client.phone}
                                                        </div>
                                                    ` : ''}
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
    }
    
    // Fonction globale pour afficher les détails d'un RDV
    window.showAppointmentDetails = function(appointmentId) {
        // Récupérer les appointments depuis le localStorage ou l'API
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
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
                        <span>${new Date(apt.datetime || apt.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Heure:</strong>
                        <span>${new Date(apt.datetime || apt.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
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
                        <button onclick="confirmAppointmentFromPlanning('${apt._id}')" 
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
    
    // Fonction pour confirmer un RDV depuis Planning
    window.confirmAppointmentFromPlanning = async function(appointmentId) {
        const token = localStorage.getItem('token') || 'admin_admin';
        
        try {
            const response = await fetch(`${API_URL}/admin/appointments/${appointmentId}`, {
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
                fixDashboardSync(); // Recharger les données
            }
        } catch (error) {
            console.error('Erreur confirmation:', error);
            alert('Erreur lors de la confirmation');
        }
    };
    
    // Exposer la fonction
    window.fixDashboardSync = fixDashboardSync;
    
    console.log('✅ Fix de synchronisation dashboard installé !');
})();