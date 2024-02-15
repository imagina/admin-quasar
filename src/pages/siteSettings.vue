<template>
  <div id="settingPage" class="relative-position">
    <!--Empty result-->
    <not-result class="q-my-md" v-if="!loading && !dataSettings"/>
    <!--Content-->
    <div class="row q-col-gutter-md" v-else>
      <!--Page Actions-->
      <div class="col-xs-12">
        <div class="box box-auto-height">
          <page-actions :title="pageTitle" @refresh="getData"/>
        </div>
      </div>
      <!--Menu settings-->
      <div id="menuContent" class="col-12 col-md-3">
        <div class="box" style="padding: 15px 0 !important;">
          <!--Title-->
          <div class="text-primary text-subtitle1 row items-center q-mb-sm q-px-md">
            <q-icon name="fas fa-boxes" class="q-mr-sm"/>
            {{ $trp('isite.cms.label.module') }}
          </div>
          <!--List Modules-->
          <q-list separator>
            <q-expansion-item v-for="(item, moduleName) in settingsGroup" :key="moduleName" expand-separator
                              :label="getModuleData(moduleName).title" header-style="min-height: 38px"
                              :header-class="`q-pr-sm q-pl-md ${moduleSelected == moduleName ? 'q-item--active' : ''}`"
                              group="menuSettings">
              <q-list separator class="q-pl-md">
                <q-item v-for="(group, groupName) in settingsGroup[moduleName]" :key="groupName" clickable v-ripple
                        :active="groupSelected == groupName && moduleSelected == moduleName" class="q-pl-sm q-pr-md"
                        @click.native="openGroupSettings(moduleName, groupName)"
                        dense v-if="Object.keys(group).length">
                  <q-item-section>
                    {{ groupsName[moduleName][groupName].title || groupsName[moduleName][groupName] }}
                  </q-item-section>
                  <q-item-section side> {{ Object.keys(group).length }}</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </q-list>
        </div>
      </div>
      <!--Form-->
      <div class="col-12 col-md-9">
        <dynamic-form v-if="!loading" v-model="form" :blocks="[{fields: this.$clone(formFields)}]"
                      :title="`${getModuleData(moduleSelected).title} - ${groupsName[moduleSelected][groupSelected].title || groupsName[moduleSelected][groupSelected]}`"
                      @submit="saveSettings()"/>
      </div>
    </div>
    <!--Loading-->
    <inner-loading :visible="loading"/>
  </div>
