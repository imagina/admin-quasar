let store = null

const methods = {
  setStore (value)
  {
    store = value;
  },
  get store() {
    return store
  },
  hasAccess(can: string, params?: any) {
    return store.getters['quserAuth/hasAccess'](can, params)
  },
  hasSetting(name: string) {
    return store.getters['quserAuth/hasSetting'](name)
  }

}

/**
 * Instance proxy, this proxy validate if store is initialiced, else
 * return a empty string to prevent errors
 */
const storeProxy = new Proxy(methods, {
  get: function(target, prop)
  {
    if (prop != 'setStore' && !store) return '';
    return target[prop];
  }
});
export default storeProxy;

