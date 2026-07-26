import { Map, Compass, Users, List, User } from 'lucide-react';
import { useTravelStore } from '../store/useTravelStore';

const tabs = [
  { id: 'map' as const, label: 'Map', Icon: Map },
  { id: 'discover' as const, label: 'Discover', Icon: Compass },
  { id: 'feed' as const, label: 'Feed', Icon: Users },
  { id: 'bucketlist' as const, label: 'Bucket', Icon: List },
  { id: 'profile' as const, label: 'Profile', Icon: User },
];

export function TabNavigation() {
  const activeTab = useTravelStore((s) => s.activeTab);
  const setActiveTab = useTravelStore((s) => s.setActiveTab);
  const bucketCount = useTravelStore((s) => s.bucketList.length);

  return (
    <nav
      data-testid="tab-navigation"
      className="flex-shrink-0 flex items-center justify-around bg-earth-bg/90 backdrop-blur-xl border-t border-earth-card px-1 pb-[env(safe-area-inset-bottom)] relative z-30"
      style={{ minHeight: 60 }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            data-testid={`tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-0.5 py-2 px-2.5 rounded-xl transition-colors relative ${
              isActive ? 'text-brand-orange' : 'text-txt-muted hover:text-txt-secondary'
            }`}
          >
            {isActive && (
              <span className="absolute -top-px left-1/2 -translate-x-1/2 w-7 h-0.5 bg-brand-orange rounded-full" />
            )}
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[9px] font-semibold tracking-wide">{label}</span>
            {id === 'bucketlist' && bucketCount > 0 && (
              <span
                data-testid="bucket-count-badge"
                className="absolute -top-0.5 right-0 bg-brand-orange text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center"
              >
                {bucketCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
