<script setup>
import {inject, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useStore} from "@/store/store";
import {getDate} from "../../../utils/dateFormatter";
import GridCard from "@/components/GridCard.vue";
// Роутер
const router = useRouter();
// Хранилище
const store = useStore();
// Роли пользователя
let roles = store.profile.role;
// Флаг админа Клиента
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
const isAdmin = roles.some((role) => role.value === 'ROLE_SUPER_ADMIN');
// Квазар
const $q = useQuasar();
// Меню навигации
const crumbList = [
  {
    title: 'Пользователи',
    path: '/users',
  },
];
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Текст из поисковой строки
const searchText = inject('searchText');
// Флаг загрузки
const loading = ref(true);
// Флаг загрузки блокировки пользователя
const blockLoading = ref(false);
// Данные для таблицы
const usersList = ref([]);
// id пользователя, которого блокируют
const blockedItem = ref();
const showBlockDialog = ref(false);
const sortTitle = ref();
const isDesc = ref(true);
// Копия массива данных
const usersCopyArr = ref([]);
// Если смотритель получает значение из поисковой строки, он делает выборку по массиву элементов таблицы
watch(searchText, () => {
  getData(`/admin/user?search=${searchText.value}`, METHODS.GET)
      .then((response) => {
        usersList.value = response.result.items;
      });
});
// Колонки таблицы
const columns = [
  {
    name: "profile",
    required: true,
    label: "Профиль",
    align: "left",
    field: (row) => row.profile?.fullName,
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  },
  {
    name: "email",
    required: true,
    label: "Почта",
    align: "left",
    field: "email",
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "role",
    required: true,
    label: "Роль",
    align: "left",
    field: 'roles',
    format: (val) => `${val ?? 'Нет данных'}`,
  },
  {
    name: "isBlocked",
    required: true,
    label: "Заблокирован",
    align: "left",
    field: 'isBlocked',
    format: (val) => `${val ? 'Да' : 'Нет'}`,
  },
  {
    name: "createdAt",
    required: true,
    label: "Дата создания",
    align: "left",
    field: 'createdAt',
    format: (val) => val ? getDate(val) : 'Нет данных',
    sortable: true,
  },
  {
    label: 'Действия',
    name: 'actions',
    field: 'actions',
    align: 'center',
  },
];

if (isAdmin) {
  columns.unshift( {
    name: "organization",
    align: "left",
    label: "Клиент",
    field: (row) => row.organization?.title,
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  });
}

// Пагинация
const pagination = ref({
  page: 1,
  pages: 1,
  rowsNumber: 1,
  rowsPerPage: 14,
});

function getUsers(query) {
  loading.value = true;

  getData(`/admin/user?${query}`, METHODS.GET)
      .then((response) => {
        if (response.success) {
          usersList.value = response.result.items;

          pagination.value = {
            page: response.result.pagination.page,
            pages: response.result.pagination.pages,
            rowsNumber: response.result.pagination.totalCount,
            rowsPerPage: response.result.pagination.perPage,
          }
        }
      })
      .finally(() => {
        loading.value = false;
        blockLoading.value = false;
      });
}

function blockUser(id, isBlocked) {
  confirmDelete(isBlocked ? 'Разблокировать' : 'Заблокировать', (fn) => {
    blockLoading.value = true;

    getData(`/admin/user/${id}`, METHODS.PUT, {
      isBlocked: !isBlocked,
    }).then((res) => {
      if (res.success) {
        getUsers(`page=${pagination.value.page}&perPage=14`);
      }
    });

    fn();
  });
}

function blockRowUser() {
  blockLoading.value = true;

  getData(`/admin/user/${blockedItem.value.id}`, METHODS.PUT, {
    isBlocked: blockedItem.value.isBlocked,
  }).then((res) => {
    if (res.success) {
      getUsers(`page=${pagination.value.page}&perPage=14`);
    }
  }).finally(() => {
    showBlockDialog.value = false;
    blockLoading.value = false;
  })
}

function blockItem(id) {
  showBlockDialog.value = true;
  blockedItem.value = id;
}

