'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Home as HomeIcon, 
  Calendar,
  DollarSign,
  Share2,
  FileDown,
  Building,
  Receipt,
  Banknote,
  ChevronDown
} from 'lucide-react';
import CountUp from 'react-countup';
import { Engangskostnader, BostadsResultat } from '@/lib/calculators';

interface FirstYearTotalCostProps {
  engangskostnader: Engangskostnader;
  resultat: BostadsResultat;
  bostadspris: number;
  bostadsyta?: number;
  kontantinsats: number;
}

const formatNumber = (num: number): string => {
  return Math.round(num).toLocaleString('sv-SE');
};

export default function FirstYearTotalCost({
  engangskostnader,
  resultat,
  bostadspris,
  bostadsyta,
  kontantinsats,
}: FirstYearTotalCostProps) {
  const [showComparison, setShowComparison] = useState(true);

  // Calculate first year totals
  const engangBetalningVidKop = 
    kontantinsats + 
    engangskostnader.lagfart + 
    engangskostnader.pantbrev + 
    engangskostnader.maklarkostnad + 
    engangskostnader.ovrigt;
  
  const lopandeForstaAret = resultat.totalPerAr;
  const totaltAr1 = engangBetalningVidKop + lopandeForstaAret;
  const genomsnittPerManad = totaltAr1 / 12;

  // Calculate rental comparison if housing area is available
  const hyresuppskattning = bostadsyta ? bostadsyta * 1500 * 12 : null; // 1500 kr/m² per månad är ungefär genomsnitt
  const skillnadMotHyra = hyresuppskattning ? totaltAr1 - hyresuppskattning : null;
  
  // Calculate equity position
  const amorteringAr1 = resultat.amorteringPerAr;
  const egetKapital = kontantinsats + amorteringAr1;

  return (
    <div className="space-y-6">
      {/* Main First Year Total Cost Card */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-yellow-900/30 rounded-2xl shadow-2xl p-8 border-4 border-amber-300 dark:border-amber-700 hover:shadow-3xl transition-all duration-300 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 flex items-center">
            💰 Första årets totalkostnad
          </h2>
          <div className="flex gap-2">
            <button 
              className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Dela"
            >
              <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button 
              className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Exportera"
            >
              <FileDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Engångsbetalning vid köp */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Receipt className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Engångsbetalning vid köp:
          </h3>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <span className="text-gray-400 mr-3">├─</span>
                <span className="text-gray-700 dark:text-gray-300">Kontantinsats</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatNumber(kontantinsats)} kr
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <span className="text-gray-400 mr-3">├─</span>
                <span className="text-gray-700 dark:text-gray-300">Lagfart</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatNumber(engangskostnader.lagfart)} kr
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <span className="text-gray-400 mr-3">├─</span>
                <span className="text-gray-700 dark:text-gray-300">Pantbrev</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatNumber(engangskostnader.pantbrev)} kr
              </span>
            </div>
            {engangskostnader.maklarkostnad > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">├─</span>
                  <span className="text-gray-700 dark:text-gray-300">Mäklare</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatNumber(engangskostnader.maklarkostnad)} kr
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <span className="text-gray-400 mr-3">└─</span>
                <span className="text-gray-700 dark:text-gray-300">Övrigt</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatNumber(engangskostnader.ovrigt)} kr
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-2 border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Summa:</span>
              <span className="text-2xl font-black text-purple-700 dark:text-purple-300">
                {formatNumber(engangBetalningVidKop)} kr
              </span>
            </div>
          </div>
        </div>

        {/* Löpande första året */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Löpande första året:
          </h3>
          <div className="ml-6">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <span className="text-gray-400 mr-3">└─</span>
                <span className="text-gray-700 dark:text-gray-300">Boendekostnad (12 månader)</span>
              </div>
              <span className="text-2xl font-black text-green-700 dark:text-green-300">
                {formatNumber(lopandeForstaAret)} kr
              </span>
            </div>
          </div>
        </div>

        {/* Total First Year */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/90 mb-1">═══════════════════════════════════</p>
              <h3 className="text-2xl font-black text-white flex items-center">
                <HomeIcon className="w-8 h-8 mr-3" />
                TOTALT ÅR 1:
              </h3>
            </div>
            <div className="text-right">
              <span className="text-5xl font-black text-white">
                <CountUp end={totaltAr1} duration={2.5} separator=" " /> kr
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Average */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
            <p className="text-lg text-gray-900 dark:text-gray-100">
              <span className="font-normal">💡 Detta motsvarar </span>
              <span className="font-black text-blue-700 dark:text-blue-300">
                {formatNumber(genomsnittPerManad)} kr/mån
              </span>
              <span className="font-normal"> i snitt</span>
            </p>
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
            (ink. engångskostnader fördelat över första året)
          </p>
        </div>
      </div>

      {/* Rental Comparison */}
      {hyresuppskattning && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              📊 Jämförelse med hyra första året
            </h3>
            <ChevronDown
              className={`w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${
                showComparison ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showComparison && (
            <div className="mt-6 space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hyra (uppskattad {bostadsyta} m²)</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatNumber(hyresuppskattning)} kr
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Baserat på ca {formatNumber((bostadsyta || 0) * 1500)} kr/mån
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Din totalkostnad</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {formatNumber(totaltAr1)} kr
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Inkl. alla engångskostnader
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${
                skillnadMotHyra && skillnadMotHyra > 0
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
              }`}>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {skillnadMotHyra && skillnadMotHyra > 0 ? (
                    <>
                      Skillnad: <span className="text-orange-700 dark:text-orange-300">
                        +{formatNumber(Math.abs(skillnadMotHyra))} kr
                      </span> mer än hyra
                    </>
                  ) : (
                    <>
                      Skillnad: <span className="text-green-700 dark:text-green-300">
                        -{formatNumber(Math.abs(skillnadMotHyra || 0))} kr
                      </span> mindre än hyra
                    </>
                  )}
                </p>
              </div>

              {/* Equity Position */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border-2 border-green-300 dark:border-green-700">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                  💎 Men glöm inte:
                </h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <Building className="w-5 h-5 mr-2 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>
                      Du äger nu en bostad värd{' '}
                      <span className="font-bold text-green-700 dark:text-green-300">
                        {formatNumber(bostadspris)} kr
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Banknote className="w-5 h-5 mr-2 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>
                      Du har betalat av{' '}
                      <span className="font-bold text-green-700 dark:text-green-300">
                        {formatNumber(amorteringAr1)} kr
                      </span>{' '}
                      på lånet
                    </span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t-2 border-green-300 dark:border-green-700">
                  <p className="text-xl font-black text-green-800 dark:text-green-200">
                    Ditt reella kapital: {formatNumber(egetKapital)} kr
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-lg p-6 border border-indigo-200 dark:border-indigo-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
          📋 Nästa steg
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold py-3 px-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 transition-all duration-200 hover:scale-105 flex items-center justify-center">
            <FileDown className="w-5 h-5 mr-2" />
            Exportera till PDF
          </button>
          <button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold py-3 px-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 transition-all duration-200 hover:scale-105 flex items-center justify-center">
            <Share2 className="w-5 h-5 mr-2" />
            Dela med partner/familj
          </button>
          <button className="bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center col-span-1 md:col-span-2">
            <DollarSign className="w-5 h-5 mr-2" />
            Boka möte med bank
          </button>
        </div>
      </div>
    </div>
  );
}
