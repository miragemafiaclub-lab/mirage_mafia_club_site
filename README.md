# Mirage Mafia Club — сайт клуба

React 19 + TypeScript + Vite, обычный CSS, линтер oxlint.

## Запуск

Нужен Node.js (подойдёт любая актуальная версия).

```bash
npm install        # один раз, ставит зависимости
npm run dev        # сайт на http://localhost:5173
```

Проверки перед тем, как отправлять правки:

```bash
npm run build      # сборка с проверкой типов
npm run lint       # линтер
```

## Где что лежит

| Что | Где |
| --- | --- |
| Секции сайта (Hero, About, Players, Winners, Podium, Schedule) | `src/components/` — у каждой свой `.tsx` и `.css` |
| Игроки клуба (ЧК и КЧК), фото, даты вступления | `src/data/players.ts` |
| Победители месяца | `src/data/winners.ts` |
| Цвета, отступы, шрифты | `src/index.css` (переменные в `:root`) |
| Фотографии | `src/assets/`, `public/winners/` |
| Скрипты обновления данных с iMafia | `scripts/` |

## Обновление данных

Обновляется само: каждый день в 05:00 UTC GitHub Actions (`.github/workflows/sync-data.yml`)
забирает победителей и пьедестал с iMafia/MafGame. Если что-то изменилось и сайт собирается,
бот коммитит в `main`, и Vercel публикует сайт. Запустить вручную: вкладка **Actions** →
**Sync club data** → **Run workflow**. Если запуск упал, GitHub пришлёт письмо, а сайт останется прежним.

Фото с iMafia скрипт сам сжимает в JPG до 1000 px.

Локально, если нужно:

```bash
npm run sync-winners   # победители месяца
npm run sync-podium    # пьедестал победителей
```

Фото игроков, которые заданы вручную (`FIXED_PHOTOS` в `src/data/winners.ts`), синхронизация
менять не должна — не заменяйте их.

## Как вносить правки вдвоём

1. Перед работой: `git pull`.
2. Сделать правки, проверить `npm run build` и `npm run lint`.
3. `git add -A`, `git commit -m "что изменили"`, `git push`.

Чтобы не мешать друг другу, лучше работать в отдельных ветках и сливать их через Pull Request.
