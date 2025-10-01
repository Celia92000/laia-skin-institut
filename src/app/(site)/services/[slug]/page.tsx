'use client';

import { useState, useEffect } from 'react';
import './page.module.css';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Clock, Star, Check, ArrowRight, Calendar, Shield, Sparkles,
  ChevronRight, Heart, Award, Users, Phone, ChevronDown,
  Gift, TrendingUp, Zap, Eye, Smile, RefreshCw
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  launchPrice?: number;
  forfaitPrice?: number;
  forfaitPromo?: number;
  duration: number;
  benefits: string[];
  process: any[];
  recommendations: string[];
  contraindications: string[];
  mainImage?: string;
  gallery?: string;
  videoUrl?: string;
}

interface Technology {
  name: string;
  description: string;
  icon: string;
}

interface Result {
  timeframe: string;
  title: string;
  description: string;
  percentage?: string;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('benefits');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    fetchService();
  }, [params.slug]);

  const fetchService = async () => {
    try {
      const res = await fetch(`/api/services/${params.slug}`);
      if (res.ok) {
        const data = await res.json();
        // Parse JSON strings
        if (typeof data.benefits === 'string') {
          data.benefits = JSON.parse(data.benefits);
        }
        if (typeof data.process === 'string') {
          data.process = JSON.parse(data.process);
        }
        if (typeof data.recommendations === 'string') {
          data.recommendations = JSON.parse(data.recommendations);
        }
        if (typeof data.contraindications === 'string') {
          data.contraindications = JSON.parse(data.contraindications);
        }
        setService(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="pt-36 pb-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="pt-36 pb-20 min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl">Service non trouvé</h1>
          <Link href="/prestations" className="text-[#20b2aa] hover:underline mt-4 inline-block">
            Retour aux prestations
          </Link>
        </div>
      </main>
    );
  }

  const faqs = [
    {
      question: `Combien de séances de ${service.name} sont recommandées ?`,
      answer: `Pour des résultats optimaux, nous recommandons généralement une cure de 4 à 6 séances, espacées de 2 à 4 semaines selon votre type de peau et vos objectifs. Chaque cure est personnalisée en fonction de votre diagnostic initial et de l'évolution observée au fil des séances. Notre équipe ajuste le protocole pour maximiser les bénéfices et garantir votre satisfaction.`
    },
    {
      question: "Y a-t-il des effets secondaires ?",
      answer: "Les effets secondaires sont minimes et temporaires : légères rougeurs ou sensibilité qui disparaissent généralement en quelques heures. Avant chaque séance, nous effectuons un test de sensibilité et adaptons l'intensité du traitement à votre type de peau. Notre équipe est formée pour identifier et prévenir toute réaction indésirable, assurant ainsi votre confort et votre sécurité tout au long du soin."
    },
    {
      question: "Puis-je combiner ce soin avec d'autres traitements ?",
      answer: "Absolument ! Nous excellons dans la création de protocoles personnalisés combinant plusieurs soins pour des résultats synergiques. Par exemple, associer ${service.name} avec notre peeling signature peut améliorer l'absorption des actifs, tandis qu'une combinaison avec le microneedling optimise la régénération cellulaire. Lors de votre consultation, nous établirons ensemble un plan de traitement sur mesure adapté à vos objectifs beauté."
    },
    {
      question: "À partir de quel âge puis-je faire ce soin ?",
      answer: "Ce soin convient généralement dès 18 ans, mais nous adaptons nos protocoles selon l'âge et les besoins spécifiques. Pour les peaux jeunes (18-30 ans), nous privilégions la prévention et l'hydratation. Entre 30 et 50 ans, nous intensifions les actifs anti-âge. Au-delà de 50 ans, nous proposons des protocoles renforcés pour la fermeté et la régénération. Chaque programme est unique et évolue avec vous."
    }
  ];

  const testimonials = [
    {
      name: "Marie D.",
      age: "42 ans",
      rating: 5,
      comment: "Un soin exceptionnel ! Ma peau n'a jamais été aussi belle et hydratée. Les ridules autour de mes yeux ont nettement diminué et mon teint est lumineux. L'équipe est très professionnelle et à l'écoute.",
      date: "Il y a 2 semaines",
      sessions: "4 séances",
      verified: true
    },
    {
      name: "Sophie L.",
      age: "38 ans",
      rating: 5,
      comment: "Je recommande vivement ! Résultats visibles dès la première séance. Ma peau est plus ferme, plus élastique. Les taches pigmentaires se sont estompées. Un vrai coup d'éclat qui dure !",
      date: "Il y a 1 mois",
      sessions: "6 séances",
      verified: true
    },
    {
      name: "Julie B.",
      age: "35 ans",
      rating: 5,
      comment: "Un moment de détente absolue avec des résultats spectaculaires. Non seulement ma peau est transformée, mais je ressors de chaque séance complètement détendue. C'est devenu mon rituel bien-être mensuel.",
      date: "Il y a 3 semaines",
      sessions: "3 séances",
      verified: true
    },
    {
      name: "Catherine M.",
      age: "48 ans",
      rating: 5,
      comment: "Après des années à chercher le soin idéal, j'ai enfin trouvé ! Les résultats dépassent mes attentes. Ma peau paraît 10 ans plus jeune, les pores sont resserrés et j'ai retrouvé l'ovale de mon visage.",
      date: "Il y a 1 semaine",
      sessions: "8 séances",
      verified: true
    },
    {
      name: "Amélie R.",
      age: "29 ans",
      rating: 5,
      comment: "Parfait pour ma peau sensible et réactive. Aucune irritation, que des bénéfices ! L'acné a disparu, les cicatrices s'estompent et ma peau est enfin équilibrée. Je ne peux plus m'en passer !",
      date: "Il y a 2 mois",
      sessions: "5 séances",
      verified: true
    }
  ];

  const technologies: Technology[] = [
    {
      name: "Radiofréquence",
      description: "Stimule la production de collagène et raffermit la peau en profondeur grâce à la chaleur contrôlée.",
      icon: "🔥"
    },
    {
      name: "LED Thérapie",
      description: "Utilise différentes longueurs d'onde pour traiter l'acné, stimuler le collagène et apaiser l'inflammation.",
      icon: "💡"
    },
    {
      name: "Ultrasons",
      description: "Pénétration profonde des actifs et drainage lymphatique pour un effet lifting immédiat.",
      icon: "〰️"
    },
    {
      name: "Microneedling",
      description: "Micro-perforations contrôlées pour stimuler la régénération naturelle et maximiser l'absorption des actifs.",
      icon: "✨"
    }
  ];

  const results: Result[] = [
    {
      timeframe: "Immédiat",
      title: "Éclat instantané",
      description: "Peau repulpée, teint lumineux, pores resserrés, sensation de fraîcheur",
      percentage: "100%"
    },
    {
      timeframe: "7 jours",
      title: "Transformation visible",
      description: "Texture lisse, ridules atténuées, hydratation optimale, teint unifié",
      percentage: "89%"
    },
    {
      timeframe: "14 jours",
      title: "Régénération profonde",
      description: "Fermeté améliorée, rides réduites, ovale redessiné, éclat durable",
      percentage: "94%"
    },
    {
      timeframe: "30 jours",
      title: "Rajeunissement global",
      description: "Peau transformée, densité restaurée, jeunesse retrouvée, résultats durables",
      percentage: "97%"
    }
  ];

  return (
    <main className="pt-24 pb-20 min-h-screen bg-gradient-to-b from-white via-[#f0fcff] to-white">
      {/* Hero Section Moderne */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#20b2aa]/5 via-transparent to-[#d4b5a0]/5"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link href="/" className="text-gray-500 hover:text-[#20b2aa] transition">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/prestations" className="text-gray-500 hover:text-[#20b2aa] transition">
              Prestations
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[#2c3e50] font-medium">{service.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenu Texte */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-[#20b2aa]/10 text-[#20b2aa] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Soin Signature
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-playfair font-light text-[#2c3e50] mb-6 leading-tight">
                {service.name}
              </h1>
              
              <p className="text-xl text-[#2c3e50]/80 mb-8 leading-relaxed">
                {service.shortDescription}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm">
                  <Clock className="w-5 h-5 text-[#20b2aa]" />
                  <span className="text-[#2c3e50] font-medium">{service.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-[#2c3e50] font-medium">4.9/5 (127 avis)</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm">
                  <Award className="w-5 h-5 text-[#d4b5a0]" />
                  <span className="text-[#2c3e50] font-medium">Best-seller</span>
                </div>
              </div>

              {/* Prix et CTA */}
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    {service.launchPrice && (
                      <p className="text-gray-400 line-through text-lg">{service.price}€</p>
                    )}
                    <p className="text-4xl font-light text-[#2c3e50]">
                      {service.launchPrice || service.price}€
                    </p>
                    {service.launchPrice && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Offre de lancement -40%
                      </p>
                    )}
                  </div>
                  {service.forfaitPromo && service.forfaitPrice && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Forfait 4 séances</p>
                      <p className="text-2xl font-medium text-[#20b2aa]">{service.forfaitPromo}€</p>
                      <p className="text-xs text-green-600">Économisez {service.forfaitPrice - service.forfaitPromo}€</p>
                    </div>
                  )}
                </div>
                
                <Link 
                  href="/reservation"
                  className="w-full bg-gradient-to-r from-[#20b2aa] to-[#48cae4] text-white py-4 rounded-xl font-medium text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Réserver ce soin
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Annulation gratuite
                  </span>
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-4 h-4" />
                    Report possible
                  </span>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative animate-fade-in-left">
              <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={service.mainImage || `/images/${service.slug}.jpg`}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/40 via-transparent to-transparent"></div>
              </div>
              
              {/* Badge flottant */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#20b2aa] to-[#48cae4] rounded-xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#2c3e50]">2,500+</p>
                    <p className="text-sm text-gray-500">Clientes satisfaites</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galerie d'images */}
      {service.gallery && (() => {
        try {
          const galleryImages = JSON.parse(service.gallery);
          return galleryImages.length > 0 ? (
            <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-playfair text-[#2c3e50] mb-4">
                    Galerie
                  </h2>
                  <p className="text-gray-600">
                    Découvrez notre univers en images
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
                        alt={`${service.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-[#2c3e50]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white font-medium">
                            {service.name}
                          </p>
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

      {/* Section Description Détaillée */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-8 text-center">
            Une expérience unique pour votre peau
          </h2>
          <div className="prose prose-lg max-w-none text-[#2c3e50]/80">
            <p className="leading-relaxed mb-6 text-lg">
              {service.description}
            </p>
            <p className="leading-relaxed mb-6">
              <strong className="text-[#2c3e50]">Un protocole d'excellence unique.</strong> Ce soin d'exception a été 
              spécialement développé en collaboration avec des dermatologues et des experts en esthétique médicale pour 
              répondre aux besoins les plus exigeants. Chaque étape a été minutieusement pensée pour maximiser l'efficacité 
              tout en garantissant votre confort absolu.
            </p>
            <p className="leading-relaxed mb-6">
              <strong className="text-[#2c3e50]">Technologies de pointe et actifs premium.</strong> {service.name} combine 
              les dernières innovations technologiques avec des actifs hautement concentrés, sélectionnés pour leur pureté 
              et leur biodisponibilité exceptionnelle. Cette synergie unique permet une pénétration optimale et des résultats 
              visibles dès la première séance, avec une amélioration continue au fil des traitements.
            </p>
            <p className="leading-relaxed mb-6">
              <strong className="text-[#2c3e50]">Une expérience sensorielle incomparable.</strong> Au-delà de l'efficacité 
              cliniquement prouvée, nous avons créé une véritable parenthèse de bien-être. Les textures fondantes, les parfums 
              délicats et les gestuelles expertes transforment chaque séance en un moment de pure détente où le temps s'arrête.
            </p>
            <p className="leading-relaxed">
              <strong className="text-[#2c3e50]">Votre transformation commence ici.</strong> Notre approche holistique 
              considère votre peau dans sa globalité, prenant en compte votre mode de vie, vos habitudes et vos objectifs 
              beauté. Ensemble, nous créons un parcours sur mesure qui révèle et sublime votre beauté naturelle, pour des 
              résultats qui dépassent vos attentes.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['benefits', 'process', 'results', 'recommendations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#20b2aa] to-[#48cae4] text-white shadow-lg'
                    : 'bg-white text-[#2c3e50] hover:shadow-md'
                }`}
              >
                {tab === 'benefits' && 'Bénéfices'}
                {tab === 'process' && 'Déroulement'}
                {tab === 'results' && 'Résultats'}
                {tab === 'recommendations' && 'Recommandations'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl">
            {/* Bénéfices */}
            {activeTab === 'benefits' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-playfair text-[#2c3e50] mb-6 flex items-center gap-3">
                  <Heart className="w-6 h-6 text-[#20b2aa]" />
                  Les bénéfices de votre soin
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {service.benefits?.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#20b2aa] to-[#48cae4] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[#2c3e50] font-medium">{benefit}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          Résultats visibles et durables pour une peau transformée
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Déroulement */}
            {activeTab === 'process' && service.process && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-playfair text-[#2c3e50] mb-6 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-[#20b2aa]" />
                  Déroulement de votre séance
                </h3>
                <div className="space-y-6">
                  {service.process.map((step, index) => (
                    <div key={index} className="flex gap-6 p-6 rounded-xl bg-gradient-to-r from-gray-50 to-transparent">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-[#20b2aa] text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {step.step || index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-[#2c3e50] mb-2">
                          {step.title}
                        </h4>
                        <p className="text-gray-600 mb-2">{step.description}</p>
                        <p className="text-sm text-[#20b2aa] font-medium">
                          Durée : {step.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Résultats */}
            {activeTab === 'results' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-playfair text-[#2c3e50] mb-6 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-[#20b2aa]" />
                  Résultats attendus
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {results.map((result, index) => (
                    <div key={index} className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg hover:shadow-xl transition-all group">
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-[#20b2aa]/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                      <div className="relative">
                        <div className="text-4xl font-bold text-[#20b2aa] mb-2">{result.percentage}</div>
                        <h4 className="font-semibold text-[#2c3e50] mb-1">{result.timeframe}</h4>
                        <h5 className="text-sm font-medium text-[#20b2aa] mb-2">{result.title}</h5>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {result.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gradient-to-r from-[#20b2aa]/5 to-[#48cae4]/5 rounded-xl p-6">
                  <p className="text-[#2c3e50] text-center">
                    <span className="text-3xl font-bold text-[#20b2aa]">96%</span> de nos clientes 
                    constatent une amélioration significative de la qualité de leur peau après 3 séances
                  </p>
                </div>
              </div>
            )}

            {/* Recommandations */}
            {activeTab === 'recommendations' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-playfair text-[#2c3e50] mb-6 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[#20b2aa]" />
                  Conseils & Recommandations
                </h3>
                
                {service.recommendations && service.recommendations.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-[#2c3e50] mb-4">
                      Pour optimiser les résultats
                    </h4>
                    <div className="grid gap-4">
                      {service.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                          <p className="text-gray-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {service.contraindications && service.contraindications.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-[#2c3e50] mb-4">
                      Contre-indications
                    </h4>
                    <div className="grid gap-4">
                      {service.contraindications.map((contra, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                          <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                          <p className="text-gray-700">{contra}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Technologies utilisées */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-4 text-center">
            Technologies de pointe
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Nous utilisons les équipements les plus avancés pour garantir des résultats exceptionnels
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technologies.map((tech, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4 text-center">{tech.icon}</div>
                <h3 className="font-semibold text-[#2c3e50] mb-2 text-center">{tech.name}</h3>
                <p className="text-sm text-gray-600 text-center">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages améliorés */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-4 text-center">
            L'avis de nos clientes
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Plus de 2500 clientes satisfaites nous font confiance pour sublimer leur beauté
          </p>
          
          {/* Carousel de témoignages */}
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-3xl p-8 shadow-xl max-w-3xl mx-auto">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        ))}
                        {testimonial.verified && (
                          <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Avis vérifié
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                        "{testimonial.comment}"
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-[#2c3e50]">{testimonial.name}</span>
                          <span className="text-gray-500 text-sm ml-2">{testimonial.age}</span>
                          <div className="text-xs text-gray-400 mt-1">
                            {testimonial.sessions} • {testimonial.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeTestimonial === index 
                      ? 'w-8 bg-[#20b2aa]' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#20b2aa]">4.9/5</div>
              <div className="text-sm text-gray-600">Note moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#20b2aa]">2500+</div>
              <div className="text-sm text-gray-600">Clientes satisfaites</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#20b2aa]">98%</div>
              <div className="text-sm text-gray-600">Recommandent</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-12 text-center">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-[#2c3e50]">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-[#20b2aa] transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-[#20b2aa] to-[#48cae4] rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative">
              <Gift className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-playfair mb-4">
                Offre exclusive première visite
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Bénéficiez de -30% sur votre première séance de {service.name}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/reservation"
                  className="bg-white text-[#20b2aa] px-8 py-4 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Réserver maintenant
                </Link>
                <Link 
                  href="tel:+33683717050"
                  className="bg-white/20 backdrop-blur text-white px-8 py-4 rounded-xl font-medium hover:bg-white/30 transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  06 83 71 70 50
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Autres services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-12 text-center">
            Découvrez aussi
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Ici on pourrait ajouter d'autres services depuis la DB */}
            <Link href="/prestations" className="group">
              <div className="bg-white rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition">
                <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">
                  Autres soins signature
                </h3>
                <p className="text-gray-600 mb-4">
                  Découvrez notre gamme complète de soins d'exception
                </p>
                <span className="text-[#20b2aa] font-medium flex items-center gap-2">
                  Explorer
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}