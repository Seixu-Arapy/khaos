# Round 1 — Foundations

Design-system foundation pass: fonts, colors, type scale, the Khaos Vault
dev gallery. See `/dev/vault` (dev-only route, not linked from the real app
nav) for the live reference — everything below renders from real code, not
mockups.

## Open

| code  |    | title                              | started    |
|-------|----|-------------------------------------|------------|
| `TYP` | 🟡 | Type scale (The Chorus)             | 2026-07-13 |
| `PAN` | 🟡 | Pantheon page — visual pass (icons/margin) | 2026-07-13 |
| `VLT` | 🟡 | Vault → "Khaos Vortex" rename        | 2026-07-13 |
| `MUS` | 🟡 | Museum chrome (no sidebar/chat)     | 2026-07-13 |
| `KTX` | 🟡 | KhaoticText on all Vault titles     | 2026-07-13 |
| `CMP` | 🟢 | Component consolidation (Chip)      | 2026-07-13 |

## Resolved

| title                                       | started    | resolved   |
|-----------------------------------------------|------------|------------|
| `--font-serif` not loading                    | 2026-07-13 | 2026-07-13 |
| Uppercase raw token names in gallery          | 2026-07-13 | 2026-07-13 |
| Realistic sample content in gallery           | 2026-07-13 | 2026-07-13 |
| Contrast + hue fixes                          | 2026-07-13 | 2026-07-13 |
| `--font-body` not loading                     | 2026-07-13 | 2026-07-13 |
| Missing nav between Vault pages               | 2026-07-13 | 2026-07-13 |

---

## Details

### `TYP` 🟡 · Type scale (The Chorus)

There was no formal type scale before this round — six text sizes in use
across the app (10/12/14/18/24px) had been picked ad hoc, one at a time.
Checked what they actually line up with: Tailwind's own default scale
(`xs`/`sm`/`lg`/`2xl`, already in use), and that scale's own step-to-step
ratios sit in the 1.11–1.33 range — the same territory as small-integer
musical ratios (Pythagoras: octave 2:1, fifth 3:2, major third 5:4).
Formalized that into five named tokens (`text-label` 10px → `text-caption`
12px → `text-body` 14px → `text-display` 18px → `text-display-lg` 24px)
and built a new Vault chamber, **The Chorus**, presenting it as a string
graph with the ratio between each step labeled. Pushed at
`/dev/vault/chorus`. Waiting on your look before wiring the tokens into
actual component `text-*` classes app-wide — nothing outside the Vault
uses these tokens yet.

### `PAN` 🟡 · Pantheon page — visual pass (reopened)

The mythology naming and page copy (Nyx/Aether/Eros/Pontus/Gaia/
Tartarus/Hypnos, each with a short story) was **approved** as content.
Immediately reopened under the same code for a visual critique of the
page itself, not the naming: dropped the circular icon backgrounds,
enlarged each deity's icon (17px in a 40px circle → bare 40px icon),
moved it into its own left column instead of inline-before-the-name,
and trimmed the shared `Chamber` wrapper's padding (`pt-32/pb-32` →
`pt-20/pb-24`, title margin `mb-16` → `mb-10`) since it affected every
chamber, not just this one. Pushed — awaiting your look at the new
layout. The underlying rename is still display-only (see note below,
carried from the original `PAN` scope): CSS variable names and ~35+
usage sites in `index.css`/components have **not** been touched.

### `VLT` 🟡 · Vault → "Khaos Vortex" rename

Renamed the display name from "The Khaos Vault" to "Khaos Vortex" —
the index page title, the corner placard on every page (now reads
"khaos vortex · N"), and the Chorus page's display-size type sample.
Deliberately **did not** rename the underlying route paths
(`/dev/vault/*`), file names (`VaultIndexPage.tsx`, `vaultUI.tsx`,
`MuseumFrame`), or the `VLT` backlog code itself — renaming those too
would be a much larger, purely-internal change with no user-visible
benefit; happy to do it if you want full consistency, but held off
absent an explicit ask. The chamber system (index + 6 routes,
`Chamber`/`Section`/`Swatch` chrome kit) itself is unchanged from the
original `VLT` restructure.

### `MUS` 🟡 · Museum chrome (no sidebar/chat)

Originally the Vault rendered inside the real app's `AppShell` (task
sidebar + chat panel still visible alongside it), which fought the "look
at this as its own thing" goal. Moved all `/dev/vault*` routes outside
the `AppShell` route in `App.tsx` entirely — full-bleed page, no app
chrome at all. Replaced the old icon-header + "back to vault" link with
a museum/magazine treatment: a single spaced corner placard (small caps,
wide tracking, reads e.g. "khaos vault · III") and one subtle `×` exit
mark, nothing else. Nav model: a chamber's `×` goes up one level to the
Vault index; the index's `×` leaves to the real app (`/`). This also
resolved the "can't find navigation between pages" concern raised right
after — the single consistent exit control *is* the navigation, by
design, not an oversight.

### `KTX` 🟡 · KhaoticText on all Vault titles

