<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { eventBus } from 'src/plugins/utils';

export default defineComponent({
  name: 'App',
  mounted ()
  {
    this.$q.iconSet.arrow.dropdown = 'fa fa-caret-down';
    this.$q.iconSet.expansionItem.icon = 'fa fa-chevron-down';
    // Listen Service worker updates
    eventBus.on('service-worker.update.available', () =>
    {
      this.$alert.info({
        message: this.$tr('isite.cms.message.swUpdateAvailable'),
        pos: 'top',
        icon: 'fas fa-cloud-download-alt',
        timeOut: 15000,
        actions: [
          {
            label: 'Ok',
            icon: '',
            color: 'white',
            handler: () => window.location.reload(true)
          }
        ]
      });
    });
  }
});
</script>
