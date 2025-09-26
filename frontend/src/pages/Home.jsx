import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-twine-50 to-twine-100">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-twine-500 to-twine-700">WorkFlow AI</Link>
        <nav className="flex items-center gap-3">
          <Link to="/admin" className="px-4 py-2 text-twine-700 hover:text-twine-900">Owner Portal</Link>
          <Link to="/dashboard" className="px-4 py-2 text-twine-700 hover:text-twine-900">Employee Portal</Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-twine-800 mb-4">Streamline Schedules with AI</h1>
        <p className="text-twine-600 mb-10">For businesses and employees — onboard your store, manage staff, and generate smart schedules.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-white rounded-2xl shadow-md border border-twine-200 p-6">
            <Building2 className="w-10 h-10 text-twine-500 mb-4" />
            <h2 className="text-2xl font-semibold text-twine-800 mb-2">I’m an Owner</h2>
            <p className="text-twine-600 mb-4">Register your business or log in to manage your team and schedules.</p>
            <div className="flex gap-3">
              <Link to="/admin/onboarding" className="px-5 py-3 bg-gradient-to-r from-twine-500 to-twine-600 text-white rounded-xl hover:from-twine-600 hover:to-twine-700 transition inline-flex items-center gap-2">
                Register Business <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/admin" className="px-5 py-3 border border-twine-300 text-twine-700 rounded-xl hover:bg-white/50 transition">Go to Owner Portal</Link>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-twine-200 p-6">
            <Users className="w-10 h-10 text-twine-500 mb-4" />
            <h2 className="text-2xl font-semibold text-twine-800 mb-2">I’m an Employee</h2>
            <p className="text-twine-600 mb-4">Log in with the credentials sent by your employer after onboarding.</p>
            <div className="flex gap-3">
              <Link to="/dashboard" className="px-5 py-3 bg-twine-500 text-white rounded-xl hover:bg-twine-600 transition inline-flex items-center gap-2">
                Employee Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;


