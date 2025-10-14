'use client';

import React, { useState, useCallback } from 'react';
import {
  Zap, Plus, Trash2, Save, Play, ChevronDown, ChevronRight,
  GitBranch, Filter, MessageCircle, Mail, Tag, Bell, Clock,
  User, Calendar, Award, TrendingUp, X, Check, Copy, ArrowRight,
  Settings, Eye, Code, Sparkles, Target, Users, ShoppingBag
} from 'lucide-react';

// Types pour le workflow builder
interface WorkflowCondition {
  id: string;
  type: 'clientType' | 'totalSpent' | 'visitCount' | 'lastVisit' | 'tags' | 'service' | 'date' | 'custom';
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'in' | 'between';
  value: any;
  value2?: any; // Pour "between"
  label?: string;
}

interface WorkflowConditionGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: WorkflowCondition[];
}

interface WorkflowAction {
  id: string;
  type: 'message' | 'email' | 'tag' | 'notification' | 'wait' | 'webhook';
  config: {
    channel?: 'whatsapp' | 'email' | 'sms';
    template?: string;
    content?: string;
    delay?: number;
    tagName?: string;
    webhookUrl?: string;
  };
}

interface WorkflowBranch {
  id: string;
  name: string;
  conditionGroups: WorkflowConditionGroup[];
  groupLogic: 'AND' | 'OR'; // Entre les groupes
  actions: WorkflowAction[];
  order: number;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'reservation' | 'time' | 'client' | 'loyalty' | 'manual';
    config: any;
  };
  branches: WorkflowBranch[];
  elseBranch?: WorkflowAction[]; // Actions par défaut si aucune branche ne match
  enabled: boolean;
  createdAt: Date;
  stats?: {
    triggered: number;
    branch1: number;
    branch2: number;
    branch3: number;
    else: number;
  };
}

const conditionTypeLabels = {
  clientType: 'Type de client',
  totalSpent: 'Dépenses totales',
  visitCount: 'Nombre de visites',
  lastVisit: 'Dernière visite',
  tags: 'Tags',
  service: 'Service réservé',
  date: 'Date',
  custom: 'Personnalisé'
};

