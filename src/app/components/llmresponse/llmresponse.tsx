// src/app/components/llmresponse/llmresponse.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, CheckCircle, XCircle, AlertTriangle, Lightbulb, 
  Smartphone, Star, RefreshCw, LayoutDashboard, MessageCircle // Tambah Icon MessageCircle
} from 'lucide-react';
// IMPORT KOMPONEN CHAT
import ChatInterface from './chatInterface';

interface LLMResponseRendererProps {
  content: string;
  deficiencyType: string;
  severity: string;
  onRegenerate?: () => void;
}

const LLMResponseRenderer: React.FC<LLMResponseRendererProps> = ({ 
  content, 
  deficiencyType, 
  severity,
  onRegenerate
}) => {
  const [activeSection, setActiveSection] = useState<number>(1);

  // --- Helper Functions (Sama seperti sebelumnya) ---
  const cleanMarkdown = (text: string): string => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/__(.*?)__/g, '$1').replace(/_(.*?)_/g, '$1').trim();
  };

  const parseSection = (text: string, sectionNumber: number, title: string): string => {
    const patterns = [
      new RegExp(`##\\s*\\*\\*${sectionNumber}\\.?\\s*${title}\\*\\*([\\s\\S]*?)(?=##\\s*\\*\\*|$)`, 'i'),
      new RegExp(`##\\s*${sectionNumber}\\.?\\s*\\*\\*${title}\\*\\*([\\s\\S]*?)(?=##|$)`, 'i'),
      new RegExp(`##\\s*${sectionNumber}\\.?\\s*${title}([\\s\\S]*?)(?=##|$)`, 'i'),
      new RegExp(`###?\\s*${title}([\\s\\S]*?)(?=###?|$)`, 'i')
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) return match[1].trim();
    }
    return '';
  };

  const parseListItems = (text: string): string[] => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim().match(/^[-•*]\s+/)).map(item => cleanMarkdown(item.replace(/^[-•*]\s+/, ''))).filter(item => item.length > 0);
  };

  const parseParagraphs = (text: string): string[] => {
    if (!text) return [];
    return text.split('\n\n').map(p => cleanMarkdown(p.trim())).filter(p => p && !p.match(/^[-•*]\s/) && !p.match(/^##/)).filter(p => p.length > 10);
  };

  const parseCareerItems = (text: string) => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim().startsWith('-')).map(line => {
        const content = line.replace(/^[-•*]\s*/, '').trim();
        const [titlePart, descPart] = content.split(':');
        const [why, access] = descPart?.split(/Accessibility features?:/i) || [];
        return { title: titlePart?.trim() || '', why: why?.trim() || '', accessibility: access?.trim() || '' };
    }).filter(c => c.title);
  };

  // --- Helper Icon ---
  const EyeIcon = ({size, className}: {size: number, className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
  );

  // --- Data Configuration ---
  const sectionsConfig = [
    { id: 1, title: 'Assessment', icon: LayoutDashboard, color: 'blue', content: parseSection(content, 1, 'Personalized Assessment') },
    { id: 2, title: 'Understanding', icon: EyeIcon, color: 'green', content: parseSection(content, 2, 'Understanding Your Condition') },
    { id: 3, title: 'Top Careers', icon: CheckCircle, color: 'emerald', content: parseSection(content, 3, 'Career Paths - Highly Recommended') },
    { id: 4, title: 'Accommodations', icon: AlertTriangle, color: 'amber', content: parseSection(content, 4, 'Careers Requiring Accommodations') },
    { id: 5, title: 'Avoid', icon: XCircle, color: 'red', content: parseSection(content, 5, 'Careers to Avoid') },
    { id: 6, title: 'Tools', icon: Smartphone, color: 'cyan', content: parseSection(content, 6, 'Assistive Technology & Tools') },
    { id: 7, title: 'Strategies', icon: Lightbulb, color: 'indigo', content: parseSection(content, 7, 'Success Strategies') },
    { id: 8, title: 'Encouragement', icon: Star, color: 'pink', content: parseSection(content, 8, 'Closing Encouragement') },
    // ITEM BARU: CHATBOT
    { id: 99, title: 'Ask AI Guide', icon: MessageCircle, color: 'violet', content: 'chat-interface' },
  ];

  // Filter sections that have content OR are the chat interface
  const activeSections = sectionsConfig.filter(s => s.content || s.id === 99);

  if (activeSections.length === 0 && content) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Career Guidance</h3>
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{cleanMarkdown(content)}</div>
      </div>
    );
  }

  const currentSectionData = activeSections.find(s => s.id === activeSection) || activeSections[0];

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-full md:w-72 bg-gray-50/80 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
        <div className="p-6 pb-2">
          <div className="flex items-center space-x-3 mb-1">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-lg text-white">
              <Briefcase size={20} />
            </div>
            <h2 className="font-bold text-gray-900 leading-tight">Career Guide</h2>
          </div>
          <p className="text-xs text-gray-500 ml-11 mb-4">AI Analysis Results</p>
        </div>

        <div className="flex-1 overflow-x-auto md:overflow-y-auto px-4 pb-4 md:px-4 md:py-2 space-x-2 md:space-x-0 md:space-y-1 flex md:flex-col scrollbar-hide">
          {activeSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const activeClass = isActive 
              ? `bg-white text-${section.color}-600 shadow-sm ring-1 ring-gray-200` 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 w-full whitespace-nowrap md:whitespace-normal flex-shrink-0 md:flex-shrink ${activeClass}`}
              >
                <Icon size={18} className={isActive ? `text-${section.color}-600` : 'text-gray-400'} />
                <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : ''}`}>{section.title}</span>
                {isActive && <motion.div layoutId="activeIndicator" className={`ml-auto w-1.5 h-1.5 rounded-full bg-${section.color}-500 hidden md:block`} />}
              </button>
            );
          })}
        </div>

        {onRegenerate && (
          <div className="p-4 border-t border-gray-200 hidden md:block">
            <button onClick={onRegenerate} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
              <RefreshCw size={14} /> <span>Regenerate Analysis</span>
            </button>
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 bg-white relative overflow-hidden flex flex-col h-full">
        {onRegenerate && (
          <div className="md:hidden absolute top-4 right-4 z-10">
            <button onClick={onRegenerate} className="p-2 bg-gray-100 rounded-full text-gray-600"><RefreshCw size={16} /></button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 custom-scrollbar h-[600px] md:h-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto pb-8"
            >
              <div className="mb-6 flex items-center">
                 <div className={`p-3 rounded-2xl bg-${currentSectionData.color}-50 text-${currentSectionData.color}-600 mr-4`}>
                    <currentSectionData.icon size={28} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900">{currentSectionData.title}</h2>
                    {currentSectionData.id !== 99 && (
                       <p className="text-sm text-gray-500 mt-1 capitalize">Diagnosis: {deficiencyType} • Severity: {severity}</p>
                    )}
                 </div>
              </div>

              {/* RENDER CHAT INTERFACE JIKA ID = 99 */}
              {currentSectionData.id === 99 ? (
                 <ChatInterface 
                    deficiencyType={deficiencyType} 
                    severity={severity} 
                    diagnosis={content.substring(0, 100)} // Pass snippet diagnosis or pass diagnosis prop separately
                 />
              ) : (
                <>
                  {/* --- KONTEN TEXT BIASA --- */}
                  {[1, 2, 8].includes(currentSectionData.id) && (
                    <div className="prose prose-slate max-w-none">
                      {parseParagraphs(currentSectionData.content).map((para, idx) => (
                        <p key={idx} className="text-gray-700 leading-relaxed text-base mb-4">{para}</p>
                      ))}
                      {currentSectionData.id === 2 && parseListItems(currentSectionData.content).length > 0 && (
                        <div className="bg-green-50 rounded-xl p-5 mt-4 border border-green-100">
                          <h4 className="font-semibold text-green-900 mb-3">Key Takeaways</h4>
                          <ul className="space-y-2">{parseListItems(currentSectionData.content).map((item, i) => <li key={i} className="flex items-start text-sm text-gray-700"><span className="mr-2 text-green-500 font-bold">•</span> {item}</li>)}</ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- CAREER CARDS --- */}
                  {currentSectionData.id === 3 && (
                    <div className="grid gap-4">
                      {parseCareerItems(currentSectionData.content).map((career, idx) => (
                        <div key={idx} className="group bg-white border border-emerald-100 hover:border-emerald-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-start">
                             <div className="mt-1 mr-3 p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Briefcase size={16} /></div>
                             <div>
                                <h4 className="font-bold text-gray-900 mb-1">{career.title}</h4>
                                <p className="text-gray-600 text-sm leading-relaxed mb-2">{career.why}</p>
                                {career.accessibility && <div className="inline-block bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">✅ Accessibility: {career.accessibility}</div>}
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* --- LISTS --- */}
                  {[4, 5, 6, 7].includes(currentSectionData.id) && (
                    <div className="space-y-3">
                       {currentSectionData.id === 4 && <div className="mb-4 text-gray-700">{parseParagraphs(currentSectionData.content).slice(0, 1).map((p, i) => <p key={i}>{p}</p>)}</div>}
                       {parseListItems(currentSectionData.content).map((item, idx) => {
                          let Icon = CheckCircle; let colorClass = "text-blue-600";
                          if (currentSectionData.id === 4) { Icon = AlertTriangle; colorClass = "text-amber-600"; }
                          if (currentSectionData.id === 5) { Icon = XCircle; colorClass = "text-red-600"; }
                          if (currentSectionData.id === 6) { Icon = Smartphone; colorClass = "text-cyan-600"; }
                          if (currentSectionData.id === 7) { Icon = Lightbulb; colorClass = "text-indigo-600"; }
                          const contentText = item.includes('Accommodations:') ? <span><span className="font-semibold block mb-1">{item.split('Accommodations:')[0]}</span><span className="text-gray-600 text-sm block">Accommodations: {item.split('Accommodations:')[1]}</span></span> : item;
                          return (
                            <div key={idx} className="flex items-start bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                               <Icon size={18} className={`${colorClass} mt-0.5 mr-3 flex-shrink-0`} />
                               <span className="text-gray-700 text-sm leading-relaxed">{contentText}</span>
                            </div>
                          );
                       })}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LLMResponseRenderer;