function deleteUser(id) {
  confirmDelete('Удалить', (fn) => {

    getData(`/admin/user/${id}`, METHODS.DELETE)
        .then((response) => {
          getUsers(`page=${pagination.value.page}&perPage=14`);
        });

    fn();
  });
}

function cancelBlock() {
  const index = usersList.value.findIndex((user) => user.id === blockedItem.value.id);

  if (index > -1) {
    usersList.value[index].isBlocked = false;
  }

  showBlockDialog.value = false;
}

function switchPage(value) {
  if (+value > pagination.value.pages) return;

  getUsers(`page=${+value}&perPage=14`);
}

function onRequest(props) {
  loading.value = true;

  if (props.pagination.sortBy === sortTitle.value) isDesc.value = !isDesc.value;

  sortTitle.value = props.pagination.sortBy;
  const sortQuery = `order=${sortTitle.value}.${isDesc.value ? 'DESC' : 'ASC'}`

  getData(
      `/admin/user?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&${sortQuery}`,
      METHODS.GET,
  )
      .then((response) => {
        usersList.value = response.result.items;
        pagination.value = {
          page: response.result.pagination.page,
          pages: response.result.pagination.pages,
          rowsNumber: response.result.pagination.totalCount,
          rowsPerPage: response.result.pagination.perPage,
          descending: isDesc.value,
          sortBy: sortTitle.value,
        }
      }).finally(() => loading.value = false);
}

getUsers('page=1&perPage=14');
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Пользователи</h2>

      <div class="row q-gutter-md justify-end">
        <q-btn
          no-caps
          color="primary"
          label="Добавить"
          size="12px"
          @click="$router.push('/users/0')"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

<div v-if="$q.platform.is.mobile">
  <GridCard
    :headers="columns"
    :list="usersList"
    :loading="loading"
  >
    <template v-slot:role="props">
      {{ props.row.role[0]?.title ?? 'Нет данных' }}
    </template>

    <template v-slot:profile="props">
      {{ props.row.profile?.fullName ?? 'Нет данных' }}
    </template>

    <template v-slot:isBlocked="props">
      <q-toggle
        v-model="props.row.isBlocked"
        @click="blockItem(props.row, !props.row.isBlocked)"
      />
    </template>

    <template v-slot:nfcTags="props">
      {{ props.row.nfcTags.length ?? 'Нет данных' }}
    </template>

    <template v-slot:legalEntity="props">
      <q-btn
          flat
          no-caps
          :label="props.row.legalEntity?.organization.title"
          @click="$router.push(`/organization/${props.row.legalEntity.organization?.id}/main`)"
      />
    </template>

    <template v-slot:actions="props">
      <q-btn-dropdown
          dropdown-icon="more_vert"
          dense
          color="black"
      >
        <q-list>
          <q-item
              clickable
              class="items-center"
              @click="$router.push(`/users/${props.row.id}`)"
          >
            <q-icon
                name="info"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>Подробнее</q-item-section>
          </q-item>

          <q-item
              clickable
              @click="blockUser(props.row.id, props.row.isBlocked)"
              class="items-center"
          >
            <q-icon
                name="block"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>{{ props.row.isBlocked ? 'Разблокировать' : 'Заблокировать' }}</q-item-section>
          </q-item>

          <q-item
              v-if="!isOrgAdmin"
              clickable
              class="items-center"
              @click="deleteUser(props.row.id)"
          >
            <q-icon
                name="delete"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>Удалить</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </template>

    <template v-slot:pagination>
      <q-pagination
        v-model="pagination.page"
        :max="pagination.pages"
        :max-pages="6"
        direction-links
        outline
        color="black"
        active-design="outline"
        active-color="grey"
        active-text-color="black"
        @update:model-value="getUsers(`page=${pagination.page}&perPage=14`)"
      />
    </template>
  </GridCard>
