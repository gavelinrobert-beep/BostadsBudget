/**
 * Interface för bostadsinput data
 */
export interface BostadsInput {
  bostadspris: number; // kr
  kontantinsats: number; // kr
  arsinkomst?: number; // kr (optional)
  arsranta: number; // decimal, t.ex. 0.045 för 4.5%
  driftkostnad: number; // kr/månad
  elkostnad: number; // kr/månad
  renoveringskostnad: number; // kr
  renoveringsintervall: number; // år
  analysperiod: number; // år
}

/**
 * Interface för bostadsresultat
 */
export interface BostadsResultat {
  lanebelopp: number;
  belåningsgrad: number;
  amorteringsprocent: number;
  amorteringsprocentGrundkrav: number; // Grundkrav baserat på belåningsgrad
  amorteringsprocentSkarptKrav: number; // Skärpt krav (0% eller 1%)
  harSkarptKrav: boolean; // Om skärpt krav tillämpas
  rantaPerAr: number;
  amorteringPerAr: number;
  lanePerManad: number;
  renoveringPerManad: number;
  driftOchElPerManad: number;
  totalPerManad: number;
  totalPerAr: number;
  genomsnittPerManad: number;
}

/**
 * Interface för känslighetsanalys
 */
export interface KanslighetsAnalys {
  rantaPlus1: number; // Månadskostnad med +1% ränta
  rantaPlus2: number; // Månadskostnad med +2% ränta
  elFordubblas: number; // Månadskostnad med dubbel elkostnad
}

/**
 * Interface för långsiktig prognos
 */
export interface LangsiktigPrognos {
  ar: number;
  kvarandelLan: number;
  ackumuleradAmortering: number;
  totalKostnad: number;
  uppskattatVarde: number; // Antagen 2% värdestegring/år
  egetKapital: number; // kontantinsats + amortering + värdestegring
}

/**
 * Interface för kontantinsats-optimering
 */
export interface KontantinsatsAlternativ {
  kontantinsatsProcent: number;
  kontantinsatsBelopp: number;
  lanebelopp: number;
  belåningsgrad: number;
  amorteringskrav: number;
  manadskostnad: number;
}

/**
 * Beräknar bostadskostnad baserat på input parametrar
 * 
 * @param input - BostadsInput objekt med alla nödvändiga parametrar
 * @returns BostadsResultat objekt med beräknade värden
 * @throws Error om input parametrar är ogiltiga
 */
export function beraknaBostadskostnad(input: BostadsInput): BostadsResultat {
  // Validera input
  if (input.bostadspris <= 0) {
    throw new Error('Bostadspris måste vara större än 0');
  }
  if (input.kontantinsats > input.bostadspris) {
    throw new Error('Kontantinsats kan inte vara större än bostadspris');
  }
  if (input.kontantinsats < 0) {
    throw new Error('Kontantinsats kan inte vara negativ');
  }
  if (input.renoveringsintervall <= 0) {
    throw new Error('Renoveringsintervall måste vara större än 0');
  }

  // 1. Lånebelopp = bostadspris - kontantinsats
  const lanebelopp = input.bostadspris - input.kontantinsats;

  // 2. Belåningsgrad = lånebelopp / bostadspris
  const belåningsgrad = lanebelopp / input.bostadspris;

  // 3. Amorteringskrav baserat på belåningsgrad
  let amorteringsprocentGrundkrav = 0;
  if (belåningsgrad > 0.7) {
    amorteringsprocentGrundkrav = 0.02; // 2% per år
  } else if (belåningsgrad > 0.5) {
    amorteringsprocentGrundkrav = 0.01; // 1% per år
  } else {
    amorteringsprocentGrundkrav = 0; // 0% per år
  }

  // 4. Skärpt amorteringskrav: Om årsinkomst finns och lånebelopp > 4.5 × årsinkomst, lägg till +1%
  let amorteringsprocentSkarptKrav = 0;
  let harSkarptKrav = false;
  if (input.arsinkomst && lanebelopp > 4.5 * input.arsinkomst) {
    amorteringsprocentSkarptKrav = 0.01;
    harSkarptKrav = true;
  }

  const amorteringsprocent = amorteringsprocentGrundkrav + amorteringsprocentSkarptKrav;

  // 5. Ränta per år = lånebelopp × årsränta
  const rantaPerAr = lanebelopp * input.arsranta;

  // 6. Amortering per år = lånebelopp × amorteringsprocent
  const amorteringPerAr = lanebelopp * amorteringsprocent;

  // 7. Lån per månad = (ränta + amortering) / 12
  const lanePerManad = (rantaPerAr + amorteringPerAr) / 12;

  // 8. Renovering per månad = (renoveringskostnad / renoveringsintervall) / 12
  const renoveringPerManad = (input.renoveringskostnad / input.renoveringsintervall) / 12;

  // 9. Drift och el per månad = driftkostnad + elkostnad
  const driftOchElPerManad = input.driftkostnad + input.elkostnad;

  // 10. Total per månad = lån + renovering + drift och el
  const totalPerManad = lanePerManad + renoveringPerManad + driftOchElPerManad;

  // 11. Total per år = total per månad × 12
  const totalPerAr = totalPerManad * 12;

  // 12. Genomsnitt per månad = total per månad (enkel modell för MVP)
  // TODO: I framtiden kan detta beräknas baserat på analysperioden för mer avancerad kostnadsprognos
  const genomsnittPerManad = totalPerManad;

  return {
    lanebelopp,
    belåningsgrad,
    amorteringsprocent,
    amorteringsprocentGrundkrav,
    amorteringsprocentSkarptKrav,
    harSkarptKrav,
    rantaPerAr,
    amorteringPerAr,
    lanePerManad,
    renoveringPerManad,
    driftOchElPerManad,
    totalPerManad,
    totalPerAr,
    genomsnittPerManad,
  };
}

