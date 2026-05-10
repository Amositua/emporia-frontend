import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Search, Truck, Share2, MapPin, ShieldCheck, Loader2, AlertCircle, Clock } from 'lucide-react';
import { useDriverTrades, useConfirmDelivery } from '../../hooks/useProfile';
import { driverApi } from '../../lib/api';

/* ── Helpers ── */
function formatTime(timeStr) {
  if (!timeStr) return '—';
  try {
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    return `${hr % 12 || 12}:${m} ${ampm}`;
  } catch { return timeStr; }
}

/* ── Real Google Map Panel ──
   Shows:
     • Driver's live GPS location (from driverApi, polled every 5 min)
     • Delivery address pin (geocoded from trade.deliveryAddress)
     • DRIVING route between the two
   When `trade` changes, old markers + route are cleared and new ones placed. */
function MapPanel({ trade }) {
  const mapRef             = useRef(null);
  const mapObj             = useRef(null);
  const infoWin            = useRef(null);
  const geocoderRef        = useRef(null);
  const directionsService  = useRef(null);
  const directionsRenderer = useRef(null);
  const fallbackPolyline   = useRef(null);
  const driverMarker       = useRef(null);
  const destMarker         = useRef(null);
  const pendingIdRef       = useRef(null);

  /* 'idle' | 'available' | 'unavailable' */
  const [driverStatus, setDriverStatus] = useState('idle');

  const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 };

  /* ── Init map once ── */
  useEffect(() => {
    if (!mapRef.current || mapObj.current || !window.google?.maps) return;

    mapObj.current = new window.google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
    });

    infoWin.current     = new window.google.maps.InfoWindow();
    geocoderRef.current = new window.google.maps.Geocoder();

    directionsService.current  = new window.google.maps.DirectionsService();
    directionsRenderer.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers:  true,
      preserveViewport: true,
      polylineOptions: { strokeColor: '#ef4444', strokeOpacity: 0.85, strokeWeight: 5 },
    });
    directionsRenderer.current.setMap(mapObj.current);
  }, []);

  /* ── drawRoute ── */
  const drawRoute = useCallback((driverPos, destPos) => {
    if (!mapObj.current || !window.google?.maps) return;
    if (fallbackPolyline.current) { fallbackPolyline.current.setMap(null); fallbackPolyline.current = null; }
    if (!directionsService.current || !directionsRenderer.current) return;

    directionsService.current.route(
      { origin: driverPos, destination: destPos, travelMode: window.google.maps.TravelMode.DRIVING },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.current.setDirections(result);
        } else {
          directionsRenderer.current.setDirections({ routes: [] });
          fallbackPolyline.current = new window.google.maps.Polyline({
            path: [driverPos, destPos],
            map: mapObj.current,
            strokeColor: '#ef4444', strokeOpacity: 0, strokeWeight: 0,
            icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: '#ef4444', strokeWeight: 4, scale: 5 }, offset: '0', repeat: '18px' }],
          });
        }
      }
    );
  }, []);

  /* ── clearAll ── */
  const clearAll = useCallback(() => {
    if (directionsRenderer.current) directionsRenderer.current.setDirections({ routes: [] });
    if (fallbackPolyline.current)   { fallbackPolyline.current.setMap(null); fallbackPolyline.current = null; }
    if (driverMarker.current)       { driverMarker.current.setMap(null); driverMarker.current = null; }
    if (destMarker.current)         { destMarker.current.setMap(null);   destMarker.current   = null; }
    pendingIdRef.current = null;
  }, []);

  /* ── Rebuild markers whenever the selected trade changes ── */
  useEffect(() => {
    if (!mapObj.current || !window.google?.maps || !trade) return;

    clearAll();
    setDriverStatus('idle');

    const tradeId = trade.tradeId;

    /* Place destination marker (geocode address) */
    const placeDestination = () => {
      if (!trade.deliveryAddress || !geocoderRef.current) return;
      geocoderRef.current.geocode({ address: trade.deliveryAddress }, (res, status) => {
        if (status !== 'OK' || !res?.[0]?.geometry?.location) return;
        if (!mapObj.current) return;
        
        // Match the 'pending ID' solution used for arrows to prevent duplicates
        if (pendingIdRef.current !== trade.tradeId) return;

        const pos = res[0].geometry.location;

        destMarker.current = new window.google.maps.Marker({
          position: pos,
          map: mapObj.current,
          title: `Destination: ${trade.deliveryAddress}`,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 7, fillColor: '#1d4ed8', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2.5, rotation: 0,
          },
          animation: window.google.maps.Animation.DROP,
          zIndex: 10,
        });

        destMarker.current.addListener('click', () => {
          infoWin.current?.setContent(`
            <div style="font-family:sans-serif;padding:6px 4px;min-width:180px">
              <p style="margin:0 0 4px;font-size:10px;font-weight:900;color:#1d4ed8;text-transform:uppercase">📍 Delivery Address</p>
              <p style="margin:0;font-size:12px;font-weight:700;color:#0f172a">${trade.deliveryAddress}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#475569">👤 ${trade.buyerName ?? '—'}</p>
            </div>
          `);
          infoWin.current?.open(mapObj.current, destMarker.current);
        });

        /* If driver marker is already placed, draw route */
        if (driverMarker.current) {
          drawRoute(driverMarker.current.getPosition(), pos);
          setDriverStatus('available');
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(driverMarker.current.getPosition());
          bounds.extend(pos);
          mapObj.current.fitBounds(bounds, { top: 80, right: 60, bottom: 60, left: 60 });
        } else {
          setDriverStatus('unavailable');
          mapObj.current.panTo(pos);
          mapObj.current.setZoom(15);
        }
      });
    };

    /* Place driver marker from GPS */
    const placeDriver = () => {
      const loc = driverApi.getDriverLocation(tradeId);
      if (!loc?.lat || !loc?.lng) return;

      // Only place if this is still the pending trade
      if (pendingIdRef.current !== tradeId) return;

      if (driverMarker.current) {
        driverMarker.current.setPosition({ lat: loc.lat, lng: loc.lng });
        /* Redraw route from new position */
        if (destMarker.current) drawRoute({ lat: loc.lat, lng: loc.lng }, destMarker.current.getPosition());
        return;
      }

      driverMarker.current = new window.google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map: mapObj.current,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 14, fillColor: '#ef4444', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 3,
        },
        label: { text: '🚛', fontSize: '14px' },
        animation: window.google.maps.Animation.DROP,
        zIndex: 20,
      });

      driverMarker.current.addListener('click', () => {
        infoWin.current?.setContent(`
          <div style="font-family:sans-serif;padding:6px 4px;min-width:160px">
            <p style="margin:0 0 4px;font-size:10px;font-weight:900;color:#ef4444;text-transform:uppercase">🚛 Your Location</p>
            <p style="margin:0;font-size:11px;color:#475569">${trade.goods ?? '—'}</p>
            <p style="margin:4px 0 0;font-size:10px;color:#94a3b8">Live GPS</p>
          </div>
        `);
        infoWin.current?.open(mapObj.current, driverMarker.current);
      });

      /* If dest is already placed, draw route + fit */
      if (destMarker.current) {
        drawRoute({ lat: loc.lat, lng: loc.lng }, destMarker.current.getPosition());
        setDriverStatus('available');
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: loc.lat, lng: loc.lng });
        bounds.extend(destMarker.current.getPosition());
        mapObj.current.fitBounds(bounds, { top: 80, right: 60, bottom: 60, left: 60 });
      }
    };

    pendingIdRef.current = tradeId;
    placeDriver();
    placeDestination();

    /* Poll GPS every 5 seconds (Live) */
    const interval = setInterval(() => {
      const loc = driverApi.getDriverLocation(tradeId);
      if (loc?.lat && loc?.lng && driverMarker.current) {
        driverMarker.current.setPosition({ lat: loc.lat, lng: loc.lng });
        if (destMarker.current) drawRoute({ lat: loc.lat, lng: loc.lng }, destMarker.current.getPosition());
      }
    }, 5000);

    return () => { clearInterval(interval); clearAll(); };
  }, [trade?.tradeId, clearAll, drawRoute]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative bg-slate-100 rounded-xl overflow-hidden" style={{ minHeight: 300 }}>
      <div ref={mapRef} className="absolute inset-0" />

      {/* Legend */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 px-3 py-2.5 z-10 space-y-1.5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Legend</p>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[9px]">🚛</div>
          <span className="text-[10px] font-semibold text-slate-700">Your Location</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-blue-700"><path d="M12 2L7 21l5-3 5 3z"/></svg>
          </div>
          <span className="text-[10px] font-semibold text-slate-700">Delivery Address</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-1 rounded-full bg-red-400" />
          <span className="text-[10px] font-semibold text-slate-700">Route</span>
        </div>
      </div>

      {/* GPS unavailable banner */}
      {driverStatus === 'unavailable' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 shadow-md">
          <span className="text-sm">📡</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">GPS unavailable</p>
            <p className="text-[9px] font-medium text-amber-600">Location not shared yet</p>
          </div>
        </div>
      )}

      {/* ETA overlay */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow z-10">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">ETA</p>
        <p className="text-base font-black text-slate-900">{formatTime(trade?.deliveryTime)}</p>
      </div>
    </div>
  );
}

