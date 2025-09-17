const createRestApp = require('./app');

const PORT = process.env.PORT || 3001;
const app = createRestApp();

app.listen(PORT, () => {
  console.log(`REST API running on port ${PORT}`);
  console.log(`Swagger → http://localhost:${PORT}/api-docs`);
});
