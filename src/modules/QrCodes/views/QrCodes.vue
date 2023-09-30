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
// Квазар
const $q = useQuasar();
// Хранилище
const store = useStore();
// Профиль пользователя
const profile = store.profile;
// Роли пользователя
let roles = profile.role;
// Флаг админа организации
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
// Флаг суперадмина
const isAdmin = roles.some((role) => role.value === 'ROLE_SUPER_ADMIN');
// Флаг пользователя
const isUser = roles.some((role) => role.value === 'ROLE_USER');
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Меню навигации
const crumbList = [
    {
        title: 'QR коды',
        path: '/qr_codes',
    },
]
// Текст из поисковой строки
const searchText = inject('searchText');
// Данные для таблицы
const cardsList = ref([]);
// Копия массива записей
const cardsCopyArr = ref([]);
// Флаг загрузки
const loading = ref(true);
// id карты, которую блокируют
const blockedItem = ref();
// отображение диалога блокировки
const showBlockDialog = ref(false);
// Флаг блокировки карты
const blockLoading = ref(false);
const sortTitle = ref();
const isDesc = ref(true);
const emptyData = ref(false);
const firstCards = ref(false);
// Если смотритель получает значение из поисковой строки, он делает выборку по массиву элементов таблицы
watch(searchText, () => {
    getData(`/admin/nfc_tag?search=${searchText.value}`, METHODS.GET)
        .then((response) => {
            cardsList.value = response.result.items;
            firstCards.value = response.result.isFirstCards ?? false;
        });
});
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
        name: "isBlocked",
        required: true,
        label: "Заблокирован",
        align: "left",
        field: 'isBlocked',
        format: (val) => `${val ?? 'Нет данных'}`,
    },
    {
        name: "activeLink",
        align: "left",
        label: "Активная ссылка",
        field: (row) => row.activeLink?.title,
        format: (val) => `${val ?? 'Нет данных'}`,
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

if (!isUser) {
    columns.unshift({
        name: "user",
        align: "left",
        label: "Пользователь",
        field: (row) => row.user?.profile.fullName,
        format: (val) => `${val ?? 'Нет данных'}`,
        sortable: true,
    });
}

if (!isOrgAdmin && !isUser) {
    columns.unshift({
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

function getCards(query) {
    loading.value = true;

    getData(`/admin/nfc_tag?${query}`, METHODS.GET)
        .then((response) => {
            if (response.success) {
                cardsList.value = response.result.items;

                if (cardsList.value.length < 1) {
                    emptyData.value = true;
                }

                cardsCopyArr.value = cardsList.value;
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
    const index = cardsList.value.findIndex((user) => user.id === blockedItem.value.id);

    if (index > -1) {
        cardsList.value[index].isBlocked = false;
    }

    showBlockDialog.value = false;
}

function switchPage(value) {
    if (+value > pagination.value.pages) return;

    getCards(`page=${value}&perPage=14`)
}

function onRequest(props) {
    loading.value = true;

    if (props.pagination.sortBy === sortTitle.value) isDesc.value = !isDesc.value;

    sortTitle.value = props.pagination.sortBy;
    const sortQuery = `order=${sortTitle.value}.${isDesc.value ? 'DESC' : 'ASC'}`

    getData(
        `/admin/nfc_tag?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&${sortQuery}`,
        METHODS.GET,
    )
        .then((response) => {
            cardsList.value = response.result.items;
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

function checkExpire(datetime) {
    const date = new Date(Date.parse(datetime));
    const now = new Date();

    return date > now;
}
function hasFreeCards(){
    if (profile.organization.freeCards > 0) {
        return true
    }

    return false
}

getCards('type=QR_CODE&page=1&perPage=14');
</script>

<template>
    <div class="q-pa-lg">
        <BreadCrumbs
                :routeList="crumbList"
        />

        <div class="row justify-between items-center page-header">
            <h2 class="text-h4 text-bold q-my-none">QR коды</h2>

            <div
                    class="row q-gutter-md justify-end"
                    v-if="!isUser"
            >
                <q-btn
                        v-if="isOrgAdmin"
                        no-caps
                        outline
                        class="btn-default"
                        label="Отчёт QR кодам"
                        size="12px"
                        @click="$router.push('/qr_codes/all_report')"
                />

                <q-btn
                        no-caps
                        outline
                        class="btn-default"
                        label="Инструкция"
                        href="https://uprating.org/qrinstructione"
                        target="_blank"
                        size="12px"
                />

                <q-btn
                        v-if="isAdmin"
                        no-caps
                        outline
                        class="bg-primary text-white"
                        label="Добавить"
                        size="12px"
                        @click="$router.push('/qr_codes/0/main')"
                />

                <q-btn
                        v-if="isOrgAdmin"
                        no-caps
                        outline
                        class="btn-default"
                        label="Выпуск QR кода"
                        size="12px"
                        @click="$router.push('/qr_codes/new')"
                />
            </div>

            <div
                    v-if="isOrgAdmin && checkExpire(profile.organization.promoCodeExpires)"
                    class="infoCard" style="margin: 10px 0; max-width: 100%; white-space: normal; width: 100%; flex: none;"
            >
                Срок действия ваших карт, выданных по промокоду,
                истекает <b>{{ getDate(profile.organization.promoCodeExpires) }}</b>
            </div>

            <div
                    v-if="isOrgAdmin && hasFreeCards()"
                    class="infoCard" style="margin: 10px 0; max-width: 100%; white-space: normal; width: 100%; flex: none;"
            >
                Количество бесплатных карт: {{ profile.organization.freeCards }}
            </div>

            <div
                v-if="isOrgAdmin && !hasFreeCards()"
                class="infoCard" style="margin: 10px 0; max-width: 100%; white-space: normal; width: 100%; flex: none;"
            >
                Для выпуска большего кол-ва тестовых карт/qr кодов - обращаться по тел. +7 (995)169-62-53 / На почту nfcstandart@gmail.com / Telegram https://t.me/Up_Rating
            </div>

            <div
                    v-if="isOrgAdmin && firstCards"
                    class="infoCard" style="margin: 10px 0; max-width: 100%; white-space: normal; width: 100%; flex: none;"
            >
                Поздравляем, Ваш qr код выпущен. Далее нужно создать список ссылок, по которым вы планируете перенаправлять смартфоны ваших клиентов.
                Нажмите на кнопку действия в строке нужной карты и перейдите в Просмотр qr кода. Далее вверху нажмите на раздел Ссылки qr кода.
            </div>
        </div>
    </div>

    <q-separator class="separator-color" size="10px"/>



    <div v-if="$q.platform.is.mobile">
        <GridCard
                :headers="columns"
                :list="cardsList"
                :loading="loading"
        >
            <template v-if="isOrgAdmin" v-slot:noresult>
                <div
                        class="infoCard"
                >
                    Работа сервиса начинается с выпуска QR кода.
                    Нажмите кнопку "<router-link to="/qr_codes/new">Выпуск QR кода</router-link>".
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
                    {{ props.row.isBlocked ? 'Заблокирован' : 'Активен' }}
                </template>
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
                                @click="$router.push(`/cards/${props.row.id}/main`)"
                        >
                            <q-icon name="info" size="20px" class="q-mr-xs"/>
                            <q-item-section>Просмотр</q-item-section>
                        </q-item>

                        <q-item
                                v-if="!isUser"
                                clickable
                                class="items-center"
                                @click="$router.push({ name: 'bills-subscribe', state: { ID: props.row.id, orgID: props.row.organization.id } })"
                        >
                            <q-icon name="credit_card" size="20px" class="q-mr-xs"/>
                            <q-item-section>Продлить подписку</q-item-section>
                        </q-item>

                        <q-item
                                v-if="!isUser"
                                clickable
                                class="items-center"
                                @click="$router.push(`/qr_codes/${props.row.id}/report`)"
                        >
                            <q-icon name="summarize" size="20px" class="q-mr-xs"/>
                            <q-item-section>Составить отчёт</q-item-section>
                        </q-item>

                        <q-item
                                v-if="isAdmin"
                                clickable
                                @click="deleteCard(props.row.id)"
                                class="items-center"
                        >
                            <q-icon name="delete" size="20px" class="q-mr-xs"/>
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
            :rows="cardsList"
            :loading="loading"
            :columns="columns"
            row-key="name"
            v-model:pagination="pagination"
            binary-state-sort
            flat
            square
            @request="onRequest"
    >
        <template #no-data>
            <div
                    v-if="emptyData && isOrgAdmin"
                    class="infoCard"
            >
                Работа сервиса начинается с выпуска qr кода.
                Нажмите кнопку "<router-link to="/qr_codes/new">Выпуск qr кода</router-link>".
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
            <q-td>
                <q-btn-dropdown
                        dropdown-icon="more_vert"
                        flat
                        dense
                >
                    <q-list>
                        <q-item
                                clickable
                                class="items-center"
                                @click="$router.push(`/qr_codes/${props.row.id}/main`)"
                        >
                            <q-icon name="info" size="20px" class="q-mr-xs"/>
                            <q-item-section>Просмотр</q-item-section>
                        </q-item>

                        <q-item
                                v-if="!isUser"
                                clickable
                                class="items-center"
                                @click="$router.push({ name: 'bills-subscribe', state: { ID: props.row.id, orgID: props.row.organization.id } })"
                        >
                            <q-icon name="credit_card" size="20px" class="q-mr-xs"/>
                            <q-item-section>Продлить подписку</q-item-section>
                        </q-item>

                        <q-item
                                v-if="!isUser"
                                clickable
                                class="items-center"
                                @click="$router.push(`/qr_codes/${props.row.id}/report`)"
                        >
                            <q-icon name="summarize" size="20px" class="q-mr-xs"/>
                            <q-item-section>Составить отчёт</q-item-section>
                        </q-item>

                        <q-item
                                v-if="isAdmin"
                                clickable
                                @click="deleteCard(props.row.id)"
                                class="items-center"
                        >
                            <q-icon name="delete" size="20px" class="q-mr-xs"/>
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
            no-backdrop-dismiss
            no-esc-dismiss
    >
        <q-card
                class="column items-center justify-evenly text-center q-pa-lg"
                style="width: 390px; max-height: 380px"
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
.q-table__bottom {
    position: sticky;
    bottom: 0;
    z-index: 1111
}
</style>