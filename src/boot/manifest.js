/**
 * Inject custom manifest using Settings information
 * Change the name, description, colors and icons...
 *
 */

import { boot } from 'quasar/wrappers';
import { store } from 'src/plugins/utils';

export default boot(async (/* { app, router, ... } */) => {
  //Get the manifest link
  const manifestLink = document.querySelector('link[rel="manifest"]');

  if (manifestLink) {
    const baseUrl = window.location.origin;
    const siteName = store.getSetting('core::site-name');
    const siteDescription = store.getSetting('core::site-description') || siteName;
    const siteMainColor = store.getSetting('isite::brandPrimary');
    const favicon = store.getMediaSetting('isite::favicon');

    //Instance new manifest data
    const manifest = {
      name: siteName,
      short_name: siteName,
      description: siteDescription,
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#ffffff',
      theme_color: siteMainColor,
      start_url: baseUrl,
      icons: [
        {
          src: `${baseUrl}/icons/icon-128x128.png`,
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: `${baseUrl}/icons/icon-192x192.png`,
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: `${baseUrl}/icons/icon-256x256.png`,
          sizes: '256x256',
          type: 'image/png'
        },
        {
          src: `${baseUrl}/icons/icon-384x384.png`,
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: `${baseUrl}/icons/icon-512x512.png`,
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    };

    //Replace manifest as Data Url
    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    manifestLink.href = url;

    // Update theme color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) themeColorMeta.setAttribute('content', manifest.theme_color);
  }
});
