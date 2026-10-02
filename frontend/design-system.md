# Cinematic Utility Design System

> A premium web design system inspired by the underlying design principles of Supaste — not a visual clone.  
> Built around hierarchy, whitespace, product-led storytelling, restrained typography, cinematic depth, and polished motion.

---

## 1. Design Philosophy

### Core idea

**Big idea → quiet copy → spectacular product visual → lots of room → tiny details.**

Avoid the common SaaS pattern:

**Heading → paragraph → three cards → heading → paragraph → three cards.**

Instead, every page should feel intentionally composed.

### Core principles

| Principle | Rule |
|---|---|
| One dominant moment | Every screen or section should have one obvious visual priority |
| Product is decoration | Prefer real interface/product visuals over generic illustrations |
| Whitespace = luxury | Do not fill every available area |
| Low component noise | Avoid borders, shadows, badges, and cards everywhere |
| Contrast before color | Establish hierarchy in black/white first, then introduce brand color |
| Motion supports depth | Animation should reinforce hierarchy and spatial relationships |
| Fewer, stronger components | Reuse a small set of refined components |
| Composition over decoration | Layout, scale, rhythm, and framing matter more than effects |

---

## 2. Visual Character

The overall style can be described as:

# Cinematic Utility

A combination of:

- Apple-like restraint
- Editorial typography
- SaaS clarity
- Premium product storytelling
- Large-scale visual composition
- Soft atmospheric gradients
- Subtle glassmorphism
- Controlled motion
- Product-first interfaces

The design should feel:

- Premium
- Calm
- Spacious
- Confident
- Modern
- Useful
- Visual
- Product-led

It should never feel:

- Template-heavy
- Over-carded
- Over-animated
- Over-colored
- Corporate-stock-photo driven
- Busy
- Decorative without purpose

---

## 3. Color System

The system uses a neutral foundation with one strong brand atmosphere.

### 3.1 Neutral foundation

```css
:root {
  --background: #F7F7F5;
  --surface: #FFFFFF;

  --foreground: #111111;
  --foreground-soft: #353535;

  --muted: #737373;
  --muted-light: #A3A3A3;

  --border: rgba(17, 17, 17, 0.08);
  --border-strong: rgba(17, 17, 17, 0.14);
}
```

### 3.2 Dark surfaces

```css
:root {
  --dark: #0A0A0A;
  --dark-soft: #151515;

  --dark-text: #FFFFFF;
  --dark-muted: rgba(255, 255, 255, 0.64);
  --dark-border: rgba(255, 255, 255, 0.12);
}
```

### 3.3 Brand example

The brand colors should be adapted per project.

Example blue atmosphere:

```css
:root {
  --brand-950: #082091;
  --brand-800: #123EDA;
  --brand-600: #087FEF;
  --brand-400: #39B8FF;
  --brand-200: #A8E5FF;
  --brand-50: #EAF9FF;
}
```

### 3.4 Brand relationship

Think in layers:

```text
Deep saturated
      ↓
Electric brand
      ↓
Light atmospheric tone
      ↓
Almost white
```

Do not think of the palette as isolated swatches.

Think of it as an environmental field.

---

## 4. Gradient System

Avoid flat two-color gradients.

Bad:

```css
background: linear-gradient(blue, cyan);
```

Preferred:

```css
.hero {
  background:
    radial-gradient(
      circle at 50% 10%,
      rgba(36, 77, 255, 0.95),
      transparent 42%
    ),
    radial-gradient(
      circle at 50% 55%,
      rgba(38, 181, 255, 0.85),
      transparent 55%
    ),
    linear-gradient(
      180deg,
      #122BD4 0%,
      #1599F8 48%,
      #DFF7FF 100%
    );
}
```

The intended visual flow is:

```text
Sky
↓
Atmosphere
↓
Subject
```

not:

```text
Blue
↓
Lighter blue
```

---

## 5. Typography

### 5.1 Primary font

Use a clean sans-serif such as:

- Inter
- Geist
- Suisse Int'l
- Neue Montreal
- SF Pro
- Manrope

Recommended default:

```text
Inter
```

Use it for:

- Navigation
- Body
- UI
- Labels
- Buttons
- Standard headings
- Pricing
- Forms
- Product interfaces

### 5.2 Editorial accent

Use one expressive serif.

Recommended:

```text
Instrument Serif
```

Use it only for:

- Emotional phrases
- Emphasized words
- Hero contrast
- Quotes
- Premium section transitions
- Selected display headlines

Do not write the entire website in serif.

### 5.3 Typography contrast

Example:

```text
Everything your team needs.
Built beautifully.
```

Render as:

**Everything your team needs.**  
*Built beautifully.*

The contrast is the effect.

---

## 6. Type Scale

### Hero title

```css
.hero-title {
  font-size: clamp(64px, 7.2vw, 116px);
  line-height: 0.91;
  letter-spacing: -0.055em;
  font-weight: 650;
}
```

### Editorial hero accent

```css
.hero-accent {
  font-family: "Instrument Serif", serif;
  font-weight: 400;
  font-style: italic;
  letter-spacing: -0.04em;
}
```

### Section H2

```css
.section-title {
  font-size: clamp(44px, 5vw, 76px);
  line-height: 0.98;
  letter-spacing: -0.045em;
}
```

### Feature H3

```css
.feature-title {
  font-size: 28px;
  line-height: 1.08;
  letter-spacing: -0.025em;
}
```

### Large body

```css
.body-lg {
  font-size: 18px;
  line-height: 1.55;
}
```

### Standard body

```css
.body {
  font-size: 15px;
  line-height: 1.6;
}
```

### Tiny label

```css
.eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

---

## 7. Width System

Do not use one max-width for the entire site.

Use multiple width tiers.

```text
Page maximum       1440px
Primary container  1280px
Content container  1120px
Text container      720px
Reading container   620px
```

Tailwind examples:

```tsx
max-w-[1440px]
max-w-[1280px]
max-w-[1120px]
max-w-[720px]
max-w-[620px]
```

Hero headline:

```tsx
max-w-[900px] mx-auto
```

Body copy:

```tsx
max-w-[620px] mx-auto
```

The design should repeatedly use:

**large title + narrow copy**

---

## 8. Spacing System

Recommended spacing scale:

```text
4
8
12
16
20
24
32
40
48
64
80
96
128
160
200
```

### Desktop sections

```css
.section {
  padding-block: 140px;
}
```

### Hero

```css
.hero {
  min-height: 950px;
}
```

### Showcase sections

```css
.showcase-section {
  padding-block: 180px;
}
```

### Mobile

```css
.section {
  padding-block: 80px;
}
```

Do not be afraid of intentionally empty space.

Whitespace is part of the composition.

---

## 9. Border Radius System

```css
:root {
  --radius-xs: 8px;
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 28px;
  --radius-xl: 40px;
  --radius-pill: 999px;
}
```

Recommended usage:

```text
Tiny UI controls   8–12px
Cards              18–24px
Feature showcases  28–40px
Buttons            Pill
Navbar             Pill
```

Avoid assigning the same large radius to everything.

---

## 10. Border System

Borders should usually be almost invisible.

### Light surface

```css
border: 1px solid rgba(0, 0, 0, 0.07);
```

### Dark surface

```css
border: 1px solid rgba(255, 255, 255, 0.10);
```

### Glass surface

```css
border: 1px solid rgba(255, 255, 255, 0.18);
```

A border should rarely be the first visual detail noticed.

---

## 11. Shadow System

Avoid generic heavy utility shadows.

### Product shadow

```css
box-shadow:
  0 2px 4px rgba(0, 0, 0, 0.03),
  0 20px 50px rgba(0, 0, 0, 0.08),
  0 80px 140px rgba(0, 0, 0, 0.12);
