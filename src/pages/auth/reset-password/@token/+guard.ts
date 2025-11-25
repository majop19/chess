import { User } from "#back/models/user.model";
import { IUser } from "#front/utils/types";
import { render } from "vike/abort";
import { PageContext } from "vike/types";

export const guard = async (pageContext: PageContext) => {
  // @ts-expect-error -- fix type
  if (pageContext.user) throw render(403, "Already login");

  const resetPasswordToken = pageContext.routeParams.token;

  const user: IUser | null = await User.findOne({ resetPasswordToken });

  if (!user) throw render(403, "Invalid token");

  if (!user.resetPasswordExpiresAt) throw render(500);

  const isTokenExpired = Date.now() > user.resetPasswordExpiresAt.getTime();

  if (isTokenExpired) throw render(403, "Token expired");
};
