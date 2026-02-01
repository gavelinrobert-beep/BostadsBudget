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
  let amorteringsprocent = 0;
  if (belåningsgrad > 0.7) {
    amorteringsprocent = 0.02; // 2% per år
  } else if (belåningsgrad > 0.5) {
    amorteringsprocent = 0.01; // 1% per år
  } else {
    amorteringsprocent = 0; // 0% per år
  }

  // 4. Skärpt amorteringskrav: Om årsinkomst finns och lånebelopp > 4.5 × årsinkomst, lägg till +1%
  if (input.arsinkomst && lanebelopp > 4.5 * input.arsinkomst) {
    amorteringsprocent += 0.01;
  }

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
