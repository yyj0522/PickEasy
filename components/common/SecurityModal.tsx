"use client";

import { X, ShieldCheck, Loader2 } from 'lucide-react';
import SecurityWidget from './SecurityWidget';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (token: string) => void;
}

export default function SecurityModal({ isOpen, onClose, onVerify }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full mx-4 text-center relative border border-slate-100 transform transition-all scale-100">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-2 rounded-full hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-900 mb-2">
          잠시만 기다려주세요
        </h2>
        
        <p className="text-slate-500 text-sm mb-8 break-keep">
          안전한 서비스 이용을 위해<br/>
          사람인지 확인하고 있습니다.
        </p>

        <div className="min-h-[65px] flex justify-center items-center">
           <SecurityWidget onVerify={onVerify} />
        </div>

        <p className="text-[10px] text-slate-400 mt-6">
          Cloudflare 보안 시스템에 의해 보호받고 있습니다.
        </p>
      </div>
    </div>
  );
}