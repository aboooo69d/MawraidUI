import { useEffect, useRef, useState } from 'react'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import './station-location.css'

const TAIZ_CENTER = [13.5795, 44.0209]

// Leaflet is loaded on demand. No location permission or backend request is made here.
export default function StationLocationMap({ position, onSelect, onReadyChange, disabled = false }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const tilesRef = useRef(null)
  const updateMarkerRef = useRef(null)
  const latest = useRef({ position, onSelect, onReadyChange, disabled })
  latest.current = { position, onSelect, onReadyChange, disabled }
  const [status, setStatus] = useState('loading')
  const [tilesLoading, setTilesLoading] = useState(true)
  const [tileError, setTileError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    let map
    let observer
    let updateMarker
    latest.current.onReadyChange(false)
    setStatus('loading')
    setTilesLoading(true)
    setTileError(false)

    async function initialize() {
      try {
        const { default: L } = await import('leaflet')
        if (!active) return
        const initial = latest.current.position
        map = L.map(containerRef.current, {
          center: initial ? [initial.lat, initial.lng] : TAIZ_CENTER,
          zoom: initial ? 16 : 11,
          scrollWheelZoom: false,
          zoomControl: false,
          maxBounds: [[-85, -180], [85, 180]],
        })
        mapRef.current = map
        L.control.zoom({ position: 'topleft', zoomInTitle: 'تكبير', zoomOutTitle: 'تصغير' }).addTo(map)
        const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          noWrap: true,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        })
        tilesRef.current = tiles
        tiles.on('loading', () => { if (active) setTilesLoading(true) })
        tiles.on('load', () => { if (active) setTilesLoading(false) })
        tiles.on('tileerror', () => { if (active) setTileError(true) })
        tiles.addTo(map)
        const icon = L.icon({
          iconUrl: markerIcon, iconRetinaUrl: markerIconRetina, shadowUrl: markerShadow,
          iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
        })
        const select = (latlng) => {
          if (!latest.current.disabled) {
            latest.current.onSelect({ lat: latlng.lat, lng: latlng.wrap().lng })
          }
        }
        map.on('click', (event) => select(event.latlng))
        updateMarker = (next) => {
          if (!next) {
            markerRef.current?.remove()
            markerRef.current = null
            return
          }
          if (!markerRef.current) {
            const marker = L.marker([next.lat, next.lng], {
              icon, draggable: !latest.current.disabled, autoPan: true,
              title: 'موقع المحطة — اسحب العلامة لتصحيحه', alt: 'موقع المحطة المحدد',
            }).addTo(map)
            marker.on('dragend', () => select(marker.getLatLng()))
            markerRef.current = marker
          } else {
            markerRef.current.setLatLng([next.lat, next.lng])
          }
          map.panTo([next.lat, next.lng])
        }
        updateMarkerRef.current = updateMarker
        updateMarker(latest.current.position)
        if (typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(() => map.invalidateSize())
          observer.observe(containerRef.current)
        }
        setStatus('ready')
        latest.current.onReadyChange(true)
      } catch {
        if (active) {
          setStatus('error')
          latest.current.onReadyChange(false)
        }
      }
    }
    initialize()
    return () => {
      active = false
      observer?.disconnect()
      map?.remove()
      mapRef.current = null
      markerRef.current = null
      tilesRef.current = null
      updateMarkerRef.current = null
    }
  }, [attempt])

  useEffect(() => {
    updateMarkerRef.current?.(position)
  }, [position])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    for (const handler of [map.dragging, map.touchZoom, map.doubleClickZoom, map.boxZoom, map.keyboard]) {
      if (disabled) handler.disable()
      else handler.enable()
    }
    if (disabled) markerRef.current?.dragging.disable()
    else markerRef.current?.dragging.enable()
  }, [disabled, status, position])

  return (
    <div className="station-location-map-panel" data-disabled={disabled || undefined}>
      <div
        ref={containerRef}
        className="station-location-map"
        role="region"
        aria-label="خريطة اختيار موقع المحطة"
        aria-describedby="station-map-help"
        aria-busy={status === 'loading'}
      />
      {status === 'loading' && <p role="status" className="station-map-notice">جارٍ تحميل الخريطة…</p>}
      {status === 'error' && (
        <div role="alert" className="station-map-notice">
          تعذر تحميل الخريطة. تحقق من الاتصال ثم أعد المحاولة.
          <button type="button" disabled={disabled} onClick={() => setAttempt((n) => n + 1)}>إعادة تحميل الخريطة</button>
        </div>
      )}
      {status === 'ready' && (
        <>
          {tilesLoading && <p role="status" className="station-map-notice">جارٍ تحميل تفاصيل الخريطة…</p>}
          {tileError && (
            <div role="alert" className="station-map-notice">
              تعذر تحميل بعض تفاصيل الخريطة. تحقق من الاتصال وأعد التحميل قبل تأكيد الموقع.
              <button type="button" disabled={disabled} onClick={() => { setTileError(false); tilesRef.current?.redraw() }}>إعادة تحميل التفاصيل</button>
            </div>
          )}
          <button
            type="button"
            className="station-map-center-button"
            disabled={disabled}
            onClick={() => {
              const center = mapRef.current.getCenter()
              latest.current.onSelect({ lat: center.lat, lng: center.wrap().lng })
            }}
          >اختيار مركز الخريطة</button>
        </>
      )}
    </div>
  )
}
