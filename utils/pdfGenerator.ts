
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pilot, Category, TimingRow, RaceResult } from '../types';

const drawKDOHeader = (doc: jsPDF, title: string, subtitle: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 38, pageWidth, 2, 'F');
  
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text("KDO", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("KART DISCIPLINA OFICIAL", 14, 28);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(title.toUpperCase(), pageWidth - 14, 18, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text(subtitle.toUpperCase(), pageWidth - 14, 25, { align: 'right' });
  
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text(`EMISIÓN OFICIAL: ${new Date().toLocaleString('es-AR')}`, pageWidth - 14, 33, { align: 'right' });
};

// 1. PDF de Inscriptos Simple
export const generateInscriptosSimplePDF = (pilots: Pilot[]) => {
  const doc = new jsPDF();
  drawKDOHeader(doc, "PLANILLA DE INSCRIPTOS", "LISTADO SIMPLE POR DORSAL");
  
  autoTable(doc, {
    startY: 45,
    head: [['KART', 'RANKING', 'CATEGORÍA', 'PILOTO']],
    body: pilots.map(p => [`#${p.number}`, p.ranking || '-', p.category, p.name]),
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [37, 99, 235] }
  });
  
  doc.save(`KDO_Inscriptos_Simple_${Date.now()}.pdf`);
};

// 2. PDF de Inscriptos con Licencias
export const generateInscriptosLicenciasPDF = (pilots: Pilot[]) => {
  const doc = new jsPDF();
  drawKDOHeader(doc, "REGISTRO DE LICENCIAS", "FISCALIZACIÓN MÉDICA Y DEPORTIVA");
  
  autoTable(doc, {
    startY: 45,
    head: [['KART', 'RANKING', 'CATEGORÍA', 'PILOTO', 'LIC. MÉDICA', 'LIC. DEPORTIVA']],
    body: pilots.map(p => [`#${p.number}`, p.ranking || '-', p.category, p.name, p.medicalLicense, p.sportsLicense]),
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [37, 99, 235] }
  });
  
  doc.save(`KDO_Inscriptos_Licencias_${Date.now()}.pdf`);
};

// 3. PDF Cronológico de Inscripción
export const generateInscriptosCronologicoPDF = (pilots: Pilot[]) => {
  const doc = new jsPDF();
  drawKDOHeader(doc, "ORDEN DE LLEGADA", "LISTADO CRONOLÓGICO DE REGISTRO");
  
  const sorted = [...pilots].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  
  autoTable(doc, {
    startY: 45,
    head: [['ORDEN', 'KART', 'RANKING', 'PILOTO', 'CATEGORÍA', 'FECHA INSCRIPCIÓN']],
    body: sorted.map((p, i) => [
      i + 1, 
      `#${p.number}`, 
      p.ranking || '-', 
      p.name, 
      p.category,
      new Date(p.createdAt || 0).toLocaleString('es-AR')
    ]),
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0], textColor: [37, 99, 235] }
  });
  
  doc.save(`KDO_Orden_Llegada_${Date.now()}.pdf`);
};

// 4. PDF por Categoría Cronológico
export const generateInscriptosPorCategoriaPDF = (pilots: Pilot[], categories: string[]) => {
  const doc = new jsPDF();
  let currentY = 45;

  drawKDOHeader(doc, "PLANILLA POR CATEGORÍAS", "SEGMENTACIÓN CRONOLÓGICA");

  categories.forEach((cat, idx) => {
    const catPilots = pilots
      .filter(p => p.category === cat)
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    if (catPilots.length === 0) return;

    if (idx > 0 && currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`CATEGORÍA: ${cat.toUpperCase()}`, 14, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [['ORDEN', 'KART', 'RANKING', 'PILOTO', 'HORA REGISTRO']],
      body: catPilots.map((p, i) => [
        i + 1, 
        `#${p.number}`, 
        p.ranking || '-', 
        p.name,
        new Date(p.createdAt || 0).toLocaleTimeString('es-AR')
      ]),
      theme: 'grid',
      headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255] },
      margin: { bottom: 20 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  });
  
  doc.save(`KDO_Por_Categorias_${Date.now()}.pdf`);
};

