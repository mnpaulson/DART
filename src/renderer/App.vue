<template>
  <div id="app">
    <v-app>
      <v-navigation-drawer
        fixed
        :mini-variant="miniVariant"
        v-model="drawer"
        app
      >
        <v-list>
          <v-list-tile 
            router
            :to="item.to"
            :key="i"
            v-for="(item, i) in items"
            exact
          >
            <v-list-tile-action>
              <v-icon v-html="item.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile @click="login">
            <v-list-tile-action>
              <v-icon>person</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title >Login</v-list-tile-title>
            </v-list-tile-content>            
          </v-list-tile>
          <v-list-tile @click="miniVariant = !miniVariant">
            <v-list-tile-action>
              <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title >Collapse</v-list-tile-title>
            </v-list-tile-content>            
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <v-content>
        <v-container fluid>
            <Snackbar></Snackbar>
          <v-slide-y-transition mode="out-in">          
            <router-view></router-view>
          </v-slide-y-transition>
        </v-container>
      </v-content>

    </v-app>
  </div>
</template>

<script>
  export default {
    name: 'dart',
    data: () => ({
      drawer: true,
      fixed: false,
      items: [
        { icon: 'apps', title: 'Home', to: '/' },
        { icon: 'mail_outline', title: 'Invoice', to: '/invoice' },
        { icon: 'account_balance_wallet', title: 'Funds', to: '/funds' },
        { icon: 'list', title: 'Contact Info', to: '/contactinfo' },
        { icon: 'folder', title: 'Attachments', to: '/attachments' },
        { icon: 'folder', title: 'Gift Data', to: '/giftdata' },
        { icon: 'settings', title: 'Config', to: '/config' }
      ],
      miniVariant: false,
      title: 'DART'
    })
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
  /* Global CSS */
  .v-navigation-drawer {
    /* background-color: #c8d8eb !important; */
  }
</style>
