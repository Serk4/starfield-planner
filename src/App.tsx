import { useState, useEffect, useMemo } from 'react'
import './App.css'
import Resources from './components/Resources'
import Items from './components/Items'
import Profits from './components/Profits'
import Shopping from './components/Shopping'
import Planets from './components/Planets'
import MyOutposts from './components/MyOutposts'
import ManufacturePlans from './components/ManufacturePlans'

type Tab = 'outposts' | 'shopping' | 'profits' | 'planets' | 'resources' | 'items' | 'manufacture'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('outposts')
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)
  const [shoppingList, setShoppingList] = useState<Array<{ id: string; name: string; qty: number }>>([])
  
  // Skill levels - persisted in localStorage
  const [planetaryHabitationLevel, setPlanetaryHabitationLevel] = useState(() => {
    const saved = localStorage.getItem('starfield-planetary-habitation-level')
    return saved ? parseInt(saved) : 0
  })
  const [specialProjectsLevel, setSpecialProjectsLevel] = useState(() => {
    const saved = localStorage.getItem('starfield-special-projects-level')
    return saved ? parseInt(saved) : 0
  })
  
  const [outposts, setOutposts] = useState<Array<{
    id: string
    planetId: string
    planetName: string
    name: string
    extractedResources: { resourceId: string; resourceName: string; rate: number }[]
    dateCreated: string
  }>>(() => {
    const saved = localStorage.getItem('starfield-outposts')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsHeaderCollapsed(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Persist skill levels to localStorage
  useEffect(() => {
    localStorage.setItem('starfield-planetary-habitation-level', planetaryHabitationLevel.toString())
  }, [planetaryHabitationLevel])

  useEffect(() => {
    localStorage.setItem('starfield-special-projects-level', specialProjectsLevel.toString())
  }, [specialProjectsLevel])

  // Persist outposts to localStorage
  useEffect(() => {
    localStorage.setItem('starfield-outposts', JSON.stringify(outposts))
  }, [outposts])

  const addToShoppingList = (id: string, name: string, qty: number = 1) => {
    setShoppingList((prev) => {
      const existing = prev.find((item) => item.id === id)
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, qty: item.qty + qty } : item
        )
      }
      return [...prev, { id, name, qty }]
    })
  }

  const removeFromShoppingList = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id))
  }

  const updateShoppingQty = (id: string, qty: number) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    )
  }

  // Calculate maximum outposts based on Planetary Habitation skill (8 base + 4 per level, max 4 levels)
  const maxOutposts = useMemo(() => 8 + (planetaryHabitationLevel * 4), [planetaryHabitationLevel])
  const remainingOutposts = useMemo(() => maxOutposts - outposts.length, [maxOutposts, outposts.length])

  const updatePlanetaryHabitationLevel = (level: number) => {
    setPlanetaryHabitationLevel(Math.max(0, Math.min(4, level)))
  }

  const updateSpecialProjectsLevel = (level: number) => {
    setSpecialProjectsLevel(Math.max(0, Math.min(4, level)))
  }

  const addOutpost = (outpost: typeof outposts[0]) => {
    // Check if we're at the outpost limit
    if (outposts.length >= maxOutposts) {
      alert(`Cannot create outpost: You've reached your limit of ${maxOutposts} outposts. Increase your Planetary Habitation skill level or delete an existing outpost.`)
      return
    }
    setOutposts((prev) => [...prev, outpost])
  }

  // Check if an outpost is required for manufacturing plans
  const isOutpostRequiredForPlans = (outpostId: string) => {
    try {
      const savedPlansJson = localStorage.getItem('starfield-manufacture-plans')
      if (!savedPlansJson) return false
      
      const savedPlans = JSON.parse(savedPlansJson)
      const outpost = outposts.find(o => o.id === outpostId)
      if (!outpost) return false

      // Check if any plan requires resources that this outpost provides
      for (const plan of savedPlans) {
        if (plan.steps) {
          for (const step of plan.steps) {
            // Check if this step is on the same planet and requires resources this outpost provides
            if (step.planetId === outpost.planetId && step.requiredResources) {
              for (const reqResource of step.requiredResources) {
                const outpostProvidesResource = outpost.extractedResources?.some(
                  extResource => extResource.resourceId === reqResource.resourceId
                )
                if (outpostProvidesResource) {
                  return true // This outpost provides a required resource
                }
              }
            }
          }
        }
      }
      
      return false
    } catch (error) {
      console.warn('Error checking outpost requirements:', error)
      return false
    }
  }

  const deleteOutpost = (outpostId: string) => {
    const outpost = outposts.find(o => o.id === outpostId)
    if (!outpost) return

    // Check if this outpost is required for manufacturing plans
    if (isOutpostRequiredForPlans(outpostId)) {
      const confirmDelete = window.confirm(
        `Warning: "${outpost.name}" provides resources needed for your manufacturing plans. ` +
        `Deleting it may require creating new outposts to maintain your production chains. ` +
        `Are you sure you want to delete this outpost?`
      )
      if (!confirmDelete) return
    }

    setOutposts((prev) => prev.filter((o) => o.id !== outpostId))
  }

  const updateOutpost = (outpostId: string, updatedOutpost: typeof outposts[0]) => {
    setOutposts((prev) =>
      prev.map((outpost) => (outpost.id === outpostId ? updatedOutpost : outpost))
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header 
        className={`bg-gray-800 text-white sticky top-0 z-10 shadow-lg transition-all duration-300 ${
          isHeaderCollapsed ? 'py-2' : 'p-4'
        }`}
      >
        <div className={`transition-all duration-300 ${isHeaderCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          <h1 className="text-2xl font-bold text-center">Starfield Planner</h1>
          <p className="text-xs text-center text-gray-400 mt-1">
            Unofficial fan-made tool - Not affiliated with Bethesda
          </p>
        </div>
        
        {/* Tab Navigation - Always visible */}
        <nav className={`bg-gray-700 overflow-x-auto ${isHeaderCollapsed ? 'mt-0' : 'mt-4 -mx-4'}`}>
          <div className="flex">
            {(['outposts', 'manufacture', 'shopping', 'profits', 'planets', 'resources', 'items'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[80px] py-3 px-2 text-sm font-semibold uppercase transition-colors ${
                  activeTab === tab
                    ? 'bg-gray-800 text-white border-b-4 border-blue-500'
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab === 'outposts' ? 'My Outposts' : tab === 'manufacture' ? 'Manufacture Plans' : tab}
                {tab === 'shopping' && shoppingList.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {shoppingList.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Tab Content */}
      <main className="container mx-auto p-4 pb-20">
        {activeTab === 'outposts' && (
          <MyOutposts
            onAddToCart={addToShoppingList}
            outposts={outposts}
            onAddOutpost={addOutpost}
            onDeleteOutpost={deleteOutpost}
            onUpdateOutpost={updateOutpost}
            planetaryHabitationLevel={planetaryHabitationLevel}
            specialProjectsLevel={specialProjectsLevel}
            onUpdatePlanetaryHabitationLevel={updatePlanetaryHabitationLevel}
            onUpdateSpecialProjectsLevel={updateSpecialProjectsLevel}
            maxOutposts={maxOutposts}
            remainingOutposts={remainingOutposts}
            isOutpostRequiredForPlans={isOutpostRequiredForPlans}
          />
        )}
        {activeTab === 'manufacture' && (
          <ManufacturePlans 
            onAddToCart={addToShoppingList} 
            outposts={outposts}
            maxOutposts={maxOutposts}
            remainingOutposts={remainingOutposts}
          />
        )}
        {activeTab === 'shopping' && (
          <Shopping
            items={shoppingList}
            onRemove={removeFromShoppingList}
            onUpdateQty={updateShoppingQty}
          />
        )}
        {activeTab === 'profits' && <Profits onAddToCart={addToShoppingList} />}
        {activeTab === 'planets' && <Planets onAddToCart={addToShoppingList} />}
        {activeTab === 'resources' && <Resources onAddToCart={addToShoppingList} />}
        {activeTab === 'items' && <Items onAddToCart={addToShoppingList} />}
      </main>

      {/* Disclaimer */}
      <footer className="fixed bottom-0 w-full bg-gray-800 text-gray-400 text-xs text-center py-2">
        Fan-made tool for Starfield. All game content © Bethesda Softworks LLC
      </footer>
    </div>
  )
}

export default App
