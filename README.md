# Starfield Planner

A comprehensive web-based planning tool for the Starfield video game, built with React, TypeScript, and Vite. Manage outposts, plan manufacturing chains, track profits, explore planets, and organize your materials with an intuitive interface.

> **Disclaimer:** This is an unofficial fan-made tool and is not affiliated with Bethesda Softworks LLC. All game content © Bethesda Softworks LLC.

> **Data Notice:** The current dataset is not yet comprehensive and includes a representative sample for development purposes. Future plans include migrating all planetary and resource data to a performant database for complete coverage.

## Features

- 🏭 **My Outposts** - Create and manage mining outposts with resource extraction tracking and skill-based limits
- 📋 **Manufacture Plans** - Design complex manufacturing chains with multi-tier dependencies, outpost requirement tracking, and item-to-item crafting
- 🛒 **Shopping List** - Keep track of materials you need to collect with quantities
- 💰 **Profit Calculator** - Analyze crafting opportunities and profit margins for manufactured items
- 🌍 **Planets Database** - Explore 50 detailed worlds across multiple star systems with resources, biomes, fauna, and settlements
- 📊 **Resources Management** - Browse 53 game resources with 5-tier rarity filtering, Organic/Inorganic categories, and color coding
- 🛠️ **Items Database** - Explore 80+ craftable items with complex ingredient requirements, multi-tier manufacturing chains, and profit analysis
- 🔬 **Multi-Tier Manufacturing** - Craft intermediate items to use as components in advanced products (e.g., circuits → processors → quantum computers)
- 🏷️ **Resource Categories** - Organic and Inorganic resource classification with dedicated filtering for strategic planning
- ⚙️ **Skill Integration** - Planetary Habitation and Special Projects skill level management with outpost limits (8-24 outposts)
- 🎨 **Modern UI** - Dark Starfield theme with responsive design and smooth animations
- 📱 **Mobile Friendly** - Collapsing header and horizontal tab scrolling for mobile devices
- 🌟 **5-Tier Rarity System** - Color-coded rarity levels (Common, Uncommon, Rare, Exotic, Unique) with Special Projects skill requirements
- 💾 **Data Persistence** - All outposts and manufacturing plans persist across browser sessions

## Project Structure

```
starfield-planner/
├── public/                    # Static assets
├── src/
│   ├── components/           # React components (7 main tabs)
│   │   ├── MyOutposts.tsx   # Outpost management with skill-based limits
│   │   ├── ManufacturePlans.tsx # Manufacturing chain planning with outpost tracking
│   │   ├── Shopping.tsx     # Shopping list with quantities
│   │   ├── Profits.tsx      # Manufacturing profit calculator
│   │   ├── Planets.tsx      # Planet database with filtering (50 planets)
│   │   ├── Resources.tsx    # Resources browser with 5-tier rarity system (48 resources)
│   │   └── Items.tsx        # Items database with crafting recipes
│   ├── data/
│   │   ├── starfield.json   # Core game data (resources, items, rarity system)
│   │   └── planets.json     # Planetary database (50 planets across multiple systems)
│   ├── App.tsx              # Main application with tab navigation and skill management
│   ├── main.tsx             # Application entry point
│   └── *.css                # Styling files
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.*.json          # TypeScript configuration
└── README.md                # This file
```

## Navigation Tabs

The application features 7 main tabs accessible via horizontal scrolling navigation:

1. **My Outposts** - Create outposts on planets, track resource extraction rates, manage skill-based limits (8-24 outposts)
2. **Manufacture Plans** - Design manufacturing chains, track outpost requirements, manage plan dependencies with chaining
3. **Shopping** - Add items from any tab, manage quantities, clear completed items
4. **Profits** - Sort by profit margins, analyze manufacturing costs vs. sale value
5. **Planets** - Filter by type/level/system, explore 50 worlds across multiple star systems
6. **Resources** - Filter by 5-tier rarity system, color-coded display, add to shopping list
7. **Items** - Browse crafting recipes, ingredient requirements, add materials to shopping

## New Features (Latest Update)

### 🔬 Multi-Tier Manufacturing System

- **Complex Manufacturing Chains**: Items can now use other crafted items as ingredients (e.g., Zero Wire + Paramagnon Conductor → Tasine Superconductor)
- **Supply Chain Planning**: Plan 3-4 level deep manufacturing processes with intermediate components
- **Component Dependencies**: Advanced items require multiple crafted sub-components, creating realistic production networks
- **Strategic Depth**: Higher-tier items (Unique/Exotic) require complex supply chains worth 3,000-5,500+ credits

### 🏷️ Resource Category System

