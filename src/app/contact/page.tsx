import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - LAIA SKIN Institut de Beauté | Paris",
  description: "Contactez LAIA SKIN Institut pour réserver vos soins esthétiques. Téléphone, email, adresse à Paris. Réponse rapide garantie.",
  keywords: "contact institut beauté Paris, LAIA SKIN contact, réservation soins esthétiques",
  openGraph: {
    title: "Contact - LAIA SKIN Institut",
    description: "Prenez contact avec notre institut de beauté à Paris",
  },
};
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Send } from "lucide-react";

export default function Contact() {
  return (
    <main className="pt-32 sm:pt-36 pb-12 sm:pb-20 min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-serif text-center mb-8 sm:mb-12 text-primary">
            Contactez-nous
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-serif mb-6">Informations de contact</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Localisation</h3>
                    <p className="text-muted">
                      À 6 minutes de la gare<br />
                      de Nanterre Université
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Instagram className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Instagram</h3>
                    <a href="https://www.instagram.com/laia.skin/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors">@laia.skin</a>
                    <p className="text-sm text-muted">Réponse rapide par DM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted">contact@laia-skin.fr</p>
                    <p className="text-sm text-muted">Réponse sous 24h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Horaires d'ouverture</h3>
                    <div className="text-muted space-y-1">
                      <p>Lundi - Vendredi : 10h00 - 19h00</p>
                      <p>Samedi : 10h00 - 17h00</p>
                      <p>Dimanche : Fermé</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Suivez-nous</h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                  >
                    <Instagram size={20} />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-serif mb-6">Envoyez-nous un message</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
                  <input
                    type="tel"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sujet</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none">
                    <option value="">Choisissez un sujet</option>
                    <option value="info">Demande d'information</option>
                    <option value="rdv">Prise de rendez-vous</option>
                    <option value="annulation">Annulation/Modification</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    placeholder="Votre message..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
                >
                  <Send className="mr-2" size={20} />
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-serif mb-6">Nous trouver</h2>
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex flex-col items-center justify-center">
                <MapPin className="text-primary mb-4" size={48} />
                <h3 className="text-xl font-semibold text-primary mb-2">Institut LAIA SKIN</h3>
                <p className="text-center text-muted">
                  À 6 minutes de la gare<br />
                  de Nanterre Université
                </p>
                <p className="text-sm text-muted mt-4">
                  RER A : Nanterre Université<br />
                  Accès facile depuis Paris et La Défense
                </p>
                <div className="flex space-x-4 mt-6">
                  <a
                    href="https://maps.google.com/?q=Nanterre+Université+RER+Station"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                  >
                    Voir sur Google Maps
                  </a>
                  <a
                    href="https://waze.com/ul?q=Nanterre+Université+RER+Station"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-sm"
                  >
                    Ouvrir dans Waze
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}