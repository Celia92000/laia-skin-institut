import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Euro, Check, AlertCircle, ArrowRight, Star, ChevronRight, Info, Sparkles, ImageIcon, Heart, Shield, Calendar } from 'lucide-react';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  
  let service: any = null;
  let otherServices: any[] = [];
  let optionServices: any[] = [];

  try {
    service = await prisma.service.findUnique({
      where: { 
        slug,
        active: true 
      }
    });

    if (!service) {
      notFound();
    }

    // Récupérer les autres services pour la section "Découvrir aussi"
    otherServices = await prisma.service.findMany({
      where: {
        active: true,
        NOT: { slug }
      },
      take: 3
    });

    // Récupérer les services qui peuvent être ajoutés en option
    optionServices = await prisma.service.findMany({
      where: {
        active: true,
        canBeOption: true
      }
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    notFound();
  }

  // Déterminer si ce service peut avoir des options (Hydro'Naissance, Hydro'Cleaning, Renaissance)
  const canHaveOptions = ['hydro-naissance', 'hydro-cleaning', 'renaissance'].includes(slug);
  
  // Exclure LED Thérapie des options si elle est déjà incluse dans le protocole
  // Hydro'Cleaning, Renaissance et Hydro'Naissance incluent déjà la LED
  if (['hydro-cleaning', 'renaissance', 'hydro-naissance'].includes(slug)) {
    optionServices = optionServices.filter(option => option.slug !== 'led-therapie');
  }

  // Parser les données JSON ou texte simple
  const parseJsonOrText = (data: any): any => {
    if (!data) return [];
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return parsed;
      } catch {
        // Si ce n'est pas du JSON, traiter comme du texte simple
        // Diviser par virgule ou retour à la ligne
        return data.split(/[,\n]/).map(item => item.trim()).filter(item => item);
      }
    }
    return data;
  };

  const benefits = parseJsonOrText(service.benefits);
  const contraindications = parseJsonOrText(service.contraindications);
  const process = parseJsonOrText(service.process);
  const recommendations = parseJsonOrText(service.recommendations);
  
  // Parser la galerie d'images
  const gallery = service.gallery ? parseJsonOrText(service.gallery) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section avec image de fond */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Image de fond */}
        {service.mainImage && (
          <div className="absolute inset-0">
            <img 
              src={service.mainImage} 
              alt={service.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60"></div>
          </div>
        )}
        
        {/* Fallback gradient si pas d'image */}
        {!service.mainImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/40">
            <div className="absolute w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute w-96 h-96 -bottom-48 -left-48 bg-gradient-to-tr from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>
        )}

        {/* Contenu du hero */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24 pb-16">
          {service.featured && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-full mb-6 backdrop-blur-sm">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-semibold">Soin Signature</span>
            </div>
          )}
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-lg">
            {service.name}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow">
            {service.shortDescription}
          </p>
        </div>
      </section>

      {/* Section principale du contenu */}
      <section className="relative -mt-20 z-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Introduction et description */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-6">
                En quoi consiste ce soin ?
              </h2>
              <p className="text-[#2c3e50]/80 leading-relaxed text-lg whitespace-pre-line">
                {service.description}
              </p>
            </div>

            {/* CTA de réservation rapide */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/reservation"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <Calendar className="w-5 h-5" />
                Réserver ce soin
              </Link>
              <div className="flex items-center justify-center gap-3 text-[#2c3e50]/70">
                <Clock className="w-5 h-5 text-[#d4b5a0]" />
                <span className="font-medium">{service.duration} minutes</span>
                <span className="mx-2">•</span>
                {service.promoPrice ? (
                  <>
                    <span className="line-through text-[#2c3e50]/40">{service.price}€</span>
                    <span className="font-bold text-[#d4b5a0] text-xl">{service.promoPrice}€</span>
                  </>
                ) : (
                  <span className="font-bold text-[#2c3e50] text-xl">{service.price}€</span>
                )}
              </div>
            </div>

            {/* Bénéfices - Section mise en avant */}
            {benefits.length > 0 && (
              <div className="mt-12 bg-gradient-to-r from-[#fdfbf7] to-[#f8f6f0] rounded-2xl p-8">
                <h3 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6 flex items-center gap-3">
                  <Heart className="w-8 h-8 text-[#d4b5a0]" />
                  Les bienfaits de ce soin
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] flex items-center justify-center mt-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[#2c3e50]/80 text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Déroulement du soin */}
          {process.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-12">
              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-[#d4b5a0]" />
                Comment se déroule la séance ?
              </h2>
              <div className="space-y-3">
                {Array.isArray(process) && process.map((step: any, index: number) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                        {typeof step === 'object' && step.step ? step.step : index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      {typeof step === 'object' ? (
                        <div>
                          <h4 className="font-semibold text-[#2c3e50] mb-1">{step.title}</h4>
                          <p className="text-[#2c3e50]/80 text-sm leading-relaxed">{step.description}</p>
                          {step.duration && (
                            <span className="text-xs text-[#d4b5a0] mt-1 inline-block">{step.duration}</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[#2c3e50]/80 text-base leading-relaxed">{step}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Galerie d'images */}
          {gallery.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12">
              <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-8">
                Galerie photos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((image: string, index: number) => (
                  <div key={index} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                    <img 
                      src={image} 
                      alt={`${service.name} - Image ${index + 1}`}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informations pratiques */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Recommandations */}
            {(Array.isArray(recommendations) ? recommendations.length > 0 : recommendations) && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  Conseils avant le soin
                </h3>
                {Array.isArray(recommendations) ? (
                  <ul className="space-y-3">
                    {recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#2c3e50]/80">{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#2c3e50]/80">{recommendations}</p>
                )}
              </div>
            )}

            {/* Contre-indications */}
            {contraindications.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                  Contre-indications
                </h3>
                <ul className="space-y-2">
                  {contraindications.map((contra: string, index: number) => (
                    <li key={index} className="text-sm text-[#2c3e50]/80">
                      • {contra}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Informations pratiques */}
            <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-[#2c3e50] mb-4">
                Informations pratiques
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#d4b5a0]" />
                  <div>
                    <p className="text-xs text-[#2c3e50]/60">Durée de la séance</p>
                    <p className="font-semibold text-[#2c3e50]">{service.duration} minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Euro className="w-5 h-5 text-[#d4b5a0]" />
                  <div>
                    <p className="text-xs text-[#2c3e50]/60">Tarif</p>
                    {service.promoPrice ? (
                      <div>
                        <span className="text-[#2c3e50]/40 line-through mr-2">{service.price}€</span>
                        <span className="text-xl font-bold text-[#d4b5a0]">{service.promoPrice}€</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xl font-bold text-[#2c3e50]">{service.price}€</p>
                        <p className="text-sm text-[#d4b5a0] mt-1">
                          Forfait 4 séances : {(service.price * 4) - 20}€ <span className="text-xs text-[#2c3e50]/60">(-20€)</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Options complémentaires */}
          {canHaveOptions && optionServices.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12">
              <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-4">
                Personnalisez votre soin
              </h2>
              <p className="text-[#2c3e50]/70 mb-8">
                Ajoutez ces options pour une expérience encore plus complète
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {optionServices.map((option) => (
                  <Link
                    key={option.id}
                    href={`/reservation?service=${slug}&option=${option.slug}`}
                    className="block border-2 border-[#d4b5a0]/30 rounded-2xl p-6 hover:border-[#d4b5a0] transition-all duration-300 hover:shadow-lg cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#2c3e50] mb-2 group-hover:text-[#d4b5a0] transition-colors">
                          + {option.name}
                        </h3>
                        <p className="text-sm text-[#2c3e50]/70">
                          {option.shortDescription}
                        </p>
                      </div>
                      <div className="text-right">
                        {option.promoPrice ? (
                          <>
                            <span className="text-sm line-through text-[#2c3e50]/40 block">{option.price}€</span>
                            <span className="text-xl font-bold text-[#d4b5a0]">+{option.promoPrice}€</span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-[#d4b5a0]">+{option.price}€</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-[#2c3e50]/60">
                        <Clock className="w-4 h-4" />
                        <span>+{option.duration} min</span>
                      </div>
                      <span className="text-sm text-[#d4b5a0] font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Ajouter cette option
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 p-4 bg-[#d4b5a0]/10 rounded-xl">
                <p className="text-sm text-[#2c3e50]/80 text-center">
                  💡 Ces options peuvent être ajoutées lors de votre réservation ou sur place le jour de votre rendez-vous
                </p>
              </div>
            </div>
          )}

          {/* CTA de réservation */}
          <div className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] rounded-3xl p-8 md:p-12 mb-12 text-center shadow-2xl">
            <h2 className="text-3xl font-serif font-bold text-white mb-4">
              Prête à révéler votre beauté naturelle ?
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Réservez votre séance {service.name} et offrez-vous un moment de bien-être unique
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/reservation"
                className="inline-flex items-center justify-center gap-3 bg-white text-[#d4b5a0] px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <Calendar className="w-5 h-5" />
                Réserver ce soin
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center gap-3 bg-white/20 backdrop-blur text-white border-2 border-white/40 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/30 transition-all duration-300"
              >
                Une question ?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Autres services */}
      {otherServices.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-12 text-center">
              Découvrez aussi nos autres soins
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {otherServices.map((otherService) => (
                <Link
                  key={otherService.id}
                  href={`/services/${otherService.slug}`}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    {otherService.mainImage && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={otherService.mainImage}
                          alt={otherService.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-serif font-bold text-[#2c3e50] mb-2 group-hover:text-[#d4b5a0] transition-colors">
                        {otherService.name}
                      </h3>
                      <p className="text-[#2c3e50]/70 text-sm mb-4 line-clamp-2">
                        {otherService.shortDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-[#2c3e50]/60">À partir de</span>
                          <p className="text-[#d4b5a0] font-bold text-lg">
                            {otherService.promoPrice || otherService.price}€
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#d4b5a0]/10 flex items-center justify-center group-hover:bg-[#d4b5a0]/20 transition-colors">
                          <ArrowRight className="w-5 h-5 text-[#d4b5a0] group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}