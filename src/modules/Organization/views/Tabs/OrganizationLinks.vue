<script setup>
import {inject, ref} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import GridCard from "@/components/GridCard.vue";
import {getDate} from "../../../utils/dateFormatter";
// Роутер
const router = useRouter();
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
// Меню навигации
const crumbList = ref(router.currentRoute.value.meta.breadCrumbs);
// Диалог удаления/блокировки
const { confirmDelete } = inject('deleteDialog');
// Квазар
const $q = useQuasar();
// Флаг удаления/блокировки
const loading = ref(true);
// Данные для таблицы
const linksList = ref([]);
// Колонки таблицы
const columns = [
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
    name: "profile",
    required: true,
    label: "Профиль",
    align: "left",
    field: (row) => row.profile.fullName,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "legalEntity",
    required: true,
    label: "Партнёр",
    align: "left",
    field: (row) => row.legalEntity.organization.title,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "isBlocked",
    required: true,
    label: "Заблокирован",
    align: "left",
    field: 'isBlocked',
    format: (val) => `${val ? 'Да' : 'Нет'}`,
    sortable: true,
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
    name: "updatedAt",
    required: true,
    label: "Дата обновления",
    align: "left",
    field: 'updatedAt',
    format: (val) => val ? getDate(val) : 'Нет данных',
    sortable: true,
  },
];
// Пагинация
const pagination = ref({
  page: 1,
  pages: 1,
  totalCount: 1,
  rowsPerPage: 14,
});

function getUsers() {
  getData(`/admin/link?organization=${ID}`, METHODS.GET)
      .then((response) => {
        if (response.success) {
          linksList.value = response.result.items;
        }
      })
      .finally(() => {
        loading.value = false;
      });
}

getUsers();
</script>

<template>

  <div v-if="$q.platform.is.mobile">
    <GridCard
      :headers="columns"
      :list="linksArr"
      :loading="loading"
    >
      <template v-slot:actions="props">
          <q-btn-dropdown
              dropdown-icon="more_vert"
              flat
              dense
          >
            <q-list>
              <q-item
                  clickable
                  class="items-center"
                  @click="$router.push(`/links/${props.row.id}`)"
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
                  @click="deleteLink(props.row.id)"
                  class="items-center"
              >
                <q-circular-progress
                    v-if="linkLoading"
                    indeterminate
                    size="20px"
                    color="black"
                    class="q-mr-xs"
                />
  
                <q-icon
                    v-else
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
        />
      </template>
    </GridCard>
  </div>
  
    <q-table
      v-else
      class="sticky-table"
      :rows="linksList"
      :loading="loading"
      :columns="columns"
      row-key="name"
      flat
      square
      :grid="$q.platform.is.mobile"
  >
    <template #bottom>
      <div class="full-width row justify-between items-center">

        <div class="row q-pa-md items-center">
          <div
              style="font-size: 14px"
          >
            Перейти
          </div>

          <input type="text" style="width: 36px; height: 32px" class="q-mx-sm">

          <div style="font-size: 14px">/ {{ pagination.rowsPerPage }}</div>
        </div>

        <div>
          <q-pagination
              v-model="pagination.page"
              :max="5"
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
.sticky-table {
  height: 75vh;
}

.q-table__bottom {
  position: sticky;
  bottom: 0;
  z-index: 1111
}
</style>