<script setup>
import {inject, ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useQuasar} from "quasar";
// Роутер
const router = useRouter();
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
// Айди записи
const ID2 = route.params.id2;
// Меню навигации
const crumbList = [
  {
    title: 'Клиенты',
    path: '/organization',
  },
  {
    title: 'Клиент',
    path: `/organization/${ID}/legal_entity`,
  },
  {
    title: 'Юр.лицо',
    path: `/organization/${ID}/legal_entity/${ID2}`,
  },
];
// Квазар
const $q = useQuasar();
// Диалог блокировки/удаления
const {confirmDelete} = inject('deleteDialog');
// Айтем
const item = ref({});
// Список клиентов
const organizationList = ref({});
// Флаг загрузки
const loading = ref(true);
// Флаг сохранения
const saving = ref(false);
// Флаг загрузки клиентов
const organizationLoading = ref(true);

if (ID2 != 0) {
  getData(`/admin/legal_entity/${ID2}`, METHODS.GET).then((response) => {
    if (response.success) {
      item.value = response.result.item;
    }
  }).finally(() => {
    loading.value = false;
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
}

getData(`/admin/organization`, METHODS.GET).then((response) => {
  if (response.success) {
    organizationList.value = response.result.items;
  }
}).finally(() => {
  item.value.organization = ID;
  organizationLoading.value = false;
})

function saveItem() {
  saving.value = true;
  const isNew = ID2 == 0;
  const editedItem = prepareItem(item.value);

  getData(isNew ? '/admin/legal_entity' : `/admin/legal_entity/${ID2}`,
      isNew ? METHODS.POST : METHODS.PUT,
      isNew ? item.value : editedItem
  )
      .then((response) => {
        if (response.success) {
          $q.notify({
            message: 'Запись успешно сохранена',
            color: 'green',
          });

          router.push(`/organization/${ID}/legal_entity`);
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
    getData(`/admin/legal_entity/${ID2}`, METHODS.DELETE)
        .then((response) => {
          router.push(`/organization/${ID}/legal_entity`);
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
            @click="$router.push(`/organization/${ID}/legal_entity`)"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <div style="max-width: 410px">
    <q-form
        @submit="saveItem"
        class="col-6 q-pa-lg q-mt-sm"
    >
      <div class="text-subtitle2 q-mb-xs">
        Наименование
        <q-input
            v-model="item.title"
            :loading="loading"
            dense
            outlined
            :rules="[val => !!val || 'Поле должно быть заполнено']"
        />
      </div>

      <div class="text-subtitle2 q-mb-xs">
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

      <div class="text-subtitle2 q-mb-lg">
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

      <div class="text-subtitle2 q-my-lg">
        Клиент
        <q-select
            v-model="item.organization"
            :options="organizationList"
            :loading="organizationLoading"
            disable
            option-label="title"
            option-value="id"
            map-options
            emit-value
            dense
            outlined
        />
      </div>

      <div class="q-my-md">
        <q-btn
            no-caps
            color="primary"
            label="Сохранить"
            type="submit"
            :loading="saving"
            :disable="loading"
        />
      </div>
    </q-form>
  </div>
</template>

<style scoped>

</style>