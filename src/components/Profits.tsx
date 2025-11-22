import { useMemo } from 'react'
import data from '../data/starfield.json'

interface ProfitsProps {
  onAddToCart: (id: string, name: string, qty: number) => void
}

const rarityColors = {
  common: 'text-rarity-common',
  uncommon: 'text-rarity-uncommon',
  rare: 'text-rarity-rare',
  epic: 'text-rarity-epic',
  legendary: 'text-rarity-legendary',
}

function Profits({ onAddToCart }: ProfitsProps) {
  const topProfitableItems = useMemo(() => {
    return [...data.items]
      .sort((a, b) => {
        const profitRateA = a.profit / (a.time / 60)
        const profitRateB = b.profit / (b.time / 60)
        return profitRateB - profitRateA
      })
      .slice(0, 20)
  }, [])

  const getResourceName = (resourceId: string) => {
    return data.resources.find((r) => r.id === resourceId)?.name || 'Unknown'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-white">
        Top 20 Most Profitable Items
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Sorted by credits per minute (cr/min)
      </p>

      {/* Top Items List */}
      <div className="grid grid-cols-1 gap-3">
        {topProfitableItems.map((item, index) => {
          const profitRate = (item.profit / (item.time / 60)).toFixed(1)
          return (
            <div
              key={item.id}
              className="bg-gray-800 rounded-lg p-4 shadow-md"
            >
              <div className="flex items-start gap-3">
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                {/* Item Info */}
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${rarityColors[item.rarity as keyof typeof rarityColors]}`}>
                    {item.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Value: <span className="font-semibold text-gray-900 dark:text-white">{item.value} cr</span>
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Time: <span className="font-semibold text-gray-900 dark:text-white">{item.time}s</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Profit: <span className="font-semibold text-green-600 dark:text-green-400">{item.profit} cr</span>
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Rate: <span className="font-bold text-green-600 dark:text-green-400 text-lg">{profitRate} cr/min</span>
                      </p>
                    </div>
                  </div>

                  {/* Recipe */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Recipe:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.ingredients.map((ing, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                        >
                          {getResourceName(ing.resource)} x{ing.qty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => onAddToCart(item.id, item.name, 1)}
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Profits
