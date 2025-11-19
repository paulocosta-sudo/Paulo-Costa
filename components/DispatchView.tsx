import React from 'react';
import { Fleet, DeliveryStop } from '../types';
import { Printer, Truck, User, MapPin, Calendar } from 'lucide-react';

interface DispatchViewProps {
  fleets: Fleet[];
  stops: DeliveryStop[];
}

export const DispatchView: React.FC<DispatchViewProps> = ({ fleets, stops }) => {
  const handlePrint = () => {
    window.print();
  };

  const getFleetStops = (fleetId: string) => {
    // Filter stops for this fleet and ensure they respect the order index provided by AI (or re-ordered logic if implemented)
    return stops.filter(s => s.assignedFleetId === fleetId).sort((a, b) => a.orderIndex - b.orderIndex);
  };

  const today = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Romaneios de Saída</h2>
          <p className="text-slate-500">Fichas de conferência e roteiro para as equipes.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Imprimir Romaneios
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 print:block print:gap-0">
        {fleets.map(fleet => {
          const fleetStops = getFleetStops(fleet.id);
          // We show the fleet card even if empty, so the manager knows it has no load assigned yet
          
          return (
            <div key={fleet.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-2 print:border-black print:mb-8 break-inside-avoid page-break-inside-avoid">
              {/* Header do Romaneio */}
              <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-start print:bg-white print:border-b-2 print:border-black">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider border border-slate-300 px-2 py-0.5 rounded bg-white">Romaneio de Carga</span>
                     <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono">{today}</span>
                   </div>
                   <h3 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                     <Truck className="w-8 h-8 text-slate-800" />
                     Frota {fleet.number}
                   </h3>
                </div>
                <div className="text-right bg-white p-2 rounded border border-slate-200 print:border-0">
                   <div className="text-3xl font-black text-slate-800">{fleetStops.length}</div>
                   <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Entregas</div>
                </div>
              </div>

              {/* Equipe */}
              <div className="p-4 border-b border-slate-100 bg-white print:border-b print:border-black flex flex-col sm:flex-row gap-4 sm:items-center bg-slate-50/30">
                <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 shrink-0">
                  <User className="w-3 h-3" /> Equipe Responsável:
                </h4>
                <div className="flex flex-wrap gap-3">
                  {fleet.members.length > 0 ? fleet.members.map(member => (
                    <div key={member.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1 print:border-black">
                       <div className={`w-2 h-2 rounded-full ${member.role === 'Motorista' ? 'bg-indigo-500' : 'bg-emerald-500'} print:bg-black`}></div>
                       <span className="font-bold text-slate-700 text-sm print:text-black">{member.name}</span>
                       <span className="text-xs text-slate-400 print:text-black">({member.specificType})</span>
                    </div>
                  )) : (
                    <span className="text-sm text-red-500 italic print:text-black">Nenhuma equipe designada</span>
                  )}
                </div>
              </div>

              {/* Lista de Entregas */}
              <div className="p-0">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 print:bg-gray-100 print:border-black print:text-black">
                    <tr>
                      <th className="p-3 w-14 text-center">Seq.</th>
                      <th className="p-3 w-20">Cód.</th>
                      <th className="p-3">Cliente / Destinatário</th>
                      <th className="p-3">Endereço de Entrega</th>
                      <th className="p-3 w-24 text-center print:w-32">Recebido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-gray-300">
                    {fleetStops.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                           Nenhuma entrega atribuída para esta frota. Adicione cartões no quadro de entregas.
                         </td>
                       </tr>
                    ) : (
                      fleetStops.map((stop, idx) => (
                        <tr key={stop.id} className="hover:bg-slate-50 print:hover:bg-white group">
                          <td className="p-3 text-center font-bold text-slate-600 print:text-black bg-slate-50/50 group-hover:bg-slate-100">{idx + 1}º</td>
                          <td className="p-3 font-mono text-xs text-slate-500 print:text-black">{stop.clientCode || '-'}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800 text-base print:text-black">{stop.customerName}</div>
                            {stop.priority === 'Alta' && (
                              <span className="inline-block text-[10px] bg-red-100 text-red-700 font-bold px-1.5 rounded print:border print:border-black print:text-black print:bg-white mt-1">
                                PRIORIDADE
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                             <div className="text-slate-700 print:text-black">{stop.address}</div>
                             <div className="text-xs text-slate-500 flex items-center gap-1 print:text-black">
                               <MapPin className="w-3 h-3" /> {stop.city} {stop.zipCode && `- ${stop.zipCode}`}
                             </div>
                             {stop.notes && <div className="text-xs italic text-slate-400 mt-1 print:text-black">Obs: {stop.notes}</div>}
                          </td>
                          <td className="p-3 text-center align-middle">
                            <div className="w-24 h-8 border-b border-slate-300 mx-auto print:border-black"></div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Footer do Romaneio */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 print:bg-white print:border-black flex justify-between items-end text-xs text-slate-400 print:text-black">
                 <div>
                   <p>Gerado por RotaInteligente AI</p>
                 </div>
                 <div className="flex gap-8">
                    <div className="text-center">
                      <div className="w-32 border-b border-slate-300 mb-1 print:border-black"></div>
                      <span>Assinatura Motorista</span>
                    </div>
                    <div className="text-center">
                      <div className="w-32 border-b border-slate-300 mb-1 print:border-black"></div>
                      <span>Visto Conferente</span>
                    </div>
                 </div>
              </div>
            </div>
          );
        })}

        {fleets.length === 0 && (
           <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhuma frota ativa</h3>
              <p className="text-slate-500">Vá até a aba "Equipe & Frotas" para criar frotas e gerar romaneios.</p>
           </div>
        )}
      </div>
    </div>
  );
};