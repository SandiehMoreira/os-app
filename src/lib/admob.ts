import { AdMob, BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";
import { Capacitor } from "@capacitor/core";

// App ID e ad unit ID reais do AdMob (app "OS Tecnica", bloco "Banner
// principal"). Blocos de anúncio novos podem levar até 1h pra começar a
// exibir, e o app pode ficar com veiculação limitada por alguns dias até
// o Google concluir a revisão — nesse meio tempo é normal o banner não
// aparecer sempre.
const BANNER_AD_UNIT_ID = "ca-app-pub-5673222320409126/3412910553";
const USING_TEST_ADS = false;

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
