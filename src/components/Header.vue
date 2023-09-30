<script setup>
import {computed, provide, ref, watch, inject} from "vue";
import {useRouter} from "vue-router";
import {useQuasar} from "quasar";
import {useStore} from "@/store/store";
import UserOptions from "./UserOptions.vue";

const {setMessage} = inject('crossMessage');

const router = useRouter();
const emit = defineEmits(['onSearch']);
const store = useStore();
// Профиль
let storeProfile = store.profile;
// Роли пользователя
let roles = storeProfile.role;
// Флаг партнёра
const isPartner = roles.some((role) => role.value === 'ROLE_PARTNER');
const $q = useQuasar();
const table = computed(() => router.currentRoute.value.name);
const searchText = ref('');
let isDetail = computed(() => router.currentRoute.value.meta.isDetail);
const profile = JSON.parse(localStorage.getItem('profile'));

const item = ref({
  fullName: profile.profile.fullName,
  email: profile.email,
  partnerCost: profile.partnerCost,
});

watch(table, (count, prevCount) => {
  if (count !== prevCount) {
    searchText.value = '';
  }
});

function getSearch(val) {
  if (val.length > 2) {
    emit('onSearch', searchText.value);
  }

  if (val.length === 0) {
    emit('onSearch', searchText.value);
  }
}

function logout() {
  store.logout();
}

function positioned() {
  $q.dialog({
    component: UserOptions,
  })
}

function toggleLeftDrawer() {
  setMessage({drawer: false});
}
</script>

<template>
  <q-header class="bg-white text-black" elevated height-hint="98">
    <q-toolbar>
      <q-btn
        dense
        flat
        round
        icon="menu"
        @click="toggleLeftDrawer"
        class="desktop-hide"
      />

      <q-space class="desktop-hide" />

      <q-toolbar-title class="mobile-hide">
        <q-input
            v-model="searchText"
            @update:model-value="getSearch"
            placeholder="Поиск по разделу"
            debounce="300"
            borderless
            :disable="isDetail"
        >
          <template v-slot:prepend>
            <q-icon size="20px">
              <img src="/search.svg" alt="">
            </q-icon>
          </template>

          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ text }}
            </div>
          </template>
        </q-input>
      </q-toolbar-title>

      <!--__________ Dropdown ava __________-->
      <div class="profile-block">
        <q-btn-dropdown
            no-caps
            outline
            class="bg-transparent"
            :label="`${item.fullName}`"
            flat
            size="16px"
        >
          <q-list
              class="drop_btn"
              style="width: 100%;"
          >
            <q-item
                clickable
                v-close-popup
                @click="positioned"
            >
              <q-item-section class="q-pl-sm">
                <q-item-label>Пользователь</q-item-label>

                <q-item-label>({{ profile.email }})</q-item-label>
              </q-item-section>
            </q-item>

            <template v-if="isPartner">
              <q-item
                  clickable
                  v-close-popup
                  @click="$router.push('/settlement/incoming')"
              >
                <q-item-section class="q-pl-sm">
                  <q-item-label>Баланс - {{ item.partnerCost ?? 0 }} руб.</q-item-label>
                </q-item-section>
              </q-item>
            </template>

            <q-item
                clickable
                v-close-popup
                class="items-center"
                @click="logout"
            >
              <q-avatar size="16px">
                <img src="/exit.svg"/>
              </q-avatar>
              <q-item-section class="q-pl-sm">
                <q-item-label>Выход</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-toolbar>

  </q-header>
</template>

<style scoped>

.drop_btn:before {
  content: "";
  width: 10px;
  height: 10px;
  position: fixed;
  background-color: white;
  transform: rotate(45deg);
  right: 41px;
  top: 45px;
  box-shadow: -1px -1px 0 0 rgba(211, 211, 211, 0.423);
  z-index: -5;
}
.mobile .profile-block * {
  font-size: 12px !important;
}
.mobile .profile-block .q-btn--rectangle {
  padding: 0 8px;
}
</style>