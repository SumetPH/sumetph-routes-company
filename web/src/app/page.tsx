"use client";

import { useRef, useState, type SubmitEvent } from "react";
import {
  ArrowUpRight,
  Car,
  LocateFixed,
  MapPin,
  Navigation,
  Route,
  Timer,
} from "lucide-react";
import { RouteMap } from "@/components/route-map";
import Link from "next/link";

type CompanyRoute = {
  distanceMeters: number;
  durationSeconds: number;
  encodedPolyline: string;
};

export default function Home() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompanyRoute | null>(null);
  const [response, setResponse] = useState("");
  const [calculatedAt, setCalculatedAt] = useState("");
  const pending = useRef(false);

  function locate() {
    setError("");
    if (!navigator.geolocation) {
      setError("เบราว์เซอร์นี้ไม่รองรับตำแหน่งปัจจุบัน กรุณากรอกพิกัดเอง");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(String(coords.latitude));
        setLongitude(String(coords.longitude));
        setResult(null);
        setResponse("");
        setLocating(false);
      },
      (failure) => {
        setError(
          failure.code === 1
            ? "ไม่ได้รับสิทธิ์เข้าถึงตำแหน่ง อนุญาตในเบราว์เซอร์หรือกรอกพิกัดเอง"
            : "รับตำแหน่งไม่สำเร็จ กรุณาลองใหม่หรือกรอกพิกัดเอง",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10_000 },
    );
  }

  async function calculate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setResult(null);
    setResponse("");
    setCalculatedAt("");
    try {
      const res = await fetch("/api/routes/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: { latitude: Number(latitude), longitude: Number(longitude) },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(90_000),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "ติดต่อ API ไม่สำเร็จ ตรวจว่า NestJS รันอยู่ที่ API_BASE_URL",
        );
      }
      setResponse(JSON.stringify(data, null, 2));
      if (!res.ok)
        throw new Error(
          res.status === 429
            ? "เรียก API เกิน 10 ครั้งต่อนาที กรุณารอก่อนลองใหม่"
            : data.message || `API error ${res.status}`,
        );
      if (
        typeof data.distanceMeters !== "number" ||
        typeof data.durationSeconds !== "number" ||
        typeof data.encodedPolyline !== "string"
      )
        throw new Error("รูปแบบ response ไม่ถูกต้อง");
      setResult(data);
      setCalculatedAt(new Date().toLocaleString("th-TH"));
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "คำนวณเส้นทางไม่สำเร็จ",
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="test-shell">
      <header className="test-header">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <Navigation size={20} />
          </span>{" "}
          Company Route <span className="demo-tag">API TEST</span>
        </Link>
        <span className="provider">
          Powered by Google Maps <ArrowUpRight size={14} />
        </span>
      </header>
      <section className="intro">
        <p className="eyebrow">YOUR LOCATION → COMPANY</p>
        <h1>
          เส้นทางไปบริษัท<span>คำนวณจากเวลานี้</span>
        </h1>
        <p>
          เลือกตำแหน่งต้นทาง แล้วดูเส้นทาง ระยะทาง
          และเวลาเดินทางด้วยรถยนต์ตามสภาพจราจรปัจจุบัน
        </p>
      </section>
      <div className="test-grid">
        <section className="control-card">
          <div className="section-title">
            <MapPin size={20} />
            <h2>ตำแหน่งต้นทาง</h2>
          </div>
          <p className="muted">ใช้ตำแหน่งปัจจุบัน หรือกรอกพิกัดเพื่อทดสอบ</p>
          <button
            className="location-button"
            onClick={locate}
            disabled={busy || locating}
          >
            <LocateFixed size={18} />
            {locating ? "กำลังรับตำแหน่ง…" : "ใช้ตำแหน่งปัจจุบัน"}
          </button>
          <div className="divider">
            <span>หรือกรอกพิกัด</span>
          </div>
          <form onSubmit={calculate}>
            <label htmlFor="latitude">Latitude</label>
            <input
              id="latitude"
              type="number"
              min="-90"
              max="90"
              step="any"
              required
              placeholder="-90 ถึง 90"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              disabled={busy || locating}
            />
            <label htmlFor="longitude">Longitude</label>
            <input
              id="longitude"
              type="number"
              min="-180"
              max="180"
              step="any"
              required
              placeholder="-180 ถึง 180"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              disabled={busy || locating}
            />
            <div className="destination">
              <span className="destination-dot" />
              <div>
                <strong>บริษัท</strong>
                <p>ปลายทางคงที่ที่กำหนดใน API</p>
              </div>
              <Car size={20} />
            </div>
            <button className="calculate-button" disabled={busy || locating}>
              <Route size={18} />
              {busy ? "กำลังคำนวณเส้นทาง…" : "คำนวณเส้นทาง"}
              <ArrowUpRight size={18} />
            </button>
          </form>
          <p className="small-note">
            คำนวณใหม่ทุกครั้งที่กด · อนุญาตทางด่วน · หลีกเลี่ยงเรือข้ามฟาก
          </p>
          <div aria-live="polite">
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
          </div>
        </section>
        <section className="map-card">
          <div className="map-heading">
            <div className="section-title">
              <Route size={20} />
              <h2>เส้นทางการเดินทาง</h2>
            </div>
            <span className="mode-tag">
              <Car size={15} /> รถยนต์
            </span>
          </div>
          {result ? (
            <RouteMap
              key={result.encodedPolyline}
              encodedPolyline={result.encodedPolyline}
            />
          ) : (
            <div className="map-placeholder">
              <span className="placeholder-icon">
                <Navigation size={34} />
              </span>
              <strong>
                {busy ? "กำลังหาเส้นทางไปบริษัท" : "เริ่มจากตำแหน่งของคุณ"}
              </strong>
              <p>เส้นทางจะแสดงบน Google Maps หลังคำนวณสำเร็จ</p>
            </div>
          )}
          <div className="route-stats">
            <div>
              <span>
                <Route size={16} /> ระยะทาง
              </span>
              <strong>
                {result
                  ? (result.distanceMeters / 1000).toLocaleString("th-TH", {
                      maximumFractionDigits: 2,
                    })
                  : "—"}
                <small> กม.</small>
              </strong>
            </div>
            <div>
              <span>
                <Timer size={16} /> เวลาเดินทางโดยประมาณ
              </span>
              <strong>
                {result
                  ? Math.ceil(result.durationSeconds / 60).toLocaleString(
                      "th-TH",
                    )
                  : "—"}
                <small> นาที</small>
              </strong>
            </div>
          </div>
          <p className="result-time">
            {calculatedAt
              ? `ได้รับผลเมื่อ ${calculatedAt} · เวลาเดินทางเป็นค่าประมาณตามจราจร`
              : "ออกเดินทางทันทีที่เรียก API"}
          </p>
        </section>
      </div>
      <section className="response-card">
        <div className="response-heading">
          <h2>API response</h2>
          <code>POST /api/routes/company</code>
        </div>
        <pre>{response || "// ผลลัพธ์ JSON จะแสดงที่นี่หลังเรียก API"}</pre>
      </section>
      <footer>
        Google Routes API · Traffic aware · Fixed company destination
      </footer>
    </main>
  );
}
