import { Heart, Award, Users, Sparkles, Shield, Star, CheckCircle, GraduationCap, Briefcase, Target } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function APropos() {
  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
        {/* Hero Section avec présentation de Laïa */}
        <section className="max-w-6xl mx-auto px-4 mb-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-normal text-[#2c3e50] mb-6 animate-fade-in-up tracking-normal">
              Laïa, Experte Beauté
            </h1>
            <p className="font-playfair text-lg sm:text-xl md:text-2xl text-[#2c3e50]/70 max-w-3xl mx-auto animate-fade-in-up animation-delay-200 tracking-wide leading-relaxed">
              Bienvenue dans mon univers ! Je suis Laïa, et j'ai créé ici plus qu'un institut :
              <br className="hidden md:block" />
              un cocon bienveillant où retrouver confiance et sérénité.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up animation-delay-400">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-light text-[#2c3e50] mb-6 tracking-wide">Mon Parcours</h2>
              <p className="font-playfair text-base md:text-lg text-[#2c3e50]/70 mb-6 leading-relaxed tracking-wide">
                Titulaire d'un CAP et d'un BTS en Esthétique-Cosmétique, mon parcours professionnel 
                s'est enrichi au fil d'expériences variées : du monde commercial à l'univers administratif, 
                jusqu'à la gestion de projets d'envergure. Ces compétences plurielles ont progressivement 
                façonné ma vision : celle d'un institut où l'excellence technique rencontre l'art du soin personnalisé.
              </p>
              <p className="font-playfair text-base md:text-lg text-[#2c3e50]/70 mb-6 leading-relaxed tracking-wide">
                Au cœur de ces expériences professionnelles, une aspiration profonde demeurait : 
                insuffler davantage d'humanité dans ma pratique, créer des instants où la transformation 
                visible s'accompagne d'un regain de confiance intérieure. Cette quête m'a naturellement 
                conduite à perfectionner ma maîtrise des protocoles avancés du visage, renouant ainsi 
                avec l'essence première de ma vocation : sublimer et révéler.
              </p>
              <p className="font-playfair text-base md:text-lg text-[#2c3e50] mb-6 font-medium leading-relaxed tracking-wide">
                Aujourd'hui, mon engagement est simple et sincère : vous accueillir dans un espace 
                où vous vous sentez écoutée, comprise et valorisée. Mon objectif ? Vous aider à 
                retrouver confiance en votre beauté naturelle, avec des résultats visibles et durables.
              </p>
            </div>
            
            <div className="animate-fade-in-up animation-delay-600">
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-3xl p-8 shadow-2xl">
                  <div className="h-full bg-white rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <Image
                      src="/celia-portrait.png"
                      alt="Fondatrice LAIA SKIN Institut"
                      fill
                      className="object-cover rounded-2xl"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-serif mb-2">Fondatrice LAIA SKIN Institut</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          <span>CAP & BTS Esthétique</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>Gestion de projets</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          <span>Experte Beauté</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white shadow-xl">
                  <span className="text-2xl font-serif font-bold">LS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Citation de Laïa */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-xl relative">
            <div className="absolute -top-6 left-8 text-6xl text-[#d4b5a0]/30 font-serif">"</div>
            <p className="font-playfair text-xl md:text-2xl text-[#2c3e50]/80 italic text-center px-8 leading-relaxed tracking-wide">
              Chaque séance est une rencontre unique. J'aime prendre le temps de vraiment vous écouter, 
              comprendre vos besoins et adapter mes soins pour que vous repartiez non seulement avec 
              une peau transformée, mais aussi avec cette étincelle dans le regard qui dit 
              'je me sens bien dans ma peau'.
            </p>
            <div className="absolute -bottom-6 right-8 text-6xl text-[#d4b5a0]/30 font-serif rotate-180">"</div>
            <p className="text-center mt-6 text-[#d4b5a0] font-serif text-xl">— Laïa</p>
          </div>
        </section>

        {/* Mes Valeurs Section */}
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-normal text-[#2c3e50] mb-6 tracking-normal">Mes Valeurs</h2>
              <p className="font-serif text-base md:text-lg text-[#2c3e50]/60 max-w-2xl mx-auto tracking-wide leading-relaxed italic">
                Les principes qui guident chacun de mes gestes et définissent l'expérience LAIA SKIN
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-[#d4b5a0]/30 group-hover:to-[#c9a084]/30 transition-all">
                  <Heart className="text-[#d4b5a0]" size={32} />
                </div>
                <h3 className="text-xl font-serif text-[#2c3e50] mb-4">Bienveillance</h3>
                <p className="text-[#2c3e50]/70">
                  Un accueil chaleureux et sans jugement, où vous vous sentez en sécurité
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-[#d4b5a0]/30 group-hover:to-[#c9a084]/30 transition-all">
                  <Shield className="text-[#d4b5a0]" size={32} />
                </div>
                <h3 className="text-xl font-serif text-[#2c3e50] mb-4">Confiance</h3>
                <p className="text-[#2c3e50]/70">
                  Restaurer votre estime de vous-même et révéler votre beauté unique
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-[#d4b5a0]/30 group-hover:to-[#c9a084]/30 transition-all">
                  <Sparkles className="text-[#d4b5a0]" size={32} />
                </div>
                <h3 className="text-xl font-serif text-[#2c3e50] mb-4">Ressourcement</h3>
                <p className="text-[#2c3e50]/70">
                  Créer un véritable cocon de détente pour vous reconnecter à vous-même
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-[#d4b5a0]/30 group-hover:to-[#c9a084]/30 transition-all">
                  <Users className="text-[#d4b5a0]" size={32} />
                </div>
                <h3 className="text-xl font-serif text-[#2c3e50] mb-4">Respect</h3>
                <p className="text-[#2c3e50]/70">
                  Honorer votre rythme, vos besoins et votre individualité
                </p>
              </div>

              <div className="text-center group lg:col-span-2 lg:col-start-2">
                <div className="w-20 h-20 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-[#d4b5a0]/30 group-hover:to-[#c9a084]/30 transition-all">
                  <Star className="text-[#d4b5a0]" size={32} />
                </div>
                <h3 className="text-xl font-serif text-[#2c3e50] mb-4">Authenticité</h3>
                <p className="text-[#2c3e50]/70">
                  Créer un environnement où vous pouvez être vous-même sans masque
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mon Expertise Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-serif text-[#2c3e50] mb-6">Mon Expertise à votre Service</h2>
                <p className="text-[#2c3e50]/80 mb-8">
                  Forte de mes formations et de mon expérience pluridisciplinaire, j'ai développé une 
                  approche unique qui allie technicité et dimension humaine. Chaque soin est pensé 
                  pour répondre précisément à vos besoins tout en créant un moment de pure détente.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="text-[#d4b5a0]" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-[#2c3e50]">Diagnostic Personnalisé</h3>
                      <p className="text-[#2c3e50]/70 text-sm">
                        Une analyse approfondie de votre peau pour créer un protocole sur-mesure
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="text-[#d4b5a0]" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-[#2c3e50]">Techniques Avancées</h3>
                      <p className="text-[#2c3e50]/70 text-sm">
                        Maîtrise des dernières innovations en soins du visage pour des résultats optimaux
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="text-[#d4b5a0]" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-[#2c3e50]">Suivi Attentif</h3>
                      <p className="text-[#2c3e50]/70 text-sm">
                        Un accompagnement continu pour optimiser et pérenniser les résultats
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <h3 className="text-2xl font-serif text-[#2c3e50] mb-4">Mes Formations</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 rounded-full flex items-center justify-center">
                        <Award className="text-[#d4b5a0]" size={16} />
                      </div>
                      <span className="text-[#2c3e50]/80">CAP Esthétique Cosmétique Parfumerie</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 rounded-full flex items-center justify-center">
                        <Award className="text-[#d4b5a0]" size={16} />
                      </div>
                      <span className="text-[#2c3e50]/80">BTS Esthétique Cosmétique</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 rounded-full flex items-center justify-center">
                        <Award className="text-[#d4b5a0]" size={16} />
                      </div>
                      <span className="text-[#2c3e50]/80">Formation Techniques Avancées du Visage</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 rounded-full flex items-center justify-center">
                        <Award className="text-[#d4b5a0]" size={16} />
                      </div>
                      <span className="text-[#2c3e50]/80">Gestion de Projets & Management</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-serif mb-4">Mon Engagement</h3>
                  <p className="opacity-95 text-sm">
                    Je m'engage à vous offrir bien plus qu'un simple soin : une expérience transformative 
                    où technique et bienveillance se conjuguent pour révéler votre beauté naturelle et 
                    restaurer votre confiance en vous.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Témoignages Section */}
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif text-[#2c3e50] mb-6">Ce que disent mes clientes</h2>
              <p className="text-lg text-[#2c3e50]/70">
                Leur confiance et leur satisfaction sont ma plus belle récompense
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl p-8 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#d4b5a0] fill-current" />
                  ))}
                </div>
                <p className="text-[#2c3e50]/80 italic mb-6 text-lg">
                  "Laïa est une véritable artiste de la beauté. Son écoute, sa douceur et son 
                  professionnalisme font de chaque rendez-vous un moment privilégié. Ma peau n'a 
                  jamais été aussi belle !"
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 rounded-full flex items-center justify-center">
                    <span className="text-[#d4b5a0] font-semibold">SD</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#2c3e50]">Sophie D.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl p-8 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#d4b5a0] fill-current" />
                  ))}
                </div>
                <p className="text-[#2c3e50]/80 italic mb-6 text-lg">
                  "Un institut où l'on se sent unique et précieuse. Laïa prend vraiment le temps de 
                  comprendre nos besoins et adapte ses soins en conséquence. Les résultats sont 
                  spectaculaires !"
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 rounded-full flex items-center justify-center">
                    <span className="text-[#d4b5a0] font-semibold">ML</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#2c3e50]">Marie L.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl font-serif text-[#2c3e50] mb-6">
              Prête à vivre l'expérience LAIA SKIN ?
            </h2>
            <p className="text-xl text-[#2c3e50]/70 mb-10">
              Offrez-vous un moment de transformation et laissez-moi révéler 
              l'éclat naturel de votre peau dans un cadre bienveillant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reservation"
                className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Réserver votre soin
              </Link>
              <Link
                href="/prestations"
                className="bg-white text-[#2c3e50] border-2 border-[#d4b5a0] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#d4b5a0]/10 transition-all duration-300 hover:shadow-xl"
              >
                Découvrir mes soins
              </Link>
            </div>
          </div>
        </section>
      </main>
  );
}