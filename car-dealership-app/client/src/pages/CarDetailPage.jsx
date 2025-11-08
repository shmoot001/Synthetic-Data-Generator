import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import Markdown from 'markdown-to-jsx';
import { useForm } from 'react-hook-form';
import { fetchCar, fetchCars, submitContact } from '../lib/api.js';
import { formatCurrency, formatNumber, formatDate } from '../lib/format.js';
import { usePreferencesStore } from '../store/usePreferencesStore.js';

export default function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState(null);
  const toggleFavorite = usePreferencesStore((state) => state.toggleFavorite);
  const toggleCompare = usePreferencesStore((state) => state.toggleCompare);
  const favorites = usePreferencesStore((state) => state.favorites);
  const compare = usePreferencesStore((state) => state.compare);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  useEffect(() => {
    async function load() {
      setStatus('loading');
      try {
        const data = await fetchCar(id);
        setCar(data);
        setStatus('success');
        const relatedResponse = await fetchCars({ make: data.make, page: 1 });
        const filtered = relatedResponse.data.filter((item) => item.id !== data.id).slice(0, 3);
        setRelated(filtered);
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    }
    load();
  }, [id]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitContact(id, values);
      setMessage('Tack! Vi kontaktar dig inom kort.');
      reset();
    } catch (error) {
      setMessage('Något gick fel. Försök igen.');
    }
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: car.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setMessage('Länken har kopierats till urklipp.');
    }
  };

  if (status === 'loading') {
    return <p className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">Laddar bil…</p>;
  }

  if (status === 'error' || !car) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-slate-800">Bilen kunde inte hittas</h2>
        <p className="text-slate-500 mt-2">Den kan ha tagits bort eller är inte längre tillgänglig.</p>
        <Link to="/" className="inline-flex mt-6 px-5 py-2.5 rounded-lg bg-primary text-white">
          Tillbaka till listan
        </Link>
      </div>
    );
  }

  const isFavorite = favorites.some((fav) => fav.id === car.id);
  const isCompared = compare.some((item) => item.id === car.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:text-primary">
          Start
        </Link>{' '}
        / {car.make} {car.model}
      </nav>
      <div className="grid lg:grid-cols-2 gap-8">
        <Gallery images={car.images} title={car.title} />
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{car.title}</h1>
            <p className="text-lg text-primary font-bold">{formatCurrency(car.priceSek)}</p>
            {car.priceExVatSek && (
              <p className="text-sm text-slate-500">Pris exkl. moms: {formatCurrency(car.priceExVatSek)}</p>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-4 bg-white rounded-2xl border border-slate-200 p-5">
            <Spec label="Årsmodell" value={car.modelYear} />
            <Spec label="Miltal" value={`${formatNumber(car.mileageKm)} km`} />
            <Spec label="Drivmedel" value={car.fuel} />
            <Spec label="Växellåda" value={car.transmission} />
            <Spec label="Drivlina" value={car.drivetrain} />
            <Spec label="Kaross" value={car.bodyType} />
            <Spec label="Hästkrafter" value={car.powerHp} />
            <Spec label="Färg" value={car.color} />
            <Spec label="Registreringsnummer" value={car.registrationNumber} />
            <Spec label="Plats" value={car.location} />
            <Spec label="Publicerad" value={formatDate(car.createdAt)} />
          </dl>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => toggleFavorite(car)}
              className={`px-5 py-2.5 rounded-lg border ${isFavorite ? 'border-red-300 bg-red-50 text-red-600' : 'border-slate-200 text-slate-700'}`}
            >
              {isFavorite ? 'I favoriter' : 'Lägg till favorit'}
            </button>
            <button
              type="button"
              onClick={() => toggleCompare(car)}
              className={`px-5 py-2.5 rounded-lg border ${isCompared ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-700'}`}
            >
              {isCompared ? 'I jämförelse' : 'Jämför'}
            </button>
            <button type="button" onClick={handleShare} className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700">
              Dela
            </button>
          </div>
          {message && <p className="text-sm text-primary">{message}</p>}
        </div>
      </div>
      <div className="mt-10 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <Tab.Group>
          <Tab.List className="flex border-b border-slate-200">
            {['Detaljer', 'Utrustning', 'Kontakt'].map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  `flex-1 py-3 text-sm font-semibold ${selected ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="p-6 text-sm">
            <Tab.Panel>
              <Markdown className="prose prose-slate max-w-none">{car.description}</Markdown>
            </Tab.Panel>
            <Tab.Panel>
              <ul className="grid sm:grid-cols-2 gap-2">
                {car.equipment?.map((item) => (
                  <li key={item} className="bg-slate-100 rounded-lg px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </Tab.Panel>
            <Tab.Panel>
              <form className="grid gap-4 max-w-lg" onSubmit={onSubmit}>
                <div>
                  <label className="block text-xs uppercase text-slate-500">Namn</label>
                  <input {...register('name', { required: 'Obligatoriskt' })} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs uppercase text-slate-500">E-post</label>
                  <input type="email" {...register('email', { required: 'Obligatoriskt' })} />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-xs uppercase text-slate-500">Telefon</label>
                  <input {...register('phone')} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-slate-500">Meddelande</label>
                  <textarea rows="4" {...register('message')} />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center bg-primary text-white rounded-lg py-2.5 font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Skickar…' : 'Skicka förfrågan'}
                </button>
              </form>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      {related.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Liknande bilar</h2>
            <Link to="/" className="text-sm text-primary hover:underline">
              Visa alla
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((item) => (
              <Link
                to={`/cars/${item.id}`}
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-primary"
              >
                <p className="text-sm text-slate-500 mb-1">{item.make}</p>
                <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                <p className="text-primary font-semibold">{formatCurrency(item.priceSek)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Gallery({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images?.[activeIndex];

  return (
    <div>
      <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden">
        {active ? (
          <img src={active.url} alt={active.alt || title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">Ingen bild tillgänglig</div>
        )}
      </div>
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
        {images?.map((image, index) => (
          <button
            key={image.id || image.url}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-16 w-20 rounded-lg overflow-hidden border ${activeIndex === index ? 'border-primary' : 'border-transparent'}`}
          >
            <img src={image.url} alt={image.alt || title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-800 font-semibold">{value ?? '—'}</dd>
    </div>
  );
}
