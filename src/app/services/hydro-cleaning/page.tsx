import Link from "next/link";
import Image from "next/image";
import { Clock, Star, Check, Droplets, ChevronRight, Calendar, Shield, Sparkles } from "lucide-react";

export default function HydroCleaning() {
  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#e6f7ff] to-[#d0f0ff]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-normal text-[#2c3e50] mb-6">
            Hydro'Cleaning
          </h1>
          <p className="font-inter text-lg md:text-xl text-[#2c3e50]/70 max-w-3xl mx-auto">
            Le nettoyage en profondeur qui révèle l'éclat naturel de votre peau
          </p>
        </div>

        {/* Image et Description */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/images/hydro-cleaning.jpg"
              alt="Soin Hydro'Cleaning"
              className="w-full h-full object-cover object-center"
              style={{ objectPosition: '50% 35%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-transparent to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-playfair text-[#2c3e50] mb-4">Nettoyage professionnel</h2>
              <p className="text-[#2c3e50]/70 mb-4">
                L'Hydro'Cleaning combine aspiration douce et infusion de sérums pour nettoyer, 
                exfolier et hydrater votre peau en profondeur, révélant un teint éclatant.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#00bcd4]" />
                  <span className="text-sm">60 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-[#00bcd4]" />
                  <span className="text-sm">Extraction douce</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#00bcd4]/20 to-[#00acc1]/20 rounded-xl p-6">
              <h3 className="font-semibold text-[#2c3e50] mb-3">Tarifs</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c3e50]/70">Séance unique</span>
                  <div>
                    <span className="text-xl font-bold text-[#00bcd4]">70€</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-[#2c3e50]/70">Forfait 4 séances</span>
                  <div>
                    <span className="text-xl font-bold text-[#00acc1]">240€</span>
                    <span className="text-sm text-[#2c3e50]/60 ml-2">(-40€)</span>
                  </div>
                </div>
              </div>
              <Link
                href="/reservation?service=hydro-cleaning"
                className="w-full bg-gradient-to-r from-[#00bcd4] to-[#00acc1] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
                description: "Extraction en profondeur des impuretés"
              },
              {
                title: "Points noirs",
                description: "Élimination douce et efficace"
              },
              {
                title: "Hydratation",
                description: "Infusion de sérums hydratants"
              },
              {
                title: "Éclat",
                description: "Teint lumineux instantané"
              },
              {
                title: "Texture",
                description: "Peau lisse et douce"
              },
              {
                title: "Sébum",
                description: "Régulation de l'excès de sébum"
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <h3 className="font-semibold text-[#2c3e50] mb-2">{benefit.title}</h3>
                <p className="text-[#2c3e50]/60 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-6">
            Offrez un nouveau souffle à votre peau
          </h2>
          <p className="text-lg text-[#2c3e50]/70 mb-8">
            Découvrez l'Hydro'Cleaning et révélez l'éclat naturel de votre peau
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation?service=hydro-cleaning"
              className="bg-gradient-to-r from-[#00bcd4] to-[#00acc1] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              Réserver Hydro'Cleaning
            </Link>
            <Link
              href="/prestations"
              className="border-2 border-[#00bcd4] text-[#00bcd4] px-8 py-3 rounded-full font-semibold hover:bg-[#00bcd4] hover:text-white transition-all duration-300"
            >
              Voir tous nos soins
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
