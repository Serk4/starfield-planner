import { useState } from 'react'
import data from '../data/starfield.json'
import planetsData from '../data/planets.json'

interface PlanetsProps {
  onAddToCart: (id: string, name: string, qty: number) => void
}

const typeColors = {
  Rock: 'text-amber-600',
  Ice: 'text-blue-400',
  Gas: 'text-purple-500',
  Ocean: 'text-blue-600',
}

const levelColors = {
  low: 'text-green-500',
  medium: 'text-yellow-500',
  high: 'text-orange-500',
  extreme: 'text-red-500',
}

function Planets({ onAddToCart }: PlanetsProps) {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedSystem, setSelectedSystem] = useState<string>('all')
  const [resourceDisplay, setResourceDisplay] = useState<string>('all')

  const getResourceName = (resourceId: string) => {
    const resource = data.resources.find(r => r.id === resourceId)
    return resource ? resource.name : resourceId
  }

  const getResourceRarity = (resourceId: string) => {
    const resource = data.resources.find(r => r.id === resourceId)
    return resource ? resource.rarity : 'common'
  }

  const filteredPlanets = planetsData.planets.filter((planet) => {
    const matchesSearch = planet.name.toLowerCase().includes(search.toLowerCase()) ||
                        planet.system.toLowerCase().includes(search.toLowerCase())
    const matchesType = selectedType === 'all' || planet.type === selectedType
    const matchesLevel = selectedLevel === 'all' || 
                        (selectedLevel === 'low' && planet.level <= 10) ||
                        (selectedLevel === 'medium' && planet.level > 10 && planet.level <= 25) ||
                        (selectedLevel === 'high' && planet.level > 25 && planet.level <= 40) ||
                        (selectedLevel === 'extreme' && planet.level > 40)
    const matchesSystem = selectedSystem === 'all' || planet.system === selectedSystem
    
    // Resource filter - only show planets that have resources matching the selected rarity
    const matchesResourceFilter = resourceDisplay === 'all' || 
      planet.resources.some(resourceId => {
        const rarity = getResourceRarity(resourceId)
        switch (resourceDisplay) {
          case 'common':
            return rarity === 'common'
          case 'uncommon':
            return rarity === 'uncommon'
          case 'rare':
            return rarity === 'rare'
          case 'exotic':
            return rarity === 'exotic'
          case 'unique':
            return rarity === 'unique'
          default:
            return true
        }
      })
    
    return matchesSearch && matchesType && matchesLevel && matchesSystem && matchesResourceFilter
  })

  const uniqueSystems = [...new Set(planetsData.planets.map(p => p.system))].sort()

  const getLevelColor = (level: number) => {
    if (level <= 10) return levelColors.low
    if (level <= 25) return levelColors.medium
    if (level <= 40) return levelColors.high
    return levelColors.extreme
  }

  const addRandomResources = (planet: typeof planetsData.planets[0]) => {
    // Add a few random resources from the planet to shopping list
    const selectedResources = planet.resources.slice(0, 3)
    selectedResources.forEach((resourceId: string) => {
      const resourceName = getResourceName(resourceId)
      onAddToCart(resourceId, resourceName, 5)
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-white">
        Planets ({planetsData.planets.length} worlds)
      </h2>

      {/* Search and Filters */}
      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Search planets or systems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 text-lg border rounded-lg bg-gray-800 text-white border-gray-700"
        />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Filter by planet type"
            className="p-2 border rounded-lg bg-gray-800 text-white border-gray-700"
          >
            <option value="all">All Types</option>
            <option value="Rock">Rock</option>
            <option value="Ice">Ice</option>
            <option value="Gas Giant">Gas Giant</option>
            <option value="Ocean">Ocean</option>
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            aria-label="Filter by difficulty level"
            className="p-2 border rounded-lg bg-gray-800 text-white border-gray-700"
          >
            <option value="all">All Levels</option>
            <option value="low">Easy (1-10)</option>
            <option value="medium">Medium (11-25)</option>
            <option value="high">Hard (26-40)</option>
            <option value="extreme">Extreme (41+)</option>
          </select>

          {/* System Filter */}
          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            aria-label="Filter by star system"
            className="p-2 border rounded-lg bg-gray-800 text-white border-gray-700"
          >
            <option value="all">All Systems</option>
            {uniqueSystems.map(system => (
              <option key={system} value={system}>{system}</option>
            ))}
          </select>

          {/* Resource Display Dropdown */}
          <select
            value={resourceDisplay}
            onChange={(e) => setResourceDisplay(e.target.value)}
            aria-label="Filter planets by resource rarity"
            className="p-2 border rounded-lg bg-gray-800 text-white border-gray-700"
          >
            <option value="all">All Planets</option>
            <option value="common">Common Resources</option>
            <option value="uncommon">Uncommon Resources</option>
            <option value="rare">Rare Resources</option>
            <option value="exotic">Exotic Resources</option>
            <option value="unique">Unique Resources</option>
          </select>
        </div>
      </div>

      {/* Planets List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPlanets.map((planet) => (
          <div
            key={planet.id}
            className="bg-gray-800 rounded-lg p-4 shadow-md border-l-4 border-blue-500"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">
                  {planet.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {planet.system} System
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-semibold ${getLevelColor(planet.level)}`}>
                  Level {planet.level}
                </span>
                <button
                  onClick={() => addRandomResources(planet)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                  title="Add key resources to shopping list"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div>
                <span className="font-semibold text-gray-400">Type:</span>
                <span className={`ml-2 ${typeColors[planet.type as keyof typeof typeColors] || 'text-gray-400'}`}>
                  {planet.type}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-400">Gravity:</span>
                <span className="ml-2 text-gray-400">{planet.gravity}g</span>
              </div>
              <div>
                <span className="font-semibold text-gray-400">Atmosphere:</span>
                <span className="ml-2 text-gray-400">{planet.atmosphere}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-400">Temperature:</span>
                <span className="ml-2 text-gray-400">{planet.temperature}</span>
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-3">
              {planet.description}
            </p>

            {/* Settlements */}
            {planet.settlements.length > 0 && (
              <div className="mb-2">
                <span className="font-semibold text-gray-400 text-sm">Settlements:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {planet.settlements.map((settlement, idx) => (
                    <span
                      key={idx}
                      className="bg-yellow-900 text-yellow-200 px-2 py-1 rounded text-xs"
                    >
                      {settlement}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            <div className="mb-2">
              <span className="font-semibold text-gray-400 text-sm">Resources:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {planet.resources.map((resourceId, idx) => {
                  const rarity = getResourceRarity(resourceId)
                  const rarityColors = {
                    'common': 'bg-gray-700 text-gray-200',
                    'uncommon': 'bg-green-900 text-green-200', 
                    'rare': 'bg-blue-900 text-blue-200',
                    'exotic': 'bg-purple-900 text-purple-200',
                    'unique': 'bg-yellow-900 text-yellow-200'
                  }
                  const colorClass = rarityColors[rarity as keyof typeof rarityColors] || 'bg-blue-900 text-blue-200'
                  
                  // Highlight the target rarity with a border
                  const isTargetRarity = resourceDisplay !== 'all' && 
                    ((resourceDisplay === 'common' && rarity === 'common') ||
                     (resourceDisplay === 'uncommon' && rarity === 'uncommon') ||
                     (resourceDisplay === 'rare' && rarity === 'rare') ||
                     (resourceDisplay === 'exotic' && rarity === 'exotic') ||
                     (resourceDisplay === 'unique' && rarity === 'unique'))
                  
                  return (
                    <span
                      key={idx}
                      className={`${colorClass} px-2 py-1 rounded text-xs cursor-pointer hover:brightness-110 ${
                        isTargetRarity ? 'ring-2 ring-yellow-400' : ''
                      }`}
                      onClick={() => onAddToCart(resourceId, getResourceName(resourceId), 1)}
                      title={`${rarity.charAt(0).toUpperCase() + rarity.slice(1)} - Click to add to shopping list`}
                    >
                      {getResourceName(resourceId)}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Biomes */}
            <div className="mb-2">
              <span className="font-semibold text-gray-400 text-sm">Biomes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {planet.biomes.slice(0, 3).map((biome, idx) => (
                  <span
                    key={idx}
                    className="bg-green-900 text-green-200 px-2 py-1 rounded text-xs"
                  >
                    {biome}
                  </span>
                ))}
                {planet.biomes.length > 3 && (
                  <span className="text-gray-500 text-xs">+{planet.biomes.length - 3} more</span>
                )}
              </div>
            </div>

            {/* Traits */}
            <div>
              <span className="font-semibold text-gray-400 text-sm">Traits:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {planet.traits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-900 text-purple-200 px-2 py-1 rounded text-xs"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlanets.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No planets found matching your criteria
        </div>
      )}
    </div>
  )
}

export default Planets