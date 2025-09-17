// graphql/app.js
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

const JWT_SECRET = process.env.JWT_SECRET || 'starwars_secret';

async function createGraphQLApp() {
  const app = express();
  
  // Enable CORS
  app.use(cors());
  
  // Parse JSON bodies
  app.use(express.json());
  
  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const auth = req.headers.authorization || '';
      let user = null;
      
      if (auth.startsWith('Bearer ')) {
        try {
          const token = auth.split(' ')[1];
          user = jwt.verify(token, JWT_SECRET);
        } catch (error) {
          // Invalid token - user remains null (silent)
        }
      }
      
      return { user };
    },
    // Enable GraphQL Playground in development
    introspection: process.env.NODE_ENV !== 'production',
    playground: process.env.NODE_ENV !== 'production',
    // Format errors
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code,
        path: error.path
      };
    }
  });
  
  // Start the server
  await server.start();
  
  // Apply the Apollo GraphQL middleware
  server.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: false // We handle CORS above
  });
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      service: 'Star Wars GraphQL API',
      timestamp: new Date().toISOString()
    });
  });
  
  // GraphQL endpoint info
  app.get('/', (req, res) => {
    res.json({
      message: 'Star Wars GraphQL API',
      graphql: '/graphql',
      playground: process.env.NODE_ENV !== 'production' ? '/graphql' : 'disabled'
    });
  });
  
  return app;
}

module.exports = createGraphQLApp;