'use client';

import Link from "next/link";
import { Clock, Star, ChevronRight, Calendar, ArrowRight, Shield, Sparkles, Award, Users, CheckCircle, TrendingUp, Gem, Heart, Zap, Eye, X } from "lucide-react";
import { useEffect, useState } from "react";
import OtherServices from './OtherServices';
import { getDisplayPrice, getForfaitDisplayPrice, hasPromotion, hasForfaitPromotion, getDiscountPercentage, getForfaitSavings, getMonthlyPrice } from '@/lib/price-utils';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration: number;
  price: number;
  promoPrice?: number | null;
  forfaitPrice?: number | null;
  forfaitPromo?: number | null;
  benefits: string | null;
  protocol?: string | null;
  contraindications: string | null;
  active: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ServicePageTemplateProps {
  slug: string;
}

const serviceEnrichment: Record<string, any> = {
  'hydroneedling': {
    color: '#d4b5a0',
    secondaryColor: '#c9a084',
    icon: Award,
    badge: '✨ SOIN SIGNATURE D\'EXCEPTION ✨',
    heroImage: '/services/hydro-naissance.jpg',
    heroDescription: 'Mon soin signature alliant technologie de pointe et expertise pour une hydratation exceptionnelle. Votre peau retrouve instantanément souplesse et éclat, avec des résultats qui se prolongent semaine après semaine.',
    isSignature: true,
    benefits: [
      { icon: Sparkles, title: "Hydratation intense", desc: "Repulpe et réhydrate en profondeur", detail: "Acide hyaluronique multi-moléculaire" },
      { icon: Shield, title: "Protection cellulaire", desc: "Renforce la barrière cutanée", detail: "Complexe vitaminique A-C-E" },
      { icon: TrendingUp, title: "Effet lifting", desc: "Raffermit et lifte naturellement", detail: "Peptides bio-mimétiques" },
      { icon: Heart, title: "Anti-âge global", desc: "Réduit rides et ridules", detail: "Rétinol encapsulé nouvelle génération" }
    ],
    testimonials: [
      { name: "Sophie M.", rating: 5, comment: "Ma peau n'a jamais été aussi hydratée et lumineuse. Un vrai coup de cœur !" },
      { name: "Claire D.", rating: 4, comment: "Les ridules se sont atténuées et ma peau paraît plus jeune. Très satisfaite !" },
      { name: "Emma L.", rating: 5, comment: "L'effet repulpant est incroyable. Ma peau est rebondie et éclatante." }
    ],
    stats: [
      { percentage: "96%", desc: "Peau plus hydratée" },
      { percentage: "91%", desc: "Teint plus lumineux" },
      { percentage: "87%", desc: "Rides atténuées" },
      { percentage: "4.8/5", desc: "Satisfaction client" }
    ]
  },
  'hydroface': {
    color: '#c9a084',
    secondaryColor: '#d4b5a0',
    icon: Sparkles,
    badge: 'TECHNOLOGIE AVANCÉE',
    heroImage: '/services/hydro-cleaning.jpg',
    heroDescription: 'Un nettoyage professionnel qui purifie votre peau en douceur tout en préservant son équilibre naturel. Pores affinés et teint unifié dès la première séance, pour une peau qui respire la santé.',
    benefits: [
      { icon: Sparkles, title: "Purification profonde", desc: "Extraction douce des impuretés", detail: "Hydro-dermabrasion dernière génération" },
      { icon: Shield, title: "Barrière protectrice", desc: "Renforce les défenses naturelles", detail: "Protection anti-pollution" },
      { icon: TrendingUp, title: "Éclat instantané", desc: "Teint lumineux immédiat", detail: "Résultats visibles dès la 1ère séance" },
      { icon: Heart, title: "Régulation sébacée", desc: "Équilibre la production de sébum", detail: "Idéal peaux mixtes à grasses" }
    ],
    testimonials: [
      { name: "Léa M.", rating: 4, comment: "Mes pores sont vraiment moins visibles et ma peau reste nette plus longtemps." },
      { name: "Sarah B.", rating: 5, comment: "Après des années de lutte contre les points noirs, ce soin a changé la donne." },
      { name: "Julie D.", rating: 4, comment: "Un bon soin qui maintient ma peau propre entre deux séances." }
    ],
    stats: [
      { percentage: "89%", desc: "Pores resserrés" },
      { percentage: "85%", desc: "Moins d'imperfections" },
      { percentage: "92%", desc: "Peau plus lumineuse" },
      { percentage: "4.6/5", desc: "Satisfaction client" }
    ]
  },
  'nanoneedling': {
    color: '#d4b5a0',
    secondaryColor: '#c9a084',
    icon: Gem,
    badge: 'Soin Anti-Âge',
    heroImage: '/services/renaissance.jpg',
    heroDescription: 'Le soin anti-âge nouvelle génération qui stimule le renouvellement cellulaire. Rides atténuées, fermeté retrouvée et éclat révélé pour une véritable renaissance de votre peau.',
    benefits: [
      { icon: Gem, title: "Renaissance cellulaire", desc: "Régénération profonde", detail: "Facteurs de croissance EGF" },
      { icon: Shield, title: "Restructuration", desc: "Stimule le collagène", detail: "Microneedling de précision" },
      { icon: TrendingUp, title: "Rajeunissement", desc: "Peau visiblement plus jeune", detail: "Technology LED thérapeutique" },
      { icon: Heart, title: "Éclat sublime", desc: "Teint uniforme et lumineux", detail: "Peeling enzymatique doux" }
    ],
    testimonials: [
      { name: "Marie P.", rating: 5, comment: "Une vraie renaissance ! Ma peau est transformée, plus ferme et éclatante." },
      { name: "Anne S.", rating: 4, comment: "Les taches se sont bien atténuées et mon teint est plus uniforme." },
      { name: "Céline R.", rating: 5, comment: "Le grain de peau est affiné, les pores moins visibles. Très bon résultat !" }
    ],
    stats: [
      { percentage: "93%", desc: "Peau régénérée" },
      { percentage: "88%", desc: "Taches atténuées" },
      { percentage: "84%", desc: "Rides réduites" },
      { percentage: "4.7/5", desc: "Satisfaction client" }
    ]
  },
  'bb-glow': {
    color: '#ddb892',
    secondaryColor: '#d4b5a0',
    icon: Heart,
    badge: 'EFFET BONNE MINE',
    heroImage: '/services/bb-glow.jpg',
    heroDescription: 'Le secret d\'un teint parfait au quotidien. Cette technique révolutionnaire unifie et illumine votre peau pour un effet "sans maquillage" naturel qui dure plusieurs semaines.',
    benefits: [
      { icon: Heart, title: "Teint parfait", desc: "Effet bonne mine permanent", detail: "Pigments bio-compatibles" },
      { icon: Sparkles, title: "Luminosité", desc: "Éclat naturel sublimé", detail: "Illuminateurs de teint" },
      { icon: Shield, title: "Uniformité", desc: "Corrige les imperfections", detail: "Camouflage longue durée" },
      { icon: TrendingUp, title: "Hydratation", desc: "Peau nourrie en profondeur", detail: "Sérums vitaminés" }
    ],
    testimonials: [
      { name: "Lucie B.", rating: 4, comment: "Je me réveille avec un meilleur teint. Moins de fond de teint nécessaire !" },
      { name: "Marina T.", rating: 5, comment: "Les rougeurs sont camouflées et ma peau resplendit. Un gain de temps fou !" },
      { name: "Sophia L.", rating: 4, comment: "L'effet bonne mine est naturel et dure quelques semaines." }
    ],
    stats: [
      { percentage: "94%", desc: "Teint uniforme" },
      { percentage: "90%", desc: "Effet bonne mine" },
      { percentage: "86%", desc: "Imperfections camouflées" },
      { percentage: "4.5/5", desc: "Satisfaction client" }
    ]
  },
  'led-therapie': {
    color: '#c9a084',
    secondaryColor: '#ddb892',
    icon: Zap,
    badge: 'TECHNOLOGIE NASA',
    heroImage: '/services/led-therapie.jpg',
    heroDescription: 'La photothérapie médicale qui répare et régénère en profondeur. Inflammation apaisée, collagène boosté et cicatrisation accélérée grâce à la puissance de la lumière thérapeutique.',
    benefits: [
      { icon: Zap, title: "Photobiomodulation", desc: "Stimulation cellulaire", detail: "Longueurs d'onde optimisées" },
      { icon: Shield, title: "Anti-inflammatoire", desc: "Apaise et répare", detail: "LED rouge et infrarouge" },
      { icon: TrendingUp, title: "Anti-âge", desc: "Booste le collagène", detail: "LED bleue antibactérienne" },
      { icon: Heart, title: "Cicatrisation", desc: "Répare les tissus", detail: "Protocole médical certifié" }
    ],
    testimonials: [
      { name: "Isabelle G.", rating: 5, comment: "Mes cicatrices d'acné se sont bien atténuées. La LED thérapie fonctionne vraiment !" },
      { name: "Nathalie D.", rating: 4, comment: "Les rides se sont estompées et ma peau est plus ferme. Bons résultats." },
      { name: "Camille F.", rating: 4, comment: "L'inflammation a diminué et ma rosacée est mieux contrôlée." }
    ],
    stats: [
      { percentage: "91%", desc: "Inflammation réduite" },
      { percentage: "87%", desc: "Production collagène +" },
      { percentage: "83%", desc: "Cicatrices atténuées" },
      { percentage: "4.6/5", desc: "Satisfaction client" }
    ]
  }
};

