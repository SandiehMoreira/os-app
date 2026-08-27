interface SeedModel {
  nome: string;
  capacidades: string[];
  hasFaceId: boolean;
  hasTouchId: boolean;
  hasHomeButton: boolean;
}

interface SeedBrand {
  nome: string;
  models: SeedModel[];
}

const CAPACIDADES_PADRAO = ["64GB", "128GB", "256GB", "512GB"];

export const SEED_BRANDS: SeedBrand[] = [
  {
    nome: "Apple",
    models: [
      { nome: "iPhone SE (2ª/3ª geração)", capacidades: CAPACIDADES_PADRAO, hasFaceId: false, hasTouchId: true, hasHomeButton: true },
      { nome: "iPhone 8 / 8 Plus", capacidades: CAPACIDADES_PADRAO, hasFaceId: false, hasTouchId: true, hasHomeButton: true },
      { nome: "iPhone X / XS / XR", capacidades: CAPACIDADES_PADRAO, hasFaceId: true, hasTouchId: false, hasHomeButton: false },
      { nome: "iPhone 11", capacidades: CAPACIDADES_PADRAO, hasFaceId: true, hasTouchId: false, hasHomeButton: false },
      { nome: "iPhone 12", capacidades: CAPACIDADES_PADRAO, hasFaceId: true, hasTouchId: false, hasHomeButton: false },
      { nome: "iPhone 13", capacidades: CAPACIDADES_PADRAO, hasFaceId: true, hasTouchId: false, hasHomeButton: false },
      { nome: "iPhone 14", capacidades: CAPACIDADES_PADRAO, hasFaceId: true, hasTouchId: false, hasHomeButton: false },
      { nome: "iPhone 15", capacidades: CAPACIDADES_PADRAO, hasFaceId: true, hasTouchId: false, hasHomeButton: false },
      { nome: "iPhone 16", capacidades: CAPACIDADES_PADRAO, hasFaceId: true, hasTouchId: false, hasHomeButton: false },
    ],
  },
  {
    nome: "Samsung",
    models: [
      { nome: "Galaxy A05", capacidades: ["64GB", "128GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Galaxy A15", capacidades: ["128GB", "256GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Galaxy A35", capacidades: ["128GB", "256GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Galaxy A55", capacidades: ["128GB", "256GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Galaxy S23", capacidades: ["128GB", "256GB", "512GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Galaxy S24", capacidades: ["128GB", "256GB", "512GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Galaxy M14", capacidades: ["128GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
    ],
  },
  {
    nome: "Motorola",
    models: [
      { nome: "Moto G04", capacidades: ["64GB", "128GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Moto G24", capacidades: ["128GB", "256GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Moto G54", capacidades: ["128GB", "256GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Moto G84", capacidades: ["256GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Moto Edge 40", capacidades: ["256GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Moto Edge 50", capacidades: ["256GB", "512GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
    ],
  },
  {
    nome: "Xiaomi",
    models: [
      { nome: "Redmi 12", capacidades: ["128GB", "256GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Redmi 13", capacidades: ["128GB", "256GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Redmi Note 12", capacidades: ["128GB", "256GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Redmi Note 13", capacidades: ["128GB", "256GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "POCO X6", capacidades: ["256GB", "512GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
      { nome: "Mi 11", capacidades: ["128GB", "256GB"], hasFaceId: false, hasTouchId: false, hasHomeButton: false },
    ],
  },
];
