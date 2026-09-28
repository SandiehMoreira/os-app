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

const CAP_BASICO = ["32GB", "64GB", "128GB"];
const CAP_PADRAO = ["64GB", "128GB", "256GB"];
const CAP_ALTO = ["128GB", "256GB", "512GB"];
const CAP_FLAGSHIP = ["128GB", "256GB", "512GB", "1TB"];

function comHomeButton(nome: string, capacidades = CAP_BASICO): SeedModel {
  return { nome, capacidades, hasFaceId: false, hasTouchId: true, hasHomeButton: true };
}

function comFaceId(nome: string, capacidades = CAP_PADRAO): SeedModel {
  return { nome, capacidades, hasFaceId: true, hasTouchId: false, hasHomeButton: false };
}

function semBiometriaFacial(nome: string, capacidades = CAP_PADRAO): SeedModel {
  return { nome, capacidades, hasFaceId: false, hasTouchId: false, hasHomeButton: false };
}

export const SEED_BRANDS: SeedBrand[] = [
  {
    nome: "Apple",
    models: [
      comHomeButton("iPhone 6 / 6 Plus"),
      comHomeButton("iPhone 6S / 6S Plus"),
      comHomeButton("iPhone 7 / 7 Plus"),
      comHomeButton("iPhone 8 / 8 Plus"),
      comHomeButton("iPhone SE (1ª geração)"),
      comHomeButton("iPhone SE (2ª/3ª geração)", CAP_PADRAO),
      comFaceId("iPhone X"),
      comFaceId("iPhone XR"),
      comFaceId("iPhone XS / XS Max"),
      comFaceId("iPhone 11"),
      comFaceId("iPhone 11 Pro / Pro Max"),
      comFaceId("iPhone 12 / 12 Mini"),
      comFaceId("iPhone 12 Pro / Pro Max"),
      comFaceId("iPhone 13 / 13 Mini"),
      comFaceId("iPhone 13 Pro / Pro Max"),
      comFaceId("iPhone 14 / 14 Plus"),
      comFaceId("iPhone 14 Pro / Pro Max", CAP_ALTO),
      comFaceId("iPhone 15 / 15 Plus"),
      comFaceId("iPhone 15 Pro / Pro Max", CAP_ALTO),
      comFaceId("iPhone 16 / 16 Plus"),
      comFaceId("iPhone 16 Pro / Pro Max", CAP_FLAGSHIP),
      comFaceId("iPhone 17 / 17 Pro / Pro Max", CAP_FLAGSHIP),
    ],
  },
  {
    nome: "Samsung",
    models: [
      semBiometriaFacial("Galaxy J2 / J2 Prime", CAP_BASICO),
      semBiometriaFacial("Galaxy J5 / J5 Prime", CAP_BASICO),
      semBiometriaFacial("Galaxy J7 / J7 Prime", CAP_BASICO),
      semBiometriaFacial("Galaxy A03", CAP_BASICO),
      semBiometriaFacial("Galaxy A04 / A04s", CAP_BASICO),
      semBiometriaFacial("Galaxy A05 / A05s"),
      semBiometriaFacial("Galaxy A06"),
      semBiometriaFacial("Galaxy A10 / A10s", CAP_BASICO),
      semBiometriaFacial("Galaxy A12"),
      semBiometriaFacial("Galaxy A13"),
      semBiometriaFacial("Galaxy A14"),
      semBiometriaFacial("Galaxy A15"),
      semBiometriaFacial("Galaxy A16"),
      semBiometriaFacial("Galaxy A20 / A20s", CAP_BASICO),
      semBiometriaFacial("Galaxy A21s"),
      semBiometriaFacial("Galaxy A22"),
      semBiometriaFacial("Galaxy A23"),
      semBiometriaFacial("Galaxy A24"),
      semBiometriaFacial("Galaxy A25"),
      semBiometriaFacial("Galaxy A32"),
      semBiometriaFacial("Galaxy A33"),
      semBiometriaFacial("Galaxy A34"),
      semBiometriaFacial("Galaxy A35"),
      semBiometriaFacial("Galaxy A50 / A50s"),
      semBiometriaFacial("Galaxy A51"),
      semBiometriaFacial("Galaxy A52"),
      semBiometriaFacial("Galaxy A53"),
      semBiometriaFacial("Galaxy A54"),
      semBiometriaFacial("Galaxy A55"),
      semBiometriaFacial("Galaxy M12"),
      semBiometriaFacial("Galaxy M14"),
      semBiometriaFacial("Galaxy M34", CAP_ALTO),
      semBiometriaFacial("Galaxy Note 10", CAP_ALTO),
      semBiometriaFacial("Galaxy Note 20", CAP_ALTO),
      semBiometriaFacial("Galaxy S10", CAP_ALTO),
      semBiometriaFacial("Galaxy S20", CAP_ALTO),
      semBiometriaFacial("Galaxy S21", CAP_ALTO),
      semBiometriaFacial("Galaxy S22", CAP_ALTO),
      semBiometriaFacial("Galaxy S23", CAP_ALTO),
      semBiometriaFacial("Galaxy S23 FE", CAP_ALTO),
      semBiometriaFacial("Galaxy S24", CAP_ALTO),
      semBiometriaFacial("Galaxy S24 FE", CAP_ALTO),
      semBiometriaFacial("Galaxy S25", CAP_FLAGSHIP),
      semBiometriaFacial("Galaxy Z Flip5", CAP_ALTO),
      semBiometriaFacial("Galaxy Z Flip6", CAP_ALTO),
      semBiometriaFacial("Galaxy Z Fold5", CAP_FLAGSHIP),
      semBiometriaFacial("Galaxy Z Fold6", CAP_FLAGSHIP),
    ],
  },
  {
    nome: "Motorola",
    models: [
      semBiometriaFacial("Moto E6", CAP_BASICO),
      semBiometriaFacial("Moto E7", CAP_BASICO),
      semBiometriaFacial("Moto E13", CAP_BASICO),
      semBiometriaFacial("Moto E14", CAP_BASICO),
      semBiometriaFacial("Moto E22", CAP_BASICO),
      semBiometriaFacial("Moto E32"),
      semBiometriaFacial("Moto E40"),
      semBiometriaFacial("Moto G8"),
      semBiometriaFacial("Moto G9"),
      semBiometriaFacial("Moto G10"),
      semBiometriaFacial("Moto G20"),
      semBiometriaFacial("Moto G22"),
      semBiometriaFacial("Moto G23"),
      semBiometriaFacial("Moto G24"),
      semBiometriaFacial("Moto G32"),
      semBiometriaFacial("Moto G34"),
      semBiometriaFacial("Moto G42"),
      semBiometriaFacial("Moto G54"),
      semBiometriaFacial("Moto G55"),
      semBiometriaFacial("Moto G60"),
      semBiometriaFacial("Moto G62"),
      semBiometriaFacial("Moto G72"),
      semBiometriaFacial("Moto G73"),
      semBiometriaFacial("Moto G84", CAP_ALTO),
      semBiometriaFacial("Moto G85", CAP_ALTO),
      semBiometriaFacial("Moto G200", CAP_ALTO),
      semBiometriaFacial("Moto Edge 20", CAP_ALTO),
      semBiometriaFacial("Moto Edge 30", CAP_ALTO),
      semBiometriaFacial("Moto Edge 40", CAP_ALTO),
      semBiometriaFacial("Moto Edge 50", CAP_ALTO),
      semBiometriaFacial("Moto Edge+", CAP_FLAGSHIP),
      semBiometriaFacial("Moto Razr 40", CAP_ALTO),
      semBiometriaFacial("Moto Razr 50", CAP_ALTO),
    ],
  },
  {
    nome: "Xiaomi",
    models: [
      semBiometriaFacial("Redmi 9", CAP_BASICO),
      semBiometriaFacial("Redmi 9A", CAP_BASICO),
      semBiometriaFacial("Redmi 9C", CAP_BASICO),
      semBiometriaFacial("Redmi 10", CAP_BASICO),
      semBiometriaFacial("Redmi 10A", CAP_BASICO),
      semBiometriaFacial("Redmi 10C", CAP_BASICO),
      semBiometriaFacial("Redmi 12", CAP_PADRAO),
      semBiometriaFacial("Redmi 12C", CAP_BASICO),
      semBiometriaFacial("Redmi 13", CAP_PADRAO),
      semBiometriaFacial("Redmi 13C", CAP_BASICO),
      semBiometriaFacial("Redmi Note 9", CAP_PADRAO),
      semBiometriaFacial("Redmi Note 10", CAP_PADRAO),
      semBiometriaFacial("Redmi Note 11", CAP_PADRAO),
      semBiometriaFacial("Redmi Note 12", CAP_PADRAO),
      semBiometriaFacial("Redmi Note 13", CAP_PADRAO),
      semBiometriaFacial("Redmi Note 14", CAP_ALTO),
      semBiometriaFacial("POCO X3"),
      semBiometriaFacial("POCO X4"),
      semBiometriaFacial("POCO X5"),
      semBiometriaFacial("POCO X6", CAP_ALTO),
      semBiometriaFacial("POCO M4"),
      semBiometriaFacial("POCO M5"),
      semBiometriaFacial("POCO M6"),
      semBiometriaFacial("Mi 10", CAP_ALTO),
      semBiometriaFacial("Mi 11", CAP_ALTO),
      semBiometriaFacial("Mi 11 Lite", CAP_PADRAO),
    ],
  },
  {
    nome: "Asus",
    models: [
      semBiometriaFacial("Zenfone Max"),
      semBiometriaFacial("Zenfone Max Pro"),
      semBiometriaFacial("Zenfone 8", CAP_ALTO),
      semBiometriaFacial("Zenfone 9", CAP_ALTO),
      semBiometriaFacial("Zenfone 10", CAP_ALTO),
      semBiometriaFacial("Zenfone 11", CAP_ALTO),
    ],
  },
  {
    nome: "LG",
    models: [
      semBiometriaFacial("K40s", CAP_BASICO),
      semBiometriaFacial("K50s", CAP_BASICO),
      semBiometriaFacial("K51S", CAP_BASICO),
      semBiometriaFacial("K61"),
      semBiometriaFacial("K62"),
      semBiometriaFacial("K71"),
      semBiometriaFacial("Q6", CAP_BASICO),
      semBiometriaFacial("Q60", CAP_BASICO),
      semBiometriaFacial("Velvet", CAP_ALTO),
      semBiometriaFacial("Wing", CAP_ALTO),
    ],
  },
  {
    nome: "Realme",
    models: [
      semBiometriaFacial("C11"),
      semBiometriaFacial("C25"),
      semBiometriaFacial("C55"),
      semBiometriaFacial("Note 50"),
      semBiometriaFacial("Note 60"),
      semBiometriaFacial("8"),
      semBiometriaFacial("9"),
      semBiometriaFacial("GT Master", CAP_ALTO),
    ],
  },
  {
    nome: "Huawei",
    models: [
      semBiometriaFacial("P30", CAP_ALTO),
      semBiometriaFacial("P40", CAP_ALTO),
      semBiometriaFacial("Mate 20", CAP_ALTO),
      semBiometriaFacial("Mate 30", CAP_ALTO),
      semBiometriaFacial("Nova 5T"),
      semBiometriaFacial("Nova 9"),
    ],
  },
  {
    nome: "Nokia",
    models: [
      semBiometriaFacial("G10", CAP_BASICO),
      semBiometriaFacial("G20", CAP_BASICO),
      semBiometriaFacial("G21", CAP_BASICO),
      semBiometriaFacial("C21"),
      semBiometriaFacial("X10"),
    ],
  },
  {
    nome: "Multilaser",
    models: [
      semBiometriaFacial("F Pro", CAP_BASICO),
      semBiometriaFacial("G Pro", CAP_BASICO),
      semBiometriaFacial("H Plus", CAP_BASICO),
      semBiometriaFacial("Ms60S", CAP_BASICO),
      semBiometriaFacial("Ms80S", CAP_BASICO),
    ],
  },
  {
    nome: "Positivo",
    models: [
      semBiometriaFacial("Twist 4", CAP_BASICO),
      semBiometriaFacial("Twist 5", CAP_BASICO),
      semBiometriaFacial("Twist 2 Pro", CAP_BASICO),
      semBiometriaFacial("Twist 3 Pro", CAP_BASICO),
    ],
  },
];
