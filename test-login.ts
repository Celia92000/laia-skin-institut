import bcrypt from 'bcryptjs';

async function testLogin() {
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('Testing password: admin123');
  console.log('Hashed password:', hashedPassword);
  
  // Test de comparaison
  const isValid = await bcrypt.compare('admin123', hashedPassword);
  console.log('Password validation:', isValid);
  
  // Test avec le hash de la DB
  const dbHash = '$2a$10$JfQZLw2JdUKqiXP2o4FJEe7JQHkVy/YgYoXWJUf1xKCynKhJgXpri';
  const isValidDB = await bcrypt.compare('admin123', dbHash);
  console.log('DB password validation:', isValidDB);
}

testLogin();