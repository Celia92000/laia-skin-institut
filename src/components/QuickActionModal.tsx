'use client';

import { useState } from 'react';
import { X, Calendar, Lock, User, Phone, Clock, Euro, MessageCircle, Instagram, Globe, MapPin } from 'lucide-react';

interface QuickActionModalProps {
  date: Date;
  onClose: () => void;
  onCreateReservation: (data: any) => void;
  onBlockSlot: (data: any) => void;
  services: Record<string, string>;
  existingClients?: Array<{ id: string; name: string; email: string; phone?: string }>;
}

export default function QuickActionModal({
  date,
  onClose,
  onCreateReservation,
  onBlockSlot,
  services,
  existingClients = []
}: QuickActionModalProps) {
  const [mode, setMode] = useState<'choose' | 'reservation' | 'block'>('choose');
  
  // État pour nouvelle réservation
  const [selectedClient, setSelectedClient] = useState('');
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [source, setSource] = useState('phone');
  const [notes, setNotes] = useState('');
  
  // État pour blocage
  const [blockType, setBlockType] = useState('personal');
  const [blockStartTime, setBlockStartTime] = useState('09:00');
  const [blockEndTime, setBlockEndTime] = useState('18:00');
  const [blockReason, setBlockReason] = useState('');

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  const calculateTotalPrice = () => {
    const prices: Record<string, number> = {
      'hydro-naissance': 90,
      'hydro-cleaning': 70,
      'renaissance': 70,
      'bb-glow': 70,
      'led-therapie': 50
    };
    return selectedServices.reduce((sum, service) => sum + (prices[service] || 0), 0);
  };

  const handleCreateReservation = () => {
    if (isNewClient && !newClient.name) {
      alert('Veuillez saisir le nom du client');
      return;
    }
    if (!isNewClient && !selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }
    if (selectedServices.length === 0) {
      alert('Veuillez sélectionner au moins un service');
      return;
    }

    const clientData = isNewClient ? newClient : existingClients.find(c => c.id === selectedClient);
    
    onCreateReservation({
      date,
      time: selectedTime,
      client: clientData,
      services: selectedServices,
      source,
      notes,
      totalPrice: calculateTotalPrice(),
      status: 'confirmed' // Directement confirmé car créé manuellement
    });
  };

  const handleBlockSlot = () => {
    if (!blockReason) {
      alert('Veuillez indiquer la raison du blocage');
      return;
    }

    onBlockSlot({
      date,
      startTime: blockStartTime,
      endTime: blockEndTime,
      type: blockType,
      reason: blockReason
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Si on clique sur le fond (backdrop)
        if (e.target === e.currentTarget) {
          // Vérifier si des données ont été saisies
          if (mode === 'reservation') {
            const hasData = selectedServices.length > 0 || notes || 
                           (isNewClient && (newClient.name || newClient.email || newClient.phone)) ||
                           (!isNewClient && selectedClient);
            
            if (hasData) {
              // Demander confirmation avant de fermer
              if (confirm('Vous avez des données non sauvegardées. Voulez-vous vraiment fermer ?')) {
                onClose();
              }
            } else {
              onClose();
            }
          } else if (mode === 'block') {
            const hasBlockData = blockReason || blockType !== 'personal';
            if (hasBlockData) {
              if (confirm('Vous avez des données non sauvegardées. Voulez-vous vraiment fermer ?')) {
                onClose();
              }
            } else {
              onClose();
            }
          } else {
            // Mode 'choose', on peut fermer directement
            onClose();
          }
        }
      }}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-[#2c3e50]">
                {mode === 'choose' && 'Action rapide'}
                {mode === 'reservation' && 'Nouvelle réservation'}
                {mode === 'block' && 'Bloquer un créneau'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Mode choix */}
          {mode === 'choose' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('reservation')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#d4b5a0] hover:bg-[#d4b5a0]/5 transition-all group"
              >
                <Calendar className="w-12 h-12 text-[#d4b5a0] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg text-[#2c3e50] mb-2">Créer une réservation</h3>
                <p className="text-sm text-gray-600">
                  Ajouter manuellement une réservation client (appel, Instagram, etc.)
                </p>
              </button>
              
              <button
                onClick={() => setMode('block')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all group"
              >
                <Lock className="w-12 h-12 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg text-[#2c3e50] mb-2">Bloquer le créneau</h3>
                <p className="text-sm text-gray-600">
                  Marquer comme indisponible (congés, RDV personnel, formation)
                </p>
              </button>
            </div>
          )}

          {/* Mode réservation */}
          {mode === 'reservation' && (
            <div className="space-y-4">
              {/* Sélection client */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Client</label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setIsNewClient(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !isNewClient ? 'bg-[#d4b5a0] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Client existant
                  </button>
                  <button
                    onClick={() => setIsNewClient(true)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isNewClient ? 'bg-[#d4b5a0] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Nouveau client
                  </button>
                </div>

                {isNewClient ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nom complet *"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d4b5a0]"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d4b5a0]"
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d4b5a0]"
                    />
                  </div>
                ) : (
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d4b5a0]"
                  >
                    <option value="">Sélectionner un client</option>
                    {existingClients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} - {client.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Source de réservation */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Source</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'phone', label: 'Téléphone', icon: Phone },
                    { value: 'instagram', label: 'Instagram', icon: Instagram },
                    { value: 'website', label: 'Site Web', icon: Globe },
                    { value: 'tiktok', label: 'TikTok', icon: MessageCircle },
                    { value: 'walkin', label: 'Sur place', icon: MapPin },
                    { value: 'other', label: 'Autre', icon: User }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setSource(value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        source === value
                          ? 'border-[#d4b5a0] bg-[#d4b5a0]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                      <p className="text-xs">{label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Heure */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Heure
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d4b5a0]"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-7">
                  <div className="bg-[#d4b5a0]/10 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Durée estimée</p>
                    <p className="font-semibold">1h30 (avec préparation)</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Services</label>
                <div className="space-y-2">
                  {services && Object.entries(services)
                    .map(([slug, name]) => (
                      <label key={slug} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(slug)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedServices([...selectedServices, slug]);
                              } else {
                                setSelectedServices(selectedServices.filter(s => s !== slug));
                              }
                            }}
                            className="w-4 h-4 text-[#d4b5a0] border-gray-300 rounded focus:ring-[#d4b5a0]"
                          />
                          <div>
                            <span className="text-sm font-medium">{name}</span>
                            <span className="text-xs text-gray-500 ml-2">90 min</span>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-[#d4b5a0]">
                          70€
                        </span>
                      </label>
                    ))
                  }
                  {(!services || Object.keys(services).length === 0) && (
                    <p className="text-sm text-gray-500">Chargement des services...</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Notes (optionnel)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d4b5a0]"
                  rows={3}
                  placeholder="Informations complémentaires..."
                />
              </div>

              {/* Prix total */}
              {selectedServices.length > 0 && (
                <div className="bg-[#d4b5a0]/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Prix total</span>
                    <span className="text-2xl font-bold text-[#d4b5a0]">{calculateTotalPrice()}€</span>
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('choose')}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  onClick={handleCreateReservation}
                  className="flex-1 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors"
                >
                  Créer la réservation
                </button>
              </div>
            </div>
          )}

          {/* Mode blocage */}
          {mode === 'block' && (
            <div className="space-y-4">
              {/* Type de blocage */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Type de blocage</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'personal', label: 'RDV Personnel' },
                    { value: 'holiday', label: 'Congés' },
                    { value: 'training', label: 'Formation' },
                    { value: 'other', label: 'Autre' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setBlockType(value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        blockType === value
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Heures de blocage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">Heure début</label>
                  <select
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">Heure fin</label>
                  <select
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Raison */}
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">Raison *</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300"
                  placeholder="Ex: Rendez-vous médical, Formation Hydrafacial..."
                />
              </div>

              {/* Alerte */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Ce créneau sera marqué comme indisponible et n'apparaîtra pas dans les créneaux de réservation.
                </p>
              </div>

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('choose')}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  onClick={handleBlockSlot}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Bloquer le créneau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}