"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";

let configured = false;

export function RouteMap({ encodedPolyline }: { encodedPolyline: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    let line: google.maps.Polyline | undefined;
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];
    let map: google.maps.Map | undefined;

    async function draw() {
      if (!configured) {
        setOptions({ key: apiKey!, v: "weekly", language: "th", region: "TH" });
        configured = true;
      }
      const [{ Map }, { encoding }, { AdvancedMarkerElement }] =
        await Promise.all([
          importLibrary("maps"),
          importLibrary("geometry"),
          importLibrary("marker"),
        ]);
      if (cancelled || !container.current) return;
      const path = encoding.decodePath(encodedPolyline);
      if (!path.length) throw new Error("Empty polyline");
      map = new Map(container.current, {
        center: path[0],
        zoom: 14,
        mapId: "DEMO_MAP_ID",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      line = new google.maps.Polyline({
        map,
        path,
        strokeColor: "#2563eb",
        strokeWeight: 6,
        strokeOpacity: 0.9,
      });
      const bounds = new google.maps.LatLngBounds();
      path.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds, 60);
      for (const [position, title] of [
        [path[0], "ต้นทางของเส้นทาง"],
        [path[path.length - 1], "ปลายทางของเส้นทางไปบริษัท"],
      ] as const) {
        markers.push(new AdvancedMarkerElement({ map, position, title }));
      }
    }

    void draw().catch(() => {
      if (!cancelled)
        setError(
          "โหลดแผนที่ไม่สำเร็จ ตรวจ Maps JavaScript API, billing และข้อจำกัด browser key",
        );
    });
    return () => {
      cancelled = true;
      line?.setMap(null);
      markers.forEach((marker) => {
        marker.map = null;
      });
      if (map) google.maps.event.clearInstanceListeners(map);
    };
  }, [apiKey, encodedPolyline]);

  if (!apiKey)
    return (
      <div className="map-placeholder">
        เพิ่ม NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ใน web/.env.local เพื่อแสดงแผนที่
        แล้ว restart web
      </div>
    );
  if (error)
    return (
      <div className="map-placeholder" role="alert">
        {error}
      </div>
    );
  return (
    <div
      ref={container}
      className="route-map"
      aria-label="แผนที่เส้นทางรถยนต์ไปบริษัท"
    />
  );
}
