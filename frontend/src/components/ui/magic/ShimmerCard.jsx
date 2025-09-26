import React from 'react';

const ShimmerCard = ({ children, className = "" }) => {
  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl border border-gray-200/50 shadow-sm ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  );
};

export default ShimmerCard;


