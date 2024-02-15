export default {
  //Home Page
  index: {
    permission: 'isite.settings.manage',
    activated: true,
    path: '/site/settings',
    name: 'app.site.settings',
    page: () => import('src/pages/siteSettings.vue'),
    layout: () => import('layouts/master.vue'),
    title: 'isite.cms.sidebar.adminIndex',
    icon: 'fal fa-cog',
    authenticated: true,
    subHeader: {
      refresh: true,
    }
  }
}
