# Kazi Midul Hossen — Portfolio

Single-page portfolio site. React 19 + TypeScript, Vite 8, Tailwind CSS v4, deployed on Netlify.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typechecks, then builds to dist/
npm run preview  # serve the production build locally
npm run lint     # oxlint
```

---

## Editing your content

**All the copy lives in `src/data/`. You should never need to touch a component to update the site.**

| File | What's in it |
|---|---|
| `src/data/profile.ts` | Name, title, tagline, email, phone, location, **social links**, About paragraphs, the stat strip |
| `src/data/skills.ts` | Skill groups and their icons |
| `src/data/experience.ts` | Jobs, dates, and bullets (grouped by theme) |
| `src/data/projects.ts` | The 8 projects — name, blurb, tech tags, category, detail bullets |
| `src/data/education.ts` | Degrees and the ICPC result |
| `src/data/sections.ts` | Section order and nav labels |

### 👉 First thing to do: add your GitHub and LinkedIn

In `src/data/profile.ts`:

```ts
socials: [
  { label: 'GitHub',   url: 'https://github.com/your-username',      handle: '@your-username' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/your-profile',  handle: 'your-profile' },
],
```

They're currently empty strings. **Any social with an empty `url` is skipped everywhere on the site**, so
nothing looks broken until you fill them in — the icons just appear once you do.

### Adding a project

Append to the array in `src/data/projects.ts`. `category` must be one of `GCP | AWS | Azure | Backend`
(the filter pills and their counts update on their own):

```ts
{
  id: 'unique-slug',
  name: 'Project Name',
  client: 'Client Name',        // optional
  blurb: 'One sentence shown on the card.',
  category: 'GCP',
  tech: ['BigQuery', 'dbt'],    // first 4 show on the card, rest collapse into "+N"
  bullets: ['What you did.'],   // shown in the modal
}
```

To add a new category, add it to `ProjectCategory` in `src/data/types.ts`, to `projectCategories` in
`projects.ts`, and give it a colour in `src/data/categoryStyles.ts`.

### Replacing the resume

Drop the new PDF in `public/` and point `profile.resumePath` at it. The current one is
`public/Kazi-Midul-Hossen-Resume.pdf`.

### Replacing the photo

Replace `src/assets/profile.png`. It's a square image with a transparent circular mask — any square
image works, it's clipped to a circle in the hero.

### Colours and fonts

Everything is in the `@theme` block at the top of `src/index.css`. Changing `--color-brand` there
re-tints the whole site — the gradients, chips, links, buttons and the pipeline animation all read
from it.

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

## Notes on the stack

- **No `tailwind.config.js`** — Tailwind v4 doesn't use one. Theme tokens are the `@theme` block in
  `src/index.css`; dark mode is the `@custom-variant dark` line just above it.
- **Dark mode** is class-based on `<html>`. The small inline script in `index.html` resolves the theme
  before first paint so the page never flashes light. Dark is the default.
- **Motion** is the `motion` package (formerly Framer Motion), imported from `motion/react`.
- **Reduced motion** is respected: the CSS block at the bottom of `index.css` neutralises transitions,
  and `PipelineGraph` / `Reveal` check `useReducedMotion()` and drop their animated nodes entirely
  (the pipeline uses SMIL, which CSS cannot stop).
- **Icons** come from three places because no single set covers everything — `lucide-react` for UI
  glyphs, `react-icons/si` for most brand logos, and `react-icons/fa6` + `react-icons/vsc` for AWS,
  Azure, GitHub and LinkedIn, which Simple Icons dropped. dbt, OpenAI and the SQL glyph are
  hand-drawn in `src/components/ui/BrandIcons.tsx`.
