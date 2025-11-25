import { useState, useMemo } from 'react'
import data from '../data/starfield.json'

interface ResourcesProps {
  onAddToCart: (id: string, name: string, qty: number) => void
}

function Resources({ onAddToCart }: ResourcesProps) {
  const [search, setSearch] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set())

  const getRarityDisplayName = (rarity: string) => {
    const rarityLevel = data.rarityLevels.find(r => r.name === rarity)
    return rarityLevel ? rarityLevel.displayName : rarity.charAt(0).toUpperCase() + rarity.slice(1)
  }

  const getSkillRank = (rarity: string) => {
    const rarityLevel = data.rarityLevels.find(r => r.name === rarity)
    return rarityLevel ? rarityLevel.skillRank : 0
  }

  const filteredResources = useMemo(() => {
    return data.resources.filter((resource) => {
      const matchesSearch = resource.name.toLowerCase().includes(search.toLowerCase())
      const matchesRarity = selectedRarity === 'all' || resource.rarity === selectedRarity
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
      return matchesSearch && matchesRarity && matchesCategory
    })
  }, [search, selectedRarity, selectedCategory])

  const usedInItems = (resourceId: string) => {
    return data.items.filter((item) =>
      item.ingredients.some((ing) => ing.resource === resourceId)
    )
  }

  const toggleResourceExpansion = (resourceId: string) => {
    setExpandedResources(prev => {
      const newSet = new Set(prev)
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId)
      } else {
        newSet.add(resourceId)
      }
      return newSet
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-white">
        Resources ({data.resources.length} materials)
      </h2>

      {/* Search and Filters */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search resources..."
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
        
        <div className="flex gap-2">
          <span className="text-sm text-gray-400 py-2 font-medium">Category:</span>
          {['all', 'Organic', 'Inorganic'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Resources List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredResources.map((resource) => {
          const items = usedInItems(resource.id)
          const isExpanded = expandedResources.has(resource.id)
          return (
            <div
              key={resource.id}
              className="bg-gray-800 rounded-lg p-4 shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-3 h-3 rounded-full border border-gray-400 bg-rarity-${resource.rarity}`}
                    />
                    <h3 className="text-lg font-bold text-white">
                      {resource.name}
                    </h3>
                    <span 
                      className={`text-xs text-gray-900 px-2 py-1 rounded font-semibold bg-rarity-${resource.rarity}`}
                    >
                      {getRarityDisplayName(resource.rarity)}
                    </span>
                    {getSkillRank(resource.rarity) > 0 && (
                      <span className="text-xs bg-orange-900 text-orange-200 px-2 py-1 rounded font-semibold">
                        Special Projects Rank {getSkillRank(resource.rarity)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Value: {resource.value} credits • {resource.category}
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
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-xs font-semibold text-gray-400 mb-1">
                    Used in {items.length} items:
                  </p>
                  <div className="text-xs text-gray-300 space-y-1">
                    
                    {(isExpanded ? items : items.slice(0, 5)).map((item) => (
                      <div key={item.id}>• {item.name}</div>
                    ))}
                    {items.length > 5 && (
                      <button
                        onClick={() => toggleResourceExpansion(resource.id)}
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium mt-1"
                      >
                        {isExpanded 
                          ? 'Show less' 
                          : `Show all ${items.length} items`
                        }
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No resources found
        </div>
      )}
    </div>
  )
}

export default Resources
