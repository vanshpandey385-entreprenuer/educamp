# Efficht v12 — School Management (feature-based Next.js, frontend + backend)

One Next.js project that holds both the screens (frontend) and the API (backend).

## Run it

```powershell
npm install
copy .env.example .env.local   # then put your DATABASE_URL inside
npm run dev
```

Open http://localhost:3000. Click **Fill demo credentials** on the login page.

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start in development mode                 |
| `npm run build`     | Build for production                      |
| `npm start`         | Run the production build                  |
| `npm run typecheck` | Check TypeScript without building         |
| `npm run format`    | Format all code with Prettier             |

## Folder map

```
src/
  app/            Next.js entry. page.tsx = the app, api/ = backend routes
  routes/         Which page opens for which menu item, one file per role
  features/       One folder per feature (students, fees, attendance, ...)
    <feature>/
      components/   Screens and pieces. ONE component per file
      hooks/        React hooks used by this feature only
      utils/        Plain functions used by this feature only
      config/       Constants used by this feature only
  shared/
    components/   Buttons, cards, modal, pills used by many features
    layout/       Sidebar + top bar (Shell)
    lib/          Date, money, CSV, password helpers
    types/        domain.ts = every data shape (frontend + backend share it)
  store/          Browser-side data store and the fetch wrapper
  config/         Menus per role, page titles, school constants
  server/         BACKEND code. Never imported by components
    config/       Environment settings
    db/           Database drivers (postgres, file, memory) + demo seed data
    auth/         Login check + signed cookie
    data/         Who can see what (scope), who can change what (rules)
    http/         Small helpers for API routes
  styles/         tokens.css = colours. Other CSS files are split by area
docs/ARCHITECTURE.md   How the pieces talk to each other
```

## Where do I change...

| I want to...                         | Edit this                                                     |
| ------------------------------------ | ------------------------------------------------------------- |
| Change colours                       | `src/styles/tokens.css` (one place)                           |
| Add or rename a menu item            | `src/config/navigation.ts`                                    |
| Make a menu item open a page         | `src/routes/<role>Routes.tsx`                                 |
| Change page titles                   | `src/config/pageInfo.ts`                                      |
| Change who may edit what             | `src/server/data/rules.ts`                                    |
| Change who may see what              | `src/server/data/scope.ts`                                    |
| Change demo schools / students       | `src/server/db/seed.ts`                                       |
| Change login wording                 | `src/features/auth/config/loginCopy.ts`                       |
| Change classes, sections, subjects   | `src/config/school.ts`                                        |

## Features added in this version

* **Admin, Classes:** add a new class or section (for example 6 D), with optional teachers per subject.
* **Homework PDFs:** students add a PDF of their written homework. The teacher is notified, opens the file,
  and approves it or marks it not approved with a remark. The student is notified of the decision.

## Design system

The look is teal. All colours live in `src/styles/tokens.css` (light values and dark values side by side),
so changing a colour there changes the whole app in both modes.

| Token          | Colour    | Used for                          |
| -------------- | --------- | --------------------------------- |
| Primary teal   | `#147F7A` | Buttons, active items, charts     |
| Deep teal      | `#105C59` | Sidebar, headings, welcome banner |
| Mint           | `#BDE9DC` | Soft backgrounds, highlights      |
| Lemon          | `#E9D85B` | Small highlights only             |
| Background     | `#F4F8F7` | App background                    |
| Slate          | `#354B50` | Text and labels                   |
| Border         | `#E5ECEA` | Dividers and card borders         |

* **Light / dark mode:** the sun/moon button in the top bar. The choice is remembered in the browser.
* **Collapsible sidebar:** the arrow button next to the logo (desktop). On phones the menu is a drawer.
* **Reusable pieces** (`src/shared/components`): `Card`, `Stat`, `Pill`, `Progress`, `Modal`, `ConfirmDialog`
  (with the `useConfirm` hook), `Pager`, `SearchBox`, `Empty`, `LoadingState`, `ErrorState`, and the charts
  `ColumnChart`, `DonutChart`, `StackedBar` (plain SVG and CSS, no chart library).

## Dashboards (one per role)

Each dashboard is a small component that only draws; the numbers come from a hook that reads the real data.

| Role          | Screen (`src/features/dashboard/components/`) | Numbers come from (`hooks/`) |
| ------------- | ---------------------------------------------- | ----------------------------- |
| Super Admin   | `SuperOverview.tsx` + `super/`                 | `useSuperDashboard.ts`        |
| School Admin  | `AdminOverview.tsx` + `admin/`                 | `useAdminDashboard.ts`        |
| Teacher       | `TeacherOverview.tsx` + `teacher/`             | `useTeacherDashboard.ts`      |
| Student       | `StudentOverview.tsx` + `family/`              | `useFamilyDashboard.ts`       |
| Parent        | `ParentOverview.tsx` + `family/`               | `useFamilyDashboard.ts`       |

There is no "Principal" role in the backend. The Admin dashboard shows the school-wide view.

## Testing tools (`tools/`)

Start the app (`npm run build`, then `npm start -- -p 3241` with `DATABASE_URL` set), then run with `BASE=http://localhost:3241`:

| Command                          | What it checks                                                            |
| -------------------------------- | ------------------------------------------------------------------------- |
| `node tools/api-test.js`         | Backend rules and permissions (run on a fresh database)                   |
| `node tools/smoke.js`            | Every role signs in and opens every page                                  |
| `node tools/smoke-features.js`   | Add class and the homework PDF flow in a real browser                     |
| `node tools/qa-layout.js`        | Every page, every role, phone and desktop, light and dark: errors, overflow |
| `node tools/qa-confirm.js`       | Confirm dialog: cancel keeps, remove deletes, no browser popup            |
| `OUT=/folder node tools/screenshots.js` | Screenshots of key screens                                         |

These need Playwright (`npm i -D playwright`) and are not part of the app itself.

## Database (PostgreSQL / Neon)

Set `DATABASE_URL` and the app saves everything in PostgreSQL. The table is created for you, and the
demo data is added the first time the app starts.

1. Create a free project at https://neon.com and copy its connection string (Dashboard, **Connect**).
2. Local: put it in `.env.local` as `DATABASE_URL=...` and run `npm run dev`.
3. Vercel: Project, **Settings**, **Environment Variables**, add `DATABASE_URL` and `SESSION_SECRET`,
   then redeploy.

Without `DATABASE_URL`: your computer saves to `.data/efficht.json`; Vercel falls back to memory
(data is lost when the server restarts).

Several server copies (Vercel) can share one database: before each request the app checks which
collections changed and downloads only those. If two people edit the same collection at the same
instant, the last save wins.

## Security notes

* Logins are checked on the server. Student and parent passwords are verified. Teacher, admin and
  platform accounts only need to exist (demo behaviour). Add real passwords before real use.
* The login cookie is signed (HMAC) and `httpOnly`. Set a long random `SESSION_SECRET` in production.
* The server only sends each person the rows they may see, and rejects changes they may not make.
* Remove `src/app/api/demo-login` before real use.

## Push to GitHub / Vercel

Your repository root must contain `package.json` and the `src` folder. Then:

```powershell
git add -A
git commit -m "Efficht v12"
git push
```
