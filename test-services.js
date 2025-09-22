// Test des services
fetch('http://localhost:3001/api/services')
  .then(res => res.json())
  .then(data => {
    console.log('Services dans la base:');
    data.forEach(s => {
      if (s.active) {
        console.log('---');
        console.log('Nom:', s.name);
        console.log('Slug:', s.slug);
        console.log('Prix normal:', s.price);
        console.log('Prix promo:', s.promoPrice);
        console.log('Prix forfait:', s.forfaitPrice);
      }
    });
  })
  .catch(err => console.error('Erreur:', err));