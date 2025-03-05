# CLAUDE.md - Coding Guidelines

## Development Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint on all TS/JS files
- `npm run start`: Start production server

## Code Style Guidelines
- **TypeScript**: Strict mode enabled, prefer type imports
- **React**: Functional components with typed props
- **Imports**: Ordered: react/next → external → internal → types
  - Organize with blank lines between groups
  - Alphabetize within groups
- **Component Structure**: Props interface → styles → component function → export
- **Naming**: React components PascalCase, hooks use camelCase with 'use' prefix
- **Error Handling**: Prefer try/catch blocks, use toast notifications for UI
- **Styling**: TailwindCSS with component composition, use cn utility for conditionals
- **Self-closing Tags**: Required when component has no children
- **Console**: No console.log allowed (only console.warn/error)
- **Destructuring**: Prefer object destructuring for props and state
- **Hooks**: Follow React hooks rules strictly (enforced by ESLint)