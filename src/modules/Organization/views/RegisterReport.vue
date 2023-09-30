<script setup>
import {ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {getData, METHODS} from "@/utils/http";
import { getDate } from "@/utils/dateFormatter";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
// Роутер
const route = useRoute();
// Роутер
const router = useRouter();
// Айди записи
const ID = route.params.id;
// Меню навигации
const crumbList = [
  {
    title: 'Клиенты',
    path: '/organization',
  },
  {
    title: 'Отчёт по регистрациям',
    path: `/organization/report`,
  },
];
// Начальная дата
const startDate = ref('');
// Конечная дата отчёта
const endDate = ref('');
// Флаг отправки отчёта на почту
const sendByEmail = ref(true);

function createReport() {
  let query = `?start_date=${startDate.value}&end_date=${endDate.value}`;

  if (sendByEmail.value) {
    query += '&sendByEmail=true';

    getData(`/admin/doc/redirect_report_unique` + query, METHODS.GET);
  } else {
    window.open(`${import.meta.env.VITE_API_URL}/admin/doc/redirect_report_unique${query}`);
  }
}


</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header q-gutter-y-sm">
      <h2 class="text-h4 text-bold q-my-none">Формирование отчета по регистрациям</h2>
      <div class="q-gutter-y-sm q-gutter-x-sm">
        <q-btn
          no-caps
          outline
          class="btn-default"
          label="Вернуться к списку"
          size="12px"
          @click="$router.push('/organization')"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <div
      class="q-pa-lg q-mt-sm"
      style="max-width: 410px"
  >
    <div class="q-gutter-md">
      <div class="text-subtitle2">
        Начало периода

        <q-input 
            dense 
            outlined 
            v-model="startDate" 
            mask="####-##-##"
        >
          <template v-slot:append>
            <q-icon 
                name="event" 
                class="cursor-pointer"
            >
              <q-popup-proxy 
                  cover 
                  transition-show="scale" transition-hide="scale"
              >
                <q-date
                    v-model="startDate" 
                    mask="YYYY-MM-DD"
                    :event-color="(date) => date[9] % 2 === 0 ? 'teal' : 'orange'"
                >
                  <div class="row items-center justify-end">
                    <q-btn 
                        v-close-popup 
                        label="Закрыть" 
                        color="primary" 
                        flat
                    />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="text-subtitle2">
        Конец периода

        <q-input
            dense 
            outlined 
            v-model="endDate" 
            mask="####-##-##"
        >
          <template v-slot:append>
            <q-icon 
                name="event" 
                class="cursor-pointer"
            >
              <q-popup-proxy 
                cover 
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                    ref="qDate"
                    v-model="endDate" 
                    mask="YYYY-MM-DD"
                    :event-color="(date) => date[9] % 2 === 0 ? 'black' : 'orange'"
                >
                  <div class="row items-center justify-end">
                    <q-btn 
                        v-close-popup 
                        label="Закрыть" 
                        color="primary" 
                        flat
                    />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div>
        <q-checkbox 
            label="Получить отчёт по email"
            v-model="sendByEmail"
        />
      </div>

      <q-btn
          no-caps
          outline
          class="bg-primary text-white"
          label="Получить отчёт"
          :disable="startDate && endDate === ''"
          @click="createReport"
      />
    </div>

  </div>
</template>


<style scoped>
:deep() .q-date__calendar-item > .q-date__today {
  box-shadow: 0 0 1px 0 black;
  border: 1px solid black;
}
</style>