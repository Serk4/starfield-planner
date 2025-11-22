import { useState, useMemo } from 'react'
import data from '../data/starfield.json'

interface ItemsProps {
  onAddToCart: (id: string, name: string, qty: number) => void
}

function Items({ onAddToCart }: ItemsProps) {
  const [search, setSearch] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const getRarityColor = (rarity: string) => {
    const rarityLevel = data.rarityLevels.find(r => r.name === rarity)
    return rarityLevel ? rarityLevel.color : '#ffffff'
  }

  const getRarityDisplayName = (rarity: string) => {
    const rarityLevel = data.rarityLevels.find(r => r.name === rarity)
    return rarityLevel ? rarityLevel.displayName : rarity.charAt(0).toUpperCase() + rarity.slice(1)
  }

  const getSkillRank = (rarity: string) => {
    const rarityLevel = data.rarityLevels.find(r => r.name === rarity)
    return rarityLevel ? rarityLevel.skillRank : 0
  }

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
      <h2 className="text-2xl font-bold mb-4 text-white">
        Items ({data.items.length}+ craftable)
      </h2>

      {/* Search and Filters */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 text-lg border rounded-lg bg-gray-800 text-white border-gray-700"
        />
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', ...data.rarityLevels.map(r => r.name)].map((rarity) => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                selectedRarity === rarity
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {rarity === 'all' ? 'All' : getRarityDisplayName(rarity)}
              {rarity !== 'all' && getSkillRank(rarity) > 0 && (
                <span className="ml-1 text-xs opacity-75">
                  (Rank {getSkillRank(rarity)})
                </span>
              )}
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
              className="bg-gray-800 rounded-lg p-4 shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-400"
                      style={{ backgroundColor: getRarityColor(item.rarity) }}
                    />
                    <h3 className="text-lg font-bold text-white">
                      {item.name}
                    </h3>
                    <span 
                      className="text-xs text-gray-900 px-2 py-1 rounded font-semibold"
                      style={{ backgroundColor: getRarityColor(item.rarity) }}
                    >
                      {getRarityDisplayName(item.rarity)}
                    </span>
                    {getSkillRank(item.rarity) > 0 && (
                      <span className="text-xs bg-orange-900 text-orange-200 px-2 py-1 rounded font-semibold">
                        Special Projects Rank {getSkillRank(item.rarity)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Value: {item.value} credits | Time: {item.time}s
                  </p>
                  <p className="text-sm text-green-400 font-semibold">
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