- **Organic Resources**: Biological and chemical materials (Adhesive, Toxin, Benzene, Polymer, etc.)
- **Inorganic Resources**: Metals, minerals, and synthetic compounds (Aluminum, Gold, Indicite, Vytinium, etc.)
- **Category Filtering**: Dedicated filters in Resources and Items tabs for Organic/Inorganic classification
- **Strategic Planning**: Plan outposts by resource type availability (organic from life-bearing worlds, inorganic from mineral-rich planets)
- **Enhanced Database**: Expanded to 53 total resources including new exotic materials (Tasine, Rothicite, Veryl, Toxin)

### 🏭 Advanced Outpost Management

- **Skill-Based Limits**: Planetary Habitation skill determines outpost capacity (8 base + 4 per level, max 24)
- **Smart Deletion Protection**: Warns when deleting outposts used in manufacturing plans
- **Visual Status Indicators**: Outposts show "In Use" status when referenced by plans
- **Persistent Storage**: All outpost data saves across browser sessions

### 📋 Manufacturing Plan System

- **Complex Chain Planning**: Design multi-step manufacturing processes across multiple planets
- **Outpost Requirement Tracking**: Shows exactly how many new outposts each plan needs
- **Plan Dependencies**: Chain plans together with automatic resource routing
- **Smart Validation**: Prevents over-planning beyond outpost capacity limits
- **Progress Tracking**: Visual indicators show when plans have all required outposts built
- **Commitment Tracking**: Header shows actual + planned outpost usage vs. capacity

### ⚙️ Skill Integration

- **Planetary Habitation**: Configurable skill level (0-4) determines max outposts
- **Special Projects**: Track skill level for advanced manufacturing recipes
- **Persistent Settings**: Skill levels save and restore across sessions
- **Real-Time Updates**: Outpost limits update immediately when skills change

### 🎯 Smart Plan Validation

- **Capacity Awareness**: Tracks both built and planned outpost commitments
- **Early Warnings**: Prevents creating plans that exceed capacity
- **Resource Intelligence**: Only counts new outposts when existing ones lack required resources
- **Visual Feedback**: Color-coded indicators show plan feasibility

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

Game data is stored in `src/data/starfield.json` and `src/data/planets.json`. The structure includes:

- **`rarityLevels`** - 5-tier color codes and skill requirements (Common, Uncommon, Rare, Exotic, Unique) with English color names
- **`resources`** - 53 raw materials with rarity, category (Organic/Inorganic), value, and unique IDs (r1-r53)
- **`items`** - 80+ craftable items with complex ingredient requirements (raw resources + crafted items), multi-tier dependencies, crafting time, and profit calculations
- **`planets`** - 50 detailed worlds across multiple star systems (Sol, Alpha Centauri, Cheyenne, Volii, etc.) with resources, biomes, fauna, settlements, and difficulty levels

### Manufacturing Complexity Examples

- **Simple Items**: Use only raw resources (Adaptive Frame = Aluminum + Beryllium)
- **Intermediate Items**: Use crafted components (Power Circuit = Reactive Circuit + Microsecond Regulator + Inductor)
- **Advanced Items**: Use multiple crafted items (Rothicite Magnet = Isocentered Magnet + Superconductor + Dysprosium Coil)
- **Ultimate Items**: Complex 3-4 tier chains (Quantum Processor = Aldumite Quantum Processor + Parametric Circuit Boards + Rothicite Magnet)

> **Note:** Current dataset represents a development sample. Future roadmap includes migrating to a comprehensive database with all Starfield planets and resources for complete coverage.

### Component Overview

- **MyOutposts** - Create outposts with skill-based limits, assign resource extraction, track plan usage
- **ManufacturePlans** - Design multi-tier manufacturing chains, track outpost requirements, handle item-to-item dependencies
- **Shopping** - Persistent shopping list with add/remove/quantity controls, integrates with all tabs
- **Profits** - Sortable profit analysis for manufactured items, shows complex supply chain costs vs. sale value
- **Planets** - Searchable database of 50 worlds with filtering by type, level, system, and resource category visibility
- **Resources** - Color-coded resource browser with 5-tier rarity filtering, Organic/Inorganic category filters, and direct shopping list integration
- **Items** - Craftable items database (80+ items) showing complex ingredient chains, multi-tier dependencies, time, and profit potential

### User Interface Features

- **Collapsing Header** - Title collapses on scroll, keeping navigation tabs always accessible
- **5-Tier Rarity System** - White (Common), Green (Uncommon), Blue (Rare), Purple (Exotic), Gold (Unique)
- **Mobile Responsive** - Horizontal tab scrolling, touch-friendly interface
- **Dark Theme** - Consistent Starfield-inspired dark color scheme across all components
- **Data Persistence** - Shopping list, outposts, and manufacturing plans persist across browser sessions
- **Skill Management** - Visual skill level configuration with real-time limit updates
- **Plan Status Tracking** - Visual indicators show plan completion status and outpost readiness

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
