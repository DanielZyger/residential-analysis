import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CITY_STATE } from '@er/shared';
import { cx } from '../../utils/cx';

const LINKS = [
  { to: '/', label: 'Ranking', icon: 'trophy', end: true },
  { to: '/mapa', label: 'Mapa', icon: 'map', end: false },
  { to: '/bairros', label: 'Bairros', icon: 'geo-alt', end: false },
  { to: '/fontes', label: 'Fontes', icon: 'database', end: false },
];

export function AppNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <nav className="navbar navbar-expand-md app-navbar" aria-label="Navegação principal">
      <div className="container">
        <Link to="/" className="navbar-brand app-navbar__brand">
          <span className="app-navbar__logo" aria-hidden="true">
            <i className="bi bi-house-heart-fill" />
          </span>
          Erechim Residencial
          <span className="app-navbar__state">{CITY_STATE}</span>
        </Link>
        <button
          type="button"
          className="navbar-toggler"
          aria-controls="app-navbar-links"
          aria-expanded={open}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div id="app-navbar-links" className={cx('collapse', 'navbar-collapse', open && 'show')}>
          <ul className="navbar-nav ms-auto gap-md-1">
            {LINKS.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink to={link.to} end={link.end} className={({ isActive }) => cx('nav-link', isActive && 'active')}>
                  <i className={`bi bi-${link.icon} me-1`} aria-hidden="true" />
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
