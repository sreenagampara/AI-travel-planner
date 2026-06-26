import { Link } from 'react-router-dom';
import { PlaneTakeoff } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center px-4 space-y-6 bg-slate-950">
      <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-900 flex items-center justify-center text-red-500 animate-bounce">
        <PlaneTakeoff className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Page Lost in Transit (404)
      </h1>
      <p className="text-slate-400 max-w-sm">
        We couldn't find the page you were looking for. Perhaps this destination was removed or the flight was cancelled.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-all shadow-premium"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
