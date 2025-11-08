import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { usePreferencesStore } from '../store/usePreferencesStore.js';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const favoritesCount = usePreferencesStore((state) => state.favorites.length);
  const compareCount = usePreferencesStore((state) => state.compare.length);

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-semibold text-lg">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">
            AB
          </span>
          <div>
            <span className="block leading-tight">Aftén Bil Begagnat</span>
            <span className="text-xs text-slate-500">Pålitliga bilar i Sverige</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'text-primary' : '')}>
            Bilar till salu
          </NavLink>
          <button
            type="button"
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-preferences', { detail: 'favorites' }))}
            className="relative"
          >
            Favoriter
            {favoritesCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-primary text-white text-xs rounded-full px-2">
                {favoritesCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-preferences', { detail: 'compare' }))}
            className="relative"
          >
            Jämför
            {compareCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-accent text-white text-xs rounded-full px-2">
                {compareCount}
              </span>
            )}
          </button>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'text-primary' : '')}>
            Adminportal
          </NavLink>
          {user && (
            <button type="button" onClick={handleLogout} className="text-sm text-slate-500 hover:text-primary">
              Logga ut
            </button>
          )}
        </nav>
        <div className="md:hidden flex items-center gap-3">
          <button
            type="button"
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-preferences', { detail: 'favorites' }))}
            className="relative text-sm"
          >
            ❤
            {favoritesCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-primary text-white text-xs rounded-full px-1">
                {favoritesCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-preferences', { detail: 'compare' }))}
            className="relative text-sm"
          >
            ⇄
            {compareCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-accent text-white text-xs rounded-full px-1">
                {compareCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
