'use client';

import { useState, FormEvent } from 'react';
import { beraknaBostadskostnad, BostadsInput, BostadsResultat } from '@/lib/calculators';

export default function Home() {
  // Input state with default values
  const [input, setInput] = useState<BostadsInput>({
    bostadspris: 3000000,
    kontantinsats: 450000,
    arsinkomst: 500000,
    arsranta: 0.045,
    driftkostnad: 3000,
    elkostnad: 800,
    renoveringskostnad: 200000,
    renoveringsintervall: 10,
    analysperiod: 10,
  });

  const [resultat, setResultat] = useState<BostadsResultat | null>(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid beräkning');
      setResultat(null);
    }
  };

  // Handle reset
  const handleAterstall = () => {
    setInput({
      bostadspris: 3000000,
      kontantinsats: 450000,
      arsinkomst: 500000,
      arsranta: 0.045,
      driftkostnad: 3000,
      elkostnad: 800,
      renoveringskostnad: 200000,
      renoveringsintervall: 10,
      analysperiod: 10,
    });
    setResultat(null);
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          Bostadsbudgetskalkylator
        </h1>

        {/* Form */}
        <form onSubmit={handleBerakna} className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bostadspris */}
            <div>
              <label htmlFor="bostadspris" className="block text-sm font-medium text-gray-700 mb-2">
                Bostadspris (kr)
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
                Kontantinsats (kr)
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
                Årsinkomst (kr) <span className="text-gray-500 text-xs">(valfritt)</span>
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
                Årsränta (%)
              </label>
              <input
                type="number"
                id="arsranta"
                step="0.1"
                value={formatPercent(input.arsranta)}
                onChange={(e) => setInput({ ...input, arsranta: Number(e.target.value) / 100 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                inputMode="decimal"
              />
            </div>

            {/* Driftkostnad */}
            <div>
              <label htmlFor="driftkostnad" className="block text-sm font-medium text-gray-700 mb-2">
                Driftkostnad (kr/mån)
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
                Elkostnad (kr/mån)
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

            {/* Renoveringskostnad */}
            <div>
              <label htmlFor="renoveringskostnad" className="block text-sm font-medium text-gray-700 mb-2">
                Renoveringskostnad (kr)
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
                Renoveringsintervall (år)
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
                Analysperiod (år)
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

              {/* LTV percentage */}
              <div className="bg-purple-600 text-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium mb-2">Belåningsgrad</h3>
                <p className="text-3xl font-bold">{formatPercent(resultat.belåningsgrad)} %</p>
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

            {/* Loan details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Låneuppgifter</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 font-medium">Lånebelopp</span>
                  <span className="text-gray-900 font-semibold">{formatNumber(resultat.lanebelopp)} kr</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 font-medium">Amorteringskrav</span>
                  <span className="text-gray-900 font-semibold">{formatPercent(resultat.amorteringsprocent)} %</span>
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
          </div>
        )}
      </div>
    </main>
  );
}