</div>

  <q-table
    v-else
    class="sticky-table"
    :rows="usersList"
    :loading="loading"
    :columns="columns"
    v-model:pagination="pagination"
    binary-state-sort
    row-key="name"
    flat
    square
    :grid="$q.platform.is.mobile"
    @request="onRequest"
  >
    <template #body-cell-role="props">
      <q-td key="role" :props="props">
        {{ props.row.role[0]?.title ?? 'Нет данных' }}
      </q-td>
    </template>

    <template #body-cell-profile="props">
      <q-td key="profile" :props="props">
        {{ props.row.profile?.fullName ?? 'Нет данных' }}
      </q-td>
    </template>

    <template #body-cell-isBlocked="props">
      <q-td key="isBlocked" :props="props">
        <q-toggle
            v-model="props.row.isBlocked"
            @click="blockItem(props.row, !props.row.isBlocked)"
        />
      </q-td>
    </template>

    <template #body-cell-nfcTags="props">
      <q-td>
        {{ props.row.nfcTags.length ?? 'Нет данных' }}
      </q-td>
    </template>

    <template #body-cell-legalEntity="props">
      <q-td key="legalEntity" :props="props">
        <q-btn
            flat
            no-caps
            :label="props.row.legalEntity?.organization.title"
            @click="$router.push(`/organization/${props.row.legalEntity.organization?.id}/main`)"
        />
      </q-td>
    </template>

    <template #body-cell-actions="props">
      <q-td key="actions" :props="props">
        <q-btn-dropdown
            dropdown-icon="more_vert"
            flat
            dense
        >
          <q-list>
            <q-item
                clickable
                class="items-center"
                @click="$router.push(`/users/${props.row.id}`)"
            >
              <q-icon
                  name="info"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Подробнее</q-item-section>
            </q-item>

            <q-item
                clickable
                @click="blockUser(props.row.id, props.row.isBlocked)"
                class="items-center"
            >
              <q-icon
                  name="block"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>{{ props.row.isBlocked ? 'Разблокировать' : 'Заблокировать' }}</q-item-section>
            </q-item>

            <q-item
                v-if="!isOrgAdmin"
                clickable
                class="items-center"
                @click="deleteUser(props.row.id)"
            >
              <q-icon
                  name="delete"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Удалить</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-td>
    </template>

    <template #bottom>
      <div class="full-width row justify-between items-center">

        <div class="row q-pa-md items-center">
          <div
              style="font-size: 14px"
          >
            Перейти
          </div>

          <input
              type="number"
              @change="switchPage($event.target.value)"
              style="width: 36px; height: 32px"
              class="q-mx-sm"
          >

          <div style="font-size: 14px">/ {{ pagination.pages }}</div>
        </div>

        <div>
          <q-pagination
              v-model="pagination.page"
              :max="pagination.pages"
              :max-pages="6"
              @update:model-value="getUsers(`page=${pagination.page}&perPage=14`)"
              direction-links
              outline
              color="black"
              active-design="outline"
              active-color="grey"
              active-text-color="black"
          />
        </div>
      </div>
    </template>
  </q-table>

  <q-dialog
      v-model="showBlockDialog"
      no-backdrop-dismiss
      no-esc-dismiss
  >
    <q-card
        class="column items-center justify-evenly text-center q-pa-lg"
        style="max-width: 390px; max-height: 380px;"
    >
      <div class="q-mb-lg">
        <div class="text-h6 text-bold">
          Вы действительно хотите {{ !blockedItem.isBlocked ? 'разблокировать' : 'заблокировать' }} этот объект?
        </div>
      </div>

      <!-- <div class="text-subtitle2 text-body1 q-mb-lg">
        Эту операцию нельзя отменить
      </div> -->

      <div class="full-width q-gutter-md">
        <q-btn
            no-caps
            outline
            class="btn-default"
            :label="!blockedItem.isBlocked ? 'Разблокировать' : 'Заблокировать'"
            @click="blockRowUser"
            :loading="blockLoading"
        />

        <q-btn
            no-caps
            color="primary"
            label="Отмена"
            @click="cancelBlock"
            :disable="blockLoading"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-table__bottom {
  position: sticky;
  bottom: 0;
  z-index: 1111
}
</style>