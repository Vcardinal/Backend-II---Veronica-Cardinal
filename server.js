require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app'); 

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

(async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const server = app.listen(PORT, () => {
      console.log(`🚀 API escuchando en http://localhost:${PORT}`);
    });

    process.on('SIGINT', async () => {
      console.log('\n🧹 Cerrando servidor...');
      await mongoose.disconnect();
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
})();




