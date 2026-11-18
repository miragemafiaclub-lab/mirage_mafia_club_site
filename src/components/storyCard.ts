// Draws the 1080×1920 story card on a canvas, in the site's colours and fonts.
// Pure drawing: the texts come ready-made from StoryCardButton.

export type StoryCardData = {
  nick: string;
  photo: string;
  logo: string;
  /** Big number, e.g. "№3", or "" when there is no place to show. */
  place: string;
  /** Under the number, e.g. "в рейтинге · Октябрь 2026". */
  placeLabel: string;
  stats: { label: string; value: string }[];
  footer: string;
};

export const STORY_W = 1080;
export const STORY_H = 1920;
const ORANGE = "#f2600c";
const BG = "#0a0a0a";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image ${src}`));
    img.src = src;
  });
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
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

export async function drawStoryCard(canvas: HTMLCanvasElement, data: StoryCardData): Promise<void> {
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  // The card uses the site's fonts; wait until the browser has them, or the canvas falls back silently.
  await Promise.all([
    document.fonts.load('600 200px "Oswald"'),
    document.fonts.load('600 40px "Golos Text"'),
    document.fonts.load('400 40px "Golos Text"'),
  ]).catch(() => undefined);
  const [photo, logo] = await Promise.all([loadImage(data.photo), loadImage(data.logo)]);

  // Background: near-black with the site's orange glow.
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, STORY_W, STORY_H);
  const glow = ctx.createRadialGradient(STORY_W, 0, 0, STORY_W, 0, 1300);
  glow.addColorStop(0, "rgba(242, 96, 12, 0.35)");
  glow.addColorStop(1, "rgba(242, 96, 12, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  // Header: logo and club name.
  ctx.save();
  ctx.beginPath();
  ctx.arc(130, 150, 60, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(logo, 70, 90, 120, 120);
  ctx.restore();
  ctx.fillStyle = "#ffffff";
  ctx.font = '600 44px "Oswald", sans-serif';
  ctx.textBaseline = "middle";
  ctx.fillText("MIRAGE MAFIA CLUB", 220, 150);

  // Photo.
  const px = 120;
  const py = 270;
  const pw = STORY_W - 240;
  const ph = 900;
  ctx.save();
  roundedRect(ctx, px, py, pw, ph, 32);
  ctx.clip();
  drawCover(ctx, photo, px, py, pw, ph);
  const shade = ctx.createLinearGradient(0, py + ph * 0.55, 0, py + ph);
  shade.addColorStop(0, "rgba(10, 10, 10, 0)");
  shade.addColorStop(1, "rgba(10, 10, 10, 0.85)");
  ctx.fillStyle = shade;
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 2;
  roundedRect(ctx, px, py, pw, ph, 32);
  ctx.stroke();

  // Nick over the bottom of the photo.
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  fitFont(ctx, data.nick.toUpperCase(), "600", '"Oswald", sans-serif', 150, pw - 80);
  ctx.fillText(data.nick.toUpperCase(), px + 40, py + ph - 50);

  // Place: the headline.
  let y = py + ph + 70;
  if (data.place) {
    ctx.fillStyle = ORANGE;
    ctx.font = '600 230px "Oswald", sans-serif';
    ctx.textBaseline = "top";
    ctx.fillText(data.place, px, y);
    ctx.fillStyle = "#ffffff";
    fitFont(ctx, data.placeLabel, "600", '"Golos Text", sans-serif', 52, pw);
    ctx.fillText(data.placeLabel, px, y + 260);
    y += 360;
  }

  // Stats row.
  ctx.textBaseline = "top";
  const colW = pw / Math.max(data.stats.length, 1);
  data.stats.forEach((stat, i) => {
    const x = px + i * colW;
    ctx.fillStyle = "#ffffff";
    ctx.font = '600 84px "Oswald", sans-serif';
    ctx.fillText(stat.value, x, y);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = '400 34px "Golos Text", sans-serif';
    ctx.fillText(stat.label, x, y + 100);
  });

  // Footer.
  ctx.fillStyle = ORANGE;
  ctx.fillRect(px, STORY_H - 140, 80, 4);
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = '400 36px "Golos Text", sans-serif';
  ctx.textBaseline = "middle";
  ctx.fillText(data.footer, px + 110, STORY_H - 138);
}
