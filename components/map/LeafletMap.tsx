"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface FacilityPin {
  id: string;
  name: string;
  sector: string;
  lat: number;
  lng: number;
  distance_km: number;
  max_group_size: number;
  curriculum_topics: string;
}

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  facilities: FacilityPin[];
  selectedId: string | null;
  onSelectFacility: (id: string) => void;
  radiusKm: number;
}

export default function LeafletMap({
  center,
  zoom,
  facilities,
  selectedId,
  onSelectFacility,
  radiusKm,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map instance once
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Center marker (User / Search Origin)
    const centerIcon = L.divIcon({
      className: "custom-leaflet-icon",
      html: `
        <div style="background-color: #2563eb; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // Remove previous circle
    if (circleRef.current) {
      circleRef.current.remove();
    }

    // Draw Radius Circle
    circleRef.current = L.circle(center, {
      radius: radiusKm * 1000,
      color: "#3b82f6",
      fillColor: "#60a5fa",
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: "4, 6",
    }).addTo(map);

    // Clear old facility markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add Facility Pins
    facilities.forEach((fac) => {
      const isSelected = fac.id === selectedId;
      const markerHtml = `
        <div class="vl-pin-badge ${isSelected ? "is-selected" : ""}">
          <span class="vl-pin-dot"></span>
          <span class="vl-pin-name">${fac.name.split(" ")[0]}</span>
          <span class="vl-pin-dist">${fac.distance_km}km</span>
        </div>
      `;

      const icon = L.divIcon({
        className: "custom-leaflet-icon",
        html: markerHtml,
        iconSize: [100, 28],
        iconAnchor: [50, 14],
      });

      const marker = L.marker([fac.lat, fac.lng], { icon })
        .addTo(map)
        .on("click", () => {
          onSelectFacility(fac.id);
        });

      const driveMins = Math.max(12, Math.round(fac.distance_km * 2));

      marker.bindPopup(`
        <div class="vl-popup-card">
          <div class="vl-popup-header">
            <span class="vl-popup-sector-tag">${fac.sector}</span>
            <span class="vl-popup-status-pill">
              <span class="vl-status-beacon"></span>
              Live Available
            </span>
          </div>

          <h3 class="vl-popup-heading">${fac.name}</h3>

          <div class="vl-popup-meta-row">
            <span class="vl-popup-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
              ~${driveMins} mins
            </span>
            <span class="vl-popup-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
              ${fac.distance_km} km away
            </span>
          </div>

          <p class="vl-popup-snippet">${fac.curriculum_topics.substring(0, 95)}...</p>

          <div class="vl-popup-actions">
            <button onclick="window.__openLiveSituation && window.__openLiveSituation('${fac.id}')" class="vl-popup-btn-secondary" title="View live weather, transit and logistics">
              Live Telemetry
            </button>
            <a href="/coordinator/book/${fac.id}" class="vl-popup-btn-primary">
              Book Visit &rarr;
            </a>
          </div>
        </div>
      `, {
        maxWidth: 290,
        className: "vl-custom-leaflet-popup"
      });

      markersRef.current[fac.id] = marker;
    });

    // Auto-pan if selected
    if (selectedId && markersRef.current[selectedId]) {
      const selected = facilities.find((f) => f.id === selectedId);
      if (selected) {
        map.panTo([selected.lat, selected.lng]);
        markersRef.current[selectedId].openPopup();
      }
    }
  }, [center, zoom, facilities, selectedId, radiusKm, onSelectFacility]);

  return <div ref={mapContainerRef} className="h-full w-full rounded-2xl z-0" />;
}
