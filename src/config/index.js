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
  let main = require('src/config/main').default

  return {
    app,
    apiRoutes,
    main
  }
}

export default getConfigs