const operatorLabels = {
  equals: 'est égal à',
  notEquals: 'est différent de',
  greaterThan: 'est supérieur à',
  lessThan: 'est inférieur à',
  contains: 'contient',
  in: 'est dans',
  between: 'est entre'
};

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Anniversaire VIP vs Standard',
      description: 'Envoie différents messages selon le statut du client',
      trigger: {
        type: 'time',
        config: { event: 'birthday', time: '09:00' }
      },
      branches: [
        {
          id: 'b1',
          name: 'Clients VIP',
          conditionGroups: [{
            id: 'cg1',
            logic: 'AND',
            conditions: [{
              id: 'c1',
              type: 'totalSpent',
              operator: 'greaterThan',
              value: 1000,
              label: 'Dépenses > 1000€'
            }]
          }],
          groupLogic: 'AND',
          actions: [{
            id: 'a1',
            type: 'message',
            config: {
              channel: 'whatsapp',
              content: '🎂 Joyeux anniversaire {clientName} ! 🎉\n\nVous êtes VIP ✨\n\n🎁 -30% sur tous les soins\n🥂 Champagne offert\n💎 1 soin LED OFFERT\n\nRéservez : laiaskin.com'
            }
          }],
          order: 1
        },
        {
          id: 'b2',
          name: 'Clients réguliers',
          conditionGroups: [{
            id: 'cg2',
            logic: 'AND',
            conditions: [{
              id: 'c2',
              type: 'visitCount',
              operator: 'greaterThan',
              value: 3,
              label: 'Visites > 3'
            }]
          }],
          groupLogic: 'AND',
          actions: [{
            id: 'a2',
            type: 'message',
            config: {
              channel: 'whatsapp',
              content: '🎂 Joyeux anniversaire {clientName} ! 🎉\n\n🎁 -15% sur le soin de votre choix\n\nOffre valable tout le mois !\n\nRéservez : laiaskin.com'
            }
          }],
          order: 2
        }
      ],
      elseBranch: [{
        id: 'else1',
        type: 'message',
        config: {
          channel: 'whatsapp',
          content: '🎂 Joyeux anniversaire {clientName} ! 🎉\n\nBelle journée ! 💕'
        }
      }],
      enabled: true,
      createdAt: new Date('2024-01-15'),
      stats: {
        triggered: 87,
        branch1: 12,
        branch2: 45,
        branch3: 0,
        else: 30
      }
    }
  ]);

  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [previewMode, setPreviewMode] = useState(false);

  const toggleBranch = (branchId: string) => {
    const newExpanded = new Set(expandedBranches);
    if (newExpanded.has(branchId)) {
      newExpanded.delete(branchId);
    } else {
      newExpanded.add(branchId);
    }
    setExpandedBranches(newExpanded);
  };

  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: 'Nouveau workflow',
      description: '',
      trigger: {
        type: 'client',
        config: {}
      },
      branches: [],
      enabled: false,
      createdAt: new Date()
    };
    setEditingWorkflow(newWorkflow);
    setShowBuilder(true);
  };

  const addBranch = () => {
    if (!editingWorkflow) return;

    const newBranch: WorkflowBranch = {
      id: `b${Date.now()}`,
      name: `Branche ${editingWorkflow.branches.length + 1}`,
      conditionGroups: [{
        id: `cg${Date.now()}`,
        logic: 'AND',
        conditions: []
      }],
      groupLogic: 'AND',
      actions: [],
      order: editingWorkflow.branches.length + 1
    };

    setEditingWorkflow({
      ...editingWorkflow,
      branches: [...editingWorkflow.branches, newBranch]
    });
  };

  const addCondition = (branchId: string, groupId: string) => {
    if (!editingWorkflow) return;

    const newCondition: WorkflowCondition = {
      id: `c${Date.now()}`,
      type: 'clientType',
      operator: 'equals',
      value: ''
    };

    setEditingWorkflow({
      ...editingWorkflow,
      branches: editingWorkflow.branches.map(b => {
        if (b.id === branchId) {
          return {
            ...b,
            conditionGroups: b.conditionGroups.map(cg => {
              if (cg.id === groupId) {
                return {
                  ...cg,
                  conditions: [...cg.conditions, newCondition]
                };
              }
              return cg;
            })
          };
        }
        return b;
      })
    });
  };

  const addConditionGroup = (branchId: string) => {
    if (!editingWorkflow) return;

    const newGroup: WorkflowConditionGroup = {
      id: `cg${Date.now()}`,
      logic: 'AND',
      conditions: []
    };

    setEditingWorkflow({
      ...editingWorkflow,
      branches: editingWorkflow.branches.map(b => {
        if (b.id === branchId) {
          return {
            ...b,
            conditionGroups: [...b.conditionGroups, newGroup]
          };
        }
        return b;
      })
    });
  };

  const addAction = (branchId: string) => {
    if (!editingWorkflow) return;

    const newAction: WorkflowAction = {
      id: `a${Date.now()}`,
      type: 'message',
      config: {
        channel: 'whatsapp',
        content: ''
      }
    };

    setEditingWorkflow({
      ...editingWorkflow,
      branches: editingWorkflow.branches.map(b => {
        if (b.id === branchId) {
          return {
            ...b,
            actions: [...b.actions, newAction]
          };
        }
        return b;
      })
    });
  };

  const saveWorkflow = () => {
    if (!editingWorkflow) return;

    const existingIndex = workflows.findIndex(w => w.id === editingWorkflow.id);
    if (existingIndex >= 0) {
      setWorkflows(workflows.map((w, i) => i === existingIndex ? editingWorkflow : w));
    } else {
      setWorkflows([...workflows, editingWorkflow]);
    }

    setShowBuilder(false);
    setEditingWorkflow(null);
  };

  const deleteWorkflow = (id: string) => {
    if (confirm('Supprimer ce workflow ?')) {
      setWorkflows(workflows.filter(w => w.id !== id));
    }
  };

  const renderCondition = (condition: WorkflowCondition, branchId: string, groupId: string) => {
    return (
      <div key={condition.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <select
            value={condition.type}
            onChange={(e) => {
              if (!editingWorkflow) return;
              setEditingWorkflow({
                ...editingWorkflow,
                branches: editingWorkflow.branches.map(b => {
                  if (b.id === branchId) {
                    return {
                      ...b,
                      conditionGroups: b.conditionGroups.map(cg => {
                        if (cg.id === groupId) {
                          return {
                            ...cg,
                            conditions: cg.conditions.map(c =>
                              c.id === condition.id ? { ...c, type: e.target.value as any } : c
                            )
                          };
                        }
                        return cg;
                      })
                    };
                  }
                  return b;
                })
              });
            }}
            className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm font-medium"
          >
            {Object.entries(conditionTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={condition.operator}
            onChange={(e) => {
              if (!editingWorkflow) return;
              setEditingWorkflow({
                ...editingWorkflow,
                branches: editingWorkflow.branches.map(b => {
                  if (b.id === branchId) {
                    return {
                      ...b,
                      conditionGroups: b.conditionGroups.map(cg => {
                        if (cg.id === groupId) {
                          return {
                            ...cg,
                            conditions: cg.conditions.map(c =>
                              c.id === condition.id ? { ...c, operator: e.target.value as any } : c
                            )
                          };
                        }
                        return cg;
                      })
                    };
                  }
                  return b;
                })
              });
            }}
            className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm"
          >
            {Object.entries(operatorLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <input
            type={condition.type === 'totalSpent' || condition.type === 'visitCount' ? 'number' : 'text'}
            value={condition.value}
            onChange={(e) => {
              if (!editingWorkflow) return;
              setEditingWorkflow({
                ...editingWorkflow,
                branches: editingWorkflow.branches.map(b => {
                  if (b.id === branchId) {
                    return {
                      ...b,
                      conditionGroups: b.conditionGroups.map(cg => {
                        if (cg.id === groupId) {
                          return {
                            ...cg,
                            conditions: cg.conditions.map(c =>
                              c.id === condition.id ? { ...c, value: e.target.value } : c
                            )
                          };
                        }
                        return cg;
                      })
                    };
                  }
                  return b;
                })
              });
            }}
            placeholder="Valeur..."
            className="flex-1 px-3 py-1.5 border border-blue-300 rounded-lg text-sm"
          />

          <button
            onClick={() => {
              if (!editingWorkflow) return;
              setEditingWorkflow({
                ...editingWorkflow,
                branches: editingWorkflow.branches.map(b => {
                  if (b.id === branchId) {
                    return {
                      ...b,
                      conditionGroups: b.conditionGroups.map(cg => {
                        if (cg.id === groupId) {
                          return {
                            ...cg,
                            conditions: cg.conditions.filter(c => c.id !== condition.id)
                          };
                        }
                        return cg;
                      })
                    };
                  }
                  return b;
                })
              });
            }}
            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    );
  };

  const renderAction = (action: WorkflowAction, branchId: string) => {
    const icons = {
      message: <MessageCircle className="w-4 h-4" />,
      email: <Mail className="w-4 h-4" />,
      tag: <Tag className="w-4 h-4" />,
      notification: <Bell className="w-4 h-4" />,
      wait: <Clock className="w-4 h-4" />,
      webhook: <Code className="w-4 h-4" />
    };

    return (
      <div key={action.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {icons[action.type]}
          </div>
          <div className="flex-1 space-y-3">
            <select
              value={action.type}
              onChange={(e) => {
                if (!editingWorkflow) return;
                setEditingWorkflow({
                  ...editingWorkflow,
                  branches: editingWorkflow.branches.map(b => {
                    if (b.id === branchId) {
                      return {
                        ...b,
                        actions: b.actions.map(a =>
                          a.id === action.id ? { ...a, type: e.target.value as any } : a
                        )
                      };
                    }
                    return b;
                  })
                });
              }}
              className="w-full px-3 py-2 border border-green-300 rounded-lg font-medium"
            >
              <option value="message">Message WhatsApp</option>
              <option value="email">Email</option>
              <option value="tag">Ajouter un tag</option>
              <option value="notification">Notification</option>
              <option value="wait">Attendre</option>
              <option value="webhook">Webhook</option>
            </select>

            {(action.type === 'message' || action.type === 'email') && (
              <textarea
                value={action.config.content || ''}
                onChange={(e) => {
                  if (!editingWorkflow) return;
                  setEditingWorkflow({
                    ...editingWorkflow,
                    branches: editingWorkflow.branches.map(b => {
                      if (b.id === branchId) {
                        return {
                          ...b,
                          actions: b.actions.map(a =>
                            a.id === action.id ? {
                              ...a,
                              config: { ...a.config, content: e.target.value }
                            } : a
                          )
                        };
                      }
                      return b;
                    })
                  });
                }}
                placeholder="Contenu du message..."
                rows={4}
                className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm"
              />
            )}
          </div>
          <button
            onClick={() => {
              if (!editingWorkflow) return;
              setEditingWorkflow({
                ...editingWorkflow,
                branches: editingWorkflow.branches.map(b => {
                  if (b.id === branchId) {
                    return {
                      ...b,
                      actions: b.actions.filter(a => a.id !== action.id)
                    };
                  }
                  return b;
                })
              });
            }}
            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="w-7 h-7 text-purple-500" />
            Workflows Intelligents
          </h2>
          <p className="text-gray-600 mt-1">
            Créez des automatisations complexes avec conditions multiples
          </p>
        </div>
        <button
          onClick={createNewWorkflow}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau workflow
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-purple-900">{workflows.length}</span>
          </div>
          <p className="text-purple-700 text-sm font-medium">Workflows actifs</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <GitBranch className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-blue-900">
              {workflows.reduce((sum, w) => sum + w.branches.length, 0)}
            </span>
          </div>
          <p className="text-blue-700 text-sm font-medium">Branches totales</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-green-900">
              {workflows.reduce((sum, w) => sum + (w.stats?.triggered || 0), 0)}
            </span>
          </div>
          <p className="text-green-700 text-sm font-medium">Déclenchements</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-orange-900">87%</span>
          </div>
          <p className="text-orange-700 text-sm font-medium">Taux de succès</p>
        </div>
      </div>

      {/* Workflows list */}
      <div className="space-y-4">
        {workflows.map(workflow => (
          <div key={workflow.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{workflow.name}</h3>
                    {workflow.enabled && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Actif
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>

                  {/* Visual workflow preview */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                      <Clock className="w-3 h-3" />
                      Déclencheur: {workflow.trigger.type}
                    </div>
                    <ArrowRight className="w-3 h-3" />
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                      <GitBranch className="w-3 h-3" />
                      {workflow.branches.length} branche(s)
                    </div>
                    {workflow.stats && (
                      <>
                        <ArrowRight className="w-3 h-3" />
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                          <Target className="w-3 h-3" />
                          {workflow.stats.triggered} déclenchements
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingWorkflow(workflow);
                      setShowBuilder(true);
                    }}
                    className="px-3 py-2 bg-white hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteWorkflow(workflow.id)}
                    className="px-3 py-2 bg-white hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats per branch */}
            {workflow.stats && (
              <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 border-t">
                {workflow.branches.map((branch, idx) => (
                  <div key={branch.id} className="text-center">
                    <p className="text-xs text-gray-500">{branch.name}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {workflow.stats?.[`branch${idx + 1}` as keyof typeof workflow.stats] || 0}
                    </p>
                  </div>
                ))}
                {workflow.elseBranch && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Sinon (défaut)</p>
                    <p className="text-lg font-bold text-gray-900">{workflow.stats.else}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {workflows.length === 0 && (
          <div className="text-center py-12">
            <GitBranch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun workflow créé
            </h3>
            <p className="text-gray-600 mb-4">
              Créez votre premier workflow intelligent avec conditions multiples
            </p>
            <button
              onClick={createNewWorkflow}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
            >
              Créer un workflow
            </button>
          </div>
        )}
      </div>

      {/* Workflow Builder Modal */}
      {showBuilder && editingWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Éditeur de Workflow
                  </h3>
                  <input
                    type="text"
                    value={editingWorkflow.name}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                    className="text-lg font-medium px-3 py-1 border border-gray-300 rounded-lg"
                    placeholder="Nom du workflow"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      previewMode
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="w-4 h-4 inline mr-2" />
                    Aperçu
                  </button>
                  <button
                    onClick={() => {
                      setShowBuilder(false);
                      setEditingWorkflow(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!previewMode ? (
                <div className="space-y-6">
                  {/* Trigger */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Déclencheur
                    </h4>
                    <select
                      value={editingWorkflow.trigger.type}
                      onChange={(e) => setEditingWorkflow({
                        ...editingWorkflow,
                        trigger: { ...editingWorkflow.trigger, type: e.target.value as any }
                      })}
                      className="px-4 py-2 border border-yellow-300 rounded-lg font-medium"
                    >
                      <option value="reservation">Réservation</option>
                      <option value="time">Horaire / Date</option>
                      <option value="client">Événement client</option>
                      <option value="loyalty">Programme fidélité</option>
                      <option value="manual">Manuel</option>
                    </select>
                  </div>

                  {/* Branches */}
                  {editingWorkflow.branches.map((branch, branchIndex) => (
                    <div key={branch.id} className="border-2 border-purple-200 rounded-lg overflow-hidden">
                      {/* Branch header */}
                      <div className="bg-purple-100 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => toggleBranch(branch.id)}
                              className="p-1 hover:bg-purple-200 rounded"
                            >
                              {expandedBranches.has(branch.id) ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </button>
                            <div className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center font-bold">
                              {branchIndex === 0 ? 'SI' : 'SINON SI'}
                            </div>
                            <input
                              type="text"
                              value={branch.name}
                              onChange={(e) => setEditingWorkflow({
                                ...editingWorkflow,
                                branches: editingWorkflow.branches.map(b =>
                                  b.id === branch.id ? { ...b, name: e.target.value } : b
                                )
                              })}
                              className="flex-1 px-3 py-1.5 border border-purple-300 rounded-lg font-medium"
                              placeholder="Nom de la branche"
                            />
                          </div>
                          <button
                            onClick={() => {
                              if (confirm('Supprimer cette branche ?')) {
                                setEditingWorkflow({
                                  ...editingWorkflow,
                                  branches: editingWorkflow.branches.filter(b => b.id !== branch.id)
                                });
                              }
                            }}
                            className="p-2 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Branch content */}
                      {expandedBranches.has(branch.id) && (
                        <div className="p-4 space-y-4">
                          {/* Condition Groups */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-gray-900 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Conditions
                              </h5>
                              <button
                                onClick={() => addConditionGroup(branch.id)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                              >
                                + Groupe de conditions
                              </button>
                            </div>

                            {branch.conditionGroups.map((group, groupIndex) => (
                              <div key={group.id} className="mb-4">
                                {groupIndex > 0 && (
                                  <div className="flex items-center justify-center my-2">
                                    <select
                                      value={branch.groupLogic}
                                      onChange={(e) => setEditingWorkflow({
                                        ...editingWorkflow,
                                        branches: editingWorkflow.branches.map(b =>
                                          b.id === branch.id ? { ...b, groupLogic: e.target.value as 'AND' | 'OR' } : b
                                        )
                                      })}
                                      className="px-3 py-1 bg-gray-200 rounded-lg font-bold text-sm"
                                    >
                                      <option value="AND">ET</option>
                                      <option value="OR">OU</option>
                                    </select>
                                  </div>
                                )}

                                <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/30">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-blue-700">
                                      Groupe {groupIndex + 1}
                                    </span>
                                    <select
                                      value={group.logic}
                                      onChange={(e) => setEditingWorkflow({
                                        ...editingWorkflow,
                                        branches: editingWorkflow.branches.map(b => {
                                          if (b.id === branch.id) {
                                            return {
                                              ...b,
                                              conditionGroups: b.conditionGroups.map(cg =>
                                                cg.id === group.id ? { ...cg, logic: e.target.value as 'AND' | 'OR' } : cg
                                              )
                                            };
                                          }
                                          return b;
                                        })
                                      })}
                                      className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-bold"
                                    >
                                      <option value="AND">ET</option>
                                      <option value="OR">OU</option>
                                    </select>
                                  </div>

                                  <div className="space-y-2">
                                    {group.conditions.map((condition, condIndex) => (
                                      <div key={condition.id}>
                                        {condIndex > 0 && (
                                          <div className="text-center text-xs font-bold text-blue-700 my-1">
                                            {group.logic}
                                          </div>
                                        )}
                                        {renderCondition(condition, branch.id, group.id)}
                                      </div>
                                    ))}

                                    <button
                                      onClick={() => addCondition(branch.id, group.id)}
                                      className="w-full px-3 py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 text-sm font-medium"
                                    >
                                      + Ajouter une condition
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Actions */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-gray-900 flex items-center gap-2">
                                <ArrowRight className="w-4 h-4" />
                                Actions (ALORS)
                              </h5>
                              <button
                                onClick={() => addAction(branch.id)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                              >
                                + Ajouter une action
                              </button>
                            </div>

                            <div className="space-y-3">
                              {branch.actions.map(action => renderAction(action, branch.id))}

                              {branch.actions.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                  <p className="text-gray-500 text-sm">Aucune action définie</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add branch button */}
                  <button
                    onClick={addBranch}
                    className="w-full px-4 py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 font-medium"
                  >
                    + Ajouter une branche (SINON SI)
                  </button>

                  {/* Else branch */}
                  <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                    <h4 className="font-bold text-gray-900 mb-3">SINON (défaut)</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Actions exécutées si aucune condition n'est remplie
                    </p>
                    {/* TODO: Add else actions editor */}
                  </div>
                </div>
              ) : (
                // Preview mode
                <div className="bg-gray-50 rounded-lg p-8">
                  <h4 className="font-bold text-gray-900 mb-6 text-center">
                    Aperçu visuel du workflow
                  </h4>
                  {/* TODO: Add visual flowchart preview */}
                  <div className="text-center text-gray-500">
                    Aperçu visuel en cours de développement...
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBuilder(false);
                  setEditingWorkflow(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={saveWorkflow}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Sauvegarder le workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
