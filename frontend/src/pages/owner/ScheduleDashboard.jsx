import React, { useState } from "react";
import OwnerNavbar from '../../components/OwnerNavbar';
import { Wand2, CheckCircle2, XCircle, Plus, Clock, ListChecks } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import ShimmerCard from '../../components/ui/magic/ShimmerCard';
import Particles from '../../components/ui/magic/Particles';

const ScheduleDashboard = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Open store at 9 AM', role: 'Cashier' },
    { id: 2, title: 'Inventory check', role: 'Stock Manager' },
  ]);
  const [newTask, setNewTask] = useState({ title: '', role: '' });
  const [status, setStatus] = useState('idle'); // idle | generating | proposed | approved | declined
  const [proposedSchedule, setProposedSchedule] = useState(null);

  const generateSchedule = async () => {
    setStatus('generating');
    // Mock AI call
    setTimeout(() => {
      setProposedSchedule({
        week: 'Next Week',
        shifts: [
          { day: 'Mon', role: 'Cashier', time: '09:00-17:00' },
          { day: 'Tue', role: 'Stock Manager', time: '10:00-18:00' },
        ]
      });
      setStatus('proposed');
    }, 1200);
  };

  const approveSchedule = () => {
    setStatus('approved');
  };

  const declineSchedule = () => {
    setStatus('declined');
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    setTasks([...tasks, { id: Date.now(), ...newTask }]);
    setNewTask({ title: '', role: '' });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-twine-50 via-twine-100 to-white relative overflow-hidden">
      <Particles count={100} />
      <OwnerNavbar />
      <div className="p-6 max-w-6xl mx-auto">
        <ShimmerCard className="mb-6 backdrop-blur-xl bg-white/70">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ListChecks className="w-7 h-7 text-twine-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-twine-800 to-twine-600 bg-clip-text text-transparent">Schedule Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generateSchedule}
                disabled={status === 'generating'}
                className="px-5 py-3 bg-gradient-to-r from-twine-500 to-twine-600 text-white rounded-xl hover:from-twine-600 hover:to-twine-700 transition disabled:opacity-60 flex items-center gap-2"
              >
                <Wand2 className="w-5 h-5" />
                {status === 'generating' ? 'Generating...' : 'Generate AI Schedule'}
              </button>
            </div>
          </div>
        </ShimmerCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ShimmerCard className="lg:col-span-2 p-6 backdrop-blur-sm bg-white/80">
            <h2 className="text-xl font-semibold text-twine-800 mb-4">Proposed Schedule</h2>
            {!proposedSchedule && status === 'idle' && (
              <p className="text-twine-600">Click Generate to create a proposed schedule.</p>
            )}
            {status === 'generating' && (
              <div className="text-twine-600">Generating schedule...</div>
            )}
            {proposedSchedule && (
              <div>
                <p className="text-twine-700 mb-4">{proposedSchedule.week}</p>
                <div className="space-y-2">
                  {proposedSchedule.shifts.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-twine-50 rounded-xl">
                      <span className="font-medium text-twine-800">{s.day}</span>
                      <span className="text-twine-700">{s.role}</span>
                      <span className="font-mono text-twine-800">{s.time}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <Button onClick={approveSchedule} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-5 h-5" /> Approve
                  </Button>
                  <Button onClick={declineSchedule} className="bg-red-600 hover:bg-red-700">
                    <XCircle className="w-5 h-5" /> Decline
                  </Button>
                </div>
                {status === 'approved' && <p className="text-green-700 mt-3">Schedule approved and published.</p>}
                {status === 'declined' && <p className="text-red-700 mt-3">Schedule declined. Adjust tasks and regenerate.</p>}
              </div>
            )}
          </ShimmerCard>

          <ShimmerCard className="p-6 backdrop-blur-sm bg-white/80">
            <h2 className="text-xl font-semibold text-twine-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" /> Tasks
            </h2>

            <form onSubmit={addTask} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Add task..."
                className="flex-1 px-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500"
              />
              <input
                type="text"
                value={newTask.role}
                onChange={(e) => setNewTask({ ...newTask, role: e.target.value })}
                placeholder="Role"
                className="w-40 px-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500"
              />
              <Button type="submit" className="bg-twine-500 hover:bg-twine-600 inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </form>

            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 border border-twine-200 rounded-xl">
                  <div>
                    <p className="font-medium text-twine-800">{t.title}</p>
                    {t.role && <p className="text-sm text-twine-600">{t.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </ShimmerCard>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDashboard;
