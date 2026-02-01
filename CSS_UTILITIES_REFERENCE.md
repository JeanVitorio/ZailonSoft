# 🎨 **CSS Utilities Reference - Notion Design System**

## **Complete List of Available CSS Classes & Variables**

---

## **📦 CSS Variables (Tailwind Colors)**

### Primary Colors
```css
--primary: 240 84% 55%;             /* Blue-600 */
--primary-foreground: 0 0% 100%;    /* White */
```

### Accent Colors
```css
--accent: 264 90% 52%;              /* Purple-600 */
--accent-foreground: 0 0% 100%;     /* White */
```

### Background & Surface
```css
--background: 213 47% 8%;           /* Deep Blue-Black */
--foreground: 210 40% 98%;          /* Light text */
--card: 213 32% 13%;                /* Card Dark Blue */
--card-foreground: 210 40% 98%;     /* Card text */
```

### Borders & Inputs
```css
--border: 213 15% 25%;              /* Border color */
--input: 213 20% 18%;               /* Input background */
--ring: 264 90% 52%;                /* Focus ring (Purple) */
```

### Muted States
```css
--muted: 213 10% 35%;               /* Muted background */
--muted-foreground: 210 14% 65%;    /* Muted text */
```

### Destructive/Error
```css
--destructive: 0 84% 60%;           /* Red for errors */
--destructive-foreground: 0 0% 98%; /* Error text */
```

### Secondary
```css
--secondary: 213 32% 13%;           /* Dark blue */
--secondary-foreground: 0 0% 98%;   /* Secondary text */
```

### Radius (Corner Rounding)
```css
--radius: 1rem;                     /* Default border radius */
```

---

## **🌈 Gradient Variables**

### Primary Gradient (Blue → Purple)
```css
--gradient-primary: linear-gradient(
  135deg,
  hsl(240 84% 55%),   /* Blue-600 */
  hsl(264 90% 52%)    /* Purple-600 */
);
```

### Accent Gradient (Purple → Indigo)
```css
--gradient-accent: linear-gradient(
  135deg,
  hsl(264 90% 52%),   /* Purple-600 */
  hsl(280 75% 48%)    /* Indigo-600 */
);
```

### Dark Gradient (For backgrounds)
```css
--gradient-dark: linear-gradient(
  180deg,
  hsl(213 32% 13%),   /* Dark Blue */
  hsl(213 47% 8%)     /* Deep Blue */
);
```

### Card Gradient
```css
--gradient-card: linear-gradient(
  145deg,
  rgba(30, 41, 82, 0.6),     /* Light blue */
  rgba(20, 28, 58, 0.8)      /* Dark blue */
);
```

---

## **✨ Shadow Variables**

### Small Shadow
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
```

### Medium Shadow
```css
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
```

### Large Shadow
```css
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
```

### Glow Effect (Small)
```css
--shadow-glow: 0 0 30px hsl(264 90% 52% / 0.25);
/* Purple-600 glow at 25% opacity */
```

### Glow Effect (Large)
```css
--shadow-glow-lg: 0 0 50px hsl(264 90% 52% / 0.35);
/* Purple-600 glow at 35% opacity */
```

### Card Shadow
```css
--shadow-card: 0 12px 48px rgba(0, 0, 0, 0.6);
```

---

## **🔷 Glass Morphism Variables**

### Glass Background
```css
--glass-bg: hsl(213 32% 13% / 0.7);
/* Dark blue at 70% opacity */
```

### Glass Border
```css
--glass-border: hsl(210 100% 100% / 0.1);
/* White at 10% opacity */
```

### Backdrop Blur
```css
--backdrop-blur: blur(16px);
/* Frosted glass effect */
```

---

## **🎨 Utility Classes**

### `.glass-card` - Glass Morphism Container
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--glass-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  border-color: hsl(264 90% 52% / 0.3);
  box-shadow: var(--shadow-glow);
}
```

**Usage**:
```tsx
<div className="glass-card p-6 rounded-xl">
  Your content here
</div>
```

---

### `.gradient-text` - Text Gradient Fill
```css
.gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}
```

**Usage**:
```tsx
<h1 className="gradient-text text-3xl">
  Premium Heading
</h1>
```

---

### `.btn-primary` - Primary Button
```css
.btn-primary {
  background: var(--gradient-primary);
  box-shadow: var(--shadow-glow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  font-weight: 600;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-lg);
}

.btn-primary:active {
  transform: translateY(0);
}
```

**Usage**:
```tsx
<button className="btn-primary px-6 py-2 rounded-lg text-white">
  Click me
</button>
```

---

### `.btn-secondary` - Secondary Button
```css
.btn-secondary {
  background: hsl(213 32% 13%);
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: hsl(264 90% 52%);
  background: hsl(213 35% 18%);
  box-shadow: inset 0 0 20px hsl(264 90% 52% / 0.1);
}
```

**Usage**:
```tsx
<button className="btn-secondary px-6 py-2 rounded-lg">
  Secondary
</button>
```

---

### `.card-hover` - Card Hover Animation
```css
.card-hover {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: var(--shadow-card);
}
```

**Usage**:
```tsx
<div className="card-hover bg-card rounded-lg p-4">
  Hover to see effect
</div>
```

---

### `.input-focus` - Input Focus State
```css
.input-focus:focus-within {
  border-color: hsl(264 90% 52%) !important;
  box-shadow: 
    inset 0 0 0 3px hsl(264 90% 52% / 0.1), 
    0 0 0 3px hsl(264 90% 52% / 0.15);
}
```

**Usage**:
```tsx
<div className="input-focus">
  <input type="text" />
</div>
```

---

### `.badge-notion` - Badge Style
```css
.badge-notion {
  background: hsl(264 90% 52% / 0.15);
  border: 1px solid hsl(264 90% 52% / 0.3);
  color: hsl(264 100% 75%);
}
```

**Usage**:
```tsx
<span className="badge-notion px-3 py-1 rounded-full text-sm">
  Badge
</span>
```

---

### `.table-row-hover` - Table Row Hover
```css
.table-row-hover:hover {
  background: hsl(264 90% 52% / 0.08);
}
```

**Usage**:
```tsx
<tr className="table-row-hover">
  <td>Row content</td>
</tr>
```

---

### `.scrollbar-hide` - Hide Scrollbar
```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

**Usage**:
```tsx
<div className="scrollbar-hide overflow-auto">
  Scrollable content without visible scrollbar
</div>
```

---

### `.scrollbar-custom` - Custom Scrollbar
```css
.scrollbar-custom::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: hsl(213 20% 12%);
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background: hsl(264 90% 52% / 0.5);
  border-radius: 4px;
  transition: background 0.3s;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: hsl(264 90% 52% / 0.8);
}
```

**Usage**:
```tsx
<div className="scrollbar-custom overflow-auto h-96">
  Scrollable content with custom scrollbar
</div>
```

---

### `.spinner-notion` - Loading Spinner
```css
.spinner-notion {
  background: conic-gradient(
    from 0deg,
    hsl(264 90% 52%),    /* Purple */
    hsl(240 84% 55%),    /* Blue */
    hsl(264 90% 52%)     /* Purple */
  );
}
```

**Usage**:
```tsx
<div className="spinner-notion w-12 h-12 rounded-full animate-spin" />
```

---

### `.transition-notion` - Smooth Transition
```css
.transition-notion {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Usage**:
```tsx
<div className="transition-notion hover:scale-105">
  Hover me
</div>
```

---

## **🎯 Common Usage Patterns**

### Premium Card
```tsx
<div className="glass-card rounded-xl p-6 card-hover">
  <h2 className="gradient-text text-2xl mb-4">Title</h2>
  <p>Content</p>
  <button className="btn-primary px-4 py-2 rounded-lg mt-4">
    Action
  </button>
</div>
```

### Input Group
```tsx
<div className="space-y-2 input-focus">
  <label className="text-sm font-semibold">Label</label>
  <input 
    type="text" 
    className="w-full bg-input border border-border rounded-lg px-3 py-2"
    placeholder="Enter text"
  />
</div>
```

### Badge Group
```tsx
<div className="flex gap-2">
  <span className="badge-notion px-3 py-1 rounded-full">
    Badge 1
  </span>
  <span className="badge-notion px-3 py-1 rounded-full">
    Badge 2
  </span>
</div>
```

### Loading State
```tsx
<div className="flex items-center justify-center gap-3 p-4">
  <div className="spinner-notion w-6 h-6 rounded-full animate-spin" />
  <span className="text-muted-foreground">Loading...</span>
</div>
```

---

## **📱 Responsive Utilities**

### Tailwind Responsive Prefixes
```tsx
// Mobile first
className="w-full md:w-1/2 lg:w-1/3"

// With glass-card
className="glass-card p-4 md:p-6 lg:p-8"

// Responsive text
className="text-sm md:text-base lg:text-lg"
```

---

## **🎨 Color Aliases**

```css
/* Blue colors */
blue-500: hsl(239 100% 64%)
blue-600: hsl(240 84% 55%)  ← Primary
blue-700: hsl(242 72% 46%)

/* Purple colors */
purple-600: hsl(264 90% 52%)   ← Accent
purple-500: hsl(263 100% 61%)
purple-700: hsl(264 90% 45%)

/* Slate colors */
slate-950: hsl(213 47% 8%)     ← Background
slate-900: hsl(217 32% 17%)
slate-800: hsl(217 32% 17%)
```

---

## **✅ Quick Copy-Paste Examples**

### Premium Container
```tsx
<div className="glass-card rounded-2xl p-6 card-hover">
  Content
</div>
```

### Main Button
```tsx
<button className="btn-primary px-6 py-2 rounded-lg text-white font-semibold">
  Click
</button>
```

### Loading Indicator
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
```

### Gradient Heading
```tsx
<h1 className="gradient-text text-4xl font-bold">
  Your Title
</h1>
```

### Input Field
```tsx
<input 
  className="w-full bg-input border border-blue-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
  placeholder="Enter text"
/>
```

---

**All utilities ready to use! 🚀**

