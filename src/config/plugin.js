import {findValue} from 'modules/qsite/_plugins'

export default function (value = '', fallback = null) {
  let indexConfig = require('src/config/index').default

  //Search Value
  let result = findValue(value, indexConfig()) || fallback

  //Response
  return result
}
