import moment from 'moment';
import { ref, computed } from 'vue';

class Translator {
  constructor(i18n) {
    this.i18n = i18n;
    this.trc = this.trc.bind(this);
    this.trn = this.trn.bind(this);
    this.tr = this.tr.bind(this);
    this.trp = this.trp.bind(this);
    this.trd = this.trd.bind(this);
    this.trdT = this.trdT.bind(this);
  }

  trc(num, lang) {
    return this.i18n.global.n(num, 'currency', lang);
  }

  trn(num, type) {
    if (type === 'percent') num /= 100;
    return type ? this.i18n.global.n(num, type) : this.i18n.n(num);
  }

  tr(key, params = {}) {
    return this.i18n.global.tc(key, 1, params);
  }

  trp(key, params = {}) {
    return this.i18n.global.tc(key, 2, params);
  }

  trd(date, params = { type: 'short', fromUTC: false }) {
    if (params.fromUTC) {
      date = moment(date).local().format('YYYY-MM-DD HH:mm:ss');
    }
    return this.i18n.global.d(moment(date, 'YYYY-MM-DD HH:mm:ss').toDate(), params.type);
  }

  trdT(date, format = 'MMMM, DD, YYYY HH:mm') {
    return moment(date).format(format);
  }
}

const stateTrans = ref(null);
const data = computed(() => ({
  get trans() {
    return stateTrans.value;
  },
  set trans(value) {
    stateTrans.value = new Translator(value);
  }
})).value;
export default data;

