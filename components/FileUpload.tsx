import React, { useCallback } from 'react';
import { Upload, FileText, Database } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (content: string) => void;
  onUseSample: () => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onUseSample, disabled }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileSelect(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full">
      <label 
        className={`
          flex flex-col items-center justify-center w-full h-48 
          border-2 border-dashed rounded-xl cursor-pointer 
          transition-all duration-300
          ${disabled ? 'bg-slate-100 border-slate-300 opacity-50 cursor-not-allowed' : 'bg-white border-blue-300 hover:bg-blue-50 hover:border-blue-500'}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
          <Upload className={`w-10 h-10 mb-3 ${disabled ? 'text-slate-400' : 'text-blue-500'}`} />
          <p className="mb-2 text-sm text-slate-500 font-medium">
            <span className="font-semibold text-slate-700">Clique para enviar</span> ou arraste o arquivo
          </p>
          <p className="text-xs text-slate-400 mb-1">CSV, TXT ou Excel (copiar/colar)</p>
          <p className="text-[10px] text-blue-400 font-medium bg-blue-50 px-2 py-1 rounded">
            Colunas ideais: Código do Cliente, Nome do Cliente, CEP
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept=".csv,.txt,.json" 
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>

      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="h-px bg-slate-200 flex-1"></div>
        <span className="text-xs text-slate-400 uppercase font-bold">Ou</span>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>

      <button
        onClick={onUseSample}
        disabled={disabled}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
      >
        <Database className="w-4 h-4" />
        Usar Dados de Exemplo
      </button>
    </div>
  );
};