"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, X, Calendar, User, Mail, Phone, 
  Package, CreditCard, Clock, MapPin, Star, TrendingUp,
  Save, History, ChevronDown, ChevronUp, Loader, AlertCircle
} from 'lucide-react';

interface SearchFilter {
  type: string;
  field: string;
  operator: string;
  value: any;
  label?: string;
}

interface SearchResult {
  type: 'client' | 'reservation' | 'service' | 'product';
  id: string;
  title: string;
  subtitle: string;
  metadata?: any;
  highlight?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilter[];
  createdAt: Date;
}

interface AdvancedSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  onClose?: () => void;
}

const FILTER_TYPES = {
  clients: {
    label: 'Clients',
    icon: User,
    fields: [
      { value: 'name', label: 'Nom', type: 'text' },
      { value: 'email', label: 'Email', type: 'text' },
      { value: 'phone', label: 'Téléphone', type: 'text' },
      { value: 'loyaltyPoints', label: 'Points fidélité', type: 'number' },
      { value: 'totalSpent', label: 'Total dépensé', type: 'number' },
      { value: 'lastVisit', label: 'Dernière visite', type: 'date' },
      { value: 'birthdate', label: 'Date de naissance', type: 'date' },
      { value: 'skinType', label: 'Type de peau', type: 'select', options: ['Normale', 'Sèche', 'Grasse', 'Mixte', 'Sensible'] }
    ]
  },
  reservations: {
    label: 'Réservations',
    icon: Calendar,
    fields: [
      { value: 'date', label: 'Date', type: 'date' },
      { value: 'status', label: 'Statut', type: 'select', options: ['pending', 'validated', 'cancelled'] },
      { value: 'totalPrice', label: 'Prix total', type: 'number' },
      { value: 'paymentStatus', label: 'Paiement', type: 'select', options: ['pending', 'partial', 'paid'] },
      { value: 'services', label: 'Service', type: 'text' }
    ]
  },
  services: {
    label: 'Services',
    icon: Package,
    fields: [
      { value: 'name', label: 'Nom', type: 'text' },
      { value: 'category', label: 'Catégorie', type: 'text' },
      { value: 'price', label: 'Prix', type: 'number' },
      { value: 'duration', label: 'Durée (min)', type: 'number' }
    ]
  },
  products: {
    label: 'Produits',
    icon: Package,
    fields: [
      { value: 'name', label: 'Nom', type: 'text' },
      { value: 'brand', label: 'Marque', type: 'text' },
      { value: 'category', label: 'Catégorie', type: 'text' },
      { value: 'price', label: 'Prix', type: 'number' },
      { value: 'stock', label: 'Stock', type: 'number' }
    ]
  }
};

const OPERATORS = {
  text: [
    { value: 'contains', label: 'Contient' },
    { value: 'equals', label: 'Est égal à' },
    { value: 'starts', label: 'Commence par' },
    { value: 'ends', label: 'Se termine par' }
  ],
  number: [
    { value: 'equals', label: '=' },
    { value: 'greater', label: '>' },
    { value: 'less', label: '<' },
    { value: 'between', label: 'Entre' }
  ],
  date: [
    { value: 'equals', label: 'Le' },
    { value: 'before', label: 'Avant' },
    { value: 'after', label: 'Après' },
    { value: 'between', label: 'Entre' }
  ],
  select: [
    { value: 'equals', label: 'Est' },
    { value: 'not', label: 'N\'est pas' }
  ]
};