```

### Floating nav

```css
box-shadow:
  0 2px 3px rgba(0, 0, 0, 0.20),
  0 12px 35px rgba(0, 0, 0, 0.25);
```

### Glass element

```css
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.20),
  0 20px 60px rgba(0, 0, 0, 0.10);
```

Shadows should create atmosphere and depth, not obvious floating rectangles.

---

## 12. Navbar System

Prefer a floating capsule navbar instead of a full-width bar.

Visual idea:

```text
       ╭──────────────────────────────╮
       │ ◉ Brand  Features  About  ● │
       ╰──────────────────────────────╯
```

Recommended style:

```css
.navbar {
  height: 54px;
  padding: 6px 7px 6px 16px;
  border-radius: 999px;

  background: rgba(8, 8, 8, 0.94);
  backdrop-filter: blur(18px);
}
```

Recommended hierarchy:

```text
Black outer nav
+
White CTA pill inside
```

Keep the navbar compact.

---

## 13. Button System

Use a small number of button types.

### 13.1 Primary dark

```css
.button-primary {
  background: #0A0A0A;
  color: white;
  border-radius: 999px;
}
```

### 13.2 Primary light

For dark backgrounds:

```css
.button-light {
  background: white;
  color: #111111;
  border-radius: 999px;
}
```

### 13.3 Glass button

```css
.button-glass {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}
```

### 13.4 Text action

```text
Explore features →
```

Avoid rectangular medium-radius SaaS buttons unless the product UI itself requires them.

---

## 14. Card System

Use a small card vocabulary.

### 14.1 Quiet card

```text
┌────────────────────────┐
│ icon                   │
│                        │
│ Feature                │
│ Small description      │
└────────────────────────┘
```

```css
.card {
  background: #FFFFFF;
  border: 1px solid var(--border);
  border-radius: 24px;
}
```

### 14.2 Showcase card

A visual-first card.

```text
╭──────────────────────────────────╮
│                                  │
│       LARGE PRODUCT VISUAL       │
│                                  │
│ Feature title                    │
│ Description                      │
╰──────────────────────────────────╯
```

The visual should dominate.

### 14.3 Dark cinematic card

```css
.card-dark {
  background:
    radial-gradient(...),
    #080808;

  color: white;
}
```

Use only for major moments.

---

## 15. Bento Grid System

Do not use arbitrary equal cards.

Use intentional asymmetry.

Example:

```text
┌───────────────────────────────┬─────────────┐
│                               │             │
│      Main feature             │ Small       │
│      8 columns                │ 4 columns   │
│                               │             │
├───────────────┬───────────────┴─────────────┤
│ Small         │        Medium               │
│ 4 cols        │        8 cols               │
└───────────────┴─────────────────────────────┘
```

The main feature should be approximately twice as visually important as secondary features.

---

## 16. Product Screenshot System

Never place screenshots flat on the page without art direction.

Avoid:

```text
[Screenshot]
```

Preferred composition:

```text
         Floating UI
              ↓
       ╭────────────╮
       │ Screenshot │
       ╰────────────╯
   Soft environmental glow

──────── Landscape / image ────────
```

Product visuals may:

- Float
- Overlap
- Crop
- Tilt 1–3°
- Scale during scroll
- Emerge from a surface
- Sit behind another UI layer
- Bleed outside a container
- Receive soft atmospheric lighting

Treat screenshots as visual assets, not documentation.

---

## 17. Image Direction

Prefer environmental photography.

Good:

- Architecture
- Landscape
- Real workspaces
- Real campus scenes
- Warehouses
- Product environments
- Close-up textures
- Cinematic human moments
- Contextual objects
- Operational environments

Avoid generic stock photography such as:

```text
Businessman pointing at laptop
```

Create contrast between physical environment and digital product.

Examples:

```text
Industrial image + logistics dashboard
Campus image + school platform
Landscape + productivity interface
Machine close-up + operations software
```

---

## 18. Section Title Patterns

Avoid repetitive section construction like:

```text
Our Features
Lorem ipsum dolor sit amet...
```

Use more editorial structures.

### Pattern A

```text
01
Everything in reach.
```

### Pattern B

```text
Made for speed

