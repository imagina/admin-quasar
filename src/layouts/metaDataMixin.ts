/**
 * Generate the metadata for layouts, this needs to be called only from a vue file
 * Docs: https://quasar.dev/quasar-plugins/meta#options-api
 * "this" here refers to vue component
 */

import { createMetaMixin } from 'quasar';


function generateMetaData ()
{
  let routeTitle = ((this.$route.meta && this.$route.meta.title) ? this.$route.meta.title : '');
  if (this.$route.meta && this.$route.meta.headerTitle) routeTitle = this.$route.meta.headerTitle;
  const siteName = this.$getSetting('core::site-name');
  const siteDescription = this.$getSetting('core::site-description');
  const iconHref = this.$store.getters['qsiteApp/getSettingMediaByName']('isite::favicon').path;

  return {
    title: `${this.useLegacyStructure ? this.$tr(routeTitle) : routeTitle} | ${siteName}`,
    meta: {
      description: { name: 'description', content: siteDescription || siteName }
    },
    link: {
      icon: { rel: 'icon', href: iconHref }
    }
  };
}

export default createMetaMixin(generateMetaData);
