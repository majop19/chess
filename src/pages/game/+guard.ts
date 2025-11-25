import { toast } from "sonner";
import { render } from "vike/abort";
import { PageContextServer } from "vike/types";

export const guard = async (pageContext: PageContextServer) => {
  // @ts-expect-error -- fix type
  if (!pageContext.user) {
    toast.error("You must be logged in to access this page.");
    throw render(401);
  }
};
