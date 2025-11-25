import express from "express";
import {
  forgotPassword,
  login,
  logout,
  resendTokenEmail,
  resetPassword,
  signup,
  verifyEmail,
} from "#back/routes/auth/auth.function";
import passport from "passport";

const router = express.Router();

router.post("/register", signup);

router.get("/google", passport.authenticate("google"));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/register",
    successRedirect: "/",
  })
);

router.post("/verify-email", verifyEmail);

router.post("/resend-email", resendTokenEmail);

router.post("/login", login);

router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;
