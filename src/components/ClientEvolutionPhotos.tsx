'use client';

import { useState, useRef } from 'react';
import { formatDateLocal } from '@/lib/date-utils';
import { Camera, Upload, X, Calendar, Trash2, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface Evolution {
  id: string;
  sessionNumber: number;
  serviceName: string;
  sessionDate: string;
  beforePhoto?: string;
  afterPhoto?: string;
  improvements?: any;
  clientFeedback?: string;
  adminNotes?: string;
  hydrationLevel?: number;
  elasticity?: number;
  pigmentation?: number;
  wrinkleDepth?: number;
}

interface ClientEvolutionPhotosProps {
  clientId: string;
  evolutions: Evolution[];
  onAddEvolution: (data: any) => Promise<void>;
  onDeleteEvolution: (id: string) => Promise<void>;
}

export default function ClientEvolutionPhotos({ 
  clientId, 
  evolutions = [], 
  onAddEvolution,
  onDeleteEvolution
}: ClientEvolutionPhotosProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEvolution, setSelectedEvolution] = useState<Evolution | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [newEvolution, setNewEvolution] = useState({
    serviceName: '',
    sessionDate: formatDateLocal(new Date()),
    beforePhoto: '',
    afterPhoto: '',
    adminNotes: '',
    clientFeedback: '',
    hydrationLevel: 5,
    elasticity: 5,
    pigmentation: 5,
    wrinkleDepth: 5
  });
  
  const beforePhotoRef = useRef<HTMLInputElement>(null);
  const afterPhotoRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvolution(prev => ({
          ...prev,
          [type === 'before' ? 'beforePhoto' : 'afterPhoto']: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const sessionNumber = evolutions.filter(e => e.serviceName === newEvolution.serviceName).length + 1;
    
    await onAddEvolution({
      ...newEvolution,
      sessionNumber,
      improvements: JSON.stringify({
        hydrationLevel: newEvolution.hydrationLevel,
        elasticity: newEvolution.elasticity,
        pigmentation: newEvolution.pigmentation,
        wrinkleDepth: newEvolution.wrinkleDepth
      })
    });

    setShowAddForm(false);
    setNewEvolution({
      serviceName: '',
      sessionDate: formatDateLocal(new Date()),
      beforePhoto: '',
      afterPhoto: '',
      adminNotes: '',
      clientFeedback: '',
      hydrationLevel: 5,
      elasticity: 5,
      pigmentation: 5,
      wrinkleDepth: 5
    });
  };

  const downloadImage = (imageData: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allPhotos = evolutions.flatMap((e, index) => [
    e.beforePhoto && { ...e, photo: e.beforePhoto, type: 'before', index: index * 2 },
    e.afterPhoto && { ...e, photo: e.afterPhoto, type: 'after', index: index * 2 + 1 }
  ].filter(Boolean)) as any[];

  // Filtrer les évolutions par service
  const filteredEvolutions = selectedService === 'all' 
    ? evolutions 
    : evolutions.filter(e => e.serviceName === selectedService);

  // Obtenir la liste des services uniques
  const uniqueServices = [...new Set(evolutions.map(e => e.serviceName))];

  // Trier par date pour la vue timeline
  const sortedEvolutions = [...filteredEvolutions].sort((a, b) => 
    new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'ajout et contrôles de vue */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#2c3e50]">📸 Photos d'évolution</h3>
          <div className="flex gap-2">
            {/* Sélecteur de mode d'affichage */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-[#d4b5a0] shadow-sm' : 'text-gray-600'
                }`}
              >
                Grille
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'timeline' ? 'bg-white text-[#d4b5a0] shadow-sm' : 'text-gray-600'
                }`}
              >
                Chronologie
              </button>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Ajouter
            </button>
          </div>
        </div>

        {/* Filtres par service */}
        {uniqueServices.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedService('all')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedService === 'all' 
                  ? 'bg-[#d4b5a0] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({evolutions.length})
            </button>
            {uniqueServices.map(service => {
              const count = evolutions.filter(e => e.serviceName === service).length;
              return (
                <button
                  key={service}
                  onClick={() => setSelectedService(service)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedService === service 
                      ? 'bg-[#d4b5a0] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {service} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Vue Grille */}
      {viewMode === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvolutions.map((evolution) => (
          <div key={evolution.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Images avant/après */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-px bg-gray-200">
                <div className="relative bg-white">
                  {evolution.beforePhoto ? (
                    <img
                      src={evolution.beforePhoto}
                      alt="Avant"
                      className="w-full h-32 object-cover cursor-pointer"
                      onClick={() => {
                        setSelectedEvolution(evolution);
                        setShowGallery(true);
                        setGalleryIndex(0);
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-1 left-1 px-2 py-1 bg-black/50 text-white text-xs rounded">Avant</span>
                </div>
                
                <div className="relative bg-white">
                  {evolution.afterPhoto ? (
                    <img
                      src={evolution.afterPhoto}
                      alt="Après"
                      className="w-full h-32 object-cover cursor-pointer"
                      onClick={() => {
                        setSelectedEvolution(evolution);
                        setShowGallery(true);
                        setGalleryIndex(1);
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-1 right-1 px-2 py-1 bg-green-600/80 text-white text-xs rounded">Après</span>
                </div>
              </div>
            </div>

            {/* Numéro de séance sous les photos */}
            <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 py-2 px-3 text-center">
              <span className="text-lg font-bold text-[#d4b5a0]">Séance #{evolution.sessionNumber}</span>
            </div>

            {/* Informations */}
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-[#2c3e50]">{evolution.serviceName}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(evolution.sessionDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteEvolution(evolution.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Scores d'amélioration */}
              {evolution.improvements && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(() => {
                    const improvements = typeof evolution.improvements === 'string' 
                      ? JSON.parse(evolution.improvements) 
                      : evolution.improvements;
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hydratation:</span>
                          <span className="font-medium">{improvements.hydrationLevel}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Élasticité:</span>
                          <span className="font-medium">{improvements.elasticity}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pigmentation:</span>
                          <span className="font-medium">{improvements.pigmentation}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rides:</span>
                          <span className="font-medium">{improvements.wrinkleDepth}/10</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Notes */}
              {(evolution.adminNotes || evolution.clientFeedback) && (
                <div className="pt-2 border-t border-gray-100">
                  {evolution.adminNotes && (
                    <p className="text-xs text-gray-600 italic">"{evolution.adminNotes}"</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Card vide pour ajouter */}
        {filteredEvolutions.length === 0 && (
          <div 
            onClick={() => setShowAddForm(true)}
            className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#d4b5a0] transition-colors min-h-[250px]"
          >
            <Camera className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">Ajouter une évolution</p>
            <p className="text-sm text-gray-500">Cliquez pour commencer</p>
          </div>
        )}
      </div>
      )}

      {/* Vue Chronologique */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {/* Ligne de temps comparative */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-medium text-[#2c3e50] mb-4">Évolution dans le temps</h4>
            
            {/* Timeline par service */}
            {uniqueServices.map(service => {
              const serviceEvolutions = sortedEvolutions.filter(e => e.serviceName === service);
              if (serviceEvolutions.length === 0) return null;
              
              return (
                <div key={service} className="mb-8 last:mb-0">
                  <h5 className="text-sm font-semibold text-[#d4b5a0] mb-4">{service}</h5>
                  
                  <div className="relative">
                    {/* Ligne horizontale */}
                    <div className="absolute top-20 left-0 right-0 h-0.5 bg-gray-200"></div>
                    
                    {/* Photos sur la timeline */}
                    <div className="flex justify-between overflow-x-auto pb-4">
                      {serviceEvolutions.map((evolution, index) => (
                        <div key={evolution.id} className="flex-shrink-0 relative">
                          {/* Point sur la ligne */}
                          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#d4b5a0] rounded-full"></div>
                          
                          {/* Carte d'évolution */}
                          <div className="flex flex-col items-center">
                            {/* Photos comparatives */}
                            <div className="grid grid-cols-2 gap-1 mb-2">
                              <div className="relative">
                                {evolution.beforePhoto ? (
                                  <img
                                    src={evolution.beforePhoto}
                                    alt="Avant"
                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => {
                                      setSelectedEvolution(evolution);
                                      setShowGallery(true);
                                      setGalleryIndex(0);
                                    }}
                                  />
                                ) : (
                                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Camera className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <span className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-black/50 text-white text-[10px] rounded">Avant</span>
                              </div>
                              
                              <div className="relative">
                                {evolution.afterPhoto ? (
                                  <img
                                    src={evolution.afterPhoto}
                                    alt="Après"
                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => {
                                      setSelectedEvolution(evolution);
                                      setShowGallery(true);
                                      setGalleryIndex(1);
                                    }}
                                  />
                                ) : (
                                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Camera className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <span className="absolute top-0.5 right-0.5 px-1 py-0.5 bg-green-600/80 text-white text-[10px] rounded">Après</span>
                              </div>
                            </div>
                            
                            {/* Numéro de séance */}
                            <div className="bg-[#d4b5a0] text-white px-3 py-1 rounded-full text-xs font-bold mb-1">
                              Séance #{evolution.sessionNumber}
                            </div>
                            
                            {/* Date */}
                            <p className="text-xs text-gray-600 text-center">
                              {new Date(evolution.sessionDate).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                            
                            {/* Indicateur de progression */}
                            {index > 0 && (
                              <div className="absolute -left-12 top-8 text-green-600">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredEvolutions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune évolution enregistrée
              </div>
            )}
          </div>

          {/* Vue comparative côte à côte */}
          {filteredEvolutions.length >= 2 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="font-medium text-[#2c3e50] mb-4">Comparaison Première / Dernière séance</h4>
              
              {uniqueServices.map(service => {
                const serviceEvolutions = sortedEvolutions.filter(e => e.serviceName === service);
                if (serviceEvolutions.length < 2) return null;
                
                const first = serviceEvolutions[0];
                const last = serviceEvolutions[serviceEvolutions.length - 1];
                
                return (
                  <div key={service} className="mb-6 last:mb-0">
                    <h5 className="text-sm font-semibold text-[#d4b5a0] mb-3">{service}</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Première séance */}
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-2">Première séance - {new Date(first.sessionDate).toLocaleDateString('fr-FR')}</p>
                        <div className="grid grid-cols-2 gap-1">
                          {first.beforePhoto && (
                            <img
                              src={first.beforePhoto}
                              alt="Avant"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )}
                          {first.afterPhoto && (
                            <img
                              src={first.afterPhoto}
                              alt="Après"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* Dernière séance */}
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-2">Dernière séance - {new Date(last.sessionDate).toLocaleDateString('fr-FR')}</p>
                        <div className="grid grid-cols-2 gap-1">
                          {last.beforePhoto && (
                            <img
                              src={last.beforePhoto}
                              alt="Avant"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )}
                          {last.afterPhoto && (
                            <img
                              src={last.afterPhoto}
                              alt="Après"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progression en chiffres */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        {serviceEvolutions.length} séances • {Math.round((new Date(last.sessionDate).getTime() - new Date(first.sessionDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} mois d'évolution
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal d'ajout */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#2c3e50]">Nouvelle évolution</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Informations de base */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soin effectué</label>
                  <select
                    value={newEvolution.serviceName}
                    onChange={(e) => setNewEvolution({...newEvolution, serviceName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  >
                    <option value="">Sélectionner un soin</option>
                    <option value="Hydro'Naissance">Hydro'Naissance</option>
                    <option value="Hydro'Cleaning">Hydro'Cleaning</option>
                    <option value="Renaissance">Renaissance</option>
                    <option value="BB Glow">BB Glow</option>
                    <option value="LED Thérapie">LED Thérapie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date du soin</label>
                  <input
                    type="date"
                    value={newEvolution.sessionDate}
                    onChange={(e) => setNewEvolution({...newEvolution, sessionDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  />
                </div>
              </div>

              {/* Upload photos */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo avant</label>
                  <input
                    ref={beforePhotoRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'before')}
                    className="hidden"
                  />
                  <div 
                    onClick={() => beforePhotoRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-[#d4b5a0] transition-colors"
                  >
                    {newEvolution.beforePhoto ? (
                      <img src={newEvolution.beforePhoto} alt="Avant" className="w-full h-32 object-cover rounded" />
                    ) : (
                      <div className="flex flex-col items-center py-4">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Cliquer pour ajouter</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo après</label>
                  <input
                    ref={afterPhotoRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'after')}
                    className="hidden"
                  />
                  <div 
                    onClick={() => afterPhotoRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-[#d4b5a0] transition-colors"
                  >
                    {newEvolution.afterPhoto ? (
                      <img src={newEvolution.afterPhoto} alt="Après" className="w-full h-32 object-cover rounded" />
                    ) : (
                      <div className="flex flex-col items-center py-4">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Cliquer pour ajouter</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Scores d'analyse */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-[#2c3e50] mb-3">Analyse de la peau</h4>
                <div className="space-y-3">
                  {[
                    { key: 'hydrationLevel', label: 'Niveau d\'hydratation' },
                    { key: 'elasticity', label: 'Élasticité' },
                    { key: 'pigmentation', label: 'Uniformité du teint' },
                    { key: 'wrinkleDepth', label: 'Réduction des rides' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 w-32">{item.label}</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={newEvolution[item.key as keyof typeof newEvolution]}
                        onChange={(e) => setNewEvolution({...newEvolution, [item.key]: parseInt(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-8">{newEvolution[item.key as keyof typeof newEvolution]}/10</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes professionnelles</label>
                <textarea
                  value={newEvolution.adminNotes}
                  onChange={(e) => setNewEvolution({...newEvolution, adminNotes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  rows={3}
                  placeholder="Observations, protocole utilisé, recommandations..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retour client</label>
                <textarea
                  value={newEvolution.clientFeedback}
                  onChange={(e) => setNewEvolution({...newEvolution, clientFeedback: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  rows={2}
                  placeholder="Ressenti du client, satisfaction..."
                />
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!newEvolution.serviceName || !newEvolution.sessionDate}
                  className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] disabled:opacity-50"
                >
                  Enregistrer l'évolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Galerie plein écran */}
      {showGallery && selectedEvolution && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              const photo = galleryIndex === 0 ? selectedEvolution.beforePhoto : selectedEvolution.afterPhoto;
              if (photo) downloadImage(photo, `evolution-${selectedEvolution.id}-${galleryIndex === 0 ? 'avant' : 'apres'}.jpg`);
            }}
            className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
          >
            <Download className="w-6 h-6" />
          </button>

          {galleryIndex > 0 && selectedEvolution.beforePhoto && (
            <button
              onClick={() => setGalleryIndex(0)}
              className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {galleryIndex === 0 && selectedEvolution.afterPhoto && (
            <button
              onClick={() => setGalleryIndex(1)}
              className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div className="max-w-4xl max-h-[90vh] p-4">
            <img
              src={galleryIndex === 0 ? selectedEvolution.beforePhoto : selectedEvolution.afterPhoto}
              alt={galleryIndex === 0 ? 'Avant' : 'Après'}
              className="max-w-full max-h-full object-contain"
            />
            <div className="text-center text-white mt-4">
              <p className="text-xl font-medium">{galleryIndex === 0 ? 'Avant' : 'Après'} - {selectedEvolution.serviceName}</p>
              <p className="text-sm opacity-80">{new Date(selectedEvolution.sessionDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}