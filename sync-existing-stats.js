// SYNCHRONISER les statistiques existantes dans l'onglet "Gérer Planning"
console.log('🔄 Sync Existing Stats chargé');

// Fonction immédiatement disponible pour test
window.syncTestLoaded = true;
console.log('✅ [SYNC] Fonction testStatsSync sera disponible dans 2 secondes...');

// Fonction de test immédiatement disponible
window.testStatsSync = function() {
    console.log('🧪 [TEST] Test de synchronisation des statistiques...');
    
    // Simuler des statistiques de test
    const testStats = {
        today: 8,
        thisWeek: 25,
        thisMonth: 67,
        monthlyRevenue: 5420
    };
    
    console.log('🔧 [TEST] Application des statistiques de test:', testStats);
    
    // Mise à jour directe par IDs
    const updates = [
        { id: 'today-count', value: `${testStats.today} RDV`, label: 'Aujourd\'hui' },
        { id: 'week-count', value: `${testStats.thisWeek} RDV`, label: 'Cette semaine' },
        { id: 'month-count', value: `${testStats.thisMonth} RDV`, label: 'Ce mois' },
        { id: 'revenue-count', value: `${testStats.monthlyRevenue}€`, label: 'CA mensuel' }
    ];
    
    let updated = 0;
    updates.forEach(update => {
        const element = document.getElementById(update.id);
        if (element) {
            const oldValue = element.textContent.trim();
            element.textContent = update.value;
            console.log(`✅ [TEST] ${update.label}: "${oldValue}" → "${update.value}"`);
            updated++;
        } else {
            console.log(`⚠️ [TEST] Élément "${update.id}" non trouvé pour ${update.label}`);
        }
    });
    
    console.log(`📊 [TEST] ${updated}/4 éléments mis à jour`);
    
    if (updated === 0) {
        console.log('❌ [TEST] Aucun élément trouvé. Vérifiez que vous êtes dans l\'onglet "Gérer Planning"');
    }
};

// Données des services avec prix
const servicesInfo = {
    "Hydro'Cleaning": { prix: 85, duree: 60 },
    "Renaissance": { prix: 95, duree: 60 },
    "LED Thérapie": { prix: 45, duree: 30 },
    "BB Glow": { prix: 120, duree: 90 },
    "Hydro'Naissance": { prix: 110, duree: 75 },
    "microneedling": { prix: 95, duree: 60 },
    "hydrocleaning": { prix: 85, duree: 60 },
    "led-therapie": { prix: 45, duree: 30 },
    "bb-glow": { prix: 120, duree: 90 },
    "bbglow": { prix: 120, duree: 90 },
    "hydronaissance": { prix: 110, duree: 75 },
    "hydroneedling": { prix: 110, duree: 75 }
};

// Fonction pour synchroniser les statistiques existantes
function syncExistingPlanningStats() {
    console.log('🔄 [SYNC] Synchronisation des statistiques Planning...');
    
    try {
        // Récupérer toutes les réservations
        let allReservations = [];
        
        // allReservations
        const data1 = localStorage.getItem('allReservations');
        if (data1) {
            const parsed1 = JSON.parse(data1);
            if (Array.isArray(parsed1)) {
                allReservations = [...parsed1];
            }
        }
        
        // modernCalendarAppointments
        const data2 = localStorage.getItem('modernCalendarAppointments');
        if (data2) {
            const parsed2 = JSON.parse(data2);
            if (Array.isArray(parsed2)) {
                const newItems = parsed2.filter(item => 
                    !allReservations.some(existing => existing._id && existing._id === item._id)
                );
                allReservations = [...allReservations, ...newItems];
            }
        }
        
        if (allReservations.length === 0) {
            console.log('⚠️ [SYNC] Aucune réservation trouvée');
            return;
        }
        
        // Calculer les statistiques réelles
        const stats = calculateRealStats(allReservations);
        console.log('📊 [SYNC] Statistiques calculées:', stats);
        
        // Mettre à jour les éléments existants dans l'interface
        updateExistingStatsElements(stats);
        
        console.log('✅ [SYNC] Statistiques existantes mises à jour');
        
    } catch (error) {
        console.error('❌ [SYNC] Erreur synchronisation:', error);
    }
}

