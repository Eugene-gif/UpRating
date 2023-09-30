<script setup>
import {inject, reactive, ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useQuasar} from "quasar";
import {useStore} from "@/store/store";
// роутер
const route = useRoute();
// Хранилище
const store = useStore();
// Роли пользователя
let roles = store.profile.role;
// Суперадмин
const isSuperAdmin = roles.some((role) => role.value === 'ROLE_SUPER_ADMIN');
// Айди записи
const ID = route.params.id;
// Айди записи
const ID2 = route.params.id2;
// Квазар
const $q = useQuasar();
// Роутер
const router = useRouter();
// Меню навигации
const crumbList = [
  {
    title: 'Клиенты',
    path: '/partners',
  },
  {
    title: 'Клиент',
    path: `/partners/${ID}/user`,
  },
  {
    title: 'Пользователь',
    path: `/partners/${ID}/user/${ID2}`,
  },
];

// Диалог блокировки/удаления
const {confirmDelete} = inject('deleteDialog');
// Айтем
const item = ref({});
// Список клиентов
let subLists = ref({});
// Список юр.лиц
const entityList = ref();
// Флаг отвечающий за редактировании записи
const isEdit = ref(false);
// Флаг загрузки
const loading = ref(true);
// Флаг загрузки юр.лиц
const entityLoading = ref(true);
// Флаг загрузки клиентов
const organizationLoading = ref(true);
// Флаг сохранения
const saving = ref(false);
// Флаг отображения пароля
const showPass = ref(true);

if (ID2 != 0) {
  getData(`/admin/user/${ID2}`, METHODS.GET).then((response) => {
    if (response.success) {
      item.value = response.result.item;
      item.value.fullName = item.value.profile.fullName;

      item.value.role = item.value.role[0];
    }
  }).finally(() => {
    loading.value = false;
  });
} else {
  item.value = {
    email: '',
    password: '',
    organization: null,
    role: {
      title: 'Партнёр',
      value: 'ROLE_PARTNER',
    },
    profile: {
      fullName: '',
    }
  }

  isEdit.value = true;
  loading.value = false;
}

getRefsLists('partner', 'organizationList');
getRefsLists('roles', 'roleList');

