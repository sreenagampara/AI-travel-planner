import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useApi } from '../../hooks/useApi';
import { Plus, Compass, FileText, Trash2, Calendar, MapPin, Share2, AlertCircle } from 'lucide-react';
import { DashboardSkeleton } from '../../components/common/Skeleton';

interface TripData {
  _id: string;
  title: string;
  isPublic: boolean;
  itinerary: {
    destination?: string;
    startDate?: string;
    endDate?: string;
  };
  createdAt: string;
}

interface StatsData {
  tripsCreated: number;
  documentsUploaded: number;
}

export const Dashboard = () => {
  const { user } = useAuth0();
  const { getClient } = useApi();
  const navigate = useNavigate();

  const [trips, setTrips] = useState<TripData[]>([]);
  const [stats, setStats] = useState<StatsData>({ tripsCreated: 0, documentsUploaded: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const client = await getClient();

      const [tripsRes, statsRes] = await Promise.all([
        client.get('/api/trips'),
        client.get('/api/trips/stats'),
      ]);

      setTrips(tripsRes.data.data.trips);
      setStats(statsRes.data.data.stats);
    } catch (err: any) {
      console.error('Error fetching dashboard details:', err);
      setError('Could not load dashboard data. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteTrip = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this trip itinerary? This cannot be undone.')) {
      return;
    }

    try {
      const client = await getClient();
      await client.delete(`/api/trips/${id}`);
      
      // Update local state
      setTrips(trips.filter((t) => t._id !== id));
      setStats((prev) => ({
        ...prev,
        tripsCreated: Math.max(0, prev.tripsCreated - 1),
      }));
    } catch (err: any) {
      console.error('Failed to delete trip:', err);
      alert('Failed to delete itinerary. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DashboardSkeleton />
      </div>
    );
  }

  const welcomeName = user?.given_name || user?.name?.split(' ')[0] || 'Traveler';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-950 text-white min-h-[calc(100vh-8rem)]">
      <div className="space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Welcome back, {welcomeName}!
            </h1>
            <p className="text-slate-400 text-sm">Review your travel itineraries and coordinate your upcoming departures.</p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-sky-500 rounded-xl font-semibold shadow-premium hover:shadow-premium-hover transition-all text-sm text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Trip</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-950/40 border border-red-900 rounded-xl p-4 flex items-center space-x-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl flex items-center space-x-4 shadow-premium">
            <div className="w-12 h-12 rounded-xl bg-primary-950/60 border border-primary-900 flex items-center justify-center">
              <Compass className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider">Trips Created</p>
              <h2 className="text-3xl font-extrabold mt-0.5">{stats.tripsCreated}</h2>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl flex items-center space-x-4 shadow-premium">
            <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-900 flex items-center justify-center">
              <FileText className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider">Documents Uploaded</p>
              <h2 className="text-3xl font-extrabold mt-0.5">{stats.documentsUploaded}</h2>
            </div>
          </div>
        </div>

        {/* Trips Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Recent Itineraries</span>
            <span className="text-xs bg-slate-800 border border-slate-750 text-slate-450 px-2 py-0.5 rounded-full font-medium">
              {trips.length} Saved
            </span>
          </h2>

          {trips.length === 0 ? (
            <div className="bg-slate-900/25 border border-dashed border-slate-850 rounded-2xl py-16 text-center space-y-4">
              <Compass className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-350">No itineraries found</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  You haven't generated any itineraries yet. Upload your booking confirmations and let Gemini write your travel plan.
                </p>
              </div>
              <button
                onClick={() => navigate('/upload')}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm font-semibold transition-all text-slate-300"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Trip</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => {
                const destination = trip.itinerary?.destination || 'Global Adventure';
                const formattedDate = trip.itinerary?.startDate
                  ? new Date(trip.itinerary.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Flexible Dates';

                return (
                  <Link
                    key={trip._id}
                    to={`/trip/${trip._id}`}
                    className="group bg-slate-900/40 border border-slate-850 hover:border-slate-750 rounded-2xl p-5 flex flex-col justify-between hover:bg-slate-900/60 hover:-translate-y-0.5 transition-all duration-300 shadow-premium hover:shadow-premium-hover"
                  >
                    <div className="space-y-3">
                      {/* Badge / Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-medium">
                          Created {new Date(trip.createdAt).toLocaleDateString()}
                        </span>
                        {trip.isPublic && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-950/40 border border-emerald-900 text-emerald-450 rounded text-[9px] font-semibold">
                            <Share2 className="w-2.5 h-2.5" />
                            <span>Shared</span>
                          </span>
                        )}
                      </div>

                      {/* Title & Destination */}
                      <div>
                        <h3 className="font-bold text-base text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                          {trip.title}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center mt-1.5 space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                          <span className="truncate">{destination}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-850 mt-5 pt-4">
                      <span className="text-xs text-slate-500 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-500" />
                        <span>{formattedDate}</span>
                      </span>
                      
                      <button
                        onClick={(e) => handleDeleteTrip(trip._id, e)}
                        className="p-2 rounded-lg hover:bg-red-950/20 text-slate-550 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-all"
                        title="Delete Itinerary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
