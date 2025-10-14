/**
 * Composant de gestion d'erreur réutilisable
 * Affiche un message d'erreur avec option de retry
 * Évite les doublons en centralisant la gestion
 */

import { XCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  type?: 'error' | 'warning' | 'info';
  className?: string;
}

export default function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Réessayer',
  type = 'error',
  className = ''
}: ErrorStateProps) {
  const icons = {
    error: <XCircleIcon className="h-12 w-12 text-red-500" />,
    warning: <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />,
    info: <ExclamationTriangleIcon className="h-12 w-12 text-blue-500" />
  };

  const colors = {
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="mb-4">
        {icons[type]}
      </div>

      {title && (
        <h3 className={`text-lg font-semibold mb-2 ${colors[type]}`}>
          {title}
        </h3>
      )}

      <p className="text-gray-600 mb-4 max-w-md">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Erreur spécifique pour les problèmes de connexion
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Erreur de connexion"
      message="Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez."
      onRetry={onRetry}
      type="error"
    />
  );
}

/**
 * Erreur spécifique pour les données non trouvées
 */
export function NotFoundError({ message = "Les données demandées n'ont pas été trouvées." }: { message?: string }) {
  return (
    <ErrorState
      title="Introuvable"
      message={message}
      type="warning"
    />
  );
}

/**
 * Erreur spécifique pour les données vides
 */
export function EmptyState({ message, action }: { message: string; action?: { label: string; onClick: () => void } }) {
  return (
    <ErrorState
      message={message}
      onRetry={action?.onClick}
      retryLabel={action?.label}
      type="info"
    />
  );
}
