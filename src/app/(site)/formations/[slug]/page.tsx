'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, GraduationCap, Star, Check, Shield, ChevronRight, Clock, Users, Calendar, BookOpen
} from 'lucide-react';
// import UniversalPaymentModal from '@/components/UniversalPaymentModal';

interface Formation {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  promoPrice?: number;
  duration: number;
  level?: string;
  maxParticipants?: number;
  mainImage?: string;
  gallery?: string;
  program?: string;
  prerequisites?: string;
  objectives?: string;
  certification?: string;
}

export default function FormationDetailPage() {
  const params = useParams();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const response = await fetch(`/api/formations/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setFormation(data);
        }
      } catch (error) {
        console.error('Error fetching formation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchFormation();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl text-[#2c3e50] mb-4">Formation non trouvée</h1>
        <Link href="/formations" className="text-purple-600 hover:underline">
          Retour aux formations
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-purple-600">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/formations" className="text-gray-500 hover:text-purple-600">
              Formations
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[#2c3e50] font-medium">{formation.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Formation Info */}
            <div>
              <h1 className="text-4xl md:text-5xl font-playfair text-[#2c3e50] mb-4">
                {formation.name}
              </h1>
              <p className="text-xl text-[#2c3e50]/70 mb-6">
                {formation.shortDescription}
              </p>

              {/* Caractéristiques */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 bg-white p-4 rounded-xl shadow-sm">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Durée</p>
                    <p className="font-medium text-[#2c3e50]">{formation.duration}h</p>
                  </div>
                </div>
                {formation.level && (
                  <div className="flex items-center gap-2 bg-white p-4 rounded-xl shadow-sm">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500">Niveau</p>
                      <p className="font-medium text-[#2c3e50]">{formation.level}</p>
                    </div>
                  </div>
                )}
                {formation.maxParticipants && (
                  <div className="flex items-center gap-2 bg-white p-4 rounded-xl shadow-sm">
                    <Users className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500">Participants max</p>
                      <p className="font-medium text-[#2c3e50]">{formation.maxParticipants}</p>
                    </div>
                  </div>
                )}
                {formation.certification && (
                  <div className="flex items-center gap-2 bg-white p-4 rounded-xl shadow-sm">
                    <Star className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500">Certification</p>
                      <p className="font-medium text-[#2c3e50]">Incluse</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price & CTA */}
              <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
                <div className="mb-6">
                  {formation.promoPrice ? (
                    <>
                      <p className="text-gray-400 line-through text-lg">{formation.price}€</p>
                      <p className="text-4xl font-light text-[#2c3e50]">{formation.promoPrice}€</p>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Économisez {(formation.price - formation.promoPrice).toFixed(2)}€
                      </p>
                    </>
                  ) : (
                    <p className="text-4xl font-light text-[#2c3e50]">{formation.price}€</p>
                  )}
                </div>

                <button
                  onClick={() => window.location.href = `/contact?formation=${encodeURIComponent(formation?.name || '')}`}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-4 rounded-xl font-medium text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <GraduationCap className="w-5 h-5" />
                  S'inscrire à la formation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Paiement sécurisé
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Sessions régulières
                  </span>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                {formation.mainImage ? (
                  <img
                    src={formation.mainImage}
                    alt={formation.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-purple-700/30">
                    <GraduationCap className="w-32 h-32 text-white/40" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galerie d'images */}
      {formation.gallery && (() => {
        try {
          const galleryImages = JSON.parse(formation.gallery);
          return galleryImages.length > 0 ? (
            <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-playfair text-[#2c3e50] mb-4">
                    Galerie
                  </h2>
                  <p className="text-gray-600">
                    Découvrez {formation.name} en images
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryImages.map((imageUrl: string, index: number) => (
                    <div
                      key={index}
                      className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                      style={{ height: '300px' }}
                    >
                      <img
                        src={imageUrl}
                        alt={`${formation.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-[#2c3e50]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white font-medium">{formation.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null;
        } catch {
          return null;
        }
      })()}

      {/* Description */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-8 text-center">
            Description
          </h2>
          <div className="prose prose-lg max-w-none text-[#2c3e50]/80">
            <p className="leading-relaxed text-lg">{formation.description}</p>
          </div>
        </div>
      </section>

      {/* Objectifs */}
      {formation.objectives && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-playfair text-[#2c3e50] mb-8 text-center">
              Objectifs
            </h2>
            <div className="grid gap-4">
              {formation.objectives.split('\n').filter(o => o.trim()).map((objective, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-500/5 to-transparent rounded-lg">
                  <Check className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[#2c3e50]/80">{objective}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Programme */}
      {formation.program && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-playfair text-[#2c3e50] mb-8 text-center">
              Programme
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <p className="text-[#2c3e50]/80 leading-relaxed whitespace-pre-line">{formation.program}</p>
            </div>
          </div>
        </section>
      )}

      {/* Prérequis */}
      {formation.prerequisites && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-playfair text-[#2c3e50] mb-8 text-center">
              Prérequis
            </h2>
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl p-8">
              <p className="text-[#2c3e50]/80 leading-relaxed">{formation.prerequisites}</p>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-500 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-playfair text-white mb-6">
            Prêt à vous inscrire ?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Contactez-nous pour plus d'informations sur les prochaines sessions
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition-all"
          >
            Nous contacter
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Modal de paiement - temporairement désactivé */}
      {/* {showPaymentModal && formation && (
        <UniversalPaymentModal
          item={{
            id: formation.id,
            name: formation.name,
            price: formation.price,
            salePrice: formation.promoPrice,
            type: 'formation',
            image: formation.mainImage
          }}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(orderId) => {
            console.log('Inscription créée:', orderId);
            setShowPaymentModal(false);
          }}
        />
      )} */}
    </div>
  );
}
