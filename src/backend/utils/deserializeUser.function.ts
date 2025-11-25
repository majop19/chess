import { User } from "#back/models/user.model";
import { type IUser } from "#front/utils/types";
import { ObjectId } from "mongoose";

async function deserializeUser(
  id: ObjectId,
  done: (err: unknown, user?: Express.User | null | false) => void
) {
  try {
    const user: IUser | null = await User.findById(id);

    if (!user) return done(null, false);

    done(null, { id: user._id, email: user.email });
  } catch (error) {
    console.log("Error in passport.deserializeUser");
    return done(error, false);
  }
}

export default deserializeUser;
