// Test pour vérifier les réservations
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTU0amN0c2wwMDA1ajF5dDk5Y2tkaGxoIiwiZW1haWwiOiJjZWxpYS5pdm9ycmE5NUBob3RtYWlsLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3MzY0MzgzNjJ9.Fkp4lrb0vJUHTXLaRm6mh4WL10hQzwD1KO3_UkRajQE';

fetch('http://localhost:3001/api/reservations', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('Réservations:', JSON.stringify(data, null, 2));
})
.catch(err => console.error('Erreur:', err));