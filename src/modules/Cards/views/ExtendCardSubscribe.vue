<script setup>
import {ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {_copy, getData, METHODS} from "@/utils/http";
import {useQuasar} from "quasar";
import {useStore} from "@/store/store";

const store = useStore();
const profile = store.profile;
const roles = profile.role;
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
const router = useRouter();
const route = useRoute();
const crumbList = [
    {
        title: 'Счета',
        path: '/bills',
    },
    {
        title: 'Продление подписки',
        path: '/bills/subscribe',
    },
];
// Квазар
const $q = useQuasar();
// Список карт
const cardsList = ref([]);
// Список юр.лиц
const organizationList = ref([]);
// Список юр.лиц
const entityList = ref([]);
// Флаг сохранения
const saving = ref(false);
// Флаг загрузки
const loading = ref(true);
// Карта
const cardsLoading = ref(false);
// Карта
const entityLoading = ref(false);
// Массив карт
const newCards = ref([{}]);
// Периоды продления карт
const period = ref();
const isPhysical = ref(false);
//
const cardId = route.params.id;
//
const orgId = history.state.orgID;
// Айтем
const item = ref({
    legalEntity: null,
    nfcTags: [],
    tariffs: [],
    organization: null,
});

if (isOrgAdmin) {
    item.value.organization = profile.organization.id;
} else {
    item.value.organization = orgId;
}

if (!orgId) {
    getData(`/admin/organization`, METHODS.GET).then((response) => {
        if (response.success) {
            organizationList.value = response.result.items;
        }
    }).finally(() => {
        loading.value = false;
    })
} else {
    loading.value = false;
}

getData(`/admin/subscription_type?type=NFC_TAG`, METHODS.GET).then((response) => {
    if (response.success) {
        period.value = response.result.items;
    }
});

function createBill() {
    saving.value = true;
    newCards.value.forEach((card) => {
        item.value.nfcTags.push(card.nfcTag);
        item.value.tariffs.push(card.tariff);
    });
    const cloneItem = prepareItem(item.value);

    if (!isPhysical.value) {
        getData('/admin/bill/sub_bill', METHODS.POST, cloneItem)
            .then((response) => {
                if (response.success) {
                    $q.notify({
                        message: `Счет на оплату создан. Перейдите в раздел "Счета" и скачайте счет для оплаты подписки`,
                        color: 'green',
                    });

                    router.push("/bills");
                } else {
                    $q.notify({
                        message: "Произошла ошибка",
                        color: "red",
                    });
                }
            })
            .finally(() => {
                saving.value = false;
            });
    } else {
        getData('/admin/bill/sub_bill?individual=true', METHODS.POST, cloneItem)
            .then((response) => {
                if (response.success) {
                    window.open(response.result.item.redirectUrl, '_blank');
                }
            })
            .finally(() => {
                saving.value = false;
            });
    }
}

function getCards(value) {
    let organizationQuery;
    cardsLoading.value = true;

    if (value) {
        organizationQuery = `?organization=${value.organization?.id}`;
    }

    if (cardId) {
        if (cardsList.value.length === 0) {
            getData(`/admin/nfc_tag/${cardId}`, METHODS.GET).then((response) => {
                if (response.success) {
                    cardsList.value = [response.result.item];
                    newCards.value[0] = {
                        nfcTag: cardId,
                    };
                    item.value.organization = response.result.item.organization;
                }
            }).finally(() => cardsLoading.value = false);

        } else {
            cardsLoading.value = false;
        }
    } else {
        getData(`/admin/nfc_tag${value ? organizationQuery : ''}`, METHODS.GET).then((response) => {
            if (response.success) {
                cardsList.value = response.result.items;

                if (cardId) {
                    newCards.value[0] = {
                        nfcTag: cardId,
                    };
                }
            }
        }).finally(() => cardsLoading.value = false);
    }
}

function getEntities(organizationId) {
    let organizationQuery;
    entityLoading.value = true;

    if (organizationId) {
        organizationQuery = `?organization=${organizationId}`;
    }

    getData(`/admin/legal_entity${organizationId ? organizationQuery : ''}`, METHODS.GET).then((response) => {
        if (response.success) {
            entityList.value = response.result.items;
        }
    }).finally(() => entityLoading.value = false);
}

if (!orgId) {
    getEntities();
} else {
    getEntities(orgId);
}

function prepareItem(item) {
    const cloneItem = _copy(item);

    if (cloneItem.legalEntity?.id) {
        cloneItem.legalEntity = cloneItem.legalEntity.id;
    }

    if (cloneItem.organization?.id) {
        cloneItem.organization = cloneItem.organization.id;
    }

    return cloneItem;
}

getCards();
</script>

<template>

    <div class="q-pa-lg">
        <BreadCrumbs :routeList="crumbList"/>
        <div class="row justify-between items-center page-header">
            <h2 class="text-h4 text-bold q-my-none">Формирование счетов </h2>
            <div class="row q-gutter-md justify-end">
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

    <q-form
            @submit="createBill"
    >
        <div class="q-pa-lg q-gutter-lg" style="max-width: 600px">

            <q-toggle v-model="isPhysical" label="Я буду оплачивать, как физическое лицо"/>

            <template v-if="!isPhysical">
                <q-select
                        v-if="!isOrgAdmin && !cardId && !orgId"
                        label="Клиент"
                        v-model="item.organization"
                        :options="organizationList"
                        @update:model-value="(val) => getEntities(val.id)"
                        :loading="loading"
                        :disable="loading"
                        option-label="title"
                        option-value="id"
                        dense
                        outlined
                        :rules="[val => !!val || 'Поле должно быть заполнено']"
                />

                <div
                        v-if="!loading && !entityLoading && entityList.length < 1"
                        class="q-mx-lg q-pa-lg infoCard"
                >
                    У вас нет ни одного юр. лица. Перейдите в раздел
                    <router-link to="/legal_entity">"Юр. лица"</router-link>
                    и создайте.
                </div>

                <q-select
                        label="Выберите юр.лицо"
                        v-model="item.legalEntity"
                        :options="entityList"
                        @update:model-value="getCards"
                        :loading="loading || entityLoading"
                        :disable="loading || entityLoading || !item.organization"
                        option-label="title"
                        option-value="id"
                        dense
                        outlined
                        :rules="[val => !!val || 'Поле должно быть заполнено']"
                />
            </template>

            <q-card
                    class="row q-pa-sm justify-between items-center"
                    v-for="(card, index) in newCards"
                    :key="index"
            >
                <q-select
                        label="Выберите карту"
                        v-model="card.nfcTag"
                        :options="cardsList"
                        :loading="cardsLoading"
                        :disable="cardsLoading || !!cardId || (!isPhysical && !item.legalEntity)"
                        style="max-width: 200px; width: 100%;"
                        option-label="title"
                        option-value="id"
                        dense
                        outlined
                        emit-value
                        map-options
                        :rules="[val => !!val || 'Поле должно быть заполнено']"
                />

                <q-select
                        label="Выберите тариф"
                        outlined
                        class="col-5"
                        v-model="card.tariff"
                        :options="period"
                        option-label="title"
                        option-value="id"
                        emit-value
                        map-options
                        dense
                        :rules="[val => !!val || 'Поле должно быть заполнено']"
                />

                <div class="col-1 q-mb-auto">
                    <q-btn
                            round
                            flat
                            size="12px"
                            icon="delete"
                            @click="newCards.splice(index, 1)"
                    />
                </div>
            </q-card>

            <div>
                <q-btn
                        outline
                        no-caps
                        class="bg-primary text-white"
                        icon="done"
                        label="Сформировать счёт"
                        :disable="loading"
                        :loading="saving"
                        type="submits"
                />
            </div>
        </div>
    </q-form>
</template>

<style scoped>
.q-card {
    box-shadow: none;
    border: 1px solid #ebebeb;
}
</style>