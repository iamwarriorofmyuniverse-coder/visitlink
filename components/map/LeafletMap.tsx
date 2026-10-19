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
        <div style="
          background-color: ${isSelected ? "#dc2626" : "#1e40af"};
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          cursor: pointer;
        ">
          ${fac.name.split(" ")[0]} (${fac.distance_km}km)
        </div>
      `;

      const icon = L.divIcon({
        className: "custom-leaflet-icon",
        html: markerHtml,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      const marker = L.marker([fac.lat, fac.lng], { icon })
        .addTo(map)
        .on("click", () => {
          onSelectFacility(fac.id);
        });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <strong style="font-size: 13px; color: #0f172a;">${fac.name}</strong><br/>
          <span style="color: #64748b;">Sector: ${fac.sector} | ${fac.distance_km} km away</span><br/>
          <span style="color: #2563eb; font-weight: 600;">Max Group: ${fac.max_group_size} students</span><br/>
          <p style="margin-top: 4px; color: #334155;">${fac.curriculum_topics.substring(0, 90)}...</p>
        </div>
      `);

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
