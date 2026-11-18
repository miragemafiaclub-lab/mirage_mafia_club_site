// Draws the 1080×1920 story card on a canvas, in the site's colours and fonts: logo and month on top,
// the photo in an orange ring, "N место в рейтинге месяца", the nick and three numbers.
// Pure drawing: the texts come ready-made from storyCardData.ts.

export type StoryCardData = {
  nick: string;
  photo: string;
  logo: string;
  /** Top right, e.g. "Октябрь 2026"; "" for none. */
  period: string;
  /** Under the photo, e.g. "4 место в рейтинге месяца"; "" when there is no place to show. */
  headline: string;
  /** Up to three numbers along the bottom. */
  stats: { label: string; value: string }[];
  footer: string;
};

export const STORY_W = 1080;
export const STORY_H = 1920;
const ORANGE = "#f2600c";
const BG = "#0c0a09";
const DISPLAY = '"Oswald", "Arial Narrow", sans-serif';
const BODY = '"Golos Text", -apple-system, sans-serif';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image ${src}`));
    img.src = src;
  });
}

/** Draws `img` to fill the box, cropped from the centre (top-weighted, where faces are). */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) * 0.25, sw, sh, x, y, w, h);
}

/** Shrinks the font until `text` fits `maxWidth`. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: string, family: string, size: number, maxWidth: number) {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${family}`;
    s -= 4;
  } while (ctx.measureText(text).width > maxWidth && s > 24);
}

/** Letter spacing where the browser's canvas has it (Chrome, Edge, Safari 17+); plain text elsewhere. */
function spacing(ctx: CanvasRenderingContext2D, value: string) {
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = value;
}

/** Splits `text` into at most `maxLines` centred lines no wider than `maxWidth`. */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) return [...lines.slice(0, maxLines - 1), lines.slice(maxLines - 1).join(" ")];
  return lines;
}

export async function drawStoryCard(canvas: HTMLCanvasElement, data: StoryCardData): Promise<void> {
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  // The card uses the site's fonts; wait until the browser has them, or the canvas falls back silently.
  await Promise.all([
    document.fonts.load(`600 200px ${DISPLAY}`),
    document.fonts.load(`600 40px ${BODY}`),
    document.fonts.load(`400 40px ${BODY}`),
  ]).catch(() => undefined);
  const [photo, logo] = await Promise.all([loadImage(data.photo), loadImage(data.logo)]);
  const cx = STORY_W / 2;

  // Background: near-black with an orange glow behind the photo.
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, STORY_W, STORY_H);
  const glow = ctx.createRadialGradient(cx, 720, 0, cx, 720, 980);
  glow.addColorStop(0, "rgba(242, 96, 12, 0.38)");
  glow.addColorStop(0.55, "rgba(242, 96, 12, 0.1)");
  glow.addColorStop(1, "rgba(242, 96, 12, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  // Top: logo and club name on the left, the month on the right.
  ctx.save();
  ctx.beginPath();
  ctx.arc(130, 140, 50, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(logo, 80, 90, 100, 100);
  ctx.restore();
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = `600 30px ${BODY}`;
  spacing(ctx, "5px");
  ctx.textAlign = "left";
  ctx.fillText("MIRAGE MAFIA CLUB", 204, 142);
  if (data.period) {
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.fillText(data.period.toUpperCase(), STORY_W - 80, 142);
  }
  spacing(ctx, "0px");

  // Photo in an orange ring, with a soft halo.
  const r = 360;
  const cy = 720;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 34, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(242, 96, 12, 0.16)";
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#1a1612";
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  drawCover(ctx, photo, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.lineWidth = 12;
  ctx.strokeStyle = ORANGE;
  ctx.stroke();

  // Headline: the place, in orange capitals.
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = cy + r + 150;
  if (data.headline) {
    ctx.fillStyle = ORANGE;
    ctx.font = `600 66px ${DISPLAY}`;
    spacing(ctx, "4px");
    const lines = wrapLines(ctx, data.headline.toUpperCase(), STORY_W - 200, 2);
    lines.forEach((line, i) => ctx.fillText(line, cx, y + i * 80));
    spacing(ctx, "0px");
    y += (lines.length - 1) * 80 + 170;
  } else {
    y += 60;
  }

  // Nick.
  ctx.fillStyle = "#ffffff";
  fitFont(ctx, data.nick.toUpperCase(), "600", DISPLAY, 150, STORY_W - 160);
  ctx.fillText(data.nick.toUpperCase(), cx, y);

  // Three numbers.
  if (data.stats.length) {
    const top = Math.max(y + 190, 1620);
    const colW = (STORY_W - 160) / data.stats.length;
    data.stats.forEach((stat, i) => {
      const x = 80 + colW * i + colW / 2;
      ctx.fillStyle = "#ffffff";
      ctx.font = `600 96px ${DISPLAY}`;
      ctx.fillText(stat.value, x, top);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = `600 28px ${BODY}`;
      spacing(ctx, "4px");
      ctx.fillText(stat.label.toUpperCase(), x, top + 56);
      spacing(ctx, "0px");
    });
  }

  // Footer: the site's address under a short orange line.
  ctx.fillStyle = ORANGE;
  ctx.fillRect(cx - 40, STORY_H - 112, 80, 4);
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = `400 30px ${BODY}`;
  ctx.textBaseline = "middle";
  ctx.fillText(data.footer, cx, STORY_H - 66);
}
