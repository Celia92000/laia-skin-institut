"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Calendar, User, Mail, Phone, Check, X, Eye, ThumbsUp, MessageCircle } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceName?: string;
  itemType?: string; // "service", "product", "formation"
  itemId?: string;
  itemName?: string;
  orderId?: string;
  reservationId?: string;
  source: 'website' | 'email' | 'whatsapp' | 'google';
  createdAt: string;
  published: boolean;
  response?: string;
}

export default function AdminReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [response, setResponse] = useState("");
  const [filter, setFilter] = useState<'all' | 'published' | 'pending'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'website' | 'email' | 'whatsapp' | 'google'>('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (review: Review) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ published: !review.published })
      });

      if (response.ok) {
        await fetchReviews();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avis:', error);
    }
  };

  const handleResponse = async () => {
    if (!selectedReview || !response.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/reviews/${selectedReview.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response: response })
      });

      if (res.ok) {
        await fetchReviews();
        setSelectedReview(null);
        setResponse("");
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
    }
  };

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      case 'google':
        return <span className="text-xs">G</span>;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch(source) {
      case 'email':
        return 'Email';
      case 'whatsapp':
        return 'WhatsApp';
      case 'google':
        return 'Google';
      default:
        return 'Site web';
    }
  };

  const getSourceColor = (source: string) => {
    switch(source) {
      case 'email':
        return 'bg-blue-100 text-blue-700';
      case 'whatsapp':
        return 'bg-green-100 text-green-700';
      case 'google':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-purple-100 text-purple-700';
    }
  };

  const filteredReviews = reviews.filter(review => {
    const statusMatch = filter === 'all' || 
                       (filter === 'published' && review.published) ||
                       (filter === 'pending' && !review.published);
    const sourceMatch = sourceFilter === 'all' || review.source === sourceFilter;
    return statusMatch && sourceMatch;
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const stats = {
    total: reviews.length,
    published: reviews.filter(r => r.published).length,
    pending: reviews.filter(r => !r.published).length,
    fiveStars: reviews.filter(r => r.rating === 5).length,
    bySource: {
      website: reviews.filter(r => r.source === 'website').length,
      email: reviews.filter(r => r.source === 'email').length,
      whatsapp: reviews.filter(r => r.source === 'whatsapp').length,
      google: reviews.filter(r => r.source === 'google').length
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#2c3e50]">{averageRating}</div>
            <div className="flex justify-center my-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.round(parseFloat(averageRating)) ? 'text-[#d4b5a0] fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <div className="text-sm text-[#2c3e50]/60">Note moyenne</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-[#2c3e50]">{stats.total}</div>
            <div className="text-sm text-[#2c3e50]/60 mt-2">Total avis</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.published}</div>
            <div className="text-sm text-[#2c3e50]/60 mt-2">Publiés</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-[#2c3e50]/60 mt-2">En attente</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-[#d4b5a0]">{stats.fiveStars}</div>
            <div className="text-sm text-[#2c3e50]/60 mt-2">5 étoiles</div>
          </div>
        </div>
      </div>

      {/* Sources des avis */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex gap-6 text-sm">
            <span className="text-[#2c3e50]/60">Sources :</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              Site web ({stats.bySource.website})
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4 text-blue-600" />
              Email ({stats.bySource.email})
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-green-600" />
              WhatsApp ({stats.bySource.whatsapp})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-yellow-600 text-white text-xs rounded flex items-center justify-center">G</span>
              Google ({stats.bySource.google})
            </span>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
        >
          <option value="all">Tous les avis</option>
          <option value="published">Publiés</option>
          <option value="pending">En attente</option>
        </select>
        
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as any)}
          className="px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
        >
          <option value="all">Toutes les sources</option>
          <option value="website">Site web</option>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="google">Google</option>
        </select>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm border border-[#d4b5a0]/10 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < review.rating ? 'text-[#d4b5a0] fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  
                  <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(review.source)}`}>
                    <span className="flex items-center gap-1">
                      {getSourceIcon(review.source)}
                      {getSourceLabel(review.source)}
                    </span>
                  </span>
                  
                  {review.published ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Publié
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      En attente
                    </span>
                  )}
                </div>
                
                <div className="text-[#2c3e50]/90 mb-3">
                  "{review.comment}"
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-[#2c3e50]/60">
                  {review.clientName && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {review.clientName}
                    </span>
                  )}

                  {review.clientEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {review.clientEmail}
                    </span>
                  )}

                  {/* Afficher le nom du service/produit/formation */}
                  {(review.itemName || review.serviceName) && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {review.itemName || review.serviceName}
                      {review.itemType && (
                        <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                          review.itemType === 'product' ? 'bg-blue-100 text-blue-700' :
                          review.itemType === 'formation' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {review.itemType === 'product' ? 'Produit' :
                           review.itemType === 'formation' ? 'Formation' :
                           'Service'}
                        </span>
                      )}
                    </span>
                  )}

                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                {review.response && (
                  <div className="mt-4 p-3 bg-[#d4b5a0]/10 rounded-lg">
                    <div className="text-xs text-[#d4b5a0] font-semibold mb-1">Votre réponse :</div>
                    <div className="text-sm text-[#2c3e50]/80">{review.response}</div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handlePublishToggle(review)}
                  className={`p-2 rounded-lg transition-colors ${
                    review.published 
                      ? 'bg-red-50 hover:bg-red-100 text-red-600' 
                      : 'bg-green-50 hover:bg-green-100 text-green-600'
                  }`}
                  title={review.published ? 'Retirer de la publication' : 'Publier'}
                >
                  {review.published ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                </button>
                
                {!review.response && (
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setResponse("");
                    }}
                    className="p-2 bg-[#d4b5a0]/10 hover:bg-[#d4b5a0]/20 rounded-lg text-[#2c3e50] transition-colors"
                    title="Répondre"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <MessageSquare className="w-16 h-16 text-[#d4b5a0]/30 mx-auto mb-4" />
          <p className="text-[#2c3e50]/60">Aucun avis trouvé avec ces filtres</p>
        </div>
      )}

      {/* Modal de réponse */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-[#2c3e50] mb-4">
              Répondre à l'avis de {selectedReview.clientName || 'Client'}
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < selectedReview.rating ? 'text-[#d4b5a0] fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-[#2c3e50]/80 italic">"{selectedReview.comment}"</p>
            </div>
            
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Votre réponse..."
              className="w-full px-4 py-3 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] min-h-[120px]"
            />
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setResponse("");
                }}
                className="px-4 py-2 border border-[#d4b5a0]/20 text-[#2c3e50] rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleResponse}
                className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590]"
                disabled={!response.trim()}
              >
                Envoyer la réponse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}