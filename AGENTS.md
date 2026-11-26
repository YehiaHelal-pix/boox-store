# Boox Store — Agent Instructions


## Project
Boox Store ("ملك التفاح") — iPhone, accessories, and repair shop.
Stack: Next.js 15, React 19, TypeScript, Tailwind v4, Supabase, Zustand, framer-motion 11.


## Workflow (non-negotiable)
- Work ONLY on branch `boox-store-2`. Never commit to `main`.
- Every change goes through a pull request to `main`. Never merge without the owner's explicit approval.
- CI must pass on every PR: `npm ci`, `npx tsc --noEmit`, `npm run build`. Branch protection requires a green `build` check.
- One change at a time. Verify each change (build + typecheck) and report the command and its output. Never claim tests pass without running them.
- Never commit secrets or `.env` files. Never invent data.


## Design (locked)
- Fonts: Alexandria 800/900 headlines, IBM Plex Sans Arabic 400/500/700 body.
- Colors: midnight #050507, titanium #F5F5F7, apple red #FF3B30 (primary CTA and prices only).
- Motion: transform/opacity only, max 2 simultaneous animations, respect `prefers-reduced-motion`.
- Arabic + English, RTL/LTR. Language switcher is a letter icon: «ع» for Arabic, «E» for English.
- Dark + light themes with a toggle.


## Product rules
- No fake data: no invented prices, no fake ratings or reviews. Prices come from the owner only.
- Every iPhone model with all its official colors; one page per model; unavailable variants stay visible, greyed, with a WhatsApp inquiry CTA — never hidden.
- iPhone 18 Pro / 18 Pro Max only (base iPhone 18 is "coming soon", no colors invented).
- Categories are open: the admin can list any product type (laptops, iPads, Apple displays, AirPods, cases, ...). Photos and descriptions are editable from the admin dashboard.
- Each model page has a «جرابات الهاتف» (phone cases) tab that opens the cases page for that model — cases are linked to their model in the admin dashboard.
- iPhone product photos: PR #12 (branch `add/iphone-official-photos`) adds 46 photos under `public/images/iphone-official/` — merge it into `boox-store-2` before work that needs the photos.


## Payments
- Manual transfer only: Vodafone Cash + InstaPay to 01113614021. Customer enters the transaction reference + uploads a screenshot. Order status is "waiting for payment confirmation" — never "paid" before the owner confirms.


## Admin (separate)
- The admin dashboard is a SEPARATE password-protected site, NOT part of this store. Do not add admin routes or pages inside this repo's store app, and do not add any admin link anywhere in the store UI (navbar, footer, anywhere).
- The admin dashboard controls the visibility of everything per product: price, discount, offer, and any other field — each toggled from the dashboard. A hidden price is quoted via the admin-reply loop, never shown on the site.


## Build lesson (do not reintroduce)
- The build runs with NO Supabase env vars, so it must pass without them. Never create a Supabase client during render/prerender — only inside event handlers, effects, or per-request server code. Admin pages that fetch live data must be `force-dynamic`.


## Notes
- `اقساط/` is a separate standalone app with its own config; it is excluded from this repo's root typecheck — do not include it in store builds.


## Experience (locked)
- Everything is dynamic and live: updates reach the customer on screen without refresh where it matters (replies, availability, request status).
- Easy and uncomplicated for the customer: few steps, one clear action per screen, plain language, no jargon, no dead ends. If a flow takes more than 3 steps, simplify it.


## Comments
- Customers can comment on products. For each comment the customer chooses, like Facebook, to post it anonymously or with their real identity.

## Tax (Egyptian tax system)
- Each product carries tax status, managed in the admin dashboard and shown on the product page per the admin's choice: whether the phone has tax, whether the tax value is displayed, and whether it is tax-exempt.
- Never invent tax rates or rules — the admin enters the tax value; the site only displays what the admin sets.
