import logo from "../assets/logo.jpeg";
import type { ClubPlayer } from "../data/playerDirectory";
import { latestMonthPlace, type PlayerPlace, type PlayerStats } from "../data/playerStats";
import { DEFAULT_LEAGUE_NAME, formatNumber, formatSigned } from "../data/ratingView";
import type { Lang } from "../i18n/lang";
import { profile as dict } from "../i18n/profile";
import { rating as ratingDict } from "../i18n/rating";
import { SITE_URL } from "../site";
import type { StoryCardData } from "./storyCard";

type Stat = { label: string; value: string };

/**
 * The month's third number: the role the player won most with (Sheriff first on a tie), or extras per game
 * when they won neither as the Don nor as the Sheriff.
 */
function roleStat(place: PlayerPlace, lang: Lang): Stat {
  const t = dict[lang].story;
  if (place.sheriffWins > 0 && place.sheriffWins >= place.donWins) return { label: t.asSheriff, value: String(place.sheriffWins) };
  if (place.donWins > 0) return { label: t.asDon, value: String(place.donWins) };
  return { label: t.extraPerGame, value: formatSigned(place.games ? place.extraSum / place.games : 0, 2) };
}

/**
 * What the 9:16 story card says: the latest counted month (place, average, wins of games, best role);
 * without one, the annual place with the year's numbers.
 */
export function storyCardData(player: ClubPlayer, stats: PlayerStats | undefined, lang: Lang): StoryCardData {
  const t = dict[lang].story;
  const months = ratingDict[lang].months;
  const month = latestMonthPlace(stats, { countedOnly: true });
  const annual = stats?.places.find((p) => DEFAULT_LEAGUE_NAME.test(p.leagueName));
  const annualYear = annual?.leagueName.match(/(\d{4})$/)?.[1] ?? "";
  const base = { nick: player.nick, photo: player.photo ?? logo, logo, footer: SITE_URL.replace(/^https?:\/\//, "") };

  if (month) {
    return {
      ...base,
      period: `${months[month.month!]} ${month.year}`,
      headline: t.monthPlace(month.place),
      stats: [
        { label: t.perGame, value: formatNumber(month.avg) },
        { label: t.wins, value: `${month.wins}/${month.games}` },
        roleStat(month, lang),
      ],
    };
  }
  if (annual) {
    const winRate = stats?.profile?.winRate;
    return {
      ...base,
      period: annualYear,
      headline: t.annualPlace(annual.place, annualYear),
      stats: [
        { label: t.perGame, value: formatNumber(annual.avg) },
        { label: t.wins, value: `${annual.wins}/${annual.games}` },
        ...(winRate != null ? [{ label: t.winRate, value: `${Math.round(winRate)}%` }] : []),
      ],
    };
  }
  return { ...base, period: "", headline: "", stats: [] };
}
