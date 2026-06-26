export const Footer = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} Travel AI Planner. Powered by Gemini. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
