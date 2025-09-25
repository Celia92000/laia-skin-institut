"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Calendar, User, Mail, Phone, Check, X, Eye, ThumbsUp, MessageCircle, Camera, Grid, List, Filter, Search, Download, TrendingUp, Award, Package } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  satisfaction?: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceName?: string;
  source: 'website' | 'email' | 'whatsapp' | 'google';
  createdAt: string;
  published: boolean;
  response?: string;
  photos?: string[];
}

export default function AdminReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [response, setResponse] = useState("");
  const [filter, setFilter] = useState<'all' | 'published' | 'pending'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'website' | 'email' | 'whatsapp' | 'google'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

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

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet avis ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        await fetchReviews();
      } else {
        const data = await res.json();
        alert(data.error || 'Impossible de supprimer cet avis');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const exportPhotos = () => {
    const allPhotos: { clientName: string, date: string, service: string, photos: string[] }[] = [];
    
    reviews.forEach(review => {
      if (review.photos && review.photos.length > 0) {
        allPhotos.push({
          clientName: review.clientName || 'Client',
          date: new Date(review.createdAt).toLocaleDateString('fr-FR'),
          service: review.serviceName || 'Service',
          photos: review.photos
        });
      }
    });

    // Créer un fichier ZIP avec toutes les photos
    const downloadAllPhotos = () => {
      allPhotos.forEach((item, index) => {
        item.photos.forEach((photo, photoIndex) => {
          const link = document.createElement('a');
          link.href = photo;
          const fileName = `${item.clientName.replace(/[^a-z0-9]/gi, '_')}_${item.date.replace(/\//g, '-')}_photo${photoIndex + 1}.jpg`;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      });
    };

    // Option simple : télécharger toutes les photos
    if (allPhotos.length > 0) {
      setShowExportModal(true);
    } else {
      alert('Aucune photo à exporter');
    }
  };

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      case 'google':
        return <span className="text-xs font-bold">G</span>;
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
        return 'Google Business';
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
    withPhotos: reviews.filter(r => r.photos && r.photos.length > 0).length,
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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2c3e50] mb-2">Avis et photos</h2>
        <p className="text-gray-600">Gérez les avis clients provenant de toutes les sources (site, email, WhatsApp, Google)</p>
      </div>

      {/* Statistiques */}
      <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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
            <div className="text-3xl font-bold text-purple-600">{stats.withPhotos}</div>
            <div className="flex justify-center mt-2">
              <Camera className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-sm text-[#2c3e50]/60">Avec photos</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-[#d4b5a0]">{stats.fiveStars}</div>
            <div className="flex justify-center mt-2">
              <Award className="w-5 h-5 text-[#d4b5a0]" />
            </div>
            <div className="text-sm text-[#2c3e50]/60">5 étoiles</div>
          </div>
        </div>
      </div>

      {/* Sources */}
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
              <span className="w-4 h-4 bg-yellow-600 text-white text-xs rounded flex items-center justify-center font-bold">G</span>
              Google ({stats.bySource.google})
            </span>
          </div>
        </div>
      </div>

      {/* Filtres et vue */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="flex gap-4">
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

        <div className="flex gap-2">
          {stats.withPhotos > 0 && (
            <button
              onClick={exportPhotos}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              title="Exporter toutes les photos"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export photos</span>
            </button>
          )}
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#d4b5a0] text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#d4b5a0] text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Liste ou grille des avis */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
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

                {/* Niveau de satisfaction */}
                {review.satisfaction && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-[#2c3e50]/60">Satisfaction :</span>
                    <span className="text-xl">
                      {['😞', '😐', '🙂', '😊', '😍'][review.satisfaction - 1] || '😊'}
                    </span>
                    <span className="text-sm text-[#2c3e50]/60">
                      ({review.satisfaction}/5)
                    </span>
                  </div>
                )}

                {/* Photos */}
                {review.photos && review.photos.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {review.photos.slice(0, 3).map((photo, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setSelectedPhotos(review.photos || []);
                          setShowPhotoModal(true);
                        }}
                      >
                        <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 2 && review.photos && review.photos.length > 3 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold">+{review.photos.length - 3}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedPhotos(review.photos || []);
                        setShowPhotoModal(true);
                      }}
                      className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-[#d4b5a0]/30 rounded-lg hover:border-[#d4b5a0] transition-colors"
                    >
                      <Camera className="w-6 h-6 text-[#d4b5a0]/50" />
                    </button>
                  </div>
                )}
                
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
                  
                  {review.serviceName && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {review.serviceName}
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

                {review.source !== 'google' && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <X className="w-5 h-5" />
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

      {/* Modal photos */}
      {showPhotoModal && selectedPhotos.length > 0 && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowPhotoModal(false)}>
          <div className="max-w-4xl w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPhotos.map((photo, idx) => (
                <img 
                  key={idx} 
                  src={photo} 
                  alt={`Photo ${idx + 1}`} 
                  className="w-full h-auto rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              ))}
            </div>
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Modal export photos */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-600" />
              Exporter les photos clients
            </h3>
            
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-[#2c3e50] mb-2">
                  <strong>{stats.withPhotos}</strong> avis contiennent des photos
                </p>
                <p className="text-xs text-[#2c3e50]/60">
                  Les photos seront téléchargées avec un nom formaté incluant le nom du client et la date
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Créer un JSON avec toutes les infos et photos
                    const exportData = reviews
                      .filter(r => r.photos && r.photos.length > 0)
                      .map(r => ({
                        id: r.id,
                        clientName: r.clientName || 'Client',
                        clientEmail: r.clientEmail || '',
                        date: new Date(r.createdAt).toISOString(),
                        service: r.serviceName || '',
                        rating: r.rating,
                        comment: r.comment,
                        photos: r.photos
                      }));
                    
                    const dataStr = JSON.stringify(exportData, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    const link = document.createElement('a');
                    link.setAttribute('href', dataUri);
                    link.setAttribute('download', `export_photos_avis_${new Date().toISOString().split('T')[0]}.json`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setShowExportModal(false);
                  }}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exporter en JSON (avec métadonnées)
                </button>

                <button
                  onClick={() => {
                    // Télécharger toutes les photos individuellement
                    let photoCount = 0;
                    reviews.forEach(review => {
                      if (review.photos && review.photos.length > 0) {
                        const clientName = (review.clientName || 'Client').replace(/[^a-z0-9]/gi, '_');
                        const date = new Date(review.createdAt).toLocaleDateString('fr-FR').replace(/\//g, '-');
                        
                        review.photos.forEach((photo, index) => {
                          setTimeout(() => {
                            const link = document.createElement('a');
                            link.href = photo;
                            link.download = `${clientName}_${date}_photo${index + 1}.jpg`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }, photoCount * 200); // Délai pour éviter le blocage du navigateur
                          photoCount++;
                        });
                      }
                    });
                    setShowExportModal(false);
                    alert(`Téléchargement de ${photoCount} photos en cours...`);
                  }}
                  className="w-full py-3 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Télécharger toutes les photos
                </button>

                <button
                  onClick={() => {
                    // Créer un fichier CSV avec les liens des photos
                    let csv = 'Client,Email,Date,Service,Note,Commentaire,Photos\n';
                    reviews.forEach(review => {
                      if (review.photos && review.photos.length > 0) {
                        csv += `"${review.clientName || ''}","${review.clientEmail || ''}","${new Date(review.createdAt).toLocaleDateString('fr-FR')}","${review.serviceName || ''}","${review.rating}","${review.comment.replace(/"/g, '""')}","${review.photos.join(';')}"\n`;
                      }
                    });
                    
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `export_avis_photos_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setShowExportModal(false);
                  }}
                  className="w-full py-3 border border-[#d4b5a0] text-[#2c3e50] rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <List className="w-5 h-5" />
                  Exporter en CSV (liens photos)
                </button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-[#d4b5a0]/20 text-[#2c3e50] rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}