Your work,
without the friction.
```

### Pattern C

```text
Designed around you.
Not the other way around.
```

Use eyebrow labels sparingly.

---

## 19. Motion System

Motion should reinforce spatial hierarchy.

### 19.1 Standard reveal

```ts
const reveal = {
  initial: {
    opacity: 0,
    y: 24,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  transition: {
    duration: 0.65,
    ease: [0.22, 1, 0.36, 1],
  },
}
```

### 19.2 Product entrance

Start:

```text
opacity: 0
scale: 0.94
y: 60
```

End:

```text
opacity: 1
scale: 1
y: 0
```

Recommended duration:

```text
900–1200ms
```

### 19.3 Card hover

```text
translateY(-4px)
scale(1.01)
```

### 19.4 Button hover

```text
scale(1.025)
```

### 19.5 Parallax

Recommended range:

```text
±30–70px
```

Do not overdo parallax.

### 19.6 Stagger

```text
40–70ms
```

between related elements.

---

## 20. Motion Hierarchy

Do not animate everything equally.

Use this priority:

```text
Product visual     Strongest motion
Heading            Medium motion
Cards              Subtle motion
Body copy          Minimal motion
Navigation         Almost none
```

The interface should still look excellent with animation disabled.

---

## 21. Section Background Rhythm

Avoid constant color switching.

Bad:

```text
White
Gray
Blue
Black
Green
White
Purple
```

Preferred:

```text
Off-white
Off-white
Off-white
Cinematic feature
Off-white
Off-white
Dark CTA
Off-white
```

Long stretches of one neutral surface improve visual cohesion.

---

## 22. Icon System

Recommended:

```text
Lucide
```

Suggested sizes:

```text
16px — buttons
18px — navigation
20px — controls
24px — feature icons
```

Stroke:

```text
1.5–1.75
```

Avoid placing every icon inside a colorful square.

Often this is enough:

```text
Icon

Feature heading
Description
```

---

## 23. Hero System

Recommended composition:

```text
                     FLOATING NAV


                    Eyebrow

                 Powerful idea.
                Editorial contrast.

             Supporting sentence
            Maximum 2–3 lines

                  [ CTA ]

        Tiny trust / platform information



               PRODUCT INTERFACE
          ┌────────────────────────┐
          │                        │
          └────────────────────────┘


             ENVIRONMENTAL IMAGE
════════════════════════════════════════════
```

Recommended composition ratio:

```text
20% Navigation + breathing room
30% Copy
50% Product / environment
```

Do not allow the hero to become mostly text.

---

## 24. Feature Section Recipe

### Pattern A — centered product story

```text
               Tiny eyebrow

        One beautiful place
       for everything you need.

       Short 2-line description


┌──────────────────────────────────────────┐
│                                          │
│                                          │
│              PRODUCT UI                  │
│                                          │
│                                          │
└──────────────────────────────────────────┘
```

### Pattern B — split composition

```text
┌──────────────────────┐   ┌──────────────┐
│                      │   │              │
│      VISUAL          │   │  Heading     │
│                      │   │              │
│                      │   │  Description │
│                      │   │              │
└──────────────────────┘   └──────────────┘
```

Alternate left and right only when it improves rhythm.

Do not alternate mechanically.

---

## 25. Landing Page Architecture

Recommended premium structure:

```text
01  Floating navbar

02  Cinematic hero
    Promise
    Supporting statement
    CTA
    Giant product preview

03  Recognition / trust
    Awards
    Clients
    Metrics
    Integrations

04  Product philosophy
    Huge heading
    Short paragraph

05  Feature showcase
    Large visual

06  Feature showcase
    Reverse or new composition

07  Bento feature collection

08  Interactive product demonstration

09  Audience / use cases

10  Social proof

11  Pricing / CTA

12  FAQ

13  Dramatic final CTA

14  Minimal footer
```

Not every project needs every section.

Remove sections before adding more.

---

## 26. Tailwind Foundation

Suggested Tailwind theme:

```css
@theme {
  --font-sans: "Inter", sans-serif;
  --font-editorial: "Instrument Serif", serif;

  --color-page: #F7F7F5;
  --color-surface: #FFFFFF;

  --color-ink: #111111;
  --color-muted: #737373;

  --color-brand: #087FEF;
  --color-brand-light: #39B8FF;
  --color-brand-dark: #123EDA;

  --radius-card: 1.5rem;
  --radius-showcase: 2.25rem;
  --radius-pill: 999px;

  --spacing-section: 9rem;
}
```

Use semantic tokens rather than random values scattered across components.

---

## 27. Recommended Component Library

Keep the primitive system intentionally small.

```text
Navbar
Container
Section
SectionHeader

PrimaryButton
SecondaryButton
GlassButton
TextLink

Hero
HeroProductStage

ProductFrame
BrowserFrame
PhoneFrame
FloatingPanel

FeatureCard
FeatureShowcase
BentoGrid

LogoCloud
Testimonial
Stat

PricingCard
Accordion
CTA
Footer
```

A premium system does not need hundreds of components.

---

## 28. Visual Ratio

A useful compositional target:

```text
60% Whitespace / environment
25% Product imagery
10% Typography
 5% UI decoration
```

Avoid the typical SaaS ratio:

```text
40% cards
30% text
20% icons
10% whitespace
```

The latter usually creates visual noise.

---

## 29. Glassmorphism Rules

Glass should be used as a depth layer, not as a theme.

Recommended:

```css
.glass {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  border: 1px solid rgba(255, 255, 255, 0.18);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.20),
    0 20px 60px rgba(0, 0, 0, 0.10);
}
```

Use glass for:

- Floating nav
- Overlay controls
- Product UI accents
- Small floating panels
- Hero UI details

Avoid glass on every card.

---

## 30. Layout Rules

### Rule 1

Every section needs a focal point.

### Rule 2

Do not center everything.

Use centered layouts for:

- Hero
- Philosophy
- Major CTA
- Product reveal

Use asymmetric layouts for:

- Feature storytelling
- Screenshots
- Use cases
- Bento grids
- Testimonials

### Rule 3

Allow elements to escape containers.

Examples:

```text
Screenshot bleeds right
Image extends below section
Floating card crosses two layers
UI panel overlaps image edge
```

### Rule 4

Use negative space intentionally.

### Rule 5

Do not solve weak hierarchy by adding more color.

---

## 31. Mobile Rules

Mobile should not be a compressed desktop.

### Hero

- Reduce title size dramatically
- Preserve editorial contrast
- Keep copy narrow
- Product visual may intentionally crop
- Move visual closer to CTA
- Simplify environmental layers

### Spacing

Desktop:

```text
140–180px
```

Mobile:

```text
72–96px
```

### Cards

Desktop bento:

```text
8 / 4
4 / 8
```

Mobile:

```text
1 column
```

But preserve hierarchy by making the primary card visually richer.

### Navbar

Use:

```text
Logo + menu / CTA
```

Do not shrink the entire desktop navigation into an unreadable capsule.

---

## 32. Responsive Type Guidance

Suggested Tailwind ranges:

```tsx
text-[54px] sm:text-[64px] md:text-[80px] lg:text-[96px] xl:text-[112px]
```

Section headings:

```tsx
text-[40px] md:text-[56px] lg:text-[72px]
```

Body:

```tsx
text-[15px] md:text-[17px]
```

Do not preserve desktop line breaks blindly on small screens.

---

## 33. Content Density Rules

Hero:

```text
1 promise
1 supporting sentence
1 main CTA
1 optional secondary action
```

Feature section:

```text
1 eyebrow
1 heading
1 short paragraph
1 visual
```

Card:

```text
1 idea
1 heading
1 short explanation
```

Do not make one component explain multiple concepts.

---

## 34. CTA Rules

Every major page should have one dominant action.

Examples:

```text
Get started
Book a demo
Talk to an advisor
Apply now
Start tracking
Explore the platform
```

Secondary actions should be visually quieter.

Do not create multiple equally weighted buttons.

---

## 35. Copywriting Style

Recommended:

- Short
- Direct
- Human
- Benefit-led
- Confident
- Minimal

Avoid:

- Corporate jargon
- Long introductions
- Generic words like “innovative”
- Repetitive feature descriptions
- Large blocks of body copy

Preferred:

```text
Know what happened.
Before anyone has to ask.
```

Instead of:

```text
Our innovative platform empowers organizations with advanced capabilities that allow management to efficiently access information.
```

---

## 36. Product-Led Storytelling

Whenever possible, explain the product through the interface itself.

Instead of:

```text
Our dashboard helps managers monitor everything.
```

Show:

```text
Dashboard
↓
Highlighted metric
↓
Floating notification
↓
Small explanatory label
```

Let the UI perform part of the storytelling.

---

## 37. Depth System

Use four visual layers.

```text
Layer 1 — Background / atmosphere
Layer 2 — Main product frame
Layer 3 — Floating UI panels
Layer 4 — Fine labels / controls
```

Example:

```text
Background gradient

      ┌──────────────────────────┐
      │      MAIN DASHBOARD      │
      │                          │
      │         ┌──────────┐     │
      │         │ floating │     │
      │         │ panel    │     │
      └──────────────────────────┘

          small annotation
