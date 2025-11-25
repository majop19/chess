import { PageContextServer } from "vike/types";
import { render } from "vike/abort";

export const guard = (pageContext: PageContextServer) => {
  if (
    pageContext.urlPathname === "/auth/login" ||
    pageContext.urlPathname === "/auth/register" ||
    pageContext.urlPathname === "/auth/forgot-password"
  ) {
    // @ts-expect-error -- fix type
    if (pageContext.user) throw render(403);
  } else if (pageContext.urlPathname === "/auth/verify-email") {
    // @ts-expect-error -- fix type
    if (!pageContext.user || pageContext.user.isVerified) throw render(401);
  }
};
