'use client';

import { BostadsTyp } from '@/lib/calculators';
import { Building2, Home, Home as Houses, Hammer } from 'lucide-react';

interface HousingTypeSelectorProps {
  selectedType: BostadsTyp;
  onChange: (type: BostadsTyp) => void;
}

const housingTypes = [
  {
    type: 'bostadsratt' as BostadsTyp,
    icon: Building2,
    label: 'Bostadsrätt',
    description: 'Lägenhet i bostadsrättsförening',
    emoji: '🏢',
  },
  {
    type: 'villa' as BostadsTyp,
    icon: Home,
    label: 'Villa (fristående)',
    description: 'Fristående småhus på egen tomt',
    emoji: '🏠',
  },
  {
    type: 'radhus' as BostadsTyp,
    icon: Houses,
    label: 'Radhus/Parhus',
    description: 'Kedjehus eller parhus',
    emoji: '🏘️',
  },
  {
    type: 'nyproduktion' as BostadsTyp,
    icon: Hammer,
    label: 'Nyproduktion',
    description: 'Ny bostad från byggföretag',
    emoji: '🏗️',
  },
];

export default function HousingTypeSelector({ selectedType, onChange }: HousingTypeSelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <div className="mb-8 pb-6 border-b-2 border-green-200 dark:border-green-800">
        <div className="flex items-center mb-3">
          <Building2 className="w-8 h-8 mr-3 text-green-600 dark:text-green-400" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Typ av bostad
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
          Välj typ av bostad för korrekta beräkningar av lagfart och pantbrev
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {housingTypes.map((housing) => {
          const Icon = housing.icon;
          const isSelected = selectedType === housing.type;

          return (
            <button
              key={housing.type}
              type="button"
              onClick={() => onChange(housing.type)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                ${
                  isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg transform scale-105'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md'
                }
              `}
            >
              {/* Checkmark for selected */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Icon/Emoji */}
              <div className="flex items-center justify-center mb-4">
                <span className="text-5xl">{housing.emoji}</span>
              </div>

              {/* Label */}
              <h3 className={`text-lg font-bold text-center mb-2 ${
                isSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-gray-200'
              }`}>
                {housing.label}
              </h3>

              {/* Description */}
              <p className={`text-xs text-center ${
                isSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {housing.description}
              </p>

              {/* Selection indicator */}
              {isSelected && (
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    Vald
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Additional info based on selection */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Valt: {housingTypes.find(h => h.type === selectedType)?.label}</span>
          {' - '}
          Beräkningar justeras automatiskt för lagfart, pantbrev och andra kostnader.
        </p>
      </div>
    </div>
  );
}