// Calculer les vraies statistiques
function calculateRealStats(reservations) {
    const now = new Date();
    const today = now.toDateString();
    
    // Début de la semaine (lundi)
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Début du mois
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let todayCount = 0;
    let thisWeekCount = 0;
    let thisMonthCount = 0;
    let monthlyRevenue = 0;
    
    reservations.forEach(res => {
        const resDate = new Date(res.datetime || `${res.date}T${res.time || '00:00'}`);
        
        // Calculer le prix
        let serviceName = 'Service non défini';
        if (res.service) {
            if (typeof res.service === 'string' && res.service !== 'Service non spécifié') {
                serviceName = res.service;
            } else if (res.service.name && res.service.name !== 'Service non spécifié') {
                serviceName = res.service.name;
            } else if (res.service.category) {
                serviceName = res.service.category;
            }
        }
        
        const serviceMap = {
            'hydrocleaning': 'Hydro\'Cleaning',
            'microneedling': 'Renaissance',
            'led-therapie': 'LED Thérapie',
            'bb-glow': 'BB Glow',
            'bbglow': 'BB Glow',
            'hydroneedling': 'Hydro\'Naissance',
            'hydronaissance': 'Hydro\'Naissance'
        };
        serviceName = serviceMap[serviceName] || serviceName;
        
        const serviceInfo = servicesInfo[serviceName] || servicesInfo[serviceName.toLowerCase()];
        const prix = serviceInfo ? serviceInfo.prix : 75;
        
        // Compter par période
        if (resDate.toDateString() === today) {
            todayCount++;
        }
        
        // Fin de semaine (dimanche)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        if (resDate >= startOfWeek && resDate <= endOfWeek) {
            thisWeekCount++;
        }
        
        if (resDate >= startOfMonth) {
            thisMonthCount++;
            monthlyRevenue += prix;
        }
    });
    
    return {
        today: todayCount,
        thisWeek: thisWeekCount,
        thisMonth: thisMonthCount,
        monthlyRevenue: monthlyRevenue
    };
}

