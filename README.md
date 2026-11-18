# Mirage Mafia Club — сайт клуба

React 19 + TypeScript + Vite, обычный CSS, линтер oxlint, тесты Vitest.
Каждая страница при сборке сохраняется готовым HTML (пререндер), см. `docs/decisions/`.

## Запуск

Нужен Node.js (подойдёт любая актуальная версия).

```bash
npm install        # один раз, ставит зависимости
npm run dev        # сайт на http://localhost:5173
```

Проверки перед тем, как отправлять правки:

```bash
npm test           # тесты
npm run lint       # линтер
npm run build      # сборка: проверка типов + готовый HTML каждой страницы в dist/
npm run preview    # посмотреть собранный сайт на http://localhost:4173
```

Те же проверки GitHub запускает сам на каждый PR (`.github/workflows/ci.yml`).

## Где что лежит

| Что | Где |
| --- | --- |
| Секции главной (Hero, About, Players, Winners, Podium, Schedule) | `src/components/` — у каждой свой `.tsx` и `.css` |
| Отдельные страницы (игрок, рейтинг, турниры, «первый раз») | `src/pages/` |
| Адреса страниц, RU (`/…`) и EN (`/en/…`) | `src/routes.ts` |
| Заголовки, описания и превью страниц | `src/meta.ts`, тексты в `src/i18n/meta.ts` |
| Адрес сайта (одна настройка) | переменная `SITE_URL`, см. `docs/decisions/0003-site-url.md` |
| Рейтинг, профили iMafia (данные) | `src/data/rating.json`, `src/data/profiles.json` — пишут скрипты, руками не править |
| Почему сделано так, а не иначе | `docs/decisions/` |
| Игроки клуба (ЧК и КЧК), фото, даты вступления | `src/data/players.ts` |
| Победители месяца | `src/data/winners.ts` |
| Цвета, отступы, шрифты | `src/index.css` (переменные в `:root`) |
| Фотографии | `src/assets/`, `public/winners/` |
| Скрипты обновления данных с iMafia | `scripts/` |

## Обновление данных

Обновляется само: каждый день в 05:00 UTC GitHub Actions (`.github/workflows/sync-data.yml`)
забирает рейтинг клуба (все лиги и сезоны, `src/data/rating.json`) и пьедестал с iMafia/MafGame.
Игрок месяца — первое место Month Rating в первый день после конца месяца; записывается в
`src/data/winners.json` один раз и больше не меняется (поправить можно вручную в этом файле). Если что-то изменилось и сайт собирается,
бот коммитит в `main`, и Vercel публикует сайт. Запустить вручную: вкладка **Actions** →
**Sync club data** → **Run workflow**. Если запуск упал, GitHub пришлёт письмо, а сайт останется прежним.

Фото с iMafia скрипт сам сжимает в JPG до 1000 px.

Локально, если нужно:

```bash
npm run sync-rating    # рейтинг клуба и игрок месяца
npm run sync-profiles  # статистика из профилей iMafia (до 25 профилей за запуск)
npm run sync-podium    # пьедестал победителей
```

Фото игроков, которые заданы вручную (`FIXED_PHOTOS` в `src/data/winners.ts`), синхронизация
менять не должна — не заменяйте их.

## Как вносить правки вдвоём

1. Перед работой: `git pull`.
2. Сделать правки, проверить `npm run build` и `npm run lint`.
3. `git add -A`, `git commit -m "что изменили"`, `git push`.

Чтобы не мешать друг другу, лучше работать в отдельных ветках и сливать их через Pull Request.
