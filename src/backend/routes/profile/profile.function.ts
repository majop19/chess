// @ts-nocheck
import { type IUser } from "#front/utils/types";
import { type NextFunction, type Request, type Response } from "express";
import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import sharp from "sharp";

// Middleware to validate file type by magic number (file signatures)
export const fileValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.file);
    const filePath = req.file?.path;

    if (!filePath) {
      res.status(400).json({ sucess: false, message: "There is no image." });
      return;
    }

    const buffer = fs.readFileSync(filePath);

    const type = await fileTypeFromBuffer(buffer);

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!type || !allowedTypes.includes(type.mime)) {
      res.status(400).json({ sucess: false, message: "Invalid file type." });
      return;
    }

    return next();
  } catch {
    res.sendStatus(500);
  }
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) return;
    // @ts-expect-error user has email
    const user: IUser | null = await User.findOne({ email: req.user?.email });

    if (!user) throw new Error();

    const imagePath = `public/${user.image}`;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    const outputPath = `${req.file.path}-resize`;

    await sharp(req.file?.path)
      .resize(500, 500)
      .jpeg({ mozjpeg: true })
      .toFile(outputPath);

    fs.renameSync(outputPath, req.file.path);
    user.image = `uploads/${req.file?.filename}`;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Avatar upload successfully.",
      avatar: user.image,
    });
  } catch {
    res.sendStatus(500);
  }
};
