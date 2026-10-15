import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { MapNeighborhood, MapPoint } from '@er/shared';
import { formatCurrency, formatNumber, formatPricePerM2 } from '../../utils/format';
import { escapeHtml } from '../../utils/html';
import { classColor, scoreColor, type ColorClass } from './mapColors';

export type MapLayer = 'properties' | 'neighborhoods';

interface LeafletMapProps {
  center: { lat: number; lng: number } | null;
  layer: MapLayer;
  points: MapPoint[];
  neighborhoods: MapNeighborhood[];
  classes: ColorClass[];
  onOpenProperty: (id: string) => void;
  onOpenNeighborhood: (slug: string) => void;
}

const FALLBACK_CENTER: L.LatLngTuple = [-27.6351, -52.2739];
const INITIAL_ZOOM = 13;
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const MUTED = '#adb5bd';

function propertyPopup(point: MapPoint): string {
  const photo = point.photo ? `<img src="${escapeHtml(point.photo)}" alt="" loading="lazy" referrerpolicy="no-referrer" />` : '';
  return `<div class="map-popup">${photo}
    <strong class="map-popup__title">${escapeHtml(point.title)}</strong>
    <span>${escapeHtml(point.neighborhood ?? 'Bairro não informado')}</span>
    <span><b>${formatCurrency(point.price)}</b> · ${formatPricePerM2(point.pricePerM2)}</span>
    <span>Nota <b>${Math.round(point.score)}</b>/100</span>
    <a href="/imovel/${encodeURIComponent(point.id)}" data-property-id="${escapeHtml(point.id)}">Ver imóvel</a>
  </div>`;
}

function neighborhoodPopup(hood: MapNeighborhood): string {
  return `<div class="map-popup">
    <strong class="map-popup__title">${escapeHtml(hood.name)}</strong>
    <span>Mediana <b>${formatPricePerM2(hood.medianPricePerM2)}</b></span>
    <span>${formatNumber(hood.count)} imóveis</span>
    <a href="#" data-neighborhood-slug="${escapeHtml(hood.slug)}">Ver no ranking</a>
  </div>`;
}

function propertyMarkers(points: MapPoint[]): L.Layer[] {
  return points.map((point) =>
    L.circleMarker([point.lat, point.lng], { radius: 6, weight: 2, color: '#fff', fillColor: scoreColor(point.score), fillOpacity: 0.95 })
      .bindTooltip(`${escapeHtml(point.title)}<br><b>${formatCurrency(point.price)}</b> · nota ${Math.round(point.score)}`, { direction: 'top', offset: [0, -6] })
      .bindPopup(propertyPopup(point), { maxWidth: 240 }),
  );
}

function neighborhoodMarkers(hoods: MapNeighborhood[], classes: ColorClass[]): L.Layer[] {
  const maxCount = Math.max(1, ...hoods.map((h) => h.count));
  return hoods.map((hood) =>
    L.circleMarker([hood.lat, hood.lng], {
      radius: 7 + 17 * Math.sqrt(hood.count / maxCount),
      weight: 2,
      color: '#fff',
      fillColor: classColor(classes, hood.medianPricePerM2) ?? MUTED,
      fillOpacity: 0.85,
    })
      .bindTooltip(`${escapeHtml(hood.name)}<br><b>${formatPricePerM2(hood.medianPricePerM2)}</b> · ${formatNumber(hood.count)} imóveis`, { direction: 'top' })
      .bindPopup(neighborhoodPopup(hood)),
  );
}

export function LeafletMap({ center, layer, points, neighborhoods, classes, onOpenProperty, onOpenNeighborhood }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const groupRef = useRef<L.LayerGroup | null>(null);
  const handlers = useRef({ onOpenProperty, onOpenNeighborhood });
  handlers.current = { onOpenProperty, onOpenNeighborhood };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const map = L.map(container, { preferCanvas: true, scrollWheelZoom: false }).setView(center ? [center.lat, center.lng] : FALLBACK_CENTER, INITIAL_ZOOM);
    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
    map.on('focus', () => map.scrollWheelZoom.enable());
    map.on('blur', () => map.scrollWheelZoom.disable());
    groupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const property = target.closest<HTMLElement>('[data-property-id]');
      const hood = target.closest<HTMLElement>('[data-neighborhood-slug]');
      if (!property && !hood) return;
      event.preventDefault();
      if (property) handlers.current.onOpenProperty(property.dataset.propertyId as string);
      if (hood) handlers.current.onOpenNeighborhood(hood.dataset.neighborhoodSlug as string);
    };
    container.addEventListener('click', onClick);
    return () => {
      container.removeEventListener('click', onClick);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    const markers = layer === 'properties' ? propertyMarkers(points) : neighborhoodMarkers(neighborhoods, classes);
    markers.forEach((marker) => group.addLayer(marker));
  }, [layer, points, neighborhoods, classes]);

  return <div ref={containerRef} className="leaflet-map" role="region" aria-label="Mapa de imóveis de Erechim" />;
}
