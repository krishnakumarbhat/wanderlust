import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThumbsUp,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  UserPlus,
  UserCheck,
  Calendar,
  MapPin,
  X,
  Globe,
  Users,
  Bookmark,
  BookmarkCheck,
  Sparkles,
} from 'lucide-react';
import { useTravelStore } from '../store/useTravelStore';
import { TravelPost, MOCK_FEED_USER_PROFILES, UserTrip } from '../data/mock';

export function FeedScreen() {
  const travelPosts = useTravelStore((s) => s.travelPosts);
  const viewingProfile = useTravelStore((s) => s.viewingProfile);
  const setViewingProfile = useTravelStore((s) => s.setViewingProfile);

  return (
    <div className="w-full h-full flex flex-col bg-earth-bg relative" data-testid="feed-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3">
        <h1 className="font-heading font-extrabold text-2xl text-txt-primary tracking-tight">
          Feed
        </h1>
        <p className="text-xs text-txt-muted font-body mt-0.5">
          Routes from travelers you follow
        </p>
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        {travelPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12, duration: 0.4, ease: 'easeOut' }}
          >
            <TravelPostCard post={post} onViewProfile={() => setViewingProfile(post.id)} />
          </motion.div>
        ))}
      </div>

      {/* User Profile Modal */}
      <AnimatePresence>
        {viewingProfile && (
          <UserProfileModal
            postId={viewingProfile}
            onClose={() => setViewingProfile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TravelPostCard({ post, onViewProfile }: { post: TravelPost; onViewProfile: () => void }) {
  const toggleRouteLike = useTravelStore((s) => s.toggleRouteLike);
  const toggleFollow = useTravelStore((s) => s.toggleFollow);
  const saveRouteToMyTrips = useTravelStore((s) => s.saveRouteToMyTrips);
  const userTrips = useTravelStore((s) => s.userTrips);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const routeAsTripData: UserTrip = {
    id: `from-${post.id}`,
    tripTitle: post.tripTitle,
    date: 'Saved',
    stops: post.tripSequence.map((s) => ({ city: s.city, country: s.country })),
    highlight: post.caption.slice(0, 60) + '...',
    daysTotal: post.totalDays,
  };
  const isRouteSaved = userTrips.some(
    (t) => t.tripTitle === post.tripTitle && t.stops.length === post.tripSequence.length
  );

  return (
    <div
      data-testid={`travel-post-${post.id}`}
      className="bg-earth-card rounded-2xl border border-earth-card overflow-hidden"
    >
      {/* Post Header: Avatar + Username + Follow */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          data-testid={`view-profile-avatar-${post.id}`}
          onClick={onViewProfile}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 hover:ring-2 hover:ring-brand-orange/50 transition-all"
          style={{ background: post.avatarColor }}
        >
          {post.avatar}
        </button>
        <button
          data-testid={`view-profile-name-${post.id}`}
          onClick={onViewProfile}
          className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
        >
          <p className="text-sm font-semibold text-txt-primary font-body">{post.user}</p>
          <p className="text-[11px] text-txt-muted">{post.bio}</p>
        </button>
        <button
          data-testid={`follow-btn-${post.id}`}
          onClick={() => toggleFollow(post.id)}
          className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${
            post.isFollowing
              ? 'bg-brand-sage/20 text-brand-sage'
              : 'bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/25'
          }`}
        >
          {post.isFollowing ? <UserCheck size={13} /> : <UserPlus size={13} />}
          {post.isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Trip Title + Meta */}
      <div className="px-4 pb-2">
        <h3 className="font-heading font-bold text-base text-txt-primary">{post.tripTitle}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-[10px] text-txt-muted">
            <Calendar size={10} />
            {post.totalDays} days
          </span>
          <span className="flex items-center gap-1 text-[10px] text-txt-muted">
            <MapPin size={10} />
            {post.tripSequence.length} stops
          </span>
          <span className="text-[10px] text-txt-muted">{post.postedAt}</span>
        </div>
      </div>

      {/* Trip Sequence Graph */}
      <div className="px-4 py-3">
        <TripSequenceGraph stops={post.tripSequence} />
      </div>

      {/* Cover Image */}
      <div className="mx-4 mb-3 rounded-xl overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.tripTitle}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      </div>

      {/* Caption */}
      <p className="px-4 text-sm text-txt-secondary font-body leading-relaxed mb-3">
        {post.caption}
      </p>

      {/* Action Row: Like + Save Route */}
      <div className="px-4 pb-3 flex items-center gap-2.5">
        <motion.button
          data-testid={`route-like-btn-${post.id}`}
          onClick={() => toggleRouteLike(post.id)}
          whileTap={{ scale: 0.92 }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-colors ${
            post.isRouteLiked
              ? 'bg-brand-orange/20 text-brand-orange'
              : 'bg-earth-surface text-txt-secondary hover:text-brand-orange hover:bg-earth-surface/80'
          }`}
        >
          <ThumbsUp size={14} fill={post.isRouteLiked ? 'currentColor' : 'none'} />
          {post.isRouteLiked ? 'Loved!' : 'Love this route'}
          <span className="text-txt-muted">{post.routeLikes}</span>
        </motion.button>

        <motion.button
          data-testid={`save-route-btn-${post.id}`}
          onClick={() => !isRouteSaved && saveRouteToMyTrips(routeAsTripData)}
          whileTap={{ scale: 0.92 }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-colors ${
            isRouteSaved
              ? 'bg-green-500/15 text-green-400'
              : 'bg-earth-surface text-txt-secondary hover:text-brand-sand hover:bg-earth-surface/80'
          }`}
        >
          {isRouteSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          {isRouteSaved ? 'Saved' : 'Save Route'}
        </motion.button>
      </div>

      {/* Comments Toggle */}
      <button
        data-testid={`comments-toggle-${post.id}`}
        onClick={() => setCommentsOpen(!commentsOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 border-t border-earth-surface text-xs text-txt-muted hover:text-txt-secondary transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <MessageCircle size={13} />
          {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
        </span>
        {commentsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Collapsible Comments Section */}
      <AnimatePresence>
        {commentsOpen && (
          <motion.div
            data-testid={`comments-section-${post.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-earth-surface pt-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5" data-testid={`comment-${comment.id}`}>
                  <div className="w-7 h-7 rounded-full bg-earth-surface flex items-center justify-center text-[9px] font-bold text-txt-muted flex-shrink-0 mt-0.5">
                    {comment.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-txt-primary">{comment.user}</span>
                      <span className="text-[10px] text-txt-muted">{comment.time}</span>
                    </div>
                    <p className="text-xs text-txt-secondary mt-0.5 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ User Profile Modal ============ */
function UserProfileModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const profile = MOCK_FEED_USER_PROFILES[postId];
  const saveRouteToMyTrips = useTravelStore((s) => s.saveRouteToMyTrips);
  const userTrips = useTravelStore((s) => s.userTrips);
  const toggleFollow = useTravelStore((s) => s.toggleFollow);
  const travelPosts = useTravelStore((s) => s.travelPosts);
  const post = travelPosts.find((p) => p.id === postId);

  if (!profile) return null;

  const isTripSaved = (trip: UserTrip) =>
    userTrips.some((t) => t.tripTitle === trip.tripTitle && t.stops.length === trip.stops.length);

  return (
    <motion.div
      data-testid="user-profile-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-50 bg-earth-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 max-h-[85%] bg-earth-bg rounded-t-3xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-earth-card" />
        </div>

        {/* Close button */}
        <button
          data-testid="close-profile-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-earth-card text-txt-muted hover:text-txt-primary transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 pt-2 pb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-heading font-bold text-lg flex-shrink-0"
              style={{ background: profile.avatarColor }}
            >
              {profile.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-heading font-bold text-xl text-txt-primary" data-testid="modal-profile-name">
                {profile.username}
              </h2>
              <p className="text-xs text-txt-muted">{profile.bio}</p>
            </div>
          </div>

          {/* Follow button */}
          {post && (
            <button
              data-testid="modal-follow-btn"
              onClick={() => toggleFollow(postId)}
              className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors mb-4 ${
                post.isFollowing
                  ? 'bg-earth-card border border-brand-sage/30 text-brand-sage'
                  : 'bg-brand-orange text-white hover:bg-brand-orange-hover'
              }`}
            >
              {post.isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          {/* Stats */}
          <div className="flex items-center justify-around py-3 border-t border-b border-earth-card mb-5">
            {[
              { label: 'Followers', value: profile.followers, icon: Users },
              { label: 'Following', value: profile.following, icon: UserPlus },
              { label: 'Countries', value: profile.countries, icon: Globe },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center" data-testid={`modal-stat-${label.toLowerCase()}`}>
                <Icon size={12} className="text-txt-muted mx-auto mb-0.5" />
                <span className="block text-lg font-heading font-bold text-txt-primary">{value}</span>
                <span className="text-[9px] text-txt-muted uppercase tracking-wider font-bold">{label}</span>
              </div>
            ))}
          </div>

          {/* Their Trips */}
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-txt-muted mb-4">
            Their Trips
          </h3>
          <div className="space-y-4">
            {profile.trips.map((trip, idx) => {
              const saved = isTripSaved(trip);
              return (
                <motion.div
                  key={trip.id}
                  data-testid={`modal-trip-${trip.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.3 }}
                  className="bg-earth-card rounded-xl border border-earth-card p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-txt-primary">{trip.tripTitle}</h4>
                      <span className="text-[10px] text-txt-muted">
                        {trip.date} &middot; {trip.daysTotal} days
                      </span>
                    </div>
                    <motion.button
                      data-testid={`save-trip-btn-${trip.id}`}
                      onClick={() => !saved && saveRouteToMyTrips(trip)}
                      whileTap={{ scale: 0.9 }}
                      className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${
                        saved
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/25'
                      }`}
                    >
                      {saved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                      {saved ? 'Saved' : 'Save'}
                    </motion.button>
                  </div>

                  {/* Route stops */}
                  <div className="flex items-center gap-1 flex-wrap mb-2">
                    {trip.stops.map((stop, sIdx) => (
                      <span key={sIdx} className="flex items-center gap-1">
                        <span className="text-[11px] font-semibold text-txt-secondary">{stop.city}</span>
                        {sIdx < trip.stops.length - 1 && (
                          <span className="text-[10px] text-brand-sage font-bold mx-0.5">&rarr;</span>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Highlight */}
                  {trip.highlight && (
                    <div className="flex items-center gap-1.5 bg-earth-surface rounded-lg px-2.5 py-1.5">
                      <Sparkles size={11} className="text-brand-sand flex-shrink-0" />
                      <span className="text-[11px] text-brand-sand font-medium italic">{trip.highlight}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============ Trip Sequence Graph ============ */
export function TripSequenceGraph({ stops }: { stops: { city: string; country: string; days: number }[] }) {
  return (
    <div data-testid="trip-sequence-graph" className="overflow-x-auto pb-1 -mx-1 px-1">
      <div className="flex items-center gap-0 min-w-max pr-2">
        {stops.map((stop, idx) => (
          <div key={idx} className="flex items-center">
            {/* Stop Node */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.3, type: 'spring', stiffness: 400 }}
              className="flex flex-col items-center relative"
            >
              {/* Node circle */}
              <div className="relative">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                    idx === 0
                      ? 'bg-brand-orange/20 border-brand-orange text-brand-orange'
                      : idx === stops.length - 1
                        ? 'bg-green-500/20 border-green-400 text-green-400'
                        : 'bg-earth-surface border-brand-sage/50 text-brand-sage'
                  }`}
                >
                  {idx + 1}
                </div>
                {/* Days badge */}
                <span className="absolute -bottom-1 -right-1 bg-earth-bg text-[8px] text-txt-muted font-bold px-1 rounded border border-earth-card">
                  {stop.days}d
                </span>
              </div>
              {/* City label */}
              <span className="text-[10px] text-txt-primary font-semibold mt-2 whitespace-nowrap max-w-[72px] truncate">
                {stop.city}
              </span>
              <span className="text-[8px] text-txt-muted leading-none">{stop.country}</span>
            </motion.div>

            {/* Connector line */}
            {idx < stops.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: idx * 0.1 + 0.15, duration: 0.25 }}
                className="flex items-center mx-1.5 mb-6"
                style={{ originX: 0 }}
              >
                <div className="w-6 h-[2px] bg-gradient-to-r from-brand-sage/60 to-brand-sage/30 rounded-full" />
                <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-brand-sage/50" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
