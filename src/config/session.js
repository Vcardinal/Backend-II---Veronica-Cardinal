// sesiones //

const session = require('express-session');
const MongoStore = require('connect-mongo');

function sessionMW({
  store = process.env.SESSION_STORE || 'mongo',
  mongoUrl = process.env.MONGO_URL,            
  SECRET = process.env.SESSION_SECRET,         
  ttlSeconds = Number(process.env.SESSION_TTLSECONDS) || 1800,
} = {}) {
  let sessionStore;

  if (store === 'mongo') {
    sessionStore = MongoStore.create({
      mongoUrl,
      ttl: ttlSeconds,
      crypto: { secret: SECRET },
    });
    console.log('✅ Usando store de sesiones en MongoDB');
  } else {
    sessionStore = undefined;
    console.warn('⚠️ Usando MemoryStore (no recomendado para producción)');
  }

  return session({
    store: sessionStore,
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: ttlSeconds * 1000,
      httpOnly: true,
      sameSite: 'lax',
      secure: String(process.env.COOKIE_SECURE) === 'true' || false,
    },
  });
}

module.exports = { sessionMW };
