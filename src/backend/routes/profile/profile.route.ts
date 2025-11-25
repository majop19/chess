//@ts-nocheck
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import multer from "multer";
import {
  fileValidation,
  uploadFile,
} from "#back/routes/profile/profile.function";
const router = express.Router();
const upload = multer({ dest: "/tmp" });

router.post(
  "/avatar",
  (req: Request, res: Response, next: NextFunction) => {
    if (req.isUnauthenticated()) {
      res.sendStatus(401);
      return;
    }

    return next();
  },
  upload.single("avatar"),
  fileValidation,
  uploadFile
);

export default router;
