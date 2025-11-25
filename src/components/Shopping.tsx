import { useState, useMemo } from 'react'
import data from '../data/starfield.json'

interface ShoppingProps {
  items: Array<{ id: string; name: string; qty: number }>
  onRemove: (id: string) => void
  onUpdateQty: (id: string, qty: number) => void
}

interface ResourceCalc {
  id: string
  name: string
  total: number
  value: number
}

// Constants for extractor calculations
const DEFAULT_EXTRACTOR_RATE = 4 // units per hour
const DEFAULT_PLANETS_PER_RESOURCE = 1
const MAX_EXTRACTORS_PER_PLANET = 3

function Shopping({ items, onRemove, onUpdateQty }: ShoppingProps) {
  const [extractorRate, setExtractorRate] = useState(DEFAULT_EXTRACTOR_RATE)
  const [planetsPerResource, setPlanetsPerResource] = useState(DEFAULT_PLANETS_PER_RESOURCE)

  const resourceCalculations = useMemo(() => {
    const resourceMap = new Map<string, ResourceCalc>()

    items.forEach((cartItem) => {
      const itemData = data.items.find((i) => i.id === cartItem.id)
      const resourceData = data.resources.find((r) => r.id === cartItem.id)

      if (itemData) {
        // It's a crafted item - sum up all ingredients
        itemData.ingredients.forEach((ing) => {
          // Only process resource-based ingredients, skip item-based ones
          if (ing.resource) {
            const resource = data.resources.find((r) => r.id === ing.resource)
            if (resource) {
              const existing = resourceMap.get(ing.resource)
              if (existing) {
                existing.total += ing.qty * cartItem.qty
              } else {
                resourceMap.set(ing.resource, {
                  id: ing.resource,
                  name: resource.name,
                  total: ing.qty * cartItem.qty,
                  value: resource.value,
                })
              }
            }
          }
        })
      } else if (resourceData) {
        // It's a raw resource
        const existing = resourceMap.get(cartItem.id)
        if (existing) {
          existing.total += cartItem.qty
        } else {
          resourceMap.set(cartItem.id, {
            id: cartItem.id,
            name: resourceData.name,
            total: cartItem.qty,
            value: resourceData.value,
          })
        }
      }
    })

    return Array.from(resourceMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [items])

  const calculateExtractors = (totalNeeded: number) => {
    // Extractor rate is per hour, calculate how many extractors needed
    const extractorsNeeded = Math.ceil(totalNeeded / extractorRate)
    const planetsNeeded = Math.ceil(extractorsNeeded / MAX_EXTRACTORS_PER_PLANET)
    return { extractorsNeeded, planetsNeeded }
  }

  const exportToJSON = () => {
    const exportData = {
      shoppingList: items,
      resourceRequirements: resourceCalculations,
      extractorSettings: {
        rate: extractorRate,
        planetsPerResource,
      },
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `starfield-shopping-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    // Simple confirmation before clearing
    const userConfirmed = window.confirm('Clear all items from shopping list?')
    if (userConfirmed) {
      items.forEach((item) => onRemove(item.id))
    }
  }

  const totalValue = useMemo(() => {
    return resourceCalculations.reduce((sum, res) => sum + res.total * res.value, 0)
  }, [resourceCalculations])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Shopping List
      </h2>

      {items.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p className="text-lg mb-2">Your shopping list is empty</p>
          <p className="text-sm">Add items from Resources, Items, or Profits tabs</p>
        </div>
      ) : (
        <>
          {/* Shopping Items */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Items ({items.length})
              </h3>
              <button
                onClick={clearAll}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md flex items-center gap-3"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => onUpdateQty(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 p-2 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                  <button
                    onClick={() => onRemove(item.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Requirements */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              Resource Requirements
            </h3>
            
            {resourceCalculations.length > 0 ? (
              <div className="space-y-2">
                {resourceCalculations.map((resource) => {
                  const { extractorsNeeded, planetsNeeded } = calculateExtractors(resource.total)
                  return (
                    <div
                      key={resource.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {resource.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total needed: {resource.total} units
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Value: {resource.total * resource.value} credits
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-700 dark:text-gray-300">
                            Extractors: <span className="font-bold">{extractorsNeeded}</span>
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            Planets: <span className="font-bold">{planetsNeeded}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No resources required
              </p>
            )}
          </div>

          {/* Extractor Calculator Settings */}
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              Extractor Calculator
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Extractor Rate (units/hour):
                </label>
                <input
                  type="number"
                  min="1"
                  value={extractorRate}
                  onChange={(e) => setExtractorRate(parseInt(e.target.value) || 1)}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Planets per Resource:
                </label>
                <input
                  type="number"
                  min="1"
                  value={planetsPerResource}
                  onChange={(e) => setPlanetsPerResource(parseInt(e.target.value) || 1)}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 shadow-lg mb-4">
            <h3 className="text-lg font-bold mb-2">Summary</h3>
            <p className="text-2xl font-bold">
              Total Value: {totalValue.toLocaleString()} credits
            </p>
            <p className="text-sm opacity-90">
              {resourceCalculations.length} unique resources needed
            </p>
          </div>

          {/* Export Button */}
          <button
            onClick={exportToJSON}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg"
          >
            Export to JSON
          </button>
        </>
      )}
    </div>
  )
}

export default Shopping
