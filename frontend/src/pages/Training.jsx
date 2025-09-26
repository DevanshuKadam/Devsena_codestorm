import React from "react";
// Corrected import name from SideBar to Navbar for consistency
import Navbar from "../components/Navbar";
import { HandRaisedIcon, SparklesIcon, HeartIcon, ChartBarIcon } from "@heroicons/react/24/outline";

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

  return (
    // Use twine-100 background for consistency
    <div className="min-h-screen flex flex-col bg-twine-100 font-['Inter']">
      <Navbar />
      <div className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 pt-4 text-center">
          <h2 className="text-4xl font-extrabold text-twine-900">General Service Guidelines</h2>
          <p className="text-lg text-twine-700 mt-2 max-w-2xl mx-auto">
            Our commitment to quality service starts with you. Review these core modules for successful customer interaction.
          </p>
        </div>

        {/* Training Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trainingModules.map((module, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-xl border-t-8 transition-shadow duration-300 hover:shadow-2xl"
              style={{ borderColor: `var(--tw-twine-${module.color.split('-')[1]})` }} // Dynamically apply border color
            >
              <div className="flex items-center space-x-4 mb-4">
                <module.icon className={`h-8 w-8 text-${module.color} shrink-0`} />
                <h3 className={`text-2xl font-bold text-${module.color}`}>{module.title}</h3>
              </div>
              
              <ul className="space-y-3 pl-5 list-disc text-gray-700">
                {module.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="text-base font-medium leading-relaxed">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Call to Action / Completion */}
        <div className="mt-12 text-center p-8 bg-twine-200 rounded-xl shadow-inner border border-twine-300 max-w-3xl mx-auto">
          <p className="text-xl font-bold text-twine-900">
            Mandatory Review
          </p>
          <p className="mt-3 text-base text-twine-800">
            Please ensure you have read and understood these guidelines. Consistent application helps us grow!
          </p>
          <button className="mt-6 px-8 py-3 bg-twine-600 text-white font-bold rounded-full shadow-lg hover:bg-twine-700 transition transform active:scale-95">
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  );
}
