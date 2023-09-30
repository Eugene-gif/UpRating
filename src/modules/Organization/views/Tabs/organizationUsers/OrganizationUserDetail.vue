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
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
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
    path: '/organization',
  },
  {
    title: 'Клиент',
    path: `/organization/${ID}/user`,
  },
  {
    title: 'Пользователь',
    path: `/organization/${ID}/user/${ID2}`,
  },
];

// Диалог блокировки/удаления
const { confirmDelete } = inject('deleteDialog');
// Айтем
const item = ref({});
// Список клиентов
let subLists = ref({});
// Список юр.лиц
const entityList = ref();
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

if (+ID2 !== 0) {
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
    legalEntity: null,
    roles: null,
    profile: {
      fullName: '',
    },
    organization: null,
  }

  loading.value = false;
}

getRefsLists('legal_entity', 'entityList');
getRefsLists('organization', 'organizationList');
getRefsLists('roles', 'roleList');

function saveItem() {
  saving.value = true;
  const isNew = +ID2 === 0;
  const editedItem = prepareItem(item.value);

  getData(isNew ? '/admin/user' : `/admin/user/${ID2}`,
      isNew ? METHODS.POST : METHODS.PUT,
      isNew ? item.value : editedItem
  )
      .then((response) => {
        if (response.success) {
          $q.notify({
            message: 'Пользователь успешно создан',
            color: 'green',
          });

          router.push(`/organization/${ID}/user`);
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
    delete cloneItem.fullName;
  }

  if (cloneItem.organization?.id) {
    cloneItem.organization = cloneItem.organization.id;
  }

  if (cloneItem.legalEntity?.id) {
    cloneItem.legalEntity = cloneItem.legalEntity.organization.id;
  } else {
    cloneItem.legalEntity = false;
  }

  if (cloneItem.roles?.title) {
    cloneItem.roles = cloneItem.roles.value;
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
    if (+ID2 === 0) {
      item.value.organization = ID;
    }

    organizationLoading.value = false;
    entityLoading.value = false;
  })
}

function getEntities() {
  item.value.legalEntity = null;
  entityLoading.value = true;

  getRefsLists(`legal_entity?organization=${item.value.organization}`, 'entityList');
}
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Пользователь</h2>
      <div class="row q-gutter-md justify-end">
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
            @click="$router.push(`/organization/${ID}/user`)"
        />
      </div>
    </div>
  </div>

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
              dense
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
          />
        </div>

        <div class="text-subtitle2 q-mb-xs">
          Почта
          <q-input
              v-model="item.email"
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
              :disable="organizationLoading"
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
              :disable="entityLoading"
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

        <div class="q-mb-md infoCard">
          Администратор - данная роль подразумевает доступ к управлению сервисом в полном объеме. <br/>
          Пользователь - данная роль дает только право выбора ссылок для карты, по которым будет перенаправлен смартфон клиента при контакте с картой.
        </div>

        <div class="text-subtitle2 q-mb-xs">
          Роль
          <q-select
              v-if="+ID2 !== 0"
              v-model="item.role"
              :options="subLists.roleList"
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
            <q-btn
                color="primary"
                type="submit"
                label="Сохранить"
                :disable="loading"
                :loading="saving"
                no-caps
            />
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
            disable
            :loading="organizationLoading"
            option-label="title"
            option-value="id"
            map-options
            emit-value
            dense
            outlined
            :rules="[val => !!val || 'Обязательное поле']"
        />
      </div>

      <div class="text-subtitle2 q-my-lg">
        Юр.лицо
        <q-select
            v-model="item.legalEntity"
            :options="subLists.entityList"
            option-label="title"
            option-value="id"
            map-options
            emit-value
            dense
            outlined
        />
      </div>

      <div class="q-mb-md infoCard">
        Администратор - данная роль подразумевает доступ к управлению сервисом в полном объеме. <br/>
        Пользователь - данная роль дает только право выбора ссылок для карты, по которым будет перенаправлен смартфон клиента при контакте с картой.
      </div>

      <div class="text-subtitle2 q-my-lg">
        Роль
        <q-select
            v-model="item.role"
            :options="subLists.roleList"
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
