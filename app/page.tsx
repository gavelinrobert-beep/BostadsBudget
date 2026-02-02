'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
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
import { 
  SavedScenario,
  getAllScenarios,
  saveScenario,
  deleteScenario
} from '@/lib/scenarios';
import { Home as HomeIcon, Coins, Hammer, Calendar, Banknote, BarChart, Building, Zap, Wrench, TrendingUp, Save, Trash2, Upload, GitCompare, X, FileDown, Check, ChevronDown } from 'lucide-react';
import { generatePDF } from '@/lib/pdfExport';
import { ThemeToggle } from './components/ThemeToggle';

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
  bostadsyta: 75,
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
  const [showAmortizationBreakdown, setShowAmortizationBreakdown] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  
  // Scenario management state
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [scenarioName, setScenarioName] = useState<string>('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [selectedScenarios, setSelectedScenarios] = useState<Set<string>>(new Set());
  const [showCompareView, setShowCompareView] = useState<boolean>(false);
  
  // Ref for smooth scrolling to results
  const resultsRef = useRef<HTMLDivElement>(null);
  // Ref for smooth scrolling to form
  const formRef = useRef<HTMLDivElement>(null);

  // Load saved scenarios on mount
  useEffect(() => {
    setSavedScenarios(getAllScenarios());
  }, []);

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
      
      const rental = beraknaHyresJamforelse(input.bostadspris, input.bostadsyta);
      setHyresJamforelse(rental);
      
      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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

  // Handle save scenario
  const handleSaveScenario = () => {
    if (!resultat) {
      return;
    }
    
    setSaveError(null);
    setSaveSuccess(false);
    
    const result = saveScenario(scenarioName, input, resultat);
    
    if (result.success) {
      setSaveSuccess(true);
      setScenarioName('');
      setSavedScenarios(getAllScenarios());
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowSaveModal(false);
        setSaveSuccess(false);
      }, 1500);
    } else {
      setSaveError(result.error || 'Kunde inte spara scenariot');
    }
  };

  // Handle load scenario
  const handleLoadScenario = (scenario: SavedScenario) => {
    setInput(scenario.input);
    setResultat(scenario.resultat);
    
    // Recalculate additional analyses
    const sensitivity = beraknaKanslighetsAnalys(scenario.input, scenario.resultat);
    setKanslighetsAnalys(sensitivity);
    
    const forecast = beraknaLangsiktigPrognos(scenario.input, scenario.resultat);
    setLangsiktigPrognos(forecast);
    
    const downPaymentOptions = beraknaKontantinsatsAlternativ(scenario.input);
    setKontantinsatsAlternativ(downPaymentOptions);
    
    const rental = beraknaHyresJamforelse(scenario.input.bostadspris, scenario.input.bostadsyta);
    setHyresJamforelse(rental);
    
    // Smooth scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle delete scenario
  const handleDeleteScenario = (id: string) => {
    if (confirm('Är du säker på att du vill ta bort detta scenario?')) {
      deleteScenario(id);
      setSavedScenarios(getAllScenarios());
      
      // Remove from selected scenarios if it was selected
      const newSelected = new Set(selectedScenarios);
      newSelected.delete(id);
      setSelectedScenarios(newSelected);
    }
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    if (!resultat) {
      return;
    }
    
    setIsGeneratingPdf(true);
    
    try {
      await generatePDF(
        input,
        resultat,
        kanslighetsAnalys,
        langsiktigPrognos,
        kontantinsatsAlternativ,
        hyresJamforelse
      );
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Ett fel uppstod vid generering av PDF. Försök igen.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle scenario selection toggle
  const handleToggleScenarioSelection = (id: string) => {
    const newSelected = new Set(selectedScenarios);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (newSelected.size >= 3) {
        alert('Du kan max jämföra 3 scenarier åt gången');
        return;
      }
      newSelected.add(id);
    }
    setSelectedScenarios(newSelected);
  };

  // Format number with Swedish thousand separator
  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString('sv-SE');
  };

  // Format percentage
  const formatPercent = (num: number): string => {
    return (num * 100).toFixed(1);
  };

  // Calculate difference from base value
  const calculateDifference = (newValue: number, baseValue: number): number => {
    return newValue - baseValue;
  };

  // Calculate percentage change
  const calculatePercentageChange = (newValue: number, baseValue: number): string => {
    return ((newValue - baseValue) / baseValue * 100).toFixed(1);
  };

  // Skärpt amorteringskrav threshold (4.5 × årsinkomst)
  const SKARPT_KRAV_MULTIPLIKATOR = 4.5;

  // Get color for loan-to-value ratio
  const getBelåningsgradColor = (ltv: number): string => {
    if (ltv < 0.5) return 'bg-green-600 dark:bg-green-700'; // < 50%
    if (ltv < 0.7) return 'bg-yellow-500 dark:bg-yellow-600'; // 50-70%
    if (ltv < 0.85) return 'bg-orange-500 dark:bg-orange-600'; // 70-85%
    return 'bg-red-600 dark:bg-red-700'; // > 85%
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

  // Smooth scroll to form
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <ThemeToggle />
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Räkna ut din verkliga boendekostnad
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
              Gratis kalkylator som inkluderar lån, drift, renovering och energi. Med svenska amorteringskrav och långsiktig prognos.
            </p>
            
            {/* Three benefits grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-white/10 rounded-full p-3 mb-3">
                  <Check className="w-8 h-8" />
                </div>
                <p className="text-sm sm:text-base">Gratis och utan registrering</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-white/10 rounded-full p-3 mb-3">
                  <Check className="w-8 h-8" />
                </div>
                <p className="text-sm sm:text-base">Svenska amorteringsregler inbyggda</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-white/10 rounded-full p-3 mb-3">
                  <Check className="w-8 h-8" />
                </div>
                <p className="text-sm sm:text-base">Jämför scenarier och exportera till PDF</p>
              </div>
            </div>
            
            {/* CTA Button */}
            <button
              onClick={scrollToForm}
              className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700 font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-lg inline-flex items-center"
            >
              Börja räkna
              <ChevronDown className="ml-2 w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Main Content */}
        <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto" ref={formRef}>

        {/* Form */}
        <form onSubmit={handleBerakna} className="space-y-6 mb-8">
          {/* Section: Bostad & Lån */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <HomeIcon className="w-6 h-6 mr-2 text-blue-600 dark:text-gray-300" />
              Bostad & Lån
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bostadspris */}
              <div>
                <label htmlFor="bostadspris" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bostadspris (kr) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help" title="Totalt pris för bostaden enligt köpekontrakt">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="bostadspris"
                  value={input.bostadspris}
                  onChange={(e) => setInput({ ...input, bostadspris: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Kontantinsats */}
              <div>
                <label htmlFor="kontantinsats" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kontantinsats (kr) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help" title="Din egen insats, minst 15% av priset krävs i Sverige">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="kontantinsats"
                  value={input.kontantinsats}
                  onChange={(e) => setInput({ ...input, kontantinsats: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Årsinkomst */}
              <div>
                <label htmlFor="arsinkomst" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Årsinkomst (kr) <span className="text-gray-500 dark:text-gray-400 text-xs">(valfritt)</span> <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help" title="Din bruttoinkomst per år. Används för att beräkna skärpt amorteringskrav">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="arsinkomst"
                  value={input.arsinkomst || ''}
                  onChange={(e) => setInput({ ...input, arsinkomst: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Årsränta */}
              <div>
                <label htmlFor="arsranta" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Årsränta (%) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help" title="Aktuell bolåneränta. Genomsnitt idag: 4-5%">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="arsranta"
                  step="0.1"
                  value={(input.arsranta * 100).toString()}
                  onChange={(e) => setInput({ ...input, arsranta: Number(e.target.value) / 100 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="decimal"
                />
              </div>

              {/* Bostadsyta */}
              <div>
                <label htmlFor="bostadsyta" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bostadsyta (kvm) <span className="text-gray-500 dark:text-gray-400 text-xs">(valfritt)</span> <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help" title="Ange bostadens storlek för att jämföra med hyresmarknad">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="bostadsyta"
                  value={input.bostadsyta || ''}
                  onChange={(e) => setInput({ ...input, bostadsyta: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* Section: Driftkostnader */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Coins className="w-6 h-6 mr-2 text-green-600 dark:text-gray-300" />
              Driftkostnader
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driftkostnad */}
              <div>
                <label htmlFor="driftkostnad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Driftkostnad (kr/mån) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help" title="Avgift, försäkring, sophämtning etc. Vanligt: 2000-4000 kr/mån">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="driftkostnad"
                  value={input.driftkostnad}
                  onChange={(e) => setInput({ ...input, driftkostnad: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Elkostnad */}
              <div>
                <label htmlFor="elkostnad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Elkostnad (kr/mån) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help" title="Uppskattad elkostnad per månad. Vanligt: 500-1500 kr/mån">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="elkostnad"
                  value={input.elkostnad}
                  onChange={(e) => setInput({ ...input, elkostnad: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* Section: Renovering & Planering */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Hammer className="w-6 h-6 mr-2 text-orange-600 dark:text-gray-300" />
              Renovering & Planering
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Renoveringskostnad */}
              <div>
                <label htmlFor="renoveringskostnad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Renoveringskostnad (kr) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help" title="Totalkostnad för planerad renovering (t.ex. kök 300 000 kr)">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="renoveringskostnad"
                  value={input.renoveringskostnad}
                  onChange={(e) => setInput({ ...input, renoveringskostnad: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Renoveringsintervall */}
              <div>
                <label htmlFor="renoveringsintervall" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Renoveringsintervall (år) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help" title="Hur ofta behöver renoveringen göras? Kök: ~15 år, Badrum: ~20 år">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="renoveringsintervall"
                  value={input.renoveringsintervall}
                  onChange={(e) => setInput({ ...input, renoveringsintervall: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Analysperiod */}
              <div>
                <label htmlFor="analysperiod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Analysperiod (år) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help" title="Hur många år framåt vill du planera? Rekommenderat: 10-15 år">ⓘ</span>
                </label>
                <input
                  type="number"
                  id="analysperiod"
                  value={input.analysperiod}
                  onChange={(e) => setInput({ ...input, analysperiod: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-gray-700 rounded-md">
              <p className="text-red-800 dark:text-gray-100 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-md transition duration-200 active:scale-95"
            >
              Beräkna
            </button>
            {resultat && (
              <button
                type="button"
                onClick={() => setShowSaveModal(true)}
                className="flex-1 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-md transition duration-200 active:scale-95 flex items-center justify-center"
              >
                <Save className="w-5 h-5 mr-2" />
                💾 Spara scenario
              </button>
            )}
            <button
              type="button"
              onClick={handleAterstall}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-md transition duration-200 active:scale-95"
            >
              Återställ
            </button>
          </div>
        </form>

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-slide-in-from-bottom">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Spara scenario</h3>
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setSaveError(null);
                    setSaveSuccess(false);
                    setScenarioName('');
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <label htmlFor="scenario-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Namn på scenario
                </label>
                <input
                  type="text"
                  id="scenario-name"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="T.ex. 'Lägenhet Vasastan' eller 'Hus på landet'"
                  className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveScenario();
                    }
                  }}
                />
              </div>

              {saveError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-gray-700 rounded-md">
                  <p className="text-red-800 dark:text-gray-100 text-sm">{saveError}</p>
                </div>
              )}

              {saveSuccess && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-gray-700 rounded-md">
                  <p className="text-green-800 dark:text-gray-100 text-sm">✓ Scenario sparat!</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSaveScenario}
                  disabled={!scenarioName.trim()}
                  className="flex-1 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Spara
                </button>
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setSaveError(null);
                    setSaveSuccess(false);
                    setScenarioName('');
                  }}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-semibold py-2 px-4 rounded-md transition duration-200"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {resultat && (
          <div ref={resultsRef} className="space-y-6 animate-slide-in-from-bottom">
            {/* Three large cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total monthly cost */}
              <div className="bg-blue-600 dark:bg-blue-700 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105">
                <div className="flex items-center mb-2">
                  <Calendar className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-medium">Total månadskostnad</h3>
                </div>
                <p className="text-3xl font-bold">{formatNumber(resultat.totalPerManad)} kr</p>
              </div>

              {/* Total yearly cost */}
              <div className="bg-green-600 dark:bg-green-700 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105">
                <div className="flex items-center mb-2">
                  <Banknote className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-medium">Total årskostnad</h3>
                </div>
                <p className="text-3xl font-bold">{formatNumber(resultat.totalPerAr)} kr</p>
              </div>

              {/* LTV percentage with color coding */}
              <div className={`${getBelåningsgradColor(resultat.belåningsgrad)} text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105`}>
                <div className="flex items-center mb-2">
                  <BarChart className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-medium">Belåningsgrad</h3>
                </div>
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

            {/* Rental comparison info-box */}
            {hyresJamforelse && input.bostadsyta && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg shadow p-6">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">💡</span>
                  <div className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      För en hyresrätt på <span className="font-semibold">{input.bostadsyta} kvm</span> skulle du betala cirka <span className="font-bold text-gray-900 dark:text-gray-100">{formatNumber(hyresJamforelse)} kr/mån</span>
                    </p>
                    {resultat.totalPerManad < hyresJamforelse ? (
                      <p className="text-green-700 dark:text-gray-100 font-medium">
                        ✓ Du sparar ~{formatNumber(hyresJamforelse - resultat.totalPerManad)} kr/mån jämfört med hyra
                      </p>
                    ) : (
                      <p className="text-orange-600 dark:text-gray-100 font-medium">
                        Din boendekostnad är ~{formatNumber(resultat.totalPerManad - hyresJamforelse)} kr/mån högre än hyra, men du bygger eget kapital
                      </p>
                    )}
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">Baserat på 150 kr/kvm schablonhyra</p>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.01]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Uppdelning per månad</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-2">
                  <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                    <Building className="w-5 h-5 mr-2 text-blue-600 dark:text-gray-300" />
                    <span>Lån (ränta + amortering)</span>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatNumber(resultat.lanePerManad)} kr</span>
                </div>
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-2">
                  <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                    <Zap className="w-5 h-5 mr-2 text-yellow-600 dark:text-gray-300" />
                    <span>Drift + El</span>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatNumber(resultat.driftOchElPerManad)} kr</span>
                </div>
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-2">
                  <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                    <Wrench className="w-5 h-5 mr-2 text-orange-600 dark:text-gray-300" />
                    <span>Renovering (snitt)</span>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatNumber(resultat.renoveringPerManad)} kr</span>
                </div>
              </div>
            </div>

            {/* Long-term forecast - placed after Monthly breakdown and before Loan details */}
            {langsiktigPrognos && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.01]">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Långsiktig prognos</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                        <th className="text-left py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">År</th>
                        <th className="text-right py-3 px-3 font-semibold text-blue-700 dark:text-gray-300">Kvarvarande lån</th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">Ackumulerad amortering</th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">Total kostnad hittills</th>
                        <th className="text-right py-3 px-3 font-semibold text-green-700 dark:text-gray-100">Uppskattat värde</th>
                        <th className="text-right py-3 px-3 font-semibold text-green-700 dark:text-gray-100">Eget kapital</th>
                      </tr>
                    </thead>
                    <tbody>
                      {langsiktigPrognos.map((prognos) => (
                        <tr key={prognos.ar} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className="py-3 px-3 font-medium text-gray-900 dark:text-gray-100">{prognos.ar}</td>
                          <td className="text-right py-3 px-3 text-blue-600 dark:text-gray-300 font-medium">{formatNumber(prognos.kvarandelLan)} kr</td>
                          <td className="text-right py-3 px-3 text-gray-700 dark:text-gray-300">{formatNumber(prognos.ackumuleradAmortering)} kr</td>
                          <td className="text-right py-3 px-3 text-gray-700 dark:text-gray-300">{formatNumber(prognos.totalKostnad)} kr</td>
                          <td className="text-right py-3 px-3 text-green-600 dark:text-gray-300 font-medium">{formatNumber(prognos.uppskattatVarde)} kr</td>
                          <td className="text-right py-3 px-3 text-green-600 dark:text-gray-300 font-semibold">{formatNumber(prognos.egetKapital)} kr</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p>* Uppskattat värde baserat på 2% värdestegring per år</p>
                  <p>* Eget kapital = Kontantinsats + Ackumulerad amortering + Värdestegring</p>
                  <p>* Total kostnad inkluderar ränta (beräknat på kvarvarande lån varje år), amortering, drift, el och renovering</p>
                </div>
              </div>
            )}

            {/* Sensitivity analysis - "What if..." scenarios */}
            {kanslighetsAnalys && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.01]">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Känslighetsanalys - &quot;Vad händer om...&quot;</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Scenario 1: Interest rate +1% */}
                  <div className="bg-orange-100 dark:bg-gray-700 border-2 border-orange-300 dark:border-gray-600 rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <div className="flex items-center mb-3">
                      <TrendingUp className="w-5 h-5 mr-2 text-orange-600 dark:text-gray-300" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Ränta +1%</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Ny månadskostnad:</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(kanslighetsAnalys.rantaPlus1)} kr
                      </div>
                      <div className="mt-3 pt-3 border-t border-orange-300 dark:border-gray-600">
                        <div className="flex items-center text-orange-700 dark:text-gray-100">
                          <span className="text-xl mr-1">↑</span>
                          <span className="font-semibold">
                            +{formatNumber(calculateDifference(kanslighetsAnalys.rantaPlus1, resultat.totalPerManad))} kr/mån
                          </span>
                        </div>
                        <div className="text-sm text-orange-600 dark:text-gray-300 font-medium">
                          (+{calculatePercentageChange(kanslighetsAnalys.rantaPlus1, resultat.totalPerManad)}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scenario 2: Interest rate +2% */}
                  <div className="bg-red-100 dark:bg-gray-700 border-2 border-red-300 dark:border-gray-600 rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <div className="flex items-center mb-3">
                      <TrendingUp className="w-5 h-5 mr-2 text-red-600 dark:text-gray-300" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Ränta +2%</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Ny månadskostnad:</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(kanslighetsAnalys.rantaPlus2)} kr
                      </div>
                      <div className="mt-3 pt-3 border-t border-red-300 dark:border-gray-600">
                        <div className="flex items-center text-red-700 dark:text-gray-100">
                          <span className="text-xl mr-1">↑</span>
                          <span className="font-semibold">
                            +{formatNumber(calculateDifference(kanslighetsAnalys.rantaPlus2, resultat.totalPerManad))} kr/mån
                          </span>
                        </div>
                        <div className="text-sm text-red-600 dark:text-gray-300 font-medium">
                          (+{calculatePercentageChange(kanslighetsAnalys.rantaPlus2, resultat.totalPerManad)}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scenario 3: Electricity price doubles */}
                  <div className="bg-yellow-100 dark:bg-gray-700 border-2 border-yellow-300 dark:border-gray-600 rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <div className="flex items-center mb-3">
                      <Zap className="w-5 h-5 mr-2 text-yellow-600 dark:text-gray-300" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Elpriset fördubblas</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Ny månadskostnad:</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(kanslighetsAnalys.elFordubblas)} kr
                      </div>
                      <div className="mt-3 pt-3 border-t border-yellow-300 dark:border-gray-600">
                        <div className="flex items-center text-yellow-700 dark:text-gray-100">
                          <span className="text-xl mr-1">↑</span>
                          <span className="font-semibold">
                            +{formatNumber(calculateDifference(kanslighetsAnalys.elFordubblas, resultat.totalPerManad))} kr/mån
                          </span>
                        </div>
                        <div className="text-sm text-yellow-600 dark:text-gray-300 font-medium">
                          (+{calculatePercentageChange(kanslighetsAnalys.elFordubblas, resultat.totalPerManad)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loan details with enhanced amortization explanation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.01]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Låneuppgifter</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Lånebelopp</span>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatNumber(resultat.lanebelopp)} kr</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Amorteringskrav</span>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatPercent(resultat.amorteringsprocent)}{'\u00A0'}%</span>
                </div>
                
                {/* Enhanced amortization explanation with accordion */}
                <div className="mt-2">
                  <button
                    onClick={() => setShowAmortizationBreakdown(!showAmortizationBreakdown)}
                    className="flex items-center text-blue-600 dark:text-gray-300 hover:text-blue-800 font-medium text-sm transition-colors"
                  >
                    <span className="mr-2">
                      {showAmortizationBreakdown ? '▼' : '▶'}
                    </span>
                    Hur beräknas detta?
                  </button>
                  
                  {showAmortizationBreakdown && (
                    <div className="mt-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 text-sm">
                      <p className="text-gray-800 dark:text-gray-100 font-semibold mb-3">
                        Visa breakdown med checkmarks:
                      </p>
                      <ul className="space-y-2 mb-4">
                        {resultat.belåningsgrad > 0.7 && (
                          <li className="flex items-start">
                            <span className="text-green-600 dark:text-gray-300 mr-2 font-bold">✓</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              Belåningsgrad {formatPercent(resultat.belåningsgrad)}% (över 70%) → +{formatPercent(resultat.amorteringsprocentGrundkrav)}%
                            </span>
                          </li>
                        )}
                        {resultat.belåningsgrad <= 0.7 && resultat.belåningsgrad > 0.5 && (
                          <li className="flex items-start">
                            <span className="text-green-600 dark:text-gray-300 mr-2 font-bold">✓</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              Belåningsgrad {formatPercent(resultat.belåningsgrad)}% (50-70%) → +{formatPercent(resultat.amorteringsprocentGrundkrav)}%
                            </span>
                          </li>
                        )}
                        {resultat.belåningsgrad <= 0.5 && (
                          <li className="flex items-start">
                            <span className="text-green-600 dark:text-gray-300 mr-2 font-bold">✓</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              Belåningsgrad {formatPercent(resultat.belåningsgrad)}% (under 50%) → 0% (inget krav)
                            </span>
                          </li>
                        )}
                        {resultat.harSkarptKrav && (
                          <li className="flex items-start">
                            <span className="text-green-600 dark:text-gray-300 mr-2 font-bold">✓</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              Lån {formatNumber(resultat.lanebelopp)} kr {'>'} {SKARPT_KRAV_MULTIPLIKATOR} × årsinkomst {input.arsinkomst ? formatNumber(input.arsinkomst) : ''} kr → +{formatPercent(resultat.amorteringsprocentSkarptKrav)}% (skärpt krav)
                            </span>
                          </li>
                        )}
                        {!resultat.harSkarptKrav && input.arsinkomst && input.arsinkomst > 0 && (
                          <li className="flex items-start">
                            <span className="text-blue-600 dark:text-gray-300 mr-2 font-bold" role="img" aria-label="Information">ℹ️</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              Skärpt amorteringskrav gäller ej (lån {'<'} {SKARPT_KRAV_MULTIPLIKATOR} × årsinkomst)
                            </span>
                          </li>
                        )}
                      </ul>
                      <div className="border-t pt-3 mt-3">
                        <p className="text-gray-800 dark:text-gray-100 font-bold">
                          Totalt amorteringskrav: {formatPercent(resultat.amorteringsprocent)}% per år
                        </p>
                      </div>
                      <div className="mt-4 text-xs text-gray-600 dark:text-gray-300">
                        <p>
                          Läs mer om amorteringskrav hos{' '}
                          <a 
                            href="https://www.fi.se" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-gray-300 hover:text-blue-800 underline"
                          >
                            Finansinspektionen
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Ränta per år</span>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatNumber(resultat.rantaPerAr)} kr</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Amortering per år</span>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatNumber(resultat.amorteringPerAr)} kr</span>
                </div>
              </div>
            </div>

            {/* Down payment optimization */}
            {kontantinsatsAlternativ && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.01]">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Kontantinsats-optimering</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Se hur olika kontantinsatser påverkar din månadskostnad och amorteringskrav:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300 dark:border-gray-600">
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
                            className={`border-b border-gray-200 dark:border-gray-700 ${isCurrent ? 'bg-blue-100 dark:bg-blue-900/20 font-semibold' : ''}`}
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

            {/* PDF Export Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleExportPDF}
                disabled={isGeneratingPdf}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Genererar PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-5 h-5" />
                    <span>📄 Exportera till PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Saved Scenarios Section */}
        {savedScenarios.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <Save className="w-6 h-6 mr-2 text-blue-600 dark:text-gray-300" />
                Sparade scenarier
              </h2>
              {selectedScenarios.size >= 2 && (
                <button
                  onClick={() => setShowCompareView(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center"
                >
                  <GitCompare className="w-5 h-5 mr-2" />
                  Jämför valda ({selectedScenarios.size})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start flex-1">
                      <input
                        type="checkbox"
                        checked={selectedScenarios.has(scenario.id)}
                        onChange={() => handleToggleScenarioSelection(scenario.id)}
                        className="mt-1 mr-3 w-4 h-4 text-purple-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500"
                      />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex-1">{scenario.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Bostadspris:</span>
                      <span className="font-semibold">{formatNumber(scenario.input.bostadspris)} kr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Månadskostnad:</span>
                      <span className="font-semibold">{formatNumber(scenario.resultat.totalPerManad)} kr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Belåningsgrad:</span>
                      <span className={`font-semibold ${getBelåningsgradTextColor(scenario.resultat.belåningsgrad)}`}>
                        {formatPercent(scenario.resultat.belåningsgrad)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Sparat:</span>
                      <span>{new Date(scenario.timestamp).toLocaleDateString('sv-SE')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadScenario(scenario)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md transition duration-200 flex items-center justify-center text-sm"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Ladda
                    </button>
                    <button
                      onClick={() => handleDeleteScenario(scenario.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md transition duration-200 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison View Modal */}
        {showCompareView && selectedScenarios.size >= 2 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full p-6 my-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Jämför scenarier</h3>
                <button
                  onClick={() => setShowCompareView(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {(() => {
                const selectedScenariosList = savedScenarios.filter(s => selectedScenarios.has(s.id));
                
                if (selectedScenariosList.length === 0) return null;

                // Helper to determine best/worst values for coloring
                const getBestWorst = (values: number[], lower: boolean = true) => {
                  if (values.length === 0) return { best: null, worst: null };
                  const sortedValues = [...values].sort((a, b) => a - b);
                  return {
                    best: lower ? sortedValues[0] : sortedValues[sortedValues.length - 1],
                    worst: lower ? sortedValues[sortedValues.length - 1] : sortedValues[0]
                  };
                };

                const getValueColor = (value: number, best: number | null, worst: number | null) => {
                  if (best === worst || best === null || worst === null) return '';
                  if (value === best) return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-gray-100 font-semibold';
                  if (value === worst) return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-gray-100 font-semibold';
                  return '';
                };

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                          <th className="text-left py-3 px-3 font-bold text-gray-900 dark:text-gray-100">Parameter</th>
                          {selectedScenariosList.map(scenario => (
                            <th key={scenario.id} className="text-right py-3 px-3 font-bold text-gray-900 dark:text-gray-100">
                              {scenario.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Input values */}
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <td colSpan={selectedScenariosList.length + 1} className="py-2 px-3 font-bold text-gray-700 dark:text-gray-300">
                            Input
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">Bostadspris</td>
                          {selectedScenariosList.map(scenario => (
                            <td key={scenario.id} className="text-right py-2 px-3">
                              {formatNumber(scenario.input.bostadspris)} kr
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">Kontantinsats</td>
                          {selectedScenariosList.map(scenario => (
                            <td key={scenario.id} className="text-right py-2 px-3">
                              {formatNumber(scenario.input.kontantinsats)} kr
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">Årsränta</td>
                          {selectedScenariosList.map(scenario => (
                            <td key={scenario.id} className="text-right py-2 px-3">
                              {formatPercent(scenario.input.arsranta)}%
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">Driftkostnad</td>
                          {selectedScenariosList.map(scenario => (
                            <td key={scenario.id} className="text-right py-2 px-3">
                              {formatNumber(scenario.input.driftkostnad)} kr/mån
                            </td>
                          ))}
                        </tr>

                        {/* Results with color coding */}
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <td colSpan={selectedScenariosList.length + 1} className="py-2 px-3 font-bold text-gray-700 dark:text-gray-300">
                            Resultat
                          </td>
                        </tr>

                        {(() => {
                          const monthlyValues = selectedScenariosList.map(s => s.resultat.totalPerManad);
                          const { best: bestMonthly, worst: worstMonthly } = getBestWorst(monthlyValues, true);

                          return (
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 text-gray-700 dark:text-gray-300 font-semibold">Månadskostnad</td>
                              {selectedScenariosList.map(scenario => (
                                <td 
                                  key={scenario.id} 
                                  className={`text-right py-2 px-3 ${getValueColor(scenario.resultat.totalPerManad, bestMonthly, worstMonthly)}`}
                                >
                                  {formatNumber(scenario.resultat.totalPerManad)} kr
                                </td>
                              ))}
                            </tr>
                          );
                        })()}

                        {(() => {
                          const yearlyValues = selectedScenariosList.map(s => s.resultat.totalPerAr);
                          const { best: bestYearly, worst: worstYearly } = getBestWorst(yearlyValues, true);

                          return (
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 text-gray-700 dark:text-gray-300">Årskostnad</td>
                              {selectedScenariosList.map(scenario => (
                                <td 
                                  key={scenario.id} 
                                  className={`text-right py-2 px-3 ${getValueColor(scenario.resultat.totalPerAr, bestYearly, worstYearly)}`}
                                >
                                  {formatNumber(scenario.resultat.totalPerAr)} kr
                                </td>
                              ))}
                            </tr>
                          );
                        })()}

                        {(() => {
                          const ltvValues = selectedScenariosList.map(s => s.resultat.belåningsgrad);
                          const { best: bestLtv, worst: worstLtv } = getBestWorst(ltvValues, true);

                          return (
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 text-gray-700 dark:text-gray-300 font-semibold">Belåningsgrad</td>
                              {selectedScenariosList.map(scenario => (
                                <td 
                                  key={scenario.id} 
                                  className={`text-right py-2 px-3 ${getValueColor(scenario.resultat.belåningsgrad, bestLtv, worstLtv)}`}
                                >
                                  {formatPercent(scenario.resultat.belåningsgrad)}%
                                </td>
                              ))}
                            </tr>
                          );
                        })()}

                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">Lånebelopp</td>
                          {selectedScenariosList.map(scenario => (
                            <td key={scenario.id} className="text-right py-2 px-3">
                              {formatNumber(scenario.resultat.lanebelopp)} kr
                            </td>
                          ))}
                        </tr>

                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">Amortering per år</td>
                          {selectedScenariosList.map(scenario => (
                            <td key={scenario.id} className="text-right py-2 px-3">
                              {formatNumber(scenario.resultat.amorteringPerAr)} kr
                            </td>
                          ))}
                        </tr>

                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">Ränta per år</td>
                          {selectedScenariosList.map(scenario => (
                            <td key={scenario.id} className="text-right py-2 px-3">
                              {formatNumber(scenario.resultat.rantaPerAr)} kr
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-md">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Färgkodning:</span> 
                        <span className="ml-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-gray-100 px-2 py-1 rounded">Bäst</span>
                        <span className="ml-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-gray-100 px-2 py-1 rounded">Sämst</span>
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => window.print()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                      >
                        Skriv ut / Exportera PDF
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-300 py-12 px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Copyright */}
            <p className="text-lg font-semibold mb-3">
              © 2026 Bostadsbudget. Alla rättigheter förbehållna.
            </p>
            
            {/* Disclaimer */}
            <p className="text-sm text-gray-400 mb-6 max-w-2xl mx-auto">
              Detta verktyg ger uppskattningar baserat på dina uppgifter. För exakta kalkyler, kontakta din bank eller finansiell rådgivare.
            </p>
            
            {/* Links */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Om oss</a>
              <span className="hidden sm:inline text-gray-600">|</span>
              <a href="#" className="hover:text-white transition-colors">Kontakt</a>
              <span className="hidden sm:inline text-gray-600">|</span>
              <a href="#" className="hover:text-white transition-colors">Integritetspolicy</a>
            </div>
            
            {/* Built with love */}
            <p className="text-sm text-gray-500">
              Byggt med ❤️ och AI
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
