// ═══════════ منتقي الموقع — React Leaflet + OpenStreetMap + Geolocation API ═══════════
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// إصلاح مسارات أيقونة Leaflet الافتراضية مع Vite
const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const DEFAULT_CENTER = [15.3694, 44.191] // صنعاء
const round = (n) => Number(n.toFixed(6))

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(round(e.latlng.lat), round(e.latlng.lng)) })
  return null
}

function Recenter({ position }) {
  const map = useMap()
  const key = position ? `${position[0]},${position[1]}` : ''
  const last = useRef('')
  useEffect(() => {
    if (position && key !== last.current) {
      last.current = key
      map.setView(position, Math.max(map.getZoom(), 16))
    }
  }, [key, position, map])
  return null
}

/**
 * @param {{lat:number|null, lng:number|null, onChange:(lat:number,lng:number)=>void}} props
 */
export default function LocationPicker({ lat, lng, accuracy, onChange }) {
  const position = lat != null && lng != null ? [lat, lng] : null
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 h-[320px] relative z-0" dir="ltr">
      <MapContainer
        center={position || DEFAULT_CENTER}
        zoom={position ? 16 : 6}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        <Recenter position={position} />
        {position && accuracy != null && <Circle center={position} radius={accuracy} pathOptions={{ weight: 1 }} />}
        {position && (
          <Marker
            position={position}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng()
                onChange(round(p.lat), round(p.lng))
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
