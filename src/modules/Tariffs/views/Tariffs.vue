<script setup>
import {inject, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import GridCard from "@/components/GridCard.vue";
// Квазар
const $q = useQuasar();
// Роутер
const router = useRouter();
// Меню навигации
const crumbList = [
    {
        title: 'Тарифы',
        path: '/tariffs',
    },
]
// Текст из поисковой строки
const searchText = inject('searchText');
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Флаг загрузки
const loading = ref(true);
// Данные для таблицы
const tariffsList = ref([]);
// Копия массива данных таблицы
const tariffsCopyArr = ref([]);
const sortTitle = ref();
const isDesc = ref(true);
// Если смотритель получает значение из поисковой строки, он делает выборку по массиву элементов таблицы
watch(searchText, () => {
    getData(`/admin/subscription_type?search=${searchText.value}`, METHODS.GET)
        .then((response) => {
            tariffsList.value = response.result.items;
        });
});
// Колонки таблицы
const columns = [
    {
        name: "title",
        required: true,
        label: "Название",
        align: "left",
        field: "title",
        format: (val) => `${val ?? 'Нет данных'}`,
        sortable: true,
    },
    {
        name: "period",
        required: true,
        label: "Время действия",
        align: "left",
        field: "period",
        format: (val) => `${val ?? 'Нет данных'}`,
        sortable: true,
    },
    {
        name: "cost",
        required: true,
        label: "Стоимость",
        align: "left",
        field: "cost",
        format: (val) => `${val ?? 'Нет данных'}`,
        sortable: true,
    },
    {
        name: "type",
        required: true,
        label: "Тип",
        align: "left",
        field: "type",
        format: (val) => {
            if (val === 'NFC_TAG') {
                return 'Карта';
            } else if (val === 'QR_CODE') {
                return 'QR код'
            }

            return `${val ?? 'Нет данных'}`;
        },
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

function getTariffs(query) {
    getData(`/admin/subscription_type?${query}&all=true&type`, METHODS.GET)
        .then((response) => {
            if (response.success) {
                tariffsList.value = response.result.items;
                tariffsCopyArr.value = tariffsList.value;
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

function deleteTariff(id) {
    confirmDelete('Удалить', (fn) => {
        getData(`/admin/subscription_type/${id}`, METHODS.DELETE).then((res) => {
            if (res.success) {
                $q.notify({
                    message: 'Запись успешно удалена',
                    color: 'green',
                });
            } else {
                if (res.message) {
                    $q.notify({
                        message: res.message,
                        color: 'red',
                    });
                }
            }

            getTariffs(`page=${pagination.value.page}&perPage=14`);
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
        `/admin/subscription_type?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&${sortQuery}`,
        METHODS.GET,
    )
        .then((response) => {
            tariffsList.value = response.result.items;
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

    getTariffs(`page=${value}&perPage=14`)
}

getTariffs(`page=1&perPage=14`);
</script>

<template>
    <div class="q-pa-lg page-header">
        <BreadCrumbs
                :routeList="crumbList"
        />

        <div class="row justify-between items-center">
            <h2 class="text-h4 text-bold q-my-none">Тарифы</h2>

            <div class="row q-gutter-md justify-end">
                <q-btn
                        no-caps
                        color="primary"
                        label="Добавить"
                        size="12px"
                        @click="$router.push('/tariffs/0')"
                />
            </div>
        </div>
    </div>

    <q-separator class="separator-color" size="10px"/>

    <div v-if="$q.platform.is.mobile">
        <GridCard
                :headers="columns"
                :list="tariffsList"
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
                                @click="$router.push(`/tariffs/${props.row.id}`)"
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
                                @click="deleteTariff(props.row.id)"
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
                        direction-links
                        outline
                        color="black"
                        active-design="outline"
                        active-color="grey"
                        active-text-color="black"
                        @update:model-value="getTariffs(`page=${pagination.page}&perPage=14`)"
                />
            </template>
        </GridCard>
    </div>

    <q-table
            v-else
            class="sticky-table"
            :rows="tariffsList"
            :loading="loading"
            :columns="columns"
            row-key="name"
            v-model:pagination="pagination"
            binary-state-sort
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
                                @click="$router.push(`/tariffs/${props.row.id}`)"
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
                                @click="deleteTariff(props.row.id)"
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

                    <div style="font-size: 14px">/ {{ pagination.pages }}</div>
                </div>

                <div>
                    <q-pagination
                            v-model="pagination.page"
                            :max="pagination.pages"
                            :max-pages="6"
                            @update:model-value="getTariffs(`page=${pagination.page}&perPage=14`)"
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