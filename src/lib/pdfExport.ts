import jsPDF from 'jspdf';
import {
  BostadsInput,
  BostadsResultat,
  KanslighetsAnalys,
  LangsiktigPrognos,
  KontantinsatsAlternativ,
  Engangskostnader,
} from './calculators';

// Helper function to format numbers
const formatNumber = (num: number): string => {
  return Math.round(num).toLocaleString('sv-SE');
};

// Helper function to format percentages
const formatPercent = (num: number): string => {
  return (num * 100).toFixed(2);
};

// Helper function to add header to each page
const addHeader = (doc: jsPDF, pageNum: number, totalPages: number) => {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Bostadsbudget - Kalkyl', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const datum = new Date().toLocaleDateString('sv-SE');
  doc.text(datum, 105, 28, { align: 'center' });
  
  // Page number
  doc.setFontSize(8);
  doc.text(`Sida ${pageNum} av ${totalPages}`, 105, 285, { align: 'center' });
};

// Helper function to add footer
const addFooter = (doc: jsPDF) => {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const datum = new Date().toLocaleDateString('sv-SE');
  doc.text(`Genererad av Bostadsbudget.se - ${datum}`, 105, 290, { align: 'center' });
};

// Main export function
export const generatePDF = async (
  input: BostadsInput,
  resultat: BostadsResultat,
  kanslighetsAnalys: KanslighetsAnalys | null,
  langsiktigPrognos: LangsiktigPrognos[] | null,
  kontantinsatsAlternativ: KontantinsatsAlternativ[] | null,
  hyresJamforelse: number | null,
  engangskostnader: Engangskostnader | null
): Promise<void> => {
  const doc = new jsPDF();
  const totalPages = 3;
  
  // Page 1: Sammanfattning
  addHeader(doc, 1, totalPages);
  
  let yPos = 40;
  
  // Housing type section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const housingTypeLabels: Record<string, { label: string; emoji: string }> = {
    'bostadsratt': { label: 'Bostadsrätt', emoji: '🏢' },
    'villa': { label: 'Villa', emoji: '🏠' },
    'radhus': { label: 'Radhus/Parhus', emoji: '🏘️' },
    'nyproduktion': { label: 'Nyproduktion', emoji: '🏗️' },
  };
  const housingInfo = housingTypeLabels[input.bostadstyp] || housingTypeLabels['bostadsratt'];
  doc.text(`Typ av bostad: ${housingInfo.label}`, 15, yPos);
  yPos += 10;
  
  // Input values table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Inmatade värden', 15, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const inputData = [
    ['Bostadspris', `${formatNumber(input.bostadspris)} kr`],
    ['Kontantinsats', `${formatNumber(input.kontantinsats)} kr`],
    ...(input.andelstal ? [['Andelstal/Insats', `${formatNumber(input.andelstal)} kr`]] : []),
    ['Årsinkomst', input.arsinkomst ? `${formatNumber(input.arsinkomst)} kr` : 'Ej angiven'],
    ['Årsränta', `${formatPercent(input.arsranta)}%`],
    ['Driftkostnad', `${formatNumber(input.driftkostnad)} kr/mån`],
    ['Elkostnad', `${formatNumber(input.elkostnad)} kr/mån`],
    ['Renoveringskostnad', `${formatNumber(input.renoveringskostnad)} kr`],
    ['Renoveringsintervall', `${input.renoveringsintervall} år`],
    ['Analysperiod', `${input.analysperiod} år`],
    ['Bostadsyta', input.bostadsyta ? `${input.bostadsyta} kvm` : 'Ej angiven'],
  ];
  
  inputData.forEach(([label, value]) => {
    doc.text(label + ':', 20, yPos);
    doc.text(value, 110, yPos);
    yPos += 6;
  });
  
  yPos += 5;
  
  // Engångskostnader section
  if (engangskostnader) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Engångskostnader vid köp', 15, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Add type-specific note
    if (input.bostadstyp === 'bostadsratt') {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Bostadsrätt: Ingen lagfart eller pantbrev behövs', 20, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
    }
    
    const engangskostnaderData = [
      ['Kontantinsats', `${formatNumber(engangskostnader.kontantinsats)} kr`],
      ['Lagfart', `${formatNumber(engangskostnader.lagfart)} kr`],
      ['Pantbrev', `${formatNumber(engangskostnader.pantbrev)} kr`],
      ['Mäklarkostnad', `${formatNumber(engangskostnader.maklarkostnad)} kr`],
      ['Övrigt', `${formatNumber(engangskostnader.ovrigt)} kr`],
    ];
    
    engangskostnaderData.forEach(([label, value]) => {
      doc.text(label + ':', 20, yPos);
      doc.text(value, 110, yPos);
      yPos += 6;
    });
    
    // Total with highlight
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(147, 51, 234); // purple-600
    doc.rect(15, yPos - 3, 140, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Totalt behov dag 1:', 20, yPos + 3);
    doc.text(`${formatNumber(engangskostnader.totalt)} kr`, 110, yPos + 3);
    doc.setTextColor(0, 0, 0);
    
    yPos += 12;
  }
  
  // Key metrics cards
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Nyckeltal', 15, yPos);
  yPos += 8;
  
  // Monthly cost (blue)
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(15, yPos, 60, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Total månadskostnad', 45, yPos + 8, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatNumber(resultat.totalPerManad)} kr`, 45, yPos + 18, { align: 'center' });
  
  // Yearly cost (green)
  doc.setFillColor(22, 163, 74); // green-600
  doc.rect(80, yPos, 60, 25, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total årskostnad', 110, yPos + 8, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatNumber(resultat.totalPerAr)} kr`, 110, yPos + 18, { align: 'center' });
  
  // LTV (color based on percentage)
  const ltv = resultat.belåningsgrad;
  let ltvColor: [number, number, number];
  if (ltv <= 0.5) {
    ltvColor = [22, 163, 74]; // green
  } else if (ltv <= 0.7) {
    ltvColor = [234, 179, 8]; // yellow
  } else if (ltv <= 0.85) {
    ltvColor = [249, 115, 22]; // orange
  } else {
    ltvColor = [220, 38, 38]; // red
  }
  doc.setFillColor(...ltvColor);
  doc.rect(145, yPos, 50, 25, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Belåningsgrad', 170, yPos + 8, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatPercent(ltv)}%`, 170, yPos + 18, { align: 'center' });
  
  yPos += 32;
  doc.setTextColor(0, 0, 0);
  
  // Monthly breakdown
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Uppdelning per månad', 15, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Lån (ränta + amortering):', 20, yPos);
  doc.text(`${formatNumber(resultat.lanePerManad)} kr`, 110, yPos);
  yPos += 6;
  
  doc.text('Drift + El:', 20, yPos);
  doc.text(`${formatNumber(resultat.driftOchElPerManad)} kr`, 110, yPos);
  yPos += 6;
  
  doc.text('Renovering (snitt):', 20, yPos);
  doc.text(`${formatNumber(resultat.renoveringPerManad)} kr`, 110, yPos);
  yPos += 10;
  
  // Rental comparison if available
  if (hyresJamforelse && input.bostadsyta) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Jämförelse med hyra', 15, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`För en hyresrätt på ${input.bostadsyta} kvm skulle du betala cirka ${formatNumber(hyresJamforelse)} kr/mån`, 20, yPos);
    yPos += 6;
    
    if (resultat.totalPerManad < hyresJamforelse) {
      doc.text(`✓ Du sparar ~${formatNumber(hyresJamforelse - resultat.totalPerManad)} kr/mån jämfört med hyra`, 20, yPos);
    } else {
      doc.text(`Din boendekostnad är ~${formatNumber(resultat.totalPerManad - hyresJamforelse)} kr/mån högre än hyra`, 20, yPos);
    }
  }
  
  addFooter(doc);
  
  // Page 2: Details
  doc.addPage();
  addHeader(doc, 2, totalPages);
  
  yPos = 40;
  
  // Long-term forecast
  if (langsiktigPrognos && langsiktigPrognos.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Långsiktig prognos', 15, yPos);
    yPos += 8;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    // Table headers
    const colWidths = [15, 35, 35, 35, 35, 30];
    const colX = [15, 30, 65, 100, 135, 170];
    
    doc.text('År', colX[0], yPos);
    doc.text('Kvarvarande lån', colX[1], yPos);
    doc.text('Ack. amortering', colX[2], yPos);
    doc.text('Total kostnad', colX[3], yPos);
    doc.text('Uppsk. värde', colX[4], yPos);
    doc.text('Eget kapital', colX[5], yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    
    langsiktigPrognos.forEach((prognos, index) => {
      if (yPos > 260) {
        doc.addPage();
        addHeader(doc, 2, totalPages);
        yPos = 40;
      }
      
      doc.text(prognos.ar.toString(), colX[0], yPos);
      doc.text(`${formatNumber(prognos.kvarandelLan)} kr`, colX[1], yPos);
      doc.text(`${formatNumber(prognos.ackumuleradAmortering)} kr`, colX[2], yPos);
      doc.text(`${formatNumber(prognos.totalKostnad)} kr`, colX[3], yPos);
      doc.text(`${formatNumber(prognos.uppskattatVarde)} kr`, colX[4], yPos);
      doc.text(`${formatNumber(prognos.egetKapital)} kr`, colX[5], yPos);
      yPos += 5;
    });
    
    yPos += 5;
    doc.setFontSize(7);
    doc.text('* Uppskattat värde baserat på 2% värdestegring per år', 15, yPos);
    yPos += 3;
    doc.text('* Eget kapital = Kontantinsats + Ackumulerad amortering + Värdestegring', 15, yPos);
    yPos += 8;
  }
  
  // Sensitivity analysis
  if (kanslighetsAnalys) {
    if (yPos > 200) {
      doc.addPage();
      addHeader(doc, 2, totalPages);
      yPos = 40;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Känslighetsanalys - "Vad händer om..."', 15, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Scenario 1: Interest +1%
    doc.setFillColor(254, 243, 199); // orange-100
    doc.rect(15, yPos, 60, 25, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Ränta +1%', 45, yPos + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Ny månadskostnad:', 45, yPos + 12, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatNumber(kanslighetsAnalys.rantaPlus1)} kr`, 45, yPos + 18, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const diff1 = kanslighetsAnalys.rantaPlus1 - resultat.totalPerManad;
    doc.text(`↑ +${formatNumber(diff1)} kr/mån`, 45, yPos + 23, { align: 'center' });
    
    // Scenario 2: Interest +2%
    doc.setFillColor(254, 226, 226); // red-100
    doc.rect(80, yPos, 60, 25, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Ränta +2%', 110, yPos + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Ny månadskostnad:', 110, yPos + 12, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatNumber(kanslighetsAnalys.rantaPlus2)} kr`, 110, yPos + 18, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const diff2 = kanslighetsAnalys.rantaPlus2 - resultat.totalPerManad;
    doc.text(`↑ +${formatNumber(diff2)} kr/mån`, 110, yPos + 23, { align: 'center' });
    
    // Scenario 3: Electricity doubled
    doc.setFillColor(254, 249, 195); // yellow-100
    doc.rect(145, yPos, 50, 25, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('El fördubblas', 170, yPos + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Ny månadskostnad:', 170, yPos + 12, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatNumber(kanslighetsAnalys.elFordubblas)} kr`, 170, yPos + 18, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const diff3 = kanslighetsAnalys.elFordubblas - resultat.totalPerManad;
    doc.text(`↑ +${formatNumber(diff3)} kr/mån`, 170, yPos + 23, { align: 'center' });
    
    yPos += 30;
    doc.setTextColor(0, 0, 0);
  }
  
  // Loan details
  if (yPos > 200) {
    doc.addPage();
    addHeader(doc, 2, totalPages);
    yPos = 40;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Låneuppgifter', 15, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const loanData = [
    ['Lånebelopp', `${formatNumber(resultat.lanebelopp)} kr`],
    ['Belåningsgrad', `${formatPercent(resultat.belåningsgrad)}%`],
    ['Amorteringskrav (grundkrav)', `${formatPercent(resultat.amorteringsprocentGrundkrav)}%`],
    ['Amorteringskrav (skärpt)', resultat.harSkarptKrav ? `${formatPercent(resultat.amorteringsprocentSkarptKrav)}%` : 'Ej tillämpligt'],
    ['Totalt amorteringskrav', `${formatPercent(resultat.amorteringsprocent)}%`],
    ['Amortering per år', `${formatNumber(resultat.amorteringPerAr)} kr`],
    ['Ränta per år', `${formatNumber(resultat.rantaPerAr)} kr`],
  ];
  
  loanData.forEach(([label, value]) => {
    doc.text(label + ':', 20, yPos);
    doc.text(value, 110, yPos);
    yPos += 6;
  });
  
  yPos += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Grundkrav: 2% amortering vid belåningsgrad 70-85%, 1% vid 50-70%', 20, yPos);
  yPos += 4;
  doc.text('Skärpt krav: Ytterligare 1% amortering om skuld/inkomst > 4,5', 20, yPos);
  
  addFooter(doc);
  
  // Page 3: Optimization (if relevant)
  if (kontantinsatsAlternativ && kontantinsatsAlternativ.length > 0) {
    doc.addPage();
    addHeader(doc, 3, totalPages);
    
    yPos = 40;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Kontantinsats-optimering', 15, yPos);
    yPos += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Se hur olika kontantinsatser påverkar din månadskostnad och amorteringskrav', 15, yPos);
    yPos += 10;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    // Table headers
    doc.text('Kontantinsats', 15, yPos);
    doc.text('Belåningsgrad', 70, yPos);
    doc.text('Amorteringskrav', 115, yPos);
    doc.text('Månadskostnad', 160, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    
    kontantinsatsAlternativ.forEach((alt) => {
      if (yPos > 270) {
        doc.addPage();
        addHeader(doc, 3, totalPages);
        yPos = 40;
      }
      
      const isCurrent = Math.abs(alt.kontantinsatsBelopp - input.kontantinsats) < 1000;
      if (isCurrent) {
        doc.setFont('helvetica', 'bold');
      }
      
      doc.text(`${alt.kontantinsatsProcent}% (${formatNumber(alt.kontantinsatsBelopp)} kr)`, 15, yPos);
      doc.text(`${formatPercent(alt.belåningsgrad)}%`, 70, yPos);
      doc.text(`${formatPercent(alt.amorteringskrav)}%`, 115, yPos);
      doc.text(`${formatNumber(alt.manadskostnad)} kr`, 160, yPos);
      
      if (isCurrent) {
        doc.text('← Nuvarande', 185, yPos);
        doc.setFont('helvetica', 'normal');
      }
      
      yPos += 5;
    });
    
    addFooter(doc);
  }
  
  // Save the PDF
  const dateString = new Date().toISOString().split('T')[0];
  doc.save(`bostadsbudget_${dateString}.pdf`);
};
