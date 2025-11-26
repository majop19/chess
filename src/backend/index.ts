import express from "express";
import cors from "cors";
import AuthRouter from "#back/routes/auth/auth.route";
import ProfileRouter from "#back/routes/profile/profile.route";
import ProblemsRouter from "#back/routes/problems/problems.route";
import passport from "passport";
import dotenv from "dotenv";
import { connectDB } from "#back/db/connectDB";
import { createDevMiddleware } from "vike/server";
import { root } from "#back/root";
import tailwindcss from "@tailwindcss/vite";
import compression from "compression";
import { createServer as createServerHttps } from "node:https";
import { createServer as createServerHttp } from "node:http";
import { Server } from "socket.io";
import { onlyForHandshake } from "#back/middleware/onlyForHandshake";
import sessionMiddleware from "#back/middleware/sessionMiddleware";
import vikeRenderPage from "#back/middleware/vikeRenderPage";
import { googleStrategy, localStrategy } from "#back/utils/authStrategy";
import deserializeUser from "#back/utils/deserializeUser.function";
import { WaitingRoomGameEventHandler } from "#back/socket.io/events/WaitingRoomGameEvent";
import { ServerType } from "#back/socket.io/socket.types";
import { ChessGameEventHandler } from "#back/socket.io/events/ChessGameEvent";
import mongoose, { ObjectId } from "mongoose";

const isProduction = process.env.NODE_ENV === "production";

dotenv.config();

async function startServer() {
  const app = express();
  const nodeServer = isProduction
    ? createServerHttps(app)
    : createServerHttp(app);

  const io = new Server<ServerType>(nodeServer);
  app.use(compression());

  app.use(express.json());
  app.use(express.static("public"));
  app.use(cors({ origin: process.env.URL, credentials: true }));

  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(localStrategy);
  passport.use(googleStrategy);

  passport.serializeUser(function (
    user: { id: mongoose.Types.ObjectId | ObjectId },
    done
  ) {
    console.log("serialize");
    done(null, user.id);
  });
  passport.deserializeUser(deserializeUser);
  // Vite integration
  if (isProduction) {
    // In production, we need to serve our static assets ourselves.
    // (In dev, Vite's middleware serves our static assets.)
    const sirv = (await import("sirv")).default;
    app.use(sirv(`${root}/dist/client`));
  } else {
    const { devMiddleware } = await createDevMiddleware({
      root,
      viteConfig: { plugins: [tailwindcss()] },
    });
    app.use(devMiddleware);
  }

  // middleware for sharing the user context
  io.engine.use(onlyForHandshake(sessionMiddleware));
  io.engine.use(onlyForHandshake(passport.session()));
  io.engine.use(
    onlyForHandshake((req, res, next) => {
      if (req.user) {
        console.log("user io", req.user);
        next();
      } else {
        res.writeHead(401);
        res.end();
      }
    })
  );
  const rematchInvitation: mongoose.Types.ObjectId[] = [];
  const activeGames: Map<ObjectId, NodeJS.Timeout> = new Map(); // stocke les parties actifs avec timeout
  io.on("connection", (socket) => {
    console.log("connection");
    const userId = socket.handshake.auth?.userId || null;

    WaitingRoomGameEventHandler(io, socket);
    ChessGameEventHandler(io, socket, rematchInvitation, activeGames);

    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on("disconnect", () => {});
  });

  app.use("/auth", AuthRouter);

  app.use("/profile", ProfileRouter);

  app.use("/problems", ProblemsRouter);

  // Vike middleware.
  app.get("/{*vikeCatchAll}", vikeRenderPage);

  const port = process.env.PORT || 3000;
  connectDB();
  nodeServer.listen(port);
  console.log(`Server running at http://localhost:${port}`);
}

startServer();
