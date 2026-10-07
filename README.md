# Kazi Midul Hossen — Portfolio

Single-page portfolio built as one continuous 3D world. React 19 + TypeScript, Vite 8, Tailwind CSS v4,
Three.js via React Three Fiber + drei, Motion for the 2D UI. Deployed on Netlify.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typechecks, then builds to dist/
npm run preview  # serve the production build locally
npm run lint     # oxlint
```

Append `?quality=high|medium|low|off` to the URL to force a rendering tier when testing.

---

## Editing your content

**All the copy lives in `src/data/`. You should never need to touch a component to update the site.**

| File | What's in it |
|---|---|
| `src/data/profile.ts` | Name, headline, email, phone, location, **social links**, About copy, the four pillars, count-up stats |
| `src/data/experience.ts` | Roles, dates, milestone year, collapsed-view chips, and the full grouped bullets |
| `src/data/projects.ts` | The 8 projects — blurb, filter tags, tech, the `flow` chain drawn in 3D, detail bullets |
| `src/data/stack.ts` | Technology galaxy clusters, one-line descriptions, and relationship links |
| `src/data/heroNetwork.ts` | Hero 3D nodes (position, tooltip text) and the data flows between them |
| `src/data/education.ts` | Degrees and the ICPC result |
| `src/data/contact.ts` | Contact channels, derived from `profile.ts` |
| `src/data/sections.ts` | Section order, nav labels and the story-stage captions |

### 👉 First thing to do: add your GitHub

In `src/data/profile.ts`, fill in the GitHub `url` and `handle`. **Any social with an empty `url` is skipped
everywhere** — once it's set, GitHub appears in the contact console *and* as a destination node around the 3D
communication terminal.

### Adding a project

Append to the array in `src/data/projects.ts`. `tags` drive the filters (`data | backend | cloud | automation`);
`flow` is the ordered chain the 3D universe draws from the panel through its technologies — every entry must
also be in `tech`. The 3D layout re-flows automatically for any number of projects.

### Replacing the resume

Drop the new PDF in `public/` and point `profile.resumePath` at it. The current one is
`public/Kazi-Midul-Hossen-Resume.pdf`.

### Colours

The 2D palette is the `@theme` block at the top of `src/index.css`; the 3D palette is `C` in
`src/three/shared.ts`. Keep them in step.

---

## Deploying to Netlify

`netlify.toml` already declares the build command, publish directory, Node version and the SPA
redirect, so there is **nothing to configure in the Netlify dashboard**.

**Option A — connect a Git repo (recommended, gives you deploy-on-push):**

```bash
git init
git add -A
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then on Netlify: **Add new site → Import an existing project →** pick the repo → **Deploy**.

> Commit `package-lock.json` together with any `package.json` change. Netlify builds with `npm ci`,
> which fails outright if the two are out of sync — it's the most common build failure for this stack.

**Option B — deploy the folder directly, no Git:**

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

### Custom domain
Netlify → **Domain management → Add a domain**, then point your registrar's DNS at Netlify.
HTTPS is provisioned automatically.

---

## How the 3D works

- **One canvas, one world.** `src/three/World.tsx` mounts a single fixed WebGL canvas behind the HTML. Each
  section is a *station* placed along −Z (`src/three/layout.ts`); the camera flies between them.
- **Scroll drives the camera.** `src/lib/scroll.ts` turns scroll position into a fractional station value;
  `CameraRig.tsx` maps it through keyframes with damping, plus pointer parallax. The Experience rail keys off
  the real card positions (`data-rail`), so expanding a role re-times the flight.
- **Stations only render near the camera** (`isStationLive`); neighbours stay faintly visible in the fog.
- **Lazy + adaptive.** The 3D chunk loads after first paint. `src/lib/device.ts` picks a tier (particle counts,
  DPR); a runtime FPS watchdog lowers DPR and, if frames stay slow (e.g. software WebGL), retires the 3D for the
  static backdrop.
- **Reduced motion:** no flight, parallax, rotation or custom cursor — the camera cuts between sections and the
  canvas only redraws on change. All content is real HTML regardless.
- Pointer events reach the canvas through `#root`; anything matching `a, button, [data-block-3d]` blocks 3D
  hover so UI never triggers objects behind it.

## Notes on the stack

- **No `tailwind.config.js`** — Tailwind v4 doesn't use one. Theme tokens are the `@theme` block in
  `src/index.css`.
- **Dark only** — the design is built around the dark 3D scene.
- **Motion** is the `motion` package (formerly Framer Motion), imported from `motion/react`.
- **3D labels** use the JetBrains Mono `.woff` from `@fontsource` (troika can't read woff2), so no font is
  fetched from a CDN at runtime.
- **Icons**: `lucide-react` for UI glyphs, `react-icons/fa6` for GitHub and LinkedIn.
