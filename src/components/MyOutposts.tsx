import { useState } from 'react'
import data from '../data/starfield.json'

interface Outpost {
  id: string
  planetId: string
  planetName: string
  name: string
  extractedResources: { resourceId: string; resourceName: string; rate: number }[]
  dateCreated: string
}

interface MyOutpostsProps {
  onAddToCart: (id: string, name: string, qty: number) => void
  outposts: Outpost[]
  onAddOutpost: (outpost: Outpost) => void
  onDeleteOutpost: (outpostId: string) => void
  onUpdateOutpost: (outpostId: string, updatedOutpost: Outpost) => void
}

function MyOutposts({ onAddToCart, outposts, onAddOutpost, onDeleteOutpost, onUpdateOutpost }: MyOutpostsProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPlanet, setSelectedPlanet] = useState('')
  const [outpostName, setOutpostName] = useState('')
  const [selectedResource, setSelectedResource] = useState('')
  const [extractionRate, setExtractionRate] = useState(1)
  const [editingOutpost, setEditingOutpost] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const getResourceName = (resourceId: string) => {
    const resource = data.resources.find(r => r.id === resourceId)
    return resource ? resource.name : resourceId
  }

  const getPlanetResources = (planetId: string) => {
    const planet = data.planets.find(p => p.id === planetId)
    return planet?.resources || []
  }

  const addOutpost = () => {
    if (!selectedPlanet || !outpostName.trim()) return

    const planet = data.planets.find(p => p.id === selectedPlanet)
    if (!planet) return

    const newOutpost: Outpost = {
      id: `outpost-${Date.now()}`,
      planetId: selectedPlanet,
      planetName: planet.name,
      name: outpostName.trim(),
      extractedResources: [],
      dateCreated: new Date().toLocaleDateString()
    }

    onAddOutpost(newOutpost)
    setSelectedPlanet('')
    setOutpostName('')
    setShowAddForm(false)
  }

  const addResourceToOutpost = (outpostId: string) => {
    if (!selectedResource || extractionRate <= 0) return

    const outpost = outposts.find(o => o.id === outpostId)
    if (!outpost) return

    const resourceExists = outpost.extractedResources.find(r => r.resourceId === selectedResource)
    if (resourceExists) return

    const updatedOutpost = {
      ...outpost,
      extractedResources: [
        ...outpost.extractedResources,
        {
          resourceId: selectedResource,
          resourceName: getResourceName(selectedResource),
          rate: extractionRate
        }
      ]
    }

    onUpdateOutpost(outpostId, updatedOutpost)
    setSelectedResource('')
    setExtractionRate(1)
    setEditingOutpost(null)
  }

  const removeResourceFromOutpost = (outpostId: string, resourceId: string) => {
    const outpost = outposts.find(o => o.id === outpostId)
    if (!outpost) return

    const updatedOutpost = {
      ...outpost,
      extractedResources: outpost.extractedResources.filter(r => r.resourceId !== resourceId)
    }

    onUpdateOutpost(outpostId, updatedOutpost)
  }

  const deleteOutpost = (outpostId: string) => {
    if (deleteConfirm === outpostId) {
      // Actually delete the outpost
      onDeleteOutpost(outpostId)
      setDeleteConfirm(null)
    } else {
      // Show confirmation for this outpost
      setDeleteConfirm(outpostId)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  const addAllExtractedToCart = (outpost: Outpost) => {
    outpost.extractedResources.forEach(resource => {
      onAddToCart(resource.resourceId, resource.resourceName, resource.rate * 10) // 10x rate for shopping list
    })
  }

  const getTotalProductionRate = () => {
    return outposts.reduce((total, outpost) => {
      return total + outpost.extractedResources.reduce((sum, resource) => sum + resource.rate, 0)
    }, 0)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            My Outposts ({outposts.length})
          </h2>
          <p className="text-sm text-gray-400">
            Total Production: {getTotalProductionRate()} units/hour across all outposts
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          + Add Outpost
        </button>
      </div>

      {/* Add Outpost Form */}
      {showAddForm && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4 text-white">Add New Outpost</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Planet
              </label>
              <select
                value={selectedPlanet}
                onChange={(e) => setSelectedPlanet(e.target.value)}
                aria-label="Select planet for outpost"
                className="w-full p-3 border rounded-lg bg-gray-700 text-white border-gray-600"
              >
                <option value="">Select a planet...</option>
                {data.planets.map(planet => (
                  <option key={planet.id} value={planet.id}>
                    {planet.name} ({planet.system})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Outpost Name
              </label>
              <input
                type="text"
                value={outpostName}
                onChange={(e) => setOutpostName(e.target.value)}
                placeholder="e.g., Mining Base Alpha"
                className="w-full p-3 border rounded-lg bg-gray-700 text-white border-gray-600"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={addOutpost}
              disabled={!selectedPlanet || !outpostName.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Create Outpost
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setSelectedPlanet('')
                setOutpostName('')
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Outposts List */}
      {outposts.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <h3 className="text-xl font-semibold mb-2 text-white">No outposts yet!</h3>
          <p>Create your first outpost to start tracking resource extraction.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {outposts.map((outpost) => (
            <div
              key={outpost.id}
              className="bg-gray-800 rounded-lg p-6 shadow-md border-l-4 border-green-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {outpost.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {outpost.planetName} • Created {outpost.dateCreated}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => addAllExtractedToCart(outpost)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded"
                    title="Add all extracted resources to shopping list"
                  >
                    + Cart
                  </button>
                  {deleteConfirm === outpost.id ? (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => deleteOutpost(outpost.id)}
                        className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-1 px-2 rounded"
                        title="Confirm deletion"
                      >
                        ✓ Confirm
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold py-1 px-2 rounded"
                        title="Cancel deletion"
                      >
                        ✗ Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => deleteOutpost(outpost.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Current Extracted Resources */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-300 mb-2">
                  Extracted Resources ({outpost.extractedResources.length})
                </h4>
                {outpost.extractedResources.length === 0 ? (
                  <p className="text-sm text-gray-400">No resources being extracted</p>
                ) : (
                  <div className="space-y-2">
                    {outpost.extractedResources.map((resource) => (
                      <div
                        key={resource.resourceId}
                        className="flex justify-between items-center bg-gray-700 p-3 rounded"
                      >
                        <div>
                          <span className="font-medium text-white">
                            {resource.resourceName}
                          </span>
                          <span className="text-sm text-gray-400 ml-2">
                            {resource.rate}/hour
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onAddToCart(resource.resourceId, resource.resourceName, resource.rate)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded"
                            title="Add to shopping list"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeResourceFromOutpost(outpost.id, resource.resourceId)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Resource Form */}
              {editingOutpost === outpost.id ? (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-300 mb-3">Add Resource</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={selectedResource}
                      onChange={(e) => setSelectedResource(e.target.value)}
                      aria-label="Select resource to extract"
                      className="p-2 border rounded bg-gray-700 text-white border-gray-600 text-sm"
                    >
                      <option value="">Select resource...</option>
                      {getPlanetResources(outpost.planetId).map(resourceId => (
                        <option key={resourceId} value={resourceId}>
                          {getResourceName(resourceId)}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      value={extractionRate}
                      onChange={(e) => setExtractionRate(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max="100"
                      placeholder="Rate/hour"
                      className="p-2 border rounded bg-gray-700 text-white border-gray-600 text-sm"
                    />
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => addResourceToOutpost(outpost.id)}
                        disabled={!selectedResource}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs py-2 px-3 rounded flex-1"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setEditingOutpost(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditingOutpost(outpost.id)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2 px-4 rounded border-2 border-dashed border-gray-500"
                >
                  + Add Resource Extractor
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOutposts