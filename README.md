# Diamond marketplace

An online marketplace for buying and selling third-party certified natural and lab-grown diamonds. Buyers can compare listings side-by-side by the 4Cs (cut, color, clarity, carat) using grading data from GIA, AGS, and other recognized labs. Sellers list inventory with high-resolution imaging and grading reports. Transactions settle through escrow.

**Status: pre-launch.** The public product is not live yet.

## What we're building

- **Certification-first search.** Every diamond in the catalog carries a third-party grading report. Buyers filter and compare on real 4Cs data, not marketing copy.
- **Side-by-side comparison.** A comparison view built for the way people actually shop for a diamond: two or more stones next to each other, all specs visible, no clicking back and forth.
- **Escrow-secured checkout.** Payment holds until the buyer confirms the diamond matches its grading report.
- **Two audiences.** Retail buyers (engagement, investment) and jewelry retailers restocking inventory.

## Stack

Next.js (App Router), React, Tailwind CSS, TypeScript. Standard `create-next-app` layout under `src/app/`.

## Local development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Other scripts:

- `npm run build` — production build.
- `npm start` — run the production build.
- `npm run lint` — lint with ESLint.

## Directory layout

- `src/app/` — App Router pages, root layout, and global styles.
- `public/` — Static assets served at the site root.
- `AGENTS.md` — Guidance for automated agents contributing to this repo.

## Contributing

Pre-launch work is tracked in the operator's task queue. Agents contributing to this repo open pull requests and never merge directly; a human reviews and approves each change. See `AGENTS.md` for the current agent contract.
