const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find((p) => p.url().includes('/translate')) || pages[0];
  console.log('target:', page.url());

  const action = process.argv[2] || 'delete';
  const lang = process.argv[3] || 'tl';

  const res = await page.evaluate(
    async ({ action, lang }) => {
      try {
        if (action === 'delete') {
          const out = await window.Capacitor.Plugins.Translation.deleteDownloadedModel({ language: lang });
          return { ok: true, out: out === undefined ? 'undefined' : JSON.stringify(out) };
        }
        if (action === 'download-async') {
          window.__dlPromise = window.Capacitor.Plugins.Translation.downloadModel({ language: lang });
          window.__dlPromise.then(
            (v) => { window.__dlResult = { ok: true, v: String(v) }; },
            (e) => { window.__dlResult = { ok: false, e: String((e && (e.message || e)) || e) }; }
          );
          return { ok: true, started: true };
        }
        if (action === 'download-status') {
          return { ok: true, result: window.__dlResult || null };
        }
        if (action === 'list') {
          const out = await window.Capacitor.Plugins.Translation.getDownloadedModels();
          return { ok: true, out: JSON.stringify(out) };
        }
        if (action === 'voices') {
          const out = await window.Capacitor.Plugins.TextToSpeech.getSupportedVoices();
          return { ok: true, out: JSON.stringify(out.voices, null, 1) };
        }
        if (action === 'langcheck') {
          const tags = ['fil-PH', 'tl-PH', 'fil', 'tl', 'en-US'];
          const out = {};
          for (const t of tags) out[t] = await window.Capacitor.Plugins.TextToSpeech.isLanguageSupported({ lang: t });
          return { ok: true, out: JSON.stringify(out) };
        }
        return { ok: false, err: 'unknown action' };
      } catch (e) {
        return { ok: false, err: String((e && (e.message || e)) || e) };
      }
    },
    { action, lang }
  );

  console.log(JSON.stringify(res));
  await browser.close();
})().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
