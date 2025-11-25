import { render } from "vike/abort";

type PageContextServer = Vike.PageContext & Vike.PageContextServer;

export const guard = async (pageContext: PageContextServer) => {
  // @ts-expect-error -- fix typ
  if (!pageContext.user) throw render(401);
};
