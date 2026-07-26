import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  MapPin,
  Globe,
  Users,
  UserPlus,
  Eye,
  EyeOff,
  Calendar,
  Sparkles,
  Pencil,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import { useTravelStore } from '../store/useTravelStore';
import { UserTrip } from '../data/mock';

export function ProfileScreen() {
  const token = useTravelStore((s) => s.token);
  const user = useTravelStore((s) => s.user);
  const login = useTravelStore((s) => s.login);
  const register = useTravelStore((s) => s.register);
  const logout = useTravelStore((s) => s.logout);
  const bucketList = useTravelStore((s) => s.bucketList);
  const userTrips = useTravelStore((s) => s.userTrips);

  const isLoggedIn = !!token;

  return (
    <div className="w-full h-full flex flex-col bg-earth-bg" data-testid="profile-screen">
      <div className="flex-shrink-0 px-5 pt-5 pb-3">
        <h1 className="font-heading font-extrabold text-2xl text-txt-primary tracking-tight">
          Profile
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
        {isLoggedIn ? (
          <LoggedInView
            user={user!}
            bucketCount={bucketList.length}
            visitedCount={bucketList.filter((d) => d.status === 'visited').length}
            onLogout={logout}
            userTrips={userTrips}
          />
        ) : (
          <AuthView onLogin={login} onRegister={register} />
        )}
      </div>
    </div>
  );
}

/* ============ Logged-In View ============ */
function LoggedInView({
  user,
  bucketCount,
  visitedCount,
  onLogout,
  userTrips,
}: {
  user: {
    username: string;
    email: string;
    places_visited: number;
    countries: number;
    followers: number;
    following: number;
  };
  bucketCount: number;
  visitedCount: number;
  onLogout: () => void;
  userTrips: UserTrip[];
}) {
  const addNewTrip = useTravelStore((s) => s.addNewTrip);
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState('');

  const handleAddTrip = () => {
    if (newTripTitle.trim()) {
      addNewTrip(newTripTitle.trim());
      setNewTripTitle('');
      setShowAddTrip(false);
    }
  };

  return (
    <>
      {/* Profile Card */}
      <div className="bg-earth-card rounded-2xl border border-earth-card p-5" data-testid="profile-card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-orange flex items-center justify-center text-white font-heading font-bold text-lg">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-lg text-txt-primary">{user.username}</h2>
            <p className="text-sm text-txt-muted truncate">{user.email}</p>
          </div>
          <button
            data-testid="logout-button"
            onClick={onLogout}
            className="p-2 rounded-lg bg-earth-surface text-txt-muted hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Social Stats */}
        <div className="flex items-center justify-around mt-5 py-3 border-t border-b border-earth-surface">
          {[
            { label: 'Followers', value: user.followers, icon: Users },
            { label: 'Following', value: user.following, icon: UserPlus },
            { label: 'Countries', value: user.countries, icon: Globe },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center" data-testid={`stat-${label.toLowerCase()}`}>
              <Icon size={12} className="text-txt-muted mx-auto mb-0.5" />
              <span className="block text-lg font-heading font-bold text-txt-primary">{value}</span>
              <span className="text-[9px] text-txt-muted uppercase tracking-wider font-bold">{label}</span>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-earth-surface rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={13} className="text-brand-orange" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-txt-muted">Bucket List</span>
            </div>
            <span className="text-xl font-heading font-extrabold text-txt-primary">{bucketCount}</span>
          </div>
          <div className="bg-earth-surface rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={13} className="text-green-400" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-txt-muted">Visited</span>
            </div>
            <span className="text-xl font-heading font-extrabold text-txt-primary">{visitedCount}</span>
          </div>
        </div>
      </div>

      {/* Trip Timeline Header + Add Trip */}
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] uppercase tracking-wider font-bold text-txt-muted">
          Your Journey Timeline
        </h3>
        <button
          data-testid="add-trip-button"
          onClick={() => setShowAddTrip(!showAddTrip)}
          className="flex items-center gap-1 text-[11px] font-bold text-brand-orange hover:text-brand-orange-hover transition-colors px-2 py-1 rounded-lg hover:bg-brand-orange/10"
        >
          <Plus size={14} />
          Add Trip
        </button>
      </div>

      {/* Add Trip Input */}
      <AnimatePresence>
        {showAddTrip && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden -mt-2"
          >
            <div className="flex gap-2 mb-2">
              <input
                data-testid="new-trip-title-input"
                type="text"
                value={newTripTitle}
                onChange={(e) => setNewTripTitle(e.target.value)}
                placeholder="e.g. South America Adventure"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTrip()}
                className="flex-1 px-3 py-2 bg-earth-card border border-earth-card rounded-xl text-txt-primary placeholder:text-txt-muted text-sm outline-none focus:border-brand-orange transition-colors font-body"
                autoFocus
              />
              <button
                data-testid="confirm-add-trip"
                onClick={handleAddTrip}
                className="px-3 py-2 bg-brand-orange text-white rounded-xl hover:bg-brand-orange-hover transition-colors"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => setShowAddTrip(false)}
                className="px-2 py-2 bg-earth-card text-txt-muted rounded-xl hover:text-txt-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editable Trip Timeline */}
      <EditableTripTimeline trips={userTrips} />
    </>
  );
}

