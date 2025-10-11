import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions d'Utilisation | Laia Skin Institut",
  description: "Conditions générales d'utilisation du site et des services de Laia Skin Institut"
};

export default function ConditionsUtilisationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Conditions Générales d'Utilisation
        </h1>

        <div className="prose prose-rose max-w-none">
          <p className="text-gray-600 mb-6">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Objet</h2>
            <p className="text-gray-700 leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du site internet
              laiaskininstitut.fr et de tous les services proposés par Laia Skin Institut. En accédant à ce site
              et en utilisant nos services, vous acceptez sans réserve les présentes CGU.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Mentions légales</h2>
            <div className="p-4 bg-rose-50 rounded-lg">
              <p className="text-gray-700"><strong>Raison sociale :</strong> Laia Skin Institut</p>
              <p className="text-gray-700"><strong>Activité :</strong> Institut de beauté et soins esthétiques</p>
              <p className="text-gray-700"><strong>Email :</strong> contact@laiaskininstitut.fr</p>
              <p className="text-gray-700"><strong>Téléphone :</strong> +33 6 83 71 70 50</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Accès au site</h2>
            <p className="text-gray-700 leading-relaxed">
              Le site laiaskininstitut.fr est accessible gratuitement à tout utilisateur disposant d'un accès
              à internet. Tous les frais nécessaires pour accéder au service (matériel informatique, connexion
              internet, etc.) sont à la charge de l'utilisateur.
            </p>
            <p className="text-gray-700 mt-4 leading-relaxed">
              Laia Skin Institut se réserve le droit de modifier, suspendre ou interrompre l'accès au site
              à tout moment sans préavis.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Création de compte</h2>
            <p className="text-gray-700 mb-4">
              Pour accéder à certains services (prise de rendez-vous, espace client), vous devez créer un compte.
              Lors de l'inscription, vous vous engagez à :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Fournir des informations exactes et à jour</li>
              <li>Maintenir la confidentialité de vos identifiants</li>
              <li>Ne pas créer plusieurs comptes</li>
              <li>Être majeur ou disposer de l'autorisation parentale</li>
              <li>Ne pas usurper l'identité d'un tiers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Réservations et rendez-vous</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Prise de rendez-vous</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les réservations peuvent être effectuées en ligne via notre site, par téléphone ou par WhatsApp.
              Une confirmation vous sera envoyée par email et/ou SMS.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Annulation</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Les annulations doivent être effectuées au moins 24 heures avant le rendez-vous</li>
              <li>Toute annulation tardive ou absence non justifiée pourra entraîner des frais</li>
              <li>Laia Skin Institut se réserve le droit d'annuler un rendez-vous en cas de force majeure</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">5.3 Modification</h3>
            <p className="text-gray-700 leading-relaxed">
              Vous pouvez modifier votre rendez-vous jusqu'à 24 heures avant la date prévue via votre espace
              client ou en nous contactant directement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Paiement</h2>
            <p className="text-gray-700 mb-4">
              Les modalités de paiement acceptées sont :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Carte bancaire (en ligne via paiement sécurisé)</li>
              <li>Espèces (sur place)</li>
              <li>Chèque (sur place)</li>
              <li>Virement bancaire</li>
            </ul>
            <p className="text-gray-700 mt-4 leading-relaxed">
              Tous les paiements en ligne sont sécurisés et cryptés. Aucune donnée bancaire n'est conservée
              sur nos serveurs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Programme de fidélité</h2>
            <p className="text-gray-700 leading-relaxed">
              En tant que client, vous bénéficiez automatiquement de notre programme de fidélité. Les points
              de fidélité sont cumulés à chaque prestation et peuvent être utilisés pour bénéficier de
              réductions sur vos futurs rendez-vous.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Propriété intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed">
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes) est la propriété
              exclusive de Laia Skin Institut et est protégé par les lois sur la propriété intellectuelle.
              Toute reproduction, représentation ou utilisation sans autorisation est interdite.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Responsabilité</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Prestations</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nos prestations sont réalisées par des professionnels qualifiés. Toutefois, les résultats peuvent
              varier selon les personnes. Nous ne pouvons garantir un résultat spécifique.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 Site internet</h3>
            <p className="text-gray-700 leading-relaxed">
              Nous nous efforçons de maintenir le site accessible et à jour. Toutefois, nous ne pouvons être
              tenus responsables en cas d'interruption de service, d'erreur ou d'omission dans les informations
              fournies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Données personnelles</h2>
            <p className="text-gray-700 leading-relaxed">
              Vos données personnelles sont traitées conformément à notre{' '}
              <a href="/politique-de-confidentialite" className="text-rose-600 hover:text-rose-700 underline">
                Politique de Confidentialité
              </a>
              {' '}et au RGPD. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Notre site utilise des cookies pour améliorer votre expérience utilisateur. Vous pouvez désactiver
              les cookies dans les paramètres de votre navigateur, mais certaines fonctionnalités du site
              pourraient ne plus être disponibles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Droit applicable et litiges</h2>
            <p className="text-gray-700 leading-relaxed">
              Les présentes CGU sont régies par le droit français. En cas de litige, une solution amiable
              sera recherchée avant toute action judiciaire. À défaut, les tribunaux français seront seuls
              compétents.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Modification des CGU</h2>
            <p className="text-gray-700 leading-relaxed">
              Laia Skin Institut se réserve le droit de modifier les présentes CGU à tout moment. Les nouvelles
              conditions seront applicables dès leur mise en ligne. Il est recommandé de consulter régulièrement
              cette page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact</h2>
            <p className="text-gray-700 mb-4">
              Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter :
            </p>
            <div className="p-4 bg-rose-50 rounded-lg">
              <p className="text-gray-700"><strong>Laia Skin Institut</strong></p>
              <p className="text-gray-700">Email : contact@laiaskininstitut.fr</p>
              <p className="text-gray-700">Téléphone : +33 6 83 71 70 50</p>
              <p className="text-gray-700">WhatsApp : +33 6 83 71 70 50</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
