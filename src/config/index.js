//Order pages
function orderPages(pages) {
  //=== Set app pages in last position
  let appPages = pages.mainqsite || {}
  delete pages.mainqsite
  pages.mainqsite = appPages
  return pages
}

//Get configs
function getConfigs() {
  //Import configs
  let app = require('src/config/app').default
  let apiRoutes = require('src/config/apiRoutes').default
  let pages = require('src/config/pages').default
  let sidebar = require('src/config/sidebar').default
  let stores = require('modules/qsite/_config/master/application/stores').default
  let main = require('src/config/main').default

  return {
    app,
    apiRoutes,
    pages: orderPages(pages),
    sidebar,
    stores,
    main
  }
}

export default getConfigs
