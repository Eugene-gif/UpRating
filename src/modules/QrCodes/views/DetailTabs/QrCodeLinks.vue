<script setup>
import {inject, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import GridCard from "@/components/GridCard.vue";
// Роутер
const router = useRouter();
const route = useRoute();
// Айди записи
const ID = route.params.id;
// Текст из поисковой строки
const searchText = inject('searchText');
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Квазар
const $q = useQuasar();
// Флаг загрузки
const loading = ref(true);
// Флаг удаления линка
const linkLoading = ref(false);
// Данные для таблицы
const linksArr = ref([]);
// Копия массива данных
const sortTitle = ref();
const isDesc = ref(true);
// Колонки таблцы
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
        name: "url",
        required: true,
        label: "Ссылка",
        align: "left",
        field: "url",
        format: (val) => `${val ?? 'Нет данных'}`,
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

function getLinks() {
    getData(`/admin/link?nfcTag=${ID}`, METHODS.GET)
        .then((response) => {
            if (response.success) {
                linksArr.value = response.result.items;
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
            linkLoading.value = false;
        });
}


function deleteLink(id) {
    confirmDelete('Удалить', (fn) => {
        linkLoading.value = true;

        getData(`/admin/link/${id}?nfcTag=${ID}`, METHODS.DELETE).then((res) => {
            if (res.success) {
                $q.notify({
                    message: 'Запись успешно удалена',
                    color: 'green'
                })
            }

            getLinks();
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
        `/admin/link?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&nfcTag=${ID}&${sortQuery}`,
        METHODS.GET,
    )
        .then((response) => {
            linksArr.value = response.result.items;
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

    pagination.value.page = +value;
}

getLinks();
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
                        dense
                        color="black"
                >
                    <q-list>
                        <q-item
                                clickable
                                class="items-center"
                                @click="$router.push(`/cards/${ID}/link/${props.row.id}`)"
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
            :rows="linksArr"
            :loading="loading"
            :columns="columns"
            v-model:pagination="pagination"
            row-key="name"
            binary-state-sort
            flat
            square
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
                                @click="$router.push(`/cards/${ID}/link/${props.row.id}`)"
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
            </q-td>
        </template>

        <template #bottom>
            <div class="full-width row justify-between items-center">

                <div class="row q-pa-md items-center">
                    <div style="font-size: 14px">
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
    height: calc(100vh - 235px);
}

.q-table__bottom {
    position: sticky;
    bottom: 0;
    z-index: 1111
}
</style>