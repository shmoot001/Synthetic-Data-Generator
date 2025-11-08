export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-100 py-10 mt-12">
      <div className="max-w-6xl mx-auto px-4 grid gap-6 md:grid-cols-3 text-sm">
        <div>
          <h3 className="font-semibold text-lg mb-2">Aftén Bil Begagnat</h3>
          <p className="text-slate-300">
            Vi erbjuder kvalitetstestad begagnad bilförsäljning med fokus på trygghet, service och transparenta affärer.
          </p>
        </div>
        <div>
          <h4 className="font-semibold uppercase text-xs tracking-wide text-slate-400 mb-2">Kontakt</h4>
          <p>Åkersberga, Sverige</p>
          <p>Telefon: 08-123 45 67</p>
          <p>E-post: info@aftenbil.se</p>
        </div>
        <div>
          <h4 className="font-semibold uppercase text-xs tracking-wide text-slate-400 mb-2">Öppettider</h4>
          <p>Mån–Fre: 09:00–18:00</p>
          <p>Lör: 10:00–15:00</p>
          <p>Sön: Endast tidsbokning</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-8 text-xs text-slate-500">
        © {new Date().getFullYear()} Aftén Bil Begagnat. Alla rättigheter förbehållna.
      </div>
    </footer>
  );
}
