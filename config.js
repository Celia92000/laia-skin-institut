// Configuration de l'API
// Remplacez cette URL par l'URL de votre API Render une fois déployée
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001'  // En développement local
    : 'https://laia-skin-api.onrender.com';  // API déployée sur Render

// Export pour utilisation dans d'autres scripts
window.API_CONFIG = {
    baseURL: API_URL,
    endpoints: {
        login: `${API_URL}/api/auth/login`,
        register: `${API_URL}/api/auth/register`,
        appointments: `${API_URL}/api/appointments`,
        clients: `${API_URL}/api/clients`,
        services: `${API_URL}/api/services`,
        availability: `${API_URL}/api/availability`,
        payments: `${API_URL}/api/payments`,
        loyalty: `${API_URL}/api/loyalty`
    }
};

console.log('API configurée pour:', API_URL);