# Diamond marketplace

An online marketplace for buying and selling third-party certified natural and lab-grown diamonds. Buyers compare listings side-by-side by the 4Cs (cut, color, clarity, carat) using grading data from GIA, AGS, and other recognized labs. Sellers list inventory with high-resolution imaging and grading reports. Transactions settle through escrow.

**Status: pre-launch.** The public product is not live yet.

## What we're building

- **Certification-first search.** Every diamond in the catalog carries a third-party grading report. Buyers filter and compare on real 4Cs data, not marketing copy.
- **Side-by-side comparison.** A comparison view built for the way people actually shop for a diamond: two or more stones next to each other, all specs visible, no clicking back and forth.
- **Escrow-secured checkout.** Payment holds until the buyer confirms the diamond matches its grading report.
- **Two audiences.** Retail buyers (engagement, investment) and jewelry retailers restocking inventory.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript 5

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
