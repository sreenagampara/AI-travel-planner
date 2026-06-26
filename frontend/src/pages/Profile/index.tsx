import { useAuth0 } from '@auth0/auth0-react';
import { User, Mail, Calendar, ShieldCheck } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth0();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-slate-950 text-white min-h-[calc(100vh-8rem)]">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Profile</h1>
          <p className="text-slate-450 text-sm mt-1">Manage your Travel AI account metadata and security sync logs.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-premium">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-24 h-24 rounded-full border-2 border-primary-500 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <User className="w-12 h-12 text-slate-400" />
            </div>
          )}

          <div className="text-center sm:text-left space-y-2 flex-grow">
            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-slate-400 justify-center sm:justify-start">
              <span className="flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>{user?.email}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded text-xs font-semibold">
                  Verified Identity
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Account Details Box */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">Security Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-slate-500 font-medium">Authentication ID (Subject)</p>
              <p className="font-mono text-xs bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-850 select-all overflow-x-auto text-slate-300">
                {user?.sub}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-slate-500 font-medium">Session Nickname</p>
              <p className="text-slate-300 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-850">
                {user?.nickname || 'None'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-500 font-medium">Last Login Update</p>
              <p className="text-slate-350 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-850 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>{user?.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
