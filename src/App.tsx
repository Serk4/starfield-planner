import { useState } from 'react'
import './App.css'
import Resources from './components/Resources'
import Items from './components/Items'
import Profits from './components/Profits'
import Shopping from './components/Shopping'

type Tab = 'resources' | 'items' | 'profits' | 'shopping'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('resources')
  const [shoppingList, setShoppingList] = useState<Array<{ id: string; name: string; qty: number }>>([])

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 sticky top-0 z-10 shadow-lg">
        <h1 className="text-2xl font-bold text-center">Starfield Planner</h1>
        <p className="text-xs text-center text-gray-400 mt-1">
          Unofficial fan-made tool - Not affiliated with Bethesda
        </p>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-gray-700 overflow-x-auto">
        <div className="flex">
          {(['resources', 'items', 'profits', 'shopping'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[80px] py-4 px-2 text-sm font-semibold uppercase transition-colors ${
                activeTab === tab
                  ? 'bg-gray-800 text-white border-b-4 border-blue-500'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab}
              {tab === 'shopping' && shoppingList.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {shoppingList.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <main className="container mx-auto p-4 pb-20">
        {activeTab === 'resources' && <Resources onAddToCart={addToShoppingList} />}
        {activeTab === 'items' && <Items onAddToCart={addToShoppingList} />}
        {activeTab === 'profits' && <Profits onAddToCart={addToShoppingList} />}
        {activeTab === 'shopping' && (
          <Shopping
            items={shoppingList}
            onRemove={removeFromShoppingList}
            onUpdateQty={updateShoppingQty}
          />
        )}
      </main>

      {/* Disclaimer */}
      <footer className="fixed bottom-0 w-full bg-gray-800 text-gray-400 text-xs text-center py-2">
        Fan-made tool for Starfield. All game content © Bethesda Softworks LLC
      </footer>
    </div>
  )
}

export default App
