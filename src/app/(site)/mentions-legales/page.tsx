export default function MentionsLegales() {
  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-light text-[#2c3e50] mb-8 tracking-wide uppercase text-center">
          Mentions Légales
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-xl font-medium text-[#2c3e50] mb-4 uppercase tracking-wide">
              1. Éditeur du site
            </h2>
            <div className="text-sm text-[#2c3e50]/70 space-y-2 font-light">
              <p><strong>Raison sociale :</strong> LAIA SKIN INSTITUT</p>
              <p><strong>N° SIREN :</strong> 988 691 937</p>
              <p><strong>Responsable :</strong> Célia IVORRA</p>
              <p><strong>Adresse :</strong> 65 Rue de la Croix, 92000 Nanterre, France</p>
              <p><strong>Téléphone :</strong> 06 83 71 70 50</p>
              <p><strong>Email :</strong> contact@laia-skin.fr</p>
              <p><strong>Instagram :</strong> @laia.skin</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#2c3e50] mb-4 uppercase tracking-wide">
              2. Hébergement
            </h2>
            <div className="text-sm text-[#2c3e50]/70 space-y-2 font-light">
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
              <p><strong>Site web :</strong> https://vercel.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#2c3e50] mb-4 uppercase tracking-wide">
              3. Propriété intellectuelle
            </h2>
            <p className="text-sm text-[#2c3e50]/70 font-light leading-relaxed">
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur 
              et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les 
              documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
            <p className="text-sm text-[#2c3e50]/70 font-light leading-relaxed mt-3">
              La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est 
              formellement interdite sauf autorisation expresse du directeur de la publication.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#2c3e50] mb-4 uppercase tracking-wide">
              4. Protection des données personnelles
            </h2>
            <p className="text-sm text-[#2c3e50]/70 font-light leading-relaxed">
              Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement 
              Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, 
              de suppression et d'opposition aux données personnelles vous concernant.
            </p>
            <p className="text-sm text-[#2c3e50]/70 font-light leading-relaxed mt-3">
              Pour exercer ce droit, vous pouvez nous contacter par email à : contact@laia-skin.fr
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#2c3e50] mb-4 uppercase tracking-wide">
              5. Cookies
            </h2>
            <p className="text-sm text-[#2c3e50]/70 font-light leading-relaxed">
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. 
              En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies conformément 
              à notre politique de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#2c3e50] mb-4 uppercase tracking-wide">
              6. Responsabilité
            </h2>
            <p className="text-sm text-[#2c3e50]/70 font-light leading-relaxed">
              LAIA SKIN INSTITUT s'efforce d'assurer au mieux l'exactitude et la mise à jour des informations 
              diffusées sur ce site. Cependant, nous ne pouvons garantir l'exactitude, la précision ou 
              l'exhaustivité des informations mises à disposition sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#2c3e50] mb-4 uppercase tracking-wide">
              7. Droit applicable
            </h2>
            <p className="text-sm text-[#2c3e50]/70 font-light leading-relaxed">
              Les présentes mentions légales sont régies par le droit français. En cas de litige, 
              les tribunaux français seront seuls compétents.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-[#2c3e50]/50 text-center font-light">
              Dernière mise à jour : Décembre 2024
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}