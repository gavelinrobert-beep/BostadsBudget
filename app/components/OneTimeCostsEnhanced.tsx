'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Info,
  AlertCircle
} from 'lucide-react';
import CountUp from 'react-countup';
import { Engangskostnader } from '@/lib/calculators';

interface OneTimeCostsEnhancedProps {
  engangskostnader: Engangskostnader;
  kontantinsats: number;
  totalPerManad: number;
  renoveringskostnad: number;
  arsinkomst?: number;
}

const formatNumber = (num: number): string => {
  return Math.round(num).toLocaleString('sv-SE');
};

export default function OneTimeCostsEnhanced({
  engangskostnader,
  kontantinsats,
  totalPerManad,
  renoveringskostnad,
  arsinkomst,
}: OneTimeCostsEnhancedProps) {
  const [showChecklist, setShowChecklist] = useState(false);
  const [showSavingsCalc, setShowSavingsCalc] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // Calculate comparison metrics
  const sparande = kontantinsats;
  const totaltBehov = engangskostnader.totalt;
  const skillnad = sparande - totaltBehov;
  const harTillrackligt = skillnad >= 0;
  const procentSparande = Math.min((sparande / totaltBehov) * 100, 100);
  const procentBehov = 100;

  // Calculate buffer recommendation (10% of one-time costs)
  const rekommenderadBuffert = Math.round(totaltBehov * 0.1);

  // Checklist items
  const checklistItems = [
    {
      label: 'Kontantinsats (15% minimum)',
      info: 'Minst 15% av köpeskillingen krävs för att få bolån',
      checked: kontantinsats >= totaltBehov * 0.15,
    },
    {
      label: `Lagfart (1.5% av köpesumma)`,
      info: 'Statlig avgift för att registrera ditt ägande',
      checked: true,
    },
    {
      label: 'Pantbrev (2% av lån, om nya behövs)',
      info: 'Säkerhet för lånet som registreras hos Lantmäteriet',
      checked: true,
    },
    {
      label: 'Besiktning (5 000-15 000 kr)',
      info: 'Teknisk undersökning av bostadens skick',
      checked: false,
    },
    {
      label: 'Hemförsäkring (från inflyttning)',
      info: 'Obligatoriskt vid lägenhet, starkt rekommenderat vid villa',
      checked: false,
    },
    {
      label: 'Flyttkostnad (5 000-30 000 kr)',
      info: 'Beroende på om du flyttar själv eller använder flyttfirma',
      checked: false,
    },
    {
      label: 'Möbler och inredning',
      info: 'Budgetera för nödvändiga möbler och inredning',
      checked: false,
    },
    {
      label: 'Buffert för oförutsett (10% rekommenderas)',
      info: 'För oväntade kostnader som kan uppstå vid köpet',
      checked: false,
    },
  ];

  // Calculate savings needed if insufficient
  const savingsNeeded = harTillrackligt ? 0 : Math.abs(skillnad);
  const savingsOptions = [
    { months: 12, amount: savingsNeeded / 12, realistic: false },
    { months: 24, amount: savingsNeeded / 24, realistic: true },
    { months: 36, amount: savingsNeeded / 36, realistic: true },
  ];

  // Determine realism based on income if provided
  if (arsinkomst) {
    const monthlyIncome = arsinkomst / 12;
    savingsOptions[0].realistic = savingsOptions[0].amount < monthlyIncome * 0.3;
    savingsOptions[1].realistic = savingsOptions[1].amount < monthlyIncome * 0.25;
    savingsOptions[2].realistic = savingsOptions[2].amount < monthlyIncome * 0.2;
  }

  return (
    <div className="space-y-6">
      {/* 1. Comparison: Kontantinsats vs Totalt behov */}
      <div className={`rounded-xl shadow-lg p-6 border-2 transition-all duration-300 ${
        harTillrackligt
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
          : 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-300 dark:border-orange-700'
      }`}>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          {harTillrackligt ? (
            <CheckCircle2 className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
          ) : (
            <AlertTriangle className="w-6 h-6 mr-2 text-orange-600 dark:text-orange-400" />
          )}
          Jämförelse: Ditt sparande vs Behov
        </h3>
        
        <div className="space-y-4">
          {/* Ditt sparande */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ditt sparande:
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(sparande)} kr
              </span>
            </div>
            <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 flex items-center justify-end pr-2"
                style={{ width: `${procentSparande}%` }}
              >
                <span className="text-xs font-bold text-white">
                  {procentSparande.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Totalt behov dag 1 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Totalt behov dag 1:
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(totaltBehov)} kr
              </span>
            </div>
            <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-1000 flex items-center justify-end pr-2"
                style={{ width: `${procentBehov}%` }}
              >
                <span className="text-xs font-bold text-white">100%</span>
              </div>
            </div>
          </div>

          {/* Result message */}
          <div className={`mt-4 p-4 rounded-lg border-2 ${
            harTillrackligt
              ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
              : 'bg-orange-100 dark:bg-orange-900/30 border-orange-500'
          }`}>
            <p className={`font-bold flex items-center ${
              harTillrackligt
                ? 'text-green-800 dark:text-green-200'
                : 'text-orange-800 dark:text-orange-200'
            }`}>
              {harTillrackligt ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Du har {formatNumber(skillnad)} kr över för möbler och oförutsett
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Du behöver ytterligare {formatNumber(Math.abs(skillnad))} kr
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Timeline Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
            Tidslinje - När betalas vad?
          </h3>
          <ChevronDown
            className={`w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${
              showTimeline ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showTimeline && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            {/* Dag 1 */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-700">
              <h4 className="font-bold text-lg text-purple-900 dark:text-purple-100 mb-3 border-b border-purple-200 dark:border-purple-700 pb-2">
                Dag 1 (Köpet)
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Kontantinsats</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Lagfart</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Pantbrev</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Övrigt</span>
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-700">
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {formatNumber(totaltBehov)} kr
                </p>
              </div>
            </div>

            {/* Månad 1-12 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-700">
              <h4 className="font-bold text-lg text-green-900 dark:text-green-100 mb-3 border-b border-green-200 dark:border-green-700 pb-2">
                Månad 1-12
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Månadskostnad</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Ränta + Amortering</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Drift + El</span>
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-700">
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  {formatNumber(totalPerManad)} kr/mån
                </p>
              </div>
            </div>

            {/* År 2-10 */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-700">
              <h4 className="font-bold text-lg text-orange-900 dark:text-orange-100 mb-3 border-b border-orange-200 dark:border-orange-700 pb-2">
                År 2-10
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Renovering</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>(när intervall kommer)</span>
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-orange-200 dark:border-orange-700">
                <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  {formatNumber(renoveringskostnad)} kr
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. "Glöm inte"-checklista */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            📋 Komplett checklista för bostadsköp
          </h3>
          <ChevronDown
            className={`w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${
              showChecklist ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showChecklist && (
          <div className="mt-6 space-y-3 animate-fadeIn">
            {checklistItems.map((item, index) => (
              <div
                key={index}
                className="group flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.checked ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className={`font-medium ${
                    item.checked
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.label}
                  </p>
                  <div className="relative group/tooltip">
                    <div className="flex items-center mt-1">
                      <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.info}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Buffert-rekommendation */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-700">
        <div className="flex items-start">
          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              💡 Rekommenderad buffert: {formatNumber(rekommenderadBuffert)} kr
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detta motsvarar 10% av engångskostnaderna och täcker oförutsedda kostnader som kan uppstå vid köpet.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Sparberäkning (if needed) */}
      {!harTillrackligt && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowSavingsCalc(!showSavingsCalc)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              ⏰ För att spara till ditt bostadsköp
            </h3>
            <ChevronDown
              className={`w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${
                showSavingsCalc ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showSavingsCalc && (
            <div className="mt-6 animate-fadeIn">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                Saknas: <span className="font-bold text-red-600 dark:text-red-400">{formatNumber(savingsNeeded)} kr</span>
              </p>

              <div className="space-y-3">
                {savingsOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      option.realistic
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          På {option.months} månader:
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          Spara {formatNumber(option.amount)} kr/mån
                        </p>
                      </div>
                      {option.realistic && (
                        <div className="flex items-center text-green-600 dark:text-green-400 font-bold">
                          <CheckCircle className="w-5 h-5 mr-1" />
                          {option.months === 36 ? 'Rekommenderat' : 'Realistiskt'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {arsinkomst && (
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  * Färgkodning baserad på din årsinkomst ({formatNumber(arsinkomst)} kr/år)
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
