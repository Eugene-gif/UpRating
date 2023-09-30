<script setup>
import {inject, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {getData, METHODS} from "@/utils/http";
import BreadCrumbs from '@/components/BreadCrumbs.vue';
import {useStore} from "@/store/store";
// Роутер
const router = useRouter();
// Роутер
const route = useRoute();
// Хранилище
const store = useStore();
// Роли пользователя
let roles = store.profile.role;
// Флаг админа клиента
const isPartner = roles.some((role) => role.value === 'ROLE_PARTNER');
// Айди записи
const ID = route.params.id;
// Текущая вкладка
const tab = ref("main");
// Меню навигации
const crumbList = [
    {
        title: 'Клиенты',
        path: '/organization',
    },
    {
        title: 'Клиент',
        path: `/organization/${ID}/main`,
    },
];
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Флаг загрузки
const loading = ref(false);
// Айтем клиента
const organizationItem = ref();

if (ID != 0) {
    loading.value = true;

    getData(`/admin/organization/${ID}`, METHODS.GET)
        .then((response) => {
            if (response.success) {
                organizationItem.value = response.result.item;
            }
        })
        .finally(() => {
            loading.value = false;
        });
} else {
    organizationItem.value = {
        title: '',
        decisionMakerName: '',
        decisionMakerPhone: '',
    }

    loading.value = false;
}

function deleteOrganization() {
    confirmDelete('Удалить', (fn) => {
        getData(`/admin/organization/${ID}`, METHODS.DELETE).then((res) => {
            if (res.success) {
                router.push('/organization');
            }
        });

        fn();
    });
}

function createNewItem() {
    if (tab.value !== 'bill' && tab.value !== 'card') {
        router.push(`/organization/${ID}/${tab.value}/0`);
    } else if (tab.value === 'card') {
        router.push(`/organization/${ID}/${tab.value}/0/main`);
    } else {
        router.push(`/organization/${ID}/${tab.value}/card`);
    }
}
</script>

<template>
    <div class="q-pa-lg">
        <BreadCrumbs
                :routeList="crumbList"
        />

        <div class="row justify-between items-center page-header">
            <h2 class="text-h4 text-bold q-my-none">Клиент</h2>

            <div class="row q-gutter-md justify-end">
                <q-btn
                        v-if="tab !== 'info'"
                        no-caps
                        color="primary"
                        label="Добавить запись"
                        @click="createNewItem"
                        size="12px"
                />
                <q-btn
                        v-if="tab !== 'card' && tab !== 'qr_codes'"
                        no-caps
                        color="primary"
                        label="Продлить подписку"
                        size="12px"
                        @click="$router.push({ name: 'bills-subscribe', state: { orgID: ID } })"
                />
                <q-btn
                        v-if="tab === 'card'"
                        no-caps
                        color="primary"
                        label="Отчёт по картам"
                        @click="$router.push(`/organization/${ID}/${tab}/org_report`)"
                        size="12px"
                />
                <q-btn
                    v-if="tab === 'qr_codes'"
                    no-caps
                    color="primary"
                    label="Отчёт по Qr кодам"
                    @click="$router.push(`/organization/${ID}/${tab}/org_report`)"
                    size="12px"
                />
                <q-btn
                        v-if="!isPartner"
                        no-caps
                        outline
                        class="btn-default"
                        :disable="ID == 0"
                        label="Удалить"
                        size="12px"
                        @click="deleteOrganization"
                />
                <q-btn
                        no-caps
                        outline
                        class="btn-default"
                        label="Вернуться к списку"
                        @click="$router.push(router.options.history.state.back)"
                        size="12px"
                />
            </div>
        </div>
    </div>

    <q-tabs
            class="bg-transparent text-black text-subtitle1 q-mx-md"
            v-model="tab"
            dense
            indicator-color="primary"
            align="left"
            no-caps
    >
        <q-route-tab :to="`/organization/${ID}/main`" name="main" label="Основная информация"/>
        <q-route-tab :to="`/organization/${ID}/legal_entity`" name="legal_entity" label="Юридические лица клиента"/>
        <q-route-tab :to="`/organization/${ID}/user`" name="user" label="Пользователи клиента"/>
        <q-route-tab :to="`/organization/${ID}/card`" name="card" label="Карты клиента"/>
        <q-route-tab :to="`/organization/${ID}/qr_codes`" name="qr_codes" label="QR коды клиента"/>
        <q-route-tab :to="`/organization/${ID}/bill`" name="bill" label="Счета клиента"/>
    </q-tabs>

    <q-separator class="separator-color" size="10px"/>

    <router-view/>
</template>

<style scoped>
</style>
