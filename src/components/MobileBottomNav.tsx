type Tab = 'outposts' | 'manufacture' | 'shopping' | 'profits' | 'planets' | 'resources' | 'items'

interface MobileBottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs: Array<{ name: string; id: Tab; icon: string; label: string }> = [
  { name: 'Outposts',  id: 'outposts',    icon: '🏠', label: 'Outposts' },
  { name: 'Plans',     id: 'manufacture', icon: '🏭', label: 'Plans' },
  { name: 'Shopping',  id: 'shopping',    icon: '🛒', label: 'Cart' },
  { name: 'Profits',   id: 'profits',     icon: '💰', label: 'Profits' },
  { name: 'Planets',   id: 'planets',     icon: '🪐', label: 'Planets' },
  { name: 'Resources', id: 'resources',   icon: '⚡', label: 'Resources' },
  { name: 'Items',     id: 'items',       icon: '🔧', label: 'Items' },
]

export default function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ id, icon, label }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all ${
                isActive
                  ? 'text-cyan-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>
                {icon}
              </span>
              <span className="text-xs tracking-tight">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}