import React from 'react';
import { Link } from 'react-router-dom';
import OwnerNavbar from '../../components/OwnerNavbar';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CalendarCheck2, Users, Brain } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isOnboarded = localStorage.getItem('ownerOnboarded') === 'true';
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate(isOnboarded ? '/admin/schedule-dashboard' : '/admin/onboarding', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-twine-50">
      <OwnerNavbar />
      {/* Magic UI style background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-twine-200 via-twine-100 to-transparent blur-2xl opacity-80" />
        <div className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-gradient-to-tr from-purple-200 via-twine-100 to-transparent blur-2xl opacity-70" />
      </div>
      <div className="px-6 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-twine-500 rounded-full mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-twine-800 mb-3">WorkFlow AI — Owner Portal</h1>
          <p className="text-twine-600 mb-10">Manage your business profile, staff and AI-generated schedules in one place.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-gradient-to-r from-twine-500 to-twine-600 hover:from-twine-600 hover:to-twine-700">
              <Link to="/admin">Go to Owner Portal</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/onboarding">Register your business</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-14">
          <Card className="p-6 text-left">
            <Users className="w-8 h-8 text-twine-500 mb-3" />
            <h3 className="text-xl font-semibold text-twine-800 mb-2">Staff Management</h3>
            <p className="text-twine-600">Invite, edit and organize your team members with roles and availability.</p>
          </Card>
          <Card className="p-6 text-left">
            <Brain className="w-8 h-8 text-twine-500 mb-3" />
            <h3 className="text-xl font-semibold text-twine-800 mb-2">AI Schedules</h3>
            <p className="text-twine-600">Generate optimized schedules, then approve or decline with one click.</p>
          </Card>
          <Card className="p-6 text-left">
            <CalendarCheck2 className="w-8 h-8 text-twine-500 mb-3" />
            <h3 className="text-xl font-semibold text-twine-800 mb-2">Fast Setup</h3>
            <p className="text-twine-600">Complete a guided onboarding to get your business profile ready.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;