function saveItem() {
  saving.value = true;
  const isNew = +ID2 === 0;
  const editedItem = prepareItem(item.value);

  getData(isNew ? '/admin/user' : `/admin/user/${ID2}`,
      isNew ? METHODS.POST : METHODS.PUT,
      isNew ? editedItem : editedItem
  )
      .then((response) => {
        if (response.success) {
          $q.notify({
            message: 'Пользователь успешно создан',
            color: 'green',
          });

          router.push(`/partners/${ID}/users`);
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

  if (cloneItem.fullName) {
    cloneItem.profile.fullName = cloneItem.fullName;
  }

  if (cloneItem.role?.title) {
    cloneItem.role = cloneItem.role.value;
  }

  delete cloneItem.createdAt;
  delete cloneItem.updatedAt;

  return cloneItem;
}

function deleteItem() {
  confirmDelete('Удалить', (fn) => {
    getData(`/admin/user/${ID2}`, METHODS.DELETE).then((res) => {
      if (res.success) {
        router.push(`/organization/${ID}/user`);
      }
    });

    fn();
  })
}

// Получение справочников
function getRefsLists(refName, refArr) {
  getData(`/admin/${refName}`, METHODS.GET).then((response) => {
    subLists.value[refArr] = response.result.items;
  }).finally(() => {
    subLists.value.organizationList.forEach((org) => {
      if (org.id === ID) {
        item.value.organization = org.organizationPartnerId;
      }
    })
    organizationLoading.value = false;
    entityLoading.value = false;
  })
}

</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Пользователь</h2>
      <div class="q-gutter-y-sm q-gutter-x-sm">
        <q-btn
            no-caps
            outline
            class="btn-default"
            :disable="+ID2 === 0"
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
            @click="$router.push(`/partners/${ID}/users`)"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <q-separator class="separator-color" size="10px"/>

  <div style="max-width: 410px">
    <template v-if="+ID2 !== 0">
      <q-form
          @submit="saveItem"
          class="col-6 q-pa-lg q-mt-sm"
      >
        <div class="text-subtitle2 q-mb-xs">
          ФИО
          <q-input
              v-model="item.fullName"
              :loading="loading"
              :disable="!isEdit"
              dense
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
          />
        </div>

        <div class="text-subtitle2 q-mb-xs">
          Почта
          <q-input
              v-model="item.email"
              :disable="!isEdit"
              :loading="loading"
              dense
              outlined
              :rules="[
                  val => !!val || 'Обязательное поле',
                  (val) => new RegExp(/.+@.+\..+/).test(val) || 'Email введён некорректно',
              ]"
          />
        </div>

        <div class="text-subtitle2 q-mb-lg">
          Заблокирован
          <q-toggle
              v-model="item.isBlocked"
              :disable="!isEdit"
              :loading="loading"
          />
        </div>

        <div
            v-if="!isOrgAdmin"
            class="text-subtitle2 q-mb-xs"
        >
          Клиент
          <q-select
              v-model="item.organization"
              :options="subLists.organizationList"
              @update:model-value="getEntities"
              :loading="organizationLoading"
              :disable="!isEdit || organizationLoading"
              option-label="title"
              option-value="id"
              map-options
              emit-value
              dense
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
          />
        </div>

        <div class="text-subtitle2 q-mb-lg">
          Юр.лицо
          <q-select
              v-model="item.legalEntity"
              :disable="!isEdit || entityLoading"
              :options="subLists.entityList"
              :loading="entityLoading"
              option-label="title"
              option-value="id"
              clearable
              map-options
              emit-value
              dense
              outlined
          />
        </div>

        <div class="text-subtitle2 q-mb-xs">
          Роль
          <q-select
              v-if="+ID2 !== 0"
              v-model="item.role"
              :options="subLists.roleList"
              :disable="!isEdit"
              :loading="loading"
              option-label="title"
              option-value="value"
              map-options
              emit-value
              dense
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
          />
          <q-select
              v-else
              v-model="item.role"
              :options="subLists.roleList"
              :disable="!isEdit"
              :loading="loading"
              option-label="title"
              option-value="id"
              map-options
              emit-value
              dense
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
          />
        </div>

        <div class="q-my-md">
          <template v-if="isEdit">
            <q-btn
                color="primary"
                type="submit"
                label="Сохранить"
                :disable="loading"
                :loading="saving"
                no-caps
            />
          </template>
          <template v-else>
            <q-btn
                no-caps
                outline
                class="bg-primary text-white"
                @click="isEdit = true"
                :disable="loading"
                :loading="saving"
                label="Редактировать"
            />
          </template>
        </div>
      </q-form>
    </template>

    <q-form
        v-else
        @submit="saveItem"
        class="col-6 q-pa-lg q-mt-sm"
    >
      <div class="text-subtitle2">
        ФИО
        <q-input
            dense
            outlined
            type="text"
            v-model="item.fullName"
            @input="item.profile.fullName = $event.target.value"
            :rules="[val => !!val || 'Обязательное поле']"
        />
      </div>

      <div class="text-subtitle2 q-my-lg">
        Почта
        <q-input
            dense
            outlined
            :disable="!isEdit"
            v-model="item.email"
            :rules="[
                  val => !!val || 'Обязательное поле',
                  (val) => new RegExp(/.+@.+\..+/).test(val) || 'Email введён некорректно',
              ]"
        />
      </div>

      <div class="text-subtitle2 q-my-lg">
        Пароль
        <q-input
            dense
            outlined
            :type="showPass ? 'password' : 'text'"
            v-model="item.password"
            :rules="[val => !!val || 'Обязательное поле']"
        >
          <template #append>
            <q-icon
                :name="showPass ? 'visibility' : 'visibility_off'"
                @click="showPass = !showPass"
            />
          </template>
        </q-input>
      </div>

      <div class="text-subtitle2 q-mt-md q-mb-lg">
        Клиент
        <q-select
            v-model="item.organization"
            :options="subLists.organizationList"
            option-label="organizationPartnerTitle"
            option-value="organizationPartnerId"
            disable
            :loading="organizationLoading"
            map-options
            emit-value
            dense
            outlined
            :rules="[val => !!val || 'Обязательное поле']"
        />
      </div>

      <div class="text-subtitle2 q-my-lg">
        Роль
        <q-select
            v-model="item.role"
            :options="subLists.roleList"
            option-label="title"
            disable
            option-value="id"
            map-options
            emit-value
            dense
            outlined
            :rules="[val => !!val || 'Обязательное поле']"
        />
      </div>

      <div class="q-my-md">
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
