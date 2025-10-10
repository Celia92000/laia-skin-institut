"use client";

import React, { useState, useEffect } from 'react';
import {
  Camera, Calendar, X, ChevronLeft, ChevronRight, Download,
  Upload, Trash2, Eye, Grid3x3, List, Plus, Image, Play,
  Maximize2, ZoomIn, Package, Star
} from 'lucide-react';
import { formatDateLocal } from '@/lib/date-utils';

interface PhotoSession {
  id: string;
  sessionNumber: number;
  date: string;
  serviceName: string;
  serviceType: 'individual' | 'package' | 'regular';
  packageName?: string;
  beforePhoto?: string;
  afterPhoto?: string;
  additionalPhotos?: string[];
  photoLabels?: string[];
  notes?: string;
  improvements?: string;
  hydrationLevel?: number;
  clientFeedback?: string;
  skinAnalysis?: {
    hydration?: number;
    elasticity?: number;
    pigmentation?: number;
    wrinkles?: number;
  };
}

interface ClientPhotoEvolutionProps {
  clientId: string;
  clientName: string;
  onClose?: () => void;
}

export default function ClientPhotoEvolution({ clientId, clientName, onClose }: ClientPhotoEvolutionProps) {
  const [sessions, setSessions] = useState<PhotoSession[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'comparison'>('grid');
  const [selectedSession, setSelectedSession] = useState<PhotoSession | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [newSession, setNewSession] = useState<Partial<PhotoSession>>({
    date: formatDateLocal(new Date()),
    serviceType: 'individual',
    additionalPhotos: [],
    photoLabels: [],
    skinAnalysis: {}
  });

  useEffect(() => {
    loadSessions();
  }, [clientId]);

  const loadSessions = async () => {
    try {
      // Charger depuis localStorage d'abord
      const saved = localStorage.getItem(`photo_sessions_${clientId}`);
      if (saved) {
        setSessions(JSON.parse(saved));
      }

      // Puis essayer l'API
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/photo-sessions?clientId=${clientId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
        localStorage.setItem(`photo_sessions_${clientId}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
    }
  };

  const saveSession = async () => {
    const sessionToSave = {
      ...newSession,
      id: Date.now().toString(),
      sessionNumber: sessions.length + 1,
      date: newSession.date || formatDateLocal(new Date())
    } as PhotoSession;

    const updatedSessions = [...sessions, sessionToSave];
    setSessions(updatedSessions);
    localStorage.setItem(`photo_sessions_${clientId}`, JSON.stringify(updatedSessions));

    // Sauvegarder en base
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/admin/photo-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          clientId,
          ...sessionToSave
        })
      });
    } catch (error) {
      console.error('Erreur sauvegarde session:', error);
    }

    setShowUploadModal(false);
    setNewSession({
      date: formatDateLocal(new Date()),
      serviceType: 'individual'
    });
  };

  const deleteSession = async (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem(`photo_sessions_${clientId}`, JSON.stringify(updatedSessions));
  };

  const handleImageUpload = async (file: File, type: 'before' | 'after' | 'additional', label?: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'additional') {
        setNewSession(prev => ({
          ...prev,
          additionalPhotos: [...(prev.additionalPhotos || []), base64],
          photoLabels: [...(prev.photoLabels || []), label || `Photo ${(prev.additionalPhotos?.length || 0) + 1}`]
        }));
      } else {
        setNewSession(prev => ({
          ...prev,
          [type === 'before' ? 'beforePhoto' : 'afterPhoto']: base64
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAdditionalPhoto = (index: number) => {
    setNewSession(prev => ({
      ...prev,
      additionalPhotos: prev.additionalPhotos?.filter((_, i) => i !== index),
      photoLabels: prev.photoLabels?.filter((_, i) => i !== index)
    }));
  };

  const getPackageSessions = (packageName: string) => {
    return sessions.filter(s => s.packageName === packageName);
  };

  const getIndividualSessions = () => {
    return sessions.filter(s => s.serviceType === 'individual');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Évolution Photos - {clientName}
              </h2>
              <p className="text-gray-600 mt-1">
                {sessions.length} séance{sessions.length > 1 ? 's' : ''} documentée{sessions.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Modes de vue */}
              <div className="flex bg-white rounded-lg shadow-sm border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-l-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === 'timeline' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('comparison')}
                  className={`px-3 py-2 rounded-r-lg transition-colors ${
                    viewMode === 'comparison' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouvelle séance
              </button>

              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ height: 'calc(100% - 100px)' }}>
          {viewMode === 'grid' && (
            <div>
              {/* Clients réguliers - Vue chronologique illimitée */}
              {sessions.filter(s => s.serviceType === 'regular').length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-gold-500" />
                    <h3 className="text-lg font-semibold">Client Régulier - Suivi Complet</h3>
                    <span className="text-sm text-gray-500">
                      ({sessions.filter(s => s.serviceType === 'regular').length} séances)
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-3">
                    {sessions.filter(s => s.serviceType === 'regular')
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((session, idx) => (
                        <div key={session.id} className="border-2 border-gold-200 rounded-lg overflow-hidden group relative">
                          <div className="aspect-square bg-gray-100 relative">
                            {session.beforePhoto && (
                              <img 
                                src={session.beforePhoto} 
                                alt={`Séance ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => setSelectedSession(session)}
                              />
                            )}
                            {session.additionalPhotos && session.additionalPhotos.length > 0 && (
                              <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                                +{session.additionalPhotos.length}
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-white">
                            <p className="text-xs font-medium">S{idx + 1}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(session.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteSession(session.id)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Forfaits */}
              {Object.entries(
                sessions.reduce((acc, s) => {
                  if (s.packageName) {
                    if (!acc[s.packageName]) acc[s.packageName] = [];
                    acc[s.packageName].push(s);
                  }
                  return acc;
                }, {} as Record<string, PhotoSession[]>)
              ).map(([packageName, packageSessions]) => (
                <div key={packageName} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Forfait: {packageName}</h3>
                    <span className="text-sm text-gray-500">
                      ({packageSessions.length} séances)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(num => {
                      const session = packageSessions.find(s => s.sessionNumber === num);
                      return (
                        <div key={num} className={`border-2 rounded-xl overflow-hidden ${
                          session ? 'border-purple-200' : 'border-gray-200 border-dashed'
                        }`}>
                          {session ? (
                            <div className="relative group">
                              <div className="aspect-square bg-gray-100">
                                {session.beforePhoto && (
                                  <div className="grid grid-cols-2 h-full">
                                    <img 
                                      src={session.beforePhoto} 
                                      alt="Avant"
                                      className="w-full h-full object-cover cursor-pointer"
                                      onClick={() => setFullscreenImage(session.beforePhoto!)}
                                    />
                                    <img 
                                      src={session.afterPhoto || '/placeholder.jpg'} 
                                      alt="Après"
                                      className="w-full h-full object-cover cursor-pointer"
                                      onClick={() => setFullscreenImage(session.afterPhoto || '')}
                                    />
                                  </div>
                                )}
                                {!session.beforePhoto && (
                                  <div className="flex items-center justify-center h-full">
                                    <Camera className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="p-3 bg-white">
                                <p className="font-medium text-sm">Séance {num}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(session.date).toLocaleDateString('fr-FR')}
                                </p>
                                <p className="text-xs text-purple-600 mt-1">
                                  {session.serviceName}
                                </p>
                              </div>
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => deleteSession(session.id)}
                                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-8 flex flex-col items-center justify-center text-gray-400">
                              <Camera className="w-8 h-8 mb-2" />
                              <p className="text-sm">Séance {num}</p>
                              <p className="text-xs">À venir</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Soins individuels */}
              {getIndividualSessions().length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold">Soins individuels</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {getIndividualSessions().map(session => (
                      <div key={session.id} className="border-2 border-yellow-200 rounded-xl overflow-hidden group relative">
                        <div className="aspect-square bg-gray-100">
                          {session.beforePhoto && (
                            <div className="grid grid-cols-2 h-full">
                              <img 
                                src={session.beforePhoto} 
                                alt="Avant"
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => setFullscreenImage(session.beforePhoto!)}
                              />
                              <img 
                                src={session.afterPhoto || '/placeholder.jpg'} 
                                alt="Après"
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => setFullscreenImage(session.afterPhoto || '')}
                              />
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-white">
                          <p className="font-medium text-sm">{session.serviceName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(session.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => deleteSession(session.id)}
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === 'timeline' && (
            <div className="space-y-4">
              {sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((session, idx) => (
                <div key={session.id} className="flex gap-4">
                  <div className="w-24 text-right">
                    <p className="font-medium text-sm">
                      {new Date(session.date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-500">Séance {sessions.length - idx}</p>
                  </div>
                  <div className="w-px bg-gray-300 relative">
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-purple-600 rounded-full"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <div className="flex gap-4">
                        {session.beforePhoto && (
                          <div className="flex gap-2">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Avant</p>
                              <img 
                                src={session.beforePhoto} 
                                alt="Avant"
                                className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                                onClick={() => setFullscreenImage(session.beforePhoto!)}
                              />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Après</p>
                              <img 
                                src={session.afterPhoto || '/placeholder.jpg'} 
                                alt="Après"
                                className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                                onClick={() => setFullscreenImage(session.afterPhoto || '')}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{session.serviceName}</h4>
                          {session.packageName && (
                            <p className="text-sm text-purple-600">Forfait: {session.packageName}</p>
                          )}
                          {session.improvements && (
                            <p className="text-sm text-gray-600 mt-2">{session.improvements}</p>
                          )}
                          {session.clientFeedback && (
                            <p className="text-sm italic text-gray-500 mt-2">"{session.clientFeedback}"</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'comparison' && sessions.length >= 2 && (
            <div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => setCurrentSessionIndex(Math.max(0, currentSessionIndex - 1))}
                  disabled={currentSessionIndex === 0}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium">
                  Comparaison: Séance 1 vs Séance {currentSessionIndex + 2}
                </span>
                <button
                  onClick={() => setCurrentSessionIndex(Math.min(sessions.length - 2, currentSessionIndex + 1))}
                  disabled={currentSessionIndex >= sessions.length - 2}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-center font-semibold mb-4">Première séance</h3>
                  <div className="space-y-4">
                    <img 
                      src={sessions[0]?.beforePhoto || '/placeholder.jpg'} 
                      alt="Première séance"
                      className="w-full rounded-xl shadow-lg cursor-pointer"
                      onClick={() => setFullscreenImage(sessions[0]?.beforePhoto || '')}
                    />
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium">{sessions[0]?.serviceName}</p>
                      <p className="text-xs text-gray-500">
                        {sessions[0] && new Date(sessions[0].date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-center font-semibold mb-4">
                    Séance {currentSessionIndex + 2}
                  </h3>
                  <div className="space-y-4">
                    <img 
                      src={sessions[currentSessionIndex + 1]?.afterPhoto || '/placeholder.jpg'} 
                      alt="Séance actuelle"
                      className="w-full rounded-xl shadow-lg cursor-pointer"
                      onClick={() => setFullscreenImage(sessions[currentSessionIndex + 1]?.afterPhoto || '')}
                    />
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium">{sessions[currentSessionIndex + 1]?.serviceName}</p>
                      <p className="text-xs text-gray-500">
                        {sessions[currentSessionIndex + 1] && new Date(sessions[currentSessionIndex + 1].date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal d'ajout de séance */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Nouvelle séance photo</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date de la séance</label>
                  <input
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type de service</label>
                  <select
                    value={newSession.serviceType}
                    onChange={(e) => setNewSession(prev => ({ 
                      ...prev, 
                      serviceType: e.target.value as 'individual' | 'package' | 'regular'
                    }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="individual">Soin individuel</option>
                    <option value="package">Forfait</option>
                    <option value="regular">Client régulier (suivi)</option>
                  </select>
                </div>

                {newSession.serviceType === 'package' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom du forfait</label>
                    <input
                      type="text"
                      value={newSession.packageName || ''}
                      onChange={(e) => setNewSession(prev => ({ ...prev, packageName: e.target.value }))}
                      placeholder="Ex: Forfait Hydrafacial 4 séances"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Nom du soin</label>
                  <input
                    type="text"
                    value={newSession.serviceName || ''}
                    onChange={(e) => setNewSession(prev => ({ ...prev, serviceName: e.target.value }))}
                    placeholder="Ex: Hydrafacial, Microneedling..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Photo avant</label>
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'before')}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50">
                        {newSession.beforePhoto ? (
                          <img src={newSession.beforePhoto} alt="Avant" className="w-full h-32 object-cover rounded" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Cliquez pour ajouter</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Photo après</label>
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'after')}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50">
                        {newSession.afterPhoto ? (
                          <img src={newSession.afterPhoto} alt="Après" className="w-full h-32 object-cover rounded" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Cliquez pour ajouter</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Photos additionnelles pour clients réguliers */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Photos additionnelles (zones spécifiques, angles différents, etc.)
                  </label>
                  
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {newSession.additionalPhotos?.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo} 
                          alt={newSession.photoLabels?.[index] || `Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <input
                          type="text"
                          value={newSession.photoLabels?.[index] || ''}
                          onChange={(e) => {
                            const newLabels = [...(newSession.photoLabels || [])];
                            newLabels[index] = e.target.value;
                            setNewSession(prev => ({ ...prev, photoLabels: newLabels }));
                          }}
                          placeholder="Description..."
                          className="absolute bottom-0 left-0 right-0 px-2 py-1 text-xs bg-black/70 text-white rounded-b-lg"
                        />
                        <button
                          onClick={() => removeAdditionalPhoto(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => {
                            const label = prompt(`Description pour ${file.name}:`) || file.name;
                            handleImageUpload(file, 'additional', label);
                          });
                        }}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                        <Plus className="w-6 h-6 text-gray-400" />
                        <p className="text-xs text-gray-500 mt-1">Ajouter photos</p>
                      </div>
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Vous pouvez ajouter autant de photos que nécessaire pour documenter l'évolution
                  </p>
                </div>

                {/* Analyse de peau pour suivi détaillé */}
                {(newSession.serviceType === 'regular' || newSession.serviceType === 'package') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Analyse de peau (optionnel)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600">Hydratation (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newSession.skinAnalysis?.hydration || ''}
                          onChange={(e) => setNewSession(prev => ({
                            ...prev,
                            skinAnalysis: {
                              ...prev.skinAnalysis,
                              hydration: parseInt(e.target.value)
                            }
                          }))}
                          placeholder="0-100"
                          className="w-full px-3 py-1 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Élasticité (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newSession.skinAnalysis?.elasticity || ''}
                          onChange={(e) => setNewSession(prev => ({
                            ...prev,
                            skinAnalysis: {
                              ...prev.skinAnalysis,
                              elasticity: parseInt(e.target.value)
                            }
                          }))}
                          placeholder="0-100"
                          className="w-full px-3 py-1 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Pigmentation (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newSession.skinAnalysis?.pigmentation || ''}
                          onChange={(e) => setNewSession(prev => ({
                            ...prev,
                            skinAnalysis: {
                              ...prev.skinAnalysis,
                              pigmentation: parseInt(e.target.value)
                            }
                          }))}
                          placeholder="0-100"
                          className="w-full px-3 py-1 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Rides (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newSession.skinAnalysis?.wrinkles || ''}
                          onChange={(e) => setNewSession(prev => ({
                            ...prev,
                            skinAnalysis: {
                              ...prev.skinAnalysis,
                              wrinkles: parseInt(e.target.value)
                            }
                          }))}
                          placeholder="0-100"
                          className="w-full px-3 py-1 border rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Améliorations observées</label>
                  <textarea
                    value={newSession.improvements || ''}
                    onChange={(e) => setNewSession(prev => ({ ...prev, improvements: e.target.value }))}
                    placeholder="Décrivez les améliorations..."
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Retour client</label>
                  <textarea
                    value={newSession.clientFeedback || ''}
                    onChange={(e) => setNewSession(prev => ({ ...prev, clientFeedback: e.target.value }))}
                    placeholder="Commentaires du client..."
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setNewSession({
                      date: formatDateLocal(new Date()),
                      serviceType: 'individual'
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={saveSession}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de détail d'une séance */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                  {selectedSession.serviceName} - {new Date(selectedSession.date).toLocaleDateString('fr-FR')}
                </h3>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {selectedSession.beforePhoto && (
                  <div>
                    <p className="text-sm font-medium mb-2">Photo Avant</p>
                    <img 
                      src={selectedSession.beforePhoto} 
                      alt="Avant"
                      className="w-full rounded-lg cursor-pointer"
                      onClick={() => setFullscreenImage(selectedSession.beforePhoto!)}
                    />
                  </div>
                )}
                {selectedSession.afterPhoto && (
                  <div>
                    <p className="text-sm font-medium mb-2">Photo Après</p>
                    <img 
                      src={selectedSession.afterPhoto} 
                      alt="Après"
                      className="w-full rounded-lg cursor-pointer"
                      onClick={() => setFullscreenImage(selectedSession.afterPhoto!)}
                    />
                  </div>
                )}
              </div>

              {selectedSession.additionalPhotos && selectedSession.additionalPhotos.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Photos additionnelles</p>
                  <div className="grid grid-cols-4 gap-3">
                    {selectedSession.additionalPhotos.map((photo, idx) => (
                      <div key={idx}>
                        <img 
                          src={photo} 
                          alt={selectedSession.photoLabels?.[idx] || `Photo ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer"
                          onClick={() => setFullscreenImage(photo)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedSession.photoLabels?.[idx] || `Photo ${idx + 1}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSession.skinAnalysis && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium mb-2">Analyse de peau</p>
                  <div className="grid grid-cols-4 gap-4">
                    {selectedSession.skinAnalysis.hydration !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600">Hydratation</p>
                        <p className="text-lg font-semibold">{selectedSession.skinAnalysis.hydration}%</p>
                      </div>
                    )}
                    {selectedSession.skinAnalysis.elasticity !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600">Élasticité</p>
                        <p className="text-lg font-semibold">{selectedSession.skinAnalysis.elasticity}%</p>
                      </div>
                    )}
                    {selectedSession.skinAnalysis.pigmentation !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600">Pigmentation</p>
                        <p className="text-lg font-semibold">{selectedSession.skinAnalysis.pigmentation}%</p>
                      </div>
                    )}
                    {selectedSession.skinAnalysis.wrinkles !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600">Rides</p>
                        <p className="text-lg font-semibold">{selectedSession.skinAnalysis.wrinkles}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedSession.improvements && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Améliorations observées</p>
                  <p className="text-gray-700">{selectedSession.improvements}</p>
                </div>
              )}

              {selectedSession.clientFeedback && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Retour client</p>
                  <p className="italic text-gray-700">"{selectedSession.clientFeedback}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fullscreen image viewer */}
        {fullscreenImage && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-8"
            onClick={() => setFullscreenImage(null)}
          >
            <img 
              src={fullscreenImage} 
              alt="Fullscreen"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 rounded-lg text-white hover:bg-white/30"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}