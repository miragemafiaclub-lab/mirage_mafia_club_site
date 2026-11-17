# 0002. The language is part of the address: Russian at /, English at /en

Date: 2026-11-17 · Status: accepted

## Context
The RU/EN switch used to keep the choice only in the browser (localStorage), with the same address
for both languages. Search engines could see only one language, and a shared link opened in whatever
language the reader had saved.

## Decision
- Russian pages live at the plain path (`/rating`), English under `/en` (`/en/rating`).
- Every page lists both versions (`hreflang`), Russian is `x-default`.
- The switch opens the same page in the other language and remembers the choice.
- Only the **home page** redirects, and only when the visitor **explicitly** chose English before.

## Why not auto-detect the browser language
Search engine crawlers announce English, so an automatic redirect from `/` to `/en` would hide the
Russian home page from them. A first-time English visitor sees Russian with the EN switch at the top.
