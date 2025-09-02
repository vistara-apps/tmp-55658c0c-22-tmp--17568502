'use client';

export default function MapPin({ active = false, onClick, label }) {
  return (
    <div
      className={`cursor-pointer transform -translate-x-1/2 -translate-y-full ${
        active ? 'z-10' : 'z-0'
      }`}
      onClick={onClick}
    >
      <div
        className={`flex flex-col items-center ${
          active ? 'scale-110' : 'hover:scale-105'
        } transition-transform`}
      >
        {label && (
          <div className="bg-primary text-white px-2 py-1 rounded-md text-xs mb-1 whitespace-nowrap">
            {label}
          </div>
        )}
        <div
          className={`w-6 h-6 rounded-full ${
            active ? 'bg-accent' : 'bg-primary'
          } border-2 border-white shadow-md`}
        />
        <div
          className={`w-2 h-2 rounded-full ${
            active ? 'bg-accent' : 'bg-primary'
          } -mt-1 transform rotate-45`}
        />
      </div>
    </div>
  );
}

