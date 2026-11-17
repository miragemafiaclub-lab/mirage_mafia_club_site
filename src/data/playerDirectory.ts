import { slugify } from "../i18n/translit";
import { CHK_BASE, KCHK_BASE, type RosterPlayer } from "./players";

export type GroupId = "chk" | "kchk";

export type ClubPlayer = RosterPlayer & {
  group: GroupId;
  /** Address part: /players/<slug>. Stable as long as the nick does not change. */
  slug: string;
};

/** Every roster player with a unique URL slug. Two nicks with the same slug get "-2", "-3"… in roster order. */
export function buildDirectory(groups: [GroupId, RosterPlayer[]][]): ClubPlayer[] {
  const taken = new Map<string, number>();
  return groups.flatMap(([group, players]) =>
    players.map((player) => {
      const base = slugify(player.nick) || "player";
      const count = (taken.get(base) ?? 0) + 1;
      taken.set(base, count);
      return { ...player, group, slug: count === 1 ? base : `${base}-${count}` };
    }),
  );
}

export const CLUB_PLAYERS: ClubPlayer[] = buildDirectory([
  ["chk", CHK_BASE],
  ["kchk", KCHK_BASE],
]);

const BY_SLUG = new Map(CLUB_PLAYERS.map((player) => [player.slug, player]));

export function findPlayer(slug: string): ClubPlayer | undefined {
  return BY_SLUG.get(slug);
}
