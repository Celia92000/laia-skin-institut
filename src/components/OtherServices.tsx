'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Star, ArrowRight } from 'lucide-react';

interface Service {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description: string;
  duration: number;
  price: number;
  promoPrice?: number;
  mainImage?: string;
  featured?: boolean;
}

export default function OtherServices({ currentServiceSlug }: { currentServiceSlug: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const data = await response.json();
          // Filtrer pour exclure le service actuel et les forfaits
          const filteredServices = data.filter((s: any) => 
            s.slug !== currentServiceSlug && 
            s.active && 
            s.category !== 'forfaits'
          ).slice(0, 3); // Limiter à 3 services
          setServices(filteredServices);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [currentServiceSlug]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {services.map(service => (
        <Link
          key={service.id}
          href={`/services/${service.slug}`}
          className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          {/* Image */}
          <div className="h-48 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 relative overflow-hidden">
            {service.featured && (
              <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white text-xs font-bold rounded-full">
                <Star className="w-3 h-3 inline mr-1" />
                Soin Signature
              </div>
            )}
            {service.mainImage ? (
              <img
                src={service.mainImage}
                alt={service.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-[#d4b5a0]/30 text-6xl">✨</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-[#2c3e50] mb-2 group-hover:text-[#d4b5a0] transition-colors">
              {service.name}
            </h3>
            <p className="text-[#2c3e50]/60 text-sm mb-4 line-clamp-2">
              {service.shortDescription || service.description}
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-[#2c3e50]/60">
                <Clock className="w-4 h-4" />
                <span>{service.duration} min</span>
              </div>
              
              <div className="text-right">
                {service.promoPrice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-[#2c3e50]/40">
                      {service.price}€
                    </span>
                    <span className="text-xl font-bold text-[#d4b5a0]">
                      {service.promoPrice}€
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-[#2c3e50]">
                    {service.price}€
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-[#d4b5a0] font-medium text-sm group-hover:translate-x-2 transition-transform flex items-center gap-1">
                Découvrir
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}