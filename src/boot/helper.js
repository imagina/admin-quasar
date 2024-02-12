import alert from 'modules/qsite/_plugins/alert'
import array from 'modules/qsite/_plugins/array'
import date from 'modules/qsite/_plugins/date'
import helper from 'modules/qsite/_plugins/helper'
import cache from 'modules/qsite/_plugins/cache'
import {remember} from 'modules/qsite/_plugins/remember'
import hook from 'modules/qsite/_plugins/hook'
import crud from 'modules/qcrud/_services/baseService'
import lodash from 'lodash'
import moment from 'moment'
import {uid} from 'quasar'
import {openURL} from 'quasar'
import eventBus from 'modules/qsite/_plugins/eventBus'
import filter from 'modules/qsite/_plugins/filter'
import VueSignaturePad from 'vue-signature-pad';
import notificationPlugin from 'modules/qnotification/_plugins/notification'
import {tour} from 'modules/qgamification/_plugins/tour'
import apiResponse from 'modules/qcrud/_plugins/apiResponse'

export default function ({app, router, store, Vue, ssrContext}) {
  app.config.globalProperties.$alert = alert
  app.config.globalProperties.$array = array
  app.config.globalProperties.$date = date
  app.config.globalProperties.$helper = helper
  app.config.globalProperties.$cache = cache
  app.config.globalProperties.$lodash = lodash
  app.config.globalProperties.$remember = remember
  app.config.globalProperties.$tour = tour
  app.config.globalProperties.$hook = new hook(store)
  app.config.globalProperties.$notification = new notificationPlugin(store)
  app.config.globalProperties.$clone = (dataToClone) => {
    return lodash.cloneDeepWith(dataToClone, value => {
      //Not clone File or Blob  type
      if (value instanceof File || value instanceof Blob) {
        return value
      }
    })
  }
  app.config.globalProperties.$crud = crud
  app.config.globalProperties.$openUrl = openURL
  app.config.globalProperties.$eventBus = eventBus
  app.config.globalProperties.$filter = filter
  app.config.globalProperties.$auth = {
    hasAccess: (can, params) => {
      return store.getters['quserAuth/hasAccess'](can, params)
    },
    hasSetting: (name) => {
      return store.getters['quserAuth/hasSetting'](name)
    },
  }
  app.config.globalProperties.$uid = uid
  app.config.globalProperties.$apiResponse = apiResponse
  app.config.globalProperties.$moment = moment
  //[ptc] app.use(moment)
  // app.use(moment)
  app.use(VueSignaturePad)
}