/* ── Delivery Log ── */
function DeliveryLog({ tradeStatus }) {
  const steps = [
    { key: 'pickup',   label: 'Pickup Confirmed', sub: 'Seller Location', done: true,  live: false },
    // { key: 'transit',  label: 'In Transit',        sub: 'En Route',        done: ['IN_TRANSIT','DELIVERED','COMPLETED'].includes(tradeStatus), live: false },
    { key: 'onroute',  label: 'On-route',           sub: 'Live tracking',   done: false, live: ['IN_TRANSIT','ACTIVE'].includes(tradeStatus) },
    { key: 'arrival',  label: 'Arrival at Hub',     sub: 'Destination',     done: ['DELIVERED','COMPLETED'].includes(tradeStatus), live: false },
  ];

  const times = ['', '', null, null];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-700 mb-5">Delivery Log</h3>
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex items-start gap-3">
            {/* Icon */}
            {step.live ? (
              <div className="relative flex-shrink-0 mt-0.5">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center z-10 relative">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="w-6 h-6 rounded-full bg-red-400 opacity-30 animate-ping absolute inset-0" />
              </div>
            ) : step.done ? (
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
            )}

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-xs font-bold ${step.live ? 'text-red-600' : step.done ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.label}
                  {step.live && (
                    <span className="ml-2 text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-widest">
                      Live
                    </span>
                  )}
                </p>
                {times[idx] && <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{times[idx]}</span>}
              </div>
              <p className={`text-[10px] mt-0.5 ${step.done || step.live ? 'text-slate-500' : 'text-slate-300'}`}>{step.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shipment List Item ── */
function ShipmentItem({ trade, isSelected, onClick }) {
  const isLive = ['IN_TRANSIT', 'ACTIVE'].includes(trade.tradeStatus);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 transition ${
        isSelected ? 'bg-red-50 border-l-4 border-l-red-500' : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-black text-slate-800 font-mono">#{trade.tradeId?.toUpperCase()}</span>
        {isLive && (
          <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase tracking-widest">
            Live
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 mb-1">
        <Truck className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <span className="text-[10px] text-slate-500 truncate">{trade.sellerName || 'Seller'} → {trade.buyerName}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{trade.tradeStatus?.replace(/_/g, ' ')}</span>
        <span className="text-[10px] text-slate-400">ETA {formatTime(trade.deliveryTime)}</span>
      </div>
    </button>
  );
}

/* ── Main Component ── */
export function DriverActiveShipmentsTab() {
  const { data, isLoading, error } = useDriverTrades();
  const [search, setSearch]    = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [code, setCode]        = useState(Array(4).fill(''));
  const inputRefs              = useRef([]);
  const confirmDeliveryMutation = useConfirmDelivery();

  const activeTrades = useMemo(() => {
    const all = data?.dashboardRecords ?? [];
    return all.filter((t) => ['ACTIVE', 'IN_TRANSIT', 'BUYER_JOINED', 'DRIVER_ASSIGNED'].includes(t.tradeStatus));
  }, [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return activeTrades;
    const q = search.toLowerCase();
    return activeTrades.filter(
      (t) => t.tradeId?.toLowerCase().includes(q) || t.sellerName?.toLowerCase().includes(q)
    );
  }, [activeTrades, search]);

  const selected = useMemo(() => {
    if (selectedId) return filtered.find((t) => t.tradeId === selectedId) ?? filtered[0];
    return filtered[0] ?? null;
  }, [filtered, selectedId]);

  const handleCodeChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < 3) inputRefs.current[idx + 1]?.focus();
  };

  const handleCodeKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleConfirmDelivery = async () => {
    if (!selected || code.some(d => !d)) return;
    
    const deliveryCode = code.join('');
    try {
      await confirmDeliveryMutation.mutateAsync({
        tradeId: selected.tradeId,
        deliveryCode
      });
      alert('Delivery confirmed successfully!');
      setCode(Array(4).fill(''));
    } catch (err) {
      console.error('Delivery confirmation failed:', err);
      alert(`Confirmation failed: ${err.message || 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">Failed to load active shipments. Please refresh.</p>
      </div>
    );
  }

  if (activeTrades.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 py-20 text-center shadow-sm">
        <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400 text-sm font-medium">No active shipments at this time.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ minHeight: 600 }}>

      {/* ── Left sidebar ── */}
      <div className="w-64 flex-shrink-0 border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Active Shipments</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Trade ID, Seller Name"
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-10">No results.</p>
          ) : (
            filtered.map((trade) => (
              <ShipmentItem
                key={trade.tradeId}
                trade={trade}
                isSelected={selected?.tradeId === trade.tradeId}
                onClick={() => setSelectedId(trade.tradeId)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Main panel ── */}
      {selected ? (
        <div className="flex-1 p-6 overflow-y-auto space-y-5">

          {/* Title row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Shipment #{selected.tradeId?.toUpperCase()}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {selected.tradeStatus?.replace(/_/g, ' ')}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" /> Last updated: 2 mins ago
                </span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition flex-shrink-0">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>

          {/* Map + Delivery Log (side by side) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
            <MapPanel trade={selected} />
            <DeliveryLog tradeStatus={selected.tradeStatus} />
          </div>

          {/* Destination + Trade Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Destination Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-indigo-600">Destination Details</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shipping Address</p>
                  <p className="text-sm text-slate-700">{selected.deliveryAddress || 'Address not provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Buyer Name</p>
                    <p className="text-sm text-slate-700">{selected.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm font-bold text-slate-800">{selected.buyerPhone || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Overview */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-indigo-600">Trade Overview</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Goods</p>
                    <p className="text-sm text-slate-700">{selected.goods}</p>
                  </div>
                  {/* <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Escrow</p>
                    <p className="text-sm font-bold text-green-600">
                      ${selected.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '—'}
                    </p>
                  </div> */}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seller</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{selected.sellerName || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Confirmation */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Delivery Confirmation Code</p>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex-1 border border-slate-200 rounded-lg px-5 py-3 flex items-center justify-center">
                <div className="flex gap-3">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className="w-10 h-9 rounded border border-slate-300 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition caret-transparent"
                    />
                  ))}
                </div>
              </div>
              <button
                disabled={code.some((d) => !d) || confirmDeliveryMutation.isPending}
                onClick={handleConfirmDelivery}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-lg transition shadow-sm flex-shrink-0 flex items-center justify-center gap-2"
              >
                {confirmDeliveryMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                {confirmDeliveryMutation.isPending ? 'Confirming...' : 'Confirm Delivery'}
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Select a shipment to view details.</p>
        </div>
      )}
    </div>
  );
}
