// pdfGenerator.js (atualizado)
import PDFDocument from 'pdfkit';
import path from "path";
import fs from 'fs';
import os from 'os';

export function gerarPDF(dadosUsuario, relatorio) {
  const doc = new PDFDocument({ margin: 50 });

  const nomeBruto = String(dadosUsuario?.nome ?? 'usuario');
  const nomeArquivo = `Relatório-${nomeBruto.replace(/\s+/g, '_')}.pdf`;
  const pastaDownloads = path.join(os.homedir(), 'Downloads');
  
  if (!fs.existsSync(pastaDownloads)) {
    fs.mkdirSync(pastaDownloads, { recursive: true });
  }

  const caminho = path.join(pastaDownloads, nomeArquivo);
  doc.pipe(fs.createWriteStream(caminho));

  // Cabeçalho
  doc.fontSize(20).text("Relatório de Saúde", { align: "center" }).moveDown();

  // Dados do Paciente
  doc.fontSize(12)
    .text(`Nome: ${dadosUsuario?.nome ?? 'Sem nome'}`)
    .text(`E-mail: ${dadosUsuario?.email ?? 'Sem e-mail'}`)
    .text(`Data de Nascimento: ${formatarData(dadosUsuario?.nascimento) ?? 'Sem data'}`)
    .moveDown();

  // Relatório
  doc.fontSize(14).text("Relatório:", { underline: true }).moveDown();
  doc.fontSize(12);

  // Diários
  doc.text("Diários:", { underline: true }).moveDown(0.5);
  if (Array.isArray(relatorio?.diarios) && relatorio.diarios.length > 0) {
    relatorio.diarios.forEach((diario, index) => {
      if (typeof diario === 'object') {
        doc.text(`Diário ${index + 1} - ${formatarData(diario.data)}:`, { continued: false });
        const conteudo = diario.conteudo || diario.texto || JSON.stringify(diario);
        doc.text(conteudo, { indent: 20, align: 'justify' });
      } else {
        doc.text(`Diário ${index + 1}: ${diario}`, { indent: 20 });
      }
      doc.moveDown(0.5);
    });
  } else {
    doc.text("Nenhum diário registrado.", { indent: 20 });
  }
  doc.moveDown();

  // Questionários
  doc.text("Questionários Respondidos:", { underline: true }).moveDown(0.5);
  if (Array.isArray(relatorio?.questionarios) && relatorio.questionarios.length > 0) {
    const medias = [];
    
    relatorio.questionarios.forEach((questionario, index) => {
      if (typeof questionario === 'object') {
        const media = calcularMediaQuestionario(questionario);
        medias.push(media);
        
        doc.text(`Questionário ${index + 1} - ${formatarData(questionario.data)}:`, { continued: false });
        doc.text(`Nota Média: ${media.toFixed(1)}/10`, { indent: 20 });
        
        // Mostrar respostas se disponíveis
        if (questionario.respostas && typeof questionario.respostas === 'object') {
          Object.entries(questionario.respostas).forEach(([pergunta, resposta]) => {
            doc.text(`${pergunta}: ${resposta}`, { indent: 30 });
          });
        } else if (questionario.nota) {
          doc.text(`Nota: ${questionario.nota}/10`, { indent: 30 });
        }
      } else {
        doc.text(`Questionário ${index + 1}: ${questionario}`, { indent: 20 });
      }
      doc.moveDown(0.5);
    });
    
    // Média geral
    if (medias.length > 0) {
      const mediaGeral = medias.reduce((a, b) => a + b, 0) / medias.length;
      doc.text(`Média Geral: ${mediaGeral.toFixed(1)}/10`, { indent: 20, underline: true });
    }
  } else {
    doc.text("Nenhum questionário respondido.", { indent: 20 });
  }
  doc.moveDown();

  // Questionário Inicial
  doc.text("Questionário Inicial:", { underline: true });
  doc.text(relatorio?.questionario_inicial ? "Respondido" : "Não respondido", { indent: 20 });
  doc.moveDown();

  // Diagnósticos
  doc.text("Diagnósticos:", { underline: true });
  if (Array.isArray(relatorio?.diagnosticos) && relatorio.diagnosticos.length > 0) {
    relatorio.diagnosticos.forEach((diagnostico, index) => {
      doc.text(`Diagnóstico ${index + 1}: ${diagnostico}`, { indent: 20 });
    });
  } else {
    doc.text("Sem diagnósticos registrados.", { indent: 20 });
  }
  doc.moveDown();

  // Rodapé
  doc.moveDown().fontSize(10).text("Este relatório foi gerado automaticamente pelo sistema.", {
    align: "center",
  });

  doc.end();
  return caminho;
}

// MELHORAR FORMATAÇÃO
function formatarData(data) {
  if (!data || data === 'Data não disponível') return 'Data não informada';
  try {
    const date = new Date(data);
    // Formatar como DD/MM/AAAA
    return date.toLocaleDateString('pt-BR');
  } catch {
    return String(data);
  }
}

function calcularMediaQuestionario(questionario) {
  if (questionario.media !== undefined && questionario.media !== null) {
    return Number(questionario.media);
  }
  
  if (questionario.nota !== undefined && questionario.nota !== null) {
    return Number(questionario.nota);
  }
  
  if (questionario.respostas && typeof questionario.respostas === 'object') {
    const valores = Object.values(questionario.respostas)
      .filter(val => typeof val === 'number' && !isNaN(val))
      .map(val => Number(val));
    
    if (valores.length > 0) {
      return valores.reduce((a, b) => a + b, 0) / valores.length;
    }
  }
  
  return 0;
}