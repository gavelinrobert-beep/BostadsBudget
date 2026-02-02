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
import { Home as HomeIcon, Coins, Hammer, Calendar, Banknote, BarChart, Building, Zap, Wrench, TrendingUp, Save, Trash2, Upload, GitCompare, X, FileDown, Check, ChevronDown, CheckCircle2, Activity, Share2, Mail, Twitter as TwitterIcon, Linkedin } from 'lucide-react';
import { generatePDF } from '@/lib/pdfExport';
import { ThemeToggle } from './components/ThemeToggle';
import CountUp from 'react-countup';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';

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
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [kontantinsatsSlider, setKontantinsatsSlider] = useState<number>(15);
  
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

  // Handle save as image
  const handleSaveAsImage = async () => {
    if (!resultsRef.current) return;
    
    setIsGeneratingImage(true);
    try {
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `bostadsbudget-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Ett fel uppstod vid generering av bilden. Försök igen.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Handle share
  const handleShare = (platform: string) => {
    if (!resultat) return;
    
    const text = `Mitt bostadsbudget: ${formatNumber(resultat.totalPerManad)} kr/mån med ${formatPercent(resultat.belåningsgrad)}% belåningsgrad`;
    const url = window.location.href;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent('Mitt bostadsbudget')}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
    }
    
    setShowShareMenu(false);
  };

  // Handle kontantinsats slider change
  const handleKontantinsatsSliderChange = (value: number) => {
    setKontantinsatsSlider(value);
    const newKontantinsats = (value / 100) * input.bostadspris;
    setInput({ ...input, kontantinsats: newKontantinsats });
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

  // Get gradient colors for belåningsgrad card
  const getBelåningsgradGradient = (ltv: number): string => {
    if (ltv < 0.5) return 'from-green-400 to-green-600'; // < 50%
    if (ltv < 0.7) return 'from-yellow-400 to-yellow-600'; // 50-70%
    if (ltv < 0.85) return 'from-orange-400 to-orange-600'; // 70-85%
    return 'from-red-400 to-red-600'; // > 85%
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

  // Circular progress bar component
  const CircularProgress = ({ percentage, size = 120 }: { percentage: number; size?: number }) => {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="white"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{percentage.toFixed(0)}%</span>
        </div>
      </div>
    );
  };

  // Info tooltip component
  const InfoTooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="cursor-help"
        >
          {children}
        </div>
        {showTooltip && (
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
            {text}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </div>
          </div>
        )}
      </div>
    );
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
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 md:py-32 px-4 sm:px-6 lg:px-8">
          {/* Background overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-900/20"></div>
          
          {/* Animated floating icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 opacity-10 animate-float">
              <Building className="w-16 h-16 md:w-24 md:h-24" />
            </div>
            <div className="absolute top-40 right-20 opacity-10 animate-float-delay-1">
              <HomeIcon className="w-20 h-20 md:w-32 md:h-32" />
            </div>
            <div className="absolute bottom-20 left-1/4 opacity-10 animate-float-delay-2">
              <Building className="w-12 h-12 md:w-20 md:h-20" />
            </div>
          </div>

          <div className="relative max-w-5xl mx-auto text-center space-y-8">
            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight text-shadow-lg">
              Din bostad. Din ekonomi. Din framtid.
            </h1>
            
            {/* Subheading */}
            <p className="text-lg sm:text-xl md:text-2xl mb-10 text-gray-100 opacity-90 max-w-3xl mx-auto">
              Få full koll på vad ditt drömboende verkligen kostar – från lån till ljus
            </p>
            
            {/* Three benefits cards with glassmorphism */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              {/* Card 1 - Inkluderar allt */}
              <div className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-2xl hover:scale-105 hover:shadow-blue-500/20 transition-all duration-300">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-blue-500/20 rounded-full p-4 group-hover:bg-blue-500/30 transition-colors duration-300">
                    <HomeIcon className="w-10 h-10 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Inkluderar allt</h3>
                    <p className="text-sm text-gray-200 opacity-80">
                      Lån, drift, renovering, energi – vi räknar på helheten
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Card 2 - Svenska regler */}
              <div className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-2xl hover:scale-105 hover:shadow-green-500/20 transition-all duration-300">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-green-500/20 rounded-full p-4 group-hover:bg-green-500/30 transition-colors duration-300">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Svenska regler</h3>
                    <p className="text-sm text-gray-200 opacity-80">
                      Automatiska beräkningar enligt Finansinspektionens krav
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Card 3 - Helt gratis */}
              <div className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-2xl hover:scale-105 hover:shadow-purple-500/20 transition-all duration-300">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-purple-500/20 rounded-full p-4 group-hover:bg-purple-500/30 transition-colors duration-300">
                    <Activity className="w-10 h-10 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Helt gratis</h3>
                    <p className="text-sm text-gray-200 opacity-80">
                      Inga dolda avgifter. Spara obegränsat. Exportera fritt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Button with gradient */}
            <button
              onClick={scrollToForm}
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold py-5 px-10 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg inline-flex items-center"
            >
              <span className="relative z-10">Starta din kalkyl</span>
              <ChevronDown className="ml-2 w-5 h-5 relative z-10 group-hover:translate-y-1 transition-transform duration-300" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
        </section>

        {/* Main Content */}
        <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto" ref={formRef}>

        {/* Form */}
        <form onSubmit={handleBerakna} className="space-y-8 mb-8">
          {/* Section: Bostad & Lån */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="mb-8 pb-6 border-b-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center mb-3">
                <HomeIcon className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Bostad & Lån
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                Grundläggande uppgifter om din bostad och ekonomi
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bostadspris */}
              <div>
                <label htmlFor="bostadspris" className="block text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Bostadspris (kr) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help normal-case" title="Totalt pris för bostaden enligt köpekontrakt. Exempel: 3 000 000 kr">💡</span>
                </label>
                <input
                  type="number"
                  id="bostadspris"
                  value={input.bostadspris}
                  onChange={(e) => setInput({ ...input, bostadspris: Number(e.target.value) })}
                  placeholder="3 000 000"
                  className="w-full py-4 px-5 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 dark:text-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                  inputMode="numeric"
                />
              </div>

              {/* Kontantinsats */}
              <div>
                <label htmlFor="kontantinsats" className="block text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Kontantinsats (kr) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help normal-case" title="Din egen insats, minst 15% av priset krävs i Sverige. Exempel: 450 000 kr">💡</span>
                </label>
                <input
                  type="number"
                  id="kontantinsats"
                  value={input.kontantinsats}
                  onChange={(e) => setInput({ ...input, kontantinsats: Number(e.target.value) })}
                  placeholder="450 000"
                  className="w-full py-4 px-5 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 dark:text-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                  inputMode="numeric"
                />
              </div>

              {/* Årsinkomst */}
              <div>
                <label htmlFor="arsinkomst" className="block text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Årsinkomst (kr) <span className="text-gray-500 dark:text-gray-400 text-xs normal-case">(valfritt)</span> <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help normal-case" title="Din bruttoinkomst per år. Används för att beräkna skärpt amorteringskrav. Exempel: 500 000 kr">💡</span>
                </label>
                <input
                  type="number"
                  id="arsinkomst"
                  value={input.arsinkomst || ''}
                  onChange={(e) => setInput({ ...input, arsinkomst: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="500 000"
                  className="w-full py-4 px-5 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 dark:text-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                  inputMode="numeric"
                />
              </div>

              {/* Årsränta */}
              <div>
                <label htmlFor="arsranta" className="block text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Årsränta (%) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help normal-case" title="Aktuell bolåneränta. Genomsnitt idag: 4-5%. Exempel: 4.5%">💡</span>
                </label>
                <input
                  type="number"
                  id="arsranta"
                  step="0.1"
                  value={(input.arsranta * 100).toString()}
                  onChange={(e) => setInput({ ...input, arsranta: Number(e.target.value) / 100 })}
                  placeholder="4.5"
                  className="w-full py-4 px-5 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 dark:text-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                  inputMode="decimal"
                />
              </div>

              {/* Bostadsyta */}
              <div>
                <label htmlFor="bostadsyta" className="block text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Bostadsyta (kvm) <span className="text-gray-500 dark:text-gray-400 text-xs normal-case">(valfritt)</span> <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help normal-case" title="Ange bostadens storlek för att jämföra med hyresmarknad. Exempel: 75 kvm">💡</span>
                </label>
                <input
                  type="number"
                  id="bostadsyta"
                  value={input.bostadsyta || ''}
                  onChange={(e) => setInput({ ...input, bostadsyta: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="75"
                  className="w-full py-4 px-5 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 dark:text-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* Section: Driftkostnader */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="mb-8 pb-6 border-b-2 border-green-200 dark:border-green-800">
              <div className="flex items-center mb-3">
                <Coins className="w-8 h-8 mr-3 text-green-600 dark:text-green-400" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Driftkostnader
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                Månatliga kostnader för att bo i din fastighet
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driftkostnad */}
              <div>
                <label htmlFor="driftkostnad" className="block text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Driftkostnad (kr/mån) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help normal-case" title="Avgift, försäkring, sophämtning etc. Vanligt: 2000-4000 kr/mån. Exempel: 3 000 kr">💡</span>
                </label>
                <input
                  type="number"
                  id="driftkostnad"
                  value={input.driftkostnad}
                  onChange={(e) => setInput({ ...input, driftkostnad: Number(e.target.value) })}
                  placeholder="3 000"
                  className="w-full py-4 px-5 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 dark:text-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                  inputMode="numeric"
                />
              </div>

              {/* Elkostnad */}
              <div>
                <label htmlFor="elkostnad" className="block text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Elkostnad (kr/mån) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help normal-case" title="Uppskattad elkostnad per månad. Vanligt: 500-1500 kr/mån. Exempel: 800 kr">💡</span>
                </label>
                <input
                  type="number"
                  id="elkostnad"
                  value={input.elkostnad}
                  onChange={(e) => setInput({ ...input, elkostnad: Number(e.target.value) })}
                  placeholder="800"
                  className="w-full py-4 px-5 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 dark:text-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* Section: Renovering & Planering */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="mb-8 pb-6 border-b-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center mb-3">
                <Hammer className="w-8 h-8 mr-3 text-orange-600 dark:text-orange-400" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Renovering & Planering
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                Planera för framtida renoveringar och långsiktig analys
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Renoveringskostnad */}
              <div>
                <label htmlFor="renoveringskostnad" className="block text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Renoveringskostnad (kr) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help normal-case" title="Totalkostnad för planerad renovering (t.ex. kök 300 000 kr). Exempel: 200 000 kr">💡</span>
                </label>
                <input
                  type="number"
                  id="renoveringskostnad"
                  value={input.renoveringskostnad}
                  onChange={(e) => setInput({ ...input, renoveringskostnad: Number(e.target.value) })}
                  placeholder="200 000"
                  className="w-full py-4 px-5 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 dark:text-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                  inputMode="numeric"
                />
              </div>

              {/* Renoveringsintervall */}
              <div>
                <label htmlFor="renoveringsintervall" className="block text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Renoveringsintervall (år) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help normal-case" title="Hur ofta behöver renoveringen göras? Kök: ~15 år, Badrum: ~20 år. Exempel: 10 år">💡</span>
                </label>
                <input
                  type="number"
                  id="renoveringsintervall"
                  value={input.renoveringsintervall}
                  onChange={(e) => setInput({ ...input, renoveringsintervall: Number(e.target.value) })}
                  placeholder="10"
                  className="w-full py-4 px-5 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 dark:text-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                  inputMode="numeric"
                />
              </div>

              {/* Analysperiod */}
              <div>
                <label htmlFor="analysperiod" className="block text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-2">
                  Analysperiod (år) <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help normal-case" title="Hur många år framåt vill du planera? Rekommenderat: 10-15 år. Exempel: 10 år">💡</span>
                </label>
                <input
                  type="number"
                  id="analysperiod"
                  value={input.analysperiod}
                  onChange={(e) => setInput({ ...input, analysperiod: Number(e.target.value) })}
                  placeholder="10"
                  className="w-full py-4 px-5 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 dark:text-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl shadow-lg">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              Beräkna
              <span className="ml-2 text-xl" aria-hidden="true">→</span>
            </button>
            {resultat && (
              <button
                type="button"
                onClick={() => setShowSaveModal(true)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-8 text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Spara scenario
              </button>
            )}
            <button
              type="button"
              onClick={handleAterstall}
              className="flex-1 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-4 px-8 text-lg rounded-xl transition-all duration-300 hover:scale-105"
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
            {/* Three large cards with 3D effects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 perspective-1000">
              {/* Total monthly cost */}
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 hover:-translate-y-4 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
                {/* Subtle pattern background */}
                <div className="absolute inset-0 opacity-10 rounded-xl" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col items-center mb-4">
                    <Calendar className="w-16 h-16 mb-3" />
                    <h3 className="text-xl font-semibold text-center">Total månadskostnad</h3>
                  </div>
                  <div className="text-center">
                    <p className="text-5xl md:text-6xl font-black mb-2">
                      <CountUp end={resultat.totalPerManad} duration={2} separator=" " /> kr
                    </p>
                  </div>
                </div>
              </div>

              {/* Total yearly cost */}
              <div className="relative bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 hover:-translate-y-4 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
                {/* Subtle pattern background */}
                <div className="absolute inset-0 opacity-10 rounded-xl" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col items-center mb-4">
                    <Banknote className="w-16 h-16 mb-3" />
                    <h3 className="text-xl font-semibold text-center">Total årskostnad</h3>
                  </div>
                  <div className="text-center">
                    <p className="text-5xl md:text-6xl font-black mb-2">
                      <CountUp end={resultat.totalPerAr} duration={2} separator=" " /> kr
                    </p>
                  </div>
                </div>
              </div>

              {/* LTV percentage with circular progress */}
              <div className={`relative bg-gradient-to-br ${getBelåningsgradGradient(resultat.belåningsgrad)} text-white rounded-xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 hover:-translate-y-4 transform-gpu`} style={{ transformStyle: 'preserve-3d' }}>
                {/* Subtle pattern background */}
                <div className="absolute inset-0 opacity-10 rounded-xl" style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)', backgroundSize: '25px 25px' }}></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col items-center mb-4">
                    <BarChart className="w-16 h-16 mb-3" />
                    <h3 className="text-xl font-semibold text-center">Belåningsgrad</h3>
                  </div>
                  <div className="flex flex-col items-center">
                    <CircularProgress percentage={resultat.belåningsgrad * 100} size={140} />
                    <p className="text-3xl font-black mt-4">
                      <CountUp end={resultat.belåningsgrad * 100} duration={2} decimals={1} />%
                    </p>
                  </div>
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

            {/* Monthly breakdown with visual badges and progress bars */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-200">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <Coins className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                Uppdelning per månad
              </h2>
              <div className="space-y-6">
                {/* Loan */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-5 hover:scale-105 transition-all duration-200 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3 mr-4">
                        <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Lån (ränta + amortering)</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Månatlig kostnad för lån</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(resultat.lanePerManad)} kr</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {((resultat.lanePerManad / resultat.totalPerManad) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="relative h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${(resultat.lanePerManad / resultat.totalPerManad) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Drift + El */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-5 hover:scale-105 transition-all duration-200 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full p-3 mr-4">
                        <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Drift + El</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Månatliga driftkostnader</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(resultat.driftOchElPerManad)} kr</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                        {((resultat.driftOchElPerManad / resultat.totalPerManad) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="relative h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-1000"
                      style={{ width: `${(resultat.driftOchElPerManad / resultat.totalPerManad) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Renovering */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-5 hover:scale-105 transition-all duration-200 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-3 mr-4">
                        <Wrench className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Renovering (snitt)</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Genomsnittlig månadskostnad</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(resultat.renoveringPerManad)} kr</p>
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                        {((resultat.renoveringPerManad / resultat.totalPerManad) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="relative h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000"
                      style={{ width: `${(resultat.renoveringPerManad / resultat.totalPerManad) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Long-term forecast with interactive charts */}
            {langsiktigPrognos && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-200">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                  <Activity className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                  Långsiktig prognos
                </h2>
                
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Line chart for remaining loan */}
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Kvarvarande lån över tid</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={langsiktigPrognos}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="ar" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip 
                          formatter={(value: any) => [`${formatNumber(Number(value))} kr`]}
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Line type="monotone" dataKey="kvarandelLan" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Area chart for accumulated equity */}
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Ackumulerat eget kapital</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={langsiktigPrognos}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="ar" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip 
                          formatter={(value: any) => [`${formatNumber(Number(value))} kr`]}
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Area type="monotone" dataKey="egetKapital" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Enhanced table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10">
                      <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                        <th className="text-left py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            År
                          </div>
                        </th>
                        <th className="text-right py-3 px-3 font-semibold text-blue-700 dark:text-gray-300">
                          <div className="flex items-center justify-end">
                            <Building className="w-4 h-4 mr-2" />
                            Kvarvarande lån
                          </div>
                        </th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">
                          <div className="flex items-center justify-end">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Ack. amortering
                          </div>
                        </th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">
                          <div className="flex items-center justify-end">
                            <Coins className="w-4 h-4 mr-2" />
                            Total kostnad
                          </div>
                        </th>
                        <th className="text-right py-3 px-3 font-semibold text-green-700 dark:text-gray-100">
                          <div className="flex items-center justify-end">
                            <HomeIcon className="w-4 h-4 mr-2" />
                            Uppskattat värde
                          </div>
                        </th>
                        <th className="text-right py-3 px-3 font-semibold text-green-700 dark:text-gray-100">
                          <div className="flex items-center justify-end">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Eget kapital
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {langsiktigPrognos.map((prognos, index) => (
                        <tr 
                          key={prognos.ar} 
                          className={`border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors ${
                            index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                          }`}
                        >
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
                <div className="mt-6 text-sm text-gray-600 dark:text-gray-300 space-y-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="flex items-start">
                    <span className="mr-2">💡</span>
                    <span>Uppskattat värde baserat på 2% värdestegring per år</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">💡</span>
                    <span>Eget kapital = Kontantinsats + Ackumulerad amortering + Värdestegring</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">💡</span>
                    <span>Total kostnad inkluderar ränta (beräknat på kvarvarande lån varje år), amortering, drift, el och renovering</span>
                  </p>
                </div>
              </div>
            )}

            {/* Sensitivity analysis with enhanced visual design */}
            {kanslighetsAnalys && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-200">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                  <Activity className="w-8 h-8 mr-3 text-orange-600 dark:text-orange-400" />
                  Känslighetsanalys - &quot;Vad händer om...&quot;
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Scenario 1: Interest rate +1% */}
                  <div className="relative bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 border-2 border-orange-400 dark:border-orange-600 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 11px)' }}></div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col items-center mb-4">
                        <div className="bg-orange-500 dark:bg-orange-600 rounded-full p-4 mb-3">
                          <TrendingUp className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Ränta +1%</h3>
                        <div className="mt-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          VARNING
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-700 dark:text-gray-200 text-center">
                          <span className="font-medium">Ny månadskostnad:</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900 dark:text-white text-center">
                          {formatNumber(kanslighetsAnalys.rantaPlus1)} kr
                        </div>
                        <div className="mt-3 pt-3 border-t-2 border-orange-400 dark:border-orange-600">
                          <div className="flex items-center justify-center text-orange-700 dark:text-orange-300">
                            <span className="text-2xl mr-2 animate-bounce">↑</span>
                            <span className="font-bold text-lg">
                              +{formatNumber(calculateDifference(kanslighetsAnalys.rantaPlus1, resultat.totalPerManad))} kr/mån
                            </span>
                          </div>
                          <div className="text-center text-sm text-orange-700 dark:text-orange-300 font-semibold mt-1">
                            (+{calculatePercentageChange(kanslighetsAnalys.rantaPlus1, resultat.totalPerManad)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scenario 2: Interest rate +2% */}
                  <div className="relative bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 border-2 border-red-400 dark:border-red-600 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col items-center mb-4">
                        <div className="bg-red-600 dark:bg-red-700 rounded-full p-4 mb-3">
                          <TrendingUp className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Ränta +2%</h3>
                        <div className="mt-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          HÖG RISK
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-700 dark:text-gray-200 text-center">
                          <span className="font-medium">Ny månadskostnad:</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900 dark:text-white text-center">
                          {formatNumber(kanslighetsAnalys.rantaPlus2)} kr
                        </div>
                        <div className="mt-3 pt-3 border-t-2 border-red-400 dark:border-red-600">
                          <div className="flex items-center justify-center text-red-700 dark:text-red-300">
                            <span className="text-2xl mr-2 animate-bounce">↑</span>
                            <span className="font-bold text-lg">
                              +{formatNumber(calculateDifference(kanslighetsAnalys.rantaPlus2, resultat.totalPerManad))} kr/mån
                            </span>
                          </div>
                          <div className="text-center text-sm text-red-700 dark:text-red-300 font-semibold mt-1">
                            (+{calculatePercentageChange(kanslighetsAnalys.rantaPlus2, resultat.totalPerManad)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scenario 3: Electricity price doubles */}
                  <div className="relative bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 11px)' }}></div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col items-center mb-4">
                        <div className="bg-yellow-500 dark:bg-yellow-600 rounded-full p-4 mb-3">
                          <Zap className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Elpriset fördubblas</h3>
                        <div className="mt-2 bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          OBSERVERA
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-700 dark:text-gray-200 text-center">
                          <span className="font-medium">Ny månadskostnad:</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900 dark:text-white text-center">
                          {formatNumber(kanslighetsAnalys.elFordubblas)} kr
                        </div>
                        <div className="mt-3 pt-3 border-t-2 border-yellow-400 dark:border-yellow-600">
                          <div className="flex items-center justify-center text-yellow-700 dark:text-yellow-300">
                            <span className="text-2xl mr-2 animate-bounce">↑</span>
                            <span className="font-bold text-lg">
                              +{formatNumber(calculateDifference(kanslighetsAnalys.elFordubblas, resultat.totalPerManad))} kr/mån
                            </span>
                          </div>
                          <div className="text-center text-sm text-yellow-700 dark:text-yellow-300 font-semibold mt-1">
                            (+{calculatePercentageChange(kanslighetsAnalys.elFordubblas, resultat.totalPerManad)}%)
                          </div>
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

            {/* Down payment optimization with interactive slider */}
            {kontantinsatsAlternativ && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-200">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                  <Coins className="w-8 h-8 mr-3 text-green-600 dark:text-green-400" />
                  Kontantinsats-optimering
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                  Justera kontantinsatsen och se hur det påverkar din månadskostnad och amorteringskrav:
                </p>

                {/* Interactive Slider */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 mb-6 shadow-md">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Kontantinsats: {kontantinsatsSlider}%
                      </label>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatNumber((kontantinsatsSlider / 100) * input.bostadspris)} kr
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={kontantinsatsSlider}
                      onChange={(e) => setKontantinsatsSlider(Number(e.target.value))}
                      className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${kontantinsatsSlider}%, #e5e7eb ${kontantinsatsSlider}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <span>10%</span>
                      <span className="text-yellow-600 dark:text-yellow-400 font-semibold">50% (Ingen amortering)</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Sweet spots markers */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-700">
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Bästa läge</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">{'<'} 50%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Inget amorteringskrav</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-700">
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Neutralt</p>
                      <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">50-70%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">1% amortering</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-700">
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Högre krav</p>
                      <p className="text-lg font-bold text-orange-700 dark:text-orange-400">{'>'} 70%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2% amortering</p>
                    </div>
                  </div>
                </div>

                {/* Chart showing monthly cost vs down payment */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 mb-6 shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Månadskostnad vs Kontantinsats</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={kontantinsatsAlternativ}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="kontantinsatsProcent" 
                        stroke="#6b7280"
                        label={{ value: 'Kontantinsats (%)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        label={{ value: 'Månadskostnad (kr)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${formatNumber(Number(value))} kr/mån`]}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="manadskostnad" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={{ fill: '#3b82f6', r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                      {/* Mark the 50% and 70% thresholds */}
                      <Line 
                        type="monotone" 
                        dataKey={(data) => data.kontantinsatsProcent === 50 ? data.manadskostnad : null}
                        stroke="#eab308" 
                        strokeWidth={0}
                        dot={{ fill: '#eab308', r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Enhanced table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                      <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                        <th className="text-left py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">
                          <div className="flex items-center">
                            <Coins className="w-4 h-4 mr-2" />
                            Kontantinsats
                          </div>
                        </th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">
                          <div className="flex items-center justify-end">
                            <BarChart className="w-4 h-4 mr-2" />
                            Belåningsgrad
                          </div>
                        </th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">
                          <div className="flex items-center justify-end">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Amorteringskrav
                          </div>
                        </th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">
                          <div className="flex items-center justify-end">
                            <Calendar className="w-4 h-4 mr-2" />
                            Månadskostnad
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {kontantinsatsAlternativ.map((alt, index) => {
                        const isCurrent = Math.abs(alt.kontantinsatsBelopp - input.kontantinsats) < 1000;
                        const isSweetSpot = alt.kontantinsatsProcent === 50;
                        return (
                          <tr 
                            key={alt.kontantinsatsProcent} 
                            className={`border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors ${
                              isCurrent ? 'bg-blue-100 dark:bg-blue-900/20 font-semibold' : 
                              index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                            } ${isSweetSpot ? 'border-l-4 border-l-yellow-500' : ''}`}
                          >
                            <td className="py-3 px-3">
                              <div className="flex items-center">
                                {alt.kontantinsatsProcent}% ({formatNumber(alt.kontantinsatsBelopp)} kr)
                                {isCurrent && <span className="ml-2 text-blue-600 dark:text-blue-400 font-bold">← Nuvarande</span>}
                                {isSweetSpot && <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-bold">⭐ Sweet spot</span>}
                              </div>
                            </td>
                            <td className="text-right py-3 px-3 text-gray-900 dark:text-gray-100">{formatPercent(alt.belåningsgrad)}%</td>
                            <td className="text-right py-3 px-3 text-gray-900 dark:text-gray-100">{formatPercent(alt.amorteringskrav)}%</td>
                            <td className="text-right py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">{formatNumber(alt.manadskostnad)} kr</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 text-sm text-gray-600 dark:text-gray-300 space-y-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="flex items-start">
                    <span className="mr-2">💡</span>
                    <span><strong>Sweet spot vid 50%:</strong> Ingen amortering krävs, vilket ger lägre månadskostnad</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">💡</span>
                    <span><strong>50-70% belåningsgrad:</strong> Kräver 1% amortering per år</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">💡</span>
                    <span><strong>Över 70% belåningsgrad:</strong> Kräver 2% amortering per år</span>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons - Export, Share, Save as Image */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {/* PDF Export Button */}
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
                    <span>Exportera PDF</span>
                  </>
                )}
              </button>

              {/* Save as Image Button */}
              <button
                onClick={handleSaveAsImage}
                disabled={isGeneratingImage}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {isGeneratingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sparar bild...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-5 h-5" />
                    <span>Spara som bild</span>
                  </>
                )}
              </button>

              {/* Share Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Dela resultat</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showShareMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Share Dropdown Menu */}
                {showShareMenu && (
                  <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[200px]">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-900 dark:text-gray-100 transition-colors"
                    >
                      <TwitterIcon className="w-5 h-5 text-blue-400" />
                      <span>Dela på Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-900 dark:text-gray-100 transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-blue-600" />
                      <span>Dela på LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare('email')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-900 dark:text-gray-100 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span>Dela via Email</span>
                    </button>
                  </div>
                )}
              </div>
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
