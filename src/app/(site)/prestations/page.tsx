import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Clock, ArrowRight, Sparkles, Star } from 'lucide-react';

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Prestations() {
  let services: any[] = [];
  
  try {
    services = await prisma.service.findMany({
      where: { 
        active: true,
        category: { not: 'forfaits' } // Ne pas afficher les forfaits comme services séparés
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    // En cas d'erreur, on continue avec un tableau vide
  }
  
  // Trier pour mettre les services featured en premier, puis par ordre
  const sortedServices = [...services].sort((a, b) => {
    // D'abord trier par featured
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    // Ensuite par ordre
    return (a.order || 0) - (b.order || 0);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfbf7] to-white">
      {/* Hero Section */}
      <section className="pt-32 sm:pt-36 pb-8 sm:pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-normal text-[#2c3e50] mb-4 sm:mb-6 tracking-normal">
            Mes Prestations
          </h1>
          <p className="font-inter text-base sm:text-lg md:text-xl text-[#2c3e50]/60 max-w-3xl mx-auto tracking-normal">
            Découvrez nos soins d'exception pour sublimer votre peau
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {sortedServices.map((service) => (
              <Link 
                key={service.id}
                href={`/services/${service.slug}`}
                className="group block h-full"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 h-full flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[550px]">
                  {/* Image/Header */}
                  <div className="h-48 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 relative overflow-hidden flex-shrink-0">
                    {/* Badge Soin Signature pour Hydro'Naissance uniquement */}
                    {service.featured && (
                      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-full shadow-lg">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-wider">Soin Signature</span>
                      </div>
                    )}
                    {service.mainImage ? (
                      <img
                        src={service.mainImage}
                        alt={service.name}
                        className="w-full h-full"
                        style={{
                          objectFit: service.imageObjectFit || 'cover',
                          objectPosition: `${service.imagePositionX ?? 50}% ${service.imagePositionY ?? 50}%`
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-20 h-20 text-[#d4b5a0]/40" />
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-6 text-white w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Découvrir ce soin</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-serif font-bold text-[#2c3e50] mb-3 group-hover:text-[#d4b5a0] transition-colors">
                      {service.name}
                    </h3>
                    
                    <p className="text-[#2c3e50]/70 mb-4 line-clamp-2">
                      {service.shortDescription}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#2c3e50]/60">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} min</span>
                      </div>
                      
                      {service.category && (
                        <span className="text-xs px-3 py-1 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-full">
                          {service.category}
                        </span>
                      )}
                    </div>

                    {/* Prix */}
                    <div className="border-t pt-4 mt-auto">
                      {service.promoPrice ? (
                        <div>
                          <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-[#d4b5a0]">
                              {service.promoPrice}€
                            </span>
                            <span className="text-xl line-through text-[#2c3e50]/40">
                              {service.price}€
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs text-[#d4b5a0] font-semibold uppercase tracking-wider">
                              Tarif de lancement
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-3xl font-bold text-[#2c3e50]">
                            {service.price}€
                          </span>
                          <p className="text-sm text-[#d4b5a0] mt-2">
                            Forfait 4 séances : {(service.price * 4) - 20}€
                          </p>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-[#d4b5a0] font-medium group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                        Voir les détails
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-3xl p-12">
          <h2 className="text-3xl font-playfair font-bold text-[#2c3e50] mb-4">
            Prête à révéler votre beauté naturelle ?
          </h2>
          <p className="text-lg text-[#2c3e50]/70 mb-8">
            Réservez votre soin dès maintenant et bénéficiez de nos tarifs privilégiés
          </p>
          <Link 
            href="/reservation" 
            className="inline-block bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            Réserver mon soin
          </Link>
        </div>
      </section>
    </div>
  );
}