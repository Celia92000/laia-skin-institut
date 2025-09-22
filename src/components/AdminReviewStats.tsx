"use client";

import { useState, useEffect } from "react";
import { Star, TrendingUp, MessageCircle, Mail, Phone, BarChart3 } from "lucide-react";

interface Review {
  id: string;
  serviceName: string;
  rating: number;
  comment: string;
  source: string;
  createdAt: string;
  user: {
    name: string;
    email?: string;
  };
}

interface ServiceStats {
  serviceName: string;
  totalReviews: number;
  averageRating: number;
  satisfactionRate: number;
  distribution: {
    [key: string]: number;
  };
  recentReviews: Review[];
}

export default function AdminReviewStats() {
  const [stats, setStats] = useState<ServiceStats[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    emailReviews: 0,
    whatsappReviews: 0,
    googleReviews: 0
  });
  const [loading, setLoading] = useState(true);

  const services = [
    { slug: 'hydro-naissance', name: "Hydro'Naissance", color: '#d4b5a0' },
    { slug: 'hydro-cleaning', name: "Hydro'Cleaning", color: '#c9a084' },
    { slug: 'renaissance', name: 'Renaissance', color: '#d4b5a0' },
    { slug: 'bb-glow', name: 'BB Glow', color: '#ddb892' },
    { slug: 'led-therapie', name: 'LED Thérapie', color: '#c9a084' }
  ];

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      // Récupérer les stats pour chaque service
      const serviceStatsPromises = services.map(async (service) => {
        const response = await fetch(`/api/services/${service.slug}/stats`);
        const data = await response.json();
        return {
          serviceName: service.name,
          totalReviews: data.totalReviews || 0,
          averageRating: parseFloat(data.averageRating) || 0,
          satisfactionRate: data.satisfactionRate || 0,
          distribution: {},
          recentReviews: data.testimonials || []
        };
      });

      const serviceStats = await Promise.all(serviceStatsPromises);
      setStats(serviceStats);

      // Récupérer tous les avis pour les stats globales
      const reviewsResponse = await fetch('/api/reviews?approved=true');
      const reviewsData = await reviewsResponse.json();
      
      const emailCount = reviewsData.reviews.filter((r: Review) => r.source === 'email').length;
      const whatsappCount = reviewsData.reviews.filter((r: Review) => r.source === 'whatsapp').length;
      const googleCount = reviewsData.reviews.filter((r: Review) => r.source === 'google').length;

      setGlobalStats({
        totalReviews: reviewsData.stats.total || 0,
        averageRating: reviewsData.stats.average || 0,
        emailReviews: emailCount,
        whatsappReviews: whatsappCount,
        googleReviews: googleCount
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d4b5a0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2c3e50]/60">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistiques globales */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-playfair text-[#2c3e50] mb-6">📊 Vue d'ensemble des avis clients</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="w-5 h-5 text-[#d4b5a0]" />
              <span className="text-2xl font-bold text-[#2c3e50]">{globalStats.totalReviews}</span>
            </div>
            <p className="text-sm text-[#2c3e50]/60">Total des avis</p>
          </div>

          <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-bold text-[#2c3e50]">{globalStats.averageRating.toFixed(1)}/5</span>
            </div>
            <p className="text-sm text-[#2c3e50]/60">Note moyenne</p>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-[#2c3e50]">{globalStats.emailReviews}</span>
            </div>
            <p className="text-sm text-[#2c3e50]/60">Avis par email</p>
          </div>

          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Phone className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-[#2c3e50]">{globalStats.whatsappReviews}</span>
            </div>
            <p className="text-sm text-[#2c3e50]/60">Avis WhatsApp</p>
          </div>

          <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              </svg>
              <span className="text-2xl font-bold text-[#2c3e50]">{globalStats.googleReviews}</span>
            </div>
            <p className="text-sm text-[#2c3e50]/60">Avis Google</p>
          </div>
        </div>
      </div>

      {/* Statistiques par service */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((service, index) => {
          const serviceConfig = services.find(s => s.name === service.serviceName);
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2c3e50]">{service.serviceName}</h3>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" style={{ color: serviceConfig?.color }} />
                  <span className="text-sm text-[#2c3e50]/60">{service.totalReviews} avis</span>
                </div>
              </div>

              {/* Note moyenne */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-[#fdfbf7] to-white rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-2xl font-bold text-[#2c3e50]">
                    {service.averageRating > 0 ? service.averageRating.toFixed(1) : '—'}/5
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#2c3e50]/60">Satisfaction</p>
                  <p className="text-lg font-semibold" style={{ color: serviceConfig?.color }}>
                    {service.satisfactionRate > 0 ? `${service.satisfactionRate}%` : '—'}
                  </p>
                </div>
              </div>

              {/* Distribution des notes */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = service.distribution?.[rating] || 0;
                  const percentage = service.totalReviews > 0 ? (count / service.totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-xs text-[#2c3e50]/60 w-8">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: serviceConfig?.color 
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#2c3e50]/60 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Avis récents */}
              {service.recentReviews.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#d4b5a0]/20">
                  <p className="text-sm font-semibold text-[#2c3e50] mb-2">Dernier avis :</p>
                  <div className="text-sm text-[#2c3e50]/70">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(service.recentReviews[0].rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="italic">"{service.recentReviews[0].comment}"</p>
                    <p className="text-xs mt-1">- {service.recentReviews[0].name}</p>
                  </div>
                </div>
              )}

              {service.totalReviews === 0 && (
                <div className="mt-4 text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-[#2c3e50]/50">Aucun avis pour ce service</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">💡 Conseils pour améliorer vos avis</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-[#2c3e50] mb-2">📧 Email post-soin</h4>
            <p className="text-sm text-[#2c3e50]/70">
              Envoyez automatiquement un email 24h après chaque soin pour collecter les avis à chaud.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-[#2c3e50] mb-2">📱 WhatsApp</h4>
            <p className="text-sm text-[#2c3e50]/70">
              Utilisez WhatsApp Business pour des rappels personnalisés et collecter des avis facilement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}