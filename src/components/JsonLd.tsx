export default function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": "LAIA SKIN Institut",
    "description": "Institut de beauté spécialisé dans les soins innovants du visage",
    "url": "https://laia-skin.fr",
    "telephone": "+33123456789",
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
    "servesCuisine": "French",
    "hasMap": "https://maps.google.com/?q=LAIA+SKIN+Institut+Paris",
    "image": "https://laia-skin.fr/laia-skin-facade.jpg",
    "sameAs": [
      "https://www.facebook.com/laiaskin",
      "https://www.instagram.com/laia.skin/",
      "https://www.linkedin.com/company/laiaskin"
    ],
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
        "name": "Réservation de soin"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}