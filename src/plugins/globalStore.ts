import { ref, computed } from 'vue';

class GlobalStore {
  store: any

  constructor(store: any) {
    this.store = store;
    this.hasAccess = this.hasAccess.bind(this);
    this.hasSetting = this.hasSetting.bind(this);
  }

  hasAccess(can: string, params: any) {
    return this.store.getters['quserAuth/hasAccess'](can, params)
  }

  hasSetting(name: string) {
    return this.store.getters['quserAuth/hasSetting'](name)
  }

}

const stateStore = ref<any>({
  store: null,
  hasAccess: (can, params) => false,
  hasSetting: (name) => false,
});
const data = computed(() => ({
  get store() {
    return stateStore.value;
  },
  set store(value) {
    stateStore.value = new GlobalStore(value);
  }
})).value;
export default data;

