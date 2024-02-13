import crud from 'modules/qcrud/_services/baseService'
import VueSignaturePad from 'vue-signature-pad';
import notificationPlugin from 'modules/qnotification/_plugins/notification'
import {tour} from 'modules/qgamification/_plugins/tour'
import apiResponse from 'modules/qcrud/_plugins/apiResponse'
import utils from 'modules/qsite/_plugins/utils.ts'

export default function ({app, router, store, Vue, ssrContext}) {
  app.config.globalProperties.$alert = utils.alert
  app.config.globalProperties.$array = utils.array
  app.config.globalProperties.$date = utils.date
  app.config.globalProperties.$helper = utils.helper
  app.config.globalProperties.$cache = utils.cache
  app.config.globalProperties.$lodash = utils.lodash
  app.config.globalProperties.$remember = utils.remember
  app.config.globalProperties.$tour = tour
  app.config.globalProperties.$hook = new utils.hook(store)
  app.config.globalProperties.$notification = new notificationPlugin(store)
  app.config.globalProperties.$clone = (dataToClone) => {
    return utils.lodash.cloneDeepWith(dataToClone, value => {
      //Not clone File or Blob  type
      if (value instanceof File || value instanceof Blob) {
        return value
      }
    })
  }
  app.config.globalProperties.$crud = crud
  app.config.globalProperties.$openUrl = utils.openURL
  app.config.globalProperties.$eventBus = utils.eventBus
  app.config.globalProperties.$filter = utils.filter
  app.config.globalProperties.$auth = {
    hasAccess: (can, params) => {
      return store.getters['quserAuth/hasAccess'](can, params)
    },
    hasSetting: (name) => {
      return store.getters['quserAuth/hasSetting'](name)
    },
  }
  app.config.globalProperties.$uid = utils.uid
  app.config.globalProperties.$apiResponse = apiResponse
  app.config.globalProperties.$moment = utils.moment
  //[ptc] app.use(moment)
  // app.use(moment)
  app.use(VueSignaturePad)
}
