import { Glicko2, type Player } from "glicko2";

export const predictEloChanges = (
  whiteElo: { rating: number; ratingDeviation: number },
  blackElo: { rating: number; ratingDeviation: number },
  result: 1 | 0.5 | 0
) => {
  const ranking = new Glicko2({
    rating: 400,
    rd: 350,
  });

  const whiteRanking = ranking.makePlayer(
    whiteElo.rating,
    whiteElo.ratingDeviation
  );

  const blackRanking = ranking.makePlayer(
    blackElo.rating,
    blackElo.ratingDeviation
  );
  // Victoire blanche
  const matches: [Player, Player, number][] = [];

  matches.push([whiteRanking, blackRanking, result]);

  ranking.updateRatings(matches);

  const whiteNewRating = Math.round(whiteRanking.getRating());
  const blackNewRating = Math.round(blackRanking.getRating());
  return {
    white: {
      rating: whiteNewRating,
      ratingDeviation: Math.round(whiteRanking.getRd()),
      eloDiff: whiteNewRating - whiteElo.rating,
    },
    black: {
      rating: blackNewRating,
      ratingDeviation: Math.round(blackRanking.getRd()),
      eloDiff: blackNewRating - blackElo.rating,
    },
  };
};

export const calculateChessGameElo = (
  whiteElo: { rating: number; ratingDeviation: number },
  blackElo: { rating: number; ratingDeviation: number }
) => {
  const white = predictEloChanges(whiteElo, blackElo, 1);
  const black = predictEloChanges(whiteElo, blackElo, 0);
  const draw = predictEloChanges(whiteElo, blackElo, 0.5);

  return {
    white,
    black,
    draw,
  };
};
