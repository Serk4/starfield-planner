import { useState, useCallback, useEffect } from 'react'
import data from '../data/starfield.json'
import planetsData from '../data/planets.json'

interface ManufacturingStep {
  id: string
  itemId: string
  itemName: string
  planetId: string
  planetName: string
  requiredResources: { resourceId: string; resourceName: string; qty: number }[]
  requiredItems: { itemId: string; itemName: string; qty: number }[]
  stepOrder: number
}

interface PlanDependency {
  planId: string
  planName: string
  outputItem: string
  outputPlanet: string
  requiredQty: number
}

interface ManufacturePlan {
  id: string
  name: string
  targetItemId: string
  targetItemName: string
  outputPlanetId?: string
  outputPlanetName?: string
  steps: ManufacturingStep[]
  dependencies: PlanDependency[]
  totalValue: number
  totalTime: number
  dateCreated: string
  isChainedPlan: boolean
}

interface ResourcePlanetAssignment {
  resourceId: string
  resourceName: string
  qty: number
  selectedPlanetId: string | null
  selectedPlanetName: string | null
  availablePlanets: { id: string; name: string; system: string }[]
}

interface ManufacturePlansProps {
  onAddToCart: (id: string, name: string, qty: number) => void
  outposts?: Array<{
    id: string
    planetId: string
    planetName: string
    name: string
    extractedResources: { resourceId: string; resourceName: string; rate: number }[]
    dateCreated: string
  }>
  maxOutposts?: number
  remainingOutposts?: number
}

