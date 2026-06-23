import { formatCurrency, formatDate } from "@/lib/utils";
import type { Receipt, SignatureConfig } from "@/types";

export function gerarHtmlRecibo({ recibo, logoUrl, nomeEmpresa, assinatura }: {
  recibo: Receipt;
  logoUrl?: string;
  nomeEmpresa?: string;
  assinatura?: SignatureConfig | null;
}): string {
  const isRecebimento = recibo.tipo === "recebimento";
  const exibirAssinatura = assinatura?.permitirUso && recibo.exibirAssinatura && assinatura?.imagemBase64 && assinatura?.nomeResponsavel;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${recibo.numero}</title>
<style>
  @page { margin: 20mm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', Arial, sans-serif; color: #1a1a2e; font-size: 12px; line-height: 1.5; }
  .container { max-width: 700px; margin: 0 auto; padding: 20px; }
  .header { text-align: center; margin-bottom: 20px; }
  .header img { max-height: 60px; margin-bottom: 8px; }
  .header .empresa { font-size: 16px; font-weight: 700; color: #1a1a2e; }
  .titulo { text-align: center; margin: 16px 0; }
  .titulo h1 { font-size: 20px; font-weight: 700; color: #0ea5e9; letter-spacing: 1px; }
  .titulo .numero { font-size: 12px; color: #64748b; margin-top: 4px; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
  .dados-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
  .dados-grid .label { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .dados-grid .valor { font-size: 13px; font-weight: 500; color: #1a1a2e; }
  .valor-destaque { text-align: center; margin: 20px 0; }
  .valor-destaque .valor { font-size: 28px; font-weight: 700; color: #0ea5e9; }
  .valor-destaque .extenso { font-size: 12px; color: #64748b; font-style: italic; margin-top: 6px; }
  .info-item { margin: 8px 0; }
  .info-item .label { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-item .valor { font-size: 12px; color: #1a1a2e; margin-top: 2px; }
  .assinatura { text-align: center; margin-top: 40px; padding-top: 20px; }
  .assinatura img { max-height: 60px; margin-bottom: 8px; }
  .assinatura .linha { width: 250px; border-top: 1px solid #1a1a2e; margin: 0 auto 8px; }
  .assinatura .nome { font-weight: 600; font-size: 13px; }
  .assinatura .cargo { font-size: 11px; color: #64748b; }
  .footer { text-align: center; margin-top: 30px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
  .footer span { margin: 0 8px; }
  .cancelado-badge { text-align: center; margin-bottom: 16px; padding: 8px; border: 2px solid #ef4444; color: #ef4444; font-weight: 700; font-size: 14px; }
  .print-only { display: none; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    .print-only { display: block !important; }
  }
</style>
</head>
<body>
<div class="container">
  ${recibo.status === "cancelado" ? '<div class="cancelado-badge">RECIBO CANCELADO</div>' : ""}

  <div class="header">
    ${logoUrl ? `<img src="${logoUrl}" alt="${nomeEmpresa || ""}" />` : ""}
    ${nomeEmpresa ? `<div class="empresa">${nomeEmpresa}</div>` : ""}
  </div>

  <div class="titulo">
    <h1>${isRecebimento ? "RECIBO DE RECEBIMENTO" : "RECIBO DE PAGAMENTO"}</h1>
    <div class="numero">Nº ${recibo.numero}</div>
  </div>

  <hr class="divider" />

  <div class="dados-grid">
    <div>
      <div class="label">${isRecebimento ? "Pagador" : "Recebedor"}</div>
      <div class="valor">${isRecebimento ? recibo.nomePagador : recibo.nomeRecebedor}</div>
      <div style="font-size:11px;color:#64748b;">${isRecebimento ? recibo.documentoPagador : recibo.documentoRecebedor}</div>
    </div>
    <div>
      <div class="label">${isRecebimento ? "Recebedor" : "Pagador"}</div>
      <div class="valor">${isRecebimento ? recibo.nomeRecebedor : recibo.nomePagador}</div>
      <div style="font-size:11px;color:#64748b;">${isRecebimento ? recibo.documentoRecebedor : recibo.documentoPagador}</div>
    </div>
  </div>

  <hr class="divider" />

  <div class="valor-destaque">
    <div class="valor">${formatCurrency(recibo.valor)}</div>
    <div class="extenso">${recibo.valorPorExtenso}</div>
  </div>

  <hr class="divider" />

  <div class="info-item">
    <div class="label">Referente a</div>
    <div class="valor">${recibo.referente}</div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px;">
    <div class="info-item">
      <div class="label">Data</div>
      <div class="valor">${formatDate(recibo.data)}</div>
    </div>
    ${recibo.formaPagamento ? `<div class="info-item"><div class="label">Forma de Pagamento</div><div class="valor">${recibo.formaPagamento}</div></div>` : ""}
  </div>

  ${recibo.parcelaAtual && recibo.parcelasTotal ? `<div class="info-item" style="margin-top:8px;"><div class="label">Parcelamento</div><div class="valor">${recibo.parcelaAtual}/${recibo.parcelasTotal}</div></div>` : ""}

  ${recibo.observacoes ? `<div class="info-item" style="margin-top:8px;"><div class="label">Observações</div><div class="valor">${recibo.observacoes}</div></div>` : ""}

  ${exibirAssinatura ? `
  <div class="assinatura">
    <img src="${assinatura!.imagemBase64}" alt="Assinatura" />
    <div class="linha"></div>
    <div class="nome">${assinatura!.nomeResponsavel}</div>
    <div class="cargo">${assinatura!.cargo}</div>
    <div style="font-size:11px;color:#64748b;margin-top:2px;">${nomeEmpresa || ""}</div>
  </div>
  ` : ""}

  <div class="footer">
    <span>Emitido eletronicamente pelo LUCRAÍ</span>
    <span>${formatDate(recibo.criadoEm)}</span>
    <span>${recibo.numero}</span>
  </div>
</div>
</body>
</html>`;
}

export async function downloadPdf(
  recibo: Receipt,
  logoUrl?: string,
  nomeEmpresa?: string,
  assinatura?: SignatureConfig | null
): Promise<void> {
  try {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    const html = gerarHtmlRecibo({ recibo, logoUrl, nomeEmpresa, assinatura });
    const container = document.createElement("div");
    container.innerHTML = html;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "800px";
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 800,
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${recibo.numero}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    const html = gerarHtmlRecibo({ recibo, logoUrl, nomeEmpresa, assinatura });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${recibo.numero}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export function printRecibo(
  recibo: Receipt,
  logoUrl?: string,
  nomeEmpresa?: string,
  assinatura?: SignatureConfig | null
): void {
  const html = gerarHtmlRecibo({ recibo, logoUrl, nomeEmpresa, assinatura });
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}
