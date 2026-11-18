import logo from "../assets/logo.jpeg";
import type { ClubPlayer } from "../data/playerDirectory";
import type { PlayerStats } from "../data/playerStats";
import { DEFAULT_LEAGUE_NAME, formatNumber } from "../data/ratingView";
import type { Lang } from "../i18n/lang";
import { profile as dict } from "../i18n/profile";
import { rating as ratingDict } from "../i18n/rating";
import { SITE_URL } from "../site";
import type { StoryCardData } from "./storyCard";

/** What the card says: the latest counted month's place, else the annual place, plus three numbers. */
export function storyCardData(player: ClubPlayer, stats: PlayerStats | undefined, lang: Lang): StoryCardData {
  const t = dict[lang].story;
  const months = ratingDict[lang].months;
  const month = stats?.places.find((p) => p.month !== null && p.year !== null && p.counted);
  const annual = stats?.places.find((p) => DEFAULT_LEAGUE_NAME.test(p.leagueName));
  const annualYear = annual?.leagueName.match(/(\d{4})$/)?.[1] ?? "";
  const headline = month
    ? { place: `№${month.place}`, placeLabel: t.monthLabel(`${months[month.month!]} ${month.year}`) }
    : annual
      ? { place: `№${annual.place}`, placeLabel: t.annualLabel(annualYear) }
      : { place: "", placeLabel: "" };
  const stat = [
    annual && { label: t.games, value: String(annual.games) },
    annual && { label: t.wins, value: String(annual.wins) },
    stats?.profile?.winRate != null && { label: t.winRate, value: `${formatNumber(Math.round(stats.profile.winRate))}%` },
  ].filter((s): s is { label: string; value: string } => Boolean(s));
  return {
    nick: player.nick,
    photo: player.photo ?? logo,
    logo,
    ...headline,
    stats: stat,
    footer: SITE_URL.replace(/^https?:\/\//, ""),
  };
}