function ManufacturePlans({ onAddToCart, outposts = [], maxOutposts = 24, remainingOutposts = 24 }: ManufacturePlansProps) {
  const [selectedItem, setSelectedItem] = useState('')
  const [planName, setPlanName] = useState('')
  const [outputPlanet, setOutputPlanet] = useState('')
  const [selectedDependencies, setSelectedDependencies] = useState<PlanDependency[]>([])
  const [savedPlans, setSavedPlans] = useState<ManufacturePlan[]>(() => {
    const saved = localStorage.getItem('starfield-manufacture-plans')
    if (saved) {
      try {
        const plans = JSON.parse(saved)
        // Ensure all plans have the new properties with defaults
        return plans.map((plan: Partial<ManufacturePlan>) => ({
          id: plan.id || '',
          name: plan.name || '',
          targetItemId: plan.targetItemId || '',
          targetItemName: plan.targetItemName || '',
          steps: plan.steps || [],
          totalValue: plan.totalValue || 0,
          totalTime: plan.totalTime || 0,
          dateCreated: plan.dateCreated || '',
          dependencies: plan.dependencies || [],
          isChainedPlan: plan.isChainedPlan || false,
          outputPlanetId: plan.outputPlanetId || null,
          outputPlanetName: plan.outputPlanetName || null
        }))
      } catch (error) {
        console.error('Failed to load saved plans:', error)
      }
    }
    return []
  })
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [resourceAssignments, setResourceAssignments] = useState<ResourcePlanetAssignment[]>([])

  // Save plans to localStorage whenever savedPlans changes
  useEffect(() => {
    localStorage.setItem('starfield-manufacture-plans', JSON.stringify(savedPlans))
  }, [savedPlans])

  const getResourceName = (resourceId: string) => {
    const resource = data.resources.find(r => r.id === resourceId)
    return resource ? resource.name : resourceId
  }

  const getItemInfo = (itemId: string) => {
    return data.items.find(i => i.id === itemId)
  }

  const getRarityColor = (rarity: string) => {
    const rarityLevel = data.rarityLevels.find(r => r.name === rarity)
    return rarityLevel ? rarityLevel.color : '#ffffff'
  }

  const getPlanetsWithResource = (resourceId: string) => {
    return planetsData.planets.filter(planet => 
      planet.resources.includes(resourceId)
    ).map(planet => ({
      id: planet.id,
      name: planet.name,
      system: planet.system,
      resourceAvailable: true
    }))
  }



  const initializeResourceAssignments = useCallback((itemId: string) => {
    const item = getItemInfo(itemId)
    if (!item) return

    const assignments: ResourcePlanetAssignment[] = item.ingredients.map(ingredient => ({
      resourceId: ingredient.resource,
      resourceName: getResourceName(ingredient.resource),
      qty: ingredient.qty,
      selectedPlanetId: null,
      selectedPlanetName: null,
      availablePlanets: getPlanetsWithResource(ingredient.resource)
    }))

    setResourceAssignments(assignments)
    setPlanName(`${item.name} Manufacturing Plan`)
  }, [])

  const assignPlanetToResource = (resourceId: string, planetId: string, planetName: string) => {
    setResourceAssignments(prev => 
      prev.map(assignment => 
        assignment.resourceId === resourceId
          ? { ...assignment, selectedPlanetId: planetId, selectedPlanetName: planetName }
          : assignment
      )
    )
  }

  const resetAssignments = () => {
    setResourceAssignments(prev => 
      prev.map(assignment => ({
        ...assignment,
        selectedPlanetId: null,
        selectedPlanetName: null
      }))
    )
  }

  const canFinalizePlan = resourceAssignments.length > 0 && resourceAssignments.every(assignment => assignment.selectedPlanetId !== null)

  // Calculate how many NEW outposts this plan would require
  const calculateNewOutpostsRequired = () => {
    if (resourceAssignments.length === 0) return 0
    
    // Get unique planets that would need outposts for resource extraction
    const planetsNeedingOutposts = new Set<string>()
    
    resourceAssignments.forEach(assignment => {
      if (assignment.selectedPlanetId) {
        const planetId = assignment.selectedPlanetId
        
        // Check if we already have an outpost on this planet that provides this resource
        const hasOutpostWithResource = outposts.some(outpost => 
          outpost.planetId === planetId && 
          outpost.extractedResources.some(resource => resource.resourceId === assignment.resourceId)
        )
        
        if (!hasOutpostWithResource) {
          planetsNeedingOutposts.add(planetId)
        }
      }
    })
    
    return planetsNeedingOutposts.size
  }

  const newOutpostsRequired = calculateNewOutpostsRequired()

  // Calculate outposts committed by all saved plans
  const calculateCommittedOutposts = () => {
    const commitmentSet = new Set<string>()
    
    savedPlans.forEach(plan => {
      if (plan.steps) {
        plan.steps.forEach(step => {
          // Check if this step requires an outpost that doesn't exist
          const hasOutpostWithResource = outposts.some(outpost => 
            outpost.planetId === step.planetId && 
            step.requiredResources.some(reqResource =>
              outpost.extractedResources?.some(extResource => 
                extResource.resourceId === reqResource.resourceId
              )
            )
          )
          
          if (!hasOutpostWithResource) {
            // This plan step commits to needing an outpost on this planet
            commitmentSet.add(step.planetId)
          }
        })
      }
    })
    
    return commitmentSet.size
  }

  const committedOutposts = calculateCommittedOutposts()
  const totalCommitment = outposts.length + committedOutposts
  const effectiveRemainingSlots = maxOutposts - totalCommitment

  // Check if a plan has all required outposts built
  const isPlanFullyBuilt = (plan: ManufacturePlan) => {
    if (!plan.steps || plan.steps.length === 0) return false

    return plan.steps.every(step => {
      // Check if all required resources for this step are covered by existing outposts
      return step.requiredResources.every(reqResource => {
        return outposts.some(outpost => 
          outpost.planetId === step.planetId && 
          outpost.extractedResources?.some(extResource => 
            extResource.resourceId === reqResource.resourceId
          )
        )
      })
    })
  }

  const savePlan = () => {
    if (!selectedItem || !canFinalizePlan) return

    // Check if plan would exceed outpost limits
    if (newOutpostsRequired > effectiveRemainingSlots) {
      alert(`Cannot save plan: This would require ${newOutpostsRequired} new outpost${newOutpostsRequired > 1 ? 's' : ''}, but you only have ${effectiveRemainingSlots} slot${effectiveRemainingSlots !== 1 ? 's' : ''} available (${committedOutposts} already committed to other plans). Increase your Planetary Habitation skill level or use existing outposts.`)
      return
    }

    const item = getItemInfo(selectedItem)
    if (!item) return

    // Group assignments by planet to create manufacturing steps
    const planetGroups = resourceAssignments.reduce((groups, assignment) => {
      const planetId = assignment.selectedPlanetId!
      if (!groups[planetId]) {
        groups[planetId] = {
          planetId,
          planetName: assignment.selectedPlanetName!,
          resources: []
        }
      }
      groups[planetId].resources.push({
        resourceId: assignment.resourceId,
        resourceName: assignment.resourceName,
        qty: assignment.qty
      })
      return groups
    }, {} as Record<string, { planetId: string; planetName: string; resources: Array<{ resourceId: string; resourceName: string; qty: number }> }>)

    const steps: ManufacturingStep[] = Object.values(planetGroups).map((group, index) => ({
      id: `step-${Date.now()}-${index}`,
      itemId: selectedItem,
      itemName: item.name,
      planetId: group.planetId,
      planetName: group.planetName,
      requiredResources: group.resources,
      requiredItems: [],
      stepOrder: index + 1
    }))

    const newPlan: ManufacturePlan = {
      id: editingPlanId || `plan-${Date.now()}`,
      name: planName || `${item.name} Plan`,
      targetItemId: selectedItem,
      targetItemName: item.name,
      outputPlanetId: outputPlanet || steps[0]?.planetId,
      outputPlanetName: (() => {
        if (!outputPlanet) return steps[0]?.planetName
        
        // Check if it's an outpost
        if (outputPlanet.startsWith('outpost-')) {
          const outpostId = outputPlanet.replace('outpost-', '')
          const outpost = outposts.find(o => o.id === outpostId)
          return outpost ? `🏭 ${outpost.name} (${outpost.planetName})` : 'Unknown Outpost'
        }
        
        // Regular planet
        const planet = planetsData.planets.find(p => p.id === outputPlanet)
        return planet ? `🌍 ${planet.name}` : 'Unknown Planet'
      })(),
      steps,
      dependencies: selectedDependencies,
      totalValue: item.value,
      totalTime: item.time,
      dateCreated: editingPlanId ? savedPlans.find(p => p.id === editingPlanId)?.dateCreated || new Date().toLocaleDateString() : new Date().toLocaleDateString(),
      isChainedPlan: selectedDependencies.length > 0
    }

    if (editingPlanId) {
      // Update existing plan
      setSavedPlans(savedPlans.map(p => p.id === editingPlanId ? newPlan : p))
    } else {
      // Add new plan
      setSavedPlans([...savedPlans, newPlan])
    }
    
    // Reset form
    setSelectedItem('')
    setPlanName('')
    setOutputPlanet('')
    setSelectedDependencies([])
    setResourceAssignments([])
    setShowPlanForm(false)
    setEditingPlanId(null)
  }

  const editPlan = (plan: ManufacturePlan) => {
    setEditingPlanId(plan.id)
    setSelectedItem(plan.targetItemId)
    setPlanName(plan.name)
    setOutputPlanet(plan.outputPlanetId || '')
    setSelectedDependencies(plan.dependencies || [])
    
    // Reconstruct resource assignments from plan steps
    const assignments: ResourcePlanetAssignment[] = []
    plan.steps?.forEach(step => {
      step.requiredResources?.forEach(resource => {
        const existing = assignments.find(a => a.resourceId === resource.resourceId)
        if (existing) {
          existing.qty += resource.qty
        } else {
          assignments.push({
            resourceId: resource.resourceId,
            resourceName: resource.resourceName,
            qty: resource.qty,
            selectedPlanetId: step.planetId,
            selectedPlanetName: step.planetName,
            availablePlanets: getPlanetsWithResource(resource.resourceId).map(p => ({
              id: p.id,
              name: p.name,
              system: p.system
            }))
          })
        }
      })
    })
    
    setResourceAssignments(assignments)
    setShowPlanForm(true)
  }

  const deleteSavedPlan = (planId: string) => {
    const plan = savedPlans.find(p => p.id === planId)
    if (!plan) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the plan "${plan.name}"?\n\nThis action cannot be undone.`
    )
    
    if (confirmDelete) {
      setSavedPlans(savedPlans.filter(p => p.id !== planId))
    }
  }

  const addPlanResourcesTocart = (plan: ManufacturePlan) => {
    plan.steps.forEach(step => {
      step.requiredResources.forEach(resource => {
        onAddToCart(resource.resourceId, resource.resourceName, resource.qty)
      })
    })
  }



  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {editingPlanId ? '✏️ Edit Manufacture Plan' : 'Manufacture Plans'}
          </h2>
          <p className="text-sm text-gray-400">
            Plan complex manufacturing chains across multiple planets and outposts
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>
              Outposts: <span className="text-white">{outposts.length}</span> created + <span className="text-yellow-300">{committedOutposts}</span> planned = <span className="text-blue-300">{totalCommitment}/{maxOutposts}</span>
            </div>
            <div>
              {effectiveRemainingSlots > 0 ? (
                <span className="text-green-400">✓ {effectiveRemainingSlots} slots available for new plans</span>
              ) : effectiveRemainingSlots === 0 ? (
                <span className="text-yellow-400">⚠️ All outpost slots committed</span>
              ) : (
                <span className="text-red-400">❌ Over-committed by {Math.abs(effectiveRemainingSlots)} outposts</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowPlanForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          + Create Plan
        </button>
      </div>

      {/* Create Plan Form */}
      {showPlanForm && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4 text-white">Create Manufacturing Plan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Item to Manufacture
              </label>
              <select
                value={selectedItem}
                onChange={(e) => {
                  setSelectedItem(e.target.value)
                  if (e.target.value) {
                    initializeResourceAssignments(e.target.value)
                  }
                }}
                aria-label="Select item to manufacture"
                className="w-full p-3 border rounded-lg bg-gray-700 text-white border-gray-600"
              >
                <option value="">Select item...</option>
                {data.items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.rarity}) • {item.value}cr
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Plan Name
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Auto-generated if empty"
                className="w-full p-3 border rounded-lg bg-gray-700 text-white border-gray-600"
              />
            </div>
          </div>

          {/* Plan Chaining Options */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-white mb-3 flex items-center">
              🔗 Plan Chaining (Optional)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Output Planet (Where item will be produced)
                </label>
                <select
                  value={outputPlanet}
                  onChange={(e) => setOutputPlanet(e.target.value)}
                  aria-label="Select output planet for manufactured item"
                  className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600"
                >
                  <option value="">Auto (first manufacturing planet)</option>
                  
                  {/* Existing Outposts Section */}
                  {outposts.length > 0 && (
                    <>
                      <option disabled className="bg-gray-700 text-gray-400">
                        ━━━ My Outposts ━━━
                      </option>
                      {outposts.map(outpost => (
                        <option key={`outpost-${outpost.id}`} value={`outpost-${outpost.id}`}>
                          🏭 {outpost.name} ({outpost.planetName})
                        </option>
                      ))}
                      <option disabled className="bg-gray-700 text-gray-400">
                        ━━━ New Planets ━━━
                      </option>
                    </>
                  )}
                  
                  {/* All Planets */}
                  {planetsData.planets.map(planet => (
                    <option key={planet.id} value={planet.id}>
                      🌍 {planet.name} ({planet.system})
                    </option>
                  ))}
                </select>
                {remainingOutposts <= 0 && (
                  <p className="text-xs text-yellow-400 mt-2 bg-yellow-900/20 p-2 rounded border border-yellow-700">
                    ⚠️ You've reached your outpost limit ({maxOutposts}). New planet selections will require upgrading your Planetary Habitation skill or using existing outposts.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Connect to Existing Plans
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const plan = savedPlans.find(p => p.id === e.target.value)
                      if (plan && !selectedDependencies.find(d => d.planId === plan.id)) {
                        setSelectedDependencies([...selectedDependencies, {
                          planId: plan.id,
                          planName: plan.name,
                          outputItem: plan.targetItemName,
                          outputPlanet: plan.outputPlanetName || 'Unknown',
                          requiredQty: 1
                        }])
                      }
                    }
                  }}
                  aria-label="Select existing plan to connect as dependency"
                  className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600"
                >
                  <option value="">Add dependency...</option>
                  {savedPlans.filter(plan => plan.id !== selectedItem).map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} → {plan.targetItemName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Dependencies */}
            {selectedDependencies.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-300 mb-2">Dependencies:</h5>
                <div className="space-y-2">
                  {selectedDependencies.map((dep, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-800 rounded p-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-blue-400 text-sm">📦 {dep.planName}</span>
                        <span className="text-gray-400 text-sm">→ {dep.outputItem}</span>
                        <span className="text-yellow-400 text-sm">@ {dep.outputPlanet}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={dep.requiredQty}
                          onChange={(e) => {
                            const newDeps = [...selectedDependencies]
                            newDeps[idx].requiredQty = parseInt(e.target.value) || 1
                            setSelectedDependencies(newDeps)
                          }}
                          min="1"
                          className="w-16 p-1 text-xs border rounded bg-gray-700 text-white border-gray-600"
                          title="Required quantity"
                        />
                        <button
                          onClick={() => setSelectedDependencies(selectedDependencies.filter((_, i) => i !== idx))}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
                          title="Remove dependency"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resource Assignment Section */}
          {resourceAssignments.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-semibold text-white">
                  Required Resources & Planet Assignment
                  <span className="ml-2 text-sm text-blue-400">
                    ({resourceAssignments.filter(a => a.selectedPlanetId).length}/{resourceAssignments.length} assigned)
                  </span>
                </h5>
                <button
                  onClick={resetAssignments}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-1 px-3 rounded"
                >
                  ↺ Reset All
                </button>
              </div>

              {/* Quick Preview of Current Assignments */}
              {resourceAssignments.some(a => a.selectedPlanetId) && (
                <div className="bg-gray-800 rounded p-3 mb-4">
                  <h6 className="text-sm font-semibold text-gray-300 mb-2">Current Plan Preview:</h6>
                  <div className="text-sm text-gray-400">
                    {Array.from(new Set(resourceAssignments
                      .filter(a => a.selectedPlanetId)
                      .map(a => a.selectedPlanetName)
                    )).map(planetName => (
                      <span key={planetName} className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs mr-2 mb-1">
                        {planetName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {resourceAssignments.map((assignment) => {
                  // Check if selected planet has existing outpost with this resource
                  const hasExistingOutpost = assignment.selectedPlanetId && outposts.some(outpost => 
                    outpost.planetId === assignment.selectedPlanetId && 
                    outpost.extractedResources?.some(extResource => 
                      extResource.resourceId === assignment.resourceId
                    )
                  )

                  return (
                    <div key={assignment.resourceId} className="bg-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <span className="font-medium text-white text-lg">
                            {assignment.resourceName} x{assignment.qty}
                          </span>
                          {assignment.selectedPlanetId && (
                            <div className="text-sm mt-1">
                              {hasExistingOutpost ? (
                                <span className="text-green-400">
                                  ✅ Available from existing outpost: <span className="font-semibold">{assignment.selectedPlanetName}</span>
                                </span>
                              ) : (
                                <span className="text-yellow-400">
                                  🏗️ New outpost needed: <span className="font-semibold">{assignment.selectedPlanetName}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      <div className="text-sm text-gray-400">
                        {assignment.availablePlanets.length} planets available
                        {assignment.availablePlanets.length === 0 && (
                          <span className="ml-2 text-red-400 font-semibold">⚠ No sources!</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {assignment.availablePlanets.map(planet => {
                        // Check if this planet has existing outpost with this resource
                        const planetHasOutpost = outposts.some(outpost => 
                          outpost.planetId === planet.id && 
                          outpost.extractedResources?.some(extResource => 
                            extResource.resourceId === assignment.resourceId
                          )
                        )

                        return (
                          <button
                            key={planet.id}
                            onClick={() => assignPlanetToResource(assignment.resourceId, planet.id, planet.name)}
                            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                              assignment.selectedPlanetId === planet.id
                                ? 'bg-green-600 text-white border-2 border-green-400'
                                : 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-transparent hover:border-blue-400'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {planetHasOutpost && <span className="text-green-300">✅</span>}
                              {planet.name}
                            </div>
                            <div className="text-xs opacity-75">
                              ({planet.system}){planetHasOutpost && ' • Has Outpost'}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    
                    {assignment.availablePlanets.length === 0 && (
                      <div className="text-red-400 text-sm mt-2 p-2 bg-red-900/20 rounded">
                        ⚠ This resource is not available on any known planet. You may need to find alternative sources.
                      </div>
                    )}
                  </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Plan Requirements Display */}
          {resourceAssignments.length > 0 && (
            <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-700">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Plan Requirements:</span>
                <div className="text-right">
                  <div className="text-white">
                    New outposts needed: <span className={newOutpostsRequired > effectiveRemainingSlots ? 'text-red-400 font-bold' : 'text-green-400'}>{newOutpostsRequired}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Available slots: {effectiveRemainingSlots}
                  </div>
                  <div className="text-xs text-yellow-400">
                    ({committedOutposts} already planned)
                  </div>
                  {newOutpostsRequired > effectiveRemainingSlots && (
                    <div className="text-xs text-red-400 mt-1">
                      ⚠️ Would exceed capacity!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            {canFinalizePlan && (
              <button
                onClick={savePlan}
                disabled={newOutpostsRequired > effectiveRemainingSlots}
                className={`font-bold py-2 px-6 rounded ${
                  newOutpostsRequired > effectiveRemainingSlots
                    ? 'bg-red-600 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                title={newOutpostsRequired > effectiveRemainingSlots ? 'This plan would exceed your outpost capacity' : 'Save this manufacturing plan'}
              >
                {newOutpostsRequired > effectiveRemainingSlots ? '⚠️ Exceeds Capacity' : '✓ Finalize Plan'}
              </button>
            )}
            <button
              onClick={() => {
                setShowPlanForm(false)
                setSelectedItem('')
                setPlanName('')
                setOutputPlanet('')
                setSelectedDependencies([])
                setResourceAssignments([])
                setEditingPlanId(null)
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Saved Plans List */}
      {savedPlans.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <h3 className="text-xl font-semibold mb-2 text-white">No manufacturing plans yet!</h3>
          <p>Create your first plan to optimize resource gathering and manufacturing across planets.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">
            💾 Saved Plans ({savedPlans.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedPlans.map((plan) => {
            const item = getItemInfo(plan.targetItemId)
            const isBuilt = isPlanFullyBuilt(plan)
            return (
              <div
                key={plan.id}
                className={`bg-gray-800 rounded-lg p-6 shadow-md border-l-4 ${
                  isBuilt ? 'border-green-500' : 'border-purple-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      💾 {plan.name}
                      {isBuilt && <span className="text-sm bg-green-600 px-2 py-1 rounded">✅ Ready</span>}
                      {plan.isChainedPlan && <span className="text-sm bg-blue-600 px-2 py-1 rounded">🔗 Chained</span>}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>Target:</span>
                      <span 
                        className="font-medium"
                        style={{ color: item ? getRarityColor(item.rarity) : '#ffffff' }}
                      >
                        {plan.targetItemName}
                      </span>
                      {plan.outputPlanetName && (
                        <>
                          <span>→</span>
                          <span className="text-yellow-400">{plan.outputPlanetName}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Saved {plan.dateCreated} • {plan.totalValue} credits • {plan.totalTime}min
                    </p>
                    
                    {/* Dependencies Display */}
                    {plan.dependencies && plan.dependencies.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-blue-400 mb-1">Dependencies:</p>
                        <div className="flex flex-wrap gap-1">
                          {plan.dependencies.map((dep, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded"
                              title={`Requires ${dep.requiredQty}x ${dep.outputItem} from ${dep.planName}`}
                            >
                              📦 {dep.planName} ({dep.requiredQty}x)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addPlanResourcesTocart(plan)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded"
                      title="Add all required resources to shopping cart"
                    >
                      + Cart
                    </button>
                    <button
                      onClick={() => editPlan(plan)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold py-1 px-3 rounded"
                      title="Edit this plan"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteSavedPlan(plan.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Manufacturing Steps */}
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">
                    Manufacturing Steps ({plan.steps?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {plan.steps?.map((step) => {
                      // Check if this step has required outposts built
                      const stepOutpostsBuilt = step.requiredResources?.every(reqResource => {
                        return outposts.some(outpost => 
                          outpost.planetId === step.planetId && 
                          outpost.extractedResources?.some(extResource => 
                            extResource.resourceId === reqResource.resourceId
                          )
                        )
                      }) || false

                      return (
                        <div
                          key={step.id}
                          className={`bg-gray-700 rounded p-3 border-l-2 ${
                            stepOutpostsBuilt ? 'border-green-400' : 'border-yellow-400'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-white text-sm">
                              Step {step.stepOrder}: {step.itemName}
                            </span>
                            <div className="flex items-center gap-2">
                              {stepOutpostsBuilt ? (
                                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                                  ✅ Outpost Ready
                                </span>
                              ) : (
                                <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                                  🏗️ Needs Outpost
                                </span>
                              )}
                              <span className="text-sm font-bold text-gray-300 bg-gray-600 px-2 py-1 rounded">
                                {step.planetName}
                              </span>
                            </div>
                          </div>
                        <div className="text-xs text-gray-400">
                          <strong>Resources needed:</strong>
                          <div className="ml-2 mt-1 flex flex-wrap gap-1">
                            {step.requiredResources?.map(res => (
                              <span
                                key={res.resourceId}
                                className="bg-gray-600 px-2 py-0.5 rounded text-xs"
                              >
                                {res.resourceName} x{res.qty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        </div>
      )}
    </div>
  )
}

export default ManufacturePlans