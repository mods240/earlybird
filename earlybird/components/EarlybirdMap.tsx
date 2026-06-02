"use client";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";

interface Restaurant {
  id: number;
  name: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  cuisine: string | null;
  opening_hours: string | null;
  website: string | null;
  region: string | null;
  distance?: number;
}

const interestedIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:#ea580c;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">🍢</div>`,
  iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16],
});

const bookmarkIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:#fbbf24;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">🍢</div>`,
  iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16],
});

const defaultIcon = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;background:#7c2d12;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:12px;">🍢</div>`,
  iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -14],
});

function createCurrentIcon(heading: number | null): L.DivIcon {
  const size = 80;
  const cx = size / 2;
  const cy = size / 2;
  let beamSvg = "";
  if (heading !== null) {
    beamSvg = `<polygon points="${cx},${cy} ${cx - 12},${cy - 44} ${cx + 12},${cy - 44}" fill="rgba(234,88,12,0.35)" transform="rotate(${heading}, ${cx}, ${cy})"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${beamSvg}<circle cx="${cx}" cy="${cy}" r="10" fill="#ea580c" stroke="white" stroke-width="3"/></svg>`;
  return L.divIcon({ html: svg, iconSize: [size, size], iconAnchor: [cx, cy], className: "" });
}

interface MapProps {
  restaurants: Restaurant[];
  center: [number, number];
  bookmarks: Set<number>;
  interested: Set<number>;
  onToggleBookmark: (id: number) => void;
  onToggleInterested: (id: number) => void;
}

function MapInit({ center }: { center: [number, number] }) {
  const map = useMap();
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      map.setView(center, 14);
      initialized.current = true;
      (window as any)._earlybirdMap = map;
    }
  }, [center, map]);
  return null;
}

export default function EarlybirdMap({ restaurants, center, bookmarks, interested, onToggleBookmark, onToggleInterested }: MapProps) {
  const [heading, setHeading] = useState<number | null>(null);
  const [showCompassModal, setShowCompassModal] = useState(false);
  const handleOrientationRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  function startCompass() {
    function handleOrientation(e: DeviceOrientationEvent) {
      const ios = (e as any).webkitCompassHeading;
      if (ios != null) setHeading(ios);
      else if (e.alpha != null) setHeading(360 - e.alpha);
    }
    handleOrientationRef.current = handleOrientation;
    const DevOrient = DeviceOrientationEvent as any;
    if (typeof DevOrient.requestPermission === "function") {
      DevOrient.requestPermission().then((result: string) => {
        if (result === "granted") window.addEventListener("deviceorientation", handleOrientation, true);
      }).catch(() => {});
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
  }

  useEffect(() => {
    const DevOrient = DeviceOrientationEvent as any;
    if (typeof DevOrient.requestPermission === "function") {
      if (!localStorage.getItem("compassPermissionAsked")) {
        localStorage.setItem("compassPermissionAsked", "true");
        setShowCompassModal(true);
      } else if (localStorage.getItem("compassPermissionGranted") === "true") {
        startCompass();
      }
    } else {
      startCompass();
    }
    return () => {
      if (handleOrientationRef.current) window.removeEventListener("deviceorientation", handleOrientationRef.current, true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {showCompassModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", maxWidth: "320px", width: "100%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🧭</div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#7c2d12", marginBottom: "8px" }}>方向ビームを使いますか？</h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px", lineHeight: "1.6" }}>スマホの向きを検知して、現在地から進行方向にビームを表示します。</p>
            <button onClick={() => { localStorage.setItem("compassPermissionGranted", "true"); setShowCompassModal(false); startCompass(); }}
              style={{ width: "100%", padding: "12px", marginBottom: "8px", background: "#7c2d12", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>🧭 許可する</button>
            <button onClick={() => setShowCompassModal(false)}
              style={{ width: "100%", padding: "10px", background: "transparent", color: "#999", border: "none", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>使わない</button>
          </div>
        </div>
      )}
      <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={true}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapInit center={center} />
        <Marker position={center} icon={createCurrentIcon(heading)}>
          <Popup>📍 現在地</Popup>
        </Marker>
        <MarkerClusterGroup
          iconCreateFunction={(cluster: { getChildCount: () => number; getAllChildMarkers: () => L.Marker[] }) => {
            const count = cluster.getChildCount();
            const markers = cluster.getAllChildMarkers();
            const hasInterested = markers.some(m => interested.has((m.options as any).restaurantId));
            const hasBookmark = markers.some(m => bookmarks.has((m.options as any).restaurantId));
            const bg = hasInterested ? '#ea580c' : hasBookmark ? '#fbbf24' : '#7c2d12';
            return L.divIcon({
              className: "",
              html: `<div style="width:40px;height:40px;background:${bg};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;flex-direction:column;"><span style="font-size:14px;">🍢</span><span style="font-size:10px;color:white;font-weight:bold;line-height:1;">${count}</span></div>`,
              iconSize: [40, 40], iconAnchor: [20, 20],
            });
          }}
        >
          {restaurants.map(restaurant => {
            const isInterested = interested.has(restaurant.id);
            const isBookmarked = bookmarks.has(restaurant.id);
            const icon = isInterested ? interestedIcon : isBookmarked ? bookmarkIcon : defaultIcon;
            return (
              <Marker key={restaurant.id} position={[restaurant.latitude, restaurant.longitude]} icon={icon} {...{ restaurantId: restaurant.id } as any}>
                <Popup>
                  <div style={{ minWidth: "180px" }}>
                    <p style={{ fontWeight: "bold", marginBottom: "4px", fontSize: "14px" }}>🍢 {restaurant.name || "名称不明"}</p>
                    {restaurant.address && <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>{restaurant.address}</p>}
                    {restaurant.opening_hours && <p style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>🕐 {restaurant.opening_hours}</p>}
                    <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                      <button onClick={() => onToggleInterested(restaurant.id)} style={{ flex: 1, padding: "4px", background: isInterested ? "#ea580c" : "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>{isInterested ? "♥ 気になる中" : "♥ 気になる"}</button>
                      <button onClick={() => onToggleBookmark(restaurant.id)} style={{ flex: 1, padding: "4px", background: isBookmarked ? "#fbbf24" : "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>{isBookmarked ? "⭐ 登録中" : "☆ お気に入り"}</button>
                    </div>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                      <a href={"https://line.me/R/share?text=" + encodeURIComponent("🍢 " + (restaurant.name || "") + "\n" + (restaurant.address || "") + "\nhttps://earlybird.vercel.app")} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "4px", background: "#06C755", borderRadius: "4px", fontSize: "12px", color: "white", textAlign: "center", textDecoration: "none", fontWeight: "bold" }}>LINE</a>
                      <a href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent("🍢 " + (restaurant.name || "") + " で焼き鳥！\n" + (restaurant.address || "") + "\n#アーリーバード #焼き鳥\nhttps://earlybird.vercel.app")} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "4px", background: "#000", borderRadius: "4px", fontSize: "12px", color: "white", textAlign: "center", textDecoration: "none", fontWeight: "bold" }}>X 投稿</a>
                    </div>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", background: "#7c2d12", color: "white", padding: "6px", borderRadius: "4px", fontSize: "12px", textDecoration: "none" }}>🗺️ Google Maps で開く</a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </>
  );
}
