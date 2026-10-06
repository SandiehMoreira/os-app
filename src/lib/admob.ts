import { AdMob, BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";
import { Capacitor } from "@capacitor/core";

// App ID real já configurado no AndroidManifest.xml (app "OS Tecnica" no
// AdMob). O ad unit ID do banner abaixo ainda é o de TESTE oficial do
// Google — trocar pelo real assim que o bloco de anúncio "Banner" for
// criado no AdMob, e então mudar USING_TEST_ADS para false.
const BANNER_AD_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";
const USING_TEST_ADS = true;

let initialized = false;

export async function showBannerAd(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    if (!initialized) {
      await AdMob.initialize({ initializeForTesting: USING_TEST_ADS });
      initialized = true;
    }
    await AdMob.showBanner({
      adId: BANNER_AD_UNIT_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      isTesting: USING_TEST_ADS,
    });
  } catch {
    // Sem anúncio disponível (sem internet, SDK não carregou etc.) — não
    // pode travar o app, só não mostra o banner dessa vez.
  }
}

export async function hideBannerAd(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.hideBanner();
  } catch {
    // ignore
  }
}
