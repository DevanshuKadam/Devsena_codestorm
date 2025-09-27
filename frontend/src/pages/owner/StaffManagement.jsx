import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Using Lucide Icons as they were in the original import
import { Users, Plus, Edit2, Trash2, Mail, Phone, UserCheck, Calendar, Clock, X, TrendingUp, QrCode } from 'lucide-react';
import OwnerNavbar from '../../components/OwnerNavbar';
import QRCodeGenerator from '../../components/QRCodeGenerator';

const StaffManagement = () => {
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [authData, setAuthData] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [staff, setStaff] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    wagePerHour: ''
  });

  // Memoized constants to prevent re-creation
  const roles = useMemo(() => ['Cashier', 'Helper', 'Stock Manager', 'Sales Associate', 'Supervisor', 'Cleaner'], []);
  const daysOfWeek = useMemo(() => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], []);

  // Individual input handlers to prevent re-renders
  const handleNameChange = useCallback((e) => {
    setNewStaff(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleEmailChange = useCallback((e) => {
    setNewStaff(prev => ({ ...prev, email: e.target.value }));
  }, []);

  const handlePhoneChange = useCallback((e) => {
    setNewStaff(prev => ({ ...prev, phone: e.target.value }));
  }, []);

  const handleRoleChange = useCallback((e) => {
    setNewStaff(prev => ({ ...prev, role: e.target.value }));
  }, []);

  const handleWageChange = useCallback((e) => {
    setNewStaff(prev => ({ ...prev, wagePerHour: e.target.value }));
  }, []);

  // Close modal handler
  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setNewStaff({ name: '', email: '', phone: '', role: '', wagePerHour: '' });
  }, []);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  }, [closeModal]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showAddModal) {
        closeModal();
      }
    };

    if (showAddModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showAddModal, closeModal]);

  // Fetch employees and shop data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Get auth data from localStorage
        const storedAuthData = localStorage.getItem('ownerData');
        if (!storedAuthData) {
          throw new Error('No authentication data found');
        }

        const auth = JSON.parse(storedAuthData);
        setAuthData(auth);

        if (!auth.googleId) {
          throw new Error('No Google ID found in auth data');
        }

        console.log('StaffManagement: Fetching business profile data for Google ID:', auth.googleId);

        // Fetch business profile to get shop data
        const profileResponse = await fetch(`http://localhost:3000/owner/${auth.googleId}/business-profile`);

        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch business profile: ${profileResponse.status} ${profileResponse.statusText}`);
        }

        const profileResult = await profileResponse.json();

        if (!profileResult.success) {
          throw new Error(profileResult.message || 'Failed to fetch business profile data');
        }

        const { businessProfile } = profileResult;

        if (!businessProfile.hasShop) {
          throw new Error('No shop found. Please complete your business registration first.');
        }

        setShopData(businessProfile.shop);

        // Fetch employees for this shop
        console.log('StaffManagement: Fetching employees for shop:', businessProfile.shop.id);
        const employeesResponse = await fetch(`http://localhost:3000/shop/${businessProfile.shop.id}/employees`);

        if (!employeesResponse.ok) {
          throw new Error(`Failed to fetch employees: ${employeesResponse.status} ${employeesResponse.statusText}`);
        }

        const employeesResult = await employeesResponse.json();

        if (!employeesResult.success) {
          throw new Error(employeesResult.message || 'Failed to fetch employees');
        }

        console.log('StaffManagement: Employees data received:', employeesResult.employees);
        setStaff(employeesResult.employees);

      } catch (error) {
        console.error('StaffManagement: Error fetching data:', error);

        // Handle specific error types
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
          setError('Backend server is not running. Please start the server and try again.');
        } else {
          setError(error.message || 'Failed to load staff data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Simple static components - no animations or effects
  const SimpleCard = ({ children, className = "" }) => (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );

  const handleAddStaff = async (e) => {
    e.preventDefault();

    if (!authData || !shopData) {
      alert('Authentication or shop data not available');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/owner/add-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: authData.googleId,
          shopId: shopData.id,
          name: newStaff.name,
          email: newStaff.email,
          phone: newStaff.phone,
          role: newStaff.role,
          wage: parseFloat(newStaff.wagePerHour) || 0
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add employee');
      }

      if (result.success) {
        // Refresh the staff list
        const employeesResponse = await fetch(`http://localhost:3000/shop/${shopData.id}/employees`);
        const employeesResult = await employeesResponse.json();

        if (employeesResult.success) {
          setStaff(employeesResult.employees);
        }

        closeModal();
        alert('Employee added successfully! Registration email sent.');
      } else {
        throw new Error(result.message || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert(`Error adding employee: ${error.message}`);
    }
  };

  const removeStaff = useCallback((id) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  }, []);

  const getAvailabilityHours = (availabilities) => {
    if (!availabilities || !Array.isArray(availabilities)) return 0;
    
    return availabilities.reduce((total, availability) => {
      if (availability.isDayOff) return total;
      
      const startTime = new Date(`2000-01-01T${availability.start}:00`);
      const endTime = new Date(`2000-01-01T${availability.end}:00`);
      const duration = (endTime - startTime) / (1000 * 60 * 60);
      
      // Handle midnight wrap-around
      return total + (duration < 0 ? duration + 24 : duration);
    }, 0);
  };

  const AvailabilityGrid = ({ availabilities }) => {
    // Convert weekday number to day name
    const getDayName = (weekday) => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return dayNames[weekday];
    };

    // Group availabilities by weekday
    const availabilityByDay = {};
    if (availabilities && Array.isArray(availabilities)) {
      availabilities.forEach(availability => {
        const dayName = getDayName(availability.weekday);
        if (!availabilityByDay[dayName]) {
          availabilityByDay[dayName] = [];
        }
        availabilityByDay[dayName].push(availability);
      });
    }

    return (
      <div className="grid grid-cols-7 gap-2 text-xs">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center">
            <div className="font-medium text-blue-700 mb-1">{day.substring(0, 3)}</div>
            <div className="space-y-1">
              {availabilityByDay[day] && availabilityByDay[day].length > 0 ? (
                availabilityByDay[day].map((availability, index) => (
                  <div key={index} className="bg-blue-100 text-blue-700 px-1 py-1 rounded text-xs">
                    {availability.isDayOff ? (
                      <span className="text-gray-500">Off</span>
                    ) : (
                      <span>{availability.start} - {availability.end}</span>
                    )}
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
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <OwnerNavbar />
        <div className="pt-24 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading staff data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <OwnerNavbar />
        <div className="pt-24 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Staff Data</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                {error.includes('Backend server is not running') && (
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Start Server & Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <OwnerNavbar />
      
      <div className="pt-24 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <SimpleCard className="mb-8 bg-white/90">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                      Staff Management
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your team members and their availability</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Add New Staff
                    </div>
                  </button>

                  <button
                    onClick={() => setShowQRGenerator(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      Generate QR
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </SimpleCard>

          {/* Staff List */}
          <div className="space-y-6">
            {staff.map(member => (
              <SimpleCard key={member.id} className="bg-white/90">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
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
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${member.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {member.status === 'active' ? 'Active' : 'New Employee'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors">
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
                    <h4 className="text-sm font-medium text-blue-700 mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Weekly Availability ({getAvailabilityHours(member.availabilities).toFixed(1)} hours/week)
                    </h4>
                    {member.availabilities && member.availabilities.length > 0 ? (
                      <AvailabilityGrid availabilities={member.availabilities} />
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No availability set yet</p>
                        <p className="text-xs text-gray-400">Employee needs to set their availability</p>
                      </div>
                    )}
                  </div>
                </div>
              </SimpleCard>
            ))}

            {staff.length === 0 && (
              <SimpleCard className="bg-white/90">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No staff members yet</h3>
                  <p className="text-gray-600 mb-6">Start by adding your first team member</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Add First Staff Member
                  </button>
                </div>
              </SimpleCard>
            )}
          </div>

          {/* Add Staff Modal - Completely isolated */}
          {showAddModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={handleBackdropClick}
            >
              <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-2xl">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-gray-900">Add New Staff</h3>
                      <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        type="button"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleAddStaff} className="space-y-6">
                      {/* Full name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newStaff.name}
                          onChange={handleNameChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter full name"
                          required
                          autoComplete="off"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={newStaff.email}
                          onChange={handleEmailChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="employee@email.com"
                          required
                          autoComplete="off"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={newStaff.phone}
                          onChange={handlePhoneChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="+1 (555) 123-4567"
                          required
                          autoComplete="off"
                        />
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role *
                        </label>
                        <select
                          value={newStaff.role}
                          onChange={handleRoleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        >
                          <option value="">Select a role</option>
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Wage per hour */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Wage per Hour *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newStaff.wagePerHour}
                            onChange={handleWageChange}
                            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="15.00"
                            required
                            autoComplete="off"
                          />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Enter the hourly wage for this employee</p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-sm text-blue-700">
                          📧 A registration link will be sent to the employee's email address. They'll be able to set up their availability and complete their profile.
                        </p>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Send Invite
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Generator Modal */}
          {authData && shopData && (
            <QRCodeGenerator
              isOpen={showQRGenerator}
              onClose={() => setShowQRGenerator(false)}
              ownerId={authData.googleId}
              shopId={shopData.id}
              shopName={shopData.shopName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;