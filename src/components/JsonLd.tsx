export default function JsonLd() {
  // 1. BeautySalon (informations principales)
  const beautySalon = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": "LAIA SKIN Institut",
    "description": "Institut de beauté spécialisé dans les soins innovants du visage : HydroFacial, BB Glow, Microneedling, LED Thérapie. Réservation en ligne 24/7.",
    "url": "https://laia-skin.fr",
    "telephone": "+33123456789",
    "email": "contact@laiaskininstitut.fr",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Rue de la Beauté",
      "addressLocality": "Paris",
      "postalCode": "75001",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "48.8566",
      "longitude": "2.3522"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "18:00"
      }
    ],
    "priceRange": "€€-€€€",
    "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
    "currenciesAccepted": "EUR",
    "hasMap": "https://maps.google.com/?q=LAIA+SKIN+Institut+Paris",
    "image": [
      "https://laia-skin.fr/laia-skin-facade.jpg",
      "https://laia-skin.fr/og-image.jpg"
    ],
    "sameAs": [
      "https://www.facebook.com/laiaskin",
      "https://www.instagram.com/laia.skin/"
    ],
    // Avis clients (pour afficher les étoiles dans Google)
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    // Services proposés
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services de Soins Esthétiques",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "HydroFacial",
            "description": "Nettoyage profond, exfoliation et hydratation intense du visage",
            "provider": {
              "@type": "BeautySalon",
              "name": "LAIA SKIN Institut"
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "BB Glow",
            "description": "Traitement pour un teint parfait et uniforme",
            "provider": {
              "@type": "BeautySalon",
              "name": "LAIA SKIN Institut"
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Microneedling",
            "description": "Stimulation du collagène pour une peau rajeunie",
            "provider": {
              "@type": "BeautySalon",
              "name": "LAIA SKIN Institut"
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "LED Thérapie",
            "description": "Traitement par lumière LED pour régénérer la peau",
            "provider": {
              "@type": "BeautySalon",
              "name": "LAIA SKIN Institut"
            }
          }
        }
      ]
    },
    // Action de réservation
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://laia-skin.fr/reservation",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "result": {
        "@type": "Reservation",
        "name": "Réservation de soin esthétique"
      }
    }
  };

  // 2. LocalBusiness (pour le SEO local - Google Maps)
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "LAIA SKIN Institut",
    "image": "https://laia-skin.fr/og-image.jpg",
    "@id": "https://laia-skin.fr",
    "url": "https://laia-skin.fr",
    "telephone": "+33123456789",
    "priceRange": "€€-€€€",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Rue de la Beauté",
      "addressLocality": "Paris",
      "postalCode": "75001",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 48.8566,
      "longitude": 2.3522
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "18:00"
      }
    ]
  };

  // 3. Organization (pour le Knowledge Graph de Google)
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LAIA SKIN Institut",
    "url": "https://laia-skin.fr",
    "logo": "https://laia-skin.fr/logo.png",
    "description": "Institut de beauté premium spécialisé dans les soins innovants du visage",
    "sameAs": [
      "https://www.facebook.com/laiaskin",
      "https://www.instagram.com/laia.skin/"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+33123456789",
      "contactType": "customer service",
      "availableLanguage": ["French", "English"],
      "areaServed": "FR"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(beautySalon) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </>
  );
}