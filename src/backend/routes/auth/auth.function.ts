// @ts-nocheck
import bcrypt from "bcryptjs";
import { type NextFunction, type Request, type Response } from "express";
import passport from "passport";
import { Error } from "mongoose";
import { ChessProfile } from "#back/models/chessProfile/chessProfile.model";

import { type IChessProfile, type IUser } from "#front/utils/types";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password)
      throw new Error("missing a field value (name, email, password)");

    const isUserAlreadyExists = await User.findOne({ email });

    if (isUserAlreadyExists)
      throw new Error("An user already exists with this email address.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const chessProfile: IChessProfile = new ChessProfile();

    const user: IUser = new User({
      name,
      email,
      password: hashedPassword,
      chessProfile: chessProfile._id,
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    });
    await chessProfile.save();
    await user.save();

    req.login({ id: user._id, email: user.email }, (err) => {
      if (err) {
        console.log("Error in login signup");
        return res
          .status(500)
          .json({ success: false, message: "Session creation failed" });
      }
      // await sendVerificationEmail(email, verificationToken);

      return res.status(201).json({
        success: true,
        message: "An user has been created.",
        // @ts-expect-error user has _doc
        user: { ...user._doc, password: undefined },
      });
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error during signup", error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { code } = req.body;

  try {
    const user: IUser | null = await User.findOne({
      verificationToken: code,
    });

    if (!user) {
      res.status(498).json({
        success: false,
        invalid: true,
        message: "Invalid verification code",
      });
      return;
    }

    if (!user.verificationTokenExpiresAt) throw new Error("An error occured");

    const istokenExpired =
      Date.now() > user.verificationTokenExpiresAt.getTime();

    if (istokenExpired) {
      res.status(498).json({
        success: false,
        invalid: false,
        message: "Expired verification code",
      });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        // @ts-expect-error user has _doc
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verify-email", error);
    if (error instanceof Error)
      res.status(400).json({ success: false, message: error.message });
  }
};

export const resendTokenEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user: IUser | null = await User.findOne({
      email,
      isVerified: false,
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "No user for this email or user already verified.",
      });
      return;
    }
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1hour

    await user.save();

    // await sendVerificationEmail(user.email, verificationToken)

    res.json({
      success: true,
      message: "An email with another token has been sent.",
    });
  } catch {
    res.status(500).send();
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: Error, user: Express.User) => {
    if (!user) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    req.login(user, (err) => {
      console.log("login");
      if (err) {
        return next(err);
      }

      return res.json({
        success: true,
        message: "The User has been login.",
        // @ts-expect-error user has id and email
        user: { id: user.id, email: user.email },
      });
    });
  })(req, res, next);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  if (req.isUnauthenticated()) {
    res.status(400).json({
      success: false,
      message: "The user is already unauthenticated.",
    });
    return;
  }

  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user: Iuser | null = await User.findOne({ email });

    if (!user) throw new Error("User not found");

    if (user.provider == "Google" && !user.password)
      throw new Error(
        "The user for this email address was signup with his google account."
      );

    const resetPasswordToken = crypto.randomUUID();
    const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // await sendPasswordResetEmail(user.email,`${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`);

    res.json({
      success: true,
      message: "Password Reset email send successfully",
    });
  } catch (error) {
    console.log("error forgot password", error);
    if (error instanceof Error)
      res.send(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword != confirmPassword) {
    res
      .status(400)
      .json({ success: false, message: "The two passwords do not match." });
    return;
  }

  try {
    const user: Iuser | null = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user || !user.password)
      throw new Error("The token is invalid or has expired.");

    const isCorrectPassword = await bcrypt.compare(newPassword, user.password);

    if (isCorrectPassword)
      throw new Error("The new password cannot be the same as the old one.");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    // await sendResetSuccessEmail(user.email);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log("error reset password", error);
    if (error instanceof Error)
      res.status(400).json({ success: false, message: error.message });
  }
};
