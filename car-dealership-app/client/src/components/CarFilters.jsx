import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { carFuelOptions, carTransmissionOptions, carDrivetrainOptions, carBodyOptions, carColorOptions } from '../lib/options.js';

const sortOptions = [
  { value: 'newest', label: 'Nyast först' },
  { value: 'priceAsc', label: 'Lägst pris' },
  { value: 'priceDesc', label: 'Högst pris' },
  { value: 'mileageAsc', label: 'Lägst miltal' },
  { value: 'mileageDesc', label: 'Högst miltal' },
  { value: 'modelYearDesc', label: 'Nyaste årsmodell' }
];

export default function CarFilters({ total }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(name);
    } else {
      next.set(name, value);
    }
    next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get('sort');
    if (sort) params.set('sort', sort);
    setSearchParams(params);
  };

  const badgeCount = useMemo(() => {
    const entries = Array.from(searchParams.entries());
    return entries.filter(([key]) => key !== 'page' && key !== 'sort').length;
  }, [searchParams]);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm -mt-12 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Sök bland {total} bilar</h2>
          <p className="text-sm text-slate-500">Filtrera efter dina preferenser och hitta rätt bil för dina behov.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">
            Sortera efter
            <select
              name="sort"
              value={searchParams.get('sort') || 'newest'}
              onChange={handleChange}
              className="ml-2"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={clearFilters} className="text-sm text-primary hover:underline">
            Rensa filter{badgeCount > 0 ? ` (${badgeCount})` : ''}
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6 text-sm">
        <FilterField label="Pris från" name="priceMin" value={searchParams.get('priceMin') || ''} onChange={handleChange} />
        <FilterField label="Pris till" name="priceMax" value={searchParams.get('priceMax') || ''} onChange={handleChange} />
        <FilterField label="Miltal max" name="mileageMax" value={searchParams.get('mileageMax') || ''} onChange={handleChange} />
        <FilterField label="Årsmodell min" name="modelYearMin" value={searchParams.get('modelYearMin') || ''} onChange={handleChange} />
        <FilterField label="Årsmodell max" name="modelYearMax" value={searchParams.get('modelYearMax') || ''} onChange={handleChange} />
        <FilterField label="Hästkrafter min" name="powerMin" value={searchParams.get('powerMin') || ''} onChange={handleChange} />
        <FilterField label="Hästkrafter max" name="powerMax" value={searchParams.get('powerMax') || ''} onChange={handleChange} />
        <SelectField label="Drivmedel" name="fuel" value={searchParams.get('fuel') || ''} onChange={handleChange} options={carFuelOptions} />
        <SelectField label="Växellåda" name="transmission" value={searchParams.get('transmission') || ''} onChange={handleChange} options={carTransmissionOptions} />
        <SelectField label="Drivlina" name="drivetrain" value={searchParams.get('drivetrain') || ''} onChange={handleChange} options={carDrivetrainOptions} />
        <SelectField label="Kaross" name="bodyType" value={searchParams.get('bodyType') || ''} onChange={handleChange} options={carBodyOptions} />
        <SelectField label="Färg" name="color" value={searchParams.get('color') || ''} onChange={handleChange} options={carColorOptions} />
        <FilterField label="Sök" name="search" value={searchParams.get('search') || ''} onChange={handleChange} placeholder="Ange modell eller märke" />
      </div>
    </section>
  );
}

function FilterField({ label, name, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <input name={name} value={value} onChange={onChange} placeholder={placeholder} className="text-sm" />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <select name={name} value={value} onChange={onChange} className="text-sm">
        <option value="">Alla</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
