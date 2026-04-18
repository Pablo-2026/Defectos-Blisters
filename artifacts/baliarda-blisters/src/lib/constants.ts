export const DEFECT_TYPE_LABELS: Record<string, string> = {
  arrugas: "Arrugas",
  pisados: "Pisados",
  codificado_cortado: "Codificado cortado",
  codificado_poco_legible: "Codificado poco legible",
  blisters_vacio: "Blisters vacío",
  blisters_ausencia_comprimido: "Blisters con ausencia de comprimido",
  blisters_comprimido_partido: "Blisters con comprimido partido",
  poco_segrinado: "Poco segrinado",
  polvo: "Polvo",
  manchas: "Manchas",
  pinchados: "Pinchados",
  comprimido_con_pelo: "Comprimido con pelo",
};

export const ALL_DEFECT_TYPES = Object.keys(DEFECT_TYPE_LABELS);
