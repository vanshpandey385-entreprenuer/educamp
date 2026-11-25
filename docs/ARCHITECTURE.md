# Architecture

## The big picture

```
Browser                                  Server (same Next.js project)
-------                                  -----------------------------
Screen (features/*/components)
   | useAppStore()
Store (store/AppStore.tsx)  --fetch-->   app/api/*/route.ts      (thin: read request, call, reply)
                                              |
                                         server/auth, server/data  (the rules)
                                              |
                                         server/db  (driver: memory | file | yours)
```

Rule: **components never import from `server/`**, and **`server/` never imports from `features/`**.
Both sides share only `shared/types/domain.ts`.

## Request flow: "teacher marks a student absent"

1. `Register.tsx` calls `update(d => ({ attendance: ... }))`.
2. The store changes the screen right away (no waiting), remembers `attendance` as changed.
3. After 400 ms of quiet the store sends `PATCH /api/data { patch: { attendance } }`.
4. `app/api/data/route.ts` reads the signed cookie, then calls `applyPatch`.
5. `applyPatch` checks `rules.ts` (may a Teacher change `attendance`? yes) and replaces ONLY that
   school's rows. Other schools are never touched.
6. `saveDb()` writes through the driver. If the server refuses, the store reloads the real data and shows a message.

## API

| Route                    | Method | Purpose                                         |
| ------------------------ | ------ | ----------------------------------------------- |
| `/api/schools`           | GET    | School list for the login page (public)         |
| `/api/auth/login`        | POST   | Check login, set cookie                         |
| `/api/auth/logout`       | POST   | Clear cookie                                    |
| `/api/auth/session`      | GET    | Who is signed in                                |
| `/api/data`              | GET    | Everything this person may see                  |
| `/api/data`              | PATCH  | Save changed collections                        |
| `/api/data/reset`        | POST   | Reset demo data (platform admin only)           |
| `/api/demo-login`        | GET    | Demo helper. Delete before real use             |

## Homework PDFs

1. Student picks a PDF. `POST /api/files` checks it (PDF only, up to 4 MB, starts with `%PDF-`) and stores it
   through `server/files` (PostgreSQL table `uploaded_files`, a local folder, or memory).
2. The student's screen saves a **submission** (`submissions` collection) that points to the file id.
3. `server/data/submissionRules.ts` decides what each role may change:
   - student: add or replace their PDF (not after it is approved) and mark the decision as seen;
   - teacher: only the decision (status and remark), and only for homework they set or their own class;
   - the server fills in names, dates and status, so they cannot be forged.
4. Notifications are worked out from the submissions (`features/homework/hooks/useHomeworkAlerts.ts`):
   a teacher sees PDFs waiting for review, a student sees decisions not yet opened.
5. `GET /api/files/<id>` opens the PDF for the student who owns it and for staff of the same school.

## Classes

`classes` holds sections the admin adds (for example "6 D"). `features/classes/hooks/useClasses.ts`
returns the built-in classes plus these. Screens use that hook instead of the constant `CLASSES`.
`classIndex()` in `config/school.ts` gives every class a stable number for the timetable.

## Dashboards and charts

Every role has its own dashboard in `src/features/dashboard/`. A dashboard has three layers:

1. A hook in `hooks/` reads `useAppStore().data` and works out every number (no JSX).
2. Small card components in a folder next to the dashboard draw one card each.
3. The dashboard file (for example `AdminOverview.tsx`) calls the hook once and places the cards.

The server already limits `data` to what the signed-in person may see, so a dashboard never needs its own API.
Charts live in `src/shared/components/charts/` and use only colour tokens, so they follow light and dark mode.

## Theme

`tokens.css` defines the colours twice: once for `:root` and once for `:root[data-theme="dark"]`.
`src/shared/lib/theme.ts` reads and saves the choice (localStorage, wrapped in try/catch) and a small script
in `src/app/layout.tsx` sets `data-theme` before the page paints, so there is no light flash in dark mode.

## How to add a new feature (example: "Canteen")

1. Add the data shape to `shared/types/domain.ts` and an empty list to `store/emptyData.ts`.
2. Create `features/canteen/components/CanteenView.tsx`.
3. Add a menu entry in `config/navigation.ts` and a title in `config/pageInfo.ts`.
4. Add `canteen: <CanteenView />` to the role route files in `routes/`.
5. Allow roles to change it in `server/data/rules.ts`.
6. Tell `server/data/scope.ts` and `server/data/applyPatch.ts` how it belongs to a school.
7. Add seed rows in `server/db/seed.ts` (optional).

## The database

`server/db/index.ts` picks a driver. All drivers implement `DbDriver` (`server/db/types.ts`).

| Driver     | File                  | Used when                                  |
| ---------- | --------------------- | ------------------------------------------ |
| PostgreSQL | `postgresDriver.ts`   | `DATABASE_URL` is set (Neon, Supabase...)  |
| File       | `fileDriver.ts`       | Local, no `DATABASE_URL`                   |
| Memory     | `memoryDriver.ts`     | Vercel without `DATABASE_URL`, or tests    |

PostgreSQL keeps one table, `app_state`, with one row per collection (`students`, `fees`, ...) and a
`version` number. `save()` writes only collections that changed. `refresh()` runs before each request
and downloads only collections whose version changed, so several server copies stay in step.

A bigger product would replace this with one table per record type and real queries. The shape of
the rest of the app (API routes, rules, scope) would not change.

## Debugging tips

* Network tab: look at `/api/data` requests. A 403 message says exactly which rule refused.
* Server logs: errors thrown in `server/` show in the terminal running `npm run dev`.
* A screen is wrong? Open its file in `features/<name>/components/`; it has only that screen's code.
* A rule is wrong? `server/data/rules.ts` (write) or `scope.ts` (read).
