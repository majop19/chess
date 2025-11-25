import MongoStore from "connect-mongo";
import session from "express-session";

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET!,
  cookie: {
    maxAge: 1209600000, // 2 weeks
    secure: process.env.NODE_ENV === "production",
  },
  saveUninitialized: false,
  resave: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI!,
    touchAfter: 12 * 3600, // 24 hours
  }),
});

export default sessionMiddleware;
