'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, Settings, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Edit2, Save, X, RefreshCw } from 'lucide-react';

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

export default function EmailAutomationsManager() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAutomation, setExpandedAutomation] = useState<string | null>(null);
  const [editingAutomation, setEditingAutomation] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchAutomations();
  }, []);

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
            description: 'Rappel 1 jour avant à 14h'
          },
          {
            id: '4',
            name: '⏰ Rappel 48h avant',
            trigger: 'appointment_reminder_48h',
            template: 'template_myu4emv',
            enabled: true,
            timing: { hoursBefore: 48, time: '10:00' },
            description: 'Rappel 48h avant à 10h'
          },
          {
            id: '5',
            name: '🎂 Email d\'anniversaire',
            trigger: 'birthday',
            template: 'template_36zodeb',
            enabled: true,
            timing: { time: '09:00' },
            conditions: { requiresBirthdate: true },
            description: 'Envoyé le jour de l\'anniversaire à 9h'
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

  return (
    <div className="space-y-6">
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

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Aperçu :</p>
                          <div className="bg-gray-50 p-3 rounded border text-sm whitespace-pre-wrap">
                            {templateInfo.preview}
                          </div>
                        </div>

                        {auto.conditions && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Conditions :</p>
                            <ul className="text-sm text-gray-700 list-disc list-inside">
                              {auto.conditions.requiresBirthdate && (
                                <li>Date de naissance du client requise</li>
                              )}
                            </ul>
                          </div>
                        )}

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
    </div>
  );
}