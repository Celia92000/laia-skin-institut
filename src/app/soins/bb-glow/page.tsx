"use client";

import Link from "next/link";
import { Clock, CheckCircle, AlertCircle, Sparkles, Star, Heart, Shield, Calendar, Palette } from "lucide-react";
import { useState } from "react";

export default function BBGlow() {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -left-48 bg-gradient-to-tr from-pink-200/30 to-rose-200/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full mb-6 shadow-xl">
              <Palette className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#2c3e50] mb-6 animate-fade-in-up">
              BB Glow
            </h1>
            <p className="text-xl text-[#2c3e50]/80 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Le maquillage semi-permanent pour un teint parfait et lumineux 24h/24
            </p>
          </div>

          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Clock className="w-8 h-8 text-pink-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Durée</h3>
              <p className="text-[#2c3e50]/70">90-120 minutes</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Tenue</h3>
              <p className="text-[#2c3e50]/70">3-4 mois</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Sensation</h3>
              <p className="text-[#2c3e50]/70">Légers picotements</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Sécurité</h3>
              <p className="text-[#2c3e50]/70">100% Naturel</p>
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
                    ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg"
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
                  Qu'est-ce que le BB Glow ?
                </h2>
                <div className="prose prose-lg max-w-none text-[#2c3e50]/80">
                  <p className="mb-6">
                    Le BB Glow est une technique venue de Corée, l'une des dernières innovations en rajeunissement, 
                    entre le Microneedling et le maquillage semi-permanent. Cette mésothérapie esthétique introduit 
                    des pigments minéraux naturels dans la peau pour un effet "BB crème" semi-permanent.
                  </p>
                  <p className="mb-6">
                    Le sérum utilisé contient des pigments naturels et des actifs anti-âge qui pénètrent 
                    dans les couches superficielles de la peau, unifiant le teint tout en traitant les 
                    imperfections.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-pink-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-3">Composition du sérum</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                          <span>Pigments certifiés Ecocert-Cosmos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                          <span>Vitamine F et D-panthénol</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                          <span>Acide hyaluronique</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                          <span>Alpha-bisabolol apaisant</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-3">Idéal pour</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-rose-500 mt-1 flex-shrink-0" />
                          <span>Teint terne et fatigué</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-rose-500 mt-1 flex-shrink-0" />
                          <span>Taches pigmentaires</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-rose-500 mt-1 flex-shrink-0" />
                          <span>Rougeurs et rosacée légère</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-rose-500 mt-1 flex-shrink-0" />
                          <span>Pores dilatés</span>
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
                      title: "Consultation & Choix de la teinte",
                      duration: "15 min",
                      description: "Analyse de votre carnation et sélection de la teinte parfaite parmi nos 5 nuances."
                    },
                    {
                      step: 2,
                      title: "Préparation de la peau",
                      duration: "20 min",
                      description: "Nettoyage profond, exfoliation douce et désinfection de la zone à traiter."
                    },
                    {
                      step: 3,
                      title: "Application anesthésiante",
                      duration: "15 min",
                      description: "Application d'une crème anesthésiante pour un confort optimal (optionnel)."
                    },
                    {
                      step: 4,
                      title: "Traitement BB Glow",
                      duration: "30 min",
                      description: "Microneedling avec infusion du sérum BB Glow sur l'ensemble du visage."
                    },
                    {
                      step: 5,
                      title: "Masque apaisant",
                      duration: "10 min",
                      description: "Application d'un masque hydratant et apaisant pour calmer la peau."
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-6 items-start">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-xl font-semibold text-[#2c3e50]">{item.title}</h3>
                          <span className="text-sm bg-pink-100 text-pink-600 px-3 py-1 rounded-full">
                            {item.duration}
                          </span>
                        </div>
                        <p className="text-[#2c3e50]/70">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">Teintes disponibles :</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {["Light Rose", "Natural", "Honey", "Sand", "Deep"].map((shade) => (
                      <div key={shade} className="text-center">
                        <div className="w-full h-12 rounded-lg mb-2" style={{
                          background: shade === "Light Rose" ? "#FFF5F5" :
                                    shade === "Natural" ? "#FAEBD7" :
                                    shade === "Honey" ? "#F5DEB3" :
                                    shade === "Sand" ? "#D2B48C" : "#BC8F8F"
                        }}></div>
                        <span className="text-xs text-[#2c3e50]/70">{shade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bienfaits" && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-6">
                  Les bienfaits du BB Glow
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-4">Effets immédiats</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Teint unifié et lumineux instantanément</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Effet "bonne mine" naturel</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Camouflage des imperfections</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Hydratation intense</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-4">Bénéfices durables</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Stimulation du collagène</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Réduction des taches pigmentaires</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Affinement du grain de peau</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Gain de temps au quotidien</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                  <p className="text-center text-[#2c3e50] font-medium">
                    💄 Plus besoin de fond de teint ! Réveillez-vous chaque matin avec une peau parfaite
                  </p>
                </div>
              </div>
            )}

            {activeTab === "contre-indications" && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-6">
                  Contre-indications & Précautions
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">
                        Le BB Glow est contre-indiqué dans les cas suivants :
                      </h3>
                      <ul className="space-y-2 text-[#2c3e50]/80">
                        <li>• Grossesse et allaitement</li>
                        <li>• Acné active sévère</li>
                        <li>• Eczéma ou psoriasis sur le visage</li>
                        <li>• Allergies aux composants du sérum</li>
                        <li>• Herpès actif</li>
                        <li>• Diabète non contrôlé</li>
                        <li>• Troubles de la cicatrisation</li>
                        <li>• Traitement anticoagulant</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">
                    Recommandations post-traitement :
                  </h3>
                  <ul className="space-y-2 text-[#2c3e50]/80">
                    <li>✓ Éviter le maquillage pendant 24h</li>
                    <li>✓ Ne pas toucher le visage les premières heures</li>
                    <li>✓ Éviter l'exposition solaire pendant 72h</li>
                    <li>✓ Pas de sauna, hammam ou piscine pendant 48h</li>
                    <li>✓ Utiliser une protection solaire SPF 50</li>
                    <li>✓ Hydrater la peau matin et soir</li>
                    <li>✓ Ne pas exfolier pendant 1 semaine</li>
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
                    <p className="text-3xl font-bold text-pink-500 mb-4">150€</p>
                    <ul className="space-y-2 text-[#2c3e50]/70">
                      <li>✓ 1 séance complète</li>
                      <li>✓ Consultation couleur</li>
                      <li>✓ Kit de soins post-traitement</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-300 rounded-xl p-6 hover:shadow-xl transition-all relative">
                    <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-400 to-rose-400 text-white px-4 py-1 rounded-full text-sm">
                      Recommandé
                    </span>
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Cure 3 séances</h3>
                    <p className="text-3xl font-bold text-pink-500 mb-4">400€</p>
                    <p className="text-sm text-green-600 mb-3">Économisez 50€</p>
                    <ul className="space-y-2 text-[#2c3e50]/70">
                      <li>✓ 3 séances espacées de 2 semaines</li>
                      <li>✓ Résultat optimal</li>
                      <li>✓ Retouche gratuite si besoin</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 hover:shadow-xl transition-all">
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Entretien Annuel</h3>
                    <p className="text-3xl font-bold text-pink-500 mb-4">500€</p>
                    <p className="text-sm text-green-600 mb-3">4 séances sur l'année</p>
                    <ul className="space-y-2 text-[#2c3e50]/70">
                      <li>✓ 1 séance par trimestre</li>
                      <li>✓ Teint parfait toute l'année</li>
                      <li>✓ -20% sur les soins complémentaires</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <Link 
              href="/reservation?service=bb-glow"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <Calendar className="w-6 h-6" />
              Réserver mon BB Glow
            </Link>
            <p className="mt-4 text-[#2c3e50]/60">
              Ou contactez-moi sur Instagram <a href="https://www.instagram.com/laia.skin/" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">@laia.skin</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}