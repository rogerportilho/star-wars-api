// graphql/server.js
const createGraphQLApp = require('./app');

const PORT = process.env.GRAPHQL_PORT || 3002;

async function startServer() {
  try {
    const app = await createGraphQLApp();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Star Wars GraphQL API running at http://localhost:${PORT}`);
      console.log(`📊 GraphQL Playground available at http://localhost:${PORT}/graphql`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('GraphQL server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('GraphQL server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start GraphQL server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = startServer;