import React from 'react';
import OwnerNavbar from '../../components/OwnerNavbar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Calendar, Brain, FileText, Building2 } from 'lucide-react';
import ShimmerCard from '../../components/ui/magic/ShimmerCard';
import Particles from '../../components/ui/magic/Particles';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-twine-50 relative overflow-hidden">
      <Particles count={100} />
      <OwnerNavbar />

      <div className="p-6 max-w-7xl mx-auto">
        <ShimmerCard className="mb-8 backdrop-blur-xl bg-white/70">
          <div className="p-8 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-twine-500 to-twine-700 shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-twine-800 to-twine-600 bg-clip-text text-transparent">Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of your business, staff, and schedules</p>
              </div>
            </div>
          </div>
        </ShimmerCard>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 backdrop-blur-sm bg-white/80">
            <p className="text-sm text-twine-600">Total Employees</p>
            <p className="text-3xl font-bold text-twine-800 mt-2">8</p>
          </Card>
          <Card className="p-6 backdrop-blur-sm bg-white/80">
            <p className="text-sm text-twine-600">Open Positions</p>
            <p className="text-3xl font-bold text-twine-800 mt-2">2</p>
          </Card>
          <Card className="p-6 backdrop-blur-sm bg-white/80">
            <p className="text-sm text-twine-600">Next Week Shifts</p>
            <p className="text-3xl font-bold text-twine-800 mt-2">42</p>
          </Card>
          <Card className="p-6 backdrop-blur-sm bg-white/80">
            <p className="text-sm text-twine-600">Pending Approvals</p>
            <p className="text-3xl font-bold text-twine-800 mt-2">3</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ShimmerCard className="p-6 lg:col-span-2 backdrop-blur-sm bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-twine-600" />
                <h2 className="text-xl font-semibold text-twine-800">Upcoming Shifts</h2>
              </div>
              <Button asChild className="bg-gradient-to-r from-twine-500 to-twine-600 hover:from-twine-600 hover:to-twine-700">
                <a href="/admin/schedule-dashboard">View Scheduler</a>
              </Button>
            </div>
            <div className="space-y-2">
              {["Mon 9-5 Cashier", "Tue 10-6 Stock"]?.map((s, i) => (
                <div key={i} className="p-3 border border-twine-200 rounded-xl text-twine-800 bg-white/60">
                  {s}
                </div>
              ))}
            </div>
          </ShimmerCard>

          <ShimmerCard className="p-6 backdrop-blur-sm bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-twine-600" />
                <h2 className="text-xl font-semibold text-twine-800">Quick Actions</h2>
              </div>
            </div>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <a href="/admin/staff-management" className="inline-flex items-center gap-2"><Users className="w-4 h-4" /> Manage Staff</a>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <a href="/admin/schedule-dashboard" className="inline-flex items-center gap-2"><Brain className="w-4 h-4" /> Generate AI Schedule</a>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <a href="/admin/business-profile" className="inline-flex items-center gap-2"><FileText className="w-4 h-4" /> Edit Business Profile</a>
              </Button>
            </div>
          </ShimmerCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


