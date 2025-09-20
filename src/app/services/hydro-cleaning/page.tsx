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
            Le nettoyage en profondeur qui r�v�le l'�clat naturel de votre peau
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
                L'Hydro'Cleaning combine aspiration douce et infusion de s�rums pour nettoyer, 
                exfolier et hydrater votre peau en profondeur, r�v�lant un teint �clatant.
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
                  <span className="text-[#2c3e50]/70">S�ance unique</span>
                  <div>
                    <span className="text-xl font-bold text-[#00bcd4]">70�</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-[#2c3e50]/70">Forfait 4 s�ances</span>
                  <div>
                    <span className="text-xl font-bold text-[#00acc1]">240�</span>
                    <span className="text-sm text-[#2c3e50]/60 ml-2">(-40�)</span>
                  </div>
                </div>
              </div>
              <Link
                href="/reservation?service=hydro-cleaning"
                className="w-full bg-gradient-to-r from-[#00bcd4] to-[#00acc1] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                R�server maintenant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* B�n�fices */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Les bienfaits de l'Hydro'Cleaning
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Pores purifi�s",
                description: "Extraction en profondeur des impuret�s",
                icon: "="
              },
              {
                title: "Points noirs",
                description: "�limination douce et efficace",
                icon: "�"
              },
              {
                title: "Hydratation",
                description: "Infusion de s�rums hydratants",
                icon: "=�"
              },
              {
                title: "�clat",
                description: "Teint lumineux instantan�",
                icon: "("
              },
              {
                title: "Texture",
                description: "Peau lisse et douce",
                icon: "<8"
              },
              {
                title: "S�bum",
                description: "R�gulation de l'exc�s de s�bum",
                icon: "�"
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
            D�roulement du soin Hydro'Cleaning
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "D�maquillage et nettoyage",
                description: "Pr�paration de la peau avec un nettoyage doux",
                duration: "5 min"
              },
              {
                step: "2",
                title: "Exfoliation enzymatique",
                description: "Application d'un peeling doux pour �liminer les cellules mortes",
                duration: "10 min"
              },
              {
                step: "3",
                title: "Extraction par aspiration",
                description: "Nettoyage des pores en profondeur avec aspiration contr�l�e",
                duration: "15 min"
              },
              {
                step: "4",
                title: "Infusion de s�rums",
                description: "Application de s�rums hydratants et nourrissants adapt�s",
                duration: "15 min"
              },
              {
                step: "5",
                title: "LED th�rapie",
                description: "S�ance de LED pour apaiser et r�g�n�rer",
                duration: "10 min"
              },
              {
                step: "6",
                title: "Masque hydratant",
                description: "Application d'un masque adapt� � votre type de peau",
                duration: "10 min"
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#00bcd4] to-[#00acc1] rounded-full flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2c3e50] mb-1">{step.title}</h3>
                  <p className="text-[#2c3e50]/70 text-sm mb-2">{step.description}</p>
                  <p className="text-xs text-[#00bcd4] font-medium">� {step.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types de peau */}
      <section className="bg-gradient-to-r from-[#00bcd4]/10 to-[#00acc1]/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Adapt� � tous les types de peau
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                type: "Peau grasse",
                benefits: ["R�gule le s�bum", "Resserre les pores", "Matifie"],
                icon: "=�"
              },
              {
                type: "Peau s�che",
                benefits: ["Hydrate intens�ment", "Nourrit", "Apaise"],
                icon: "<�"
              },
              {
                type: "Peau mixte",
                benefits: ["�quilibre", "Purifie la zone T", "Hydrate"],
                icon: "�"
              },
              {
                type: "Peau sensible",
                benefits: ["Nettoie en douceur", "Calme", "Renforce"],
                icon: "<9"
              }
            ].map((skin, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-3xl mb-3 text-center">{skin.icon}</div>
                <h3 className="font-semibold text-[#2c3e50] mb-3 text-center">{skin.type}</h3>
                <ul className="space-y-1">
                  {skin.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-[#2c3e50]/70">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* R�sultats */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            R�sultats visibles
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Imm�diatement",
                results: ["Peau propre et fra�che", "Pores resserr�s", "Teint �clatant"]
              },
              {
                title: "Apr�s 24h",
                results: ["Texture lisse", "Hydratation optimale", "Confort durable"]
              },
              {
                title: "Apr�s 1 semaine",
                results: ["Moins d'imperfections", "Grain de peau affin�", "�clat maintenu"]
              }
            ].map((result, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00bcd4] to-[#00acc1] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-[#2c3e50] mb-3">{result.title}</h3>
                <ul className="space-y-2">
                  {result.results.map((item, idx) => (
                    <li key={idx} className="text-[#2c3e50]/70 text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Informations importantes */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Informations importantes
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Recommandations
              </h3>
              <ul className="space-y-2 text-[#2c3e50]/70">
                <li>" Venir d�maquill�e ou avec un maquillage l�ger</li>
                <li>" �viter l'exposition solaire 48h avant</li>
                <li>" Bien hydrater sa peau les jours pr�c�dents</li>
                <li>" Pr�voir 1h15 pour le soin complet</li>
                <li>" Une s�ance par mois en entretien</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Contre-indications
              </h3>
              <ul className="space-y-2 text-[#2c3e50]/70">
                <li>" Rosac�e s�v�re</li>
                <li>" L�sions cutan�es actives</li>
                <li>" Coup de soleil r�cent</li>
                <li>" Traitement Roaccutane en cours</li>
                <li>" Infections cutan�es</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-6">
            Offrez un nouveau souffle � votre peau
          </h2>
          <p className="text-lg text-[#2c3e50]/70 mb-8">
            D�couvrez l'Hydro'Cleaning et r�v�lez l'�clat naturel de votre peau
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation?service=hydro-cleaning"
              className="bg-gradient-to-r from-[#00bcd4] to-[#00acc1] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              R�server Hydro'Cleaning
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