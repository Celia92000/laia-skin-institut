// Utilitaires pour la gestion de l'authentification côté client

export const clearAuthData = () => {
  // Nettoyer toutes les données d'authentification
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberEmail');
  localStorage.removeItem('rememberPassword');
  localStorage.removeItem('rememberMe');
};

export const isValidToken = (token: string): boolean => {
  if (!token) return false;

  try {
    // Vérifier que le token a la bonne structure (3 parties séparées par des points)
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Décoder la partie payload pour vérifier l'expiration
    const payload = JSON.parse(atob(parts[1]));

    // Vérifier si le token a expiré
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const checkAndCleanAuth = () => {
  const token = localStorage.getItem('token');

  if (token && !isValidToken(token)) {
    console.log('Token invalide détecté, nettoyage des données d\'authentification');
    clearAuthData();
    return false;
  }

  return true;
};

export const saveAuthData = (token: string, user: any) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getAuthToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (token && isValidToken(token)) {
    return token;
  }
  clearAuthData();
  return null;
};