import { Link } from 'react-router-dom';
import { HeartIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatNumber } from '../lib/format.js';
import { usePreferencesStore } from '../store/usePreferencesStore.js';

export default function CarCard({ car }) {
  const toggleFavorite = usePreferencesStore((state) => state.toggleFavorite);
  const toggleCompare = usePreferencesStore((state) => state.toggleCompare);
  const favorites = usePreferencesStore((state) => state.favorites);
  const compare = usePreferencesStore((state) => state.compare);

  const isFavorite = favorites.some((fav) => fav.id === car.id);
  const isCompared = compare.some((item) => item.id === car.id);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col">
      <div className="relative h-48 bg-slate-100">
        <img src={car.images?.[0]?.url || '/cars/tcross-1.jpg'} alt={car.images?.[0]?.alt || car.title} className="w-full h-full object-cover" />
        {car.badges?.newArrival && (
          <span className="absolute top-3 left-3 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
            Nyhet
          </span>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={() => toggleFavorite(car)}
            className={`h-9 w-9 inline-flex items-center justify-center rounded-full bg-white shadow ${isFavorite ? 'text-red-500' : 'text-slate-500'}`}
            aria-label={isFavorite ? 'Ta bort favorit' : 'Lägg till favorit'}
          >
            <HeartIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => toggleCompare(car)}
            className={`h-9 w-9 inline-flex items-center justify-center rounded-full bg-white shadow ${isCompared ? 'text-primary' : 'text-slate-500'}`}
            aria-label={isCompared ? 'Ta bort från jämförelse' : 'Lägg till i jämförelse'}
          >
            <ArrowsRightLeftIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="space-y-1">
          <Link to={`/cars/${car.id}`} className="text-lg font-semibold text-slate-800 hover:text-primary">
            {car.title}
          </Link>
          <p className="text-sm text-slate-500">
            {car.modelYear} • {formatNumber(car.mileageKm)} km • {car.fuel}
          </p>
        </div>
        <p className="text-2xl font-bold text-primary">{formatCurrency(car.priceSek)}</p>
        <div className="text-xs text-slate-500 space-y-1">
          <p>Växellåda: {car.transmission ?? '—'}</p>
          <p>Drivlina: {car.drivetrain ?? '—'}</p>
        </div>
        <div className="mt-auto">
          <Link
            to={`/cars/${car.id}`}
            className="inline-flex items-center justify-center w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary/90"
          >
            Visa detaljer
          </Link>
        </div>
      </div>
    </div>
  );
}
