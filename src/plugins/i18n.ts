// translations.js
import moment from 'moment';

export default function translation(i18n) {
  const trc = (num, lang) => {
    return i18n.global.n(num, 'currency', lang);
  };

  const trn = (num, type) => {
    if (type === 'percent') num /= 100;
    return type ? i18n.global.n(num, type) : i18n.n(num);
  };

  const tr = (key, params = {}) => {
    return i18n.global.tc(key, 1, params);
  };

  const trp = (key, params = {}) => {
    return i18n.global.tc(key, 2, params);
  };

  const trd = (date, params = { type: 'short', fromUTC: false }) => {
    if (params.fromUTC) date = moment(date).local().format('YYYY-MM-DD HH:mm:ss');
    return i18n.global.d(moment(date, 'YYYY-MM-DD HH:mm:ss').toDate(), params.type);
  };

  const trdT = (date, format = 'MMMM, DD, YYYY HH:mm') => {
    return moment(date).format(format);
  };

  return {
    trc,
    trn,
    tr,
    trp,
    trd,
    trdT
  };
}
