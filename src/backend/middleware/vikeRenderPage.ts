// @ts-nocheck
import { User } from "#back/models/user.model";
import { type ChessProfileLean, type IUser } from "#front/utils/types";
import { type Request, type Response } from "express";
import { renderPage } from "vike/server";

const vikeRenderPage = async (req: Request, res: Response) => {
  const user = (await User.findOne({
    // @ts-expect-error test eror
    email: req.user?.email,
  })
    .populate("chessProfile")
    .lean()) as IUser | null;

  const pageContextInit = {
    urlOriginal: req.originalUrl,
    headersOriginal: req.headers,
    user: user
      ? {
          id: user._id,
          email: user.email,
          image: user.image,
          name: user.name,
          isVerified: user.isVerified,
          chessProfile: user.chessProfile as ChessProfileLean,
        }
      : null,
  };
  const pageContext = await renderPage(pageContextInit);
  if (pageContext.errorWhileRendering) {
    // Install error tracking here, see https://vike.dev/error-tracking
  }
  const { httpResponse } = pageContext;
  if (res.writeEarlyHints)
    res.writeEarlyHints({
      link: httpResponse.earlyHints.map((e) => e.earlyHintLink),
    });
  httpResponse.headers.forEach(([name, value]) => res.setHeader(name, value));
  res.status(httpResponse.statusCode);
  // For HTTP streams use pageContext.httpResponse.pipe() instead, see https://vike.dev/streaming
  httpResponse.pipe(res);
};

export default vikeRenderPage;
