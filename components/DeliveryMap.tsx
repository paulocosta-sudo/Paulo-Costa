import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DeliveryStop } from '../types';
import { MapPin, Navigation } from 'lucide-react';

// Fix Leaflet default icon issue in React
const iconPerson = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const startIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface DeliveryMapProps {
  stops: DeliveryStop[];
}

// Component to auto-center map bounds
const MapUpdater: React.FC<{ stops: DeliveryStop[] }> = ({ stops }) => {
  const map = useMap();

  useEffect(() => {
    if (stops.length > 0) {
      const bounds = L.latLngBounds(stops.map(s => [s.estimatedLat, s.estimatedLng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stops, map]);

  return null;
};

export const DeliveryMap: React.FC<DeliveryMapProps> = ({ stops }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-full w-full bg-slate-200 animate-pulse rounded-lg"></div>;

  // Extract positions for polyline
  const polylinePositions = stops.map(stop => [stop.estimatedLat, stop.estimatedLng] as [number, number]);
  
  // Default center (São Paulo) if no stops
  const centerPosition: [number, number] = stops.length > 0 
    ? [stops[0].estimatedLat, stops[0].estimatedLng] 
    : [-23.5505, -46.6333];

  return (
    <MapContainer 
      center={centerPosition} 
      zoom={13} 
      scrollWheelZoom={true} 
      className="h-full w-full rounded-lg shadow-inner z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater stops={stops} />

      {stops.map((stop, index) => (
        <Marker 
          key={stop.id} 
          position={[stop.estimatedLat, stop.estimatedLng]}
          icon={index === 0 ? startIcon : iconPerson}
        >
          <Popup>
            <div className="p-1 min-w-[200px]">
              <div className="flex justify-between items-start border-b border-slate-100 pb-1 mb-1">
                <h3 className="font-bold text-sm">#{index + 1} - {stop.customerName}</h3>
                {stop.clientCode && <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-500">{stop.clientCode}</span>}
              </div>
              <p className="text-xs text-gray-600 mt-1">{stop.address}</p>
              {stop.zipCode && <p className="text-xs text-gray-500 font-mono">CEP: {stop.zipCode}</p>}
              <div className="mt-2 flex items-center gap-1">
                 <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${stop.priority === 'Alta' ? 'bg-red-500' : 'bg-blue-500'}`}>
                   {stop.priority}
                 </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {stops.length > 1 && (
        <Polyline 
          positions={polylinePositions} 
          pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.7, dashArray: '10, 10' }} 
        />
      )}
    </MapContainer>
  );
};