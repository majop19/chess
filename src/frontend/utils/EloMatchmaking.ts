import { ObjectId } from "mongoose";
import { type RefObject } from "react";

export function findUserWithSmallestEloDifference(
  userElo: number,
  userList: UserEloType[],
  eloDifference: number
): UserEloType | null {
  if (userList.length === 0) {
    return null;
  }

  let start = 0;
  let end = userList.length - 1;

  // Best result found so far
  let bestResult: UserEloType | null = null;
  let bestDifference = Infinity;

  while (start <= end) {
    const middle = Math.floor((start + end) / 2);
    const middleValue = userList[middle];
    const difference = Math.abs(middleValue.elo - userElo);

    if (difference <= eloDifference) {
      if (difference < bestDifference) {
        bestResult = middleValue;
        bestDifference = difference;
      }

      // If we have a difference of 0, that's the best possible result
      if (difference === 0) {
        return middleValue;
      }
    }

    if (middleValue.elo < userElo) {
      start = middle + 1;
    } else {
      end = middle - 1;
    }
  }

  return bestResult;
}

export type UserEloType = { id: ObjectId; elo: number };

async function EloMatchmaking(
  userElo: number,
  userListRef: RefObject<UserEloType[]>,
  eloDifferenceRef: RefObject<number>
) {
  const findUserOpponent = findUserWithSmallestEloDifference(
    userElo,
    userListRef.current,
    eloDifferenceRef.current
  );
  if (!findUserOpponent) {
    eloDifferenceRef.current += 5;
    return EloMatchmaking(userElo, userListRef, eloDifferenceRef);
  }

  return findUserOpponent;
}

export default EloMatchmaking;
