import React, { useState } from 'react';
import { Truck, Map as MapIcon, List, AlertCircle, ExternalLink, Loader2, Users, Package, ChevronRight, Kanban, ClipboardCheck } from 'lucide-react';
import { parseAndOptimizeRoute, generateMockData } from './services/geminiService';
import { DeliveryMap } from './components/DeliveryMap';
import { FileUpload } from './components/FileUpload';
import { TeamManagement } from './components/TeamManagement';
import { DeliveryKanban } from './components/DeliveryKanban';
import { DispatchView } from './components/DispatchView';
import { DeliveryStop, RoutePlan, OptimizationStatus, TeamMember, Fleet } from './types';

type AppView = 'routes' | 'team' | 'dispatch';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('routes');
  
  // Route State
  const [status, setStatus] = useState<OptimizationStatus>(OptimizationStatus.IDLE);
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'board' | 'map'>('board');

  // Team & Fleet State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [fleets, setFleets] = useState<Fleet[]>([]);

  const handleProcessData = async (content: string) => {
    setStatus(OptimizationStatus.ANALYZING);
    setErrorMessage(null);
    try {
      const plan = await parseAndOptimizeRoute(content);
      setRoutePlan(plan);
      setStatus(OptimizationStatus.COMPLETED);
      setActiveTab('board');
    } catch (error) {
      console.error(error);
      setStatus(OptimizationStatus.ERROR);
      setErrorMessage("Não foi possível processar o arquivo. Verifique se o formato está legível ou tente novamente.");
    }
  };

  const handleUseSample = () => {
    const sample = generateMockData();
    handleProcessData(sample);
  };

  const handleMoveStop = (stopId: string, targetFleetId: string | null) => {
    if (!routePlan) return;
    
    const updatedStops = routePlan.stops.map(stop => {
      if (stop.id === stopId) {
        return { ...stop, assignedFleetId: targetFleetId };
      }
      return stop;
    });

    setRoutePlan({
      ...routePlan,
      stops: updatedStops
    });
  };

  const openGoogleMapsRoute = () => {
    if (!routePlan || routePlan.stops.length === 0) return;
    
    // Prioritize Address + City, fallback to Lat/Lng if address is empty
    const getQuery = (s: DeliveryStop) => {
        if (s.address && s.city) return `${s.address}, ${s.city}`;
        return `${s.estimatedLat},${s.estimatedLng}`;
    };

    const origin = encodeURIComponent(getQuery(routePlan.stops[0]));
    const destination = encodeURIComponent(getQuery(routePlan.stops[routePlan.stops.length - 1]));
    const waypoints = routePlan.stops.slice(1, -1).map(s => encodeURIComponent(getQuery(s))).join('|');
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Estrutura Diária - Fogás IA</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Gestão Logística com Gemini</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setCurrentView('routes')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                currentView === 'routes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Package className="w-4 h-4" />
              Entregas
            </button>
            <button
              onClick={() => setCurrentView('team')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                currentView === 'team' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Equipe & Frotas
            </button>
            <button
              onClick={() => setCurrentView('dispatch')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                currentView === 'dispatch' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              Romaneios
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {status === OptimizationStatus.COMPLETED && currentView === 'routes' && (
              <button 
                onClick={openGoogleMapsRoute}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Abrir no Google Maps</span>
                <span className="sm:hidden">Maps</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden flex flex-col print:h-auto print:overflow-visible">
        
        {currentView === 'dispatch' ? (
           <div className="w-full h-full overflow-y-auto bg-slate-50 print:bg-white">
             <DispatchView fleets={fleets} stops={routePlan?.stops || []} />
           </div>
        ) : currentView === 'team' ? (
          <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <TeamManagement 
              members={teamMembers} 
              setMembers={setTeamMembers}
              fleets={fleets}
              setFleets={setFleets}
            />
          </div>
        ) : (
          /* Routes View - Split Screen Logic */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Left/Top Panel: Kanban Board / Input */}
            <div className={`flex-1 flex flex-col bg-slate-50 border-r border-slate-200 transition-all duration-300 
              ${activeTab === 'map' ? 'hidden lg:flex lg:w-1/2' : 'w-full lg:w-1/2'}
            `}>
              
              {/* Status / Input Area */}
              <div className="p-4 border-b border-slate-200 bg-white z-10 shadow-sm">
                 <div className="flex items-center justify-between mb-2">
                   <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <List className="w-5 h-5 text-blue-500" />
                      Gestão de Entregas
                   </h2>
                   {status === OptimizationStatus.COMPLETED && (
                      <button 
                        onClick={() => {
                          setStatus(OptimizationStatus.IDLE);
                          setRoutePlan(null);
                        }}
                        className="text-xs text-slate-500 hover:text-red-600 underline"
                      >
                        Reiniciar
                      </button>
                   )}
                 </div>

                 {status === OptimizationStatus.IDLE || status === OptimizationStatus.ERROR ? (
                    <div className="max-w-xl mx-auto py-8">
                        <FileUpload 
                          onFileSelect={handleProcessData} 
                          onUseSample={handleUseSample} 
                          disabled={false} 
                        />
                        {status === OptimizationStatus.ERROR && (
                          <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {errorMessage}
                          </div>
                        )}
                    </div>
                 ) : (
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1
                            ${status === OptimizationStatus.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                           `}>
                            {status === OptimizationStatus.ANALYZING && <Loader2 className="w-3 h-3 animate-spin" />}
                            {status === OptimizationStatus.ANALYZING ? 'Processando...' : 'Arquivo Processado'}
                           </div>
                           {routePlan && (
                             <span className="text-xs text-slate-500">
                               {routePlan.stops.length} clientes / {fleets.length} frotas
                             </span>
                           )}
                        </div>
                        
                        {/* Instructions for User */}
                        {status === OptimizationStatus.COMPLETED && (
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                            💡 Arraste os cartões para as Frotas
                          </div>
                        )}
                    </div>
                 )}
              </div>

              {/* Kanban Area */}
              {status === OptimizationStatus.COMPLETED && routePlan && (
                <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-100/50 p-4">
                  <DeliveryKanban 
                    stops={routePlan.stops}
                    fleets={fleets}
                    onMoveStop={handleMoveStop}
                  />
                </div>
              )}
            </div>

            {/* Right/Bottom Panel: Map */}
            <div className={`flex-1 bg-white relative transition-all duration-300
               ${activeTab === 'board' ? 'hidden lg:block lg:w-1/2' : 'w-full lg:w-1/2'}
            `}>
              {status === OptimizationStatus.COMPLETED && routePlan ? (
                 <DeliveryMap stops={routePlan.stops} />
              ) : (
                <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <MapIcon className="w-10 h-10 opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">Mapa de Entregas</h3>
                  <p className="max-w-sm text-sm">
                    Carregue uma planilha para visualizar as entregas no mapa.
                  </p>
                </div>
              )}
              
              {status === OptimizationStatus.COMPLETED && (
                 <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 text-xs text-slate-500 shadow-lg z-[1000]">
                   <span className="font-bold text-orange-600">Nota:</span> As localizações são estimadas. Use o Google Maps para navegação precisa.
                 </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-50 h-16 print:hidden">
         {currentView === 'routes' ? (
           <>
            <button 
              onClick={() => setActiveTab('board')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeTab === 'board' ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <Kanban className="w-5 h-5" />
              <span className="text-[10px] font-medium">Quadro</span>
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeTab === 'map' ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <MapIcon className="w-5 h-5" />
              <span className="text-[10px] font-medium">Mapa</span>
            </button>
             <button 
              onClick={() => setCurrentView('team')}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500"
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-medium">Equipe</span>
            </button>
             <button 
              onClick={() => setCurrentView('dispatch')}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500"
            >
              <ClipboardCheck className="w-5 h-5" />
              <span className="text-[10px] font-medium">Romaneios</span>
            </button>
           </>
         ) : (
           <>
            <button 
              onClick={() => setCurrentView('routes')}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500"
            >
              <Package className="w-5 h-5" />
              <span className="text-[10px] font-medium">Entregas</span>
            </button>
            <button 
              onClick={() => setCurrentView('team')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 ${currentView === 'team' ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-medium">Equipe</span>
            </button>
            <button 
              onClick={() => setCurrentView('dispatch')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 ${currentView === 'dispatch' ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <ClipboardCheck className="w-5 h-5" />
              <span className="text-[10px] font-medium">Romaneios</span>
            </button>
           </>
         )}
      </div>
    </div>
  );
};

export default App;