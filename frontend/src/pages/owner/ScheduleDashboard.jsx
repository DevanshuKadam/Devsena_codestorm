import React, { useState } from "react";
import OwnerNavbar from '../../components/OwnerNavbar';
import { Wand2, CheckCircle2, XCircle, Plus, ListChecks, Clock } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <Particles count={100} />
      <OwnerNavbar />
      
      {/* Structural Fix: Updated max-w-6xl to consistent max-w-7xl */}
      <div className="relative z-10 pt-24 p-6 max-w-7xl mx-auto"> 
        
        {/* Header Card */}
        <ShimmerCard className="mb-8 backdrop-blur-xl bg-white/70">
          <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg">
                <ListChecks className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                Schedule Dashboard
              </h1>
            </div>
            
            {/* Action Button Section */}
            <button
              onClick={generateSchedule}
              disabled={status === 'generating'}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-blue-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              <Wand2 className={`w-5 h-5 ${status === 'generating' ? 'animate-spin' : ''}`} />
              {status === 'generating' ? 'Generating...' : 'Generate AI Schedule'}
            </button>
          </div>
        </ShimmerCard>

        {/* Main Grid Layout (2/3 - 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Proposed Schedule Panel (2/3 width) */}
          <ShimmerCard className="lg:col-span-2 p-6 backdrop-blur-sm bg-white/80">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Proposed Schedule</h2>
            
            {/* Status Messages Styling Improved */}
            {!proposedSchedule && status === 'idle' && (
              <div className="text-gray-600 p-4 bg-blue-50/70 rounded-lg border border-blue-200">
                Click the **Generate AI Schedule** button to create a proposed schedule based on staff availability and required tasks.
              </div>
            )}
            
            {status === 'generating' && (
              <div className="text-blue-600 p-4 bg-blue-50/70 rounded-lg border border-blue-200 flex items-center gap-3">
                <Clock className="w-5 h-5 animate-spin"/> Generating optimal schedule... Please wait.
              </div>
            )}
            
            {proposedSchedule && (
              <div>
                <p className="text-blue-700 font-bold mb-4 border-b border-blue-200 pb-2">{proposedSchedule.week} Draft</p>
                <div className="space-y-3">
                  {proposedSchedule.shifts.map((s, i) => (
                    // Shift Item Styling Cleaned
                    <div key={i} className="grid grid-cols-3 items-center p-4 bg-blue-50/70 rounded-xl border border-blue-200 shadow-sm transition hover:shadow-md">
                      <span className="font-bold text-gray-900">{s.day}</span>
                      <span className="text-blue-700 font-medium">{s.role}</span>
                      <span className="font-mono text-indigo-700 font-semibold text-right">{s.time}</span>
                    </div>
                  ))}
                </div>
                
                {/* Approval Buttons Styling/Structure */}
                <div className="flex gap-4 mt-8">
                  <Button 
                    onClick={approveSchedule} 
                    className="flex-1 bg-green-600 hover:bg-green-700 shadow-lg text-white font-semibold"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Approve & Publish
                  </Button>
                  <Button 
                    onClick={declineSchedule} 
                    className="flex-1 bg-red-600 hover:bg-red-700 shadow-lg text-white font-semibold"
                  >
                    <XCircle className="w-5 h-5 mr-2" /> Decline
                  </Button>
                </div>
                {status === 'approved' && <p className="text-green-700 font-medium mt-4 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Schedule **approved and published**.</p>}
                {status === 'declined' && <p className="text-red-700 font-medium mt-4 flex items-center gap-1"><XCircle className="w-4 h-4"/> Schedule **declined**. Adjust tasks and regenerate.</p>}
              </div>
            )}
          </ShimmerCard>

          {/* Tasks Panel (1/3 width) */}
          <ShimmerCard className="p-6 backdrop-blur-sm bg-white/80">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ListChecks className="w-6 h-6 text-blue-600" /> Essential Tasks
            </h2>

            {/* Task Form Structure Improved */}
            <form onSubmit={addTask} className="space-y-3 mb-6">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task description (e.g., Close registers)"
                className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/70"
              />
              <input
                type="text"
                value={newTask.role}
                onChange={(e) => setNewTask({ ...newTask, role: e.target.value })}
                placeholder="Role required (e.g., Supervisor)"
                className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/70"
              />
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 inline-flex items-center justify-center gap-2 shadow-md">
                <Plus className="w-4 h-4" /> Add Task
              </Button>
            </form>

            {/* Task List Structure Cleaned */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-900">{t.title}</p>
                    {t.role && <p className="text-sm text-blue-600 font-medium">{t.role}</p>}
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