# Design System Document: The Editorial Fintech Experience

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Ledger-Luxe"**

This design system rejects the "template-heavy" look of traditional fintech. Instead, it draws inspiration from high-end Indian editorial design and modern architectural layering. We are building for **Bharat-first**—a demographic that values tradition (reliability) but seeks the efficiency of the future (modernity). 

The system moves away from rigid, boxed grids. We utilize **Intentional Asymmetry** and **Tonal Depth** to guide the eye. By overlapping glass containers and using high-contrast typography scales, we create a UI that feels curated, not just programmed. We don't just show data; we present a financial story.

---

## 2. Color Theory & Surfaces
The palette is rooted in a deep, authoritative Indigo (`primary: #000666`), balanced by the warmth of Saffron accents (`secondary: #7e5700`) for premium tiers.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. 
*   **Example:** Use a `surface_container_low` (`#f2f4f7`) card sitting on a `surface` (`#f7f9fc`) background. The edge is defined by the value shift, not a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent materials. Use the `surface_container` tiers to create organic depth:
*   **Base Level:** `surface` (#f7f9fc)
*   **Primary Content Area:** `surface_container_lowest` (#ffffff) for maximum clarity.
*   **De-emphasized Sections:** `surface_container_high` (#e6e8eb) for utility bars or footer elements.

### The "Glass & Gradient" Rule
To achieve a "premium" feel, floating action buttons and overlays must utilize **Glassmorphism**.
*   **Specs:** Use `surface_variant` at 60% opacity with a `20px` backdrop blur.
*   **Signature Textures:** For Hero sections (e.g., Total Balance), use a linear gradient from `primary` (#000666) to `primary_container` (#1a237e) at a 135-degree angle. This adds "soul" and depth that flat navy cannot replicate.

---

### 3. Typography: The Editorial Voice
We use a dual-font strategy to balance character with utility.

*   **Display & Headlines (Manrope):** Our "Authoritative" voice. Used for large balances and section headers. The wider kerning of Manrope conveys a sense of stability and openness.
*   **Body & Labels (Inter):** Our "Functional" voice. Inter is used for all transactional data and micro-copy to ensure legibility on low-end devices and varied lighting conditions.

**Hierarchy Strategy:**
*   **Financial Prominence:** Use `display-md` for main account balances to evoke the feeling of a high-end bank statement.
*   **Contextual Clarity:** Use `label-md` in `on_surface_variant` (#454652) for "Milna Hai" labels to ensure the green/red indicators are the star, not the text.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often "dirty." We use **Ambient Softness** to mimic natural light.

*   **The Layering Principle:** Instead of shadows, stack `surface_container_lowest` on `surface_container_low`. This creates a "soft lift."
*   **Ambient Shadows:** For high-priority floating elements, use: `box-shadow: 0 12px 32px rgba(0, 7, 103, 0.06);`. Note the tint: we use a hint of our `on_primary_fixed` color rather than pure black to keep the shadow "clean."
*   **The "Ghost Border" Fallback:** If accessibility requires a border (e.g., input focus), use `outline_variant` at **20% opacity**. Never use a 100% opaque stroke.
*   **Glass Depth:** Overlays (Modals/Drawers) must use a background of `surface` with a 70% alpha and a background-blur of `12px` to keep the user grounded in their previous context.

---

## 5. Signature Components

### Cards (The "Bahi-Khata" Evolution)
*   **Styling:** No borders. Corner radius: `lg` (2rem/32px).
*   **Separation:** Forbid divider lines. Use `spacing-8` (2rem) of vertical whitespace or a shift to `surface_container_highest` for the background of the card.
*   **Interaction:** On tap, a subtle scale-down (98%) is preferred over a color change.

### Buttons (The Anchor)
*   **Primary:** `primary` (#000666) background with `on_primary` (#ffffff) text. Corner radius: `full`.
*   **Success (Milna Hai):** Use `tertiary_container` (#003909) with `on_tertiary_fixed` (#002204) text. This provides a "Vibrant Green" feel that remains accessible and premium.
*   **Danger (Dena Hai):** Use `error_container` (#ffdad6) with `on_error_container` (#93000a) text. Soft, not alarming.

### Input Fields
*   **Style:** `surface_container_lowest` background. 
*   **Focus State:** Instead of a heavy border, use a subtle 2px glow using `primary_fixed` (#e0e0ff) and transition the label to `primary`.

### "Pro" Feature Accents
*   **The Saffron Touch:** Use `secondary_fixed` (#ffdeac) for badges or "Unlock" icons. Use a subtle gradient from `secondary` to `secondary_container` for "Pro" call-to-action buttons to make them feel like a physical gold leaf.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts (e.g., a balance card that takes up 90% of the width, offset to the right).
*   **Do** use `headline-sm` for "Milna Hai/Dena Hai" amounts to ensure financial data is the first thing read.
*   **Do** lean into white space. If a screen feels "busy," increase spacing from `spacing-4` to `spacing-6`.

### Don't:
*   **Don't** use 1px dividers. If you feel you need a line, use a `1rem` gap instead.
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#191c1e) to maintain the premium, soft-contrast editorial look.
*   **Don't** use sharp corners. Everything must adhere to the `DEFAULT` (16px) to `xl` (48px) roundedness scale to feel approachable ("Bharat-first").

---

## 7. Spacing & Rhythm
We follow a 4px-base grid but prioritize **Optical Rhythm**.
*   **External Margins:** Always use `spacing-5` (1.25rem) for mobile screen gutters.
*   **Internal Grouping:** Use `spacing-2` (0.5rem) for related items (label + input).
*   **Section Breaks:** Use `spacing-10` (2.5rem) to allow the eye to rest between different financial categories.