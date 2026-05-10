import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Search, User, Loader2, AlertCircle } from 'lucide-react';
import { useSellerTrades } from '../../hooks/useProfile';
import { driverApi } from '../../lib/api';

/* ── helpers ── */
const ACTIVE_STATUSES = ['ACTIVE', 'IN_TRANSIT', 'DRIVER_ASSIGNED'];

const STATUS_CONFIG = {
  IN_TRANSIT:      { dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700',   label: 'In Transit' },
  ACTIVE:          { dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700',    label: 'Active' },
  DRIVER_ASSIGNED: { dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700', label: 'Driver Assigned' },
  DELIVERED:       { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700', label: 'Completed' },
  COMPLETED:       { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700', label: 'Completed' },
  BUYER_JOINED:    { dot: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-700', label: 'Buyer Joined' },
};


/* ── Real Google Map ──
   DESIGN: `trades` is the single source of truth for what appears on the map.
   The parent passes ONE trade when selected, ALL trades otherwise.
   The stale-marker cleanup in the sync effect handles removing pins that
   disappear from the list — no show/hide juggling needed at all. */
function GoogleMapPanel({ trades, allTradesCount, selectedTrade, onSelectTrade }) {
  const mapRef      = useRef(null);
  const mapObj      = useRef(null);
  const infoWin     = useRef(null);
  const geocoderRef = useRef(null);

  /* Marker sets: tradeId → google.maps.Marker */
  const driverMarkers = useRef({});
  const destMarkers   = useRef({});

  /* Route rendering — one active route at a time */
  const directionsService  = useRef(null);
  const directionsRenderer = useRef(null);
  const fallbackPolyline   = useRef(null);
  const simulationRef      = useRef(null);

  /* 'idle' | 'available' | 'unavailable' — tracks whether selected trade has driver GPS */
  const [driverStatus, setDriverStatus] = useState('idle');

  const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 };

  /* ── init map once ── */
  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;
    if (!window.google?.maps) return;

    mapObj.current = new window.google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });

    infoWin.current     = new window.google.maps.InfoWindow();
    geocoderRef.current = new window.google.maps.Geocoder();

    /* Directions renderer – styled as a vivid red road path */
    directionsService.current = new window.google.maps.DirectionsService();
    directionsRenderer.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers:  true,    // we manage our own driver / dest markers
      preserveViewport: true,    // never auto-zoom when setDirections() is called
      polylineOptions: {
        strokeColor:   '#ef4444',
        strokeOpacity: 0.85,
        strokeWeight:  5,
      },
    });
    directionsRenderer.current.setMap(mapObj.current);
  }, []);

  /* ── drawRoute: request a DRIVING route between driverPos and destPos ──
     Falls back to a dashed straight-line polyline if Directions fails. */
  const drawRoute = useCallback((driverPos, destPos) => {
    if (!mapObj.current || !window.google?.maps) return;

    /* Clear any previous fallback polyline */
    if (fallbackPolyline.current) {
      fallbackPolyline.current.setMap(null);
      fallbackPolyline.current = null;
    }

    if (!directionsService.current || !directionsRenderer.current) return;

    directionsService.current.route(
      {
        origin:      driverPos,
        destination: destPos,
        travelMode:  window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.current.setDirections(result);
          
          // --- SIMULATION LOGIC ---
          const path = result.routes[0].overview_path;
          const activeTradeId = selectedTrade?.tradeId;
          const marker = driverMarkers.current[activeTradeId];
          
          if (path && path.length > 0 && marker) {
            console.log('[Simulation] Starting Seller-view movement for Trade:', activeTradeId);
            let step = 0;
            if (simulationRef.current) clearInterval(simulationRef.current);
            simulationRef.current = setInterval(() => {
              if (step >= path.length) {
                console.log('[Simulation] Seller-view reached destination.');
                clearInterval(simulationRef.current);
                return;
              }
              marker.setPosition(path[step]);
              step++;
            }, 150);
          }
        } else {
          /* Directions API failed — draw a simple dashed straight line */
          directionsRenderer.current.setDirections({ routes: [] });
          fallbackPolyline.current = new window.google.maps.Polyline({
            path: [driverPos, destPos],
            map: mapObj.current,
            strokeColor:   '#ef4444',
            strokeOpacity: 0,
            strokeWeight:  0,
            icons: [{
              icon: {
                path:         'M 0,-1 0,1',
                strokeOpacity: 1,
                strokeColor:   '#ef4444',
                strokeWeight:  4,
                scale:         5,
              },
              offset: '0',
              repeat: '18px',
            }],
          });
        }
      }
    );
  }, []);

  /* ── clearRoute: remove any active route from the map ── */
  const clearRoute = useCallback(() => {
    if (directionsRenderer.current) {
      directionsRenderer.current.setDirections({ routes: [] });
    }
    if (fallbackPolyline.current) {
      fallbackPolyline.current.setMap(null);
      fallbackPolyline.current = null;
    }
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
  }, []);

  /* ── Geocode and place ONE destination marker for `trade` ── */
  const placeDestMarker = useCallback((trade) => {
    if (!mapObj.current || !geocoderRef.current || !trade?.deliveryAddress) return;

    geocoderRef.current.geocode({ address: trade.deliveryAddress }, (res, status) => {
      if (status !== 'OK' || !res?.[0]?.geometry?.location) return;
      if (!mapObj.current) return;   // component unmounted while geocoding

      /* If the user deselected while geocoding was in-flight, bail out */
      if (!destMarkers.current.__pendingTradeId || destMarkers.current.__pendingTradeId !== trade.tradeId) return;

      const pos = res[0].geometry.location;

      const marker = new window.google.maps.Marker({
        position: pos,
        map: mapObj.current,
        title: `Destination: ${trade.deliveryAddress}`,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 12,
          fillColor: '#1d4ed8',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
          rotation: 0,
        },
        animation: window.google.maps.Animation.DROP,
        zIndex: 10,
      });

      marker.addListener('click', () => {
        infoWin.current?.setContent(`
          <div style="font-family:sans-serif;padding:6px 4px;min-width:200px">
            <p style="margin:0 0 4px;font-size:10px;font-weight:900;color:#1d4ed8;text-transform:uppercase;letter-spacing:.08em">📍 Destination</p>
            <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a">${trade.goods ?? '—'}</p>
            <p style="margin:0;font-size:11px;color:#475569">${trade.deliveryAddress}</p>
            <p style="margin:4px 0 0;font-size:11px;color:#475569">👤 ${trade.buyerName ?? '—'}</p>
          </div>
        `);
        infoWin.current?.open(mapObj.current, marker);
        onSelectTrade?.(trade.tradeId);
      });

      destMarkers.current[trade.tradeId] = marker;
      delete destMarkers.current.__pendingTradeId;   // done

      /* If the driver marker is already on the map, draw the route immediately */
      const dm = driverMarkers.current[trade.tradeId];
      if (dm) drawRoute(dm.getPosition(), pos);
    });
  }, [onSelectTrade, drawRoute]);

  /* ── Place / update driver marker ──
     Accepts an optional selectedTradeId so the route can be redrawn
     whenever the driver moves (every 5s GPS poll). */
  const placeDriverMarker = useCallback((trade, lat, lng, selectedTradeId) => {
    if (!mapObj.current) return;

    if (driverMarkers.current[trade.tradeId]) {
      /* Move the existing marker */
      driverMarkers.current[trade.tradeId].setPosition({ lat, lng });

      /* Redraw route if this is the selected trade and dest marker exists */
      if (selectedTradeId === trade.tradeId) {
        const de = destMarkers.current[trade.tradeId];
        if (de) drawRoute({ lat, lng }, de.getPosition());
      }
      return;
    }

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapObj.current,
      title: `Driver: ${trade.driverName}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 22,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      label: { text: '🚛', fontSize: '22px' },
      animation: window.google.maps.Animation.DROP,
      zIndex: 20,
    });

    marker.addListener('click', () => {
      infoWin.current?.setContent(`
        <div style="font-family:sans-serif;padding:6px 4px;min-width:200px">
          <p style="margin:0 0 4px;font-size:10px;font-weight:900;color:#ef4444;text-transform:uppercase;letter-spacing:.08em">🚛 Driver Location</p>
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a">${trade.driverName ?? 'Driver'}</p>
          <p style="margin:0;font-size:11px;color:#475569">${trade.goods ?? '—'}</p>
          <p style="margin:4px 0 0;font-size:10px;color:#94a3b8">Live GPS — updates every 5s</p>
        </div>
      `);
      infoWin.current?.open(mapObj.current, marker);
      onSelectTrade?.(trade.tradeId);
    });

    driverMarkers.current[trade.tradeId] = marker;

    /* If this is the selected trade and dest marker exists, draw route now */
    if (selectedTradeId === trade.tradeId) {
      const de = destMarkers.current[trade.tradeId];
      if (de) drawRoute({ lat, lng }, de.getPosition());
    }
  }, [onSelectTrade, drawRoute]);

  /* ── Destination marker: show ONLY the selected trade's delivery address ──
     Clears route + dest marker when deselected, places fresh ones when selected. */
  useEffect(() => {
    if (!mapObj.current || !window.google?.maps) return;

    /* Clear ALL dest markers and route */
    clearRoute();
    Object.keys(destMarkers.current).forEach(key => {
      if (key !== '__pendingTradeId') {
        destMarkers.current[key].setMap(null);
      }
      delete destMarkers.current[key];
    });

    if (!selectedTrade) return;   // nothing selected → no dest pin or route

    destMarkers.current.__pendingTradeId = selectedTrade.tradeId;
    placeDestMarker(selectedTrade);
  }, [selectedTrade, placeDestMarker, clearRoute]);

  /* ── Poll driver GPS every 5s ──
     Passes selectedTrade?.tradeId so placeDriverMarker can redraw the route. */
  useEffect(() => {
    if (!mapObj.current || !window.google?.maps) return;

    const poll = () => {
      const targets = selectedTrade ? [selectedTrade] : trades;
      targets.forEach(trade => {
        const loc = driverApi.getDriverLocation(trade.tradeId);
        if (loc?.lat && loc?.lng) {
          placeDriverMarker(trade, loc.lat, loc.lng, selectedTrade?.tradeId);
        }
      });
    };

    poll();
    const interval = setInterval(poll, 5000);  // refresh every 5 seconds (Live GPS)

    return () => {
      clearInterval(interval);
      const targets = selectedTrade ? [selectedTrade] : trades;
      const currentIds = new Set(targets.map(t => t.tradeId));
      Object.keys(driverMarkers.current).forEach(id => {
        if (!currentIds.has(id)) {
          driverMarkers.current[id].setMap(null);
          delete driverMarkers.current[id];
        }
      });
    };
  }, [trades, placeDriverMarker, selectedTrade]);

  /* ── Pan/fit map and draw route 900ms after selecting a trade ──
     By 900ms, geocoding and the initial poll have both had time to complete,
     so both dm and de are reliably available. This is the definitive moment
     to draw the route — covers any async timing edge cases. */
  useEffect(() => {
    /* Reset driver status whenever the selected trade changes */
    setDriverStatus(selectedTrade ? 'idle' : 'idle');
    if (!selectedTrade || !mapObj.current || !window.google?.maps) return;

    const tid   = selectedTrade.tradeId;
    const timer = setTimeout(() => {
      const dm = driverMarkers.current[tid];
      const de = destMarkers.current[tid];

      if (dm && de) {
        setDriverStatus('available');
        /* Draw / redraw the route now that both endpoints are confirmed present */
        drawRoute(dm.getPosition(), de.getPosition());

        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(dm.getPosition());
        bounds.extend(de.getPosition());
        mapObj.current.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
      } else if (de) {
        /* Destination exists but no driver GPS — tell the user */
        setDriverStatus('unavailable');
        mapObj.current.panTo(de.getPosition());
        mapObj.current.setZoom(15);
        de.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => de.setAnimation(null), 1400);
      } else if (dm) {
        setDriverStatus('available');
        /* Only driver marker — pan to it */
        mapObj.current.panTo(dm.getPosition());
        mapObj.current.setZoom(15);
        dm.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => dm.setAnimation(null), 1400);
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [selectedTrade, drawRoute]);

  return (
    <div className="relative flex-1" style={{ minHeight: 500 }}>
      <div ref={mapRef} className="absolute inset-0" />

      {/* Stat overlay – top-right */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 overflow-hidden text-xs z-10">
        <div className="flex items-center justify-between gap-8 px-5 py-3">
          <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Active Trades</span>
          <span className="font-black text-slate-900 text-base">{allTradesCount}</span>
        </div>
      </div>

      {/* Legend overlay – top-left */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 px-4 py-3 z-10 space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Map Legend</p>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px]">🚛</div>
          <span className="text-[10px] font-semibold text-slate-700">Driver (Live GPS)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-blue-700"><path d="M12 2L7 21l5-3 5 3z"/></svg>
          </div>
          <span className="text-[10px] font-semibold text-slate-700">Destination</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-1.5 rounded-full bg-red-400" />
          <span className="text-[10px] font-semibold text-slate-700">Route (road path)</span>
        </div>
      </div>

      {/* Driver location unavailable banner */}
      {driverStatus === 'unavailable' && selectedTrade && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 shadow-md">
          <span className="text-base">📡</span>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">Driver GPS unavailable</p>
            <p className="text-[10px] font-medium text-amber-600">
              {selectedTrade.driverName && selectedTrade.driverName !== 'Unassigned'
                ? `${selectedTrade.driverName} hasn't shared their location yet`
                : 'No driver assigned or location not shared'}
            </p>
          </div>
        </div>
      )}

      {/* Route Analysis overlay – bottom-right */}
      {selectedTrade && (
        <div className="absolute bottom-4 right-4 z-10 w-64">
          <RouteAnalysis trade={selectedTrade} hasDriverLocation={driverStatus === 'available'} />
        </div>
      )}
    </div>
  );
}


