"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Bike, Navigation, MapPin, Radio, Clock, Shield, Phone } from "lucide-react";

interface MapboxTrackingProps {
  deliveryId?: number;
  riderLat?: number | null;
  riderLng?: number | null;
  deliveryAddress?: string | null;
  riderName?: string | null;
  riderPhone?: string | null;
}

// Calculate Haversine distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function MapboxTracking({
  deliveryId,
  riderLat = 0.3476,
  riderLng = 32.5825,
  deliveryAddress,
  riderName = "Assigned Rider",
  riderPhone,
}: MapboxTrackingProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const riderMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [currentLat, setCurrentLat] = useState<number>(riderLat || 0.3476);
  const [currentLng, setCurrentLng] = useState<number>(riderLng || 32.5825);
  
  // Destination Coordinates (Geocoded from customer's deliveryAddress)
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number }>({
    lat: 0.3136,
    lng: 32.5811,
  });
  const [resolvedAddress, setResolvedAddress] = useState<string>(deliveryAddress || "Customer Delivery Address");

  const [eta, setEta] = useState<number>(12);
  const [distanceKm, setDistanceKm] = useState<number>(2.8);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  if (mapboxToken) {
    mapboxgl.accessToken = mapboxToken;
  }

  // 1. Geocode the customer's delivery address to get exact latitude/longitude
  useEffect(() => {
    async function geocodeDeliveryAddress() {
      if (!deliveryAddress) return;

      try {
        const query = encodeURIComponent(`${deliveryAddress}, Kampala, Uganda`);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxToken}&country=ug&proximity=32.5825,0.3476&limit=1`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            const placeName = data.features[0].place_name;
            setDestinationCoords({ lat, lng });
            setResolvedAddress(deliveryAddress);

            // If map is already initialized, update destination marker
            if (destMarkerRef.current) {
              destMarkerRef.current.setLngLat([lng, lat]);
              destMarkerRef.current.setPopup(
                new mapboxgl.Popup({ offset: 15 }).setHTML(
                  `<div class="p-1">
                    <strong class="text-xs text-rose-600 block">Delivery Destination:</strong>
                    <span class="text-[11px] text-zinc-700">${deliveryAddress}</span>
                  </div>`
                )
              );
            }

            // Fit map bounds to show both rider and delivery address
            if (mapRef.current) {
              const bounds = new mapboxgl.LngLatBounds();
              bounds.extend([currentLng, currentLat]);
              bounds.extend([lng, lat]);
              mapRef.current.fitBounds(bounds, { padding: 90, maxZoom: 15 });
            }
          }
        }
      } catch (err) {
        console.warn("Address geocoding notice:", err);
      }
    }

    geocodeDeliveryAddress();
  }, [deliveryAddress, mapboxToken]);

  // 2. Initialize Mapbox Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = riderLat || 0.3476;
    const initialLng = riderLng || 32.5825;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [initialLng, initialLat],
      zoom: 13.5,
      attributionControl: false,
    });

    map.on("error", (e) => {
      console.warn("Mapbox notice:", e.error?.message || e);
    });

    mapRef.current = map;

    // A. Create Rider Marker (Motorcycle / Delivery unit)
    const riderEl = document.createElement("div");
    riderEl.className =
      "flex items-center justify-center w-11 h-11 rounded-full bg-[#087FEF] text-white shadow-xl ring-4 ring-[#087FEF]/30 animate-pulse cursor-pointer transition-transform hover:scale-110";
    riderEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`;

    const riderMarker = new mapboxgl.Marker({ element: riderEl })
      .setLngLat([initialLng, initialLat])
      .setPopup(
        new mapboxgl.Popup({ offset: 15 }).setHTML(
          `<div class="p-1">
            <strong class="text-xs text-[#087FEF] block">${riderName}</strong>
            <span class="text-[11px] text-zinc-600">Live GPS Location</span>
          </div>`
        )
      )
      .addTo(map);

    riderMarkerRef.current = riderMarker;

    // B. Create Destination Marker (Customer address pin)
    const destEl = document.createElement("div");
    destEl.className =
      "flex items-center justify-center w-9 h-9 rounded-full bg-rose-600 text-white shadow-lg ring-3 ring-white cursor-pointer transition-transform hover:scale-110";
    destEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    const destMarker = new mapboxgl.Marker({ element: destEl })
      .setLngLat([destinationCoords.lng, destinationCoords.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 15 }).setHTML(
          `<div class="p-1">
            <strong class="text-xs text-rose-600 block">Delivery Destination:</strong>
            <span class="text-[11px] text-zinc-700 font-medium">${deliveryAddress || "Customer Address"}</span>
          </div>`
        )
      )
      .addTo(map);

    destMarkerRef.current = destMarker;

    map.on("load", () => {
      // Draw live connection path between Rider and Destination
      const routeGeoJSON = {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [initialLng, initialLat],
            [destinationCoords.lng, destinationCoords.lat],
          ],
        },
      };

      map.addSource("route", {
        type: "geojson",
        data: routeGeoJSON,
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#087FEF",
          "line-width": 4,
          "line-dasharray": [2, 2],
          "line-opacity": 0.85,
        },
      });

      // Fit bounds nicely
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([initialLng, initialLat]);
      bounds.extend([destinationCoords.lng, destinationCoords.lat]);
      map.fitBounds(bounds, { padding: 90, maxZoom: 15 });
    });

    return () => {
      map.remove();
    };
  }, []);

  // 3. Poll / Listen for Live Rider GPS updates
  useEffect(() => {
    if (!deliveryId) return;

    const interval = setInterval(async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
        const res = await fetch(`${apiBase}/tracking/delivery/${deliveryId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            const newLat = parseFloat(data.latitude);
            const newLng = parseFloat(data.longitude);
            setCurrentLat(newLat);
            setCurrentLng(newLng);

            // Update rider marker position
            if (riderMarkerRef.current) {
              riderMarkerRef.current.setLngLat([newLng, newLat]);
            }

            // Update remaining distance and ETA dynamically
            const dist = calculateDistanceKm(newLat, newLng, destinationCoords.lat, destinationCoords.lng);
            setDistanceKm(dist);
            setEta(Math.max(2, Math.round((dist / 25) * 60))); // approx 25 km/h urban speed

            // Update route polyline
            if (mapRef.current && mapRef.current.getSource("route")) {
              const routeSource = mapRef.current.getSource("route") as mapboxgl.GeoJSONSource;
              routeSource.setData({
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [newLng, newLat],
                    [destinationCoords.lng, destinationCoords.lat],
                  ],
                },
              });
            }
          }
        }
      } catch {
        // Silently continue
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [deliveryId, destinationCoords]);

  return (
    <div className="relative w-full overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-xl">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-[400px] sm:h-[480px]" />

      {/* Floating HUD Telemetry Overlay */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-[340px] bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white shadow-2xl z-10 space-y-3">
        
        {/* Status header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Live Satellite Link</span>
          </div>
          <span className="text-xs font-mono font-bold text-white/80">{distanceKm} km remaining</span>
        </div>

        {/* Destination Info */}
        <div className="flex items-start space-x-2.5 text-xs">
          <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-3 h-3" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] text-white/50 uppercase font-semibold block">Destination:</span>
            <p className="text-xs text-white font-medium truncate" title={deliveryAddress || "Customer Address"}>
              {deliveryAddress || "Customer Address on File"}
            </p>
          </div>
        </div>

        {/* Rider & ETA Info */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-[#087FEF]/20 text-[#087FEF] flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{riderName}</p>
              <p className="text-[10px] text-white/50">Courier Unit #EF-{deliveryId || 1}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-white/50 uppercase font-semibold block">ETA</span>
            <span className="text-sm font-bold text-[#087FEF] font-mono">{eta} mins</span>
          </div>
        </div>

        {/* Call Rider CTA */}
        {riderPhone && (
          <a
            href={`tel:${riderPhone}`}
            className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-white/10"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Rider ({riderPhone})</span>
          </a>
        )}

      </div>
    </div>
  );
}
