import lion from "../assets/lion-mark.png";
import { playerByImafiaId } from "../data/playerDirectory";
import { useT } from "../i18n/lang";
import { rating as dict } from "../i18n/rating";

/**
 * The club's lion after a roster player's nick, as in the club's Telegram bot: orange for a club member (ЧК),
 * grey for a candidate (КЧК). Read out as the full title.
 */
export default function MemberBadge({ id }: { id: string }) {
  const t = useT(dict);
  const group = playerByImafiaId(id)?.group;
  if (group !== "chk" && group !== "kchk") return null;
  return (
    <span className={`member-badge member-badge--${group}`} title={t.member[group]}>
      <span className="member-badge__lion" aria-hidden="true" style={{ ["--lion" as string]: `url(${lion})` }} />
      <span className="visually-hidden">, {t.member[group]}</span>
    </span>
  );
}
