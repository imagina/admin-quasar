<template>
  <q-layout view="lHh LpR fFf">
    <!-- === ROUTER VIEW === -->
    <drawersBlank />
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import drawersBlank from 'src/modules/qsite/_components/admin/theme2/drawersBlank.vue';
import metaDataMixin from './metaDataMixin';

export default {
  name: 'blankLayout',
  components: {
    drawersBlank
  },
  mixins: [metaDataMixin],
  computed: {
    useLegacyStructure() {
      const legacyStructure = parseInt(this.$store.getters['qsiteApp/getSettingValueByName']('isite::legacyStructureCMS') || 0);
      return legacyStructure === 1 || false;
    }
  }
};
</script>
