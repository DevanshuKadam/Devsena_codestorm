import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Mail, Phone, UserCheck, Calendar, Clock, X } from 'lucide-react';
import { Card } from '../../components/ui/card';
import OwnerNavbar from '../../components/OwnerNavbar';

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
        return dayTotal + (endTime - startTime) / (1000 * 60 * 60);
      }, 0);
    }, 0);
    return totalHours;
  };

  const AvailabilityGrid = ({ availability }) => (
    <div className="grid grid-cols-7 gap-1 text-xs">
      {daysOfWeek.map(day => (
        <div key={day} className="text-center">
          <div className="font-medium text-twine-700 mb-1">{day.substring(0, 3)}</div>
          <div className="space-y-1">
            {availability[day].length > 0 ? (
              availability[day].map((slot, index) => (
                <div key={index} className="bg-twine-100 text-twine-700 px-1 py-1 rounded text-xs">
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
    <div className="min-h-screen bg-twine-50">
      {/* Magic UI style background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 -left-10 h-72 w-72 rounded-full bg-gradient-to-tr from-twine-200 via-twine-100 to-transparent blur-2xl opacity-70" />
      </div>
      <OwnerNavbar />
      <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <Card className="flex justify-between items-center mb-8 p-6">
        <div>
          <h1 className="text-3xl font-bold text-twine-800 flex items-center gap-3">
            <Users className="w-8 h-8" />
            Staff Management
          </h1>
          <p className="text-twine-600 mt-2">Manage your team members and their availability</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-twine-500 to-twine-600 text-white px-6 py-3 rounded-xl hover:from-twine-600 hover:to-twine-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Staff
        </button>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-twine-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-twine-600 text-sm font-medium">Total Staff</p>
              <p className="text-2xl font-bold text-twine-800">{staff.length}</p>
            </div>
            <div className="w-12 h-12 bg-twine-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-twine-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-twine-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-twine-600 text-sm font-medium">Active</p>
              <p className="text-2xl font-bold text-green-600">{staff.filter(s => s.status === 'active').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-twine-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-twine-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{staff.filter(s => s.status === 'pending').length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-twine-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-twine-600 text-sm font-medium">Total Hours/Week</p>
              <p className="text-2xl font-bold text-twine-800">
                {staff.reduce((total, s) => total + getAvailabilityHours(s.availability), 0).toFixed(0)}h
              </p>
            </div>
            <div className="w-12 h-12 bg-twine-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-twine-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="space-y-6">
        {staff.map(member => (
          <div key={member.id} className="bg-white rounded-2xl shadow-md border border-twine-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-twine-400 to-twine-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-twine-800">{member.name}</h3>
                    <p className="text-twine-600 font-medium">{member.role}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2 text-twine-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-twine-600">
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
                  <button className="p-2 text-twine-600 hover:text-twine-700 hover:bg-twine-100 rounded-lg transition-colors">
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
                <h4 className="text-sm font-medium text-twine-700 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Weekly Availability ({getAvailabilityHours(member.availability).toFixed(1)} hours/week)
                </h4>
                <AvailabilityGrid availability={member.availability} />
              </div>
            </div>
          </div>
        ))}

        {staff.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-twine-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-twine-800 mb-2">No staff members yet</h3>
            <p className="text-twine-600 mb-6">Start by adding your first team member</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-twine-500 to-twine-600 text-white px-6 py-3 rounded-xl hover:from-twine-600 hover:to-twine-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Add First Staff Member
            </button>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-twine-800">Add New Staff</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-twine-400 hover:text-twine-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-twine-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  className="w-full px-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500 transition-colors"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-twine-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  className="w-full px-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500 transition-colors"
                  placeholder="employee@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-twine-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500 transition-colors"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-twine-700 mb-2">
                  Role *
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                  className="w-full px-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500 transition-colors"
                  required
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="bg-twine-50 p-4 rounded-xl">
                <p className="text-sm text-twine-700">
                  📧 A registration link will be sent to the employee's email address. They'll be able to set up their availability and complete their profile.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-twine-300 text-twine-700 rounded-xl hover:bg-twine-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-twine-500 to-twine-600 text-white rounded-xl hover:from-twine-600 hover:to-twine-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StaffManagement;