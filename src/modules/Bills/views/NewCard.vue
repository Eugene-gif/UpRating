<script setup>
import {ref} from "vue";
import {useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {getData, METHODS} from "@/utils/http";
import {useQuasar} from "quasar";
import {useStore} from "@/store/store";
 
const store = useStore();
const profile = store.profile;
const roles = profile.role;
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
const $q = useQuasar();
const router = useRouter();
const crumbList = [
    {
        title: "Счета",
        path: "/bills",
    },
    {
        title: "Выпуск карты",
        path: "/bills/cards",
    },
];
const item = ref({
    legalEntity: "",
    cardCount: null,
    isBrand: false,
    isPhysical: false,
    organization: null,
});
const loading = ref(true);
const organizationLoading = ref(true);
const entityLoading = ref(false);
const saving = ref(false);
const legalEntityList = ref([]);
const organizationList = ref([]);
const isPhysical = ref(false);
const isEmptyEntity = ref(false);

if (isOrgAdmin) {
    item.value.organization = profile.organization.id;
}


getData(`/admin/legal_entity`, METHODS.GET).then((response) => {
    if (response.success) {
        legalEntityList.value = response.result.items;

        if (legalEntityList.value.length < 1) {
            isEmptyEntity.value = true;
        }

        loading.value = false;
    }
});

if (!isOrgAdmin) {
    getData(`/admin/organization`, METHODS.GET).then((response) => {
        if (response.success) {
            organizationList.value = response.result.items;
        }
    }).finally(() => {
        organizationLoading.value = false;
    });
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

function createBill() {
    saving.value = true;

    if (!isPhysical.value) {
        getData(`/admin/bill/card_bill`, METHODS.POST, item.value)
            .then((response) => {
                if (response.success) {
                    if (isOrgAdmin) {
                        $q.notify({
                            message: item.value.isPhysical ?
                                'Перейдите в раздел счета, и скачайте счет для оплаты карты'
                                :
                                'Поздравляем, Ваша карта выпущена. Теперь Вам нужно закрепить за картой пользователя, ' +
                                'и создать список ссылок, по которым вы планируете перенаправлять смартфоны ваших клиентов.' +
                                ' Для этого в разделе пользователи, создайте пользователя карты, а в разделе ссылки, список ссылок.',
                            color: "green",
                            timeout: 12000,
                        });


                    } else {
                        $q.notify({
                            message: item.value.isPhysical ?
                                'Перейдите в раздел счета, и скачайте счет для оплаты карты'
                                :
                                'Карты успешно выпущены.',
                            color: "green",
                        });
                    }


                    router.push("/cards");
                }
            })
            .finally(() => (saving.value = false));
    } else {
        getData(`/admin/bill/card_bill?individual=true`, METHODS.POST, item.value)
            .then((response) => {
                if (response.success && response.result.item.redirectUrl) {
                    window.open(response.result.item.redirectUrl, '_blank');
                } else {
                    $q.notify({
                        message: 'Карта успешно выпущена.',
                        color: 'green',
                    });
                }
            })
            .finally(() => (saving.value = false));
    }
}
</script>

<template>
    <div class="q-pa-lg">
        <BreadCrumbs :routeList="crumbList"/>

        <div class="row justify-between items-center page-header">
            <h2 class="text-h4 text-bold q-my-none">Формирование счета на карту</h2>

            <div class="row q-gutter-md justify-end">
                <q-btn
                    no-caps
                    outline
                    class="btn-default"
                    label="Вернуться к списку"
                    size="12px"
                    @click="$router.push('/bills')"
                />
            </div>
        </div>
    </div>

    <q-separator class="separator-color" size="10px"/>

    <q-form @submit="createBill">
        <div
            class="q-pa-lg q-gutter-sm"
            style="max-width: 600px; width: 100%"
        >
            <div v-if="!isOrgAdmin">
                <div class="text-subtitle1 q-mb-xs">Клиент</div>

                <q-select
                    class="q-mt-none q-mb-none"
                    label="Выберите клиента"
                    v-model="item.organization"
                    :options="organizationList"
                    :loading="organizationLoading"
                    @update:model-value="getEntities"
                    option-label="title"
                    option-value="id"
                    map-options
                    emit-value
                    dense
                    outlined
                    :rules="[(val) => !!val || 'Необходимо выбрать клиента']"
                />
            </div>

            <div
                    class="infoCard"
            >
                Включите тумблер, если вам нужна карта на физическом носителе (стоимость карты 1450 руб.).
                Если вы хотите протестировать сервис без приобретения карты на физическом носителе оставьте тумблер в
                текущем положении.
                В этом случае будет выпущена виртуальная карта.
            </div>

            <div class="text-subtitle1">
                <q-toggle
                    v-model="item.isPhysical"
                    label="Выпустить ключ-карту"
                />
            </div>

            <template
                v-if="item.isPhysical"
            >
                <div
                    class="infoCard"
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
            </template>

            <template v-if="!isPhysical && item.isPhysical">
                <div
                    v-if="isEmptyEntity"
                    class="q-pa-lg infoCard"
                >
                    У вас нет заполненных Юр.лиц, перейдите раздел
                    "
                    <router-link to="/legal_entity">Юридические лица</router-link>
                    "
                    и создайте новое.
                </div>

                <div class="text-subtitle1 q-mb-xs">Юридическое лицо</div>
                <q-select
                    class="q-mt-none q-mb-none"
                    label="Выберите юр. лицо"
                    v-model="item.legalEntity"
                    :options="legalEntityList"
                    :loading="loading || entityLoading"
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
</template>

<style scoped>
</style>