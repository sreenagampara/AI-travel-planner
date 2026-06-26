import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { ItinerarySkeleton } from '../../components/common/Skeleton';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Share2,
  Copy,
  Printer,
  Trash2,
  Plane,
  Hotel,
  Briefcase,
  AlertTriangle,
  Info,
  Clock,
  Compass,
  CheckCircle2,
  Heart,
  ChevronRight,
  ShieldAlert,
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

interface Accommodation {
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  notes?: string;
}

interface Contact {
  name: string;
  phone: string;
}

interface TripDetailsData {
  _id: string;
  title: string;
  isPublic: boolean;
  travelData: {
    passengers?: string[];
    flights?: Array<{
      flightNumber: string;
      airline?: string;
      departureAirport: string;
      arrivalAirport: string;
      departureTime?: string;
      bookingReference?: string;
    }>;
    hotels?: Array<{
      hotelName: string;
      hotelAddress?: string;
      checkIn?: string;
      checkOut?: string;
      bookingReference?: string;
    }>;
  };
  itinerary: {
    tripTitle: string;
    destination: string;
    startDate: string;
    endDate: string;
    summary: string;
    dayWiseItinerary: DayPlan[];
    accommodationDetails?: Accommodation[];
    packingSuggestions?: string[];
    importantReminders?: string[];
    emergencyContacts?: Contact[];
  };
}

