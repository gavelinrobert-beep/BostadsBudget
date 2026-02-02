'use client';

import { useState, FormEvent } from 'react';
import { 
  beraknaBostadskostnad, 
  beraknaKanslighetsAnalys,
  beraknaLangsiktigPrognos,
  beraknaKontantinsatsAlternativ,
  beraknaHyresJamforelse,
  BostadsInput, 
  BostadsResultat,
  KanslighetsAnalys,
  LangsiktigPrognos,
  KontantinsatsAlternativ
} from '@/lib/calculators';

// Default values for the calculator
const DEFAULT_INPUT: BostadsInput = {
  bostadspris: 3000000,
  kontantinsats: 450000,
  arsinkomst: 500000,
  arsranta: 0.045,
  driftkostnad: 3000,
  elkostnad: 800,
  renoveringskostnad: 200000,
  renoveringsintervall: 10,
  analysperiod: 10,
};

export default function Home() {
  // Input state with default values
  const [input, setInput] = useState<BostadsInput>(DEFAULT_INPUT);

  const [resultat, setResultat] = useState<BostadsResultat | null>(null);
  const [kanslighetsAnalys, setKanslighetsAnalys] = useState<KanslighetsAnalys | null>(null);
  const [langsiktigPrognos, setLangsiktigPrognos] = useState<LangsiktigPrognos[] | null>(null);
  const [kontantinsatsAlternativ, setKontantinsatsAlternativ] = useState<KontantinsatsAlternativ[] | null>(null);
  const [hyresJamforelse, setHyresJamforelse] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const validateInput = (): string | null => {
    if (input.bostadspris <= 0) {
      return 'Bostadspris måste vara större än 0';
    }
    if (input.kontantinsats < 0 || input.kontantinsats > input.bostadspris) {
      return 'Kontantinsats måste vara mellan 0 och bostadspriset';
    }
    if (input.arsranta < 0 || input.arsranta > 1) {
      return 'Årsränta måste vara mellan 0 och 100%';
    }
    if (input.renoveringsintervall <= 0) {
      return 'Renoveringsintervall måste vara större än 0';
    }
    return null;
  };

  // Handle calculation
  const handleBerakna = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      setResultat(null);
      return;
    }

    try {
      const result = beraknaBostadskostnad(input);
      setResultat(result);
      
      // Beräkna tilläggsanalyser
      const sensitivity = beraknaKanslighetsAnalys(input, result);
      setKanslighetsAnalys(sensitivity);
      
      const forecast = beraknaLangsiktigPrognos(input, result);
      setLangsiktigPrognos(forecast);
      
      const downPaymentOptions = beraknaKontantinsatsAlternativ(input);
      setKontantinsatsAlternativ(downPaymentOptions);
      
      const rental = beraknaHyresJamforelse(input.bostadspris);
      setHyresJamforelse(rental);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid beräkning');
      setResultat(null);
    }
  };

  // Handle reset
  const handleAterstall = () => {
    setInput(DEFAULT_INPUT);
    setResultat(null);
    setKanslighetsAnalys(null);
    setLangsiktigPrognos(null);
    setKontantinsatsAlternativ(null);
    setHyresJamforelse(null);
    setError(null);
  };

  // Format number with Swedish thousand separator
  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString('sv-SE');
  };

  // Format percentage
  const formatPercent = (num: number): string => {
    return (num * 100).toFixed(1);
  };

  // Skärpt amorteringskrav threshold (4.5 × årsinkomst)
  const SKARPT_KRAV_MULTIPLIKATOR = 4.5;

  // Get color for loan-to-value ratio
  const getBelåningsgradColor = (ltv: number): string => {
    if (ltv < 0.5) return 'bg-green-600'; // < 50%
    if (ltv < 0.7) return 'bg-yellow-500'; // 50-70%
    if (ltv < 0.85) return 'bg-orange-500'; // 70-85%
    return 'bg-red-600'; // > 85%
  };

  const getBelåningsgradTextColor = (ltv: number): string => {
    if (ltv < 0.5) return 'text-green-700';
    if (ltv < 0.7) return 'text-yellow-700';
    if (ltv < 0.85) return 'text-orange-700';
    return 'text-red-700';
  };

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Bostadsbudgetskalkylator",
    "description": "Räkna ut din verkliga boendekostnad inklusive renovering och energi",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "SEK"
    },
    "featureList": [
      "Beräkna månadskostnad för boende",
      "Inkludera renovering och energikostnader",
      "Beräkna belåningsgrad",
      "Amorteringskrav enligt svenska regler"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">
              Bostadsbudgetskalkylator
            </h1>
            <p className="text-xl text-blue-700 font-medium mb-4">
              Se den verkliga kostnaden innan du köper
            </p>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Få en komplett bild av dina boendekostnader. Vårt verktyg räknar inte bara på 
              lån och ränta, utan tar hänsyn till drift, el, och framtida renoveringar. 
              Dessutom får du känslighetsanalyser och långsiktiga prognoser för att fatta 
              ett välgrundat beslut.
            </p>
          </header>

        {/* Form */}
        <form onSubmit={handleBerakna} className="space-y-6 mb-8">
          {/* Section: Bostad & Lån */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              Bostad & Lån
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bostadspris */}
              <div>
                <label htmlFor="bostadspris" className="block text-sm font-medium text-gray-700 mb-2">
                  Bostadspris (kr) <span className="text-gray-400 text-xs cursor-help" title="Totalt pris för bostaden enligt köpekontrakt">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="bostadspris"
                  value={input.bostadspris}
                  onChange={(e) => setInput({ ...input, bostadspris: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Kontantinsats */}
              <div>
                <label htmlFor="kontantinsats" className="block text-sm font-medium text-gray-700 mb-2">
                  Kontantinsats (kr) <span className="text-gray-400 text-xs cursor-help" title="Din egen insats, minst 15% av priset krävs i Sverige">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="kontantinsats"
                  value={input.kontantinsats}
                  onChange={(e) => setInput({ ...input, kontantinsats: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Årsinkomst */}
              <div>
                <label htmlFor="arsinkomst" className="block text-sm font-medium text-gray-700 mb-2">
                  Årsinkomst (kr) <span className="text-gray-500 text-xs">(valfritt)</span> <span className="text-gray-400 text-xs cursor-help" title="Din bruttoinkomst per år. Används för att beräkna skärpt amorteringskrav">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="arsinkomst"
                  value={input.arsinkomst || ''}
                  onChange={(e) => setInput({ ...input, arsinkomst: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Årsränta */}
              <div>
                <label htmlFor="arsranta" className="block text-sm font-medium text-gray-700 mb-2">
                  Årsränta (%) <span className="text-gray-400 text-xs cursor-help" title="Aktuell bolåneränta. Genomsnitt idag: 4-5%">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="arsranta"
                  step="0.1"
                  value={(input.arsranta * 100).toString()}
                  onChange={(e) => setInput({ ...input, arsranta: Number(e.target.value) / 100 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="decimal"
                />
              </div>
            </div>
          </div>

          {/* Section: Driftkostnader */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              Driftkostnader
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driftkostnad */}
              <div>
                <label htmlFor="driftkostnad" className="block text-sm font-medium text-gray-700 mb-2">
                  Driftkostnad (kr/mån) <span className="text-gray-400 text-xs cursor-help" title="Avgift, försäkring, sophämtning etc. Vanligt: 2000-4000 kr/mån">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="driftkostnad"
                  value={input.driftkostnad}
                  onChange={(e) => setInput({ ...input, driftkostnad: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Elkostnad */}
              <div>
                <label htmlFor="elkostnad" className="block text-sm font-medium text-gray-700 mb-2">
                  Elkostnad (kr/mån) <span className="text-gray-400 text-xs cursor-help" title="Uppskattad elkostnad per månad. Vanligt: 500-1500 kr/mån">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="elkostnad"
                  value={input.elkostnad}
                  onChange={(e) => setInput({ ...input, elkostnad: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* Section: Renovering & Planering */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              Renovering & Planering
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Renoveringskostnad */}
              <div>
                <label htmlFor="renoveringskostnad" className="block text-sm font-medium text-gray-700 mb-2">
                  Renoveringskostnad (kr) <span className="text-gray-400 text-xs cursor-help" title="Totalkostnad för planerad renovering (t.ex. kök 300 000 kr)">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="renoveringskostnad"
                  value={input.renoveringskostnad}
                  onChange={(e) => setInput({ ...input, renoveringskostnad: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Renoveringsintervall */}
              <div>
                <label htmlFor="renoveringsintervall" className="block text-sm font-medium text-gray-700 mb-2">
                  Renoveringsintervall (år) <span className="text-gray-400 text-xs cursor-help" title="Hur ofta behöver renoveringen göras? Kök: ~15 år, Badrum: ~20 år">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="renoveringsintervall"
                  value={input.renoveringsintervall}
                  onChange={(e) => setInput({ ...input, renoveringsintervall: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Analysperiod */}
              <div>
                <label htmlFor="analysperiod" className="block text-sm font-medium text-gray-700 mb-2">
                  Analysperiod (år) <span className="text-gray-400 text-xs cursor-help" title="Hur många år framåt vill du planera? Rekommenderat: 10-15 år">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="analysperiod"
                  value={input.analysperiod}
                  onChange={(e) => setInput({ ...input, analysperiod: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200"
            >
              Beräkna
            </button>
            <button
              type="button"
              onClick={handleAterstall}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-md transition duration-200"
            >
              Återställ
            </button>
          </div>
        </form>

        {/* Results */}
        {resultat && (
          <div className="space-y-6">
            {/* Three large cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total monthly cost */}
              <div className="bg-blue-600 text-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium mb-2">Total månadskostnad</h3>
                <p className="text-3xl font-bold">{formatNumber(resultat.totalPerManad)} kr</p>
              </div>

              {/* Total yearly cost */}
              <div className="bg-green-600 text-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium mb-2">Total årskostnad</h3>
                <p className="text-3xl font-bold">{formatNumber(resultat.totalPerAr)} kr</p>
              </div>

              {/* LTV percentage with color coding */}
              <div className={`${getBelåningsgradColor(resultat.belåningsgrad)} text-white rounded-lg shadow-lg p-6`}>
                <h3 className="text-lg font-medium mb-2">Belåningsgrad</h3>
                <p className="text-3xl font-bold">{formatPercent(resultat.belåningsgrad)}{'\u00A0'}%</p>
                {/* Progress bar */}
                <div className="mt-3 bg-white bg-opacity-30 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(resultat.belåningsgrad * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Monthly breakdown */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Uppdelning per månad</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 font-medium">Lån (ränta + amortering)</span>
                  <span className="text-gray-900 font-semibold">{formatNumber(resultat.lanePerManad)} kr</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 font-medium">Drift + El</span>
                  <span className="text-gray-900 font-semibold">{formatNumber(resultat.driftOchElPerManad)} kr</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 font-medium">Renovering (snitt)</span>
                  <span className="text-gray-900 font-semibold">{formatNumber(resultat.renoveringPerManad)} kr</span>
                </div>
              </div>
            </div>

            {/* Loan details with enhanced amortization explanation */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Låneuppgifter</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 font-medium">Lånebelopp</span>
                  <span className="text-gray-900 font-semibold">{formatNumber(resultat.lanebelopp)} kr</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 font-medium">Amorteringskrav</span>
                  <span className="text-gray-900 font-semibold">{formatPercent(resultat.amorteringsprocent)}{'\u00A0'}%</span>
                </div>
                
                {/* Enhanced amortization explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
                  <p className="text-gray-800 font-semibold mb-3">
                    Ditt amorteringskrav är {formatPercent(resultat.amorteringsprocent)}% per år eftersom:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">
                        Belåningsgrad {formatPercent(resultat.belåningsgrad)}% 
                        {resultat.belåningsgrad > 0.7 ? ' (över 70%)' : resultat.belåningsgrad > 0.5 ? ' (över 50%)' : ' (under 50%)'} 
                        {' → '}{formatPercent(resultat.amorteringsprocentGrundkrav)}%
                      </span>
                    </li>
                    {resultat.harSkarptKrav && (
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-gray-700">
                          Lån {formatNumber(resultat.lanebelopp)} kr {'>'} {SKARPT_KRAV_MULTIPLIKATOR} × årsinkomst {input.arsinkomst ? formatNumber(input.arsinkomst) : ''} kr ({input.arsinkomst ? formatNumber(SKARPT_KRAV_MULTIPLIKATOR * input.arsinkomst) : ''} kr)
                          {' → '} +{formatPercent(resultat.amorteringsprocentSkarptKrav)}% (skärpt krav)
                        </span>
                      </li>
                    )}
                    <li className="border-t pt-2 mt-2">
                      <span className="text-gray-800 font-semibold">
                        = Totalt: {formatPercent(resultat.amorteringsprocent)}% per år
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 font-medium">Ränta per år</span>
                  <span className="text-gray-900 font-semibold">{formatNumber(resultat.rantaPerAr)} kr</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 font-medium">Amortering per år</span>
                  <span className="text-gray-900 font-semibold">{formatNumber(resultat.amorteringPerAr)} kr</span>
                </div>
              </div>
            </div>

            {/* Rental comparison */}
            {hyresJamforelse && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Jämförelse med hyresrätt</h2>
                <p className="text-gray-700">
                  Din boendekostnad är <span className="font-bold text-blue-600">{formatNumber(resultat.totalPerManad)} kr/mån</span>. 
                  För en hyresrätt av motsvarande storlek: ~<span className="font-bold">{formatNumber(hyresJamforelse)} kr/mån</span>.
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  (Baserat på schablonen 150 kr/kvm)
                </p>
              </div>
            )}

            {/* Sensitivity analysis */}
            {kanslighetsAnalys && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Känslighetsanalys - "Vad händer om..."</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-md">
                    <span className="text-gray-700">
                      <span className="font-medium">📈 Räntan ökar med +1%:</span>
                    </span>
                    <span className="text-gray-900 font-bold">{formatNumber(kanslighetsAnalys.rantaPlus1)} kr/mån</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-md">
                    <span className="text-gray-700">
                      <span className="font-medium">📈📈 Räntan ökar med +2%:</span>
                    </span>
                    <span className="text-gray-900 font-bold">{formatNumber(kanslighetsAnalys.rantaPlus2)} kr/mån</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                    <span className="text-gray-700">
                      <span className="font-medium">⚡ El-priset fördubblas:</span>
                    </span>
                    <span className="text-gray-900 font-bold">{formatNumber(kanslighetsAnalys.elFordubblas)} kr/mån</span>
                  </div>
                </div>
              </div>
            )}

            {/* Long-term forecast */}
            {langsiktigPrognos && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Långsiktig prognos</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 text-sm">
                  <p className="text-yellow-800">
                    ⚠️ <strong>Förenklad beräkning:</strong> Denna prognos använder konstant månadskostnad och tar inte hänsyn till 
                    att räntekostnaden sjunker när lånet amorteras. Den verkliga kostnaden kommer därför att vara något lägre över tid.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2 px-2">År</th>
                        <th className="text-right py-2 px-2">Kvarvarande lån</th>
                        <th className="text-right py-2 px-2">Ackumulerad amortering</th>
                        <th className="text-right py-2 px-2">Total kostnad hittills</th>
                        <th className="text-right py-2 px-2">Uppskattat värde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {langsiktigPrognos.map((prognos) => (
                        <tr key={prognos.ar} className="border-b border-gray-200">
                          <td className="py-2 px-2 font-medium">{prognos.ar}</td>
                          <td className="text-right py-2 px-2">{formatNumber(prognos.kvarandelLan)} kr</td>
                          <td className="text-right py-2 px-2">{formatNumber(prognos.ackumuleradAmortering)} kr</td>
                          <td className="text-right py-2 px-2">{formatNumber(prognos.totalKostnad)} kr</td>
                          <td className="text-right py-2 px-2">{formatNumber(prognos.uppskattatVarde)} kr</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-600 text-sm mt-3">
                  * Uppskattat värde baserat på 2% värdestegring per år
                </p>
              </div>
            )}

            {/* Down payment optimization */}
            {kontantinsatsAlternativ && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Kontantinsats-optimering</h2>
                <p className="text-gray-700 mb-4">
                  Se hur olika kontantinsatser påverkar din månadskostnad och amorteringskrav:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2 px-2">Kontantinsats</th>
                        <th className="text-right py-2 px-2">Belåningsgrad</th>
                        <th className="text-right py-2 px-2">Amorteringskrav</th>
                        <th className="text-right py-2 px-2">Månadskostnad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kontantinsatsAlternativ.map((alt) => {
                        const isCurrent = Math.abs(alt.kontantinsatsBelopp - input.kontantinsats) < 1000;
                        return (
                          <tr 
                            key={alt.kontantinsatsProcent} 
                            className={`border-b border-gray-200 ${isCurrent ? 'bg-blue-100 font-semibold' : ''}`}
                          >
                            <td className="py-2 px-2">
                              {alt.kontantinsatsProcent}% ({formatNumber(alt.kontantinsatsBelopp)} kr)
                              {isCurrent && ' ← Nuvarande'}
                            </td>
                            <td className="text-right py-2 px-2">{formatPercent(alt.belåningsgrad)}%</td>
                            <td className="text-right py-2 px-2">{formatPercent(alt.amorteringskrav)}%</td>
                            <td className="text-right py-2 px-2">{formatNumber(alt.manadskostnad)} kr</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </main>
    </>
  );
}