/* ============ Editable Trip Timeline ============ */
function EditableTripTimeline({ trips }: { trips: UserTrip[] }) {
  const [editingTripId, setEditingTripId] = useState<string | null>(null);

  return (
    <div data-testid="trip-timeline">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[18px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-brand-orange via-brand-sage to-earth-surface rounded-full" />

        <div className="space-y-0">
          {trips.map((trip, idx) => (
            <motion.div
              key={trip.id}
              data-testid={`trip-node-${trip.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3, ease: 'easeOut' }}
              className="relative pl-12 pb-5"
            >
              {/* Timeline node */}
              <div className="absolute left-0 top-0">
                <div
                  className={`w-[38px] h-[38px] rounded-full flex items-center justify-center border-2 ${
                    idx === 0
                      ? 'bg-brand-orange/20 border-brand-orange'
                      : 'bg-earth-card border-brand-sage/40'
                  }`}
                >
                  <Calendar size={14} className={idx === 0 ? 'text-brand-orange' : 'text-brand-sage'} />
                </div>
              </div>

              {editingTripId === trip.id ? (
                <TripEditor trip={trip} onDone={() => setEditingTripId(null)} />
              ) : (
                <TripCard trip={trip} onEdit={() => setEditingTripId(trip.id)} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ Read-only Trip Card ============ */
function TripCard({ trip, onEdit }: { trip: UserTrip; onEdit: () => void }) {
  const deleteTrip = useTravelStore((s) => s.deleteTrip);

  return (
    <div className="bg-earth-card rounded-xl border border-earth-card p-3.5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <h4 className="font-heading font-bold text-sm text-txt-primary">{trip.tripTitle}</h4>
          <span className="text-[10px] text-txt-muted">
            {trip.date} &middot; {trip.daysTotal} days
          </span>
        </div>
        <div className="flex gap-1">
          <button
            data-testid={`edit-trip-${trip.id}`}
            onClick={onEdit}
            className="p-1.5 rounded-lg text-txt-muted hover:text-brand-orange hover:bg-brand-orange/10 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            data-testid={`delete-trip-${trip.id}`}
            onClick={() => deleteTrip(trip.id)}
            className="p-1.5 rounded-lg text-txt-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-1 flex-wrap mb-2">
        {trip.stops.map((stop, sIdx) => (
          <span key={sIdx} className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-txt-secondary">{stop.city}</span>
            {sIdx < trip.stops.length - 1 && (
              <span className="text-[10px] text-brand-sage font-bold mx-0.5">&rarr;</span>
            )}
          </span>
        ))}
        {trip.stops.length === 0 && (
          <span className="text-[11px] text-txt-muted italic">No stops yet — tap edit to add</span>
        )}
      </div>

      {/* Highlight */}
      {trip.highlight && (
        <div className="flex items-center gap-1.5 bg-earth-surface rounded-lg px-2.5 py-1.5">
          <Sparkles size={11} className="text-brand-sand flex-shrink-0" />
          <span className="text-[11px] text-brand-sand font-medium italic">{trip.highlight}</span>
        </div>
      )}
    </div>
  );
}

/* ============ Trip Editor (inline) ============ */
function TripEditor({ trip, onDone }: { trip: UserTrip; onDone: () => void }) {
  const updateTripTitle = useTravelStore((s) => s.updateTripTitle);
  const updateTripHighlight = useTravelStore((s) => s.updateTripHighlight);
  const addStopToTrip = useTravelStore((s) => s.addStopToTrip);
  const removeStopFromTrip = useTravelStore((s) => s.removeStopFromTrip);
  const reorderTripStop = useTravelStore((s) => s.reorderTripStop);

  const [newCity, setNewCity] = useState('');
  const [newCountry, setNewCountry] = useState('');

  const handleAddStop = () => {
    if (newCity.trim() && newCountry.trim()) {
      addStopToTrip(trip.id, newCity.trim(), newCountry.trim());
      setNewCity('');
      setNewCountry('');
    }
  };

  return (
    <div className="bg-earth-card rounded-xl border-2 border-brand-orange/40 p-3.5" data-testid={`trip-editor-${trip.id}`}>
      {/* Editable Title */}
      <div className="mb-3">
        <label className="text-[9px] uppercase tracking-wider font-bold text-txt-muted mb-1 block">Trip Name</label>
        <input
          data-testid={`edit-trip-title-${trip.id}`}
          type="text"
          value={trip.tripTitle}
          onChange={(e) => updateTripTitle(trip.id, e.target.value)}
          className="w-full px-3 py-1.5 bg-earth-surface border border-earth-card rounded-lg text-txt-primary text-sm outline-none focus:border-brand-orange transition-colors font-body"
        />
      </div>

      {/* Editable Highlight */}
      <div className="mb-3">
        <label className="text-[9px] uppercase tracking-wider font-bold text-txt-muted mb-1 block">Highlight</label>
        <input
          data-testid={`edit-trip-highlight-${trip.id}`}
          type="text"
          value={trip.highlight}
          onChange={(e) => updateTripHighlight(trip.id, e.target.value)}
          placeholder="Best moment of this trip..."
          className="w-full px-3 py-1.5 bg-earth-surface border border-earth-card rounded-lg text-txt-primary placeholder:text-txt-muted text-sm outline-none focus:border-brand-orange transition-colors font-body"
        />
      </div>

      {/* Stops List (reorderable) */}
      <label className="text-[9px] uppercase tracking-wider font-bold text-txt-muted mb-2 block">
        Stops ({trip.stops.length})
      </label>
      <div className="space-y-1.5 mb-3">
        <AnimatePresence>
          {trip.stops.map((stop, idx) => (
            <motion.div
              key={`${stop.city}-${idx}`}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-1.5 bg-earth-surface rounded-lg px-2 py-1.5"
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0">
                <button
                  data-testid={`move-stop-up-${trip.id}-${idx}`}
                  disabled={idx === 0}
                  onClick={() => reorderTripStop(trip.id, idx, idx - 1)}
                  className="text-txt-muted hover:text-txt-primary disabled:opacity-20 transition-colors p-0 leading-none"
                >
                  <ChevronUp size={11} />
                </button>
                <button
                  data-testid={`move-stop-down-${trip.id}-${idx}`}
                  disabled={idx === trip.stops.length - 1}
                  onClick={() => reorderTripStop(trip.id, idx, idx + 1)}
                  className="text-txt-muted hover:text-txt-primary disabled:opacity-20 transition-colors p-0 leading-none"
                >
                  <ChevronDown size={11} />
                </button>
              </div>

              {/* Stop label */}
              <span className="text-[11px] font-semibold text-txt-primary flex-1">{stop.city}</span>
              <span className="text-[10px] text-txt-muted">{stop.country}</span>

              {/* Remove */}
              <button
                data-testid={`remove-stop-${trip.id}-${idx}`}
                onClick={() => removeStopFromTrip(trip.id, idx)}
                className="text-txt-muted hover:text-red-400 transition-colors p-0.5"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Stop */}
      <div className="flex gap-1.5 mb-3">
        <input
          data-testid={`add-stop-city-${trip.id}`}
          type="text"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          placeholder="City"
          className="flex-1 px-2 py-1.5 bg-earth-surface border border-earth-card rounded-lg text-txt-primary placeholder:text-txt-muted text-xs outline-none focus:border-brand-orange transition-colors font-body"
        />
        <input
          data-testid={`add-stop-country-${trip.id}`}
          type="text"
          value={newCountry}
          onChange={(e) => setNewCountry(e.target.value)}
          placeholder="Country"
          onKeyDown={(e) => e.key === 'Enter' && handleAddStop()}
          className="flex-1 px-2 py-1.5 bg-earth-surface border border-earth-card rounded-lg text-txt-primary placeholder:text-txt-muted text-xs outline-none focus:border-brand-orange transition-colors font-body"
        />
        <button
          data-testid={`add-stop-btn-${trip.id}`}
          onClick={handleAddStop}
          className="px-2 py-1.5 bg-brand-sage/20 text-brand-sage rounded-lg hover:bg-brand-sage/30 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Done button */}
      <button
        data-testid={`done-editing-${trip.id}`}
        onClick={onDone}
        className="w-full py-2 bg-brand-orange text-white text-sm font-semibold rounded-xl hover:bg-brand-orange-hover transition-colors flex items-center justify-center gap-1.5"
      >
        <Check size={14} />
        Done Editing
      </button>
    </div>
  );
}

/* ============ Auth View ============ */
function AuthView({
  onLogin,
  onRegister,
}: {
  onLogin: (email: string, password: string) => void;
  onRegister: (username: string, email: string, password: string) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'register' && !username.trim()) {
      setError('Username is required.');
      return;
    }
    if (mode === 'login') onLogin(email, password);
    else onRegister(username, email, password);
  };

  return (
    <div className="bg-earth-card rounded-2xl border border-earth-card overflow-hidden">
      <div className="flex border-b border-earth-surface">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            data-testid={`auth-tab-${m}`}
            onClick={() => { setMode(m); setError(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === m
                ? 'text-brand-orange border-b-2 border-brand-orange'
                : 'text-txt-muted hover:text-txt-secondary'
            }`}
          >
            {m === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-txt-secondary mb-1.5 uppercase tracking-wider">Username</label>
            <input data-testid="auth-username-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="wanderer42" className="w-full px-4 py-2.5 bg-earth-surface border border-earth-card rounded-xl text-txt-primary placeholder:text-txt-muted text-sm outline-none focus:border-brand-orange transition-colors font-body" />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-txt-secondary mb-1.5 uppercase tracking-wider">Email</label>
          <input data-testid="auth-email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@wanderlust.app" className="w-full px-4 py-2.5 bg-earth-surface border border-earth-card rounded-xl text-txt-primary placeholder:text-txt-muted text-sm outline-none focus:border-brand-orange transition-colors font-body" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-txt-secondary mb-1.5 uppercase tracking-wider">Password</label>
          <div className="relative">
            <input data-testid="auth-password-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" className="w-full px-4 py-2.5 bg-earth-surface border border-earth-card rounded-xl text-txt-primary placeholder:text-txt-muted text-sm outline-none focus:border-brand-orange transition-colors font-body pr-10" />
            <button type="button" data-testid="toggle-password-visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-secondary">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        {error && <p data-testid="auth-error" className="text-sm text-red-400 font-body">{error}</p>}
        <button data-testid="auth-submit-button" type="submit" className="w-full py-3 bg-brand-orange text-white font-semibold rounded-xl hover:bg-brand-orange-hover transition-colors text-sm">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
