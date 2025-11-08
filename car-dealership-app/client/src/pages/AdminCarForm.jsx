import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { equipmentOptions, carBodyOptions, carColorOptions, carDrivetrainOptions, carFuelOptions, carTransmissionOptions } from '../lib/options.js';
import { createCar, fetchCar, updateCar, fetchRevisions } from '../lib/api.js';

const defaultValues = {
  title: '',
  make: '',
  model: '',
  variant: '',
  priceSek: 0,
  priceExVatSek: '',
  mileageKm: '',
  modelYear: '',
  bodyType: '',
  drivetrain: '',
  fuel: '',
  transmission: '',
  powerHp: '',
  color: '',
  registrationNumber: '',
  location: '',
  dealerName: 'Aftén Bil VW Åkersberga Begagnat',
  isPublished: true,
  description: '',
  equipment: [],
  images: [{ url: '', alt: '' }]
};

export default function AdminCarForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [revisions, setRevisions] = useState([]);
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm({ defaultValues });

  useEffect(() => {
    if (mode !== 'edit' || !id) {
      reset(defaultValues);
      return;
    }
    async function load() {
      try {
        const car = await fetchCar(id);
        reset({
          ...car,
          priceExVatSek: car.priceExVatSek ?? '',
          mileageKm: car.mileageKm ?? '',
          modelYear: car.modelYear ?? '',
          powerHp: car.powerHp ?? '',
          equipment: car.equipment || [],
          images: car.images?.length ? car.images.map((img) => ({ url: img.url, alt: img.alt })) : [{ url: '', alt: '' }]
        });
        const history = await fetchRevisions(id);
        setRevisions(history);
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, [mode, id, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      priceSek: Number(values.priceSek),
      priceExVatSek: values.priceExVatSek ? Number(values.priceExVatSek) : null,
      mileageKm: values.mileageKm ? Number(values.mileageKm) : null,
      modelYear: values.modelYear ? Number(values.modelYear) : null,
      powerHp: values.powerHp ? Number(values.powerHp) : null,
      equipment: values.equipment,
      images: values.images.filter((img) => img.url)
    };

    if (mode === 'edit') {
      await updateCar(id, payload);
    } else {
      await createCar(payload);
    }

    navigate('/admin');
  });

  const addImageField = () => {
    const images = watch('images');
    setValue('images', [...images, { url: '', alt: '' }]);
  };

  const removeImageField = (index) => {
    const images = watch('images');
    if (images.length === 1) return;
    setValue(
      'images',
      images.filter((_, i) => i !== index)
    );
  };

  const toggleEquipment = (item) => {
    const current = watch('equipment');
    if (current.includes(item)) {
      setValue('equipment', current.filter((value) => value !== item));
    } else {
      setValue('equipment', [...current, item]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">
          {mode === 'edit' ? 'Redigera bil' : 'Lägg till ny bil'}
        </h1>
      </div>
      <form className="grid lg:grid-cols-3 gap-6" onSubmit={onSubmit}>
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Grundinformation</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Titel" register={register('title', { required: true })} />
              <Field label="Märke" register={register('make', { required: true })} />
              <Field label="Modell" register={register('model', { required: true })} />
              <Field label="Variant" register={register('variant')} />
              <Field label="Pris (SEK)" type="number" register={register('priceSek', { required: true, valueAsNumber: true })} />
              <Field label="Pris exkl. moms" type="number" register={register('priceExVatSek')} />
              <Field label="Miltal" type="number" register={register('mileageKm')} />
              <Field label="Årsmodell" type="number" register={register('modelYear')} />
              <Field label="Hästkrafter" type="number" register={register('powerHp')} />
              <Field label="Registreringsnummer" register={register('registrationNumber')} />
              <Field label="Plats" register={register('location')} />
              <Field label="Återförsäljare" register={register('dealerName')} />
              <SelectField label="Kaross" register={register('bodyType')} options={carBodyOptions} />
              <SelectField label="Drivlina" register={register('drivetrain')} options={carDrivetrainOptions} />
              <SelectField label="Drivmedel" register={register('fuel')} options={carFuelOptions} />
              <SelectField label="Växellåda" register={register('transmission')} options={carTransmissionOptions} />
              <SelectField label="Färg" register={register('color')} options={carColorOptions} />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" {...register('isPublished')} />
                Publicerad
              </label>
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-500 mb-1">Beskrivning</label>
              <textarea rows="6" className="w-full" {...register('description')} placeholder="Beskrivning i Markdown" />
            </div>
          </section>
          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">Utrustning</h2>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              {equipmentOptions.map((item) => {
                const checked = watch('equipment').includes(item);
                return (
                  <label key={item} className={`flex items-center gap-2 border rounded-lg px-3 py-2 ${checked ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleEquipment(item)} />
                    {item}
                  </label>
                );
              })}
            </div>
          </section>
          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Bilder</h2>
            <p className="text-sm text-slate-500">Ange URL till uppladdade bilder. Drag & drop stöds via extern lagring.</p>
            {watch('images').map((image, index) => (
              <div key={index} className="grid md:grid-cols-[2fr,2fr,auto] gap-3 items-end">
                <div>
                  <label className="block text-xs uppercase text-slate-500">Bild-URL</label>
                  <input value={image.url} onChange={(event) => handleImageChange(index, 'url', event.target.value, setValue, watch)} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-slate-500">Alt-text</label>
                  <input value={image.alt} onChange={(event) => handleImageChange(index, 'alt', event.target.value, setValue, watch)} />
                </div>
                <button type="button" onClick={() => removeImageField(index)} className="text-sm text-red-500">
                  Ta bort
                </button>
              </div>
            ))}
            <button type="button" onClick={addImageField} className="text-sm text-primary hover:underline">
              Lägg till bild
            </button>
          </section>
        </div>
        <aside className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Publicering</h2>
            <p className="text-sm text-slate-500">
              Kontrollera att all information är korrekt innan du publicerar. Du kan alltid uppdatera uppgifter senare.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Sparar…' : mode === 'edit' ? 'Uppdatera bil' : 'Skapa bil'}
            </button>
          </section>
          {mode === 'edit' && revisions.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-sm">
              <h3 className="text-lg font-semibold text-slate-800">Ändringshistorik</h3>
              <ul className="space-y-2">
                {revisions.map((revision) => (
                  <li key={revision.id} className="border border-slate-200 rounded-lg px-3 py-2">
                    <p className="font-semibold text-slate-700">{revision.change_summary}</p>
                    <p className="text-xs text-slate-500">{new Date(revision.updated_at).toLocaleString('sv-SE')}</p>
                    {revision.updated_by_email && (
                      <p className="text-xs text-slate-400">{revision.updated_by_email}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </form>
    </div>
  );
}

function Field({ label, type = 'text', register }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase text-slate-500">{label}</span>
      <input type={type} {...register} />
    </label>
  );
}

function SelectField({ label, register, options }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase text-slate-500">{label}</span>
      <select {...register}>
        <option value="">Välj</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function handleImageChange(index, key, value, setValue, watch) {
  const images = [...watch('images')];
  images[index] = { ...images[index], [key]: value };
  setValue('images', images);
}
