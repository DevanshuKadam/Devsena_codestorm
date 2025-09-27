import React, { useState, useEffect } from "react";
import OwnerNavbar from '../../components/OwnerNavbar';
import { Wand2, CheckCircle2, XCircle, Save, ListChecks, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import ShimmerCard from '../../components/ui/magic/ShimmerCard';
import Particles from '../../components/ui/magic/Particles';

const ScheduleDashboard = () => {
  const [shopData, setShopData] = useState(null);
  const [authData, setAuthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Schedule generation state
  const [userPrompt, setUserPrompt] = useState('');
  const [minimumHours, setMinimumHours] = useState(8);
  const [maximumHours, setMaximumHours] = useState(40);
  const [status, setStatus] = useState('idle'); // idle | generating | proposed | saved
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch shop and auth data
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
          throw new Error('No owner ID found in auth data');
        }

        // Fetch shop data using the API
        const shopResponse = await fetch(`http://localhost:3000/owner/${auth.googleId}/shop`);

        if (!shopResponse.ok) {
          throw new Error(`Failed to fetch shop data: ${shopResponse.status}`);
        }

        const shopResult = await shopResponse.json();

        if (!shopResult.success) {
          throw new Error(shopResult.message || 'Failed to fetch shop data');
        }

        setShopData(shopResult.shop);

        // Update localStorage with shopId if not already present
        if (!auth.shopId && shopResult.shop.id) {
          const updatedAuth = {
            ...auth,
            shopId: shopResult.shop.id,
            shopName: shopResult.shop.name || shopResult.shop.shopName
          };
          localStorage.setItem('ownerData', JSON.stringify(updatedAuth));
          setAuthData(updatedAuth);
        }

      } catch (error) {
        console.error('ScheduleDashboard: Error fetching data:', error);
        setError(error.message || 'Failed to load schedule data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateSchedule = async () => {
    if (!authData || !authData.shopId || !userPrompt.trim()) {
      setError('Please enter a prompt for schedule generation');
      return;
    }

    setStatus('generating');
    setError('');

    try {
      const response = await fetch('http://localhost:3000/week-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId: authData.shopId,
          minimumHours,
          maximumHours,
          prompt: userPrompt
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate schedule');
      }

      // Handle the nested response structure
      const scheduleData = result.schedule || result;
      setGeneratedSchedule(scheduleData);
      setStatus('proposed');

    } catch (error) {
      console.error('Generate Schedule Error:', error);
      setError(error.message || 'Failed to generate schedule');
      setStatus('idle');
    }
  };

  const saveSchedule = async () => {
    if (!generatedSchedule || !authData || !authData.shopId) return;

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/save-week-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId: authData.shopId,
          ownerId: authData.googleId,
          schedule: generatedSchedule.schedule
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save schedule');
      }

      setStatus('saved');
      setError('');

    } catch (error) {
      console.error('Save Schedule Error:', error);
      setError(error.message || 'Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <OwnerNavbar />
        <Particles count={100} />
        <div className="relative z-10 pt-24 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading schedule dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !shopData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <OwnerNavbar />
        <Particles count={100} />
        <div className="relative z-10 pt-24 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <Particles count={100} />
      <OwnerNavbar />
      
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
                AI Schedule Generator
              </h1>
            </div>
            
            {/* Action Button Section */}
            <button
              onClick={generateSchedule}
              disabled={status === 'generating' || !userPrompt.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-blue-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              <Wand2 className={`w-5 h-5 ${status === 'generating' ? 'animate-spin' : ''}`} />
              {status === 'generating' ? 'Generating...' : 'Generate AI Schedule'}
            </button>
          </div>
        </ShimmerCard>

        {/* Error Message */}
        {error && (
          <ShimmerCard className="mb-6 backdrop-blur-sm bg-red-50/80 border border-red-200">
            <div className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </ShimmerCard>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input Form Panel (1/3 width) */}
          <ShimmerCard className="p-6 backdrop-blur-sm bg-white/80">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-blue-600" /> Schedule Parameters
            </h2>

            {/* Input Form */}
            <div className="space-y-4">
              {/* User Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Prompt *
                </label>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Describe your scheduling requirements (e.g., 'Need extra staff on weekends', 'Prioritize morning shifts for experienced employees')"
                  className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/70 resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Minimum Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Hours per Employee
                </label>
                <input
                  type="number"
                  value={minimumHours}
                  onChange={(e) => setMinimumHours(parseInt(e.target.value) || 8)}
                  min="1"
                  max="40"
                  className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/70"
                />
              </div>

              {/* Maximum Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Hours per Employee
                </label>
                <input
                  type="number"
                  value={maximumHours}
                  onChange={(e) => setMaximumHours(parseInt(e.target.value) || 40)}
                  min="1"
                  max="60"
                  className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/70"
                />
              </div>
            </div>
          </ShimmerCard>

          {/* Generated Schedule Panel (2/3 width) */}
          <ShimmerCard className="lg:col-span-2 p-6 backdrop-blur-sm bg-white/80">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generated Schedule</h2>
            
            {/* Status Messages */}
            {!generatedSchedule && status === 'idle' && (
              <div className="text-gray-600 p-6 bg-blue-50/70 rounded-lg border border-blue-200 text-center">
                <Wand2 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Ready to Generate Schedule</p>
                <p>Enter your custom prompt and click "Generate AI Schedule" to create an optimal weekly schedule based on your staff availability and requirements.</p>
              </div>
            )}
            
            {status === 'generating' && (
              <div className="text-blue-600 p-6 bg-blue-50/70 rounded-lg border border-blue-200 flex items-center justify-center gap-3">
                <Clock className="w-6 h-6 animate-spin"/> 
                <span className="text-lg font-medium">Generating optimal schedule... Please wait.</span>
              </div>
            )}
            
            {generatedSchedule && (
              <div>
                {/* Schedule Info */}
                <div className="mb-6 p-4 bg-green-50/70 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Schedule Generated Successfully!</h3>
                  <p className="text-green-700">
                    {generatedSchedule.ai_suggestions && (
                      <span className="block mb-2">
                        <strong>AI Suggestions:</strong> {generatedSchedule.ai_suggestions}
                      </span>
                    )}
                    {generatedSchedule.scheduleId && (
                      <span className="text-sm">Schedule ID: {generatedSchedule.scheduleId}</span>
                    )}
                  </p>
                </div>

                {/* Schedule Display */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Weekly Schedule</h4>
                  {generatedSchedule.schedule && generatedSchedule.schedule.map((daySchedule, dayIndex) => (
                    <div key={dayIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                      <h5 className="font-semibold text-gray-800 mb-3">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][daySchedule.workday]}
                      </h5>
                      {daySchedule.timings && daySchedule.timings.length > 0 ? (
                        <div className="space-y-2">
                          {daySchedule.timings.map((timing, timingIndex) => (
                            <div key={timingIndex} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-4">
                                  <span className="font-mono text-blue-700 font-semibold">
                                    {timing.start} - {timing.end}
                                  </span>
                                  <span className="text-gray-600 text-sm">ID: {timing.employeeId}</span>
                                </div>
                                {timing.employeeName && (
                                  <div className="text-sm text-gray-700">
                                    <span className="font-medium">{timing.employeeName}</span>
                                    {timing.employeeEmail && (
                                      <span className="text-gray-500 ml-2">({timing.employeeEmail})</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {timing.incentive && (
                                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  {timing.incentive}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No shifts scheduled</p>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Save Button */}
                <div className="mt-8">
                  <Button 
                    onClick={saveSchedule}
                    disabled={isSaving || status === 'saved'}
                    className="w-full bg-green-600 hover:bg-green-700 shadow-lg text-white font-semibold py-3"
                  >
                    <Save className="w-5 h-5 mr-2" /> 
                    {isSaving ? 'Saving...' : status === 'saved' ? 'Schedule Saved!' : 'Save Schedule'}
                  </Button>
                  
                  {status === 'saved' && (
                    <p className="text-green-700 font-medium mt-4 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5"/> 
                      Schedule saved successfully and calendar events created!
                    </p>
                  )}
                </div>
              </div>
            )}
          </ShimmerCard>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDashboard;