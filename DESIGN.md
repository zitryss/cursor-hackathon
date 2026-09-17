---
version: alpha
name: Taxfix-inspired Interface System
description: A welcoming, confident interface with lime and forest green, warm light surfaces, bold condensed headings, clear sans-serif reading text, pill actions, rounded panels, and generous space.

colors:
  primary: "#ADEE68"
  on-primary: "#154618"
  primary-hover: "#CEF5A4"
  forest: "#154618"
  on-forest: "#FFFFFF"
  green: "#36893B"
  canvas: "#FDF8F2"
  surface: "#FFFFFF"
  ink: "#0C0B0A"
  muted-ink: "#625C55"
  border: "#EAE0D7"
  input-border: "#857D73"
  link: "#154618"
  focus: "#154618"
  tint-lime: "#CEF5A4"
  tint-lime-soft: "#ECFFC7"
  tint-lilac: "#F6EBFE"
  tint-peach: "#FFEFD3"
  tint-blue: "#E8F0FF"
  tint-coral: "#FEEBE7"
  accent-lilac: "#DBB9F3"
  accent-peach: "#F8C677"
  accent-blue: "#B6C5F3"
  accent-coral: "#F5A894"
  success: "#154618"
  on-success: "#FFFFFF"
  warning: "#704600"
  error: "#B42318"
  error-surface: "#FEEBE7"

typography:
  display:
    fontFamily: '"ABC Rom Condensed Heavy", "Arial Narrow", "Helvetica Neue", Arial, sans-serif'
    fontSize: 48px
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: -0.02em
  heading-1:
    fontFamily: '"ABC Rom Condensed Heavy", "Arial Narrow", "Helvetica Neue", Arial, sans-serif'
    fontSize: 36px
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: -0.02em
  heading-2:
    fontFamily: '"ABC Rom", "Helvetica Neue", Arial, sans-serif'
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em
  heading-3:
    fontFamily: '"ABC Rom", "Helvetica Neue", Arial, sans-serif'
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  body:
    fontFamily: '"ABC Rom", "Helvetica Neue", Arial, sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: '"ABC Rom", "Helvetica Neue", Arial, sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: '"ABC Rom", "Helvetica Neue", Arial, sans-serif'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button:
    fontFamily: '"ABC Rom", "Helvetica Neue", Arial, sans-serif'
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0
  link:
    fontFamily: '"ABC Rom", "Helvetica Neue", Arial, sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  ui-label:
    fontFamily: '"ABC Rom", "Helvetica Neue", Arial, sans-serif'
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  none: 0px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section-sm: 48px
  section: 64px
  section-lg: 96px
  touch: 48px

components:
  page:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.lg}"
  header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.ui-label}"
    padding: "{spacing.lg} {spacing.xl}"
  announcement:
    backgroundColor: "{colors.tint-lime}"
    textColor: "{colors.forest}"
    typography: "{typography.body}"
    padding: "{spacing.lg} {spacing.xl}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  feature-panel:
    backgroundColor: "{colors.tint-lime-soft}"
    textColor: "{colors.forest}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xxl}"
  badge:
    backgroundColor: "{colors.tint-lime}"
    textColor: "{colors.forest}"
    typography: "{typography.ui-label}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm} {spacing.md}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    minHeight: "{spacing.touch}"
    padding: "{spacing.md} {spacing.xl}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.forest}"
    borderColor: "{colors.forest}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    minHeight: "{spacing.touch}"
    padding: "{spacing.md} {spacing.xl}"
  text-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.input-border}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    minHeight: "{spacing.touch}"
    padding: "{spacing.md} {spacing.lg}"
  choice-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.input-border}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  link:
    textColor: "{colors.link}"
    typography: "{typography.link}"
  callout:
    backgroundColor: "{colors.tint-lime-soft}"
    textColor: "{colors.forest}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  error-message:
    backgroundColor: "{colors.error-surface}"
    textColor: "{colors.error}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md} {spacing.lg}"
  data-table-cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    padding: "{spacing.lg}"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  empty-state:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
  footer:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-forest}"
    typography: "{typography.body-sm}"
    padding: "{spacing.section-sm} {spacing.xl}"
---

# Taxfix-inspired Interface System

## Reference and scope

