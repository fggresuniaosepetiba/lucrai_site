const STORAGE_KEY = "lucrai-recibos-numero";

interface SequencialData {
  [year: string]: number;
}

function getSequencialData(): SequencialData {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveSequencialData(data: SequencialData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getUltimoNumeroRecibo(): { year: string; sequencial: number } {
  const data = getSequencialData();
  const currentYear = new Date().getFullYear().toString();
  return { year: currentYear, sequencial: data[currentYear] || 0 };
}

export function gerarProximoNumeroRecibo(): string {
  const data = getSequencialData();
  const currentYear = new Date().getFullYear().toString();
  const currentSeq = data[currentYear] || 0;
  const nextSeq = currentSeq + 1;
  data[currentYear] = nextSeq;
  saveSequencialData(data);
  return `REC-${currentYear}-${String(nextSeq).padStart(6, "0")}`;
}

export function previewProximoNumeroRecibo(): string {
  const { year, sequencial } = getUltimoNumeroRecibo();
  return `REC-${year}-${String(sequencial + 1).padStart(6, "0")}`;
}
