import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';
import { cache, helper } from 'src/plugins/utils';
import pluginI18n from 'src/plugins/i18n.ts';

// i18n data
import { messageCompiler } from 'src/modules/qsite/_i18n/master/formats/customFormats';
import numberFormats from 'src/modules/qsite/_i18n/master/formats/currencyFormats';
import datetimeFormats from 'src/modules/qsite/_i18n/master/formats/dateTimeFormats';
import messagesLocal from 'src/modules/qsite/_i18n/JsonLocal/i18n.json';

export default boot(async ({ app, store }) => {
  //Request messages
  const useLocalTranslations = config('app.useLocalTranslations');
  const messagesServer = useLocalTranslations ? {} : await store.dispatch('qtranslationMaster/GET_TRANSLATIONS', { refresh: false });
  const messages = useLocalTranslations ? messagesLocal : messagesServer;
  //===== Get default language
  //From URL
  let defaultLanguage = helper.getLocaleRoutePath(window.location.hash);
  //From Cache
  if (!defaultLanguage) defaultLanguage = await cache.get.item('site.default.locale');
  //From VUEX Store or Config APP
  if (!defaultLanguage) defaultLanguage = store.state.qsiteApp.defaultLocale || config('app.languages.default');

  //====== Config i18n and set instance i18n
  const i18n = createI18n({
    locale: defaultLanguage,
    fallbackLocale: defaultLanguage,
    messageCompiler,
    numberFormats,
    datetimeFormats,
    silentTranslationWarn: true,
    messages,
    warnHtmlInMessage: "off"
  });
  pluginI18n.trans = i18n;
  const {
    trc,
    trn,
    tr,
    trp,
    trd,
    trdT
  } = pluginI18n.trans;

//===== Change language to quasar components
  await store.dispatch('qsiteApp/SET_LOCALE', {
    locale: defaultLanguage,
    ssrContext: false,
    vue: app
  });
  //===== Customs short-keys to locales
  app.config.globalProperties.$trc = trc;
  //number translate
  app.config.globalProperties.$trn = trn;
  //Singular translate
  app.config.globalProperties.$tr = tr;
  //Plural translate
  app.config.globalProperties.$trp = trp;
  //Date translate
  app.config.globalProperties.$trd = trd;
  //Date translate
  app.config.globalProperties.$trdT = trdT;

  //Currency translate


  //Set i18n
  app.use(i18n);
});
