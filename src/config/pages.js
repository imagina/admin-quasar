import appConfig from 'src/config/app';

class AutoLoadPages {
  constructor() {
    this.pages = {};
    this.modules = appConfig.modules;
    this.updatePages = [];
    //Load main pages
    this.loadPages({ prefix: 'main', name: 'mainPages' });
    //Load iadmin pages
    if (appConfig.mode == 'iadmin') this.loadPages({ name: 'adminPages' });
    //Load ipanel pages
    if (appConfig.mode == 'ipanel') this.loadPages({ name: 'panelPages' });
  }

  //Load modules backend page
  loadPages(params = {}) {
    this.modules.forEach(moduleName => {
      let configPage = false;
      let namePage = `${params.prefix || ''}${moduleName}`;

      //Search module in project (src)
      try {
        configPage = require(`src/modules/${moduleName}/_config/${params.name}`);
      } catch (e) {
      }

      //Add pages
      this.pages[namePage] = configPage ? configPage.default : {};
    });
  }
}

//Create new class
const autoLoadPages = new AutoLoadPages();

//Response
export default autoLoadPages.pages;
