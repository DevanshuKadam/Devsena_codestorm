import React from 'react';

const Meteors = ({ number = 20 }) => {
  const meteors = Array.from({ length: number }, (_, i) => (
    <span
      key={i}
      className="absolute animate-meteor-effect h-0.5 w-0.5 rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10]"
      style={{
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + 's',
        animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + 's',
      }}
    />
  ));
  return <>{meteors}</>;
};

export default Meteors;


