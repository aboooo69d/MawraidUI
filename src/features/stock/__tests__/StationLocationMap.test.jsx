// @vitest-environment jsdom
import { StrictMode } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import StationLocationMap from '../components/StationLocationMap'

const leaflet = vi.hoisted(() => ({ handlers: {}, tileHandlers: {}, markerHandlers: {} }))
vi.mock('leaflet', () => ({ default: {
  map: (...args) => leaflet.createMap(...args),
  tileLayer: (...args) => leaflet.createTiles(...args),
  marker: (...args) => leaflet.createMarker(...args),
  icon: (options) => options,
  control: { zoom: (...args) => leaflet.createZoom(...args) },
} }))

const latlng = (lat, lng) => ({ lat, lng, wrap: () => ({ lat, lng }) })

beforeEach(() => {
  leaflet.handlers = {}
  leaflet.tileHandlers = {}
  leaflet.markerHandlers = {}
  const handler = () => ({ enable: vi.fn(), disable: vi.fn() })
  leaflet.map = {
    on: vi.fn((event, fn) => { leaflet.handlers[event] = fn }),
    panTo: vi.fn(), remove: vi.fn(), invalidateSize: vi.fn(), getCenter: () => latlng(13.5, 44.1),
    dragging: handler(), touchZoom: handler(), doubleClickZoom: handler(), boxZoom: handler(), keyboard: handler(),
  }
  leaflet.tiles = {
    on: vi.fn((event, fn) => { leaflet.tileHandlers[event] = fn }),
    addTo: vi.fn(), redraw: vi.fn(),
  }
  leaflet.marker = {
    addTo: vi.fn().mockReturnThis(),
    on: vi.fn((event, fn) => { leaflet.markerHandlers[event] = fn }),
    setLatLng: vi.fn(), getLatLng: () => latlng(14.2, 45.3), remove: vi.fn(), dragging: handler(),
  }
  leaflet.createMap = vi.fn(() => leaflet.map)
  leaflet.createTiles = vi.fn(() => leaflet.tiles)
  leaflet.createMarker = vi.fn(() => leaflet.marker)
  leaflet.createZoom = vi.fn(() => ({ addTo: vi.fn() }))
})

afterEach(() => vi.restoreAllMocks())

async function setup(props = {}) {
  const onSelect = vi.fn()
  const onReadyChange = vi.fn()
  const options = { position: null, onSelect, onReadyChange, ...props }
  const view = render(<StationLocationMap {...options} />)
  await waitFor(() => expect(onReadyChange).toHaveBeenLastCalledWith(true))
  return { ...view, onSelect, onReadyChange, options }
}

describe('Leaflet map integration', () => {
  it('uses OSM with attribution, selects on click and supports choosing map center', async () => {
    const { onSelect } = await setup()
    expect(leaflet.createTiles).toHaveBeenCalledWith('https://tile.openstreetmap.org/{z}/{x}/{y}.png', expect.objectContaining({ attribution: expect.stringContaining('openstreetmap.org/copyright'), noWrap: true }))
    expect(leaflet.createMarker).not.toHaveBeenCalled()
    act(() => leaflet.handlers.click({ latlng: latlng(13.1, 44.2) }))
    expect(onSelect).toHaveBeenLastCalledWith({ lat: 13.1, lng: 44.2 })
    fireEvent.click(screen.getByText('اختيار مركز الخريطة'))
    expect(onSelect).toHaveBeenLastCalledWith({ lat: 13.5, lng: 44.1 })
  })

  it('places the selected marker, emits drag coordinates, and follows GPS/prop updates', async () => {
    const { onSelect, rerender, options } = await setup({ position: { lat: 13, lng: 44 } })
    expect(leaflet.createMarker).toHaveBeenCalledWith([13, 44], expect.objectContaining({ draggable: true, icon: expect.objectContaining({ iconUrl: expect.stringContaining('marker-icon.png') }) }))
    act(() => leaflet.markerHandlers.dragend())
    expect(onSelect).toHaveBeenCalledWith({ lat: 14.2, lng: 45.3 })
    rerender(<StationLocationMap {...options} position={{ lat: 15, lng: 46 }} />)
    expect(leaflet.marker.setLatLng).toHaveBeenLastCalledWith([15, 46])
    expect(leaflet.map.panTo).toHaveBeenLastCalledWith([15, 46])
    rerender(<StationLocationMap {...options} position={null} />)
    expect(leaflet.marker.remove).toHaveBeenCalledOnce()
  })

  it('shows tile loading and failure states with a retry preserving selection', async () => {
    await setup({ position: { lat: 13, lng: 44 } })
    expect(screen.getByText('جارٍ تحميل تفاصيل الخريطة…')).toBeTruthy()
    act(() => { leaflet.tileHandlers.tileerror(); leaflet.tileHandlers.load() })
    expect(screen.queryByText('جارٍ تحميل تفاصيل الخريطة…')).toBeNull()
    expect(screen.getByRole('alert').textContent).toContain('تعذر تحميل بعض')
    fireEvent.click(screen.getByText('إعادة تحميل التفاصيل'))
    expect(leaflet.tiles.redraw).toHaveBeenCalledOnce()
    expect(leaflet.marker.remove).not.toHaveBeenCalled()
  })

  it('recovers from initialization failure without an automatic GPS request', async () => {
    leaflet.createMap.mockImplementationOnce(() => { throw new Error('unavailable') })
    const onReadyChange = vi.fn()
    render(<StationLocationMap position={null} onSelect={vi.fn()} onReadyChange={onReadyChange} />)
    expect(screen.getByText('جارٍ تحميل الخريطة…')).toBeTruthy()
    await screen.findByText('إعادة تحميل الخريطة')
    expect(onReadyChange).toHaveBeenLastCalledWith(false)
    fireEvent.click(screen.getByText('إعادة تحميل الخريطة'))
    await waitFor(() => expect(onReadyChange).toHaveBeenLastCalledWith(true))
  })

  it('blocks changes while saving and cleans up listeners/map on unmount', async () => {
    const { onSelect, rerender, options, unmount } = await setup({ position: { lat: 13, lng: 44 } })
    rerender(<StationLocationMap {...options} disabled />)
    expect(leaflet.map.dragging.disable).toHaveBeenCalled()
    expect(leaflet.marker.dragging.disable).toHaveBeenCalled()
    act(() => { leaflet.handlers.click({ latlng: latlng(14, 45) }); leaflet.markerHandlers.dragend() })
    fireEvent.click(screen.getByText('اختيار مركز الخريطة'))
    expect(onSelect).not.toHaveBeenCalled()
    unmount()
    expect(leaflet.map.remove).toHaveBeenCalledOnce()
  })

  it('survives React StrictMode initialization without leaking a second map', async () => {
    const onReadyChange = vi.fn()
    const { unmount } = render(<StrictMode><StationLocationMap position={null} onSelect={vi.fn()} onReadyChange={onReadyChange} /></StrictMode>)
    await waitFor(() => expect(onReadyChange).toHaveBeenLastCalledWith(true))
    expect(leaflet.createMap).toHaveBeenCalledOnce()
    unmount()
    expect(leaflet.map.remove).toHaveBeenCalledOnce()
  })
})
