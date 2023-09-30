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
// Флаг админа клиента
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
// Флаг суперадмина
const isSuperAdmin = roles.some((role) => role.value === 'ROLE_SUPER_ADMIN');
// Айди записи
const ID = route.params.id;
// Квазар
const $q = useQuasar();
// Роутер
const router = useRouter();
// Меню навигации
const crumbList = [
  {
    title: 'Пользователи',
    path: '/users',
  },
  {
    title: 'Пользователь',
    path: `/users/${ID}`,
  },
];
// Диалог удаления/блокировки
const {confirmDelete} = inject("deleteDialog");
// Айтем
const item = ref({});
// Список клиентов
let subLists = ref({});
// Список юр.лиц
const entityList = ref();
// Флаг загрузки
const loading = ref(true);
// Флаг загрузки юр.лиц
const entityLoading = ref(false);
// Флаг загрузки юр.лиц
const organizationLoading = ref(true);
// Флаг сохранения
const saving = ref(false);
// Флаг отображения пароля
const showPass = ref(true);

if (+ID !== 0) {
  getData(`/admin/user/${ID}`, METHODS.GET).then((response) => {
    if (response.success) {
      item.value = response.result.item;

      item.value.fullName = item.value.profile.fullName;

      item.value.role = item.value.role[0];

      if (item.value.legalEntity?.organization) {
        item.value.organization = item.value.legalEntity?.organization;
      }
    }
  }).finally(() => {
    loading.value = false;
  });
} else {
  item.value = {
    email: '',
    password: '',
    legalEntity: false,
    role: null,
    profile: {
      fullName: '',
    }
  }

  loading.value = false;
}

getRefsLists('organization', 'organizationList');
getRefsLists(`legal_entity`, 'entityList');
getRefsLists(`roles`, 'roleList');


getData('/admin/roles', METHODS.GET)

function saveItem() {
  saving.value = true;
  const isNew = +ID === 0;
  const editedItem = prepareItem(item.value);

  getData(isNew ? '/admin/user' : `/admin/user/${ID}`,
      isNew ? METHODS.POST : METHODS.PUT,
      isNew ? item.value : editedItem
  )
      .then((response) => {
        if (response.success) {
          $q.notify({
            message: 'Пользователь успешно создан',
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

  if (cloneItem.legalEntity?.id) {
    cloneItem.legalEntity = cloneItem.legalEntity.id;
  } else {
    cloneItem.legalEntity = false;
  }

  if (cloneItem.organization?.id) {
    cloneItem.organization = cloneItem.organization.id;
  }

  if (cloneItem.role.value) {
    cloneItem.role = cloneItem.role.value;
  }

  if (cloneItem.fullName) {
    cloneItem.profile.fullName = cloneItem.fullName;
    delete cloneItem.fullName;
  }

  delete cloneItem.createdAt;
  delete cloneItem.updatedAt;
  delete cloneItem.id;
  delete cloneItem.users;

  return cloneItem;
}

function deleteItem() {
  confirmDelete("Удалить", (fn) => {
    getData(`/admin/user/${ID}`, METHODS.DELETE).then((res) => {
      if (res.success) {
        router.push('/users');
      }
    });

    fn();
  })
}

function getEntities() {
  item.value.legalEntity = null;
  entityLoading.value = true;

  getRefsLists(`legal_entity?organization=${item.value.organization}`, 'entityList');
}

// Получение справочников
function getRefsLists(refName, refArr) {
  getData(`/admin/${refName}`, METHODS.GET).then((response) => {
    subLists.value[refArr] = response.result.items;
  }).finally(() => {
    entityLoading.value = false;
    organizationLoading.value = false;
  });
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
            :disable="+ID === 0"
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
    <template v-if="+ID !== 0">
      <q-form
          @submit="saveItem"
          class="col-6 q-pa-lg q-mt-sm"
      >
        <div class="text-subtitle2 q-mb-lg">
          ФИО
          <q-input
              v-model="item.fullName"
              :loading="loading"
              dense
              outlined
          />
        </div>

        <div class="text-subtitle2 q-mb-sm">
          Почта
          <q-input
              dense
              outlined
              :loading="loading"
              v-model="item.email"
              @keydown.space="(event) => event.preventDefault()"
              :rules="[
                  val => !!val || 'Обязательное поле',
                  (val) => new RegExp(/.+@.+\..+/).test(val) || 'Email введён некорректно',
              ]"
          />
        </div>

        <div class="text-subtitle2 q-mb-md">
          <q-toggle
              v-model="item.isBlocked"
              label="Заблокирован"
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
              dense
              outlined
          />
        </div>

        <div class="q-mb-md infoCard">
          Администратор - данная роль подразумевает доступ к управлению сервисом в полном объеме. <br/>
          Пользователь - данная роль дает только право выбора ссылок для карты, по которым будет перенаправлен смартфон
          клиента при контакте с картой.
        </div>

        <div class="text-subtitle2 q-mb-xs">
          Роль
          <q-select
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
        </div>

        <div class="q-mb-lg">
          <q-btn
              outline
              class="bg-primary text-white"
              icon="done"
              type="submit"
              label="Сохранить"
              :loading="saving"
              :disable="loading"
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
      <div class="text-subtitle2 q-mb-xs">
        ФИО
        <q-input
            dense
            outlined
            type="text"
            v-model="item.fullName"
            :rules="[val => !!val || 'Обязательное поле']"
        />
      </div>

      <div class="text-subtitle2 q-mb-xs">
        Почта
        <q-input
            dense
            outlined
            v-model="item.email"
            @keydown.space="(event) => event.preventDefault()"
            :rules="[
                  val => !!val || 'Обязательное поле',
                  (val) => new RegExp(/.+@.+\..+/).test(val) || 'Email введён некорректно',
              ]"
        />
      </div>

      <div class="text-subtitle2 q-mb-xs">
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
                class="cursor-pointer"
            />
          </template>
        </q-input>
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
            :options="subLists.entityList"
            :loading="entityLoading"
            :disable="entityLoading"
            :option-label="(row) => row.title ?? ''"
            option-value="id"
            map-options
            emit-value
            dense
            outlined
        />
      </div>

      <div class="q-mb-md infoCard">
        Администратор - данная роль подразумевает доступ к управлению сервисом в полном объеме. <br/>
        Пользователь - данная роль дает только право выбора ссылок для карты, по которым будет перенаправлен смартфон
        клиента при контакте с картой.
      </div>

      <div class="text-subtitle2 q-mb-xs">
        Роль
        <q-select
            v-model="item.role"
            :options="subLists.roleList"
            option-label="title"
            option-value="value"
            map-options
            emit-value
            dense
            outlined
            :rules="[val => !!val || 'Обязательное поле']"
        />
      </div>

      <div class="q-mb-md q-mt-md">
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