/* ── Shipment list card ── */
function ShipmentCard({ trade, isSelected, onClick }) {
  const cfg   = STATUS_CONFIG[trade.tradeStatus] ?? { badge: 'bg-slate-100 text-slate-600', label: trade.tradeStatus };
  const isLive = ACTIVE_STATUSES.includes(trade.tradeStatus);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition mb-2 ${
        isSelected
          ? 'border-red-300 bg-red-50/50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
      }`}
    >
      {/* Row 1: trade ID + status badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded border ${
          isSelected ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {trade.tradeId?.toUpperCase()}
        </span>
        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.badge}`}>
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
          {cfg.label}
        </span>
      </div>

      {/* Goods */}
      <div className="mb-2">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Goods Name</p>
        <p className="text-sm font-bold text-slate-800 truncate">{trade.goods || '—'}</p>
      </div>

      {/* Driver */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
          <User className="w-3 h-3 text-slate-400" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Driver Name</p>
          <p className="text-xs font-bold text-slate-800">{trade.driverName && trade.driverName !== 'Unassigned' ? trade.driverName : 'Unassigned'}</p>
        </div>
      </div>
    </button>
  );
}

/* ── Route Analysis Panel ── */
function RouteAnalysis({ trade, hasDriverLocation }) {
  if (!trade) return null;

  return (
    <div className="bg-slate-900 rounded-xl p-5 text-white mt-2">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Route Analysis</p>

      <div className="space-y-3 mb-5">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-500 mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Trade ID</p>
            <p className="text-sm font-black text-white font-mono">{trade.tradeId?.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-white mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Goods Name</p>
            <p className="text-sm font-black text-white">{trade.goods || '—'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-700 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold">Buyer Name</span>
          <span className="text-xs font-bold text-white">{trade.buyerName || '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold">Driver Name</span>
          <span className="text-xs font-bold text-white">
            {trade.driverName && trade.driverName !== 'Unassigned' ? trade.driverName : 'Unassigned'}
          </span>
        </div>
        {trade.deliveryAddress && (
          <div className="flex items-start justify-between gap-2 pt-1">
            <span className="text-[10px] text-slate-500 font-bold flex-shrink-0">Destination</span>
            <span className="text-xs font-bold text-white text-right">{trade.deliveryAddress}</span>
          </div>
        )}
        {/* GPS status row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[10px] text-slate-500 font-bold">Driver GPS</span>
          {hasDriverLocation ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export function SellerLiveTrackingTab() {
  const { data, isLoading, error } = useSellerTrades();
  const [search, setSearch]       = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const trades = useMemo(() => data?.dashboardRecords ?? [], [data]);

  /* Only show trades that are currently active */
  const sorted = useMemo(() =>
    trades.filter(t => ACTIVE_STATUSES.includes(t.tradeStatus)),
  [trades]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(t =>
      t.tradeId?.toLowerCase().includes(q) ||
      t.goods?.toLowerCase().includes(q) ||
      t.driverName?.toLowerCase().includes(q)
    );
  }, [sorted, search]);

  /* Only non-null when the user explicitly clicked a card */
  const selectedTrade = useMemo(() =>
    selectedId ? (filtered.find(t => t.tradeId === selectedId) ?? null) : null,
    [filtered, selectedId]
  );

  /* Map always receives all filtered trades (driver markers for all).
     Destination markers are managed separately per selectedTrade. */

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
        <p className="text-sm font-medium">Failed to load tracking data. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-2" style={{ minHeight: 900 }}>

      {/* ── Left Sidebar ── */}
      <div className="w-72 flex-shrink-0 border-r border-slate-200 flex flex-col bg-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-0.5">Active Shipments</h2>
          <p className="text-[10px] text-slate-400 font-medium">Real-time status of protocol trades</p>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); }}
              placeholder="Search shipments..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
          </div>
        </div>

        {/* Cards list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-10">No shipments found.</p>
          ) : (
            filtered.map(trade => (
              <ShipmentCard
                key={trade.tradeId}
                trade={trade}
                isSelected={selectedTrade?.tradeId === trade.tradeId}
                onClick={() =>
                  /* Toggle: clicking selected card deselects → show all markers */
                  setSelectedId(prev => (prev === trade.tradeId ? null : trade.tradeId))
                }
              />
            ))
          )}
        </div>
      </div>

      {/* ── Map ── */}
      <GoogleMapPanel
        trades={filtered}
        allTradesCount={filtered.length}
        selectedTrade={selectedTrade}
        onSelectTrade={setSelectedId}
      />
    </div>
  );
}
