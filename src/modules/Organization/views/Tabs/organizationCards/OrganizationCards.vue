<script setup>
import {inject, ref} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "@/store/store";
import {getDate} from "@/utils/dateFormatter";
import GridCard from "@/components/GridCard.vue";
// Роутер
const router = useRouter();
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
// Хранилище
const store = useStore();
// Меню навигации
const crumbList = ref(router.currentRoute.value.meta.breadCrumbs);
// Роли пользователя
let roles = store.profile.role;
// Флаг админа организации
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
// Флаг суперадмина
const isAdmin = roles.some((role) => role.value === 'ROLE_SUPER_ADMIN');
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Квазар
const $q = useQuasar();
const loading = ref(true);
// id карты, которую блокируют
const blockedItem = ref();
// отображение диалога блокировки
const showBlockDialog = ref(false);
// Флаг блокировки карты
const blockLoading = ref(false);
// Данные для таблицы
const cardList = ref([]);
const sortTitle = ref();
const isDesc = ref(true);
// Колонки таблицы
const columns = [
  {
    name: "title",
    required: true,
    label: "Название",
    align: "left",
    field: 'title',
    format: (val) => `${val ?? 'Нет данных'}`,
  },
  {
    name: "token",
    required: true,
    label: "Номер карты",
    align: "left",
    field: 'token',
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  },
  {
    name: "isBlocked",
    required: true,
    label: "Заблокирована",
    align: "left",
    field: 'isBlocked',
    format: (val) => `${val ? 'Да' : 'Нет'}`,
  },
  {
    name: "activeLink",
    align: "left",
    label: "Активная ссылка",
    field: (row) => row.activeLink?.title,
    format: (val) => `${val ?? 'Нет данных'}`,
  },
  {
    name: "user",
    align: "left",
    label: "Пользователь",
    field: (row) => row.user?.profile.fullName,
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  },
  {
    name: "lastSubExpire",
    align: "left",
    label: "Действ. до",
    field: "lastSubExpire",
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
// Пагинация
const pagination = ref({
  page: 1,
  pages: 1,
  rowsNumber: 1,
  rowsPerPage: 14,
  descending: false,
});

function getCards(query) {
  getData(`/admin/nfc_tag?${query}&organization=${ID}&type=NFC_TAG`, METHODS.GET)
      .then((response) => {
        if (response.success) {
          cardList.value = response.result.items;
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
      });
}

function deleteCard(id) {
  confirmDelete('Удалить', (fn) => {
    getData(`/admin/nfc_tag/${id}`, METHODS.DELETE).then((response) => {
      if (response.success) {
        getCards(`page=${pagination.value.page}&perPage=14`);
      }
    });

    fn();
  });
}

function blockItem(id) {
  showBlockDialog.value = true;
  blockedItem.value = id;
}

function blockCard() {
  blockLoading.value = true;

  getData(`/admin/nfc_tag/${blockedItem.value.id}`, METHODS.PUT, {
    isBlocked: blockedItem.value.isBlocked,
  }).then((res) => {
    if (res.success) {
      getCards(`page=${pagination.value.page}&perPage=14`);
    }
  }).finally(() => {
    showBlockDialog.value = false;
    blockLoading.value = false;
  })
}

function cancelBlock() {
  const index = cardList.value.findIndex((user) => user.id === blockedItem.value.id);

  if (index > -1) {
    cardList.value[index].isBlocked = false;
  }

  showBlockDialog.value = false;
}

function onRequest(props) {
  loading.value = true;

  if (props.pagination.sortBy === sortTitle.value) isDesc.value = !isDesc.value;

  sortTitle.value = props.pagination.sortBy;
  const sortQuery = `order=${sortTitle.value}.${isDesc.value ? 'DESC' : 'ASC'}&organization=${ID}`

  getData(
      `/admin/nfc_tag?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&${sortQuery}`,
      METHODS.GET,
  )
      .then((response) => {
        cardList.value = response.result.items;
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

function switchPage(value) {
  if (+value > pagination.value.pages) return;

  getCards(`page=${+value}&perPage=14`);
}

getCards('page=1&perPage=14');
</script>

<template>

  <div v-if="$q.platform.is.mobile">
    <GridCard
      :headers="columns"
      :list="cardList"
      :loading="loading"
    >
      <template v-if="isOrgAdmin" v-slot:noresult>
        <div 
          class="infoCard"
        >
          Работа сервиса начинается с выпуска бессрочной карты-ключа (виртуальной или пластиковой).
          Нажмите кнопку "<router-link to="/cards/new">Выпуск карты</router-link>".
        </div>
      </template>

      <template v-slot:isBlocked="props">
        <template v-if="!isOrgAdmin && !isUser">
          <q-toggle
            v-model="props.row.isBlocked"
            @click="blockItem(props.row, !props.row.isBlocked)"
          />
        </template>

        <template v-else>
          {{ props.row.isBlocked ? 'Заблокирована' : 'Активна' }}
        </template>
      </template>

      <template v-slot:actions="props">
        <q-btn-dropdown
            dropdown-icon="more_vert"
            dense
            color="black"
        >
          <q-list dark>
            <q-item
                color="black"
                clickable
                class="items-center"
                @click="$router.push(`/organization/${ID}/card/${props.row.id}/main`)"
            >
              <q-icon
                  name="info"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Просмотр</q-item-section>
            </q-item>

            <q-item
                clickable
                class="items-center"
                @click="$router.push({ name: 'bills-subscribe', state: { ID: props.row.id, orgID: ID } })"
            >
              <q-icon name="credit_card" size="20px" class="q-mr-xs"/>
              <q-item-section>Продлить подписку</q-item-section>
            </q-item>

            <q-item
                clickable
                class="items-center"
                @click="$router.push(`/organization/${ID}/card/${props.row.id}/report`)"
            >
              <q-icon name="summarize" size="20px" class="q-mr-xs"/>
              <q-item-section>Составить отчёт</q-item-section>
            </q-item>

            <q-item
                clickable
                @click="deleteCard(props.row.id)"
                class="items-center"
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
          @update:model-value="getCards(`page=${pagination.page}&perPage=14`)"
          direction-links
          outline
          color="black"
          active-design="outline"
          active-color="grey"
          active-text-color="black"
        />
      </template>
    </GridCard>
  </div>
  
    <q-table
      v-else
      class="sticky-table"
      :rows="cardList"
      :loading="loading"
      :columns="columns"
      row-key="name"
      v-model:pagination="pagination"
      flat
      square
      binary-state-sort
      :grid="$q.platform.is.mobile"
      @request="onRequest"
  >
    <template #no-data>
      <div
          v-if="emptyData && isOrgAdmin"
          class="infoCard"
      >
        Работа сервиса начинается с выпуска бессрочной карты-ключа (виртуальной или пластиковой).
        Нажмите кнопку "<router-link to="/cards/new">Выпуск карты</router-link>".
      </div>

      <div v-else>
        Нет данных.
      </div>
    </template>

    <template #body-cell-isBlocked="props">
      <q-td>
        <template v-if="!isOrgAdmin && !isUser">
          <q-toggle
              v-model="props.row.isBlocked"
              @click="blockItem(props.row, !props.row.isBlocked)"
          />
        </template>

        <template v-else>
          {{ props.row.isBlocked ? 'Заблокирована' : 'Активна' }}
        </template>
      </q-td>
    </template>

    <template #body-cell-activeLink="props">
      <q-td>
        <q-btn
          no-caps
          flat
          :href="props.row.activeLink?.url"
          target="_blank"
        >
          {{ props.row.activeLink?.title ?? 'Нет данных' }}
        </q-btn>
      </q-td>
    </template>

    <template #body-cell-actions="props">
      <q-td key="actions">
        <q-btn-dropdown
            dropdown-icon="more_vert"
            flat
            dense
        >
          <q-list>
            <q-item
                clickable
                class="items-center"
                @click="$router.push(`/organization/${ID}/card/${props.row.id}/main`)"
            >
              <q-icon
                  name="info"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Просмотр</q-item-section>
            </q-item>

            <q-item
                clickable
                class="items-center"
                @click="$router.push({ name: 'bills-subscribe', state: { ID: props.row.id, orgID: ID } })"
            >
              <q-icon name="credit_card" size="20px" class="q-mr-xs"/>
              <q-item-section>Продлить подписку</q-item-section>
            </q-item>

            <q-item
                clickable
                class="items-center"
                @click="$router.push(`/organization/${ID}/card/${props.row.id}/report`)"
            >
              <q-icon name="summarize" size="20px" class="q-mr-xs"/>
              <q-item-section>Составить отчёт</q-item-section>
            </q-item>

            <q-item
                clickable
                @click="deleteCard(props.row.id)"
                class="items-center"
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

          <div style="font-size: 14px">/ {{ pagination.page }}</div>
        </div>

        <div>
          <q-pagination
              v-model="pagination.page"
              :max="pagination.pages"
              :max-pages="6"
              @update:model-value="getCards(`page=${pagination.page}&perPage=14`)"
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
      no-esc-dismiss
      no-backdrop-dismiss
  >
    <q-card
        class="column items-center justify-evenly text-center q-pa-lg"
        style="max-width: 390px; max-height: 380px"
    >
      <div class="q-mb-lg">
        <div class="text-h6 text-bold">
          Вы действительно хотите {{ !blockedItem.isBlocked ? 'разблокировать' : 'заблокировать' }} этот объект?
        </div>
      </div>

      <div class="full-width q-gutter-md">
        <q-btn
            no-caps
            outline
            class="btn-default"
            :label="!blockedItem.isBlocked ? 'Разблокировать' : 'Заблокировать'"
            @click="blockCard"
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
.sticky-table {
  height: calc(100vh - 235px);
}

.q-table__bottom {
  position: sticky;
  bottom: 0;
  z-index: 1111
}
</style>