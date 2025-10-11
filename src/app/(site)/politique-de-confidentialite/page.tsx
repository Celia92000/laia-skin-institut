import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | Laia Skin Institut',
  description: 'Politique de confidentialité et protection des données personnelles de Laia Skin Institut'
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Politique de Confidentialité
        </h1>

        <div className="prose prose-rose max-w-none">
          <p className="text-gray-600 mb-6">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Laia Skin Institut s'engage à protéger la vie privée de ses clients. Cette politique de confidentialité
              explique comment nous collectons, utilisons et protégeons vos données personnelles conformément au
              Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Données collectées</h2>
            <p className="text-gray-700 mb-4">Nous collectons les informations suivantes :</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Nom, prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Date de naissance</li>
              <li>Historique des rendez-vous et soins</li>
              <li>Données de paiement (traitées de manière sécurisée)</li>
              <li>Photos avant/après (avec votre consentement explicite)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Utilisation des données</h2>
            <p className="text-gray-700 mb-4">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Gérer vos rendez-vous et réservations</li>
              <li>Vous envoyer des confirmations et rappels</li>
              <li>Traiter vos paiements</li>
              <li>Vous informer de nos actualités et promotions (avec votre consentement)</li>
              <li>Améliorer nos services</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Partage des données</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous ne vendons jamais vos données personnelles. Vos informations peuvent être partagées uniquement avec :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
              <li>Nos prestataires de paiement sécurisés</li>
              <li>Nos services de communication (email, WhatsApp) pour les notifications</li>
              <li>Les autorités compétentes si la loi l'exige</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Conservation des données</h2>
            <p className="text-gray-700 leading-relaxed">
              Vos données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles
              elles ont été collectées, et conformément aux obligations légales (généralement 3 ans après votre
              dernière interaction avec nous).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Vos droits</h2>
            <p className="text-gray-700 mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Droit d'accès :</strong> Consulter vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
              <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
              <li><strong>Droit de limitation :</strong> Limiter le traitement de vos données</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Pour exercer ces droits, contactez-nous à : <strong>contact@laiaskininstitut.fr</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Sécurité</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos
              données contre tout accès non autorisé, modification, divulgation ou destruction. Toutes les
              données sensibles sont cryptées et stockées sur des serveurs sécurisés.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Notre site utilise des cookies pour améliorer votre expérience utilisateur. Vous pouvez gérer vos
              préférences de cookies dans les paramètres de votre navigateur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modifications</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les
              modifications seront publiées sur cette page avec la date de dernière mise à jour.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact</h2>
            <p className="text-gray-700">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles,
              vous pouvez nous contacter :
            </p>
            <div className="mt-4 p-4 bg-rose-50 rounded-lg">
              <p className="text-gray-700"><strong>Laia Skin Institut</strong></p>
              <p className="text-gray-700">Email : contact@laiaskininstitut.fr</p>
              <p className="text-gray-700">Téléphone : +33 6 83 71 70 50</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
