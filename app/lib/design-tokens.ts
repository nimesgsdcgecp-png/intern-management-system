/**
 * Design Tokens for Premium Intern Management System
 * Theme: "Modern Enterprise Efficiency"
 * Aesthetic: Nature-inspired professional colors with glassmorphism
 */

// Nature-Inspired Color Palette
export const colors = {
  // Primary Colors
  deepSpaceIndigo: 'hsl(222, 47%, 11%)', // #1e1b4b - Sidebar and high-contrast areas
  electricBlue: 'hsl(217, 91%, 60%)',    // #3b82f6 - Primary CTAs and active states
  emerald: 'hsl(142, 70%, 45%)',         // #10b981 - Success and completion states
  softPearl: 'hsl(0, 0%, 98%)',          // #fafafc - Main content background

  // Glass Surface Colors (with transparency)
  glassSurface: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  glassHighlight: 'rgba(255, 255, 255, 0.1)',

  // Semantic Colors
  warning: 'hsl(45, 93%, 47%)',   // #f59e0b - Warnings and pending states
  error: 'hsl(0, 84%, 60%)',      // #ef4444 - Errors and destructive actions
  info: 'hsl(200, 94%, 56%)',     // #0ea5e9 - Information and links

  // Gray Scale
  gray: {
    50: 'hsl(210, 40%, 98%)',   // #f8fafc
    100: 'hsl(210, 40%, 96%)',  // #f1f5f9
    200: 'hsl(214, 32%, 91%)',  // #e2e8f0
    300: 'hsl(213, 27%, 84%)',  // #cbd5e1
    400: 'hsl(215, 20%, 65%)',  // #94a3b8
    500: 'hsl(215, 16%, 47%)',  // #64748b
    600: 'hsl(215, 19%, 35%)',  // #475569
    700: 'hsl(215, 25%, 27%)',  // #334155
    800: 'hsl(217, 33%, 17%)',  // #1e293b
    900: 'hsl(222, 84%, 5%)',   // #0f172a
  }
} as const;

// Typography System
export const typography = {
  fonts: {
    sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },

  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },

  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
} as const;

// Spacing System (24px/32px base rhythm)
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px - Base rhythm
  8: '2rem',      // 32px - Secondary rhythm
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

// Border Radius System
export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  base: '0.5rem',   // 8px
  md: '0.75rem',    // 12px - Small cards and buttons
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px - Main containers
  '2xl': '2rem',    // 32px
  full: '9999px',   // Fully rounded
} as const;

// Animation System
export const animations = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },

  // Easing Functions
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    premium: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Framer Motion Variants
  stagger: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      },
    },
  },

  // Hover Effects
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },

  // Tap Effects
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
} as const;

// Glassmorphism Effects
export const glassmorphism = {
  backdrop: {
    blur: '12px',
    saturate: '180%',
  },

  surface: {
    background: colors.glassSurface,
    backdropFilter: `blur(12px) saturate(180%)`,
    border: `1px solid ${colors.glassBorder}`,
    boxShadow: `
      0 8px 32px 0 rgba(31, 38, 135, 0.37),
      inset 0 1px 1px 0 ${colors.glassHighlight}
    `,
  },

  card: {
    background: colors.glassSurface,
    backdropFilter: 'blur(12px) saturate(180%)',
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: borderRadius.xl,
    boxShadow: `
      0 4px 16px 0 rgba(0, 0, 0, 0.1),
      inset 0 1px 1px 0 ${colors.glassHighlight}
    `,
  },
} as const;

// Grid System
export const grid = {
  columns: 12,
  gutters: {
    mobile: spacing[4],   // 16px
    tablet: spacing[6],   // 24px
    desktop: spacing[8],  // 32px
  },

  containers: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: '0 0 15px rgba(59, 130, 246, 0.3)', // Electric blue glow for active states
} as const;

// Z-Index Scale
export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Breakpoints
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Helper Functions
export const createGlassEffect = (opacity: number = 0.7) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: glassmorphism.backdrop.blur,
  border: `1px solid ${colors.glassBorder}`,
  boxShadow: shadows.md,
});

export const createHoverGlow = (color: string = colors.electricBlue) => `
  0 0 20px ${color}40,
  0 0 40px ${color}20
`;