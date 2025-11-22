# Starfield Planner

A comprehensive web-based planning tool for the Starfield video game, built with React, TypeScript, and Vite. Manage outposts, plan resources, track profits, explore planets, and organize your materials with an intuitive interface.

> **Disclaimer:** This is an unofficial fan-made tool and is not affiliated with Bethesda Softworks LLC. All game content © Bethesda Softworks LLC.

## Features

- 🏭 **My Outposts** - Create and manage mining outposts with resource extraction tracking
- 🛒 **Shopping List** - Keep track of materials you need to collect with quantities
- 💰 **Profit Calculator** - Analyze crafting opportunities and profit margins for manufactured items
- 🌍 **Planets Database** - Explore 15 detailed worlds with resources, biomes, fauna, and settlements
- 📊 **Resources Management** - Browse 46 game resources with rarity filtering and color coding
- 🛠️ **Items Database** - Explore 68 craftable items with ingredient requirements and profit analysis
- 🎨 **Modern UI** - Dark Starfield theme with responsive design and smooth animations
- 📱 **Mobile Friendly** - Collapsing header and horizontal tab scrolling for mobile devices
- 🌟 **Rarity System** - Color-coded rarity levels (Common, Uncommon, Rare, Exotic) with Special Projects skill requirements

## Project Structure

```
starfield-planner/
├── public/                    # Static assets
├── src/
│   ├── components/           # React components (6 main tabs)
│   │   ├── MyOutposts.tsx   # Outpost management and resource extraction
│   │   ├── Shopping.tsx     # Shopping list with quantities
│   │   ├── Profits.tsx      # Manufacturing profit calculator
│   │   ├── Planets.tsx      # Planet database with filtering
│   │   ├── Resources.tsx    # Resources browser with rarity system
│   │   └── Items.tsx        # Items database with crafting recipes
│   ├── data/
│   │   └── starfield.json   # Comprehensive game data
│   ├── App.tsx              # Main application with tab navigation
│   ├── main.tsx             # Application entry point
│   └── *.css                # Styling files
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.*.json          # TypeScript configuration
└── README.md                # This file
```

## Navigation Tabs

The application features 6 main tabs accessible via horizontal scrolling navigation:

1. **My Outposts** - Create outposts on planets, track resource extraction rates, manage multiple locations
2. **Shopping** - Add items from any tab, manage quantities, clear completed items
3. **Profits** - Sort by profit margins, analyze manufacturing costs vs. sale value
4. **Planets** - Filter by type/level/system, explore biomes and settlements, add resources to shopping
5. **Resources** - Filter by rarity, color-coded display, add to shopping list
6. **Items** - Browse crafting recipes, ingredient requirements, add materials to shopping

## Tech Stack

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **TailwindCSS v4** - Utility-first CSS framework
- **ESLint** - Code linting and formatting

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation & Setup

1. **Navigate to the project directory:**

   ```bash
   cd starfield-planner
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:5173`
   - The app will automatically reload when you make changes

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## Development

### Adding New Data

Game data is stored in `src/data/starfield.json`. The structure includes:

- **`rarityLevels`** - Color codes and skill requirements for Common, Uncommon, Rare, Exotic items
- **`resources`** - 46 raw materials with rarity, value, and unique IDs (r1-r46)
- **`items`** - 68 craftable items with ingredient requirements, crafting time, and profit calculations
- **`planets`** - 15 detailed worlds with resources, biomes, fauna, settlements, and difficulty levels

### Component Overview

- **MyOutposts** - Create outposts on planets, assign resource extraction, manage multiple mining operations
- **Shopping** - Persistent shopping list with add/remove/quantity controls, integrates with all tabs
- **Profits** - Sortable profit analysis for manufactured items, shows materials cost vs. sale value
- **Planets** - Searchable database of worlds with filtering by type, level, system, and resource visibility
- **Resources** - Color-coded resource browser with rarity filtering and direct shopping list integration
- **Items** - Craftable items database showing ingredients, time, and profit potential

### User Interface Features

- **Collapsing Header** - Title collapses on scroll, keeping navigation tabs always accessible
- **Rarity Color System** - White (Common), Green (Uncommon), Blue (Rare), Purple (Exotic)
- **Mobile Responsive** - Horizontal tab scrolling, touch-friendly interface
- **Dark Theme** - Consistent Starfield-inspired dark color scheme across all components
- **State Persistence** - Shopping list and outposts persist across tab navigation

### Styling

This project uses TailwindCSS v4 with the new PostCSS plugin. Custom styles can be added in:

- `src/App.css` - Component-specific styles
- `src/index.css` - Global styles and Tailwind imports

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source. Game content and assets belong to Bethesda Softworks LLC.

---

_Happy planning, spacefarer! 🚀_
