import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePreferencesStore } from '../store/usePreferencesStore.js';
import { formatCurrency } from '../lib/format.js';

export default function PreferencesDrawer() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites');
  const favorites = usePreferencesStore((state) => state.favorites);
  const compare = usePreferencesStore((state) => state.compare);
  const toggleFavorite = usePreferencesStore((state) => state.toggleFavorite);
  const toggleCompare = usePreferencesStore((state) => state.toggleCompare);
  const clearCompare = usePreferencesStore((state) => state.clearCompare);

  useEffect(() => {
    function handleToggle(event) {
      setActiveTab(event.detail);
      setOpen((prev) => !prev || activeTab !== event.detail);
    }
    document.addEventListener('toggle-preferences', handleToggle);
    return () => document.removeEventListener('toggle-preferences', handleToggle);
  }, [activeTab]);

  return (
    <aside
      className={`fixed bottom-4 right-4 w-full max-w-md bg-white shadow-xl rounded-xl border border-slate-200 transition-transform duration-200 ${open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
    >
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'favorites' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favoriter ({favorites.length})
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'compare' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
          onClick={() => setActiveTab('compare')}
        >
          Jämförelse ({compare.length}/3)
        </button>
        <button type="button" className="px-4 text-slate-400" onClick={() => setOpen(false)}>
          ×
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto p-4 text-sm">
        {activeTab === 'favorites' ? (
          favorites.length === 0 ? (
            <p className="text-slate-500">Inga favoriter ännu. Markera en bil för att spara den här.</p>
          ) : (
            <ul className="space-y-3">
              {favorites.map((car) => (
                <li key={car.id} className="flex items-center justify-between gap-3">
                  <Link to={`/cars/${car.id}`} className="font-semibold text-slate-700 hover:text-primary">
                    {car.title}
                  </Link>
                  <div className="text-right">
                    <p className="text-slate-500">{formatCurrency(car.priceSek)}</p>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(car)}
                      className="text-xs text-primary hover:underline"
                    >
                      Ta bort
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : compare.length === 0 ? (
          <p className="text-slate-500">Lägg till upp till tre bilar för att jämföra deras specifikationer.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-slate-700">Specifikationer</h4>
              <button type="button" onClick={clearCompare} className="text-xs text-primary hover:underline">
                Töm
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="p-2">Bil</th>
                    {compare.map((car) => (
                      <th key={car.id} className="p-2 text-primary">
                        {car.title}
                        <button
                          type="button"
                          className="block text-[10px] text-slate-400"
                          onClick={() => toggleCompare(car)}
                        >
                          ta bort
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { label: 'Pris', key: 'priceSek', format: formatCurrency },
                    { label: 'Årsmodell', key: 'modelYear' },
                    { label: 'Miltal', key: 'mileageKm' },
                    { label: 'Drivmedel', key: 'fuel' },
                    { label: 'Växellåda', key: 'transmission' },
                    { label: 'Drivlina', key: 'drivetrain' },
                    { label: 'Kaross', key: 'bodyType' },
                    { label: 'Färg', key: 'color' }
                  ].map((row) => (
                    <tr key={row.key}>
                      <th className="p-2 text-left font-semibold text-slate-600">{row.label}</th>
                      {compare.map((car) => (
                        <td key={car.id} className="p-2 text-slate-700">
                          {row.format ? row.format(car[row.key]) : car[row.key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
