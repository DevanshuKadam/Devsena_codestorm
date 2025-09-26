import React from "react";
import Navbar from "../components/Navbar";
import { HandRaisedIcon, SparklesIcon, HeartIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import Particles from '../components/ui/magic/Particles';

// --- TRAINING COMPONENT ---
export default function Training() {

  const trainingModules = [
    {
      title: "1. The Warm Welcome",
      icon: HandRaisedIcon,
      color: "twine-600",
      points: [
        "Acknowledge every customer within **10 seconds** of them entering.",
        "Use a clear, friendly greeting like: 'Namaste! Welcome to Chai Wallah Express, what can I get for you today?'",
        "Maintain **eye contact** and a genuine smile.",
      ],
    },
    {
      title: "2. Order Accuracy & Speed",
      icon: SparklesIcon,
      color: "twine-700",
      points: [
        "Repeat the order back to the customer to ensure 100% **accuracy**.",
        "Strive for a 3-minute turnaround time for all tea/coffee orders.",
        "Ensure deep **product knowledge**—know the ingredients and preparation for every item.",
      ],
    },
    {
      title: "3. Handling Challenges",
      icon: HeartIcon,
      color: "twine-800",
      points: [
        "If a customer complains, listen without interrupting and **sincerely apologize**.",
        "Offer to correct the order immediately, without debate.",
        "Escalate issues (like disputes over payment or rude behavior) calmly to the **Shop Owner/Manager**.",
      ],
    },
    {
      title: "4. Shop Presentation Standards",
      icon: ChartBarIcon,
      color: "twine-900",
      points: [
        "Maintain a clutter-free counter. 'If you have time to lean, you have time to clean.'",
        "Wipe down tables and chairs after **every guest** leaves.",
        "Ensure all product displays (snacks, pastries) are **fully stocked** and rotated.",
      ],
    },
  ];

  // Magic UI Shimmer Card Component
  const ShimmerCard = ({ children, className = "" }) => (
    <div className={`relative overflow-hidden bg-white rounded-2xl border border-gray-200/50 shadow-sm ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <Navbar />
      {/* Particles Background */}
      <Particles count={50} />
      
      <div className="relative z-10 pt-24 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Card with Glassmorphism */}
          <ShimmerCard className="mb-8 backdrop-blur-xl bg-white/70">
            <div className="p-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                    General Service Guidelines
                  </h1>
                  <p className="text-lg text-gray-700 mt-2 max-w-2xl mx-auto">
                    Our commitment to quality service starts with you. Review these core modules for successful customer interaction.
                  </p>
                </div>
              </div>
            </div>
          </ShimmerCard>

          {/* Training Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trainingModules.map((module, index) => (
              <ShimmerCard key={index} className="backdrop-blur-sm bg-white/80 border-t-8 border-blue-400 transition-shadow duration-300 hover:shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <module.icon className="h-8 w-8 text-blue-600 shrink-0" />
                    <h3 className="text-2xl font-bold text-blue-800">{module.title}</h3>
                  </div>
                  
                  <ul className="space-y-3 pl-5 list-disc text-gray-700">
                    {module.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="text-base font-medium leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </ShimmerCard>
            ))}
          </div>

          {/* Call to Action / Completion */}
          <ShimmerCard className="mt-12 backdrop-blur-sm bg-white/80 max-w-3xl mx-auto">
            <div className="text-center p-8">
              <p className="text-xl font-bold text-gray-900">
                Mandatory Review
              </p>
              <p className="mt-3 text-base text-gray-700">
                Please ensure you have read and understood these guidelines. Consistent application helps us grow!
              </p>
              <button className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                Mark as Completed
              </button>
            </div>
          </ShimmerCard>
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
}
