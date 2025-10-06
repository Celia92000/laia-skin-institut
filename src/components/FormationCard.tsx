'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, GraduationCap, Clock, Users } from 'lucide-react';
// import UniversalPaymentModal from './UniversalPaymentModal';

interface FormationCardProps {
  formation: {
    id: string;
    slug: string;
    name: string;
    description: string;
    shortDescription?: string;
    price: number;
    promoPrice?: number;
    duration: number;
    level?: string;
    maxParticipants?: number;
    mainImage?: string;
    featured?: boolean;
  };
}

export default function FormationCard({ formation }: FormationCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Redirection vers la page de contact avec le nom de la formation
    window.location.href = `/contact?formation=${encodeURIComponent(formation.name)}`;
  };

  return (
    <>
      <Link
        href={`/formations/${formation.slug}`}
        className="group block h-full"
      >
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 h-full flex flex-col min-h-[500px]">
          {/* Image */}
          <div className="h-64 bg-gradient-to-br from-purple-500/30 to-purple-700/30 relative overflow-hidden">
            {formation.featured && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full shadow-lg">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold">À LA UNE</span>
              </div>
            )}
            {formation.mainImage ? (
              <img
                src={formation.mainImage}
                alt={formation.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <GraduationCap className="w-20 h-20 text-white/40" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-2xl font-playfair text-[#2c3e50] mb-3 group-hover:text-purple-600 transition-colors">
              {formation.name}
            </h3>
            <p className="text-[#2c3e50]/70 mb-4 flex-1 line-clamp-3">
              {formation.shortDescription || formation.description}
            </p>

            {/* Info */}
            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>{formation.duration}h</span>
              </div>
              {formation.level && (
                <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {formation.level}
                </div>
              )}
              {formation.maxParticipants && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Max {formation.maxParticipants} participants</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <div>
                {formation.promoPrice ? (
                  <div>
                    <span className="text-sm text-gray-400 line-through mr-2">
                      {formation.price}€
                    </span>
                    <span className="text-2xl font-bold text-purple-600">
                      {formation.promoPrice}€
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-[#2c3e50]">
                    {formation.price}€
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleRegisterClick}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                S'inscrire
              </button>
              <div className="flex items-center text-purple-600 font-medium group-hover:gap-2 transition-all px-3">
                <span className="text-sm">Détails</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Modal de paiement - temporairement désactivé */}
      {/* {showPaymentModal && (
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
    </>
  );
}
