import { BostadsInput, BostadsResultat } from './calculators';

/**
 * Interface för sparat scenario
 */
export interface SavedScenario {
  id: string;
  name: string;
  input: BostadsInput;
  resultat: BostadsResultat;
  timestamp: number;
}

// Max antal sparade scenarier
const MAX_SCENARIOS = 5;
const STORAGE_KEY = 'bostadsbudget_scenarios';

/**
 * Hämta alla sparade scenarier från localStorage
 */
export function getAllScenarios(): SavedScenario[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Fel vid hämtning av scenarier:', error);
    return [];
  }
}

/**
 * Spara ett nytt scenario
 */
export function saveScenario(
  name: string,
  input: BostadsInput,
  resultat: BostadsResultat
): { success: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'localStorage är inte tillgängligt' };
  }
  
  if (!name.trim()) {
    return { success: false, error: 'Scenariot måste ha ett namn' };
  }
  
  try {
    const scenarios = getAllScenarios();
    
    // Kontrollera max antal
    if (scenarios.length >= MAX_SCENARIOS) {
      return { 
        success: false, 
        error: `Du kan max spara ${MAX_SCENARIOS} scenarier. Ta bort ett befintligt först.` 
      };
    }
    
    // Skapa nytt scenario
    const newScenario: SavedScenario = {
      id: `scenario_${Date.now()}`,
      name: name.trim(),
      input,
      resultat,
      timestamp: Date.now(),
    };
    
    // Lägg till och spara
    scenarios.push(newScenario);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
    
    return { success: true };
  } catch (error) {
    console.error('Fel vid sparning av scenario:', error);
    return { success: false, error: 'Kunde inte spara scenariot' };
  }
}

/**
 * Ta bort ett scenario
 */
export function deleteScenario(id: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const scenarios = getAllScenarios();
    const filtered = scenarios.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Fel vid borttagning av scenario:', error);
    return false;
  }
}

/**
 * Hämta ett specifikt scenario
 */
export function getScenario(id: string): SavedScenario | null {
  const scenarios = getAllScenarios();
  return scenarios.find(s => s.id === id) || null;
}

/**
 * Rensa alla scenarier (för debugging/testning)
 */
export function clearAllScenarios(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Fel vid rensning av scenarier:', error);
  }
}
