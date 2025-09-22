"use client";

import Link from "next/link";
import { Clock, CheckCircle, AlertCircle, Sparkles, Star, Heart, Shield, Calendar } from "lucide-react";
import { useState } from "react";

export default function HydroCleaning() {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -left-48 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mb-6 shadow-xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#2c3e50] mb-6 animate-fade-in-up">
              Hydro'Cleaning
            </h1>
            <p className="text-xl text-[#2c3e50]/80 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Mon protocole signature pour une peau profondément nettoyée et éclatante
            </p>
          </div>

          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Durée</h3>
              <p className="text-[#2c3e50]/70">30-45 minutes</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Résultats</h3>
              <p className="text-[#2c3e50]/70">Immédiats</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Sans douleur</h3>
              <p className="text-[#2c3e50]/70">100% Confort</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Sécurité</h3>
              <p className="text-[#2c3e50]/70">Certifié FDA</p>
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
                    ? "bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-lg"
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
                  Qu'est-ce que l'Hydro'Cleaning ?
                </h2>
                <div className="prose prose-lg max-w-none text-[#2c3e50]/80">
                  <p className="mb-6">
                    L'Hydro'Cleaning est mon protocole signature inspiré de la technologie HydroFacial. 
                    Il combine hydradermabrasion, extraction douce et infusion de sérums actifs pour 
                    nettoyer, exfolier et hydrater votre peau en profondeur.
                  </p>
                  <p className="mb-6">
                    Le protocole HydroPeel® en 3 étapes permet de : Nettoyer + Exfolier, Extraire + Hydrater, 
                    et Unifier + Protéger. La technologie Vortex utilise un système d'aspiration puissant 
                    mais indolore, particulièrement efficace sur la zone T (front, nez, menton).
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-3">Technologie avancée</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                          <span>Système Vortex-Fusion® breveté</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                          <span>Sérums à base d'acide lactique et extraits d'algues</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                          <span>Extraction douce sans douleur</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-cyan-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-3">Pour qui ?</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-cyan-500 mt-1 flex-shrink-0" />
                          <span>Tous types de peau</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-cyan-500 mt-1 flex-shrink-0" />
                          <span>Hommes et femmes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-cyan-500 mt-1 flex-shrink-0" />
                          <span>Convient même aux peaux bronzées</span>
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
                      title: "Nettoyage initial",
                      duration: "5 min",
                      description: "Nettoyage avec produit à base d'acide lactique et extraits d'algues pour éliminer les impuretés superficielles."
                    },
                    {
                      step: 2,
                      title: "Hydradermabrasion",
                      duration: "10 min",
                      description: "Exfoliation douce pour éliminer les cellules mortes et préparer la peau."
                    },
                    {
                      step: 3,
                      title: "Extraction",
                      duration: "10 min",
                      description: "Extraction indolore des impuretés et points noirs grâce à l'aspiration Vortex."
                    },
                    {
                      step: 4,
                      title: "Hydratation & Protection",
                      duration: "10 min",
                      description: "Infusion de sérums contenant antioxydants, peptides et acide hyaluronique pour régénérer la peau."
                    },
                    {
                      step: 5,
                      title: "LED Photothérapie",
                      duration: "10 min",
                      description: "Séance de LED pour resserrer les pores et prévenir les irritations."
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-6 items-start">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-xl font-semibold text-[#2c3e50]">{item.title}</h3>
                          <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
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
                  Les bienfaits de l'HydroFacial
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-4">Résultats immédiats</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Peau visiblement plus lumineuse</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Texture affinée et lisse</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Hydratation intense</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Teint unifié</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-4">Bénéfices long terme</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Réduction des rides et ridules</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Amélioration de l'élasticité</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Diminution des taches pigmentaires</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-[#2c3e50]/80">Régulation du sébum</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <p className="text-center text-[#2c3e50] font-medium">
                    💡 Pour des résultats optimaux, nous recommandons une cure de 6 séances espacées de 2 à 4 semaines
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
                        Ce soin n'est pas recommandé dans les cas suivants :
                      </h3>
                      <ul className="space-y-2 text-[#2c3e50]/80">
                        <li>• Grossesse et allaitement</li>
                        <li>• Allergie connue à l'aspirine ou aux algues</li>
                        <li>• Allergie aux fruits de mer (présence dans certains sérums)</li>
                        <li>• Traitement fort anti-acné (isotrétinoïne)</li>
                        <li>• Implants électriques ou métalliques</li>
                        <li>• Acné sévère</li>
                        <li>• Plaies ouvertes et inflammations faciales</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">
                    Précautions à prendre :
                  </h3>
                  <ul className="space-y-2 text-[#2c3e50]/80">
                    <li>✓ Informez-nous de tous vos traitements médicaux en cours</li>
                    <li>✓ Évitez l'exposition solaire 48h avant et après le soin</li>
                    <li>✓ Ne pas utiliser de produits exfoliants 3 jours avant</li>
                    <li>✓ Hydratez bien votre peau après le soin</li>
                    <li>✓ Utilisez une protection solaire SPF 30 minimum</li>
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
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Séance Signature</h3>
                    <p className="text-3xl font-bold text-blue-500 mb-4">180€</p>
                    <ul className="space-y-2 text-[#2c3e50]/70">
                      <li>✓ Protocole HydroFacial complet</li>
                      <li>✓ LED Photothérapie incluse</li>
                      <li>✓ Durée 45 minutes</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6 hover:shadow-xl transition-all relative">
                    <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-4 py-1 rounded-full text-sm">
                      Plus populaire
                    </span>
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Séance avec Booster</h3>
                    <p className="text-3xl font-bold text-blue-500 mb-4">240€</p>
                    <p className="text-sm text-green-600 mb-3">Sérum spécifique inclus</p>
                    <ul className="space-y-2 text-[#2c3e50]/70">
                      <li>✓ Protocole complet + Booster ciblé</li>
                      <li>✓ LED Photothérapie incluse</li>
                      <li>✓ Résultats améliorés</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 hover:shadow-xl transition-all">
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Forfait Entretien</h3>
                    <p className="text-3xl font-bold text-blue-500 mb-4">150€</p>
                    <p className="text-sm text-green-600 mb-3">Prix régulier</p>
                    <ul className="space-y-2 text-[#2c3e50]/70">
                      <li>✓ Séances mensuelles recommandées</li>
                      <li>✓ Maintien des résultats</li>
                      <li>✓ Peau toujours éclatante</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <Link 
              href="/reservation?service=hydrocleaning"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <Calendar className="w-6 h-6" />
              Réserver mon Hydro'Cleaning
            </Link>
            <p className="mt-4 text-[#2c3e50]/60">
              Ou contactez-moi sur Instagram <a href="https://www.instagram.com/laia.skin/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">@laia.skin</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}