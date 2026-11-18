import { slugify } from "../i18n/translit";
import { CHK_BASE, KCHK_BASE, type RosterPlayer } from "./players";
import index from "./player-index.json";

/** Small list of everyone in the club rating, written by the sync scripts (scripts/lib/playerIndex.mjs). */
const INDEX = index as {
  members: { id: string; nick: string }[];
  players: { id: string; nick: string; avatar?: string; thumb?: number }[];
};

const HAS_THUMB = new Set(INDEX.players.filter((p) => p.thumb).map((p) => p.id));

/** Small round photo for tables (public/thumbs, made by scripts/make-thumbs.mjs), if there is one. */
export function thumbFor(imafiaId: string): string | undefined {
  return HAS_THUMB.has(imafiaId) ? `/thumbs/${imafiaId}.jpg` : undefined;
}

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
  const used = new Set<string>();
  return players.map((player) => {
    const base = slugify(player.nick) || "player";
    const count = (taken.get(base) ?? 0) + 1;
    taken.set(base, count);
    const wanted =
      count === 1 ? base : player.group === "guest" && player.imafiaId ? `${base}-${player.imafiaId}` : `${base}-${count}`;
    // A nick like "Mir 2" can land on a slug already numbered for someone else ("mir-2").
    let slug = wanted;
    for (let n = 2; used.has(slug); n++) slug = `${wanted}-${n}`;
    used.add(slug);
    return { ...player, slug };
  });
}

/** iMafia id for each roster nick: club member list first, then any rating table. */
function imafiaIds(): Map<string, string> {
  const ids = new Map<string, string>();
  for (const member of INDEX.members) ids.set(nickKey(member.nick), member.id);
  for (const player of INDEX.players) if (!ids.has(nickKey(player.nick))) ids.set(nickKey(player.nick), player.id);
  return ids;
}

function allPlayers(): Source[] {
  const ids = imafiaIds();
  const roster: Source[] = [
    ...CHK_BASE.map((p) => ({ ...p, group: "chk" as const, imafiaId: ids.get(nickKey(p.nick)) })),
    ...KCHK_BASE.map((p) => ({ ...p, group: "kchk" as const, imafiaId: ids.get(nickKey(p.nick)) })),
  ];
  const onRoster = new Set(roster.map((p) => p.imafiaId).filter(Boolean));
  const guests: Source[] = INDEX.players
    .filter((p) => !onRoster.has(p.id) && !isPlaceholderGuest(p.nick))
    .sort((a, b) => Number(a.id) - Number(b.id))
    // Guests' avatars come from iMafia (public/players/<id>.jpg), once their profile has been fetched.
    .map((p) => ({ nick: p.nick, group: "guest" as const, imafiaId: p.id, ...(p.avatar && { photo: `/${p.avatar}` }) }));
  return [...roster, ...guests];
}

export const CLUB_PLAYERS: ClubPlayer[] = buildDirectory(allPlayers());

const BY_SLUG = new Map(CLUB_PLAYERS.map((player) => [player.slug, player]));
const BY_IMAFIA_ID = new Map(CLUB_PLAYERS.flatMap((p) => (p.imafiaId ? [[p.imafiaId, p] as const] : [])));

export function findPlayer(slug: string): ClubPlayer | undefined {
  return BY_SLUG.get(slug);
}

const BY_ROSTER_NICK = new Map(CLUB_PLAYERS.filter((p) => p.group !== "guest").map((p) => [p.nick, p]));

/** The page of a roster player (as listed in players.ts). */
export function rosterPlayer(nick: string): ClubPlayer | undefined {
  return BY_ROSTER_NICK.get(nick);
}

/** The site page of an iMafia player, if they have one. */
export function playerByImafiaId(id: string): ClubPlayer | undefined {
  return BY_IMAFIA_ID.get(id);
}

/** Every player in the rating, as listed in the index (for tests and the sync check). */
export const INDEXED_PLAYERS = INDEX.players;
