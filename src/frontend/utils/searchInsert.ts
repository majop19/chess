import { type UserEloType } from "./EloMatchmaking";

export function sortedIndex(array: UserEloType[], value: UserEloType) {
  let low = 0,
    high = array.length;

  while (low < high) {
    const mid = (low + high) >>> 1;
    if (array[mid].elo < value.elo) low = mid + 1;
    else high = mid;
  }
  return low;
}
