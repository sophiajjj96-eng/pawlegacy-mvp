# PawLegacy MVP (Capstone Expanded Demo)

This is an expanded static web prototype designed to demo all core flows in one place.

## Implemented scope

1. **Home page**
   - Brand landing
   - Stats banner
   - 3-step explanation
   - Care Cost Calculator
2. **Pet Trust Builder**
   - Owner profile inputs
   - Add/remove pets
   - Care instruction inputs
   - AI-style legal draft generation (sample)
   - Live preview with dynamic pet name/budget insertion
   - Care Continuity Plan cards and insurance-gap coverage summary in result panel
   - `.txt` document download
3. **Pricing page**
   - Basic ($149) vs Premium Plus ($9.99/month)
   - FAQ accordion
4. **Legal Review & Notarization Support**
   - State selector + notary method selector
   - Legal readiness checklist
   - Auto-generated readiness report
5. **Caregiver matching**
   - 6 caregiver profile cards
   - Pet-type filter
   - Sorting (rating/experience/price)
   - Contact modal

## Run locally

```bash
cd etc/pawlegacy-mvp
python -m http.server 8081
```

Open: `http://localhost:8081`

## Suggested demo sequence

Home (problem/value) → Trust Builder (AI draft/download) → Pricing (business model) → Caregiver Matching (operational scale)

> This prototype is not legal advice. Attorney review is required before execution.

## How to publish this project to GitHub

```bash
# 1) Create your own repo on GitHub first, then connect remote
git remote add origin https://github.com/<your-username>/<your-repo>.git

# 2) Push current branch
git push -u origin work
```

If your default branch is `main` and you want to push there:

```bash
git checkout -b main
git push -u origin main
``
