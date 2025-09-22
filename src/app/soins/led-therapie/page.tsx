"use client";

import Link from "next/link";
import { Clock, CheckCircle, AlertCircle, Sparkles, Star, Heart, Shield, Calendar, Sun } from "lucide-react";
import { useState } from "react";

export default function LEDTherapie() {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -left-48 bg-gradient-to-tr from-amber-200/30 to-yellow-200/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-full mb-6 shadow-xl">
              <Sun className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#2c3e50] mb-6 animate-fade-in-up">
              LED Thérapie
            </h1>
            <p className="text-xl text-[#2c3e50]/80 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Photobiomodulation pour une peau revitalisée et apaisée
            </p>
          </div>

          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Durée</h3>
              <p className="text-[#2c3e50]/70">20-30 minutes</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Sensation</h3>
              <p className="text-[#2c3e50]/70">100% Relaxant</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Sans douleur</h3>
              <p className="text-[#2c3e50]/70">Non invasif</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Sécurité</h3>
              <p className="text-[#2c3e50]/70">Sans UV nocifs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Information Tabs */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { id: "description", label: "Description" },
              { id: "deroulement", label: "Déroulement" },
              { id: "bienfaits", label: "Bienfaits" },
              { id: "contre-indications", label: "Contre-indications" },
              { id: "tarifs", label: "Tarifs" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow-lg"
                    : "bg-white text-[#2c3e50] hover:shadow-md"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {activeTab === "description" && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-6">
                  Mon protocole LED Thérapie
                </h2>
                <div className="prose prose-lg max-w-none text-[#2c3e50]/80">
                  <p className="mb-6">
                    Mon protocole LED Thérapie utilise la technique LED avec des longueurs d'onde spécifiques de lumière pour stimuler 
                    les processus naturels de régénération cellulaire. Cette technologie médicale, 
                    initialement développée par la NASA, est aujourd'hui reconnue pour ses effets 
                    thérapeutiques sur la peau.
                  </p>
                  <p className="mb-6">
                    Chaque couleur de LED a des propriétés spécifiques : le rouge stimule le collagène, 
                    le bleu combat l'acné, le jaune améliore la circulation, et le proche infrarouge 
                    pénètre en profondeur pour une action anti-âge globale.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-red-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-3">LED Rouge (630-660nm)</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                          <span>Stimule le collagène et l'élastine</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                          <span>Réduit les rides et ridules</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                          <span>Améliore la texture de la peau</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-3">LED Bleue (423nm)</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                          <span>Élimine les bactéries de l'acné</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                          <span>Régule la production de sébum</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                          <span>Apaise les inflammations</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-3">LED Jaune (583nm)</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                          <span>Améliore la circulation sanguine</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                          <span>Réduit les rougeurs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                          <span>Apaise les peaux sensibles</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-3">Proche Infrarouge (810-850nm)</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                          <span>Pénétration profonde (5-10mm)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                          <span>Accélère la cicatrisation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                          <span>Effet anti-inflammatoire puissant</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "deroulement" && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-6">
                  Déroulement de la séance
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: "Analyse de peau",
                      duration: "5 min",
                      description: "Évaluation de vos besoins et sélection du programme LED adapté."
                    },
                    {
                      step: 2,
                      title: "Préparation",
                      duration: "5 min",
                      description: "Nettoyage doux et installation confortable."
                    },
                    {
                      step: 3,
                      title: "Protection oculaire",
                      duration: "2 min",
                      description: "Mise en place de lunettes de protection spéciales."
                    },
                    {
                      step: 4,
                      title: "Exposition LED",
                      duration: "20-30 min",
                      description: "Traitement par LED avec ajustement de l'intensité et de la distance."
                    },
                    {
                      step: 5,
                      title: "Finalisation",
                      duration: "3 min",
                      description: "Application d'un sérum hydratant et protection solaire."
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-6 items-start">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-xl font-semibold text-[#2c3e50]">{item.title}</h3>
                          <span className="text-sm bg-amber-100 text-amber-600 px-3 py-1 rounded-full">
                            {item.duration}
                          </span>
                        </div>
                        <p className="text-[#2c3e50]/70">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl">
                  <p className="text-center text-[#2c3e50] font-medium">
                    😌 Profitez d'un moment de relaxation absolue pendant que la lumière agit sur votre peau
                  </p>
                </div>
              </div>
            )}

            {activeTab === "bienfaits" && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-6">
                  Les bienfaits de la LED Thérapie
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-4">Effets immédiats</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Peau plus lumineuse et éclatante</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Sensation de détente profonde</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Apaisement des rougeurs</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Hydratation améliorée</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-4">Bénéfices cumulatifs</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Augmentation de la production de collagène</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Amélioration de l'élasticité cutanée</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Réduction de l'acné et des imperfections</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Cicatrisation accélérée</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <h4 className="font-semibold text-[#2c3e50] mb-2">Idéal en complément</h4>
                    <p className="text-[#2c3e50]/70">
                      La LED Thérapie potentialise les effets de tous mes autres soins (Hydro'Cleaning, Renaissance, BB Glow)
                    </p>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <h4 className="font-semibold text-[#2c3e50] mb-2">100% Sans risque</h4>
                    <p className="text-[#2c3e50]/70">
                      Aucun temps de récupération, vous pouvez reprendre vos activités immédiatement
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contre-indications" && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-6">
                  Contre-indications & Précautions
                </h2>
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">
                        Bonne nouvelle !
                      </h3>
                      <p className="text-[#2c3e50]/80">
                        La LED Thérapie est l'un des soins les plus sûrs avec très peu de contre-indications. 
                        Elle convient à tous les types de peau et peut être pratiquée toute l'année.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">
                    Précautions particulières :
                  </h3>
                  <ul className="space-y-2 text-[#2c3e50]/80">
                    <li>• Épilepsie photosensible (rare)</li>
                    <li>• Prise de médicaments photosensibilisants</li>
                    <li>• Lupus ou autres maladies auto-immunes actives</li>
                    <li>• Grossesse (par précaution, bien que non dangereux)</li>
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">
                    Conseils pour optimiser les résultats :
                  </h3>
                  <ul className="space-y-2 text-[#2c3e50]/80">
                    <li>✓ Arriver démaquillée pour une meilleure pénétration de la lumière</li>
                    <li>✓ Bien s'hydrater avant et après la séance</li>
                    <li>✓ Respecter la fréquence recommandée (2-3 fois/semaine)</li>
                    <li>✓ Combiner avec d'autres soins pour des résultats optimaux</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "tarifs" && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-6">
                  Tarifs & Forfaits
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Séance Unique</h3>
                    <p className="text-3xl font-bold text-amber-500 mb-4">60€</p>
                    <ul className="space-y-2 text-[#2c3e50]/70">
                      <li>✓ 30 minutes de traitement</li>
                      <li>✓ Protocole personnalisé</li>
                      <li>✓ Idéal en complément</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-6 hover:shadow-xl transition-all relative">
                    <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-400 text-white px-4 py-1 rounded-full text-sm">
                      Plus populaire
                    </span>
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Cure 10 séances</h3>
                    <p className="text-3xl font-bold text-amber-500 mb-4">500€</p>
                    <p className="text-sm text-green-600 mb-3">Économisez 100€</p>
                    <ul className="space-y-2 text-[#2c3e50]/70">
                      <li>✓ 10 séances sur 5 semaines</li>
                      <li>✓ Protocole évolutif</li>
                      <li>✓ Résultats durables</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6 hover:shadow-xl transition-all">
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Abonnement Mensuel</h3>
                    <p className="text-3xl font-bold text-amber-500 mb-4">150€/mois</p>
                    <p className="text-sm text-purple-600 mb-3">Illimité</p>
                    <ul className="space-y-2 text-[#2c3e50]/70">
                      <li>✓ Séances illimitées</li>
                      <li>✓ Tous les protocoles</li>
                      <li>✓ -20% sur les autres soins</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">
                    💡 Offre Combinée
                  </h3>
                  <p className="text-[#2c3e50]/80">
                    Ajoutez une séance LED à n'importe quel autre soin pour seulement <span className="font-bold text-green-600">+30€</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <Link 
              href="/reservation?service=led-therapie"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <Calendar className="w-6 h-6" />
              Réserver ma séance LED Thérapie
            </Link>
            <p className="mt-4 text-[#2c3e50]/60">
              Ou contactez-moi sur Instagram <a href="https://www.instagram.com/laia.skin/" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">@laia.skin</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}