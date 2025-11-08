import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-10">
        <div className="space-y-5 max-w-xl">
          <p className="uppercase text-sm tracking-[0.2em] text-slate-200">Säkra begagnade bilar</p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Hitta din nästa bil hos Aftén Bil Begagnat
          </h1>
          <p className="text-slate-200">
            Upptäck ett kuraterat utbud av kvalitetstestade bilar med tydliga specifikationer, finansieringsalternativ
            och personlig service.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="#cars"
              className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-slate-100 transition"
            >
              Visa bilar
            </Link>
            <Link
              to="/admin"
              className="border border-white/60 px-6 py-3 rounded-full font-semibold text-white hover:bg-white/10"
            >
              Adminportal
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="w-72 h-72 rounded-full bg-white/10 blur-3xl absolute -inset-10" aria-hidden="true" />
          <img
            src="/cars/tcross-1.jpg"
            alt="Volkswagen T-Cross"
            className="relative z-10 rounded-3xl shadow-2xl border border-white/20"
          />
        </div>
      </div>
    </section>
  );
}
