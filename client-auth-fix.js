// Fix pour l'authentification client
// Ce script permet aux clients de se connecter avec leurs identifiants de réservation

// Fonction pour se connecter
async function clientLogin(email, password) {
    try {
        // Récupérer toutes les réservations depuis localStorage
        const allBookings = JSON.parse(localStorage.getItem('allReservations') || '[]');
        
        // Chercher une réservation avec cet email
        const userBookings = allBookings.filter(booking => 
            booking.email === email || 
            booking.client?.email === email
        );
        
        if (userBookings.length > 0) {
            // Pour l'instant, accepter n'importe quel mot de passe pour la démo
            // En production, il faudrait vérifier le hash du mot de passe
            
            // Créer une session client
            const clientData = {
                email: email,
                name: userBookings[0].clientName || userBookings[0].client?.name || 'Client',
                phone: userBookings[0].phone || userBookings[0].client?.phone || '',
                bookings: userBookings,
                loginTime: new Date().toISOString()
            };
            
            // Sauvegarder la session
            localStorage.setItem('currentClient', JSON.stringify(clientData));
            localStorage.setItem('clientToken', 'client_' + Date.now());
            
            return {
                success: true,
                client: clientData
            };
        } else {
            return {
                success: false,
                message: 'Aucun compte trouvé avec cet email'
            };
        }
    } catch (error) {
        console.error('Erreur login:', error);
        return {
            success: false,
            message: 'Erreur de connexion'
        };
    }
}

// Fonction pour vérifier si un client est connecté
function isClientLoggedIn() {
    const clientToken = localStorage.getItem('clientToken');
    const currentClient = localStorage.getItem('currentClient');
    return clientToken && currentClient;
}

// Fonction pour déconnecter le client
function clientLogout() {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('currentClient');
    window.location.href = 'connexion-espace-client.html';
}

// Fonction pour récupérer les données du client connecté
function getCurrentClient() {
    const clientData = localStorage.getItem('currentClient');
    return clientData ? JSON.parse(clientData) : null;
}

// Export pour utilisation dans d'autres fichiers
window.clientAuth = {
    login: clientLogin,
    logout: clientLogout,
    isLoggedIn: isClientLoggedIn,
    getCurrentClient: getCurrentClient
};