</template>
<script>
export default {
  mounted() {
    this.$nextTick(async function () {
      this.init()
    })
  },
  data() {
    return {
      loading: false,
      form: {},
      locale: {fields: {}, fieldsTranslatable: {}},
      dataSettings: false,
      moduleSelected: false,
      groupSelected: false,
      settingsToEdit: [],
      deprecatedSettings: [],
      groupsName: {},
      allSiteSettings: this.$store.state.qsiteApp.settings
    }
  },
  computed: {
    //Page title
    pageTitle() {
      const useLegacyStructure = parseInt(this.$store.getters['qsiteApp/getSettingValueByName']('isite::legacyStructureCMS') || 0)
      return useLegacyStructure ? this.$tr(this.$route.meta.title) : this.$route.meta.title
    },
    //Return setting assigned settings
    assignedSettings() {
      let userSettings = this.$store.state.quserAuth.settings || {}
      let assignedSettings = userSettings.assignedSettings || []
      return Array.isArray(assignedSettings) ? assignedSettings : []
    },
    //Return settings group
    settingsGroup() {
      let settings = this.$clone(this.dataSettings)
      let response = {} //Default response
      this.groupsName = {}// reset group names

      //Group fields
      Object.keys(settings).forEach(moduleName => {
        response[moduleName] = {General: {}}//Default module
        Object.keys(settings[moduleName]).forEach(fieldName => {
          let field = settings[moduleName][fieldName]//Get field
          //Create group fields
          //Set group name
          if (!this.groupsName[moduleName]) this.groupsName[moduleName] = {}
          this.groupsName[moduleName][field.groupName || 'General'] = (field.groupTitle || 'General')
          //validate ig group already exist
          if (!response[moduleName][field.groupName || 'General']) response[moduleName][field.groupName || 'General'] = {}
          //Add field
          if (!this.deprecatedSettings.includes(field.name) && !this.deprecatedSettings.includes(field.fakeFieldName))
            response[moduleName][field.groupName || 'General'][fieldName] = field
        })
      })

      //Validate assigned settings
      if (this.assignedSettings.length) {
        Object.keys(response).forEach(moduleName => {
          Object.keys(response[moduleName]).forEach(moduleGroupName => {
            Object.keys(response[moduleName][moduleGroupName]).forEach(settingName => {
              let setting = response[moduleName][moduleGroupName][settingName]
              if (!this.assignedSettings.includes(setting.fakeFieldName || setting.name))
                delete response[moduleName][moduleGroupName][settingName]
            })
          })
        })
      }

      //Validate empty groups
      Object.keys(response).forEach(moduleName => {
        let keepModule = false
        //Validate if some child group has settings
        Object.keys(response[moduleName]).forEach(moduleGroupName => {
          if (Object.keys(response[moduleName][moduleGroupName]).length) keepModule = true
        })
        //Delete module from data
        if (!keepModule) delete response[moduleName]
      })

      //Response
      return response
    },
    //Return form fields settings to edit
    formFields() {
      let response = {}
      //get form fields
      let fields = Object.keys(this.settingsToEdit).length ? this.$clone(this.settingsToEdit) :
          this.$clone(this.moduleSelected ? this.settingsGroup[this.moduleSelected][this.groupSelected] : [])

      //Set extra data to every field
      Object.keys(fields).forEach(fieldName => {
        let field = fields[fieldName]
        response[fieldName] = {...field, fieldItemId: this.getSettingId(field, fieldName)}
      })
      //response
      return response
    }
  },
  methods: {
    //Init method
    async init() {
      await this.getData()//Get data
      this.openSettingName()//Open default group
    },
    //Get Data
    getData() {
      this.getColorContrast()
      return new Promise(async resolve => {
        this.loading = true
        const response = await Promise.all([
          this.$store.dispatch('qsiteApp/GET_SITE_SETTINGS', {centralizedBrand: false, setToSite: false}),//Get settings
          this.getSettingFields(),//Get setting fields
          this.getDeprecatedSettings()//Get seprecated settings
        ])
        //Set local site settings data
        this.allSiteSettings = this.$clone(response[0].siteSettings || [])
        //Set Default selected
        if (!this.moduleSelected && this.dataSettings) {
          this.moduleSelected = Object.keys(this.settingsGroup)[0]//Set module selected
          //Set group selected
          if (!this.groupSelected) this.groupSelected = Object.keys(this.settingsGroup[this.moduleSelected])[0]
        }
        this.$store.dispatch('qsiteApp/SET_SITE_COLORS')//Set colors
        this.setFormData()//Set form data
        this.loading = false
        resolve(true)
      })
    },
    //get color contrast
    getColorContrast() {
      const master = document.querySelector('#masterDrawers')
      if (!master) return false;
      const bgColor = getComputedStyle(master).getPropertyValue('--q-color-primary')
      const contrast = this.$helper.pickTextColor(bgColor)
      master.style.setProperty('--q-color-contrast', contrast)
    },
    //Get settings Fields
    getSettingFields() {
      return new Promise((resolve, reject) => {
        this.dataSettings = false//Reset data settings
        //Request Params
        let requestParams = {
          refresh: true,
          params: {filter: {allTranslations: true, configNameByModule: 'settings-fields'}}
        }
        //Request
        this.$crud.index('apiRoutes.qsite.configs', requestParams).then(response => {
          //Default settings fields
          let settingsFields = {}

          //Get only settings fields from configs
          if (response.data) {
            for (var moduleName in response.data) {
              let fields = response.data[moduleName]
              if (fields && Object.keys(fields).length) settingsFields[moduleName] = fields
            }
          }

          //Set settings fields
          if (Object.keys(settingsFields).length) this.dataSettings = settingsFields
          resolve(response.data)
        }).catch(e => {
          this.$apiResponse.handleError(error, () => {
            this.$alert.error(this.$tr('isite.cms.message.errorRequest'))
            resolve([])
          })
        })
      })
    },
    //Get deprecate settings config
    getDeprecatedSettings() {
      return new Promise((resolve, reject) => {
        //Request Params
        let requestParams = {
          refresh: true,
          params: {filter: {configName: 'isite.deprecated-settings'}}
        }
        //Request
        this.$crud.index('apiRoutes.qsite.configs', requestParams).then(response => {
          this.deprecatedSettings = this.$clone(response.data)
          resolve(response.data)
        }).catch(e => {
          this.$apiResponse.handleError(error, () => {
            this.$alert.error(this.$tr('isite.cms.message.errorRequest'))
            resolve([])
          })
        })
      })
    },
    //Set form Data
    setFormData() {
      let formData = {}//instance form data
      let settingValues = this.$clone(this.allSiteSettings)//Get all setting values
      let defaultLocale = this.$clone(this.$store.state.qsiteApp.defaultLocale)//Get selected locales
      let selectedLocales = this.$clone(this.$store.state.qsiteApp.selectedLocales)//Get selected locales
      selectedLocales.forEach(item => formData[item] = {})//set locales to formData

      //Format settings
      Object.values(this.formFields).forEach(field => {
        //Get setting field
        let setting = settingValues.find(item => item.name == (field.fakeFieldName || field.name))//Get setting value
        //Set by language
        if (field.isTranslatable) {
          selectedLocales.forEach(lang => {
            let value = setting.translations ? setting.translations.find(item => item.locale == lang) : null
            try {
              formData[lang][setting.name] = value ? JSON.parse(value.value) : setting.value
            } catch (err) {
              formData[lang][setting.name] = value ? value.value : setting.value
            }
          })
        } else formData[setting.name] = setting.value
      })

      //Set form data
      setTimeout(() => this.form = this.$clone(formData), 50)
    },
    //Return item Id to field
    getSettingId(field, key) {
      //Get setting name
      let settingName = field.fakeFieldName || field.name || key
      //Get all setting values
      let settingValue = this.allSiteSettings.find(item => item.name == settingName)
      //Response
      return settingValue ? settingValue.id : null
    },
    //Get dataForm. order settings data to backend
    getDataForm() {
      let formData = this.$clone(this.form)//Get form data
      let selectedLocales = this.$clone(this.$store.state.qsiteApp.selectedLocales)//Get selected locales
      let response = {}//Default response

      Object.keys(formData).forEach(fieldName => {
        //Set no translatable fields
        if (selectedLocales.indexOf(fieldName) == -1) response[fieldName] = formData[fieldName]
        else {//Set translatables values. Order translate values
          Object.keys(formData[fieldName]).forEach(transfieldName => {
            if (!response[transfieldName]) response[transfieldName] = {}
            response[transfieldName][fieldName] = (typeof formData[fieldName][transfieldName] == 'string') ?
                formData[fieldName][transfieldName] : JSON.stringify(formData[fieldName][transfieldName])

          })
        }
      })

      //Response
      return response
    },
    //Save settings
    saveSettings() {
      this.loading = true

      if (this.moduleSelected == 'Core'){
        //Fix empty locale field
        if( !this.form['core::locales'].length){
          const defaultLocale =  this.$store.getters['qsiteApp/getDefaultLocale']
          this.form['core::locales'].push(defaultLocale)
        }

        //Set locale on cache
        this.$store.dispatch('qsiteApp/SET_LOCALE', {
          locale: this.form['core::locales'][0]
        })
      }

      //Request
      this.$crud.post('apiRoutes.qsite.settings', {attributes: this.getDataForm()}).then(async response => {
        this.$alert.info(this.$tr('isite.cms.message.recordUpdated'))
        this.getColorContrast()
        this.getData()
      }).catch(error => {
        this.$alert.error(this.$tr('isite.cms.message.recordNoUpdated'))
        console.error('[UPDATE-SETTINGS]::error:', error)
        this.loading = false
      })
    },
    //Open setting name
    openSettingName() {
      let moduleName = this.$route.query.module//Get setting from URL
      let groupName = this.$route.query.group//Get settings name from url
      let settingsName = this.$route.query.settings//Get settings name from url

      //Get settings by module name
      let moduleSettings = this.$clone(this.settingsGroup[this.$helper.toCapitalize(moduleName || '')])

      if (moduleSettings) {
        let settingsToEdit = {}//Reset settings to edit
        //Search by setting name
        if (settingsName) {
          //Add module name to every setting name
          settingsName = settingsName.split(',').map(item => `${moduleName.toLowerCase()}::${item}`)
          //Search setting by name
          Object.keys(moduleSettings || []).forEach(moduleGroupName => {
            Object.keys(moduleSettings[moduleGroupName]).forEach(settingName => {
              let setting = moduleSettings[moduleGroupName][settingName]
              if (settingsName.includes(setting.name) || settingsName.includes(setting.fakeFieldName)) {
                settingsToEdit[settingName] = setting
              }
            })
          })
        }

        //Open group settings
        groupName = Object.keys(moduleSettings).includes(groupName) ? groupName : Object.keys(moduleSettings).pop()
        this.openGroupSettings(moduleName, groupName, settingsToEdit)
      }
    },
    //Open moodule group setting
    openGroupSettings(moduleName, groupName, settingsToEdit = []) {
      this.moduleSelected = this.$helper.toCapitalize(moduleName)
      this.groupSelected = groupName
      this.settingsToEdit = settingsToEdit
      this.setFormData()
    },
    //return module name
    getModuleData(moduleName) {
      let moduleData = this.$store.state.qsiteApp.modules
      return Object.values(moduleData).find(module => module.alias == moduleName.toLowerCase())
    }
  }
}
</script>
<style lang="scss">
#settingPage {
  .q-item {
    font-size: 14px;
    color: $grey-9;

    &.q-item--active {
      color: $primary;

      .q-icon {
        color: $primary;
      }
    }
  }
}
</style>
