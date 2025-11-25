import LocalStrategy from "passport-local";
import GoogleStrategy from "passport-google-oauth20";
import { User } from "#back/models/user.model";
import bcrypt from "bcryptjs";
import { ChessProfile } from "#back/models/chessProfile/chessProfile.model";
import { type IChessProfile, type IUser } from "#front/utils/types";

export const localStrategy = new LocalStrategy.Strategy(
  { usernameField: "email" },
  async function (email, password, done) {
    try {
      const user: IUser | null = await User.findOne({ email });

      if (!user)
        return done({ message: "No user found for this email address" }, false);

      if (user.provider || !user.password)
        return done(
          {
            message:
              "This email is linked to a Google account. Please sign in with Google.",
          },
          false
        );

      const verifyPassword = await bcrypt.compare(password, user.password);

      if (!verifyPassword)
        return done({ message: "The password is incorrect" }, false);

      return done(null, { id: user._id, email: user.email });
    } catch (error) {
      console.log("Error during login", error);
      return done(error, false);
    }
  }
);

export const googleStrategy = new GoogleStrategy.Strategy(
  {
    clientID: process.env.GOOGLE_CLIENT!,
    clientSecret: process.env.GOOGLE_SECRET!,
    callbackURL: `${process.env.URL}/auth/google/callback`,
    scope: ["email", "profile"],
    state: true,
  },
  async function verify(_, __, profile, cb) {
    console.log("begin auth", profile);
    try {
      const user: IUser | null = await User.findOne({
        email: profile._json.email,
      });

      if (user) {
        if (!user.provider)
          return cb(
            "An account with this email address already exists. Please log in with your email and password."
          );

        return cb(null, { id: user._id, email: user.email });
      }

      if (!profile._json.email || !profile._json.name)
        return cb("Missing email or name", false);

      const chessProfile: IChessProfile = new ChessProfile();

      const newUser: IUser = new User({
        email: profile._json.email,
        name: profile._json.given_name,
        isVerified: profile._json.email_verified,
        provider: "Google",
        image: profile._json.picture,
        chessProfile: chessProfile._id,
      });

      await chessProfile.save();
      await newUser.save();

      if (!newUser.isVerified) {
        newUser.verificationToken = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        newUser.verificationTokenExpiresAt = new Date(
          Date.now() + 1 * 60 * 60 * 1000
        );

        await newUser.save();

        // await sendVerificationEmail(newUser.email, newUser.verificationToken)
      }
      cb(null, { id: newUser._id, email: newUser.email });
    } catch (error) {
      console.log("error google auth", error);
      cb(error, false);
    }
  }
);
