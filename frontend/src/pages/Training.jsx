import React from "react";
import Navbar from "../components/Navbar";
import {
  HandRaisedIcon,
  SparklesIcon,
  HeartIcon,
  ChartBarIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import Particles from "../components/ui/magic/Particles";

// --- TRAINING COMPONENT ---
export default function Training() {
  const trainingModules = [
    {
      title: "1. The Warm Welcome",
      icon: HandRaisedIcon,
      points: [
        "Greet customers within 10 seconds.",
        "Say: 'Namaste! Welcome to Chai Wallah Express.'",
        "Maintain eye contact and a smile.",
      ],
    },
    {
      title: "2. Order Accuracy & Speed",
      icon: SparklesIcon,
      points: [
        "Repeat orders for accuracy.",
        "Target 3-minute service time.",
        "Know product details well.",
      ],
    },
    {
      title: "3. Handling Challenges",
      icon: HeartIcon,
      points: [
        "Listen calmly to complaints.",
        "Apologize sincerely.",
        "Escalate serious issues to the owner.",
      ],
    },
    {
      title: "4. Shop Presentation",
      icon: ChartBarIcon,
      points: [
        "Keep counters clutter-free.",
        "Wipe tables after every guest.",
        "Keep displays stocked & rotated.",
      ],
    },
  ];

  // Magic UI Shimmer Card Component
  const ShimmerCard = ({ children, className = "" }) => (
    <div
      className={`relative overflow-hidden bg-white rounded-2xl border border-gray-200/50 shadow-sm ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      {children}
    </div>
  );

  const videos = [
    { id: "Ty75wGARomo", url: "https://www.youtube.com/embed/Ty75wGARomo" },
    { id: "rI9oMAVa-Es", url: "https://www.youtube.com/embed/rI9oMAVa-Es" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <Navbar />
      <Particles count={60} />
      <div className="relative z-10 pt-24 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <ShimmerCard className="mb-8 backdrop-blur-xl bg-white/70">
            <div className="p-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                    Training Hub
                  </h1>
                  <p className="text-lg text-gray-700 mt-2 max-w-2xl mx-auto">
                    Interactive learning with videos, AR, and best-practice
                    guidelines.
                  </p>
                </div>
              </div>
            </div>
          </ShimmerCard>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: AR CTA + videos */}
            <div className="lg:col-span-2 space-y-8">
              {/* AR CTA */}
              <ShimmerCard className="backdrop-blur-sm bg-white/80 border-t-8 border-indigo-400">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
                    Explore Augmented Reality
                    <PlayCircleIcon className="w-7 h-7 text-indigo-500" />
                  </h2>
                  <p className="mt-2 text-gray-700">
                    To see the full AR experience, visit the AR portal.
                  </p>
                  <div className="mt-4">
                    <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                      View AR Experience
                    </button>
                  </div>
                </div>
              </ShimmerCard>

              {/* Videos grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((v) => (
                  <ShimmerCard
                    key={v.id}
                    className="backdrop-blur-sm bg-white/80"
                  >
                    <div className="p-4 space-y-3">
                      <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm">
                        <iframe
                          className="w-full h-full"
                          src={v.url}
                          title={`Training video ${v.id}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      <p className="text-sm text-gray-600">Training video</p>
                    </div>
                  </ShimmerCard>
                ))}
              </div>
            </div>

            {/* Right: Guidelines */}
            <div className="space-y-6">
              <ShimmerCard className="backdrop-blur-sm bg-white/80 border-t-8 border-blue-400">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-blue-800 mb-4">
                    Guidelines
                  </h2>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    {trainingModules.map((m, i) => (
                      <li key={i}>
                        <span className="font-semibold">{m.title}:</span>{" "}
                        {m.points[0]}
                      </li>
                    ))}
                  </ul>
                </div>
              </ShimmerCard>
            </div>
          </div>

          {/* Completion CTA */}
          <ShimmerCard className="mt-12 backdrop-blur-sm bg-white/80 max-w-3xl mx-auto">
            <div className="text-center p-8">
              <p className="text-xl font-bold text-gray-900">Mandatory Review</p>
              <p className="mt-3 text-base text-gray-700">
                Confirm you’ve completed the modules and guidelines.
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
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}