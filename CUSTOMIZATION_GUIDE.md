# 🎨 **Customization Guide - Notion Design System**

## **How to Further Customize Your Design**

---

## **1. Changing the Color Scheme**

### Edit Primary Colors
Open `src/index.css` and modify the `:root` variables:

```css
:root {
  /* Current: Blue-600 */
  --primary: 240 84% 55%;
  
  /* Example: To change to Teal (like Slack):
  --primary: 174 100% 29%;  /* Teal-600 */
  
  /* Example: To change to Pink/Magenta:
  --primary: 280 100% 50%;  /* Magenta-600 */
}
```

### Supported Tailwind Colors (HSL Format)
```
Blue-600: 240 84% 55%
Purple-600: 264 90% 52%
Pink-600: 280 90% 56%
Rose-600: 0 84% 60%
Orange-600: 9 100% 64%
Green-600: 132 52% 36%
Teal-600: 174 100% 29%
```

---

## **2. Adjusting Glass Morphism Effect**

### Increase Blur Effect (More Frosted)
```css
:root {
  --backdrop-blur: blur(24px);  /* Increased from 16px */
}
```

### Change Glass Transparency
```css
:root {
  /* More transparent (lighter) */
  --glass-bg: hsl(213 32% 13% / 0.5);  /* Was 0.7 */
  
  /* More opaque (darker) */
  --glass-bg: hsl(213 32% 13% / 0.9);  /* Was 0.7 */
}
```

### Adjust Glass Border Opacity
```css
:root {
  /* More visible border */
  --glass-border: hsl(210 100% 100% / 0.2);  /* Was 0.1 */
  
  /* Subtle border */
  --glass-border: hsl(210 100% 100% / 0.05);  /* Was 0.1 */
}
```

---

## **3. Modifying Shadows & Glow Effects**

### Change Glow Intensity
```css
:root {
  /* Stronger glow */
  --shadow-glow: 0 0 50px hsl(264 90% 52% / 0.35);  /* Was 30px, 0.25 */
  
  /* Subtle glow */
  --shadow-glow: 0 0 20px hsl(264 90% 52% / 0.15);  /* Was 30px, 0.25 */
}
```

### Card Shadow Depth
```css
:root {
  /* Deeper shadow */
  --shadow-card: 0 20px 60px rgba(0, 0, 0, 0.8);  /* Was 0 12px 48px, 0.6 */
  
  /* Subtle shadow */
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.3);   /* Was 0 12px 48px, 0.6 */
}
```

---

## **4. Customizing Component Styles**

### Modify Button Style
```tsx
// In any component, change:
className="btn-primary"

// To custom:
className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold text-white"
```

### Change Input Focus Color
```tsx
// Find in components:
focus:border-blue-600 focus:ring-blue-600/20

// Change to:
focus:border-purple-600 focus:ring-purple-600/20
```

### Modify Border Radius
```css
/* In :root */
--radius: 1.5rem;  /* Increase for rounder corners */
--radius: 0.5rem;  /* Decrease for sharper corners */
```

---

## **5. Adjusting Typography**

### Change Font Family
```css
@layer base {
  body {
    font-family: 'Poppins', sans-serif;  /* Instead of Inter */
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Manrope', sans-serif;  /* Instead of Space Grotesk */
  }
}
```

### Change Font Sizes
```css
/* Add to tailwind config or use inline */
h1 {
  @apply text-5xl font-bold;  /* Increase from 4xl */
}
```

---

## **6. Creating Custom Gradients**

### Add New Gradient Options
```css
:root {
  --gradient-success: linear-gradient(135deg, hsl(132 100% 50%), hsl(174 100% 50%));
  --gradient-warning: linear-gradient(135deg, hsl(9 100% 64%), hsl(36 100% 50%));
  --gradient-error: linear-gradient(135deg, hsl(0 84% 60%), hsl(0 100% 50%));
}
```

### Use in Components
```tsx
className="bg-gradient-to-r from-green-500 to-teal-500"
```

---

## **7. Dark/Light Mode Toggle**

### Add Theme Toggle (Optional)
```tsx
// src/hooks/useTheme.ts
export function useTheme() {
  const [isDark, setIsDark] = useState(true);
  
  useEffect(() => {
    if (!isDark) {
      document.documentElement.style.setProperty('--primary', '240 84% 60%');
      document.documentElement.style.setProperty('--background', '0 0% 100%');
    }
  }, [isDark]);
  
  return { isDark, setIsDark };
}
```

---

## **8. Animation Timing**

### Adjust Transition Speed
```css
/* Current */
.transition-notion {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Faster */
.transition-notion {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Slower (More Premium) */
.transition-notion {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Change Easing Function
```css
/* Linear (no easing) */
transition: all 0.3s linear;

/* Ease In */
transition: all 0.3s ease-in;

/* Custom Bezier */
transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

---

## **9. Spacing Adjustments**

### Global Spacing Scale
```css
:root {
  --radius: 0.5rem;   /* xs - Sharp corners */
  --radius: 0.75rem;  /* sm - Current */
  --radius: 1rem;     /* md - Rounded */
  --radius: 1.5rem;   /* lg - Very rounded */
  --radius: 9999px;   /* full - Completely rounded */
}
```

---

## **10. Creating Theme Variants**

### Add Multiple Color Schemes
```tsx
// src/hooks/useColorScheme.ts
const colorSchemes = {
  notion: {
    primary: '240 84% 55%',
    accent: '264 90% 52%',
  },
  slack: {
    primary: '231 100% 40%',
    accent: '360 100% 50%',
  },
  figma: {
    primary: '201 100% 50%',
    accent: '0 100% 50%',
  },
};

export function useColorScheme(scheme: string) {
  const colors = colorSchemes[scheme];
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });
}
```

---

## **11. Component-Specific Customization**

### Sidebar Customization
```tsx
// src/components/Sidebar.tsx
// Change gradient line:
className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"

// To:
className="h-1.5 w-full bg-gradient-to-r from-pink-600 via-red-600 to-pink-600"
```

### Button Style Override
```tsx
// Override for specific button:
className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold"
```

---

## **12. Adding New CSS Classes**

```css
/* Add to src/index.css @layer components */

@layer components {
  /* New button variant */
  .btn-outline {
    @apply border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600/10;
  }
  
  /* New card style */
  .card-premium {
    @apply glass-card rounded-2xl p-6 card-hover;
  }
  
  /* New text effect */
  .text-premium {
    @apply gradient-text text-lg font-bold;
  }
}
```

---

## **13. Quick Reference - Color Values**

### HSL Format (For Custom Colors)
```
Blue-600: 240 84% 55%
Blue-500: 239 100% 64%
Blue-700: 242 72% 46%
Purple-600: 264 90% 52%
Purple-500: 263 100% 61%
Green-600: 132 52% 36%
Red-600: 16 91% 55%
Orange-600: 16 86% 51%
```

---

## **14. Using CSS Variables in JavaScript**

```tsx
// Get CSS variable
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary');

// Set CSS variable
document.documentElement.style.setProperty('--primary', '240 84% 55%');

// Apply with React state
const [primaryHue, setPrimaryHue] = useState('240 84% 55%');
useEffect(() => {
  document.documentElement.style.setProperty('--primary', primaryHue);
}, [primaryHue]);
```

---

## **15. Performance Optimization**

### Reduce Animation Complexity
```css
/* Disable animations on mobile */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Optimize Shadows
```css
/* Simpler shadows for performance */
:root {
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.15);  /* Reduced complexity */
}
```

---

## **🎨 Design Resources**

- **Notion Design**: https://www.notion.so
- **Tailwind Colors**: https://tailwindcss.com/docs/customizing-colors
- **Shadcn/ui**: https://ui.shadcn.com
- **Color Picker**: https://www.colorhexa.com

---

## **Quick Tips**

1. **Test on mobile** - Ensure touch targets are at least 44x44px
2. **Check contrast** - Use WebAIM for accessibility testing
3. **Use browser DevTools** - Edit CSS in real-time
4. **Create variants** - Keep multiple color schemes as options
5. **Document changes** - Update this file with your customizations

---

**Happy customizing! 🎨✨**