/**
 * Beräknar känslighetsanalys för olika scenarier
 * 
 * @param input - BostadsInput objekt
 * @param basResultat - Basresultat från huvudberäkningen
 * @returns KanslighetsAnalys objekt
 */
export function beraknaKanslighetsAnalys(
  input: BostadsInput,
  basResultat: BostadsResultat
): KanslighetsAnalys {
  // Scenario 1: Ränta +1%
  const resultat1 = beraknaBostadskostnad({
    ...input,
    arsranta: input.arsranta + 0.01,
  });
  
  // Scenario 2: Ränta +2%
  const resultat2 = beraknaBostadskostnad({
    ...input,
    arsranta: input.arsranta + 0.02,
  });
  
  // Scenario 3: El fördubblas
  const resultat3 = beraknaBostadskostnad({
    ...input,
    elkostnad: input.elkostnad * 2,
  });
  
  return {
    rantaPlus1: resultat1.totalPerManad,
    rantaPlus2: resultat2.totalPerManad,
    elFordubblas: resultat3.totalPerManad,
  };
}

/**
 * Beräknar långsiktig prognos för år 1, 5, 10 och analysperiod (om > 10)
 * 
 * @param input - BostadsInput objekt
 * @param basResultat - Basresultat från huvudberäkningen
 * @returns Array av LangsiktigPrognos objekt
 * @note Använder mer exakt beräkning med sjunkande räntekostnad baserat på kvarvarande lån
 */
export function beraknaLangsiktigPrognos(
  input: BostadsInput,
  basResultat: BostadsResultat
): LangsiktigPrognos[] {
  const prognoser: LangsiktigPrognos[] = [];
  
  // Bestäm vilka år att beräkna: 1, 5, 10, och analysperiod (om > 10)
  const arToBerakna = [1, 5, 10];
  if (input.analysperiod > 10 && !arToBerakna.includes(input.analysperiod)) {
    arToBerakna.push(input.analysperiod);
  }
  
  // Fast årlig amortering (lånet minskar linjärt)
  const fastAmorteringPerAr = basResultat.amorteringPerAr;
  
  // Beräkna för varje år
  for (const ar of arToBerakna) {
    // Kvarvarande lån efter amortering
    const ackumuleradAmortering = fastAmorteringPerAr * ar;
    const kvarandelLan = Math.max(0, basResultat.lanebelopp - ackumuleradAmortering);
    
    // Beräkna total kostnad mer exakt genom att summera varje år
    // År 1: full ränta, År 2: ränta på (lån - amortering år 1), osv.
    let totalRantaKostnad = 0;
    for (let i = 0; i < ar; i++) {
      const kvarandeLanVidAretsStart = Math.max(0, basResultat.lanebelopp - (fastAmorteringPerAr * i));
      const rantaForAret = kvarandeLanVidAretsStart * input.arsranta;
      totalRantaKostnad += rantaForAret;
    }
    
    // Total kostnad = (ränta + amortering + drift + el + renovering) över perioden
    const totalAmorteringKostnad = ackumuleradAmortering;
    const totalDriftOchEl = (input.driftkostnad + input.elkostnad) * 12 * ar;
    const totalRenovering = (input.renoveringskostnad / input.renoveringsintervall) * ar;
    const totalKostnad = totalRantaKostnad + totalAmorteringKostnad + totalDriftOchEl + totalRenovering;
    
    // Uppskattat värde med 2% värdestegring per år
    const uppskattatVarde = input.bostadspris * Math.pow(1.02, ar);
    
    // Eget kapital = kontantinsats + ackumulerad amortering + värdestegring
    const vardestegring = uppskattatVarde - input.bostadspris;
    const egetKapital = input.kontantinsats + ackumuleradAmortering + vardestegring;
    
    prognoser.push({
      ar,
      kvarandelLan,
      ackumuleradAmortering,
      totalKostnad,
      uppskattatVarde,
      egetKapital,
    });
  }
  
  return prognoser;
}

/**
 * Beräknar alternativ med olika kontantinsatser
 * 
 * @param input - BostadsInput objekt
 * @returns Array av KontantinsatsAlternativ objekt
 */
export function beraknaKontantinsatsAlternativ(
  input: BostadsInput
): KontantinsatsAlternativ[] {
  const alternativ: KontantinsatsAlternativ[] = [];
  const procent = [15, 20, 30, 50];
  
  for (const p of procent) {
    const kontantinsatsBelopp = input.bostadspris * (p / 100);
    const modifiedInput = {
      ...input,
      kontantinsats: kontantinsatsBelopp,
    };
    
    const resultat = beraknaBostadskostnad(modifiedInput);
    
    alternativ.push({
      kontantinsatsProcent: p,
      kontantinsatsBelopp,
      lanebelopp: resultat.lanebelopp,
      belåningsgrad: resultat.belåningsgrad,
      amorteringskrav: resultat.amorteringsprocent,
      manadskostnad: resultat.totalPerManad,
    });
  }
  
  return alternativ;
}

/**
 * Beräknar jämförelse med hyresrätt
 * 
 * @param bostadspris - Bostadspris
 * @returns Uppskattad hyra baserat på schablon 150 kr/kvm (baserat på antagandet att 75 kvm kostar 3 Mkr)
 */
export function beraknaHyresJamforelse(bostadspris: number): number {
  // Antag ca 150 kr/kvm per månad som schablon för genomsnittlig hyra
  // Uppskatta storlek baserat på pris: ungefär 75 kvm för 3 Mkr
  const uppskattadStorlek = (bostadspris / 3000000) * 75;
  const hyraPerManad = uppskattadStorlek * 150;
  return hyraPerManad;
}
