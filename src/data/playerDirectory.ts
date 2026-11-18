import { slugify } from "../i18n/translit";
import { CHK_BASE, KCHK_BASE, type RosterPlayer } from "./players";
import { IMAFIA_MEMBERS, ratingPlayers } from "./rating";

export type GroupId = "chk" | "kchk";

/** Anyone with a page on the site: a roster player (with name, photo, bio) or a guest seen in the club rating. */
export type ClubPlayer = Partial<RosterPlayer> & {
  nick: string;
  group: GroupId | "guest";
  /** Address part: /players/<slug>. Stable as long as the nick does not change. */
  slug: string;
  imafiaId?: string;
};

type Source = { nick: string; group: ClubPlayer["group"]; imafiaId?: string } & Partial<RosterPlayer>;

/** Nicks compared loosely: case, spaces, punctuation and emoji do not matter. */
export const nickKey = (nick: string) => nick.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/** iMafia's placeholder accounts for one-off visitors ("Гость", "Гость1"): no page for them. */
export const isPlaceholderGuest = (nick: string) => /^(гость|guest)\s*\d*$/i.test(nick.trim());

/**
 * Every player with a unique URL slug. Roster players come first and keep plain slugs ("walle", "walle-2"…);
 * a guest whose slug is taken gets their iMafia id added ("walle-5068"), which never changes.
 */
export function buildDirectory(players: Source[]): ClubPlayer[] {
  const taken = new Map<string, number>();
  return players.map((player) => {
    const base = slugify(player.nick) || "player";
    const count = (taken.get(base) ?? 0) + 1;
    taken.set(base, count);
    const slug =
      count === 1 ? base : player.group === "guest" && player.imafiaId ? `${base}-${player.imafiaId}` : `${base}-${count}`;
    return { ...player, slug };
  });
}

/** iMafia id for each roster nick: club member list first, then any rating table. */
function imafiaIds(): Map<string, string> {
  const ids = new Map<string, string>();
  for (const member of IMAFIA_MEMBERS) ids.set(nickKey(member.nick), member.id);
  for (const player of ratingPlayers()) if (!ids.has(nickKey(player.nick))) ids.set(nickKey(player.nick), player.id);
  return ids;
}

function allPlayers(): Source[] {
  const ids = imafiaIds();
  const roster: Source[] = [
    ...CHK_BASE.map((p) => ({ ...p, group: "chk" as const, imafiaId: ids.get(nickKey(p.nick)) })),
    ...KCHK_BASE.map((p) => ({ ...p, group: "kchk" as const, imafiaId: ids.get(nickKey(p.nick)) })),
  ];
  const onRoster = new Set(roster.map((p) => p.imafiaId).filter(Boolean));
  const guests: Source[] = ratingPlayers()
    .filter((p) => !onRoster.has(p.id) && !isPlaceholderGuest(p.nick))
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map((p) => ({ nick: p.nick, group: "guest" as const, imafiaId: p.id }));
  return [...roster, ...guests];
}

export const CLUB_PLAYERS: ClubPlayer[] = buildDirectory(allPlayers());

const BY_SLUG = new Map(CLUB_PLAYERS.map((player) => [player.slug, player]));
const BY_IMAFIA_ID = new Map(CLUB_PLAYERS.flatMap((p) => (p.imafiaId ? [[p.imafiaId, p] as const] : [])));

export function findPlayer(slug: string): ClubPlayer | undefined {
  return BY_SLUG.get(slug);
}

/** The site page of an iMafia player, if they have one. */
export function playerByImafiaId(id: string): ClubPlayer | undefined {
  return BY_IMAFIA_ID.get(id);
}
