
import React, { useState } from 'react';
import { Users, UserPlus, Trash2, Briefcase, User, Truck, Plus, X, ClipboardList, ShieldAlert, ArrowRight, Printer, Calendar, Loader2, FileText } from 'lucide-react';
import { TeamMember, MemberRole, Fleet } from '../types';
import { parseTeamAvailability } from '../services/geminiService';

interface TeamManagementProps {
  members: TeamMember[];
  setMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  fleets: Fleet[];
  setFleets: React.Dispatch<React.SetStateAction<Fleet[]>>;
}

const ROLE_CONFIG: Record<MemberRole, string[]> = {
  'Motorista': ['Motorista', 'Motorista I', 'Motorista Granel'],
  'Auxiliar': ['Auxiliar de Distribuição'],
  'Operador': ['Operador Granel']
};

type Tab = 'members' | 'structure';

// --- Sub-component: Fleet Card ---
interface FleetCardProps {
  fleet: Fleet;
  onRemoveFleet: (id: string) => void;
  onAddMember: (fleetId: string, memberId: string) => void;
  onRemoveMember: (fleetId: string, memberId: string) => void;
  availableMembers: TeamMember[];
  onNavigateToRegister: () => void;
}

const FleetCard: React.FC<FleetCardProps> = ({ 
  fleet, 
  onRemoveFleet, 
  onAddMember, 
  onRemoveMember, 
  availableMembers,
  onNavigateToRegister
}) => {
  const [selectedMember, setSelectedMember] = useState<string>("");

  // Helper to group available members (only show active ones in dropdown)
  const activeAvailable = availableMembers.filter(m => m.active);

  const groupedMembers = {
    Motorista: activeAvailable.filter(m => m.role === 'Motorista'),
    Auxiliar: activeAvailable.filter(m => m.role === 'Auxiliar'),
    Operador: activeAvailable.filter(m => m.role === 'Operador')
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "REDIRECT_REGISTER") {
      onNavigateToRegister();
      return;
    }
    setSelectedMember(value);
    if (value) {
      onAddMember(fleet.id, value);
      setSelectedMember(""); // Reset after adding
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full transition-all hover:shadow-md print:hidden">
      <div className="bg-slate-800 text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-300" />
          <span className="font-bold text-lg">Frota {fleet.number}</span>
        </div>
        <button 
          onClick={() => onRemoveFleet(fleet.id)}
          className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-white/10"
          title="Excluir Frota"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Members List */}
        <div className="space-y-2 flex-1 min-h-[80px]">
          {fleet.members.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-4 text-slate-300 border border-dashed border-slate-100 rounded-lg">
                <ShieldAlert className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs italic text-center px-4">
                  Vazio. Adicione Motoristas ou Auxiliares abaixo.
                </p>
              </div>
          ) : (
            fleet.members.map(member => (
              <div key={member.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100 group hover:border-blue-200 transition-colors shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] text-white font-bold
                    ${member.role === 'Motorista' ? 'bg-indigo-500' : 
                      member.role === 'Auxiliar' ? 'bg-emerald-500' : 'bg-amber-500'}
                  `}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm leading-tight">{member.name}</div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider mt-0.5
                      ${member.role === 'Motorista' ? 'text-indigo-600' : 
                        member.role === 'Auxiliar' ? 'text-emerald-600' : 'text-amber-600'}
                    `}>
                      {member.specificType}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveMember(fleet.id, member.id)}
                  className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all"
                  title="Remover da frota"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Member Selector */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="relative">
            <select 
              className={`w-full text-sm p-2.5 border rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors
                ${activeAvailable.length === 0 ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-slate-700 border-blue-200 hover:border-blue-400'}
              `}
              value={selectedMember}
              onChange={handleSelectChange}
            >
              <option value="" disabled>
                {activeAvailable.length === 0 ? "Sem membros disponíveis" : "+ Adicionar Integrante"}
              </option>
              
              {activeAvailable.length > 0 ? (
                <>
                  {groupedMembers.Motorista.length > 0 && (
                    <optgroup label="Motoristas">
                      {groupedMembers.Motorista.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.specificType})</option>
                      ))}
                    </optgroup>
                  )}
                  
                  {groupedMembers.Auxiliar.length > 0 && (
                    <optgroup label="Auxiliares">
                      {groupedMembers.Auxiliar.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.specificType})</option>
                      ))}
                    </optgroup>
                  )}

                  {groupedMembers.Operador.length > 0 && (
                    <optgroup label="Operadores">
                      {groupedMembers.Operador.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.specificType})</option>
                      ))}
                    </optgroup>
                  )}
                </>
              ) : (
                <option value="REDIRECT_REGISTER">➜ Cadastrar nova pessoa...</option>
              )}
            </select>
            {/* Custom arrow for better UI */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          
          {activeAvailable.length === 0 && (
            <button 
              onClick={onNavigateToRegister}
              className="w-full mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline text-center"
            >
              Cadastrar novos integrantes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


export const TeamManagement: React.FC<TeamManagementProps> = ({ members, setMembers, fleets, setFleets }) => {
  const [activeTab, setActiveTab] = useState<Tab>('structure');
  
  // Members Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<MemberRole>('Motorista');
  const [specificType, setSpecificType] = useState<string>(ROLE_CONFIG['Motorista'][0]);

  // Fleet Form State
  const [fleetNumber, setFleetNumber] = useState('');

  // Import Schedule State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [scheduleText, setScheduleText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // --- Member Management Logic ---
  const handleRoleChange = (newRole: MemberRole) => {
    setRole(newRole);
    setSpecificType(ROLE_CONFIG[newRole][0]);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name: name.trim(),
      role,
      specificType,
      active: true
    };

    setMembers([...members, newMember]);
    setName('');
    alert(`"${name}" cadastrado com sucesso!`);
  };

  const removeMember = (id: string) => {
    setFleets(fleets.map(f => ({
      ...f,
      members: f.members.filter(m => m.id !== id)
    })));
    setMembers(members.filter(m => m.id !== id));
  };

  const toggleMemberStatus = (id: string) => {
     setMembers(members.map(m => {
         if(m.id === id) {
             return { ...m, active: !m.active, statusReason: !m.active ? undefined : "Manual" };
         }
         return m;
     }));
  };

  // --- Schedule Import Logic ---
  const handleImportSchedule = async () => {
    if (!scheduleText.trim()) return;
    setIsImporting(true);

    try {
        const unavailableList = await parseTeamAvailability(scheduleText);
        
        // Update members based on returned list
        let updateCount = 0;
        const updatedMembers = members.map(m => {
            // Simple fuzzy match: checks if the roster name is contained in the member name or vice versa
            const match = unavailableList.find(u => 
                m.name.toLowerCase().includes(u.name.toLowerCase()) || 
                u.name.toLowerCase().includes(m.name.toLowerCase())
            );

            if (match) {
                updateCount++;
                return { ...m, active: false, statusReason: match.status };
            }
            // If not in the unavailable list, we assume they are active unless previously set manually?
            // For safety, let's only mark unavailable ones. We can opt to reset others to active if needed.
            // Let's assume Import is for Today's exceptions. We reset everyone to Active first?
            // No, that might delete manual entries. Let's just apply the leave.
            return m;
        });

        setMembers(updatedMembers);
        setIsImportModalOpen(false);
        setScheduleText('');
        alert(`${updateCount} colaboradores marcados como indisponíveis com base na escala.`);

    } catch (e) {
        alert("Erro ao processar escala.");
    } finally {
        setIsImporting(false);
    }
  };

  // --- Fleet Management Logic ---
  const handleAddFleet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fleetNumber.trim()) return;
    
    if (fleets.some(f => f.number === fleetNumber)) {
      alert('Esta frota já existe na estrutura diária.');
      return;
    }

    const newFleet: Fleet = {
      id: crypto.randomUUID(),
      number: fleetNumber.trim(),
      members: []
    };
    setFleets([...fleets, newFleet]);
    setFleetNumber('');
  };

  const removeFleet = (fleetId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta frota?')) {
      setFleets(fleets.filter(f => f.id !== fleetId));
    }
  };

  const addMemberToFleet = (fleetId: string, memberId: string) => {
    if (!memberId) return;
    const isAlreadyAssigned = fleets.some(f => f.members.some(m => m.id === memberId));
    if (isAlreadyAssigned) {
      alert("Este colaborador já está escalado em outra frota.");
      return;
    }
    const memberToAdd = members.find(m => m.id === memberId);
    if (!memberToAdd) return;

    setFleets(fleets.map(f => {
      if (f.id === fleetId) {
        return { ...f, members: [...f.members, memberToAdd] };
      }
      return f;
    }));
  };

  const removeMemberFromFleet = (fleetId: string, memberId: string) => {
    setFleets(fleets.map(f => {
      if (f.id === fleetId) {
        return { ...f, members: f.members.filter(m => m.id !== memberId) };
      }
      return f;
    }));
  };

  const getAvailableMembers = () => {
    const assignedIds = new Set(fleets.flatMap(f => f.members.map(m => m.id)));
    return members.filter(m => !assignedIds.has(m.id));
  };

  const availableMembers = getAvailableMembers();

  const handlePrintStructure = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Importar Escala de Folgas
                    </h3>
                    <button onClick={() => setIsImportModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500">
                        Copie as células da sua planilha Google (Nome e Status) e cole abaixo. 
                        A IA identificará quem está de "Folga", "Férias" ou "Atestado".
                    </p>
                    <textarea
                        value={scheduleText}
                        onChange={(e) => setScheduleText(e.target.value)}
                        placeholder={`Exemplo:\nJoão da Silva - Folga\nMaria Oliveira - Normal\nPedro Santos - Férias`}
                        className="w-full h-40 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    ></textarea>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                        onClick={() => setIsImportModalOpen(false)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleImportSchedule}
                        disabled={isImporting || !scheduleText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                        Processar Escala
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Tabs - Hidden on Print */}
      <div className="flex justify-center mb-6 print:hidden">
        <div className="flex space-x-1 bg-slate-200 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
              ${activeTab === 'structure' ? 'bg-white text-blue-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'}`}
          >
            <ClipboardList className="w-4 h-4" />
            Estrutura Diária
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
              ${activeTab === 'members' ? 'bg-white text-blue-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'}`}
          >
            <Users className="w-4 h-4" />
            Cadastro de Pessoas
          </button>
        </div>
      </div>

      {activeTab === 'members' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
           {/* --- MEMBERS TAB CONTENT --- */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Cadastro de Colaboradores</h2>
                    <p className="text-sm text-slate-500">Adicione motoristas e auxiliares ao banco de talentos.</p>
                </div>
              </div>
              
              {/* Import Button */}
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Importar Escala
              </button>
            </div>
            
            {/* Mobile Import Button */}
            <button
                onClick={() => setIsImportModalOpen(true)}
                className="md:hidden w-full mb-6 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Importar Escala
              </button>

            <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: José de Arimateia"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Função</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as MemberRole)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                >
                  {Object.keys(ROLE_CONFIG).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cargo Específico</label>
                <select
                  value={specificType}
                  onChange={(e) => setSpecificType(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                >
                  {ROLE_CONFIG[role].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 pt-4 flex justify-between items-center">
                <p className="text-sm text-slate-400 hidden md:block">Preencha os dados para habilitar o cadastro.</p>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  <Plus className="w-5 h-5" />
                  Cadastrar
                </button>
              </div>
            </form>
          </div>

          {/* Members List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Banco de Talentos</h3>
              </div>
              <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                {members.length} Total
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {members.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <User className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="font-medium">Nenhum colaborador cadastrado.</p>
                  <p className="text-sm mt-1">Use o formulário acima para começar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
                  {members.map((member) => (
                    <div key={member.id} className={`p-4 flex items-center justify-between transition-colors group
                        ${!member.active ? 'bg-slate-50 opacity-75' : 'bg-white hover:bg-slate-50'}
                    `}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0
                          ${!member.active ? 'bg-slate-300' : member.role === 'Motorista' ? 'bg-indigo-500' : member.role === 'Auxiliar' ? 'bg-emerald-500' : 'bg-amber-500'}
                        `}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                              <h4 className={`font-bold ${!member.active ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{member.name}</h4>
                              {!member.active && member.statusReason && (
                                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">{member.statusReason}</span>
                              )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Briefcase className="w-3 h-3" />
                            <span>{member.specificType}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button 
                           onClick={() => toggleMemberStatus(member.id)}
                           className={`p-2 rounded-lg transition-all text-xs font-bold mr-2
                            ${member.active ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}
                           `}
                           title={member.active ? "Marcar como indisponível" : "Marcar como disponível"}
                        >
                            {member.active ? "ATIVO" : "OFF"}
                        </button>
                        <button 
                            onClick={() => removeMember(member.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Remover do sistema"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* --- DAILY STRUCTURE TAB CONTENT --- */}
          
          {/* Add Fleet Section - More Prominent - Hidden on Print */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
             <div>
               <h2 className="text-xl font-bold flex items-center gap-2">
                 <Truck className="w-6 h-6 text-blue-400" />
                 Montar Estrutura Diária
               </h2>
               <p className="text-slate-400 text-sm mt-1">Crie as frotas (veículos) e atribua a equipe disponível.</p>
             </div>

             <div className="flex items-center gap-3 w-full md:w-auto bg-white/10 p-2 rounded-xl backdrop-blur-sm">
               <div className="relative flex-1 md:w-48">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">FROTA</span>
                 <input
                    type="text"
                    value={fleetNumber}
                    onChange={(e) => setFleetNumber(e.target.value)}
                    placeholder="Ex: 113"
                    className="w-full pl-14 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFleet(e)}
                  />
               </div>
               <button
                  onClick={handleAddFleet}
                  disabled={!fleetNumber.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Criar
                </button>
             </div>
          </div>

          {/* Stats Bar & Print Button - Hidden on Print */}
          <div className="flex items-center justify-between px-2 print:hidden">
            <h3 className="font-bold text-slate-700 text-lg">Frotas Ativas ({fleets.length})</h3>
            <div className="flex items-center gap-4">
               <button
                  onClick={handlePrintStructure}
                  disabled={fleets.length === 0}
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:shadow transition-all disabled:opacity-50"
               >
                 <Printer className="w-4 h-4" />
                 Gerar PDF
               </button>
               <div className={`text-sm font-medium px-3 py-1 rounded-full border ${availableMembers.filter(m => m.active).length > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                 {availableMembers.filter(m => m.active).length} Pessoas Disponíveis
               </div>
            </div>
          </div>

          {/* Fleets Grid - Interactive */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10 print:hidden">
            {fleets.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                  <Truck className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Nenhuma frota criada hoje</h3>
                <p className="text-slate-500 max-w-md">
                  Comece digitando o número da frota no painel superior e clicando em "Criar".
                </p>
              </div>
            ) : (
              fleets.map(fleet => (
                <FleetCard 
                  key={fleet.id}
                  fleet={fleet}
                  onRemoveFleet={removeFleet}
                  onAddMember={addMemberToFleet}
                  onRemoveMember={removeMemberFromFleet}
                  availableMembers={availableMembers}
                  onNavigateToRegister={() => setActiveTab('members')}
                />
              ))
            )}
            
            {/* "Ghost" Card to prompt adding more */}
            {fleets.length > 0 && (
              <button 
                onClick={() => {
                   const el = document.querySelector('input[placeholder="Ex: 113"]') as HTMLInputElement;
                   el?.focus();
                }}
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-slate-400 hover:text-blue-500 gap-3 min-h-[200px]"
              >
                <Plus className="w-10 h-10" />
                <span className="font-medium">Adicionar outra frota</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- PRINT ONLY TEMPLATE --- */}
      <div className="hidden print:fixed print:inset-0 print:z-[9999] print:bg-white print:block p-8">
         <div className="text-center border-b-2 border-black pb-6 mb-8">
           <h1 className="text-3xl font-bold text-black uppercase tracking-wide">Estrutura de Frotas</h1>
           <p className="text-slate-600 mt-2">Data: {new Date().toLocaleDateString('pt-BR')}</p>
         </div>

         <div className="grid grid-cols-1 gap-8">
           {fleets.map(fleet => (
             <div key={fleet.id} className="break-inside-avoid border border-slate-300 rounded-xl p-0 overflow-hidden">
                <div className="bg-slate-100 border-b border-slate-300 p-4 flex items-center gap-3">
                   <Truck className="w-6 h-6 text-black" />
                   <span className="text-xl font-bold text-black">Frota {fleet.number}</span>
                </div>
                <div className="p-4">
                  {fleet.members.length === 0 ? (
                    <p className="text-slate-400 italic text-sm">Nenhuma equipe designada.</p>
                  ) : (
                    <ul className="space-y-2">
                      {fleet.members.map(m => (
                        <li key={m.id} className="flex items-center justify-between text-sm border-b border-dashed border-slate-200 pb-2 last:border-0 last:pb-0">
                           <span className="font-bold text-black uppercase">{m.name}</span>
                           <span className="text-slate-600">{m.specificType}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
             </div>
           ))}

           {fleets.length === 0 && (
             <p className="text-center text-slate-500 italic">Nenhuma frota cadastrada para esta data.</p>
           )}
         </div>

         <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-400">
           <span>Gerado por RotaInteligente AI</span>
           <span>Documento Interno</span>
         </div>
      </div>
    </div>
  );
};
