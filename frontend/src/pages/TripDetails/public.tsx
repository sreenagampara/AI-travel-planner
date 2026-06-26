import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ItinerarySkeleton } from '../../components/common/Skeleton';
import { createApiClient } from '../../services/apiClient';
import {
  Calendar,
  MapPin,
  Printer,
  Plane,
  Hotel,
  Compass,
  Clock,
  ShieldAlert,
  Compass as LogoIcon,
} from 'lucide-react';

interface Activity {
  time: string;
  activity: string;
  description: string;
  type: string;
  location: string;
}

interface DayPlan {
  dayNumber: number;
  date: string;
  theme: string;
  schedule: Activity[];
}

interface PublicTripData {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  itinerary: {
    tripTitle: string;
    destination: string;
    startDate: string;
    endDate: string;
    summary: string;
    dayWiseItinerary: DayPlan[];
    packingSuggestions?: string[];
    importantReminders?: string[];
  };
}

export const PublicTripDetails = () => {
  const { id } = useParams<{ id: string }>();

  const [trip, setTrip] = useState<PublicTripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);

  const fetchPublicTrip = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      // Fetch public endpoint directly without Axios checkJwt header
      const api = createApiClient();
      const res = await api.get(`/api/trips/public/${id}`);
      setTrip(res.data.data.trip);
    } catch (err: any) {
      console.error('Error fetching public trip details:', err);
      const message = err.response?.data?.message || 'Failed to retrieve shared travel itinerary.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicTrip();
  }, [id]);

  const printItinerary = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ItinerarySkeleton />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 text-white bg-slate-950 min-h-[calc(100vh-8rem)] flex flex-col justify-center items-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-extrabold">Shared Itinerary Unavailable</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">{error || 'This itinerary does not exist or has been set to private.'}</p>
        <Link to="/" className="inline-flex items-center space-x-2 text-primary-400 hover:text-white text-sm font-semibold">
          <span>Go to Travel AI Homepage</span>
        </Link>
      </div>
    );
  }

  const dayPlan = trip.itinerary.dayWiseItinerary.find((d) => d.dayNumber === activeDay);

  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'transportation':
      case 'flight':
        return <Plane className="w-4 h-4 text-sky-400" />;
      case 'hotel':
      case 'accommodation':
        return <Hotel className="w-4 h-4 text-amber-400" />;
      default:
        return <Compass className="w-4 h-4 text-primary-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-950 text-white min-h-[calc(100vh-4rem)] print:bg-white print:text-black">
      <div className="space-y-8">
        
        {/* Header Branding */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-6 print:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-600 to-sky-400 flex items-center justify-center">
              <LogoIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-350">Travel AI Shared Itinerary</span>
          </div>

          <button
            onClick={printItinerary}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all shadow-premium"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>

        {/* Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary-950/30 border border-primary-900 text-primary-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            <MapPin className="w-3.5 h-3.5 mr-0.5 text-primary-500" />
            <span>{trip.itinerary.destination}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{trip.title}</h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
            <span className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>
                {new Date(trip.itinerary.startDate).toLocaleDateString()} to{' '}
                {new Date(trip.itinerary.endDate).toLocaleDateString()}
              </span>
            </span>
            <span className="text-xs bg-slate-900 border border-slate-850 px-2.5 py-1 rounded text-slate-400">
              {trip.itinerary.dayWiseItinerary.length} Days Plan
            </span>
          </div>

          <p className="text-slate-350 text-sm leading-relaxed max-w-3xl bg-slate-900/20 border border-slate-900/60 p-4 rounded-xl">
            {trip.itinerary.summary}
          </p>
        </div>

        {/* Main Content split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Timeline schedule */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border-b border-slate-900 pb-3">
              <h2 className="text-lg font-bold text-white">Daily Schedule</h2>
            </div>

            {/* Day Selector */}
            <div className="flex flex-wrap gap-2 print:hidden">
              {trip.itinerary.dayWiseItinerary.map((day) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setActiveDay(day.dayNumber)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                    activeDay === day.dayNumber
                      ? 'bg-primary-600 border-primary-550 text-white shadow-premium'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white hover:border-slate-800'
                  }`}
                >
                  Day {day.dayNumber}
                </button>
              ))}
            </div>

            {/* Print Friendly Display - Show all days when printing */}
            <div className="hidden print:block space-y-8">
              {trip.itinerary.dayWiseItinerary.map((day) => (
                <div key={day.dayNumber} className="space-y-4">
                  <h3 className="text-lg font-bold border-b border-black pb-2 text-black">
                    Day {day.dayNumber} - {day.theme} ({new Date(day.date).toLocaleDateString()})
                  </h3>
                  <div className="space-y-4">
                    {day.schedule.map((item, index) => (
                      <div key={index} className="flex gap-4 text-xs text-black">
                        <div className="font-mono font-bold w-12">{item.time}</div>
                        <div>
                          <div className="font-bold">{item.activity} ({item.location})</div>
                          <div className="text-gray-655">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Active Day details */}
            {dayPlan && (
              <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-6 print:hidden">
                <div className="border-b border-slate-855 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-primary-400">Day {dayPlan.dayNumber}:</span>
                    <span>{dayPlan.theme}</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Date: {new Date(dayPlan.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-slate-850 ml-3 space-y-8">
                  {dayPlan.schedule.map((activity, index) => (
                    <div key={index} className="relative group">
                      
                      <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shadow">
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center text-xs font-mono font-bold text-primary-400 bg-primary-950/20 border border-primary-900/60 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 mr-1" />
                            {activity.time}
                          </span>
                          <h4 className="font-bold text-sm text-white">
                            {activity.activity}
                          </h4>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {activity.description}
                        </p>

                        <span className="inline-flex items-center text-[10px] text-slate-500">
                          <MapPin className="w-3 h-3 mr-1 text-slate-600" />
                          <span>{activity.location}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checklist side widgets */}
          <div className="space-y-6">
            
            {/* Packing suggestions */}
            {trip.itinerary.packingSuggestions && trip.itinerary.packingSuggestions.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Packing Recommendations</h3>
                <ul className="space-y-2">
                  {trip.itinerary.packingSuggestions.map((item, idx) => (
                    <li key={idx} className="flex items-start text-xs text-slate-350 space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {trip.itinerary.importantReminders && trip.itinerary.importantReminders.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Important Reminders</h3>
                <ul className="space-y-2">
                  {trip.itinerary.importantReminders.map((item, idx) => (
                    <li key={idx} className="flex items-start text-xs text-slate-350 space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default PublicTripDetails;