// Mettre à jour les éléments statistiques existants dans l'interface
function updateExistingStatsElements(stats) {
    console.log('🎯 [SYNC] Recherche et mise à jour des éléments stats...');
    console.log('📊 [SYNC] Stats à appliquer:', stats);
    
    let elementsUpdated = 0;
    
    // MÉTHODE DIRECTE: Mise à jour par IDs spécifiques trouvés dans le HTML
    const specificUpdates = [
        { id: 'today-count', value: `${stats.today} RDV`, label: 'Aujourd\'hui' },
        { id: 'week-count', value: `${stats.thisWeek} RDV`, label: 'Cette semaine' },
        { id: 'month-count', value: `${stats.thisMonth} RDV`, label: 'Ce mois' },
        { id: 'revenue-count', value: `${stats.monthlyRevenue}€`, label: 'CA mensuel' }
    ];
    
    specificUpdates.forEach(update => {
        const element = document.getElementById(update.id);
        if (element) {
            const oldValue = element.textContent.trim();
            element.textContent = update.value;
            console.log(`✅ [SYNC] ${update.label}: "${oldValue}" → "${update.value}"`);
            elementsUpdated++;
        } else {
            console.log(`⚠️ [SYNC] Élément "${update.id}" non trouvé pour ${update.label}`);
        }
    });
    
    // MÉTHODE DE SECOURS: Si les IDs spécifiques ne marchent pas
    if (elementsUpdated === 0) {
        console.log('⚠️ [SYNC] Méthode directe échoué, recherche par contenu...');
        
        // Chercher tous les éléments span qui contiennent des patterns de statistiques
        const allSpans = document.querySelectorAll('span');
        
        allSpans.forEach(span => {
            const text = span.textContent.trim();
            const parentText = span.parentElement ? span.parentElement.textContent.toLowerCase() : '';
            
            // Pattern pour "X RDV"
            if (/^\d+\s*RDV$/i.test(text)) {
                console.log(`🔍 [SYNC] Pattern RDV trouvé: "${text}" dans contexte: "${parentText}"`);
                
                if (parentText.includes('aujourd\'hui') || parentText.includes('today')) {
                    span.textContent = `${stats.today} RDV`;
                    console.log(`✅ [SYNC] AUJOURD'HUI: ${text} → ${stats.today} RDV`);
                    elementsUpdated++;
                } else if (parentText.includes('semaine') || parentText.includes('week')) {
                    span.textContent = `${stats.thisWeek} RDV`;
                    console.log(`✅ [SYNC] SEMAINE: ${text} → ${stats.thisWeek} RDV`);
                    elementsUpdated++;
                } else if (parentText.includes('mois') || parentText.includes('month') && !parentText.includes('mensuel')) {
                    span.textContent = `${stats.thisMonth} RDV`;
                    console.log(`✅ [SYNC] MOIS: ${text} → ${stats.thisMonth} RDV`);
                    elementsUpdated++;
                }
            }
            
            // Pattern pour "X€"
            if (/^\d+€$/.test(text)) {
                console.log(`🔍 [SYNC] Pattern € trouvé: "${text}" dans contexte: "${parentText}"`);
                
                if (parentText.includes('mensuel') || parentText.includes('ca') || parentText.includes('chiffre')) {
                    span.textContent = `${stats.monthlyRevenue}€`;
                    console.log(`✅ [SYNC] CA MENSUEL: ${text} → ${stats.monthlyRevenue}€`);
                    elementsUpdated++;
                }
            }
        });
    }
    
    // MÉTHODE FORCÉE: En dernier recours
    if (elementsUpdated === 0) {
        console.log('🆘 [SYNC] Toutes les méthodes ont échoué, tentative de mise à jour forcée...');
        
        // Recherche agressive de tous éléments contenant des chiffres cohérents
        const allElements = document.querySelectorAll('*');
        const candidates = [];
        
        allElements.forEach(el => {
            const text = el.textContent.trim();
            const hasOnlyNumbers = /^\d+$/.test(text);
            const hasRDVPattern = /^\d+\s*RDV$/i.test(text);
            const hasEuroPattern = /^\d+€$/.test(text);
            
            if ((hasOnlyNumbers || hasRDVPattern || hasEuroPattern) && parseInt(text) > 0) {
                const parentText = el.parentElement ? el.parentElement.textContent.toLowerCase() : '';
                const value = parseInt(text);
                
                // Ne prendre que des valeurs raisonnables pour des statistiques
                if (value <= 1000) {
                    candidates.push({
                        element: el,
                        text: text,
                        value: value,
                        context: parentText,
                        hasRDV: hasRDVPattern,
                        hasEuro: hasEuroPattern
                    });
                }
            }
        });
        
        console.log(`🎯 [SYNC] ${candidates.length} candidats trouvés pour mise à jour forcée`);
        
        // Trier par pertinence (RDV d'abord, puis €, puis nombres simples)
        candidates.sort((a, b) => {
            if (a.hasRDV && !b.hasRDV) return -1;
            if (!a.hasRDV && b.hasRDV) return 1;
            if (a.hasEuro && !b.hasEuro) return -1;
            if (!a.hasEuro && b.hasEuro) return 1;
            return a.value - b.value;
        });
        
        // Appliquer les mises à jour sur les meilleurs candidats
        if (candidates.length >= 1) {
            const format1 = candidates[0].hasRDV ? `${stats.today} RDV` : stats.today.toString();
            candidates[0].element.textContent = format1;
            console.log(`🔧 [SYNC] FORCÉ - Candidat 1 (${candidates[0].context}): "${candidates[0].text}" → "${format1}"`);
            elementsUpdated++;
        }
        if (candidates.length >= 2) {
            const format2 = candidates[1].hasRDV ? `${stats.thisWeek} RDV` : stats.thisWeek.toString();
            candidates[1].element.textContent = format2;
            console.log(`🔧 [SYNC] FORCÉ - Candidat 2 (${candidates[1].context}): "${candidates[1].text}" → "${format2}"`);
            elementsUpdated++;
        }
        if (candidates.length >= 3) {
            const format3 = candidates[2].hasRDV ? `${stats.thisMonth} RDV` : stats.thisMonth.toString();
            candidates[2].element.textContent = format3;
            console.log(`🔧 [SYNC] FORCÉ - Candidat 3 (${candidates[2].context}): "${candidates[2].text}" → "${format3}"`);
            elementsUpdated++;
        }
        if (candidates.length >= 4) {
            const format4 = candidates[3].hasEuro ? `${stats.monthlyRevenue}€` : `${stats.monthlyRevenue}€`;
            candidates[3].element.textContent = format4;
            console.log(`🔧 [SYNC] FORCÉ - Candidat 4 (${candidates[3].context}): "${candidates[3].text}" → "${format4}"`);
            elementsUpdated++;
        }
    }
    
    console.log(`📊 [SYNC] Résumé final: ${elementsUpdated} éléments mis à jour`);
    
    if (elementsUpdated === 0) {
        console.log('❌ [SYNC] ECHEC TOTAL - Aucune statistique n\'a pu être mise à jour');
        console.log('🔍 [SYNC] Debug: Vérifions si nous sommes dans le bon onglet...');
        
        const planningTab = document.querySelector('[data-section="calendar"]');
        const calendarSection = document.getElementById('calendar');
        
        console.log('📋 [SYNC] Planning tab trouvé:', !!planningTab);
        console.log('📋 [SYNC] Calendar section trouvée:', !!calendarSection);
        console.log('📋 [SYNC] Calendar section visible:', calendarSection ? calendarSection.classList.contains('active') : false);
    }
}