export default function AdvancedSearch({ onResultSelect, onClose }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [selectedType, setSelectedType] = useState<keyof typeof FILTER_TYPES>('clients');
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Charger les recherches sauvegardées
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Recherche automatique avec debounce
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (query || filters.length > 0) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
      // Recherche locale de démonstration
      performLocalSearch();
    } finally {
      setLoading(false);
    }
  };

  const performLocalSearch = () => {
    // Simulation de recherche locale pour la démonstration
    const mockResults: SearchResult[] = [];

    if (query) {
      // Recherche dans les clients
      mockResults.push({
        type: 'client',
        id: '1',
        title: 'Marie Dupont',
        subtitle: 'marie.dupont@email.com • 450 points',
        metadata: { phone: '06 12 34 56 78', lastVisit: '2025-09-20' }
      });

      // Recherche dans les réservations
      mockResults.push({
        type: 'reservation',
        id: '2',
        title: 'Soin Hydrafacial',
        subtitle: '25/09/2025 à 14h00 • 120€',
        metadata: { client: 'Sophie Martin', status: 'validated' }
      });

      // Recherche dans les services
      mockResults.push({
        type: 'service',
        id: '3',
        title: 'Microneedling',
        subtitle: 'Soins du visage • 150€',
        metadata: { duration: 60, category: 'Anti-âge' }
      });
    }

    setResults(mockResults.filter(r => 
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(query.toLowerCase())
    ));
  };

  const addFilter = () => {
    const field = FILTER_TYPES[selectedType].fields[0];
    setFilters([...filters, {
      type: selectedType,
      field: field.value,
      operator: OPERATORS[field.type as keyof typeof OPERATORS][0].value,
      value: '',
      label: field.label
    }]);
  };

  const updateFilter = (index: number, updates: Partial<SearchFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const saveSearch = () => {
    const name = prompt('Nom de la recherche sauvegardée:');
    if (name) {
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        name,
        filters,
        createdAt: new Date()
      };
      const updated = [...savedSearches, newSearch];
      setSavedSearches(updated);
      localStorage.setItem('savedSearches', JSON.stringify(updated));
    }
  };

  const loadSearch = (search: SavedSearch) => {
    setFilters(search.filters);
    setShowSaved(false);
  };

  const deleteSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'client': return <User className="w-4 h-4" />;
      case 'reservation': return <Calendar className="w-4 h-4" />;
      case 'service': return <Package className="w-4 h-4" />;
      case 'product': return <CreditCard className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        <div className="p-8 border-b bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Recherche Avancée
            </h2>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/50 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Barre de recherche principale */}
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-7 h-7 text-purple-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher clients, réservations, services, produits..."
              className="w-full pl-16 pr-6 py-5 bg-white rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-xl shadow-lg placeholder:text-gray-400"
              autoFocus
            />
            {loading && (
              <Loader className="absolute right-6 top-1/2 transform -translate-y-1/2 w-7 h-7 text-purple-600 animate-spin" />
            )}
          </div>

          {/* Options de filtrage */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres ({filters.length})
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowSaved(!showSaved)}
              className="px-4 py-2 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Recherches sauvées ({savedSearches.length})
            </button>

            {filters.length > 0 && (
              <button
                onClick={saveSearch}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
            )}
          </div>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="space-y-3">
              {filters.map((filter, index) => (
                <div key={index} className="flex gap-3 items-center bg-white p-3 rounded-lg">
                  <select
                    value={filter.type}
                    onChange={(e) => {
                      const newType = e.target.value as keyof typeof FILTER_TYPES;
                      const field = FILTER_TYPES[newType].fields[0];
                      updateFilter(index, {
                        type: newType,
                        field: field.value,
                        label: field.label,
                        operator: OPERATORS[field.type as keyof typeof OPERATORS][0].value
                      });
                    }}
                    className="px-3 py-2 border rounded-lg"
                  >
                    {Object.entries(FILTER_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>

                  <select
                    value={filter.field}
                    onChange={(e) => {
                      const field = FILTER_TYPES[filter.type as keyof typeof FILTER_TYPES].fields.find(f => f.value === e.target.value);
                      if (field) {
                        updateFilter(index, {
                          field: e.target.value,
                          label: field.label,
                          operator: OPERATORS[field.type as keyof typeof OPERATORS][0].value
                        });
                      }
                    }}
                    className="px-3 py-2 border rounded-lg"
                  >
                    {FILTER_TYPES[filter.type as keyof typeof FILTER_TYPES].fields.map(field => (
                      <option key={field.value} value={field.value}>{field.label}</option>
                    ))}
                  </select>

                  <select
                    value={filter.operator}
                    onChange={(e) => updateFilter(index, { operator: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  >
                    {(() => {
                      const field = FILTER_TYPES[filter.type as keyof typeof FILTER_TYPES].fields.find(f => f.value === filter.field);
                      const operators = OPERATORS[field?.type as keyof typeof OPERATORS] || OPERATORS.text;
                      return operators.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ));
                    })()}
                  </select>

                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => updateFilter(index, { value: e.target.value })}
                    placeholder="Valeur..."
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />

                  <button
                    onClick={() => removeFilter(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addFilter}
              className="mt-3 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              + Ajouter un filtre
            </button>
          </div>
        )}

        {/* Recherches sauvegardées */}
        {showSaved && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="space-y-2">
              {savedSearches.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune recherche sauvegardée</p>
              ) : (
                savedSearches.map(search => (
                  <div key={search.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{search.name}</p>
                      <p className="text-sm text-gray-500">
                        {search.filters.length} filtre(s) • {new Date(search.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadSearch(search)}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                      >
                        Charger
                      </button>
                      <button
                        onClick={() => deleteSearch(search.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Résultats */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '500px' }}>
          {results.length === 0 && query && !loading ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Aucun résultat trouvé</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => onResultSelect?.(result)}
                  className="w-full text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-200">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{result.title}</p>
                      <p className="text-sm text-gray-600">{result.subtitle}</p>
                      {result.metadata && (
                        <div className="flex gap-4 mt-2">
                          {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                            <span key={key} className="text-xs text-gray-500">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                      {result.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}