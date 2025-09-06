import { Zone } from "@/types";


interface ZoneCardProps {
  zone: Zone;
  isSelected: boolean;
  onSelect: (zoneId: string) => void;
  isSelectable: (zone: Zone) => boolean;
}

export default function ZoneCard({ zone, isSelected, onSelect, isSelectable }: ZoneCardProps) {
  return (
    <div 
      className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-50' 
          : isSelectable(zone)
            ? 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
            : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
      }`}
      onClick={() => isSelectable(zone) && onSelect(zone.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{zone.name}</h3>
          <p className="text-sm text-slate-500">{zone.categoryId}</p>
        </div>
        <div className="flex items-center space-x-2">
          {zone.specialActive && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium animate-pulse">
              Special Rate
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            zone.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {zone.open ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{zone.free}</p>
          <p className="text-xs text-slate-500">Free</p>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{zone.occupied}</p>
          <p className="text-xs text-slate-500">Occupied</p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-black">
        <div className="flex justify-between">
          <span>Available for Visitors:</span>
          <span className="font-medium">{zone.availableForVisitors}</span>
        </div>
        <div className="flex justify-between">
          <span>Available for Subscribers:</span>
          <span className="font-medium">{zone.availableForSubscribers}</span>
        </div>
        <div className="flex justify-between">
          <span>Rate Normal:</span>
          <span className="font-medium">
            ${ zone.rateNormal}/hr
            {zone.specialActive && <span className="text-orange-600 ml-1">🔥</span>}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Rate Special:</span>
          <span className="font-medium">
            ${ zone.rateSpecial}/hr
            {zone.specialActive && <span className="text-orange-600 ml-1">🔥</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