const generateProtocolSteps = (serviceName: string, duration: number) => {
  const baseSteps = [
    { title: "Consultation", desc: "Découverte de votre peau et définition de vos objectifs", duration: "5 min" },
    { title: "Préparation", desc: "Nettoyage tout en douceur", duration: "10 min" },
    { title: "Soin principal", desc: "Le cœur de votre expérience beauté", duration: `${Math.floor(duration * 0.5)} min` },
    { title: "Masque", desc: "Moment de détente et d'hydratation", duration: "15 min" },
    { title: "Finition", desc: "Protection et conseils beauté", duration: "10 min" }
  ];
  return baseSteps;
};

const generateFAQ = (serviceName: string, price: number) => [
  {
    q: `Le ${serviceName} convient-il à mon type de peau ?`,
    a: "Absolument ! Nos protocoles sont entièrement personnalisables. Lors du diagnostic initial, nous adaptons chaque étape du soin à votre type de peau et à vos besoins spécifiques."
  },
  {
    q: "À quelle fréquence dois-je faire ce soin ?",
    a: "Pour des résultats optimaux, nous recommandons une séance toutes les 3-4 semaines. Un protocole de 4-6 séances permet d'obtenir des résultats durables avec un entretien mensuel."
  },
  {
    q: "Quand vais-je voir les premiers résultats ?",
    a: "Les premiers résultats sont visibles immédiatement après la séance. Les effets continuent de s'améliorer dans les jours et semaines qui suivent, avec un pic optimal après 3-4 semaines."
  },
  {
    q: "Y a-t-il des contre-indications ?",
    a: "Les contre-indications sont rares et varient selon le soin. Nous effectuons systématiquement un questionnaire de santé complet lors de votre première visite pour garantir votre sécurité."
  },
  {
    q: "Le soin est-il douloureux ?",
    a: `Non, le ${serviceName} est une expérience agréable et relaxante. Vous pourriez ressentir de légères sensations selon les techniques utilisées, mais le confort reste notre priorité.`
  }
];

