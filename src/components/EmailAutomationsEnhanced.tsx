'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, Settings, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Edit2, Save, X, RefreshCw, Send, Users, MessageSquare, Info } from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  trigger: string;
  template: string;
  enabled: boolean;
  timing?: any;
  conditions?: any;
  lastRun?: string;
  nextRun?: string;
  description?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function EmailAutomationsEnhanced() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAutomation, setExpandedAutomation] = useState<string | null>(null);
  const [editingAutomation, setEditingAutomation] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [sendingModal, setSendingModal] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    fetchAutomations();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    // Charger les clients

    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const response = await fetch('/api/admin/clients', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setClients(data);
          }
        }
      }
    } catch (error) {
      console.log('Utilisation des données locales');
    }
  };

  const fetchAutomations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        // Données par défaut
        setAutomations([
          {
            id: '1',
            name: '✅ Confirmation de réservation',
            trigger: 'booking_confirmation',
            template: 'template_myu4emv',
            enabled: true,
            timing: { immediate: true },
            description: 'Envoyé immédiatement après réservation'
          },
          {
            id: '2',
            name: '🌟 Demande d\'avis après soin',
            trigger: 'review_request',
            template: 'template_36zodeb',
            enabled: true,
            timing: { hoursAfter: 24 },
            description: 'Envoyé 24h après le soin'
          },
          {
            id: '3',
            name: '📅 Rappel J-1',
            trigger: 'appointment_reminder',
            template: 'template_myu4emv',
            enabled: true,
            timing: { daysBefore: 1, time: '14:00' },
            description: 'Rappel 1 jour avant à 14h',
            nextRun: 'Demain à 14h00'
          },
          {
            id: '4',
            name: '⏰ Rappel 48h avant',
            trigger: 'appointment_reminder_48h',
            template: 'template_myu4emv',
            enabled: true,
            timing: { hoursBefore: 48, time: '10:00' },
            description: 'Rappel 48h avant à 10h',
            nextRun: 'Demain à 10h00'
          },
          {
            id: '5',
            name: '🎂 Email d\'anniversaire',
            trigger: 'birthday',
            template: 'template_36zodeb',
            enabled: true,
            timing: { time: '09:00' },
            conditions: { requiresBirthdate: true },
            description: 'Envoyé le jour de l\'anniversaire à 9h',
            nextRun: 'Demain à 09h00'
          }
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/email-automations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAutomations(data.map((auto: any) => ({
          ...auto,
          timing: auto.timing ? JSON.parse(auto.timing) : null,
          conditions: auto.conditions ? JSON.parse(auto.conditions) : null,
          description: getAutomationDescription(auto)
        })));
      }
    } catch (error) {
      console.error('Erreur chargement automatisations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAutomationDescription = (automation: any) => {
    const timing = automation.timing ? (typeof automation.timing === 'string' ? JSON.parse(automation.timing) : automation.timing) : {};
    let desc = `EmailJS: ${automation.template}`;
    
    if (timing.immediate) {
      desc += ' - Envoi immédiat';
    } else if (timing.hoursAfter) {
      desc += ` - ${timing.hoursAfter}h après`;
    } else if (timing.daysBefore) {
      desc += ` - ${timing.daysBefore}j avant à ${timing.time || '14:00'}`;
    } else if (timing.hoursBefore) {
      desc += ` - ${timing.hoursBefore}h avant`;
    } else if (timing.time) {
      desc += ` - Quotidien à ${timing.time}`;
    }
    
    return desc;
  };

  const toggleAutomation = async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    const newEnabled = !automation.enabled;
    
    // Mise à jour optimiste
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, enabled: newEnabled } : auto
      )
    );

    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        await fetch('/api/admin/email-automations', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id,
            enabled: newEnabled
          })
        });
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      // Annuler la mise à jour optimiste
      setAutomations(prev => 
        prev.map(auto => 
          auto.id === id ? { ...auto, enabled: !newEnabled } : auto
        )
      );
    }
  };

  const handleManualSend = async () => {
    if (!sendingModal || selectedClients.length === 0) return;

    setSending(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/trigger-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          automationId: sendingModal,
          recipients: selectedClients,
          customMessage: customMessage
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Afficher un message de succès dans l'UI au lieu d'une alerte
        setNotification({ type: 'success', message: result.message || 'Emails envoyés avec succès' });
        setSendingModal(null);
        setSelectedClients([]);
        setCustomMessage('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setNotification({ type: 'error', message: errorData.error || 'Erreur lors de l\'envoi' });
      }
    } catch (error) {
      console.error('Erreur envoi manuel:', error);
      setNotification({ type: 'error', message: 'Erreur de connexion lors de l\'envoi' });
    } finally {
      setSending(false);
    }
  };

  const getTemplateInfo = (automation: Automation) => {
    const templates: any = {
      template_myu4emv: {
        name: 'Confirmation de réservation',
        fields: ['client_name', 'appointment_date', 'appointment_time', 'service_name'],
        preview: `Bonjour {{client_name}},

Votre réservation pour {{service_name}} est confirmée pour le {{appointment_date}} à {{appointment_time}}.

À très bientôt,
LAIA SKIN Institut`
      },
      template_36zodeb: {
        name: 'Avis & Fidélité',
        fields: ['client_name', 'service_name', 'review_link', 'loyalty_progress'],
        preview: `Bonjour {{client_name}},

Comment s'est passé votre {{service_name}} ?

Partagez votre expérience et gagnez des points fidélité !

Merci,
LAIA SKIN Institut`
      }
    };

    return templates[automation.template] || {
      name: automation.template,
      fields: [],
      preview: 'Template personnalisé'
    };
  };

  const saveAutomation = async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    setSaving(id);
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        await fetch('/api/admin/email-automations', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id,
            name: automation.name,
            enabled: automation.enabled
          })
        });
      }
      setEditingAutomation(null);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setSaving(null);
    }
  };

  const updateAutomation = (id: string, updates: Partial<Automation>) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, ...updates } : auto
      )
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-2">Chargement des automatisations...</p>
        </div>
      </div>
    );
  }

  // Effacer la notification après 5 secondes
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`rounded-xl p-4 mb-4 transition-all ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className={`font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto p-1 hover:bg-white/50 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Alerte importante */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-900 mb-1">Configuration Vercel requise</h4>
            <p className="text-sm text-yellow-800">
              Les automatisations sont configurées mais nécessitent les cron jobs Vercel pour s'exécuter automatiquement.
              Les rappels J-1 (14h), 48h avant (10h), anniversaires (9h) et demandes d'avis (15h) sont programmés dans <code className="bg-yellow-100 px-1 rounded">vercel.json</code>.
            </p>
            <p className="text-sm text-yellow-800 mt-2">
              En attendant, vous pouvez <strong>envoyer manuellement</strong> chaque automatisation avec le bouton <Send className="w-4 h-4 inline text-blue-600" />.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-500" />
            Automatisations Email
          </h3>
          <button
            onClick={fetchAutomations}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {automations.map(auto => (
            <div
              key={auto.id}
              className={`border rounded-lg p-4 transition-all ${
                auto.enabled 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {auto.enabled ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <h4 className="font-semibold text-gray-900">{auto.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      auto.enabled 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {auto.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 ml-8">{auto.description}</p>
                  {auto.nextRun && auto.enabled && (
                    <p className="text-xs text-blue-600 mt-1 ml-8 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Prochain envoi : {auto.nextRun}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAutomation(auto.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      auto.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        auto.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => setSendingModal(auto.id)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                    title="Envoyer manuellement"
                  >
                    <Send className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  </button>

                  <button
                    onClick={() => setEditingAutomation(auto.id === editingAutomation ? null : auto.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>

                  <button
                    onClick={() => setExpandedAutomation(auto.id === expandedAutomation ? null : auto.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedAutomation === auto.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {editingAutomation === auto.id && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de l'automatisation
                      </label>
                      <input
                        type="text"
                        value={auto.name}
                        onChange={(e) => updateAutomation(auto.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveAutomation(auto.id)}
                        disabled={saving === auto.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving === auto.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingAutomation(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2 hover:bg-gray-700"
                      >
                        <X className="w-4 h-4" />
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {expandedAutomation === auto.id && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-gray-900 mb-3">Configuration EmailJS</h5>
                  {(() => {
                    const templateInfo = getTemplateInfo(auto);
                    return (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Template ID :</p>
                          <p className="font-mono bg-gray-50 px-3 py-2 rounded border">{auto.template}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Type :</p>
                          <p className="font-medium">{templateInfo.name}</p>
                        </div>

                        {auto.timing && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Déclenchement :</p>
                            <div className="bg-gray-50 p-3 rounded border text-sm">
                              {auto.timing.immediate && 'Envoi immédiat après l\'événement'}
                              {auto.timing.hoursAfter && `Envoi ${auto.timing.hoursAfter}h après l'événement`}
                              {auto.timing.daysBefore && `Envoi ${auto.timing.daysBefore} jour(s) avant à ${auto.timing.time || '14:00'}`}
                              {auto.timing.hoursBefore && `Envoi ${auto.timing.hoursBefore}h avant l'événement`}
                              {auto.timing.time && !auto.timing.daysBefore && `Envoi quotidien à ${auto.timing.time}`}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Variables utilisées :</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {templateInfo.fields.map((field: string) => (
                              <span key={field} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {`{{${field}}}`}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Service ID :</strong> default_service<br/>
                            <strong>De :</strong> contact@laia.skininstitut.fr<br/>
                            <strong>User ID :</strong> QK6MriGN3B0UqkIoS
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal d'envoi manuel */}
      {sendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-500" />
                  Envoyer manuellement : {automations.find(a => a.id === sendingModal)?.name}
                </h3>
                <button
                  onClick={() => {
                    setSendingModal(null);
                    setSelectedClients([]);
                    setCustomMessage('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Sélection des destinataires */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Sélectionnez les destinataires
                </label>
                <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <div className="mb-2">
                    <button
                      onClick={() => {
                        if (selectedClients.length === clients.length) {
                          setSelectedClients([]);
                        } else {
                          setSelectedClients(clients.map(c => c.email));
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedClients.length === clients.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                  </div>
                  {clients.map(client => (
                    <label
                      key={client.id}
                      className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.email)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClients([...selectedClients, client.email]);
                          } else {
                            setSelectedClients(selectedClients.filter(email => email !== client.email));
                          }
                        }}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedClients.length} destinataire(s) sélectionné(s)
                </p>
              </div>

              {/* Message personnalisé optionnel */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Message personnalisé (optionnel)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Ajoutez un message personnalisé qui sera inclus dans l'email..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce message sera ajouté au template de l'automatisation
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSendingModal(null);
                    setSelectedClients([]);
                    setCustomMessage('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleManualSend}
                  disabled={sending || selectedClients.length === 0}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                    sending || selectedClients.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                  }`}
                >
                  {sending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer à {selectedClients.length} destinataire(s)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}