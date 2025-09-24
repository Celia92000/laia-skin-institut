"use client";

import Link from "next/link";
import { Clock, CheckCircle, AlertCircle, Sparkles, Star, Heart, Shield, Calendar, Zap } from "lucide-react";
import { useState } from "react";

export default function Renaissance() {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -left-48 bg-gradient-to-tr from-purple-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full mb-6 shadow-xl">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#2c3e50] mb-6 animate-fade-in-up">
              Renaissance
            </h1>
            <p className="text-xl text-[#2c3e50]/80 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Microneedling de dernière génération pour une peau régénérée et rajeunie
            </p>
          </div>

          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Durée</h3>
              <p className="text-[#2c3e50]/70">60-90 minutes</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Résultats</h3>
              <p className="text-[#2c3e50]/70">Progressifs</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Récupération</h3>
              <p className="text-[#2c3e50]/70">24-48h</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Efficacité</h3>
              <p className="text-[#2c3e50]/70">Prouvée cliniquement</p>
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
                    ? "bg-gradient-to-r from-purple-400 to-indigo-400 text-white shadow-lg"
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
                  Le Microneedling Renaissance
                </h2>
                <div className="prose prose-lg max-w-none text-[#2c3e50]/80">
                  <p className="mb-6">
                    Le microneedling utilise le Dermapen 4, un stylo électrique équipé de 12 à 36 micro-aiguilles 
                    stériles à usage unique. Il crée jusqu'à 1920 micro-canaux par seconde pour stimuler 
                    naturellement la production de collagène et d'élastine.
                  </p>
                  <p className="mb-6">
                    Combiné avec l'application de sérums actifs spécifiques, le Renaissance permet une 
                    régénération cellulaire profonde, traitant efficacement les signes de l'âge, les 
                    cicatrices et les imperfections cutanées.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-purple-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-3">Zones traitables</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                          <span>Visage complet</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                          <span>Cou et décolleté</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                          <span>Contour des yeux</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                          <span>Mains</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-3">Indications</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                          <span>Rides et ridules</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                          <span>Cicatrices d'acné</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                          <span>Pores dilatés</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                          <span>Vergetures</span>
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
                      title: "Consultation préalable",
                      duration: "10 min",
                      description: "Évaluation de votre peau et définition du protocole personnalisé."
                    },
                    {
                      step: 2,
                      title: "Préparation",
                      duration: "15 min",
                      description: "Nettoyage profond et application d'une crème anesthésiante."
                    },
                    {
                      step: 3,
                      title: "Temps de pause",
                      duration: "20 min",
                      description: "Action de l'anesthésiant pour un confort optimal."
                    },
                    {
                      step: 4,
                      title: "Traitement Microneedling",
                      duration: "20 min",
                      description: "Passages précis avec ajustement de la profondeur selon les zones."
                    },
                    {
                      step: 5,
                      title: "Sérums actifs",
                      duration: "5 min",
                      description: "Application de sérums régénérants (facteurs de croissance, peptides)."
                    },
                    {
                      step: 6,
                      title: "Soins post-traitement",
                      duration: "5 min",
                      description: "Masque apaisant et protection solaire."
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-6 items-start">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-xl font-semibold text-[#2c3e50]">{item.title}</h3>
                          <span className="text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
                            {item.duration}
                          </span>
                        </div>
                        <p className="text-[#2c3e50]/70">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "bienfaits" && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-6">
                  Les bienfaits du Renaissance
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-4">Court terme (1-2 semaines)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Peau repulpée et hydratée</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Éclat naturel retrouvé</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Texture affinée</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-4">Long terme (3-6 mois)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Réduction visible des rides</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Amélioration des cicatrices</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Fermeté accrue</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Rajeunissement global</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                  <p className="text-center text-[#2c3e50] font-medium">
                    🔬 Stimulation naturelle du collagène jusqu'à 400% après 6 mois
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
                        Contre-indications absolues :
                      </h3>
                      <ul className="space-y-2 text-[#2c3e50]/80">
                        <li>• Grossesse et allaitement</li>
                        <li>• Infections cutanées actives</li>
                        <li>• Troubles de la coagulation</li>
                        <li>• Diabète non équilibré</li>
                        <li>• Chéloïdes ou cicatrices hypertrophiques</li>
                        <li>• Traitement immunosuppresseur</li>
                        <li>• Cancer en cours de traitement</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">
                    Soins post-traitement essentiels :
                  </h3>
                  <ul className="space-y-2 text-[#2c3e50]/80">
                    <li>✓ Éviter le soleil pendant 1 semaine</li>
                    <li>✓ Protection SPF 50+ obligatoire</li>
                    <li>✓ Hydratation intensive matin et soir</li>
                    <li>✓ Pas de maquillage pendant 24h</li>
                    <li>✓ Éviter sport intense pendant 48h</li>
                    <li>✓ Ne pas gratter les petites croûtes</li>
                    <li>✓ Utiliser uniquement les produits recommandés</li>
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
                    <p className="text-3xl font-bold text-purple-500 mb-4">150€</p>
                    <ul className="space-y-2 text-[#2c3e50]/70">
                      <li>✓ Visage complet</li>
                      <li>✓ Sérum régénérant inclus</li>
                      <li>✓ Masque apaisant</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-6 hover:shadow-xl transition-all relative">
                    <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-indigo-400 text-white px-4 py-1 rounded-full text-sm">
                      Meilleur choix
                    </span>
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Cure 4 séances</h3>
                    <p className="text-3xl font-bold text-purple-500 mb-4">550€</p>
                    <p className="text-sm text-green-600 mb-3">Économisez 50€</p>
                    <ul className="space-y-2 text-[#2c3e50]/70">
                      <li>✓ 4 séances espacées de 3-4 semaines</li>
                      <li>✓ Protocole complet anti-âge</li>
                      <li>✓ Kit de soins maison offert</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 hover:shadow-xl transition-all">
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Programme Premium</h3>
                    <p className="text-3xl font-bold text-purple-500 mb-4">1200€</p>
                    <p className="text-sm text-green-600 mb-3">6 séances + zones bonus</p>
                    <ul className="space-y-2 text-[#2c3e50]/70">
                      <li>✓ Visage + cou + décolleté</li>
                      <li>✓ Sérums premium personnalisés</li>
                      <li>✓ Suivi photographique</li>
                      <li>✓ 1 séance LED offerte</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <Link 
              href="/reservation?service=renaissance"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-400 to-indigo-400 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <Calendar className="w-6 h-6" />
              Réserver mon soin Renaissance
            </Link>
            <p className="mt-4 text-[#2c3e50]/60">
              Ou contactez-moi sur Instagram <a href="https://www.instagram.com/laia.skin/" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">@laia.skin</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}