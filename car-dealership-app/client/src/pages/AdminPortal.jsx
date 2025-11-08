import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/useAuthStore.js';
import { fetchCars, deleteCar } from '../lib/api.js';
import { formatCurrency, formatDate } from '../lib/format.js';

export default function AdminPortal() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm();

  useEffect(() => {
    if (!user) return;
    async function loadCars() {
      setLoading(true);
      try {
        const response = await fetchCars();
        setCars(response.data);
      } finally {
        setLoading(false);
      }
    }
    loadCars();
  }, [user]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
    } catch (err) {
      console.error(err);
    }
  });

  const handleDelete = async (carId) => {
    if (!window.confirm('Vill du verkligen radera denna bil?')) return;
    await deleteCar(carId);
    setCars((cars) => cars.filter((car) => car.id !== carId));
  };

  if (!user) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold text-slate-800 mb-4">Adminportal</h1>
        <p className="text-sm text-slate-500 mb-6">Logga in med ditt administratörskonto för att hantera bilinventariet.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-slate-500">E-post</label>
            <input type="email" {...register('email', { required: true })} />
          </div>
          <div>
            <label className="block text-xs uppercase text-slate-500">Lösenord</label>
            <input type="password" {...register('password', { required: true })} />
          </div>
          {status === 'error' && <p className="text-sm text-red-500">{error || 'Inloggningen misslyckades'}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
          >
            {isSubmitting ? 'Loggar in…' : 'Logga in'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Inventariehantering</h1>
          <p className="text-sm text-slate-500">Här kan du lägga till, redigera och publicera bilar.</p>
        </div>
        <Link
          to="/admin/cars/new"
          className="inline-flex items-center justify-center bg-primary text-white px-5 py-2.5 rounded-lg font-semibold"
        >
          Lägg till ny bil
        </Link>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="p-4">Titel</th>
              <th className="p-4">Pris</th>
              <th className="p-4">Status</th>
              <th className="p-4">Uppdaterad</th>
              <th className="p-4">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  Laddar bilar…
                </td>
              </tr>
            )}
            {!loading && cars.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  Inga bilar ännu. Börja med att lägga till en.
                </td>
              </tr>
            )}
            {cars.map((car) => (
              <tr key={car.id}>
                <td className="p-4">
                  <p className="font-semibold text-slate-800">{car.title}</p>
                  <p className="text-xs text-slate-500">{car.make} {car.model}</p>
                </td>
                <td className="p-4 text-primary font-semibold">{formatCurrency(car.priceSek)}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${car.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                  >
                    {car.isPublished ? 'Publicerad' : 'Utkast'}
                  </span>
                </td>
                <td className="p-4 text-slate-500">{formatDate(car.updatedAt)}</td>
                <td className="p-4 flex items-center gap-3">
                  <Link to={`/admin/cars/${car.id}`} className="text-primary hover:underline text-sm">
                    Redigera
                  </Link>
                  <button type="button" onClick={() => handleDelete(car.id)} className="text-sm text-red-500 hover:underline">
                    Radera
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
