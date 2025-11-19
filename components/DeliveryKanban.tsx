import React from 'react';
import { DeliveryStop, Fleet } from '../types';
import { Truck, Package, MapPin, User } from 'lucide-react';

interface DeliveryKanbanProps {
  stops: DeliveryStop[];
  fleets: Fleet[];
  onMoveStop: (stopId: string, targetFleetId: string | null) => void;
}

interface DeliveryCardProps {
  stop: DeliveryStop;
  onDragStart: (e: React.DragEvent, stopId: string) => void;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({ stop, onDragStart }) => (
  <div 
    draggable 
    onDragStart={(e) => onDragStart(e, stop.id)}
    className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition-all group"
  >
    <div className="flex justify-between items-start mb-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-1 rounded">
        {stop.clientCode || 'S/CÓD'}
      </span>
      <span className={`text-[10px] font-bold px-1.5 rounded-full
        ${stop.priority === 'Alta' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}
      `}>
        {stop.priority}
      </span>
    </div>
    <h4 className="font-semibold text-slate-800 text-sm leading-tight mb-1">{stop.customerName}</h4>
    
    <div className="flex items-start gap-1.5 text-xs text-slate-500">
      <MapPin className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
      <span className="line-clamp-2">{stop.address}</span>
    </div>
    {stop.zipCode && (
      <div className="mt-1 text-[10px] text-slate-400 font-mono pl-4.5">CEP: {stop.zipCode}</div>
    )}
  </div>
);

export const DeliveryKanban: React.FC<DeliveryKanbanProps> = ({ stops, fleets, onMoveStop }) => {
  
  // Filter stops based on assignment
  const unassignedStops = stops.filter(s => !s.assignedFleetId);

  const handleDragStart = (e: React.DragEvent, stopId: string) => {
    e.dataTransfer.setData('stopId', stopId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetFleetId: string | null) => {
    e.preventDefault();
    const stopId = e.dataTransfer.getData('stopId');
    if (stopId) {
      onMoveStop(stopId, targetFleetId);
    }
  };

  return (
    <div className="h-full flex gap-4 overflow-x-auto pb-4 items-start">
      
      {/* Unassigned Column */}
      <div 
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
        className="min-w-[280px] w-[280px] flex flex-col bg-slate-100 rounded-xl border border-slate-200 max-h-full"
      >
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-200/50 rounded-t-xl">
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
            <Package className="w-4 h-4" />
            <span>Não Atribuídos</span>
          </div>
          <span className="text-xs font-bold bg-white px-2 py-0.5 rounded text-slate-500">
            {unassignedStops.length}
          </span>
        </div>
        <div className="p-2 flex-1 overflow-y-auto space-y-2 min-h-[150px]">
          {unassignedStops.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs italic">
              Todos os clientes foram roteirizados!
            </div>
          )}
          {unassignedStops.map(stop => (
            <DeliveryCard key={stop.id} stop={stop} onDragStart={handleDragStart} />
          ))}
        </div>
      </div>

      {/* Fleet Columns */}
      {fleets.map(fleet => {
        const fleetStops = stops.filter(s => s.assignedFleetId === fleet.id);
        return (
          <div 
            key={fleet.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, fleet.id)}
            className="min-w-[280px] w-[280px] flex flex-col bg-blue-50/50 rounded-xl border border-blue-100 max-h-full"
          >
            <div className="p-3 border-b border-blue-100 flex flex-col gap-2 bg-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                  <Truck className="w-4 h-4" />
                  <span>Frota {fleet.number}</span>
                </div>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {fleetStops.length}
                </span>
              </div>
              {/* Mini Team Summary */}
              <div className="flex flex-wrap gap-1">
                {fleet.members.length === 0 ? (
                   <span className="text-[10px] text-slate-400 italic">Sem equipe definida</span>
                ) : (
                  fleet.members.map(m => (
                    <div key={m.id} className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white font-bold
                      ${m.role === 'Motorista' ? 'bg-indigo-400' : m.role === 'Auxiliar' ? 'bg-emerald-400' : 'bg-amber-400'}
                    `} title={`${m.role}: ${m.name}`}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-2 flex-1 overflow-y-auto space-y-2 min-h-[150px]">
               {fleetStops.length === 0 && (
                <div className="text-center py-8 text-blue-300/50 text-xs italic border-2 border-dashed border-blue-100/50 rounded m-2">
                  Arraste clientes para cá
                </div>
              )}
              {fleetStops.map(stop => (
                <DeliveryCard key={stop.id} stop={stop} onDragStart={handleDragStart} />
              ))}
            </div>
             <div className="p-2 text-center border-t border-blue-100 text-[10px] text-blue-400 font-medium bg-blue-50 rounded-b-xl">
                Distância estimada: {fleetStops.length * 1.5} km {/* Placeholder logic */}
             </div>
          </div>
        );
      })}
      
      {/* Helper if no fleets */}
      {fleets.length === 0 && (
         <div className="min-w-[250px] flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 bg-slate-50/50">
            <p className="text-sm text-center mb-2">Nenhuma frota disponível para receber entregas.</p>
            <span className="text-xs bg-white px-2 py-1 rounded border shadow-sm">Crie frotas na aba Equipe</span>
         </div>
      )}
    </div>
  );
};