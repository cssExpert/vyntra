
# Project: [ERVFlow]

## RULE TO FOLOOW
- [Rule 1 — be specific]
- [Rule 2 - Make change what is prompted for ]
- [Rule 3 - Always follow the folder/file structure and use the already available components ]
- [Rule 4 - Always follow the Font Sizes used in modules, keep the heading in ascending order like h1, h2 etc ]
- [Rule 5 - Always Use the @tanstack/react-table when asked for table ]
- [Rule 6 - Always Use the Modal from the common Component ]
- [Rule 7 - Always Use the font size classes like text-xs or text-sm md: lg: don't add text-[12px] ]
- [Rule 8 - Always Use MoverLeft/MoverRight icon for Next/Previous ]
- [Rule 9 - Always Use the same React Color for Colors palette. ]
- [Rule 10 - Always Use ui/button when need to add a Button on page/file/modal ]
- [Rule 11 - for the Dropdown, always use React Popover dropdown which we using for Table so that it never clipped/hidden etc ]


## Rules - Core

- ALWAYS run tests after changes
- ALWAYS use TypeScript strict mode
- NEVER commit directly to main
- Keep files under 300 lines — split if larger


## Rule 12 - Responsive First

- ALWAYS test Desktop, Tablet and Mobile views
- ALWAYS verify layouts at:
  - 1440px
  - 1280px
  - 1024px
  - 768px
  - 640px
  - 390px
- NEVER introduce horizontal scrolling
- ALWAYS stack cards correctly on mobile
- ALWAYS verify touch targets are at least 44px


## Rule 13 - Tailwind Standards

- NEVER use inline styles unless explicitly required
- ALWAYS prefer Tailwind utility classes
- NEVER use !important
- ALWAYS reuse existing utility patterns
- NEVER create duplicate utility combinations


## Rule 14 - Design System Consistency

- ALWAYS use existing design tokens
- ALWAYS use existing spacing scale
- ALWAYS use existing color palette
- NEVER introduce random colors
- NEVER introduce random font sizes
- NEVER introduce random border radius values


## Rule 15 - Component Reuse

- ALWAYS check for existing components before creating new ones
- NEVER duplicate component functionality
- PREFER composition over duplication
- Reuse common components whenever possible


## Rule 16 - Accessibility

- ALWAYS add aria-label where required
- ALWAYS ensure keyboard navigation works
- ALWAYS maintain heading hierarchy
- ALWAYS provide alt text for images
- NEVER reduce accessibility score


## Rule 17 - Performance

- ALWAYS lazy load large components
- ALWAYS lazy load images
- NEVER introduce unnecessary re-renders
- ALWAYS memoize expensive calculations
- ALWAYS optimize bundle size


## Rule 18 - Forms

- ALWAYS use React Hook Form
- ALWAYS use Zod validation
- ALWAYS show validation messages
- NEVER submit invalid forms


## Rule 19 - Modal Standards

- ALWAYS use common Modal component
- NEVER create custom modal implementations
- ALWAYS support ESC close
- ALWAYS support backdrop click close
- ALWAYS trap focus inside modal


## Rule 20 - Table Standards

- ALWAYS use @tanstack/react-table
- ALWAYS support sorting
- ALWAYS support pagination
- ALWAYS support loading state
- ALWAYS support empty state


## Rule 21 - ERVFlow Editor Standards

- NEVER break drag-and-drop functionality
- ALWAYS preserve selected element state
- ALWAYS preserve undo/redo history
- ALWAYS update Layers panel when elements change
- ALWAYS sync canvas state and layer state


## Rule 22 - Library Standards

- Components must be reusable
- Sections must be reusable
- Global elements must support sync updates
- Brand Kits must support theme switching
- Never create empty components


## Rule 23 - AI Generation Standards

- Generated content must use existing components
- Generated sections must follow design system
- Generated pages must be responsive
- Generated code must be TypeScript compatible


## Rule 24 - Code Quality

- No any types
- No console.log in production code
- No commented dead code
- No duplicated code
- No unused imports


## Rule 25 - Pre Completion Checklist

Before completing any task ALWAYS verify:

[ ] TypeScript has no errors
[ ] ESLint passes
[ ] Responsive on mobile
[ ] Responsive on tablet
[ ] Responsive on desktop
[ ] Existing functionality not broken
[ ] Design system followed
[ ] Reused existing components
[ ] Accessibility maintained
[ ] No console logs
