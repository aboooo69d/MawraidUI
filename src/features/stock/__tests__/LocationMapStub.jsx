import { useEffect } from 'react'

// Test the picker and API independently of Leaflet's DOM geometry and tile network.
export default function LocationMapStub({ onSelect, onReadyChange, disabled }) {
  useEffect(() => { onReadyChange(true) }, [onReadyChange])
  return (
    <div aria-label="test map">
      <button type="button" disabled={disabled} onClick={() => onSelect({ lat: 13.5795, lng: 44.0209 })}>select station A</button>
      <button type="button" disabled={disabled} onClick={() => onSelect({ lat: 15.3694567, lng: 44.1910123 })}>drag to station B</button>
      <button type="button" disabled={disabled} onClick={() => onSelect({ lat: 91, lng: 44 })}>invalid coordinates</button>
      <button type="button" disabled={disabled} onClick={() => onSelect({ lat: 0, lng: 0 })}>select zero</button>
    </div>
  )
}
