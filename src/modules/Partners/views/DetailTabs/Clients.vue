<script setup>
import {inject, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "@/store/store";
import GridCard from "@/components/GridCard.vue";
import {getDate} from "@/utils/dateFormatter";

const store = useStore();
const roles = store.profile.role;
const isPartner = roles.some((role) => role.value === 'ROLE_PARTNER');
// Роутер
const router = useRouter();
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
// Лист навигации из роутинга
const crumbList = [
  {
    title: 'Клиенты',
    path: '/organization',
  },
];
// Диалог подтверждения удаления/редактирования
const {confirmDelete} = inject('deleteDialog');
// Текст из поисковой строки
const searchText = inject('searchText');
// Квазар
const $q = useQuasar();

const loading = ref(true);
// Данные для таблицы
const organizationList = ref([]);
const sortTitle = ref();
const isDesc = ref(true);
// Если смотритель получает значение из поисковой строки, он делает выборку по массиву элементов таблицы
watch(searchText, () => {
  getData(`/admin/organization?search=${searchText.value}`, METHODS.GET)
      .then((response) => {
        organizationList.value = response.result.items;
      });
});
const columns = [
  {
    name: "title",
    required: true,
    label: "Наименование",
    align: "left",
    field: "title",
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  },
  // {
  //   name: "decisionMakerName",
  //   required: true,
  //   label: "Имя представителя клиента",
  //   align: "left",
  //   field: "decisionMakerName",
  //   format: (val) => `${val ?? 'Нет данных'}`,
  // },
  // {
  //   name: "decisionMakerPhone",
  //   required: true,
  //   label: "Номер телефона представителя клиента",
  //   align: "left",
  //   field: 'decisionMakerPhone',
  //   format: (val) => `${val ?? 'Нет данных'}`,
  // },
  {
    name: "decisionMakerPhone",
    required: true,
    label: "Компания-партнёр",
    align: "left",
    field: 'isPartner',
    format: (val) => `${val ? 'Да' : 'Нет' ?? 'Нет данных'}`,
  },
  {
    name: "users",
    required: true,
    label: "Кол-во пользователей",
    align: "left",
    field: 'users',
    format: (val) => `${val.length ?? 'Нет данных'}`,
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
// Пагинация
const pagination = ref({
  page: 1,
  pages: 1,
  rowsNumber: 1,
  rowsPerPage: 14,
  descending: false,
});

function getOrganizations(query) {
  loading.value = true;
  getData(`/admin/organization?${query}&partnerOrganization=${ID}`, METHODS.GET)
      .then((response) => {
        if (response.success) {
          organizationList.value = response.result.items;
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

// Блокировка/разблокировка клиента
function blockUser(id, isBlocked) {
  confirmDelete(isBlocked ? 'Разблокировать' : 'Заблокировать', (fn) => {
    getData(`/admin/organization/${id}`, METHODS.PUT, {
      isBlocked: !isBlocked,
    }).then((res) => {
      if (res.success) {
        getOrganizations(`page=${pagination.value.page}&perPage=14`);
      }
    });

    fn();
  });
}

function onRequest(props) {
  loading.value = true;

  if (props.pagination.sortBy === sortTitle.value) isDesc.value = !isDesc.value;

  sortTitle.value = props.pagination.sortBy;
  const sortQuery = `order=${sortTitle.value}.${isDesc.value ? 'DESC' : 'ASC'}`

  getData(
      `/admin/organization?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&${sortQuery}`,
      METHODS.GET,
  )
      .then((response) => {
        organizationList.value = response.result.items;
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

  getOrganizations(`page=${+value}&perPage=14`);
}

if (isPartner) {
  const profile = store.profile;

  getOrganizations(`partnerOrganization=${profile.organization.organizationPartner.id}&page=1&perPage=14`);
} else {

  getOrganizations(`&page=1&perPage=14`);
}
</script>

<template>

  <div v-if="$q.platform.is.mobile">
    <GridCard
      :headers="columns"
      :list="organizationList"
      :loading="loading"
    >
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
                @click="$router.push(`/organization/${props.row.id}/main`)"
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
          </q-list>
        </q-btn-dropdown>
      </template>
  
      <template v-slot:pagination>
        <q-pagination
          v-model="pagination.page"
          :max="pagination.pages"
          :max-pages="6"
          @update:model-value="getOrganizations(`page=${pagination.page}&perPage=14`)"
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
      :rows="organizationList"
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
    <template #body-cell-actions="props">
      <q-td :props="props">
        <q-btn-dropdown
            dropdown-icon="more_vert"
            flat
            dense
        >
          <q-list>
            <q-item
                clickable
                class="items-center"
                @click="$router.push(`/organization/${props.row.id}/main`)"
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
              @update:model-value="getOrganizations(`page=${pagination.page}&perPage=14`)"
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
</template>

<style scoped>
.q-table__bottom {
  position: sticky;
  bottom: 0;
  z-index: 1111
}
</style>