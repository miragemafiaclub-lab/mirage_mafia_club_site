import { YOUTUBE_URL, videoUrl, type YoutubeVideo } from "../data/youtube";
import { useYoutube } from "../hooks/useYoutube";
import { useT } from "../i18n/lang";
import { videos as dict } from "../i18n/videos";
import "./Videos.css";

const SLOTS = 3;

function VideoCard({ video }: { video: YoutubeVideo }) {
  const t = useT(dict);
  return (
    <li className="videos__item">
      <a
        className="videos__card"
        href={videoUrl(video.id)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.watchLabel(video.title)}
      >
        <span className="videos__thumb">
          <img src={video.thumb} alt="" width={480} height={360} loading="lazy" decoding="async" />
          <span className="videos__play" aria-hidden="true" />
        </span>
        <span className="videos__name">{video.title}</span>
        {video.date && <span className="videos__date">{t.date(video.date)}</span>}
      </a>
    </li>
  );
}

/**
 * Home section with the channel's latest videos and the stream on air. The prerendered HTML has the heading,
 * the channel link and placeholder cards; the videos arrive from /api/youtube once the page is live. Without
 * them (no key, YouTube down) the placeholders go and the channel link stays.
 */
export default function Videos() {
  const t = useT(dict);
  const feed = useYoutube();
  const loading = feed === undefined;
  const live = feed?.live ?? null;
  const upcoming = feed?.upcoming ?? null;
  const latest = feed?.latest ?? [];

  return (
    <section className="videos" id="videos" aria-labelledby="videos-title">
      <div className="videos__inner">
        <div className="videos__head">
          <div>
            <p className="videos__eyebrow">{t.eyebrow}</p>
            <h2 className="videos__title" id="videos-title">
              {t.title}
            </h2>
            <p className="videos__lead">{t.lead}</p>
          </div>
          <a className="videos__channel" href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label={t.channelLabel}>
            {t.channel} <span aria-hidden="true">↗</span>
          </a>
        </div>

        {live && (
          <a className="videos__live" href={videoUrl(live.id)} target="_blank" rel="noopener noreferrer">
            <span className="videos__live-dot" aria-hidden="true" />
            <span className="videos__live-label">{t.live}</span>
            <span className="videos__live-title">{live.title}</span>
            <span className="videos__live-cta">
              {t.liveWatch} <span aria-hidden="true">↗</span>
            </span>
          </a>
        )}
        {!live && upcoming && (
          <a className="videos__live videos__live--upcoming" href={videoUrl(upcoming.id)} target="_blank" rel="noopener noreferrer">
            <span className="videos__live-label">{t.upcoming(upcoming.date)}</span>
            <span className="videos__live-title">{upcoming.title}</span>
          </a>
        )}

        {loading && (
          <ul className="videos__grid" aria-hidden="true">
            {Array.from({ length: SLOTS }, (_, i) => (
              <li className="videos__item videos__item--placeholder" key={i}>
                <span className="videos__thumb" />
              </li>
            ))}
          </ul>
        )}
        {latest.length > 0 && (
          <ul className="videos__grid">
            {latest.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
