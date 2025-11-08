// src/app/components/LLMResponseRenderer.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Lightbulb,
  Smartphone,
  Chrome,
  Star,
  Heart,
  RefreshCw
} from 'lucide-react';

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
  
  // Clean markdown formatting
  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
      .replace(/__(.*?)__/g, '$1')     // Remove bold __text__
      .replace(/_(.*?)_/g, '$1')       // Remove italic _text_
      .trim();
  };

  // Parse section with multiple pattern matching
  const parseSection = (content: string, sectionNumber: number, title: string): string => {
    const patterns = [
      new RegExp(`##\\s*\\*\\*${sectionNumber}\\.?\\s*${title}\\*\\*([\\s\\S]*?)(?=##\\s*\\*\\*|$)`, 'i'),
      new RegExp(`##\\s*${sectionNumber}\\.?\\s*\\*\\*${title}\\*\\*([\\s\\S]*?)(?=##|$)`, 'i'),
      new RegExp(`##\\s*${sectionNumber}\\.?\\s*${title}([\\s\\S]*?)(?=##|$)`, 'i'),
      new RegExp(`###?\\s*${title}([\\s\\S]*?)(?=###?|$)`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  };

  // Parse list items with better cleaning
  const parseListItems = (text: string): string[] => {
    if (!text) return [];
    
    const items = text.split('\n')
      .filter(line => line.trim().match(/^[-•*]\s+/))
      .map(item => cleanMarkdown(item.replace(/^[-•*]\s+/, '')))
      .filter(item => item.length > 0);
    
    return items;
  };

  // Parse paragraphs with markdown cleaning
  const parseParagraphs = (text: string): string[] => {
    if (!text) return [];
    
    return text
      .split('\n\n')
      .map(p => cleanMarkdown(p.trim()))
      .filter(p => p && !p.match(/^[-•*]\s/) && !p.match(/^##/))
      .filter(p => p.length > 10);
  };

  // Parse the content
  const section1 = parseSection(content, 1, 'Personalized Assessment');
  const section2 = parseSection(content, 2, 'Understanding Your Condition');
  const section3 = parseSection(content, 3, 'Career Paths - Highly Recommended');
  const section4 = parseSection(content, 4, 'Careers Requiring Accommodations');
  const section5 = parseSection(content, 5, 'Careers to Avoid');
  const section6 = parseSection(content, 6, 'Assistive Technology & Tools');
  const section7 = parseSection(content, 7, 'Success Strategies');
  const section8 = parseSection(content, 8, 'Closing Encouragement');

  const hasParsedSections = section1 || section2 || section3;

  return (
    <div className="space-y-6">
      
      {/* Modern Header with Glassmorphism */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-8 text-white">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
          >
            <Briefcase size={40} className="text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-3 tracking-tight">AI Career Guidance</h2>
          <p className="text-purple-100 text-lg">Personalized recommendations powered by Gemini AI</p>
          
          {/* Regenerate Button */}
          {onRegenerate && (
            <motion.button
              onClick={onRegenerate}
              className="mt-6 inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={18} className="mr-2" />
              Generate New Recommendation
            </motion.button>
          )}
        </div>
      </div>

      {/* Section 1: Personalized Assessment */}
      {section1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Your Results & What They Mean</h3>
          </div>
          
          <div className="prose prose-sm max-w-none mb-4">
            {parseParagraphs(section1).map((para, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed mb-3 text-base">
                {para}
              </p>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center text-base">
                <span className="mr-2">📊</span> Your Condition
              </h4>
              <p className="text-sm text-gray-700 capitalize font-medium">
                {deficiencyType} - {severity}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
              <h4 className="font-semibold text-pink-900 mb-2 flex items-center text-base">
                <span className="mr-2">💪</span> You&apos;re Not Alone
              </h4>
              <p className="text-sm text-gray-700">Affects millions worldwide</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 2: Understanding Your Condition */}
      {section2 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Understanding Your Vision</h3>
          </div>

          <div className="prose prose-sm max-w-none">
            {parseParagraphs(section2).map((para, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed mb-3 text-base">
                {para}
              </p>
            ))}
          </div>

          {parseListItems(section2).length > 0 && (
            <div className="bg-white rounded-xl p-4 mt-4 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 text-base">Key Points:</h4>
              <div className="space-y-2">
                {parseListItems(section2).map((item, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-green-600 mr-3 mt-1 text-lg">•</span>
                    <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Section 3: Career Paths - Highly Recommended - SAME DESIGN AS SECTION 4 */}
      {section3 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <span className="text-white font-bold text-xl">3</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <CheckCircle className="mr-2 text-emerald-600" size={28} />
              Perfect Career Matches
            </h3>
          </div>

          <div className="prose prose-sm max-w-none mb-4">
            {parseParagraphs(section3).map((para, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed mb-3 text-base">
                {para}
              </p>
            ))}
          </div>

          {parseListItems(section3).length > 0 && (
            <div className="space-y-3">
              {parseListItems(section3).map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-emerald-200">
                  <div className="flex items-start">
                    <CheckCircle size={18} className="text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Section 4: Careers Requiring Accommodations */}
      {section4 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <span className="text-white font-bold text-xl">4</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="mr-2 text-amber-600" size={28} />
              Careers Requiring Accommodations
            </h3>
          </div>

          <div className="prose prose-sm max-w-none mb-4">
            {parseParagraphs(section4).map((para, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed mb-3 text-base">
                {para}
              </p>
            ))}
          </div>

          {parseListItems(section4).length > 0 && (
            <div className="space-y-3">
              {parseListItems(section4).map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-amber-200">
                  <div className="flex items-start">
                    <AlertTriangle size={18} className="text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Section 5: Careers to Avoid */}
      {section5 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100 shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <span className="text-white font-bold text-xl">5</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <XCircle className="mr-2 text-red-600" size={28} />
              Careers Not Recommended
            </h3>
          </div>

          {parseListItems(section5).length > 0 ? (
            <div className="space-y-3">
              {parseListItems(section5).map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-red-200">
                  <div className="flex items-start">
                    <XCircle size={18} className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              {parseParagraphs(section5).map((para, idx) => (
                <p key={idx} className="text-gray-700 leading-relaxed mb-3 text-base">
                  {para}
                </p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Section 6: Assistive Technology */}
      {section6 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100 shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <span className="text-white font-bold text-xl">6</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">🛠️ Tools & Technology</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center text-base">
                <Smartphone className="mr-2" size={20} />
                Mobile Apps & Tools
              </h4>
              <div className="space-y-2">
                {parseListItems(section6).slice(0, Math.ceil(parseListItems(section6).length / 2)).map((item, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-blue-600 mr-2 text-lg">•</span>
                    <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center text-base">
                <Chrome className="mr-2" size={20} />
                Software & Resources
              </h4>
              <div className="space-y-2">
                {parseListItems(section6).slice(Math.ceil(parseListItems(section6).length / 2)).map((item, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-green-600 mr-2 text-lg">•</span>
                    <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 7: Success Strategies */}
      {section7 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
              <span className="text-white font-bold text-xl">7</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <Lightbulb className="mr-2 text-indigo-600" size={28} />
              Success Strategies
            </h3>
          </div>

          <div className="grid gap-3">
            {parseListItems(section7).map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-indigo-200">
                <div className="flex items-start">
                  <CheckCircle size={18} className="text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Section 8: Closing Encouragement */}
      {section8 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-8 text-white shadow-xl"
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 text-center">
            <h3 className="text-3xl font-bold mb-4 flex items-center justify-center">
              <Star className="mr-3" size={32} />
              You&apos;ve Got This!
            </h3>
            <div className="prose prose-lg max-w-none text-white">
              {parseParagraphs(section8).map((para, idx) => (
                <p key={idx} className="text-lg mb-4 leading-relaxed opacity-95">
                  {para}
                </p>
              ))}
            </div>
            <div className="pt-6 mt-6 border-t border-white/30">
              <Heart className="mx-auto mb-3" size={40} />
              <p className="text-base text-purple-100">
                Remember: Many successful professionals have color vision deficiency and thrive in their careers.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fallback: Show cleaned raw content if sections not parsed */}
      {!hasParsedSections && content && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="prose prose-sm max-w-none">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Guidance</h3>
            {content.split('\n\n').map((para, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed mb-3 text-base">
                {cleanMarkdown(para)}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMResponseRenderer;