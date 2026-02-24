# Earth Observation Platform

A modern, dark-themed marketing website built with React/TypeScript showcasing satellite data products, industries served, pricing, and partners.

## Tech Stack

### Core
- **React 18+** with TypeScript for type-safe component development
- **Vite** for fast development and optimized production builds
- **React Router v6** for client-side routing

### Styling & UI
- **Tailwind CSS** for utility-first styling with dark theme
- **shadcn/ui** for accessible, customizable components
- **Framer Motion** for declarative animations

### Development Tools
- **TypeScript** for static type checking
- **ESLint** for code quality
- **Prettier** for code formatting
- **Vitest** for unit and property-based testing

## Project Structure

```
src/
├── components/     # Reusable UI components
│   └── ui/        # shadcn/ui components
├── pages/         # Page components
├── lib/           # Utility functions
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
└── test/          # Test files
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Theme Configuration

The project uses a dark theme with:
- **Backgrounds**: Navy/black (HSL: 220 25% 5%)
- **Text**: White (HSL: 210 40% 98%)
- **Accents**: Gold/yellow (HSL: 45 100% 55%)

Theme colors are configured in `src/index.css` using CSS custom properties.

## Development Phases

### Phase 1: Foundation & Homepage
- Core navigation, hero section, product carousel, industries tabs, and static content

### Phase 2: Additional Pages
- Products, Industries, Pricing, Partners, About, Blog, Specs pages

### Phase 3: Backend Integration
- Authentication, CMS, demo booking, and user management with Node.js/Express and MongoDB

## Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting

Configuration files:
- `.prettierrc` - Prettier configuration
- `eslint.config.js` - ESLint configuration

## License

Private