```

This creates a cinematic scene rather than a flat screenshot.

---

## 38. Composition Checklist

Before approving a screen, ask:

1. What should the eye see first?
2. Is there enough empty space around it?
3. Can a border be removed?
4. Can the actual product become the visual?
5. Is more than one accent color being used unnecessarily?
6. Does the serif have a real purpose?
7. Would the layout still look good with animation disabled?
8. Is one component clearly more important than the rest?
9. Does the visual tell part of the story without copy?
10. Is there anything decorative that can be removed?

---

## 39. Anti-Patterns

Do not default to:

### Card soup

```text
[card][card][card]
[card][card][card]
```

### Excessive gradients

```text
Purple card
Blue card
Green section
Orange CTA
```

### Excessive pills

Pills should primarily be used for:

- Buttons
- Nav
- Status
- Small controls

### Excessive icon containers

Avoid:

```text
[blue box + icon]
[green box + icon]
[purple box + icon]
```

### Excessive badges

One badge can add context.

Ten badges create noise.

### Random motion

Do not animate merely because Framer Motion is available.

---

## 40. Project Adaptation Rules

Do not copy the same visual identity into every project.

Reuse the design grammar.

### Example — productivity product

```text
Blue atmosphere
Mac-like interface
Nature photography
Black controls
Editorial serif
```

### Example — logistics

```text
Warm ivory or industrial atmosphere
Operations dashboard
Warehouse / freight photography
Charcoal controls
Editorial serif
```

### Example — school platform

```text
Soft sky / warm neutral atmosphere
Student and school dashboard
Campus photography
Navy controls
Editorial serif accent
```

### Example — AI product

```text
Warm grey atmosphere
Data / AI interface
Abstract technical imagery
Charcoal controls
Editorial accent
```

Same system.

Different identity.

---

## 41. Design Decision Priority

When something feels wrong, solve problems in this order:

```text
1. Scale
2. Hierarchy
3. Spacing
4. Composition
5. Contrast
6. Typography
7. Depth
8. Motion
9. Details
10. Decoration
```

Do not jump straight to gradients or animation.

---

## 42. Recommended Stack

For React / Next.js projects:

```text
Next.js / React
Tailwind CSS
shadcn/ui
Framer Motion
Lucide React
```

Optional:

```text
GSAP — only for advanced scroll choreography
Lenis — only when custom smooth scrolling is justified
Three.js — only for genuine 3D moments
```

Do not add heavy libraries for effects that CSS can handle.

---

## 43. Base Framer Motion Presets

```ts
export const cinematicEase = [0.22, 1, 0.36, 1]