Use the current [Taxfix German website](https://taxfix.de/) as the visual reference,
reviewed on 17 September 2026. Its public page styles provide the lime `#ADEE68`,
forest `#154618`, cream `#FDF8F2`, neutral and pastel palette below, plus the ABC Rom
and ABC Rom Condensed Heavy font families. The visible design combines expressive
condensed headlines, pill actions, rounded content blocks, natural photography,
and spacious light sections.

This document adapts that direction for a 16:9 pitch deck; the phone is a mock
inside the slide, not the primary layout. It is
not an official Taxfix brand manual. Type sizes, spacing, interaction states,
muted text, input borders, warning, and error colors are project choices. The
front matter defines the target tokens; it does not describe the current CSS.
Implementing this direction in application code is a separate change.

## Design intent

Make complicated tasks feel approachable and manageable. Each screen should offer
a clear heading, a short explanation, and an obvious next step. Balance confident
headlines with calm reading text and generous space. Green provides recognition
and emphasis; white and cream give content room to breathe.

- Lead with the user's task or benefit in plain, friendly language.
- Use one dominant action per task area and quieter secondary actions.
- Group related content through space, light fills, and rounded panels.
- Keep decoration subordinate to useful content and progress.
- Preserve this application's identity and domain when borrowing the visual style.

## Color system

| Role | Token | Use |
| --- | --- | --- |
| Primary | `{colors.primary}` | Main action, selected emphasis |
| On primary | `{colors.on-primary}` | Text and icons on lime |
| Forest | `{colors.forest}` | Brand detail, links, strong contrast sections |
| On forest | `{colors.on-forest}` | Text on forest surfaces |
| Canvas | `{colors.canvas}` | Warm page background |
| Surface | `{colors.surface}` | Header, cards, inputs, dialogs |
| Ink | `{colors.ink}` | Headings and reading text |
| Muted ink | `{colors.muted-ink}` | Supporting text and metadata |
| Border | `{colors.border}` | Quiet dividers and decorative card edges |
| Input border | `{colors.input-border}` | Visible control boundaries |
| Focus | `{colors.focus}` | Focus outline on light surfaces |

Use lime with forest or near-black text, never white labels. Use white text on
forest sections and lime for their primary actions. The lighter border token is
for separation; controls requiring a visible boundary use `input-border`.

The lilac, peach, blue, and coral tints support occasional feature groups or
illustrations. Pair them with ink, keep sibling treatments consistent, and avoid
turning every section into a different color. Their stronger accent partners are
for small visual details, not paragraph text.

Success uses forest with an explicit check and message. Warnings use warning text
on the peach tint; errors use error text on the error surface. Brand green alone
does not mean success. Always pair status color with a label or symbol.

### Theme scope

Light mode is the reference direction. Forest feature sections and footers are
intentional contrast areas within a light page, not a complete dark theme. If a
dark theme is implemented, define and contrast-check its semantic roles separately;
do not automatically invert the palette or retain the previous charcoal system.

## Typography

Use sans-serif throughout:

- `font-display`: ABC Rom Condensed Heavy for hero titles and major numeric emphasis.
- `font-ui`: ABC Rom with a bold face for navigation, actions, labels, and headings.
- `font-body`: ABC Rom regular for reading text, descriptions, metadata, and help.

Load ABC Rom only when licensed font assets are available to the project. Otherwise
use the fallback stacks in the tokens. Fallbacks approximate the direction; they
are not an exact match. Never stretch text with CSS transforms to imitate a
condensed face. Keep the role utilities even when UI and body share a family.

| Role | Mobile size / line height | Wider layouts | Weight |
| --- | --- | --- | --- |
| Display | `48px / 1.05` | Up to `72px` | 900 |
| Heading 1 | `36px / 1.1` | Up to `48px` | 900 |
| Heading 2 | `28px / 1.2` | Up to `36px` | 700 |
| Heading 3 | `20px / 1.3` | `24px` where useful | 700 |
| Body | `16px / 1.5` | `18px` for introductory copy | 400 |
| Small body | `14px / 1.5` | Unchanged | 400 |
| Caption | `12px / 1.5` | Unchanged | 400 |
| Button | `16px / 1.25` | Unchanged | 700 |
| UI label | `14px / 1.4` | Unchanged | 700 |

Use sentence case and short, natural headings. Reserve condensed type for large
emphasis, never form labels or long paragraphs. Keep reading text around `60ch`
and avoid forced line breaks that fail on mobile. Use tabular numerals for values
that update or need comparison. Essential instructions must remain body-sized.

## Spacing and layout

Use the spacing scale `4, 8, 12, 16, 24, 32, 48, 64, 96px`.

- Start with one column and `16px` horizontal gutters.
- At `768px`, allow `24–32px` gutters and two columns when content benefits.
- At `1024px`, allow wider split layouts or three comparable cards.
- Center general page content within `1200px`; keep focused form flows near `640px`.
- Use `48px` between major mobile sections and `64–96px` on larger screens.
- Use `16–24px` inside mobile cards and `24–32px` on larger panels.
- Keep DOM order aligned with mobile reading and keyboard order.

The page has an open edge with no enclosing dark frame. Full-width background
bands may alternate white, cream, and restrained green tints. Use a clear header,
a spacious main region, and a forest footer when a footer is useful. Product
screens should prioritize the current task over marketing-sized hero sections.

Stack split compositions on narrow screens with explanatory text before supporting
imagery. Let headings wrap, avoid fixed card heights, and keep primary actions easy
to reach. Only tables or similar dense regions may scroll horizontally inside
their own labeled container.

## Shape and depth

| Element | Radius | Treatment |
| --- | --- | --- |
| Buttons and compact badges | `9999px` | Pill silhouette |
| Inputs, selects, menus | `8px` | Clear, restrained boundary |
| Choice cards and callouts | `16px` | Light fill or subtle border |
| Cards and dialogs | `24px` | White or tinted surface |
| Large feature panels and image crops | `32px` | Generous internal space |
| Full-width page sections | `0px` | Open background band |

Keep normal content flat. A soft shadow such as `0 8px 24px rgb(21 70 24 / 0.10)`
may separate a menu or dialog from the page. Avoid hard offset shadows, heavy
outlines, and ornamental frames. Use solid fills for core UI; translucent or
photographic treatments must not compromise the readability of controls or copy.

## Component recipes

### Header and navigation

Use a white header with a compact identity mark, readable navigation, and one lime
primary action where appropriate. On mobile, show the essential action and an
accessible menu trigger. Mark the current destination with weight plus an underline
or filled treatment and `aria-current`, not color alone.

### Hero and feature panels

Pair a short condensed headline with normal-width supporting copy and one clear
CTA. A desktop hero can place people or product imagery alongside the text; a
mobile version stacks them. Use light green or cream panels with generous curves
for benefits or progress summaries. Keep text on a predictable, high-contrast
surface even when imagery fills the surrounding section.

### Cards and choice cards

Cards use white or one pastel fill, `24px` corners, and comfortable padding. Titles
and content belong to one continuous surface rather than separate ribbon bars.
Avoid nested cards when spacing or a divider can express the relationship.

Choice cards use `16px` corners, a visible border, and a native radio or checkbox
when they represent selection. Selected state adds a forest border, pale lime fill,
and a checked control. Make the entire label clickable without nesting interactive
controls. Preserve distinct hover, focus, selected, and disabled states.

### Buttons

Primary actions use lime fill and forest text; secondary actions use white with a
forest border and label. On a lime panel, use a forest-filled action with white
text to preserve distinction. Tertiary actions use an underlined text treatment.

- Keep controls at least `48px` high, with `12px 24px` padding and pill corners.
- Use the lighter `primary-hover` fill on hover and a forest inset outline on press.
- Show a `2px` focus outline with a `3px` offset. Use lime on forest backgrounds.
- Disabled actions keep readable labels and expose their disabled semantics.
- Loading actions retain their width, show progress, and expose a busy state.
- An optional trailing arrow sits in a circular forest area with a lime icon; use
  this sparingly for prominent CTAs, not every button.

Full-width primary actions work well in narrow form flows. Never rely on hover to
reveal their purpose or make essential actions available.

### Links

Use forest, underlined links within reading text. On forest backgrounds use white
or lime and retain the underline. Provide descriptive labels and a visible focus
state. Navigation may omit underlines until active, but must still expose its state.

### Forms and guided flows

Use visible labels above fields, `16px` input text, white fills, `8px` corners,
and a one-pixel input border. Keep help near the relevant control. Use simple
questions, a clear next action, and honest progress labels for multi-step flows.

- Group fields by task; disclose advanced options only when relevant.
- Preserve entered values when navigating back or recovering from errors.
- Connect help and errors through `aria-describedby` and expose invalid state.
- Explain how to fix an error in plain language beside the affected field.
- Distinguish disabled and read-only fields; preserve readable autofill styles.
- Radios remain circular; checkboxes have gently rounded corners.

### Callouts and badges

Use a pale lime callout with forest text and a relevant icon for reassurance or
help. Use peach for a warning and the error recipe for validation problems. Badges
are short pill labels. Avoid red promotional blocks, yellow sticker treatments,
and decorative seals competing with the main action.

### Tables and summaries

Use semantic tables, bold sans-serif headers, normal reading text, and light row
dividers. Prefer alignment and whitespace over a full grid of borders. Right-align
comparable numbers and include units. On narrow screens, keep a labeled scroll
region or present records with explicit field labels without changing reading order.

### Dialogs and popovers

Use white surfaces, rounded corners, and soft elevation only as needed. Dialogs
use `24px` corners; menus use `8px`. Keep titles, explanations, and actions aligned.
Modal dialogs trap focus, return it to the trigger, support Escape, and use an
accessible title. Popovers retain the focus behavior appropriate to their purpose.
A dim backdrop is sufficient; avoid blur that obscures context.

### Empty, loading, and completion states

Keep the space and shape of the content being replaced. Explain an empty state in
one short heading and offer a useful next step. Use restrained skeletons or a
spinner for loading, respect reduced motion, and announce status changes without
stealing focus. Completion states use a check, a clear result, and the next action.

## Imagery, icons, and voice

Use natural, approachable photography and clear product screenshots when they help
explain a task. Crop images in generous rounded rectangles and preserve useful
context on small screens. Use simple consistent icons, generally `20–24px`, with
forest or ink strokes. Decorative images have empty alt text; meaningful images
have descriptions that explain their purpose.

Write with warmth and clarity. Address the user directly, explain one idea at a
time, and name actions by outcome. Avoid jargon, pressure, and unsupported claims.
Borrow the visual grammar while using this product's own content, identity, and
assets; Taxfix logos, testimonials, and refund figures are not application content.

## React, Tailwind, shadcn, and Base UI contract

These are implementation targets for a future UI change, not utilities guaranteed
to exist in the current application.

- Keep semantics and behavior in React components and appearance in shared tokens.
- Map `primary` / `primary-foreground` to lime / forest, `background` to cream,
  `card` and `popover` to white, `foreground` to ink, and `ring` to forest.
- Define separate semantic tokens for subtle dividers and visible input borders.
- Keep `font-display`, `font-ui`, and `font-body` explicit at component boundaries.
- Use named type utilities and the spacing scale; avoid scattered arbitrary values.
- Give buttons pill radii, fields small radii, and cards large radii through shared
  variants. Replace the existing blanket `rounded-none` and hard-shadow treatments
  when implementing this design.
- Retain shadcn and Base UI state attributes, keyboard navigation, collision
  handling, dismissal, focus management, and accessible labeling.
- Ensure portal content inherits the same tokens and fonts as the application.
- Keep variants tied to real component needs; do not add flags for hypothetical use.

## Accessibility and completion checklist

Before shipping an implementation, verify:

- One clear title and primary action establish the task hierarchy.
- Lime, forest, warm neutrals, and restrained pastels provide a coherent palette.
- Headlines are bold and condensed; body copy and controls use readable sans-serif.
- Buttons are pill-shaped, content panels rounded, and page edges open.
- Normal text meets `4.5:1` contrast; large text and essential non-text UI meet `3:1`.
- Focus is visible on both light and forest surfaces and is not clipped or obscured.
- Controls have accessible names, status is not color-only, and touch targets reach
  the project default of `48px × 48px`.
- Keyboard, screen-reader order, error recovery, and dialog behavior remain intact.
- Layouts work at `320px` width, with enlarged text and at `200%` zoom.
- Motion respects `prefers-reduced-motion`; no result depends on animation.
- Images preserve aspect ratio and dimensions are declared to prevent layout shifts.
- Chrome, Safari, and Firefox retain readable typography and usable controls.
