'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Mail, Phone, Calendar, Eye, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface CommunicationHistory {
  id: string;
  type: 'whatsapp' | 'email';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  templateUsed?: string;
  subject?: string;
}

interface ClientCommunicationHistoryProps {
  clientId: string;
  clientName: string;
  onSendMessage?: () => void;
}

const ClientCommunicationHistory: React.FC<ClientCommunicationHistoryProps> = ({ 
  clientId, 
  clientName, 
  onSendMessage 
}) => {
  const [communications, setCommunications] = useState<CommunicationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (clientId) {
      loadCommunications();
    }
  }, [clientId]);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/clients/${clientId}/communications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Convertir les timestamps en objets Date
        const processedData = data.map((comm: any) => ({
          ...comm,
          timestamp: new Date(comm.timestamp)
        }));
        setCommunications(processedData);
      } else {
        setError('Erreur lors du chargement de l\'historique');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'read':
        return <Eye className="w-4 h-4 text-purple-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Envoyé';
      case 'delivered':
        return 'Livré';
      case 'read':
        return 'Lu';
      case 'failed':
        return 'Échec';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-green-600" />;
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-[#c9a084]" />
          <span className="ml-2 text-stone-600">Chargement de l'historique...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCommunications}
            className="px-4 py-2 bg-[#c9a084] text-white rounded-lg hover:bg-[#b8956f] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-[#c9a084]" />
          <h3 className="text-xl font-bold text-stone-800">
            Historique des communications
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadCommunications}
            className="p-2 text-stone-500 hover:text-stone-700 transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          {onSendMessage && (
            <button
              onClick={onSendMessage}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Nouveau message
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 p-3 bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-lg">
        <p className="text-sm text-stone-700">
          <strong>Client :</strong> {clientName}
        </p>
        <p className="text-xs text-stone-500 mt-1">
          {communications.length} communication(s) enregistrée(s)
        </p>
      </div>

      {communications.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">Aucune communication enregistrée</p>
          <p className="text-sm text-stone-400 mt-1">
            Les messages et emails envoyés apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {communications.map((comm) => (
            <div
              key={comm.id}
              className="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(comm.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-[#c9a084] capitalize">
                        {comm.type === 'whatsapp' ? 'WhatsApp' : 'Email'}
                      </span>
                      {comm.templateUsed && (
                        <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                          {comm.templateUsed}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        {getStatusIcon(comm.status)}
                        <span className="text-xs text-stone-500">
                          {getStatusLabel(comm.status)}
                        </span>
                      </div>
                    </div>

                    {comm.subject && (
                      <p className="text-sm font-medium text-stone-800 mb-1">
                        {comm.subject}
                      </p>
                    )}

                    <div className="text-sm text-stone-700">
                      {expandedItems.has(comm.id) ? (
                        <p className="whitespace-pre-wrap">{comm.content}</p>
                      ) : (
                        <p>{truncateContent(comm.content)}</p>
                      )}
                      
                      {comm.content.length > 100 && (
                        <button
                          onClick={() => toggleExpanded(comm.id)}
                          className="text-[#c9a084] hover:text-[#b8956f] text-xs mt-1 transition-colors"
                        >
                          {expandedItems.has(comm.id) ? 'Voir moins' : 'Voir plus'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {comm.timestamp.toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {comm.timestamp.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {communications.length > 0 && (
        <div className="mt-6 pt-4 border-t border-stone-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <Mail className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-blue-800">
                {communications.filter(c => c.type === 'email').length}
              </p>
              <p className="text-xs text-blue-600">Emails</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <MessageCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-800">
                {communications.filter(c => c.type === 'whatsapp').length}
              </p>
              <p className="text-xs text-green-600">WhatsApp</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <Eye className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-purple-800">
                {communications.filter(c => c.status === 'read').length}
              </p>
              <p className="text-xs text-purple-600">Messages lus</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCommunicationHistory;