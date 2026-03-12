/**
 * StudyFlow Aurora Design System
 *
 * This file serves as both documentation and a reference for the StudyFlow design system.
 * It includes design tokens, component guidelines, and an AI system prompt for maintaining
 * design consistency across the application.
 */

export const DESIGN_SYSTEM = {
  name: 'StudyFlow Aurora',
  version: '2.0',
  description:
    'A modern, glassmorphic design system for the StudyFlow learning platform, featuring gradient accents, subtle animations, and layered depth through blur and shadow effects.',

  colors: {
    brand: {
      primary: '#6366f1', // indigo-500
      light: '#e0e7ff', // indigo-100
      dark: '#3730a3', // indigo-900
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Primary brand color for main CTAs, headers, and key UI elements',
    },
    accent: {
      primary: '#ec4899', // fuchsia-500
      light: '#fce7f3', // fuchsia-100
      dark: '#9d174d', // fuchsia-900
      gradient: 'from-fuchsia-500 to-pink-600',
      description: 'Highlight color for achievements, streaks, and important badges',
    },
    surface: {
      primary: '#1e293b', // slate-800
      secondary: '#64748b', // slate-500
      tertiary: '#cbd5e1', // slate-300
      light: '#f1f5f9', // slate-100
      description: 'Text and surface colors following accessible contrast ratios',
    },
    semantic: {
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#ef4444', // red-500
      info: '#0ea5e9', // cyan-500
      description: 'Colors for status messages and feedback',
    },
  },

  glassmorphism: {
    glass: {
      classes: 'bg-white/70 backdrop-blur-xl border border-white/20',
      description: 'Standard glass card for primary content areas',
    },
    glass_dark: {
      classes: 'bg-slate-900/50 backdrop-blur-xl border border-slate-700/30',
      description: 'Dark glass variant for contrast against light backgrounds',
    },
    glass_brand: {
      classes: 'bg-indigo-500/10 backdrop-blur-xl border border-indigo-400/20',
      description: 'Branded glass card with indigo tint for highlighted sections',
    },
    glass_subtle: {
      classes: 'bg-white/40 backdrop-blur-md border border-white/10',
      description: 'Subtle glass for secondary content and hover states',
    },
  },

  animations: [
    {
      name: 'float',
      description: 'Gentle floating motion for blob elements and decorative shapes',
      classes: 'animate-float',
    },
    {
      name: 'pulse-soft',
      description: 'Subtle pulsing effect for active indicators',
      classes: 'animate-pulse-soft',
    },
    {
      name: 'gradient-shift',
      description: 'Smooth gradient animation for text and backgrounds',
      classes: 'animate-gradient-shift',
    },
    {
      name: 'slide-up',
      description: 'Entrance animation with staggered delays for list items',
      classes: 'animate-slide-up',
    },
    {
      name: 'fade-in',
      description: 'Smooth opacity transition',
      classes: 'animate-fade-in',
    },
    {
      name: 'scale-in',
      description: 'Scale and fade entrance for interactive elements',
      classes: 'animate-scale-in',
    },
    {
      name: 'shimmer',
      description: 'Loading skeleton animation with light sweep',
      classes: 'animate-shimmer',
    },
    {
      name: 'blob',
      description: 'Organic blob morphing animation for decorative elements',
      classes: 'animate-blob',
    },
    {
      name: 'glow',
      description: 'Pulsing glow effect for highlighted elements',
      classes: 'animate-glow',
    },
  ],

  components: {
    'card-glass': {
      classes: 'bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-glass',
      description: 'Primary glass card for content containers',
    },
    'card-hover': {
      classes:
        'bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-glass hover:shadow-lg hover:border-white/40 transition-all duration-300 cursor-pointer',
      description: 'Interactive glass card with hover effects',
    },
    'card-interactive': {
      classes:
        'bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-glass hover:bg-white/80 hover:border-indigo-300/30 active:scale-95 transition-all duration-200 cursor-pointer',
      description: 'Clickable card with scale and color feedback',
    },
    'progress-bar': {
      classes: 'bg-slate-200 rounded-full h-2 overflow-hidden',
      description: 'Container for progress indicators',
    },
    'progress-fill': {
      classes: 'h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full transition-all duration-500',
      description: 'Animated progress fill with gradient',
    },
    'stat-card': {
      classes:
        'bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-glass hover:shadow-lg transition-shadow',
      description: 'Card for displaying statistics with gradient borders on hover',
    },
    'btn-primary': {
      classes:
        'px-6 py-2.5 rounded-2xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      description: 'Primary action button with indigo gradient',
    },
    'btn-secondary': {
      classes:
        'px-6 py-2.5 rounded-2xl font-semibold text-indigo-600 bg-white/70 backdrop-blur-xl border border-white/20 hover:bg-white/80 hover:border-indigo-300/30 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      description: 'Secondary action button with glass background',
    },
    'text-gradient': {
      classes: 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent',
      description: 'Gradient text for titles and important headings',
    },
    'badge-achievement': {
      classes:
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 text-fuchsia-700 border border-fuchsia-300/30',
      description: 'Badge for achievements and special accomplishments',
    },
  },

  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    headings: {
      h1: 'text-4xl md:text-5xl font-bold text-gradient',
      h2: 'text-3xl md:text-4xl font-bold text-slate-900',
      h3: 'text-2xl md:text-3xl font-bold text-slate-800',
      h4: 'text-xl md:text-2xl font-semibold text-slate-800',
      h5: 'text-lg md:text-xl font-semibold text-slate-700',
    },
    body: {
      large: 'text-lg text-slate-700 leading-relaxed',
      base: 'text-base text-slate-700 leading-relaxed',
      small: 'text-sm text-slate-600 leading-relaxed',
    },
    gradientText: 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
    description: 'Standard spacing scale used for margins, padding, and gaps',
  },

  principles: [
    'Glass over opaque — prefer glassmorphism cards over flat, solid backgrounds',
    'Gradient accents on key actions — use brand and accent gradients for primary CTAs and highlights',
    'Depth through blur and shadow layers — combine backdrop-blur, border opacity, and subtle shadows for layering',
    'Subtle motion for life — animate entrances, hovers, and state changes with gentle, purposeful animations',
    'Consistent rounded-2xl corners — maintain visual cohesion with rounded-2xl as the standard border radius',
    'Accessibility first — maintain WCAG AA contrast ratios and semantic HTML',
    'Mobile responsive — design for mobile-first, ensuring all glass effects and animations scale smoothly',
  ],
};

/**
 * AI System Prompt for Design Consistency
 *
 * This prompt instructs AI systems (like the tutor or code generation tools) to maintain
 * StudyFlow Aurora design consistency when creating, modifying, or suggesting UI changes.
 */
export const UI_AGENT_SYSTEM_PROMPT = `You are a UI design expert for the StudyFlow Aurora design system (v2.0).

## Core Design Principles
Always adhere to these fundamental principles:
1. Glass over opaque — prefer glassmorphism cards (bg-white/70 backdrop-blur-xl) over flat white backgrounds
2. Gradient accents on key actions — use indigo and fuchsia gradients for primary CTAs and highlights
3. Depth through blur and shadow layers — combine backdrop-blur, border opacity, and shadow-glass
4. Subtle motion for life — animate entrances and hovers with gentle animations (animate-slide-up, animate-fade-in)
5. Consistent rounded-2xl corners — maintain visual cohesion with rounded-2xl border radius

## Color Hierarchy
- **Brand (Indigo)**: Primary UI elements, headers, main CTAs, progress fills
- **Accent (Fuchsia/Pink)**: Achievements, streaks, badges, highlights, secondary gradients
- **Surface (Slate)**: Text hierarchy, backgrounds, borders
- **Semantic**: Success (emerald), Warning (amber), Error (red), Info (cyan)

## Component Guidelines

### Cards & Containers
- Always use: \`bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-glass\`
- For interactive cards: add \`hover:border-white/40 hover:shadow-lg transition-all\`
- Never use flat gray-50 backgrounds or plain white without backdrop-blur
- Apply shadow-glass to glass elements, shadow-soft for regular cards

### Buttons
- Primary actions: Use \`btn-primary\` class (gradient indigo, shadow-lg on hover)
- Secondary actions: Use \`btn-secondary\` class (glass background with indigo text)
- Always include: rounded-2xl, active:scale-95, smooth transitions
- Disabled state: opacity-50 with cursor-not-allowed

### Typography
- Page titles & important headings: Apply \`text-gradient\` class (indigo-600 to fuchsia-600)
- Use semantic heading hierarchy (h1 > h2 > h3)
- Body text: Use slate-700 for primary, slate-600 for secondary
- Maintain leading-relaxed for readability

### Progress Indicators
- Container: \`progress-bar\` (bg-slate-200 rounded-full h-2)
- Fill: \`progress-fill\` (gradient indigo to fuchsia, animate-all duration-500)
- Always animate progress changes smoothly

### Statistical Displays
- Use \`stat-card\` for showing metrics (glass background with gradient borders on hover)
- Include gradient fills for visual interest
- Pair with appropriate semantic colors (success=emerald, warning=amber, etc.)

### Lists & Collections
- Apply \`animate-slide-up\` with staggered delays (delay-100, delay-200, delay-300...)
- Wrap items in card-hover or card-interactive for clickable elements
- Use consistent spacing (gap-4 or gap-6)

### Hero & Header Sections
- Include subtle floating blob animations (animate-float, animate-blob)
- Use bg-mesh or gradient backgrounds (not flat colors)
- Combine glass cards with floating decorative elements
- Maintain breathing room with generous padding

### Badges & Achievement Indicators
- Use \`badge-achievement\` class for special accomplishments
- Apply fuchsia/pink gradients for positive feedback
- Include border with color tint (border-fuchsia-300/30)

## Animation Guidelines
- **Entrance**: animate-slide-up (with staggered delays), animate-fade-in
- **Hover**: Subtle scale-up (hover:scale-105), shadow increase, color shift
- **Active**: scale-95 for tactile feedback
- **Loading**: animate-shimmer for skeleton states, animate-pulse-soft for indicators
- **Decorative**: animate-float for blobs, animate-glow for highlights
- Duration: 200ms for interactive, 300ms for transitions, 500ms for progress

## What NOT to Do
- Never use flat gray-50 or plain white cards without backdrop-blur
- Don't use gray text directly — always use slate colors with proper contrast
- Avoid sharp corners (use rounded-2xl consistently)
- Don't apply heavy shadows without glass morphism context
- Never skip animations on interactive elements
- Don't use gradients on body text (only headings and CTAs)
- Avoid using more than 2 accent colors in a single component

## Example Pattern
When creating a new component, follow this structure:
\`\`\`tsx
<div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-glass p-6 hover:border-white/40 hover:shadow-lg transition-all duration-300">
  <h3 className="text-2xl font-bold text-gradient mb-4">Component Title</h3>
  <p className="text-slate-700 mb-6">Description text here</p>
  <button className="btn-primary">Primary Action</button>
</div>
\`\`\`

## Mobile Responsiveness
- All glass effects and animations should scale smoothly to mobile
- Use responsive text sizes (text-sm md:text-base lg:text-lg)
- Ensure touch targets are at least 44px for accessibility
- Test glass effects on lower-end devices for performance

Remember: StudyFlow Aurora prioritizes both aesthetic beauty and functional accessibility. Every design decision should enhance the user's learning experience while maintaining visual consistency across the platform.`;
