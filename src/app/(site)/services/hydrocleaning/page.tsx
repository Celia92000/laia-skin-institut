import Link from "next/link";
import { Clock, Star, Check, Droplets, ChevronRight, Calendar } from "lucide-react";

export default function Hydrocleaning() {
  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-normal text-[#2c3e50] mb-6">
            Hydro'Cleaning
          </h1>
          <p className="font-inter text-lg md:text-xl text-[#2c3e50]/70 max-w-3xl mx-auto">
            Le nettoyage profond qui purifie et révèle l'éclat naturel de votre peau
          </p>
        </div>

        {/* Image et Description */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/images/hydro-cleaning.jpg"
              alt="Soin Hydro'Cleaning"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-transparent to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-playfair text-[#2c3e50] mb-4">Un nettoyage en profondeur</h2>
              <p className="text-[#2c3e50]/70 mb-4">
                L'Hydro'Cleaning est le soin idéal pour purifier votre peau en profondeur. 
                Il combine extraction douce et hydratation pour un teint net et lumineux.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#7fb3c8]" />
                  <span className="text-sm">60 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-[#7fb3c8]" />
                  <span className="text-sm">Soin détox</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#7fb3c8]/20 to-[#a5d0e0]/20 rounded-xl p-6">
              <h3 className="font-semibold text-[#2c3e50] mb-3">Tarifs</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c3e50]/70">Séance unique</span>
                  <div>
                    <span className="text-xl font-bold text-[#7fb3c8]">70€</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-[#2c3e50]/70">Forfait 4 séances</span>
                  <div>
                    <span className="text-xl font-bold text-[#6ba0b5]">260€</span>
                    <span className="text-sm text-[#2c3e50]/60 ml-2">(-20€)</span>
                  </div>
                </div>
              </div>
              <Link
                href="/reservation?service=hydrocleaning"
                className="w-full bg-gradient-to-r from-[#7fb3c8] to-[#a5d0e0] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Réserver maintenant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Les bienfaits de l'Hydro'Cleaning
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Pores purifiés",
                description: "Extraction douce des impuretés",
                icon: "🫧"
              },
              {
                title: "Peau hydratée",
                description: "Hydratation en profondeur",
                icon: "💧"
              },
              {
                title: "Teint éclatant",
                description: "Luminosité retrouvée",
                icon: "✨"
              },
              {
                title: "Points noirs",
                description: "Élimination efficace",
                icon: "🎯"
              },
              {
                title: "Texture affinée",
                description: "Peau plus lisse et douce",
                icon: "🌸"
              },
              {
                title: "Sans irritation",
                description: "Technique douce et respectueuse",
                icon: "🍃"
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="font-semibold text-[#2c3e50] mb-2">{benefit.title}</h3>
                <p className="text-[#2c3e50]/60 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Processus */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Les étapes du soin
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Démaquillage",
                description: "Nettoyage doux de la peau"
              },
              {
                step: "2",
                title: "Exfoliation",
                description: "Peeling enzymatique pour éliminer les cellules mortes"
              },
              {
                step: "3",
                title: "Extraction",
                description: "Aspiration douce des impuretés"
              },
              {
                step: "4",
                title: "Infusion",
                description: "Application de sérums hydratants"
              },
              {
                step: "5",
                title: "LED Thérapie",
                description: "Séance de LED pour apaiser"
              },
              {
                step: "6",
                title: "Masque",
                description: "Masque hydratant adapté"
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#7fb3c8] to-[#a5d0e0] rounded-full flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2c3e50] mb-1">{step.title}</h3>
                  <p className="text-[#2c3e50]/70">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommandations */}
      <section className="bg-gradient-to-r from-[#7fb3c8]/10 to-[#a5d0e0]/10 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Conseils et recommandations
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Avant le soin
              </h3>
              <ul className="space-y-2 text-[#2c3e50]/70">
                <li>• Venir démaquillée ou avec un maquillage léger</li>
                <li>• Éviter l'exposition solaire 48h avant</li>
                <li>• Bien hydrater sa peau les jours précédents</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#2c3e50] mb-4">Contre-indications</h3>
              <ul className="space-y-2 text-[#2c3e50]/70">
                <li>• Rosacée sévère</li>
                <li>• Lésions cutanées actives</li>
                <li>• Coup de soleil récent</li>
                <li>• Traitement Roaccutane en cours</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-6">
            Offrez à votre peau un nouveau départ
          </h2>
          <p className="text-lg text-[#2c3e50]/70 mb-8">
            Découvrez l'Hydro'Cleaning et retrouvez une peau purifiée et éclatante
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation?service=hydrocleaning"
              className="bg-gradient-to-r from-[#7fb3c8] to-[#a5d0e0] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              Réserver mon Hydro'Cleaning
            </Link>
            <Link
              href="/prestations"
              className="border-2 border-[#7fb3c8] text-[#7fb3c8] px-8 py-3 rounded-full font-semibold hover:bg-[#7fb3c8] hover:text-white transition-all duration-300"
            >
              Voir tous nos soins
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}