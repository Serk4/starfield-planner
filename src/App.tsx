import { useState, useEffect } from 'react'
import './App.css'
import Resources from './components/Resources'
import Items from './components/Items'
import Profits from './components/Profits'
import Shopping from './components/Shopping'
import Planets from './components/Planets'
import MyOutposts from './components/MyOutposts'

type Tab = 'outposts' | 'shopping' | 'profits' | 'planets' | 'resources' | 'items'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('outposts')
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)
  const [shoppingList, setShoppingList] = useState<Array<{ id: string; name: string; qty: number }>>([])
  const [outposts, setOutposts] = useState<Array<{
    id: string
    planetId: string
    planetName: string
    name: string
    extractedResources: { resourceId: string; resourceName: string; rate: number }[]
    dateCreated: string
  }>>([])

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsHeaderCollapsed(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const addOutpost = (outpost: typeof outposts[0]) => {
    setOutposts((prev) => [...prev, outpost])
  }

  const deleteOutpost = (outpostId: string) => {
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
            {(['outposts', 'shopping', 'profits', 'planets', 'resources', 'items'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[80px] py-3 px-2 text-sm font-semibold uppercase transition-colors ${
                  activeTab === tab
                    ? 'bg-gray-800 text-white border-b-4 border-blue-500'
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab === 'outposts' ? 'My Outposts' : tab}
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
