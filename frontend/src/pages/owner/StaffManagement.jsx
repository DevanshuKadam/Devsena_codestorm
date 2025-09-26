import React, { useState } from 'react';
// Using Lucide Icons as they were in the original import
import { Users, Plus, Edit2, Trash2, Mail, Phone, UserCheck, Calendar, Clock, X, TrendingUp } from 'lucide-react';
import OwnerNavbar from '../../components/OwnerNavbar';
import Particles from '../../components/ui/magic/Particles';

const StaffManagement = () => {
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 123-4567',
      role: 'Cashier',
      availability: {
        Monday: ['09:00-17:00'],
        Tuesday: ['09:00-17:00'],
        Wednesday: ['09:00-17:00'],
        Thursday: ['09:00-17:00'],
        Friday: ['09:00-17:00'],
        Saturday: [],
        Sunday: []
      },
      status: 'active'
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+1 (555) 987-6543',
      role: 'Stock Manager',
      availability: {
        Monday: ['10:00-18:00'],
        Tuesday: ['10:00-18:00'],
        Wednesday: [],
        Thursday: ['10:00-18:00'],
        Friday: ['10:00-18:00'],
        Saturday: ['09:00-15:00'],
        Sunday: ['10:00-14:00']
      },
      status: 'active'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  const roles = ['Cashier', 'Helper', 'Stock Manager', 'Sales Associate', 'Supervisor', 'Cleaner'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Magic UI Shimmer Card Component (Kept for reference)
  const ShimmerCard = ({ children, className = "" }) => (
    <div className={`relative overflow-hidden bg-white rounded-2xl border border-gray-200/50 shadow-sm ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      {children}
    </div>
  );

  // Magic UI Animated Counter Component (Kept for reference, gradients updated)
  const AnimatedCounter = ({ value, label, icon: Icon, gradient = "from-orange-500 to-amber-600" }) => (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );

  const handleAddStaff = (e) => {
    e.preventDefault();
    const staffMember = {
      ...newStaff,
      id: Date.now(),
      availability: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
      },
      status: 'pending'
    };
    
    setStaff([...staff, staffMember]);
    setNewStaff({ name: '', email: '', phone: '', role: '' });
    setShowAddModal(false);
    
    // Mock email sending
    console.log(`Registration email sent to ${staffMember.email}`);
  };

  const removeStaff = (id) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  const getAvailabilityHours = (availability) => {
    const totalHours = Object.values(availability).reduce((total, daySlots) => {
      return total + daySlots.reduce((dayTotal, slot) => {
        const [start, end] = slot.split('-');
        const startTime = new Date(`2000-01-01T${start}:00`);
        const endTime = new Date(`2000-01-01T${end}:00`);
        // Handle midnight wrap-around (simplified for this mock data)
        const duration = (endTime - startTime) / (1000 * 60 * 60);
        return dayTotal + (duration < 0 ? duration + 24 : duration);
      }, 0);
    }, 0);
    return totalHours;
  };

  const AvailabilityGrid = ({ availability }) => (
    <div className="grid grid-cols-7 gap-2 text-xs">
      {daysOfWeek.map(day => (
        <div key={day} className="text-center">
          {/* Availability text/background updated to blue/indigo */}
          <div className="font-medium text-orange-700 mb-1">{day.substring(0, 3)}</div>
          <div className="space-y-1">
            {availability[day].length > 0 ? (
              availability[day].map((slot, index) => (
                <div key={index} className="bg-orange-100 text-orange-700 px-1 py-1 rounded text-xs">
                  {slot.replace('-', '-')}
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-xs">Off</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    // 1. Updated Background Gradient
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      <OwnerNavbar />
      {/* Particles Background */}
      <Particles count={70} />
      
      <div className="relative z-10 pt-24 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Card with Glassmorphism */}
          <ShimmerCard className="mb-8 backdrop-blur-xl bg-white/70">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  {/* Header Icon Gradient Updated */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    {/* Header Text Gradient Updated */}
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-800 to-amber-700 bg-clip-text text-transparent">
                      Staff Management
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your team members and their availability</p>
                  </div>
                </div>
                
                {/* Add Staff Button Gradient Updated */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Staff
                  </div>
                </button>
              </div>
            </div>
          </ShimmerCard>

          {/* Stats Cards - Gradients Updated */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCounter 
              value={staff.length} 
              label="Total Staff" 
              icon={Users} 
              gradient="from-orange-500 to-orange-700" // Updated to orange
            />
            <AnimatedCounter 
              value={staff.filter(s => s.status === 'active').length} 
              label="Active Staff" 
              icon={UserCheck} 
              gradient="from-amber-500 to-amber-700" // Updated to amber
            />
            <AnimatedCounter 
              value={staff.filter(s => s.status === 'pending').length} 
              label="Pending Setup" 
              icon={Clock} 
              gradient="from-yellow-500 to-yellow-700" // Updated to yellow
            />
            <AnimatedCounter 
              value={`${staff.reduce((total, s) => total + getAvailabilityHours(s.availability), 0).toFixed(0)}h`} 
              label="Total Hours/Week" 
              icon={Calendar} 
              gradient="from-amber-500 to-amber-700" // Updated to amber
            />
          </div>

          {/* Staff List */}
          <div className="space-y-6">
            {staff.map(member => (
              <ShimmerCard key={member.id} className="backdrop-blur-sm bg-white/80">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar Gradient Updated */}
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-gray-600 font-medium">{member.role}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{member.phone}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {member.status === 'active' ? 'Active' : 'Pending Setup'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Action Button Hover/Text Colors Updated */}
                      <button className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeStaff(member.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    {/* Availability Header Color Updated */}
                    <h4 className="text-sm font-medium text-orange-700 mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Weekly Availability ({getAvailabilityHours(member.availability).toFixed(1)} hours/week)
                    </h4>
                    <AvailabilityGrid availability={member.availability} />
                  </div>
                </div>
              </ShimmerCard>
            ))}

            {staff.length === 0 && (
              <ShimmerCard className="backdrop-blur-sm bg-white/80">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No staff members yet</h3>
                  <p className="text-gray-600 mb-6">Start by adding your first team member</p>
                  {/* Empty State Button Gradient Updated */}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Add First Staff Member
                  </button>
                </div>
              </ShimmerCard>
            )}
          </div>

          {/* Add Staff Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <ShimmerCard className="backdrop-blur-sm bg-white/90 max-w-md w-full">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">Add New Staff</h3>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleAddStaff} className="space-y-6">
                    {/* Form Input Focus Ring Updated */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white/50"
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white/50"
                        placeholder="employee@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white/50"
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role *
                      </label>
                      <select
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white/50"
                        required
                      >
                        <option value="">Select a role</option>
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-xl">
                      <p className="text-sm text-orange-700">
                        📧 A registration link will be sent to the employee's email address. They'll be able to set up their availability and complete their profile.
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      {/* Submit Button Gradient Updated */}
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Send Invite
                      </button>
                    </div>
                  </form>
                </div>
              </ShimmerCard>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default StaffManagement;