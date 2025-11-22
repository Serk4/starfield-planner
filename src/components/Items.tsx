import { useState, useMemo } from 'react'
import data from '../data/starfield.json'

interface ItemsProps {
  onAddToCart: (id: string, name: string, qty: number) => void
}

const rarityColors = {
  common: 'text-rarity-common',
  uncommon: 'text-rarity-uncommon',
  rare: 'text-rarity-rare',
  epic: 'text-rarity-epic',
  legendary: 'text-rarity-legendary',
}

function Items({ onAddToCart }: ItemsProps) {
  const [search, setSearch] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    return data.items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchesRarity = selectedRarity === 'all' || item.rarity === selectedRarity
      return matchesSearch && matchesRarity
    }).sort((a, b) => b.value - a.value)
  }, [search, selectedRarity])

  const getResourceName = (resourceId: string) => {
    return data.resources.find((r) => r.id === resourceId)?.name || 'Unknown'
  }

  const toggleExpand = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Items ({data.items.length}+ craftable)
      </h2>

      {/* Search and Filters */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search items..."
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

      {/* Items List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredItems.map((item) => {
          const isExpanded = expandedItem === item.id
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${rarityColors[item.rarity as keyof typeof rarityColors]}`}>
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Value: {item.value} credits | Time: {item.time}s
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                    Profit: {item.profit} cr | {(item.profit / (item.time / 60)).toFixed(1)} cr/min
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                  <button
                    onClick={() => onAddToCart(item.id, item.name, 1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Recipe:
                  </p>
                  <div className="space-y-1 text-sm">
                    {item.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>• {getResourceName(ing.resource)}</span>
                        <span className="font-semibold">x{ing.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No items found
        </div>
      )}
    </div>
  )
}

export default Items
