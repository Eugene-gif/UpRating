<script setup>
import {ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {getData, METHODS} from "@/utils/http";
import {useQuasar} from "quasar";

const $q = useQuasar();
const router = useRouter();
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
const crumbList = [
    {
        title: 'Клиенты',
        path: '/organization',
    },
    {
        title: 'Клиент',
        path: `/organization/${ID}/bill`,
    },
    {
        title: 'Формирование счёта',
        path: `/organization/${ID}/bill/card`,
    },
];
const item = ref({
    legalEntity: '',
    cardCount: null,
    isPhysical: false,
    isBrand: false,
    organization: null,
});
const loading = ref(true);
const organizationLoading = ref(true);
const saving = ref(false);
const legalEntityList = ref([]);
const organizationList = ref([]);
const isPhysical = ref(false);
const isEmptyEntity = ref(false);

getData(`/admin/legal_entity?organization=${ID}`, METHODS.GET).then((response) => {
    if (response.success) {
        legalEntityList.value = response.result.items;
        loading.value = false;


        if (legalEntityList.value.length < 1) {
            isEmptyEntity.value = true;
        }
    }
});

getData(`/admin/organization`, METHODS.GET).then((response) => {
    if (response.success) {
        organizationList.value = response.result.items;
        item.value.organization = ID;
    }
}).finally(() => {
    organizationLoading.value = false;
});

function createBill() {
    saving.value = true;

    if (!isPhysical.value) {
        getData(`/admin/bill/card_bill`, METHODS.POST, item.value).then((response) => {
            if (response.success) {
                $q.notify({
                    message: 'Выпуск карт произведен',
                    color: 'green'
                });

                router.push(`/organization/${ID}/bill`);
            }
        }).finally(() => saving.value = false);
    } else {
        getData(`/admin/bill/card_bill?individual=true`, METHODS.POST, item.value).then((response) => {
            if (response.success && response.result.item.redirectUrl) {
                window.open(response.result.item.redirectUrl, '_blank');
            } else {
                $q.notify({
                    message: 'Карта успешно выпущена',
                    color: 'green',
                })
            }
        }).finally(() => saving.value = false);
    }
}

function getEntities(value) {
    let organizationQuery;
    entityLoading.value = true;

    if (value) {
        organizationQuery = `?organization=${value}`;
    }


    getData(`/admin/legal_entity${value ? organizationQuery : ''}`, METHODS.GET).then((response) => {
        if (response.success) {
            legalEntityList.value = response.result.items;
        }
    }).finally(() => entityLoading.value = false);
}
</script>

<template>
    <div class="q-pa-lg">
        <BreadCrumbs
                :routeList="crumbList"
        />

        <div class="row justify-between items-center page-header">
            <h2 class="text-h4 q-my-none">Формирование счета на карту</h2>
            <div class="row q-gutter-md justify-end">
                <q-btn
                    no-caps
                    outline
                    class="btn-default"
                    label="Вернуться назад"
                    @click="$router.push(`/organization/${ID}/bill`)"
                    size="12px"
                />
            </div>
        </div>
    </div>

    <q-separator class="separator-color" size="10px"/>

    <div style="max-width: 600px">
        <q-form
                @submit="createBill"
                class="col-6 q-pa-lg q-mt-sm"
        >
            <div class=" q-gutter-sm" style="max-width: 600px; width: 100%">
                <div class="text-subtitle1 q-mb-xs">Клиент</div>

                <!-- <q-select
                        class="q-mt-none q-mb-none"
                        label="Выберите клиента"
                        v-model="item.organization"
                        :options="organizationList"
                        :loading="organizationLoading"
                        disable
                        @update:model-value="getEntities"
                        option-label="title"
                        option-value="id"
                        map-options
                        emit-value
                        dense
                        outlined
                        :rules="[(val) => !!val || 'Необходимо выбрать клиента']"
                /> -->

                <div
                    class="infoCard"
                >
                    Включите тумблер, если вам нужна карта на физическом носителе (стоимость карты 1450 руб.).
                    Если вы хотите протестировать сервис без приобретения карты на физическом носителе оставьте тумблер
                    в текущем положении.
                    В этом случае будет выпущена виртуальная карта.
                </div>

                <div class="text-subtitle1">
                    <q-toggle
                            v-model="item.isPhysical"
                            label="Выпустить ключ-карту"
                    />
                </div>

                <div
                        v-if="item.isPhysical"
                >
                    <div
                            class="q-mt-md infoCard"
                    >
                        Включите тумблер, если вам необходимо нанести на карту логотип компании
                        (либо любую другую необходимую информацию)
                    </div>

                    <q-toggle
                            v-model="item.isBrand"
                            label="Брендирование"
                            class="text-subtitle1"
                    />

                    <q-toggle
                            v-model="isPhysical"
                            label="Я буду оплачивать, как физическое лицо"
                            class="text-subtitle1"
                    />
                </div>

                <template v-if="!isPhysical && item.isPhysical">
                    <div
                            v-if="isEmptyEntity"
                            class="infoCard"
                    >
                        У вас нет заполненных Юр.лиц, перейдите раздел
                        "
                        <router-link :to="`/organization/${ID}/legal_entity`">Юридические лица</router-link>
                        "
                        и создайте новое.
                    </div>

                    <div class="text-subtitle1 q-mb-xs">Юридическое лицо</div>
                    <q-select
                            class="q-mt-none q-mb-none"
                            label="Выберите юр. лицо"
                            v-model="item.legalEntity"
                            :options="legalEntityList"
                            :loading="loading"
                            option-label="title"
                            option-value="id"
                            map-options
                            emit-value
                            dense
                            outlined
                            :rules="[(val) => !!val || 'Выберите юр.лицо']"
                    />
                </template>


                <div>
                    <div class="text-subtitle1 q-mb-xs">Количество карт</div>

                    <q-input
                            style="width: 200px"
                            label="Введите кол-во карт"
                            v-model="item.cardCount"
                            type="number"
                            outlined
                            dense
                            :rules="[(val) => !!val || 'Укажите количество']"
                    />
                </div>

                <div>
                    <q-btn
                            no-caps
                            outline
                            class="bg-primary text-white"
                            icon="done"
                            type="submit"
                            :disable="loading"
                            :loading="saving"
                            :label="item.isPhysical ? 'Сформировать счёт' : 'Выпустить карту(-ы)'"
                    />
                </div>
            </div>
        </q-form>
    </div>
</template>

<style scoped>
</style>