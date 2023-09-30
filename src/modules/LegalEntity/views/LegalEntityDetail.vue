<script setup>
import {inject, ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useQuasar} from "quasar";
import {useStore} from "@/store/store";
// Квазар
const $q = useQuasar();
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
// Роутер
const router = useRouter();
// Хранилище
const store = useStore();
// Диалог блокировки/удаления
const {confirmDelete} = inject('deleteDialog');
// Роли пользователя
let roles = store.profile.role;
// Флаг админа клиента
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
// Меню навигации
const crumbList = [
  {
    title: 'Юр.лица',
    path: '/legal_entity',
  },
  {
    title: 'Юр.лицо',
    path: `/legal_entity/${ID}`,
  },
]

// Айтем
const item = ref({});
// Список клиентов
const organizationList = ref({});
// Флаг загрузки списка орагнизаций
const organizationLoading = ref(false);
// Флаг загрузки
const loading = ref(true);
// Флаг сохранения
const saving = ref(false);

if (ID != 0) {
  getData(`/admin/legal_entity/${ID}`, METHODS.GET).then((response) => {
    if (response.success) {
      item.value = response.result.item;
    }
  }).finally(() => {
    loading.value = false;
    saving.value = false;
  });
} else {
  item.value = {
    title: '',
    tin: '',
    legalAddress: null,
    geerbox: null,
    organization: null,
  }

  loading.value = false;
  saving.value = false;
}

if (!isOrgAdmin) {
  organizationLoading.value = true;
  getData(`/admin/organization`, METHODS.GET).then((response) => {
    if (response.success) {
      organizationList.value = response.result.items;
      organizationLoading.value = false;
    }
  });
}

function saveItem() {
  saving.value = true;
  const isNew = ID == 0;
  const editedItem = isNew ? null : prepareItem(item.value);

  getData(isNew ? '/admin/legal_entity' : `/admin/legal_entity/${ID}`,
      isNew ? METHODS.POST : METHODS.PUT,
      isNew ? item.value : editedItem
  )
      .then((response) => {
        if (response.success) {
          $q.notify({
            message: 'Запись успешно сохранена',
            color: 'green',
          });

          router.push('/legal_entity');
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

  if (cloneItem.organization.id) {
    cloneItem.organization = cloneItem.organization.id;
  }

  delete cloneItem.createdAt;
  delete cloneItem.updatedAt;
  delete cloneItem.id;
  delete cloneItem.users;

  return cloneItem;
}

function deleteUser() {
  confirmDelete('Удалить', (fn) => {
    getData(`/admin/legal_entity/${ID}`, METHODS.DELETE)
        .then((response) => {
          router.push('/legal_entity');
        });

    fn();
  });
}
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Юридическое лицо</h2>

      <div class="row q-gutter-md justify-end">
        <q-btn
          v-if="!isOrgAdmin"
          no-caps
          outline
          class="btn-default"
          label="Удалить"
          :disable="+ID === 0"
          @click="deleteUser"
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

  <div style="max-width: 410px">
    <q-form
        @submit="saveItem"
        class="col-6 q-pa-lg q-mt-sm">

      <div
          class="q-mb-lg infoCard"
          style=""
      >
        Внимательно заносите данные организации. При формировании для вас счетов и актов, сервис будет брать данные из
        этих полей.
      </div>

      <div class="text-subtitle2">
        Наименование
        <q-input
            v-model="item.title"
            :loading="loading"
            dense
            outlined
            :rules="[val => !!val || 'Поле должно быть заполнено']"
        />
      </div>

      <div class="text-subtitle2 q-my-sm">
        ИНН
        <q-input
            v-model="item.tin"
            :loading="loading"
            type="number"
            dense
            outlined
            :rules="[val => !!val || 'Поле должно быть заполнено']"
        />
      </div>

      <div class="text-subtitle2 q-mt-sm q-mb-lg">
        Адрес
        <q-input
            v-model="item.legalAddress"
            :loading="loading"
            dense
            outlined
        />
      </div>

      <div class="text-subtitle2 q-my-lg">
        КПП
        <q-input
            v-model="item.geerbox"
            :loading="loading"
            type="number"
            dense
            outlined
        />
      </div>

      <div
          v-if="!isOrgAdmin"
          class="text-subtitle2 q-my-lg"
      >
        Клиент
        <q-select
            v-model="item.organization"
            :options="organizationList"
            :loading="organizationLoading"
            option-label="title"
            option-value="id"
            map-options
            emit-value
            dense
            outlined
            :rules="[val => !!val || 'Поле должно быть заполнено']"
        />
      </div>

      <div class="q-my-lg">
        <q-btn
            no-caps
            color="primary"
            type="submit"
            label="Сохранить"
            :disable="loading"
            :loading="saving"
        />
      </div>
    </q-form>
  </div>
</template>

<style scoped>
</style>