import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import CarFilters from '../components/CarFilters.jsx';
import CarCard from '../components/CarCard.jsx';
import { fetchCars } from '../lib/api.js';
import { formatCurrency } from '../lib/format.js';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [status, setStatus] = useState('idle');

  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    async function load() {
      setStatus('loading');
      try {
        const response = await fetchCars(Object.fromEntries(searchParams.entries()));
        setCars(response.data);
        setPagination(response.pagination);
        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    }
    load();
  }, [searchParams]);

  const stats = useMemo(() => {
    if (cars.length === 0) return null;
    const prices = cars.map((car) => car.priceSek);
    const averagePrice = prices.reduce((acc, value) => acc + value, 0) / prices.length;
    const newestYear = Math.max(...cars.map((car) => car.modelYear || 0));
    return {
      averagePrice: formatCurrency(averagePrice),
      newestYear
    };
  }, [cars]);

  const changePage = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', nextPage);
    setSearchParams(params);
  };

  return (
    <div>
      <Hero />
      <div className="max-w-6xl mx-auto px-4" id="cars">
        <CarFilters total={pagination.total} />
        {stats && (
          <div className="grid md:grid-cols-3 gap-4 mt-10 text-sm">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs uppercase text-slate-500">Genomsnittligt pris</p>
              <p className="text-2xl font-semibold text-primary">{stats.averagePrice}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs uppercase text-slate-500">Nyaste årsmodell i listan</p>
              <p className="text-2xl font-semibold text-primary">{stats.newestYear}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs uppercase text-slate-500">Totalt antal träffar</p>
              <p className="text-2xl font-semibold text-primary">{pagination.total}</p>
            </div>
          </div>
        )}
        <section className="mt-10">
          {status === 'loading' && <p className="text-center text-slate-500">Laddar bilar…</p>}
          {status === 'error' && (
            <div className="text-center text-red-500">Kunde inte hämta bilar just nu. Försök igen senare.</div>
          )}
          {status === 'success' && cars.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
              <p className="font-semibold text-slate-700 mb-2">Inga bilar matchar dina filter.</p>
              <p>Justera filtren för att se fler resultat.</p>
            </div>
          )}
          {cars.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </section>
        {pagination.totalPages > 1 && (
          <nav className="flex justify-center items-center gap-4 mt-10">
            <button
              type="button"
              onClick={() => changePage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm disabled:opacity-50"
            >
              Föregående
            </button>
            <span className="text-sm text-slate-600">
              Sida {page} av {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => changePage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm disabled:opacity-50"
            >
              Nästa
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
