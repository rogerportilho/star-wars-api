// Faker simples sem dependência externa
export function generateFakeUser() {
  const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucia', 'Rafael', 'Fernanda'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Pereira', 'Alves'];
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  
  return {
    username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${random}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}@${domain}`,
    password: 'test123'
  };
}

export function generateCheckoutData() {
  const products = [1, 2, 3, 4, 5];
  const quantities = [1, 2, 3];
  const paymentMethods = ['cash', 'credit', 'debit', 'pix'];
  
  return {
    productId: products[Math.floor(Math.random() * products.length)],
    quantity: quantities[Math.floor(Math.random() * quantities.length)],
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
  };
}

export function generateStarWarsCharacter() {
  const names = ['Jedi Master', 'Sith Lord', 'Rebel Pilot', 'Imperial Officer', 'Bounty Hunter', 'Smuggler', 'Princess', 'General'];
  const firstNames = ['Kael', 'Zara', 'Dex', 'Nova', 'Rex', 'Mira', 'Jax', 'Luna'];
  const lastNames = ['Skywalker', 'Kenobi', 'Vader', 'Solo', 'Organa', 'Fett', 'Calrissian', 'Windu'];
  const locations = ['Tatooine', 'Coruscant', 'Naboo', 'Hoth', 'Endor', 'Dagobah', 'Alderaan', 'Kamino'];
  const episodes = ['Episode I', 'Episode II', 'Episode III', 'Episode IV', 'Episode V', 'Episode VI', 'Episode VII', 'Episode VIII', 'Episode IX'];
  const statuses = ['VIVO', 'FALECIDO', 'DESCONHECIDO'];
  
  const title = names[Math.floor(Math.random() * names.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return {
    name: `${title} ${firstName} ${lastName}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    lastSeen: episodes[Math.floor(Math.random() * episodes.length)]
  };
}