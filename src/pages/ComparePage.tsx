import { useId, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import logo from "../assets/logo.jpeg";
import { betterSide, COMPARE_ROWS } from "../data/compare";
import { CLUB_PLAYERS, findPlayer, nickKey, type ClubPlayer } from "../data/playerDirectory";
import type { PlayerStats } from "../data/playerStats";
import { formatNumber } from "../data/ratingView";
import { useHydrated } from "../hooks/useHydrated";
import { compare as dict } from "../i18n/compare";
import { useLang, useT } from "../i18n/lang";
import { textLang } from "../i18n/translit";
import { usePageData } from "../pageDataCache";
import { localize } from "../routes";
import "./compare.css";

/** Players that have stats to compare: everyone linked to iMafia. */
const COMPARABLE = CLUB_PLAYERS.filter((p) => p.imafiaId);

function findByNick(nick: string): ClubPlayer | undefined {
  const key = nickKey(nick);
  return key ? COMPARABLE.find((p) => nickKey(p.nick) === key) : undefined;
}

function Picker({ n, player, onPick, listId }: { n: 1 | 2; player?: ClubPlayer; onPick: (p: ClubPlayer) => void; listId: string }) {
  const t = useT(dict);
  const id = useId();
  const [text, setText] = useState(player?.nick ?? "");
  const [error, setError] = useState(false);

  const submit = (value: string) => {
    const found = findByNick(value);
    setError(!found && value.trim() !== "");
    if (found) onPick(found);
  };

  return (
    <div className="compare__picker">
      <label htmlFor={id}>{t.pick(n)}</label>
      <input
        id={id}
        list={listId}
        value={text}
        placeholder={t.placeholder}
        autoComplete="off"
        aria-invalid={error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => {
          setText(e.target.value);
          // Picking from the suggestions fills the whole nick: compare straight away.
          if (findByNick(e.target.value)) submit(e.target.value);
        }}
        onBlur={(e) => submit(e.target.value)}
      />
      {error && (
        <p className="compare__error" id={`${id}-error`} role="alert">
          {t.notFound}
        </p>
      )}
    </div>
  );
}

function Head({ player }: { player: ClubPlayer }) {
  const { lang } = useLang();
  return (
    <Link className="compare__head" to={localize(`/players/${player.slug}`, lang)}>
      <span className="compare__photo">
        <img src={player.photo ?? logo} alt="" />
      </span>
      <span className="compare__nick" lang={textLang(player.nick)}>
        {player.nick}
      </span>
    </Link>
  );
}

function Table({ a, b, pa, pb }: { a: PlayerStats; b: PlayerStats; pa: ClubPlayer; pb: ClubPlayer }) {
  const t = useT(dict);
  return (
    <div className="rating-table__wrap">
      <table className="rating-table compare__table">
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">—</span>
            </th>
            <th scope="col" className="compare__col">
              <Head player={pa} />
            </th>
            <th scope="col" className="compare__col">
              <Head player={pb} />
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARE_ROWS.map((row) => {
            const side = betterSide(row, a, b);
            const show = (s: PlayerStats) => {
              const v = row.value(s);
              if (v === null) return "—";
              const text = formatNumber(v) + (row.percent ? "%" : "");
              return row.lowerIsBetter ? `№${text}` : text;
            };
            return (
              <tr key={row.id}>
                <th scope="row">{t.rows[row.id]}</th>
                {(["a", "b"] as const).map((s) => (
                  <td key={s} className={`compare__value${side === s ? " is-better" : ""}`}>
                    {show(s === "a" ? a : b)}
                    {side === s && <span className="visually-hidden"> ({t.better})</span>}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ComparePage() {
  const t = useT(dict);
  const [params, setParams] = useSearchParams();
  // The prerendered page is the empty form; the address's players load once the page is live.
  const hydrated = useHydrated();
  const pa = hydrated ? findPlayer(params.get("a") ?? "") : undefined;
  const pb = hydrated ? findPlayer(params.get("b") ?? "") : undefined;
  const a = usePageData<PlayerStats>(pa ? `/data/players/${pa.slug}.json` : null).data;
  const b = usePageData<PlayerStats>(pb ? `/data/players/${pb.slug}.json` : null).data;
  const listId = useId();

  const pick = (key: "a" | "b") => (player: ClubPlayer) => {
    const next = new URLSearchParams(params);
    next.set(key, player.slug);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  return (
    <section className="compare">
      <p className="page__eyebrow">{t.eyebrow}</p>
      <h1 className="page__title">{t.title}</h1>
      <p className="page__lead">{t.lead}</p>

      <form className="compare__pickers" onSubmit={(e: FormEvent) => e.preventDefault()}>
        <datalist id={listId}>
          {COMPARABLE.map((p) => (
            <option key={p.slug} value={p.nick} />
          ))}
        </datalist>
        {/* key: a new player from the address resets the field's text. */}
        <Picker key={`a-${pa?.slug}`} n={1} player={pa} onPick={pick("a")} listId={listId} />
        <Picker key={`b-${pb?.slug}`} n={2} player={pb} onPick={pick("b")} listId={listId} />
      </form>

      {pa && pb && a && b ? (
        <Table a={a} b={b} pa={pa} pb={pb} />
      ) : (
        <p className="rating__empty">{t.choose}</p>
      )}
    </section>
  );
}
