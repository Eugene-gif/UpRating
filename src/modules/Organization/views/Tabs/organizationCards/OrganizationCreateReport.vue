<script setup>
import {ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {getData, METHODS} from "@/utils/http";
import {useQuasar} from "quasar";
import { getDate } from "@/utils/dateFormatter";
// Роутер
const route = useRoute();
// Роутер
const router = useRouter();
// Роутер
const $q = useQuasar();
// Айди записи
const ID = route.params.id;

const ID2 = route.params.id2;
// Меню навигации
const crumbList = ref(router.currentRoute.value.meta.breadCrumbs);
// Начальная дата
const startDate = ref('');
// Конечная дата
const endDate = ref('');
// Флаги отправки отчёта на почту
const sendByEmail = ref(true);
// Флаг загрузки файла
const fileLoading = ref(false);
// Флаг загрузки файла
const isTableReport = ref(false);
// Флаг загрузки файла
const downloadReportLoading = ref(false);
// Флаг загрузки файла
const renderReportLoading = ref(false);
// Флаг отображения таблицы переходов
const reportList = ref([]);

const columns = [
    {
        name: "nfcTagTitle",
        required: true,
        label: "Карта",
        align: "left",
        field: 'nfcTagTitle',
        format: (val) => `${val ?? 'Нет данных'}`,
    },
    {
        name: "fullname",
        required: true,
        label: "Пользователь",
        align: "left",
        field: 'fullname',
        format: (val) => `${val ?? 'Нет данных'}`,
    },
    {
        name: "url",
        required: true,
        label: "Ссылка",
        align: "left",
        field: 'url',
        format: (val) => `${val ?? 'Нет данных'}`,
    },
    {
        name: "date",
        required: true,
        label: "Дата",
        align: "left",
        field: 'date',
        format: (val, row) => {
            if (row.url === '') {
                return ''
            }
            return val ? getDate(val) : 'Нет данных'
        },
    },
];


// Скачивание отчёта
function sendReport(byEmail, id) {
  fileLoading.value = true;

  getData(`/admin/doc/redirect_report_unique?startDate=${startDate.value}&endDate=${endDate.value}&cardId=${id}&send_by_email=true&type=NFC_TAG`,
      METHODS.GET).then((response) => {
    $q.notify({
      message: 'Отчёт успешно выслан на почту!',
      color: 'green',
    });

    fileLoading.value = false;
  });
}

function downloadReport(id, fileName) {
  downloadReportLoading.value = true;
  const token = localStorage.getItem('token');

  fetch(`${import.meta.env.VITE_API_URL}/admin/doc/redirect_report_unique?startDate=${startDate.value}&endDate=${endDate.value}&cardId=${id}&type=NFC_TAG`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      'authorization': `Bearer ${token}`,
    }
  })
      .then((res) => res.blob())
      .then((res) => {
        const aElement = document.createElement('a');
        aElement.setAttribute('download', fileName);
        const href = URL.createObjectURL(res);
        aElement.href = href;
        aElement.setAttribute('target', '_blank');
        aElement.click();
        URL.revokeObjectURL(href);
      }).finally(() => {
    downloadReportLoading.value = false;
  })
}

function getReport(byEmail, id) {
  renderReportLoading.value = true;

  getData(`/admin/doc/redirect_report_unique?startDate=${startDate.value}&endDate=${endDate.value}&cardId=${id}&renderWeb=true&type=NFC_TAG`,
      METHODS.GET).then((response) => {
    reportList.value = response.item;

    if (reportList.value.length > 0) {
      isTableReport.value = true;
    } else {
      $q.notify({
        message: 'Нет данных для отображения.',
        color: 'red',
      });
    }

  }).finally(() => renderReportLoading.value = false);
}
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Формирование отчета по карте</h2>
      <div class="row q-gutter-md justify-end">
        <q-btn
            no-caps
            outline
            class="btn-default"
            label="Вернуться к списку"
            size="12px"
            @click="$router.push(`/organization/${ID}/card`)"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>
  <div class="row">
    <div style="max-width: 600px">
      <div class="col-6 q-pa-lg q-mt-sm">
        <div class="text-subtitle1">
          Начало периода

          <q-input
              outlined
              dense
              v-model="startDate"
              mask="####-##-##"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="startDate" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Закрыть" color="primary" flat/>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="text-subtitle1 q-my-lg">
          Конец периода

          <q-input
              v-model="endDate"
              mask="####-##-##"
              outlined
              dense
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="endDate" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Закрыть" color="primary" flat/>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="column q-gutter-md">
          <div>
            <q-btn
                no-caps
                outline
                class="bg-primary text-white"
                label="Выслать на почту"
                :loading="fileLoading"
                :disable="startDate && endDate === ''"
                @click="sendReport(sendByEmail, ID2)"
            />
          </div>

          <div>
            <q-btn
                no-caps
                outline
                class="bg-primary text-white"
                :loading="downloadReportLoading"
                :disable="startDate && endDate === ''"
                label="Скачать отчёт"
                @click="downloadReport(ID2, 'Отчёт по карте')"
            />
          </div>

          <div>
            <q-btn
                no-caps
                outline
                class="bg-primary text-white"
                label="Сформировать отчёт"
                :loading="renderReportLoading"
                :disable="startDate && endDate === ''"
                @click="getReport(sendByEmail, ID2)"
            />
          </div>
        </div>
      </div>
    </div>

<!--    <div-->
<!--        v-if="isTableReport"-->
<!--        class="row justify-center q-ma-lg"-->
<!--    >-->
<!--      <div>-->
<!--        <table>-->
<!--          <tr>-->
<!--            <th>Название карты</th>-->
<!--            <th>Пользователь</th>-->
<!--            <th>Ссылка</th>-->
<!--            <th>Кол-во переходов</th>-->
<!--          </tr>-->

<!--          <template v-for="(row, index) in reportList" :key="index">-->
<!--            <tr>-->
<!--              <td>{{ row.nfcTagTitle ?? 'Нет данных' }}</td>-->
<!--              <td>{{ row.fullname ?? 'Нет данных' }}</td>-->
<!--              <td>{{ row.url ?? 'Нет данных' }}</td>-->
<!--              <td>{{ row.redirectCount ?? 'Нет данных' }}</td>-->
<!--            </tr>-->
<!--          </template>-->

<!--        </table>-->
<!--      </div>-->
<!--    </div>-->

      <div
              v-if="isTableReport"
              class="col-8 q-pa-lg"
      >
          <q-table
                  :rows="reportList"
                  :loading="renderReportLoading"
                  :columns="columns"
                  :rowsPerPage="0"
          >
          </q-table>
      </div>
  </div>
</template>


<style scoped>
table, th, td {
  border-collapse: collapse;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

th, tr {
  text-align: center;
  padding: 5px;
}

:deep() .q-date__calendar-item > .q-date__today {
  box-shadow: 0 0 1px 0 black;
  border: 1px solid black;
}
</style>