export const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient } = useApi();

  const [trip, setTrip] = useState<TripDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [shareCopied, setShareCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  const fetchTrip = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const client = await getClient();
      const res = await client.get(`/api/trips/${id}`);
      setTrip(res.data.data.trip);
    } catch (err: any) {
      console.error('Error loading trip details:', err);
      setError('Could not retrieve trip itinerary details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const togglePublicShare = async () => {
    if (!trip) return;
    try {
      const client = await getClient();
      const nextPublicState = !trip.isPublic;
      const res = await client.patch(`/api/trips/${trip._id}`, { isPublic: nextPublicState });
      setTrip(res.data.data.trip);
    } catch (err) {
      console.error('Failed to toggle share settings:', err);
      alert('Failed to update sharing preference.');
    }
  };

  const copyShareLink = () => {
    if (!trip) return;
    const shareUrl = `${window.location.origin}/share/${trip._id}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const copyItineraryText = () => {
    if (!trip) return;
    let text = `--- ${trip.title} ---\nDestination: ${trip.itinerary.destination}\nSummary: ${trip.itinerary.summary}\n\n`;
    
    trip.itinerary.dayWiseItinerary.forEach((day) => {
      text += `Day ${day.dayNumber}: ${day.theme} (${day.date})\n`;
      day.schedule.forEach((item) => {
        text += `- [${item.time}] ${item.activity} at ${item.location}\n  ${item.description}\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!trip) return;
    if (!confirm('Are you sure you want to delete this itinerary? This cannot be undone.')) {
      return;
    }

    try {
      const client = await getClient();
      await client.delete(`/api/trips/${trip._id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete trip:', err);
      alert('Failed to delete trip itinerary.');
    }
  };

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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 text-white bg-slate-950">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-extrabold">Failed to open itinerary</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">{error || 'This itinerary does not exist.'}</p>
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-primary-400 hover:text-white text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Active day details
  const dayPlan = trip.itinerary.dayWiseItinerary.find((d) => d.dayNumber === activeDay);

  // Helper for activity type icons
  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'transportation':
      case 'flight':
        return <Plane className="w-4 h-4 text-sky-400" />;
      case 'hotel':
      case 'accommodation':
        return <Hotel className="w-4 h-4 text-amber-400" />;
      case 'meal':
      case 'food':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      default:
        return <Compass className="w-4 h-4 text-primary-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-950 text-white min-h-[calc(100vh-8rem)] print:bg-white print:text-black">
      <div className="space-y-8">
        
        {/* Navigation / Control Panel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6 print:hidden">
          <Link to="/dashboard" className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {/* Share toggle */}
            <button
              onClick={togglePublicShare}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-all ${
                trip.isPublic
                  ? 'bg-emerald-950/20 border-emerald-950 text-emerald-400 hover:bg-emerald-950/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{trip.isPublic ? 'Publicly Shared' : 'Keep Private'}</span>
            </button>

            {trip.isPublic && (
              <button
                onClick={copyShareLink}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-350 hover:text-white hover:border-slate-700 rounded-lg transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{shareCopied ? 'Copied Link!' : 'Copy Share Link'}</span>
              </button>
            )}

            <button
              onClick={copyItineraryText}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-350 hover:text-white hover:border-slate-700 rounded-lg transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{textCopied ? 'Copied!' : 'Copy Itinerary'}</span>
            </button>

            <button
              onClick={printItinerary}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-350 hover:text-white hover:border-slate-700 rounded-lg transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-950/45 rounded-lg transition-all"
              title="Delete Trip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Details */}
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
              {trip.itinerary.dayWiseItinerary.length} Days Itinerary
            </span>
          </div>

          <p className="text-slate-350 text-sm leading-relaxed max-w-3xl bg-slate-900/20 border border-slate-900/60 p-4 rounded-xl">
            {trip.itinerary.summary}
          </p>
        </div>

        {/* Main Itinerary Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Day Planner Timelines (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Daily Schedule</h2>
              <span className="text-xs text-slate-500">Click a day to filter details</span>
            </div>

            {/* Days Tabs Selection */}
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
                          <div className="text-gray-650">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Active Day Timeline Display */}
            {dayPlan && (
              <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-6 print:hidden">
                <div className="border-b border-slate-850/60 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-primary-400">Day {dayPlan.dayNumber}:</span>
                    <span>{dayPlan.theme}</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Scheduled Date: {new Date(dayPlan.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                </div>

                {dayPlan.schedule.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No scheduled activities for this day.</p>
                ) : (
                  <div className="relative pl-6 border-l-2 border-slate-850 ml-3 space-y-8">
                    {dayPlan.schedule.map((activity, index) => (
                      <div key={index} className="relative group">
                        
                        {/* Timeline Connector Icon */}
                        <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shadow group-hover:border-primary-500 transition-colors">
                          {getActivityIcon(activity.type)}
                        </div>

                        {/* Event Details */}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center text-xs font-mono font-bold text-primary-400 bg-primary-950/20 border border-primary-900/60 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3 mr-1" />
                              {activity.time}
                            </span>
                            <h4 className="font-bold text-sm text-white group-hover:text-primary-400 transition-colors">
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
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar Widgets Panel */}
          <div className="space-y-6">
            
            {/* Extracted Tickets Summary */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-400" />
                <span>Extracted Booking Details</span>
              </h3>

              {/* Passengers */}
              {trip.travelData.passengers && trip.travelData.passengers.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="text-slate-550 block font-medium">Passenger Records</span>
                  <div className="flex flex-wrap gap-1">
                    {trip.travelData.passengers.map((p, idx) => (
                      <span key={idx} className="bg-slate-950 border border-slate-850 px-2 py-1 rounded text-slate-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Flights */}
              {trip.travelData.flights && trip.travelData.flights.length > 0 && (
                <div className="space-y-2 border-t border-slate-850/60 pt-3">
                  <span className="text-slate-550 block text-xs font-medium">Flight Bookings</span>
                  <div className="space-y-2">
                    {trip.travelData.flights.map((f, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-lg text-xs space-y-1.5">
                        <div className="flex justify-between font-bold text-white">
                          <span className="flex items-center gap-1">
                            <Plane className="w-3.5 h-3.5 text-sky-400" />
                            {f.flightNumber}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{f.bookingReference || 'No PNR'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {f.departureAirport} &rarr; {f.arrivalAirport}
                        </p>
                        {f.departureTime && (
                          <p className="text-[9px] text-slate-500">Departs: {new Date(f.departureTime).toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels */}
              {trip.travelData.hotels && trip.travelData.hotels.length > 0 && (
                <div className="space-y-2 border-t border-slate-850/60 pt-3">
                  <span className="text-slate-550 block text-xs font-medium">Hotel Bookings</span>
                  <div className="space-y-2">
                    {trip.travelData.hotels.map((h, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-lg text-xs space-y-1.5">
                        <div className="flex justify-between font-bold text-white">
                          <span className="flex items-center gap-1 select-all truncate max-w-[130px]">
                            <Hotel className="w-3.5 h-3.5 text-amber-400" />
                            {h.hotelName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{h.bookingReference || 'No Code'}</span>
                        </div>
                        {h.hotelAddress && <p className="text-[10px] text-slate-450">{h.hotelAddress}</p>}
                        <p className="text-[9px] text-slate-500">
                          Dates: {h.checkIn} to {h.checkOut}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!trip.travelData.flights?.length && !trip.travelData.hotels?.length) && (
                <p className="text-xs text-slate-550 italic">No structural ticketing data extracted.</p>
              )}
            </div>

            {/* Packing Checklist */}
            {trip.itinerary.packingSuggestions && trip.itinerary.packingSuggestions.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-primary-400" />
                  <span>Packing Checklist</span>
                </h3>
                <ul className="space-y-2">
                  {trip.itinerary.packingSuggestions.map((item, idx) => (
                    <li key={idx} className="flex items-start text-xs text-slate-350 space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Important Reminders */}
            {trip.itinerary.importantReminders && trip.itinerary.importantReminders.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Travel Warnings</span>
                </h3>
                <ul className="space-y-2">
                  {trip.itinerary.importantReminders.map((item, idx) => (
                    <li key={idx} className="flex items-start text-xs text-slate-350 space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Emergency Contacts */}
            {trip.itinerary.emergencyContacts && trip.itinerary.emergencyContacts.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>Emergency Directory</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {trip.itinerary.emergencyContacts.map((contact, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-950/65 rounded border border-slate-850">
                      <span className="font-semibold text-slate-300">{contact.name}</span>
                      <a href={`tel:${contact.phone}`} className="font-mono text-primary-400 hover:text-white transition-colors">
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default TripDetails;