// Fonction publique pour actualiser
window.refreshPlanningStats = function() {
    console.log('🔄 [SYNC] Actualisation manuelle des stats Planning...');
    syncExistingPlanningStats();
};

// Fonction de test pour débugger
window.testStatsSync = function() {
    console.log('🧪 [TEST] Test de synchronisation des statistiques...');
    
    // Simuler des statistiques de test
    const testStats = {
        today: 8,
        thisWeek: 25,
        thisMonth: 67,
        monthlyRevenue: 5420
    };
    
    console.log('🔧 [TEST] Application des statistiques de test:', testStats);
    updateExistingStatsElements(testStats);
    
    console.log('✅ [TEST] Test terminé - vérifiez visuellement les statistiques');
};

// Lancer la synchronisation périodiquement
function startPeriodicSync() {
    console.log('⏰ [SYNC] Démarrage synchronisation périodique...');
    
    // Synchronisation initiale
    setTimeout(() => syncExistingPlanningStats(), 3000);
    
    // Puis toutes les 30 secondes
    setInterval(() => {
        syncExistingPlanningStats();
    }, 30000);
}

// Surveiller les changements dans localStorage
function watchLocalStorageChanges() {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        
        // Si c'est une mise à jour de réservations, synchroniser
        if (key === 'allReservations' || key === 'modernCalendarAppointments') {
            console.log('📡 [SYNC] Changement localStorage détecté, synchronisation...');
            setTimeout(() => syncExistingPlanningStats(), 1000);
        }
    };
}

// Initialisation
setTimeout(() => {
    console.log('🚀 [SYNC] Initialisation synchronisation stats existantes...');
    startPeriodicSync();
    watchLocalStorageChanges();
}, 2000);

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => startPeriodicSync(), 1000);
});

console.log('✅ [SYNC] Sync Existing Stats prêt');