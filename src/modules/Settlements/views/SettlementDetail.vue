<script setup>
import {ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useQuasar} from "quasar";
import {useStore} from "@/store/store";
import {getDate} from "@/utils/dateFormatter";
// Хранилище
const store = useStore();
// Роли пользователя
let roles = store.profile.role;
// Флаг админа
const isAdmin = roles.some((role) => role.value === 'ROLE_SUPER_ADMIN');
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
// Квазар
const $q = useQuasar();
// Роутер
const router = useRouter();
// Меню навигации
const crumbList = [
  {
    title: 'Взаиморасчёты',
    path: '/settlements',
  },
  {
    title: 'Взаиморасчёт',
    path: `/settlements/${ID}`,
  },
]
// Айтем
const item = ref({});
// Список клиентов
const partnerList = ref({});
// Флаг загрузки
const loading = ref(true);
// Флаг загрузки партнёров
const partnerLoading = ref(true);
// Флаг сохранения
const saving = ref(false);

if (ID != 0) {
  getData(`/admin/settlements/${ID}`, METHODS.GET).then((response) => {
    if (response.success) {
      item.value = response.result.item;
      item.value.date = getDate(item.value.date);
    }
  }).finally(() => {
    loading.value = false;
  });
} else {
  item.value = {
    partner: {
      organizationPartner: {

      }
    },
    cost: null,
  }

  loading.value = false;
}

getData(`/admin/partner`, METHODS.GET).then((response) => {
  if (response.success) {
    partnerList.value = response.result.items;
  }
}).finally(() => partnerLoading.value = false);

function saveItem() {
  saving.value = true;
  const isNew = +ID === 0;
  const editedItem = isNew ? null : prepareItem(item.value);

  getData(isNew ? '/admin/settlements' : `/admin/settlements/${ID}`,
      isNew ? METHODS.POST : METHODS.PUT,
      isNew ? item.value : editedItem
  )
      .then((response) => {
        if (response.success) {
          $q.notify({
            message: 'Запись успешно сохранена',
            color: 'green',
          });

          router.push(`${router.options.history.state.back}`);
        } else {
          $q.notify({
            message: 'Произошла ошибка',
            color: 'red',
          });
        }
      })
      .finally(() => {
        saving.value = false;
      });
}

function prepareItem(item) {
  const cloneItem = _copy(item);

  if (cloneItem.partner?.id) {
    cloneItem.partner = cloneItem.partner.id;
  }

  delete cloneItem.createdAt;
  delete cloneItem.updatedAt;

  return cloneItem;
}

function deleteItem() {
  getData(`/admin/settlements/${ID}`, METHODS.DELETE).then((res) => {
    if (res.success) {
      router.push('/settlements');
    }
  });
}
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Взаиморасчёт</h2>
      <div class="row q-gutter-md justify-end">
        <q-btn
            no-caps
            outline
            class="btn-default"
            label="Удалить"
            @click="deleteItem"
            size="12px"
        />
        <q-btn
            no-caps
            outline
            class="btn-default"
            label="Вернуться к списку"
            size="12px"
            @click="$router.push(router.options.history.state.back)"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <div
      style="max-width: 410px"
  >
    <q-form
        @submit="saveItem"
        class="col-6 q-pa-lg q-mt-sm">
      <div
          v-if="isAdmin"
          class="text-subtitle2 q-mb-xs"
      >
        Партнёр
        <q-select
            v-model="item.partner"
            :options="partnerList"
            :disable="partnerLoading"
            :loading="partnerLoading"
            :option-label="(row) => row.organizationPartnerTitle ?? row.organizationPartner.title"
            option-value="id"
            emit-value
            map-options
            dense
            outlined
            :rules="[val => !!val || 'Поле должно быть заполнено']"
        />
      </div>

      <div class="text-subtitle2 q-mb-xs">
        Сумма
        <q-input
            dense
            standout="bg-transparent"
            class="q-inp"
            type="number"
            outlined
            v-model="item.cost"
            :loading="loading"
            :rules="[val => !!val || 'Поле должно быть заполнено']"
        />
      </div>

      <div
          class="text-subtitle2 q-mb-xs"
          v-if="+ID !== 0"
      >
        Дата
        <q-input
            dense
            standout="bg-transparent"
            class="q-inp"
            outlined
            type="text"
            v-model="item.date"
            :loading="loading"
            disable
            :rules="[val => !!val || 'Поле должно быть заполнено']"
        />
      </div>

      <div class="q-mb-lg">
        <q-btn
            no-caps
            color="primary"
            type="submit"
            label="Сохранить"
            :loading="saving"
        />
      </div>
    </q-form>
  </div>
</template>

<style scoped>
</style>