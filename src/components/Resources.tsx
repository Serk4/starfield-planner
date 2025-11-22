import { useState, useMemo } from 'react'
import data from '../data/starfield.json'

interface ResourcesProps {
  onAddToCart: (id: string, name: string, qty: number) => void
}

const rarityColors = {
  common: 'text-rarity-common',
  uncommon: 'text-rarity-uncommon',
  rare: 'text-rarity-rare',
  epic: 'text-rarity-epic',
  legendary: 'text-rarity-legendary',
}

function Resources({ onAddToCart }: ResourcesProps) {
  const [search, setSearch] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')

  const filteredResources = useMemo(() => {
    return data.resources.filter((resource) => {
      const matchesSearch = resource.name.toLowerCase().includes(search.toLowerCase())
      const matchesRarity = selectedRarity === 'all' || resource.rarity === selectedRarity
      return matchesSearch && matchesRarity
    })
  }, [search, selectedRarity])

  const usedInItems = (resourceId: string) => {
    return data.items.filter((item) =>
      item.ingredients.some((ing) => ing.resource === resourceId)
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Resources ({data.resources.length} materials)
      </h2>

      {/* Search and Filters */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 text-lg border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'].map((rarity) => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                selectedRarity === rarity
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Resources List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredResources.map((resource) => {
          const items = usedInItems(resource.id)
          return (
            <div
              key={resource.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${rarityColors[resource.rarity as keyof typeof rarityColors]}`}>
                    {resource.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Value: {resource.value} credits
                  </p>
                </div>
                <button
                  onClick={() => onAddToCart(resource.id, resource.name, 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ml-2"
                >
                  +
                </button>
              </div>
              
              {items.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Used in {items.length} items:
                  </p>
                  <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    {items.slice(0, 5).map((item) => (
                      <div key={item.id}>• {item.name}</div>
                    ))}
                    {items.length > 5 && (
                      <div className="text-gray-500">...and {items.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No resources found
        </div>
      )}
    </div>
  )
}

export default Resources
