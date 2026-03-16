import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { MapPin, Heart, X, RotateCcw } from 'lucide-react';
import { useTravelStore } from '../store/useTravelStore';
import { haversineKm, formatDistance } from '../utils/haversine';

export function DiscoverScreen() {
  const recommendations = useTravelStore((s) => s.recommendations);
  const currentSwipeIndex = useTravelStore((s) => s.currentSwipeIndex);
  const swipeRight = useTravelStore((s) => s.swipeRight);
  const swipeLeft = useTravelStore((s) => s.swipeLeft);
  const resetSwipeDeck = useTravelStore((s) => s.resetSwipeDeck);
  const userLat = useTravelStore((s) => s.userLat);
  const userLng = useTravelStore((s) => s.userLng);

  const remaining = recommendations.slice(currentSwipeIndex);
  const allSwiped = remaining.length === 0;

  return (
    <div className="w-full h-full flex flex-col bg-earth-bg" data-testid="discover-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3">
        <h1 className="font-heading font-extrabold text-2xl text-txt-primary tracking-tight">
          Discover
        </h1>
        <p className="text-xs text-txt-muted font-body mt-0.5">
          {allSwiped
            ? "You've explored all destinations"
            : `${remaining.length} destinations to explore`}
        </p>
      </div>

      {/* Swipe Area */}
      <div className="flex-1 relative px-5 pb-4 overflow-hidden">
        {allSwiped ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-5">
            <div className="w-20 h-20 rounded-full bg-earth-card flex items-center justify-center">
              <MapPin size={32} className="text-brand-sage" />
            </div>
            <div className="text-center">
              <p className="text-txt-primary font-heading font-bold text-lg">All caught up!</p>
              <p className="text-txt-muted text-sm mt-1 font-body">
                You've seen all destinations. Reset to explore again.
              </p>
            </div>
            <button
              data-testid="reset-swipe-deck"
              onClick={resetSwipeDeck}
              className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white font-semibold rounded-full hover:bg-brand-orange-hover transition-colors"
            >
              <RotateCcw size={16} />
              Reset Deck
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <AnimatePresence>
              {remaining
                .slice(0, 3)
                .reverse()
                .map((dest, reverseIdx) => {
                  const stackIdx = remaining.slice(0, 3).length - 1 - reverseIdx;
                  const isTop = stackIdx === 0;
                  const distance = haversineKm(userLat, userLng, dest.lat, dest.lng);

                  return (
                    <SwipeCard
                      key={dest.id}
                      destination={dest}
                      distance={distance}
                      isTop={isTop}
                      stackIndex={stackIdx}
                      onSwipeRight={() => swipeRight(dest)}
                      onSwipeLeft={() => swipeLeft()}
                    />
                  );
                })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!allSwiped && (
        <div className="flex-shrink-0 flex items-center justify-center gap-8 pb-5 px-5">
          <button
            data-testid="swipe-skip-button"
            onClick={() => swipeLeft()}
            className="w-14 h-14 rounded-full bg-earth-card border-2 border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <X size={24} strokeWidth={3} />
          </button>
          <button
            data-testid="swipe-like-button"
            onClick={() => remaining[0] && swipeRight(remaining[0])}
            className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center text-white shadow-lg shadow-brand-orange/30 hover:bg-brand-orange-hover transition-colors"
          >
            <Heart size={28} strokeWidth={2.5} fill="white" />
          </button>
        </div>
      )}
    </div>
  );
}

interface SwipeCardProps {
  destination: (typeof import('../data/mock'))['MOCK_DESTINATIONS'][0];
  distance: number;
  isTop: boolean;
  stackIndex: number;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
}

function SwipeCard({ destination, distance, isTop, stackIndex, onSwipeRight, onSwipeLeft }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);
  const scale = isTop ? 1 : 1 - stackIndex * 0.04;
  const yOffset = stackIndex * 10;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipeRight();
    } else if (info.offset.x < -100) {
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      data-testid={`swipe-card-${destination.id}`}
      className="absolute inset-0 no-select"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale,
        y: yOffset,
        zIndex: 10 - stackIndex,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale, opacity: 1, y: yOffset }}
      exit={{ x: 300, opacity: 0, rotate: 15 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
    >
      <div className="w-full h-full rounded-3xl overflow-hidden relative shadow-2xl border border-earth-card">
        {/* Background Image */}
        <img
          src={destination.image}
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

        {/* Like / Nope Overlays */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-8 left-6 z-10 border-4 border-green-400 text-green-400 font-heading font-extrabold text-3xl px-4 py-1 rounded-xl -rotate-12"
            >
              SAVE
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-8 right-6 z-10 border-4 border-red-400 text-red-400 font-heading font-extrabold text-3xl px-4 py-1 rounded-xl rotate-12"
            >
              SKIP
            </motion.div>
          </>
        )}

        {/* Difficulty Badge */}
        <div className="absolute top-5 right-5 z-10">
          <span
            className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full backdrop-blur-md ${
              destination.difficulty === 'hard'
                ? 'bg-red-500/20 text-red-300'
                : destination.difficulty === 'moderate'
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'bg-green-500/20 text-green-300'
            }`}
          >
            {destination.difficulty}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          {/* Distance */}
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin size={13} className="text-brand-orange" />
            <span className="text-xs text-brand-sand font-semibold">{formatDistance(distance)} away</span>
          </div>

          {/* Name */}
          <h2 className="font-heading font-extrabold text-3xl text-white leading-tight">
            {destination.name}
          </h2>

          {/* Tags */}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {destination.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/80 backdrop-blur-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* AI Reason */}
          <p className="text-sm text-white/70 mt-3 leading-relaxed font-body line-clamp-3">
            {destination.reason}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
