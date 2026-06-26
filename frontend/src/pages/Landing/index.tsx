import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Plane, Compass, Sparkles, FileText, Share2, Shield } from 'lucide-react';

export const LandingPage = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      loginWithRedirect();
    }
  };

  const features = [
    {
      title: 'Auto Document Extraction',
      description: 'Drag and drop travel confirmation PDFs, flight tickets, or hotel receipts. We extract text in real-time.',
      icon: FileText,
    },
    {
      title: 'Gemini AI Processing',
      description: 'Advanced entity extraction identifies passenger names, flight schedules, dates, and hotel confirmations.',
      icon: Sparkles,
    },
    {
      title: 'Day-Wise Itineraries',
      description: 'Generates a detailed, day-by-day plan including timing details, travel suggestions, and nearby hotspots.',
      icon: Compass,
    },
    {
      title: 'Easy Share Links',
      description: 'Generate public share links with a toggle. Send your itinerary to friends, family, or travel companions.',
      icon: Share2,
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-primary-950/40 border border-primary-900 text-primary-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-premium">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>AI-Powered Travel Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent leading-none">
            Transform travel bookings into beautiful itineraries.
          </h1>

          <p className="text-slate-400 text-base sm:text-xl max-w-2xl mx-auto font-normal">
            Upload your flight tickets, booking confirmations, and hotel PDFs. Our AI extracts your schedule and curates a customized day-by-day journey.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleCTA}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-600 to-sky-500 rounded-xl font-semibold shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-0.5 text-sm flex items-center justify-center space-x-2 text-white"
            >
              <Plane className="w-4 h-4" />
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl font-semibold text-sm transition-all text-slate-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-slate-900 bg-slate-950/50 py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              How Travel AI Planner Works
            </h2>
            <p className="text-slate-450 text-slate-450 text-sm">
              We leverage Optical Character Recognition (OCR) and Gemini Large Language Models to organize your travel schedules in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl hover:border-slate-800 transition-all hover:bg-slate-900 shadow-premium"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-950/50 border border-primary-900 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Badge / Security */}
      <section className="border-t border-slate-900 py-16 text-center bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-4">
          <Shield className="w-8 h-8 text-primary-500" />
          <h3 className="text-base font-semibold text-white">Secure Authentication & Storage</h3>
          <p className="text-xs text-slate-500 max-w-md">
            All user profiles are secure under Auth0 federated authentication. Uploaded documents are saved in Cloudinary storage, preserving secure transit.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
