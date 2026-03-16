import { useTravelStore } from './store/useTravelStore';
import { TabNavigation } from './components/TabNavigation';
import { MapScreen } from './components/MapScreen';
import { DiscoverScreen } from './components/DiscoverScreen';
import { FeedScreen } from './components/FeedScreen';
import { BucketListScreen } from './components/BucketListScreen';
import { ProfileScreen } from './components/ProfileScreen';

export default function App() {
  const activeTab = useTravelStore((s) => s.activeTab);

  return (
    <div className="w-full h-[100dvh] bg-[#0a0f0d] flex justify-center">
      {/* Mobile container */}
      <div className="w-full max-w-[480px] h-full bg-earth-bg relative overflow-hidden shadow-2xl border-x border-earth-card flex flex-col">
        {/* Screen content */}
        <div className="flex-1 overflow-hidden relative" data-testid="screen-container">
          {activeTab === 'map' && <MapScreen />}
          {activeTab === 'discover' && <DiscoverScreen />}
          {activeTab === 'feed' && <FeedScreen />}
          {activeTab === 'bucketlist' && <BucketListScreen />}
          {activeTab === 'profile' && <ProfileScreen />}
        </div>

        {/* Bottom Navigation */}
        <TabNavigation />
      </div>
    </div>
  );
}
