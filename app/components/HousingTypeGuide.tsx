'use client';

import { useState } from 'react';
import { BostadsTyp } from '@/lib/calculators';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HousingTypeGuideProps {
  selectedType: BostadsTyp;
  onChange: (type: BostadsTyp) => void;
}

interface HousingTypeInfo {
  type: BostadsTyp;
  emoji: string;
  label: string;
  pros: string[];
  cons: string[];
  suitsYou: string[];
}

const housingTypeInfo: HousingTypeInfo[] = [
  {
    type: 'bostadsratt',
    emoji: '🏢',
    label: 'Bostadsrätt',
    pros: [
      'Lägre engångskostnader (ingen lagfart/pantbrev)',
      'Föreningen sköter yttre underhåll',
      'Ofta centralt läge',
      'Lägre ansvar för dig',
    ],
    cons: [
      'Högre månadskostnad (föreningsavgift)',
      'Mindre frihet att göra ändringar',
      'Kan ha svårare att sälja',
      'Risk för föreningen (dålig ekonomi)',
    ],
    suitsYou: [
      'Vill bo centralt',
      'Inte vill ha ansvar för underhåll',
      'Förstagångsköpare',
      'Har lägre kontantinsats',
    ],
  },
  {
    type: 'villa',
    emoji: '🏠',
    label: 'Villa',
    pros: [
      'Full frihet att göra ändringar',
      'Egen tomt och trädgård',
      'Ingen föreningsavgift',
      'Ofta värdestegring',
    ],
    cons: [
      'Högre engångskostnader (lagfart + pantbrev)',
      'Du ansvarar för ALLT underhåll',
      'Högre elkostnad (ofta)',
      'Snöröjning, gräsklippning etc',
    ],
    suitsYou: [
      'Vill ha egen trädgård',
      'Är händig eller har budget för underhåll',
      'Vill ha full kontroll',
      'Har högre kontantinsats',
    ],
  },
  {
    type: 'radhus',
    emoji: '🏘️',
    label: 'Radhus/Parhus',
    pros: [
      'Balans mellan villa och lägenhet',
      'Ofta egen tomt men mindre ansvar',
      'Gemensamt ansvar för vissa delar',
      'Ofta barnvänliga områden',
    ],
    cons: [
      'Engångskostnader som villa',
      'Kan ha föreningsavgift',
      'Delade väggar (ljud)',
      'Regler från föreningen',
    ],
    suitsYou: [
      'Vill ha både och',
      'Familj med barn',
      'Vill ha någon tomt men inte fullt ansvar',
    ],
  },
  {
    type: 'nyproduktion',
    emoji: '🏗️',
    label: 'Nyproduktion',
    pros: [
      'Modern standard',
      'Lägre energikostnader',
      'Ingen renovering på många år',
      'Ofta garantier',
    ],
    cons: [
      'Ofta högre pris per kvm',
      'Området kanske inte färdigbyggt',
      'Risk för förseningar',
      'Mindre förhandlingsutrymme',
    ],
    suitsYou: [
      'Vill ha nytt och fräscht',
      'Inte vill renovera',
      'Har högre budget',
      'Kan vänta på inflyttning',
    ],
  },
];

export default function HousingTypeGuide({ selectedType, onChange }: HousingTypeGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center">
          <span className="text-2xl mr-3">💡</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Hjälp mig välja bostadstyp
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {housingTypeInfo.map((info) => (
            <div
              key={info.type}
              className="border border-gray-200 dark:border-gray-600 rounded-xl p-5 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{info.emoji}</span>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {info.label}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(info.type)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center"
                >
                  👉 Välj {info.label}
                </button>
              </div>

              {/* Pros */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Fördelar:
                </h5>
                <ul className="space-y-2">
                  {info.pros.map((pro, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✅</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nackdelar:
                </h5>
                <ul className="space-y-2">
                  {info.cons.map((con, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2 mt-0.5">❌</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suits You */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Passar dig som:
                </h5>
                <ul className="space-y-1">
                  {info.suitsYou.map((suit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span className="text-sm text-blue-800 dark:text-blue-300">{suit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