// 5. PDF Grupos de Salida a Pista
export const generateGruposPistaPDF = (pilots: Pilot[], categories: string[]) => {
  const doc = new jsPDF();
  let currentY = 45;

  drawKDOHeader(doc, "GRUPOS DE SALIDA", "ORGANIZACIÓN DE TANDAS EN PISTA");

  categories.forEach((cat) => {
    const catPilots = pilots
      .filter(p => p.category === cat)
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    if (catPilots.length === 0) return;

    const groupSize = 15;
    for (let i = 0; i < catPilots.length; i += groupSize) {
      const groupNum = Math.floor(i / groupSize) + 1;
      const groupPilots = catPilots.slice(i, i + groupSize);
      const groupLabel = groupNum === 1 ? 'A' : groupNum === 2 ? 'B' : 'C';

      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.text(`${cat.toUpperCase()} - GRUPO ${groupLabel}`, 14, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [['POS', 'KART', 'PILOTO', 'RANK']],
        body: groupPilots.map((p, idx) => [idx + 1, `#${p.number}`, p.name, p.ranking || '-']),
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    }
  });
  
  doc.save(`KDO_Grupos_Pista_${Date.now()}.pdf`);
};

// 6. PDF Pilotos Inscriptos Compacto (2 columnas)
export const generateRegisteredPilotsPDF = (pilots: Pilot[], category: string) => {
  const doc = new jsPDF();
  drawKDOHeader(doc, "LISTADO DE INSCRIPTOS", `CATEGORÍA: ${category}`);
  
  const sortedPilots = [...pilots].sort((a, b) => parseInt(a.number) - parseInt(b.number));

  const half = Math.ceil(sortedPilots.length / 2);
  const leftColumn = sortedPilots.slice(0, half);
  const rightColumn = sortedPilots.slice(half);

  const formatRow = (p: Pilot, i: number, offset: number) => [
    i + 1 + offset,
    `#${p.number}`,
    p.name,
    p.category
  ];

  autoTable(doc, {
    startY: 45,
    margin: { right: 107 },
    head: [['POS', 'KART', 'PILOTO', 'CATEGORÍA']],
    body: leftColumn.map((p, i) => formatRow(p, i, 0)),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [0, 0, 0], textColor: [37, 99, 235] }
  });

  if (rightColumn.length > 0) {
    autoTable(doc, {
      startY: 45,
      margin: { left: 107 },
      head: [['POS', 'KART', 'PILOTO', 'CATEGORÍA']],
      body: rightColumn.map((p, i) => formatRow(p, i, half)),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [0, 0, 0], textColor: [37, 99, 235] }
    });
  }

  doc.save(`KDO_Inscriptos_${category.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

export const generateBriefingAttendancePDF = (pilots: Pilot[]) => {
  const doc = new jsPDF();
  drawKDOHeader(doc, "PLANILLA DE ASISTENCIA", "BRIEFING OBLIGATORIO DE PILOTOS");
  
  autoTable(doc, {
    startY: 45,
    head: [['DORSAL', 'PILOTO', 'CATEGORÍA', 'FIRMA']],
    body: pilots.map(p => [`#${p.number}`, p.name, p.category, '_______________________']),
    theme: 'grid',
    styles: { cellPadding: 5, fontSize: 10 },
    headStyles: { fillColor: [0, 0, 0], textColor: [37, 99, 235] }
  });
  
  doc.save(`KDO_Briefing_${new Date().toLocaleDateString()}.pdf`);
};

export const generatePilotCredential = (pilot: Pilot) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85, 55] });
  
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 85, 55, 'F');
  
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 85, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("CREDENCIAL OFICIAL KDO 2026", 42.5, 8, { align: 'center' });
  
  doc.setFillColor(30, 30, 30);
  doc.roundedRect(6, 18, 25, 30, 2, 2, 'F');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(6);
  doc.text("PHOTO", 18.5, 33, { align: 'center' });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(pilot.name.toUpperCase(), 35, 22);
  
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(18);
  doc.text(`KART #${pilot.number}`, 35, 32);
  
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(7);
  doc.text(`CAT: ${pilot.category}`, 35, 38);
  doc.text(`LIC. MÉDICA: ${pilot.medicalLicense}`, 35, 42);
  doc.text(`LIC. DEPORTIVA: ${pilot.sportsLicense}`, 35, 46);
  
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 52, 85, 3, 'F');
  
  doc.save(`KDO_Credencial_${pilot.number}.pdf`);
};

export const generatePilotsPDF = (pilots: Pilot[], title: string, category?: Category) => {
  const doc = new jsPDF();
  drawKDOHeader(doc, title, category ? `CATEGORÍA: ${category}` : 'PADRÓN GENERAL');
  autoTable(doc, {
    startY: 45,
    head: [['ORDEN', 'KART', 'PILOTO', 'CATEGORÍA', 'ESTADO']],
    body: pilots.map((p, i) => [i + 1, `#${p.number}`, p.name, p.category, p.status]),
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [37, 99, 235] }
  });
  doc.save(`KDO_Listado_${Date.now()}.pdf`);
};

export const generateChampionshipPDF = (championshipName: string, category: string, pilots: Pilot[]) => {
  const doc = new jsPDF();
  drawKDOHeader(doc, "STANDINGS OFICIALES", `${championshipName} - ${category}`);
  autoTable(doc, {
    startY: 45,
    head: [['POS', 'KART', 'PILOTO', 'VICTORIAS', 'PUNTOS']],
    body: pilots.map((p, i) => [i + 1, `#${p.number}`, p.name, p.stats?.wins || 0, (p.stats?.points || 0).toFixed(1)]),
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0], textColor: [37, 99, 235] }
  });
  doc.save(`KDO_Standings_${category}.pdf`);
};

export const generateOfficialResultsPDF = (category: string, pilots: any[], sessionName: string = "CLASIFICACIÓN OFICIAL", eventName: string = "") => {
  const doc = new jsPDF();
  drawKDOHeader(doc, sessionName, `${eventName} - CATEGORÍA: ${category}`);
  
  const half = Math.ceil(pilots.length / 2);
  const leftColumn = pilots.slice(0, half);
  const rightColumn = pilots.slice(half);

  const formatRow = (p: any, i: number, offset: number) => [
    i + 1 + offset, 
    `#${p.number}`, 
    p.name.toUpperCase(), 
    sessionName.toUpperCase()
  ];

  autoTable(doc, {
    startY: 45,
    margin: { right: 107 },
    head: [['POS', 'KART', 'PILOT', 'OFFICIAL CLASSIFICATION']],
    body: leftColumn.map((p, i) => formatRow(p, i, 0)),
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [0, 0, 0], textColor: [37, 99, 235] }
  });

  if (rightColumn.length > 0) {
    autoTable(doc, {
      startY: 45,
      margin: { left: 107 },
      head: [['POS', 'KART', 'PILOT', 'OFFICIAL CLASSIFICATION']],
      body: rightColumn.map((p, i) => formatRow(p, i, half)),
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [0, 0, 0], textColor: [37, 99, 235] }
    });
  }

  doc.save(`KDO_Resultados_${category}_${sessionName.replace(/\s+/g, '_')}.pdf`);
};

export const generateLiveTimingPDF = (title: string, trackFlag: string, timing: TimingRow[]) => {
  const doc = new jsPDF();
  drawKDOHeader(doc, title, `ESTADO PISTA: ${trackFlag}`);
  autoTable(doc, {
    startY: 45,
    head: [['POS', 'NO', 'PILOTO', 'VLTAS', 'MEJOR']],
    body: timing.map(t => [t.pos, t.no, t.name, t.laps, t.bestLap]),
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [37, 99, 235] }
  });
  doc.save(`KDO_LiveTiming_${Date.now()}.pdf`);
};

export const generateLapByLapPDF = (category: string, pilots: Pilot[], eventName: string) => {
  const doc = new jsPDF();
  drawKDOHeader(doc, "ANÁLISIS VUELTA A VUELTA", `${eventName} - ${category}`);
  
  const generateMockLaps = (baseTime: number, laps: number) => {
    return Array.from({length: laps}, (_, i) => {
      const time = baseTime + (Math.random() - 0.5) * 0.8;
      const s1 = time * 0.3;
      const s2 = time * 0.4;
      const s3 = time * 0.3;
      return [
        i + 1,
        time.toFixed(3),
        s1.toFixed(3),
        s2.toFixed(3),
        s3.toFixed(3)
      ];
    });
  };

  let currentY = 45;
  const colWidth = 90;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const colGap = 10;

  for (let i = 0; i < pilots.length; i += 2) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    const leftPilot = pilots[i];
    const rightPilot = pilots[i + 1];

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`#${leftPilot.number} ${leftPilot.name}`, margin, currentY);
    
    const leftLaps = generateMockLaps(48.5, 12);
    
    autoTable(doc, {
      startY: currentY + 2,
      margin: { left: margin, right: pageWidth - (margin + colWidth) },
      head: [['Vta', 'Tiempo', 'S1', 'S2', 'S3']],
      body: leftLaps,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255] }
    });
    
    const leftHeight = (doc as any).lastAutoTable.finalY;

    if (rightPilot) {
      doc.text(`#${rightPilot.number} ${rightPilot.name}`, margin + colWidth + colGap, currentY);
      const rightLaps = generateMockLaps(48.8, 12);
      
      autoTable(doc, {
        startY: currentY + 2,
        margin: { left: margin + colWidth + colGap, right: margin },
        head: [['Vta', 'Tiempo', 'S1', 'S2', 'S3']],
        body: rightLaps,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1 },
        headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255] }
      });
      
      const rightHeight = (doc as any).lastAutoTable.finalY;
      currentY = Math.max(leftHeight, rightHeight) + 10;
    } else {
      currentY = leftHeight + 10;
    }
  }

  doc.save(`KDO_Vuelta_A_Vuelta_${category}.pdf`);
};