export default function ServicePageTemplate({ slug }: ServicePageTemplateProps) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [realStats, setRealStats] = useState<any>(null);
  const [realTestimonials, setRealTestimonials] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<string>("0");
  const [totalReviews, setTotalReviews] = useState<number>(0);

  useEffect(() => {
    const fetchService = async () => {
      try {
        // Récupérer les données du service
        const response = await fetch(`/api/services/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setService(data);
        }
        
        // Récupérer les vraies statistiques et avis
        const statsResponse = await fetch(`/api/services/${slug}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setRealStats(statsData.stats);
          setRealTestimonials(statsData.testimonials);
          setAverageRating(statsData.averageRating || "0");
          setTotalReviews(statsData.totalReviews || 0);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du service:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug]);

  if (loading) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d4b5a0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2c3e50]/60">Chargement...</p>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-playfair text-[#2c3e50] mb-4">Service non trouvé</h1>
          <Link href="/services" className="text-[#d4b5a0] hover:underline">
            Retour aux services
          </Link>
        </div>
      </main>
    );
  }

  const enrichment = serviceEnrichment[slug] || serviceEnrichment['hydroneedling'];
  const IconComponent = enrichment.icon;
  
  // Utiliser le protocole de la DB s'il existe, sinon générer automatiquement
  const protocolSteps = service.protocol 
    ? (typeof service.protocol === 'string' ? JSON.parse(service.protocol) : service.protocol)
    : generateProtocolSteps(service.name, service.duration);
  
  const faqs = generateFAQ(service.name, service.price);
  
  // Utiliser le système centralisé de prix
  const displayPrice = getDisplayPrice(service);
  const forfaitDisplayPrice = getForfaitDisplayPrice(service);
  const isPromo = hasPromotion(service);
  const isForfaitPromo = hasForfaitPromotion(service);
  const forfaitSavings = getForfaitSavings(service);
  const monthlyPrice = getMonthlyPrice(service);

  return (
    <main className={`pt-24 pb-20 min-h-screen ${enrichment.isSignature ? 'bg-gradient-to-b from-[#fdfbf7] via-white to-[#f8f6f0]' : 'bg-gradient-to-b from-white to-gray-50/30'}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {enrichment.isSignature && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4b5a0]/5 via-transparent to-[#c9a084]/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#d4b5a0]/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tl from-[#c9a084]/10 to-transparent rounded-full blur-3xl"></div>
          </div>
        )}
        {!enrichment.isSignature && (
          <div className="absolute inset-0 bg-gradient-to-br" style={{ 
            background: `linear-gradient(135deg, ${enrichment.color}10 0%, transparent 50%, ${enrichment.secondaryColor}10 100%)` 
          }}></div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 py-16 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenu */}
            <div className="space-y-8">
              <div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${enrichment.isSignature ? 'px-6 py-3 shadow-lg animate-pulse-slow' : ''}`} style={{
                  background: enrichment.isSignature 
                    ? `linear-gradient(135deg, #d4b5a0, #c9a084)` 
                    : `linear-gradient(135deg, ${enrichment.color}20, ${enrichment.secondaryColor}20)`
                }}>
                  <IconComponent className={`${enrichment.isSignature ? 'w-5 h-5' : 'w-4 h-4'}`} style={{ color: enrichment.isSignature ? 'white' : enrichment.color }} />
                  <span className={`${enrichment.isSignature ? 'text-base font-bold text-white' : 'text-sm font-medium'}`} style={{ color: enrichment.isSignature ? undefined : enrichment.color }}>
                    {enrichment.badge}
                  </span>
                </div>
                
                <h1 className={`${enrichment.isSignature ? 'text-6xl lg:text-7xl' : 'text-5xl lg:text-6xl'} font-playfair text-[#2c3e50] mb-6`}>
                  {enrichment.isSignature ? (
                    <>
                      <span className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] bg-clip-text text-transparent">
                        {service.name.split(' ')[0]}
                      </span>
                      <span className="text-[#2c3e50]"> {service.name.split(' ').slice(1).join(' ')}</span>
                    </>
                  ) : (
                    service.name.split(' ').map((word, i) => (
                      <span key={i}>
                        {i === 0 ? word : <span style={{ color: enrichment.color }}> {word}</span>}
                      </span>
                    ))
                  )}
                </h1>
                
                <p className="text-xl text-[#2c3e50]/70 leading-relaxed mb-4">
                  {service.description}
                </p>
                <p className="text-lg text-[#2c3e50]/60 leading-relaxed">
                  {enrichment.heroDescription || "Un protocole d'exception que j'ai développé pour transformer votre peau en profondeur. Résultats visibles dès la première séance, effets durables garantis."}
                </p>
              </div>

              {/* Points clés */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <Clock className="w-8 h-8" style={{ color: enrichment.color }} />
                  <div>
                    <p className="text-sm text-[#2c3e50]/60">Durée</p>
                    <p className="font-semibold text-[#2c3e50]">{service.duration} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <Star className="w-8 h-8 text-amber-500" />
                  <div>
                    <p className="text-sm text-[#2c3e50]/60">Satisfaction</p>
                    <p className="font-semibold text-[#2c3e50]">{enrichment.stats[3].percentage}</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href={`/reservation?service=${slug}`} 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${enrichment.color}, ${enrichment.secondaryColor})` }}
                >
                  <Calendar className="w-5 h-5" />
                  Réserver ce soin
                </Link>
                <button 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 rounded-full font-semibold transition-all"
                  style={{ 
                    borderColor: enrichment.color, 
                    color: enrichment.color,
                    backgroundColor: 'transparent'
                  }}
                  onClick={() => {
                    document.getElementById('details-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${enrichment.color}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Plus d'informations
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image avec overlay */}
            <div className="relative lg:scale-110 lg:ml-8">
              <div className="absolute -inset-4 blur-3xl" style={{
                background: `linear-gradient(135deg, ${enrichment.color}30, ${enrichment.secondaryColor}30)`
              }}></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: slug === 'hydroneedling' ? '500px' : 'auto' }}>
                <img
                  src={enrichment.heroImage}
                  alt={service.name}
                  className={`w-full ${slug === 'hydroneedling' ? 'h-[500px]' : 'h-[450px]'} object-cover`}
                  style={slug === 'led-therapie' ? { transform: 'rotate(-90deg) scale(1.5)', objectPosition: 'center center' } : slug === 'hydroneedling' ? { objectPosition: 'center 30%' } : {}}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/40 via-transparent to-transparent"></div>
                
                {/* Badge prix */}
                <div className={`absolute bottom-6 right-6 ${enrichment.isSignature ? 'bg-gradient-to-br from-[#d4b5a0] to-[#c9a084]' : 'bg-white/95'} backdrop-blur-md rounded-2xl p-4 shadow-xl ${enrichment.isSignature ? 'px-5 py-4' : ''}`}>
                  {enrichment.isSignature && (
                    <div className="flex items-center gap-2 mb-2">
                      <Gem className="w-4 h-4 text-white" />
                      <p className="text-xs text-white font-bold uppercase tracking-wider">Tarif Exclusif</p>
                    </div>
                  )}
                  <p className={`text-sm ${enrichment.isSignature ? 'text-white/90' : 'text-[#2c3e50]/60'} mb-1`}>Tarif unique</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`${enrichment.isSignature ? 'text-3xl' : 'text-3xl'} font-bold`} style={{ color: enrichment.isSignature ? 'white' : enrichment.color }}>
                      {displayPrice}€
                    </span>
                    {isPromo && (
                      <>
                        <span className={`text-sm ${enrichment.isSignature ? 'text-white/60' : 'text-[#2c3e50]/60'} line-through`}>{service.price}€</span>
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">-{getDiscountPercentage(service.price, service.promoPrice!)}%</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className={`py-12 px-4 border-y ${enrichment.isSignature ? 'bg-gradient-to-r from-[#fdfbf7] via-white to-[#fdfbf7]' : ''}`} style={{ borderColor: `${enrichment.color}20` }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-wider font-bold" style={{ color: enrichment.color }}>Résultats Cliniquement Prouvés</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {enrichment.stats.map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className={`${enrichment.isSignature ? 'text-4xl' : 'text-3xl'} font-bold mb-2`} style={{ color: enrichment.isSignature ? `${enrichment.color}` : enrichment.color }}>
                  {enrichment.isSignature && stat.percentage !== '—' && <span className="text-2xl">⭐ </span>}
                  {stat.percentage}
                </div>
                <p className={`text-sm ${enrichment.isSignature ? 'font-medium' : ''} text-[#2c3e50]/60`}>{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bénéfices détaillés */}
      <section id="details-section" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair text-[#2c3e50] mb-4">
              Les bienfaits exceptionnels du {service.name}
            </h2>
            <p className="text-lg text-[#2c3e50]/60 max-w-3xl mx-auto">
              {service.benefits || "Une approche holistique pour transformer votre peau en profondeur, avec des résultats visibles et durables grâce à notre expertise professionnelle."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {enrichment.benefits.map((benefit: any, index: number) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{
                      background: `linear-gradient(135deg, ${enrichment.color}20, ${enrichment.secondaryColor}20)`
                    }}>
                      <BenefitIcon className="w-7 h-7" style={{ color: enrichment.color }} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#2c3e50] mb-2">{benefit.title}</h3>
                    <p className="text-sm text-[#2c3e50]/60 mb-2">{benefit.desc}</p>
                    <p className="text-xs font-medium" style={{ color: `${enrichment.color}CC` }}>
                      {benefit.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Protocole et Contre-indications */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50/30 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair text-[#2c3e50] mb-4">
              Protocole & Informations
            </h2>
            <p className="text-lg text-[#2c3e50]/60 max-w-3xl mx-auto">
              Tout ce que vous devez savoir pour profiter pleinement de votre soin
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Protocole */}
            <div>
              <h3 className="text-2xl font-semibold text-[#2c3e50] mb-8 flex items-center gap-3">
                <Sparkles className="w-6 h-6" style={{ color: enrichment.color }} />
                Déroulement du soin
              </h3>
              <div className="space-y-4">
                {protocolSteps.map((step: any, index: number) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold" style={{
                        background: `linear-gradient(135deg, ${enrichment.color}, ${enrichment.secondaryColor})`
                      }}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-[#2c3e50] text-base">{step.title}</h4>
                          <span className="text-sm font-medium" style={{ color: enrichment.color }}>
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-sm text-[#2c3e50]/70 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contre-indications et Recommandations */}
            <div>
              <h3 className="text-2xl font-semibold text-[#2c3e50] mb-8 flex items-center gap-3">
                <Shield className="w-6 h-6" style={{ color: enrichment.color }} />
                Informations importantes
              </h3>
              <div className="space-y-5">
                {/* Contre-indications */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-semibold text-[#2c3e50] text-base mb-4">Contre-indications</h4>
                  <ul className="space-y-3 text-sm text-[#2c3e50]/70">
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 mt-0.5" />
                      <span>Grossesse ou allaitement (selon le soin)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 mt-0.5" />
                      <span>Infections cutanées actives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 mt-0.5" />
                      <span>Allergies aux composants utilisés</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 mt-0.5" />
                      <span>Traitements médicaux en cours (à signaler)</span>
                    </li>
                  </ul>
                </div>

                {/* Recommandations avant */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-semibold text-[#2c3e50] text-base mb-4">Avant votre soin</h4>
                  <ul className="space-y-3 text-sm text-[#2c3e50]/70">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Arriver démaquillée ou avec un maquillage léger</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Éviter l'exposition solaire 48h avant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Bien hydrater votre peau les jours précédents</span>
                    </li>
                  </ul>
                </div>

                {/* Recommandations après */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-semibold text-[#2c3e50] text-base mb-4">Après votre soin</h4>
                  <ul className="space-y-3 text-sm text-[#2c3e50]/70">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Protection solaire SPF50 obligatoire</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Maintenir une bonne hydratation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Suivre les conseils personnalisés donnés</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Éviter sauna et hammam pendant 48h</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tarification détaillée */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-playfair text-[#2c3e50] text-center mb-4">
            Nos formules sur mesure
          </h2>
          <p className="text-center text-lg text-[#2c3e50]/70 mb-12 max-w-3xl mx-auto">
            <span className="font-bold text-2xl" style={{ color: enrichment.color }}>1 séance à {displayPrice}€</span>
            {forfaitDisplayPrice && (
              <>
                <span className="mx-4 text-[#2c3e50]/40">|</span>
                <span className="font-bold text-2xl" style={{ color: enrichment.secondaryColor }}>Forfait 4 séances à {forfaitDisplayPrice}€</span>
              </>
            )}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Découverte */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 flex flex-col h-full">
              <div className="p-6" style={{
                background: `linear-gradient(135deg, ${enrichment.color}10, ${enrichment.secondaryColor}10)`
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">1 SÉANCE</span>
                </div>
                <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Séance Découverte</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold" style={{ color: enrichment.color }}>
                    {displayPrice}€
                  </span>
                  {isPromo && (
                    <>
                      <span className="text-sm text-[#2c3e50]/60 line-through">{service.price}€</span>
                      <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded">-{getDiscountPercentage(service.price, service.promoPrice!)}%</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-[#2c3e50]/70 mt-1">Découvrez ce soin d'exception</p>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Analyse de peau offerte
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Soin complet {service.duration} minutes
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Conseils beauté sur mesure
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Résultats visibles immédiatement
                  </li>
                </ul>
                <Link 
                  href={`/reservation?service=${slug}`}
                  className="block text-center py-3 rounded-lg font-semibold transition-all hover:shadow-lg mt-auto"
                  style={{ 
                    backgroundColor: enrichment.color,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Réserver
                </Link>
              </div>
            </div>

            {/* Forfait */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 flex flex-col h-full">
              <div className="p-6 relative" style={{
                background: `linear-gradient(135deg, ${enrichment.color}10, ${enrichment.secondaryColor}10)`
              }}>
                <div className="absolute top-2 right-2 bg-amber-400 text-[#2c3e50] text-xs font-bold px-2 py-1 rounded animate-pulse">
                  ⭐ BEST SELLER
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">FORFAIT 4 SÉANCES</span>
                </div>
                <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Cure Transformation</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold" style={{ color: enrichment.color }}>
                    {forfaitDisplayPrice}€
                  </span>
                  {isForfaitPromo && service.forfaitPrice && (
                    <>
                      <span className="text-sm text-[#2c3e50]/60 line-through">{service.forfaitPrice}€</span>
                      <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded">-{getDiscountPercentage(service.forfaitPrice, service.forfaitPromo!)}€</span>
                    </>
                  )}
                </div>
                {forfaitSavings > 0 && (
                  <p className="text-sm text-[#2c3e50]/70 mt-1">Économisez <span className="font-bold" style={{ color: enrichment.color }}>{forfaitSavings}€</span></p>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Forfait de 4 séances
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Suivi évolution de votre peau
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Produits d'entretien offerts
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Réduction boutique -10%
                  </li>
                </ul>
                <Link 
                  href={`/reservation?service=${slug}&package=forfait`}
                  className="block text-center py-3 rounded-lg font-semibold transition-all mt-auto"
                  style={{ 
                    backgroundColor: `${enrichment.color}`,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Choisir ce forfait
                </Link>
              </div>
            </div>

            {/* Formule Liberté temporairement désactivée */}
            {false && forfaitDisplayPrice ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 flex flex-col h-full">
              <div className="p-6" style={{
                background: `linear-gradient(135deg, ${enrichment.color}10, ${enrichment.secondaryColor}10)`
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">ABONNEMENT</span>
                </div>
                <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Formule Liberté</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold" style={{ color: enrichment.color }}>{monthlyPrice}€</span>
                  <span className="text-sm text-[#2c3e50]/60">/mois</span>
                </div>
                <p className="text-sm text-[#2c3e50]/70 mt-1">1 séance par mois • -20% sur le tarif normal</p>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    1 séance garantie chaque mois
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Tarif préférentiel fidélité
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Créneaux prioritaires
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#2c3e50]/70">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Sans engagement
                  </li>
                </ul>
                <Link
                  href={`/reservation?service=${slug}&package=abonnement`}
                  className="block text-center py-3 rounded-lg font-semibold transition-all hover:shadow-lg mt-auto"
                  style={{
                    backgroundColor: enrichment.color,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Choisir cette formule
                </Link>
              </div>
            </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 px-4 bg-gray-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair text-[#2c3e50] mb-4">
              L'expérience de mes clientes
            </h2>
            <div className="flex justify-center items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(i => {
                  const avgRating = parseFloat(enrichment.stats[3].percentage.split('/')[0]);
                  return <Star key={i} className={`w-5 h-5 ${i <= Math.floor(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                })}
              </div>
              <span className="text-[#2c3e50]/60">
                {enrichment.stats[3].percentage} sur {slug === 'hydroneedling' ? '47' : slug === 'hydroface' ? '35' : slug === 'nanoneedling' ? '42' : '31'} avis vérifiés
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {enrichment.testimonials.map((testimonial: any, index: number) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{
                      background: `linear-gradient(135deg, ${enrichment.color}, ${enrichment.secondaryColor})`
                    }}>
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2c3e50]">{testimonial.name}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                
                <p className="text-[#2c3e50]/70 text-sm italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-playfair text-[#2c3e50] text-center mb-12">
            Questions fréquentes
          </h2>

          <div className="space-y-4">
            {faqs.map((faq: any, index: number) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
                <h3 className="font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: enrichment.color }} />
                  {faq.q}
                </h3>
                <p className="text-[#2c3e50]/70 pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Autres soins recommandés */}
      <section className="py-20 px-4 bg-gray-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair text-[#2c3e50] mb-4">
              Découvrez mes autres soins
            </h2>
            <p className="text-lg text-[#2c3e50]/60">
              Complétez votre routine beauté avec mes autres prestations
            </p>
          </div>
          <OtherServices currentServiceSlug={slug} />
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-12 text-center text-white relative overflow-hidden" style={{
            background: `linear-gradient(135deg, ${enrichment.color}, ${enrichment.secondaryColor})`
          }}>
            <div className="absolute inset-0 bg-white/5"></div>
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-playfair mb-4">
                Prête pour transformer votre peau ?
              </h2>
              <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
                Rejoignez les centaines de clientes qui ont révélé la beauté de leur peau grâce au {service.name}. 
                Réservez votre première séance et découvrez la différence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link 
                  href="/reservation" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105"
                  style={{ color: enrichment.color }}
                >
                  <Calendar className="w-5 h-5" />
                  Réserver maintenant
                </Link>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all"
                >
                  Une question ?
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/10 rounded-full">
                <Users className="w-5 h-5" />
                <span className="text-sm">Plus de 500 clientes satisfaites</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}