export const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: cinematicEase,
    },
  },
}

export const productReveal = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1,
      ease: cinematicEase,
    },
  },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}
```

---

## 44. Base Container Components

Example:

```tsx
export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-10 ${className}`}
    >
      {children}
    </div>
  )
}
```

Reading container:

```tsx
export function TextContainer({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[620px] ${className}`}
    >
      {children}
    </div>
  )
}
```

---

## 45. Base Section Component

```tsx
export function Section({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`py-20 md:py-28 lg:py-36 ${className}`}
    >
      {children}
    </section>
  )
}
```

---

## 46. Base Product Frame

```tsx
export function ProductFrame({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="
        relative overflow-hidden
        rounded-[32px]
        border border-black/10
        bg-white
        shadow-[0_2px_4px_rgba(0,0,0,.03),0_20px_50px_rgba(0,0,0,.08),0_80px_140px_rgba(0,0,0,.12)]
      "
    >
      {children}
    </div>
  )
}
```

---

## 47. Base Glass Panel

```tsx
export function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`
        rounded-2xl
        border border-white/20
        bg-white/10
        backdrop-blur-xl
        shadow-[inset_0_1px_0_rgba(255,255,255,.2),0_20px_60px_rgba(0,0,0,.1)]
        ${className}
      `}
    >
      {children}
    </div>
  )
}
```

---

## 48. Design Review Scorecard

Score every screen from 1–5.

| Area | Score |
|---|---:|
| Visual hierarchy | /5 |
| Whitespace | /5 |
| Typography | /5 |
| Product storytelling | /5 |
| Layout composition | /5 |
| Contrast | /5 |
| Depth | /5 |
| Motion restraint | /5 |
| Brand distinctiveness | /5 |
| Mobile quality | /5 |

Target:

```text
42+/50 = strong
46+/50 = premium
48+/50 = exceptional
```

---

## 49. Final Design Law

The system should always favor:

```text
Scale
→
Hierarchy
→
Emptiness
→
Contrast
→
Depth
→
Typography
→
Motion
→
Details
```

The most important rule:

# Composition is more important than components.

A site can use the correct gradients, fonts, cards, motion, and buttons and still feel average.

The premium feeling comes from:

- What is large
- What is small
- What is missing
- What overlaps
- What is given space
- What is emphasized
- What moves
- What stays still

---

## 50. One-Line Summary

> Build pages like visual stories, not collections of components.

---

## 51. Short Creative Direction Prompt

Use this when designing future pages:

```text
Create a premium cinematic utility interface with strong visual hierarchy,
generous whitespace, restrained sans-serif typography, selective editorial serif
accents, product-led storytelling, large interface visuals, atmospheric gradients,
subtle glass layers, low border noise, deep spatial composition, and controlled
motion. Avoid generic SaaS card grids, excessive gradients, decorative clutter,
and equal visual weight across every component.
```

---

## 52. Final Checklist

Before shipping:

- [ ] One clear visual priority per section
- [ ] Generous whitespace
- [ ] Product visuals are art-directed
- [ ] No unnecessary borders
- [ ] One primary accent color
- [ ] Serif used selectively
- [ ] Motion supports hierarchy
- [ ] Background rhythm is coherent
- [ ] Cards do not dominate the page
- [ ] CTA hierarchy is obvious
- [ ] Mobile composition is intentionally redesigned
- [ ] Product screenshots feel integrated into the environment
- [ ] Photography feels contextual and cinematic
- [ ] No generic corporate stock imagery
- [ ] Design still looks strong without motion
- [ ] Every component has a clear job
- [ ] Decorative elements can justify their presence
- [ ] Hero is not mostly text
- [ ] Major visuals receive enough space
- [ ] Final result feels like one visual system
