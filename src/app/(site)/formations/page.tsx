import Link from "next/link";
import { prisma } from '@/lib/prisma';
import { Clock, ArrowRight, Star, GraduationCap, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FormationsPage() {
  let formations: any[] = [];

  try {
    formations = await prisma.formation.findMany({
      where: { active: true },
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' }
      ]
    });
  } catch (error) {
    console.error('Error fetching formations:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-playfair font-normal text-[#2c3e50] mb-6">
            Nos Formations
          </h1>
          <p className="text-lg md:text-xl text-[#2c3e50]/60 max-w-2xl mx-auto">
            Développez vos compétences avec nos formations professionnelles en esthétique
          </p>
        </div>
      </section>

      {/* Formations Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {formations.length === 0 ? (
            <div className="text-center py-20">
              <GraduationCap className="w-16 h-16 mx-auto text-[#2c3e50]/20 mb-4" />
              <p className="text-xl text-[#2c3e50]/60">
                Nos formations arrivent bientôt...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {formations.map((formation) => (
                <Link
                  key={formation.id}
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

                      {/* CTA */}
                      <div className="mt-4">
                        <div className="flex items-center text-purple-600 font-medium group-hover:gap-2 transition-all">
                          <span>En savoir plus</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-500 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-playfair text-white mb-6">
            Besoin d'informations ?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Contactez-nous pour en savoir plus sur nos formations et modalités d'inscription
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
    </div>
  );
}
