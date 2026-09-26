// Valores válidos confirmados no schema OpenAPI do backend (GET /api/schema/ → CustomerTypeEnum).
// "industrial" sozinho NÃO é aceito — o enum real é "industrial_flat".
export const CUSTOMER_TYPES = [
  { value: "residential", label: "Residencial" },
  { value: "commercial", label: "Comercial" },
  { value: "industrial_flat", label: "Industrial" },
] as const;

export type CustomerType = (typeof CUSTOMER_TYPES)[number]["value"];

export const FLEXIBLE_PCT_MIN = 0;
export const FLEXIBLE_PCT_MAX = 80;
export const MONTHLY_KWH_MIN = 1;