Renamed the `ChaoticText` component to `KhaoticText` (file, export, and
both existing usages in `KhaosLogo.tsx` and `ChatPanel.tsx` updated) and
wired it into every title in the Vault — the index page's "The Khaos
Vault" heading, each of the six chamber-row titles on the index, and
each chamber page's own `<h1>` (via the shared `Chamber` component). In
progress — applying to the chamber-row titles now, then rebuilding and
verifying in a real render before push.

### `CMP` 🟢 · Component consolidation (shared Chip primitive)

Parked since early in the round. `EntityChip`, `ChangeBadge`, and the
various badge components in `common/ui.tsx` (`StatusBadge`,
`PriorityBadge`, `FieldBadge`) each hand-roll their own chip/pill
styling independently, rather than sharing one `Chip` primitive with
`tone`/`size` props. Waiting until the color (`PAN`) and type (`TYP`)
tokens are finalized before building this, since the primitive should be
built on the settled tokens, not on values that might still change.

---

### `--font-serif` not loading

The token declared `'Roboto Serif'`, a font never imported (the package
actually installed is Roboto **Slab**). Worse, since no Tailwind class
in the codebase used `font-serif`, Tailwind v4 tree-shook the variable
out of the build entirely — it never reached the browser at all, not
even as a broken value. Fixed by pointing the token at the real
`'Roboto Slab Variable'` and switching the theme block to `@theme
static`, which emits every token as a CSS variable regardless of
whether a class currently uses it (needed so the Foundations gallery
can read them at runtime).

### Uppercase raw token names in gallery

Token/variable names like `--font-serif` and color family names like
`ink` were being rendered through the app's uppercase micro-label
style, which obscures the literal (lowercase) identifier and reads
confusingly next to the real code. Removed uppercase styling
specifically from raw token/variable name labels; left the general
section-header uppercase convention (`FONTS`, `COLORS`, etc.) alone
since that's an intentional, pre-existing app-wide style.

### Realistic sample content in gallery

The font specimens and "text as used today" reference were showing
their own Tailwind class names as the literal sample text (e.g. a
paragraph whose visible content was the string "text-sm font-medium —
task names, primary rows"), which didn't read like real content.
Replaced with task-manager-shaped copy per font (a sprint title, a task
name, a synced-time caption, a duration), then further replaced those
with Khaos-mythology-themed sentences on request, all roughly matched
in character length so the fonts are visually comparable side by side.

### Contrast + hue fixes

Computed real WCAG contrast ratios and HSL hue distances for the full
palette (Python script, checked in-session, not eyeballed). Found two
genuine AA failures — `ink-500` as caption text on the app background
was 2.94:1 (needs 4.5:1), fixed by raising its lightness from 41% to
54% (same hue, `#5b6577`→`#7a8599`) — and one hue-collision risk: the
accent color (`copper`, 27° hue) and the danger color (`rust`, 5° hue)
sat only 22° apart at similar saturation, risky for color-blind users
and quick scanning alike. Moved `rust`'s hue to 345° (`#b5483d`→
`#b43c5a`), landing it 42° from copper instead, while keeping it
unambiguously "red" — arguably a better fit for its new name,
Tartarus, than the original orange-red was.

### `--font-body` not loading

Same category of bug as the serif token: `--font-body` declared
`'Inter'`, but no `@fontsource` package for Inter was ever installed or
imported, so body text was silently falling back to `system-ui` the
entire time. Installed `@fontsource-variable/inter`, added the import
to `index.css`, and pointed the token at the real loaded family name,
`'Inter Variable'`. Confirmed in a real headless-browser render
(`document.fonts.check`) that it now genuinely loads, not just that the
CSS looks right.

### Missing nav between Vault pages

Raised right after the museum-chrome redesign (`MUS`) went in — turned
out to be the redesign itself still mid-flight at the time, not a
separate bug. Resolved once `MUS` landed: the single `×` exit control
plus the index page's chamber list together are the complete
navigation model, by design.

### ChaoticText / KhaoticText font animation not visibly stretching

Root-caused, not guessed at. Two independent bugs stacked: (1) the
`family` prop defaulted to `''` (empty string) rather than `undefined`,
and the code used `family ?? pick(FAMILIES)` — since `??` only falls
back on `null`/`undefined`, not `''`, the random-family selection never
actually ran; every real usage generated the literal invalid CSS class
`font-`, silently inheriting whatever font was already ambient (Inter,
which has no width axis) instead of ever switching to Roboto Flex.
(2) Even after that's fixed, two of the three fonts in the original
random rotation (Roboto Slab, Roboto Mono) turned out to have **no
width axis at all** in their actual font files — confirmed by reading
each package's `metadata.json` directly, not assumed — so two-thirds of
characters could never have stretched regardless of the family bug.
Fixed by dropping the family prop entirely and always using
`font-display` (Roboto Flex Variable, which does have `wght`/`wdth`/
`slnt` axes). Verified with a controlled test before shipping: the same
word at extreme condensed-thin vs. extreme expanded-black classes
measured 100px vs. 271px wide in a real headless render — confirms the
underlying mechanism genuinely works, not just that the CSS classes
look plausible.
