# Project Styling Architecture

## Overview

This project strictly enforces a utility-first styling architecture using Tailwind CSS. All styling must be defined via Tailwind utility classes directly in the JSX or within colocated CSS modules if complex cascading is required. We strictly prohibit the use of inline `style={{}}` props for static styling to maintain a unified design system, ensure performance, and keep component markup clean.

## Rules

1. **No Inline Styles:** Never use `style={{}}` props on JSX elements for static styling.
2. **Dynamic Values Only:** If a value is dynamic (e.g., driven by React state), use a CSS custom property via `style={{ '--my-var': value } as React.CSSProperties}` and reference it via Tailwind arbitrary values (e.g., `w-[var(--my-var)]`) or in a CSS file as `var(--my-var)`. This is the *only* acceptable use of the style prop.
3. **Colocation & Tailwind:** All static styles must go in a `.module.css` file colocated with the component, or as Tailwind utility classes. Do not mix both within the same component—pick whichever pattern already exists.
4. **No `!important`:** Never use `!important` in CSS. Refactor your CSS specificity or Tailwind class composition instead.
5. **No Magic Numbers:** Never use magic numbers (e.g., `margin-top: 43px`). If an explicit custom value is required, provide a comment explaining its purpose.
6. **Descriptive Class Names:** Class names in CSS modules must be `camelCase` and descriptive (e.g., `productContainer`, `actionButton`). Avoid generic names like `div1`, `wrapper2`, etc.

## The One Exception: Dynamic Values

When a style must be dynamically calculated at runtime (e.g., an element's scale based on scroll position), pass the value as a CSS variable via the `style` prop, and apply the variable via Tailwind.

```tsx
// ❌ BAD: Directly applying styles via prop
<div style={{ transform: `scale(${imageScale})` }} />

// ✅ GOOD: Using a CSS variable and referencing it via Tailwind
<div 
  className="[transform:scale(var(--image-scale))]" 
  style={{ '--image-scale': imageScale } as React.CSSProperties} 
/>
```

## What Not To Do

| Anti-pattern (❌ Bad) | Correct Pattern (✅ Good) |
| --- | --- |
| `<div style={{ height: '36vh' }} />` | `<div className="h-[36vh]" />` |
| `<div style={{ transition: 'opacity 0.15s ease-out' }} />` | `<div className="transition-opacity duration-150 ease-out" />` |
| `<div style={{ backgroundImage: \`url(${src})\` }} />` | `<div className="bg-[image:var(--bg)]" style={{ '--bg': \`url(${src})\` } as React.CSSProperties} />` |
| `.div1 { width: 43px; } /* no comment */` | `.avatarThumbnail { width: 43px; /* aligned to legacy header grid */ }` |

## Agent Instructions

Before writing any JSX, check this file. Do not use inline styles. If you are unsure where a style belongs, ask before writing it.
