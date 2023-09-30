<script setup>
import {inject, ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useQuasar} from "quasar";
import QrcodeVue from 'qrcode.vue'
// Диалог удаления/блокировки
const { confirmDelete } = inject('deleteDialog');
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
// Айди записи
const ID2 = route.params.id2;
// Квазар
const $q = useQuasar();
// Ротуер
const router = useRouter();

const tab = ref('main');
// Меню навигации
const crumbList = [
    {
        title: 'Клиенты',
        path: '/organization',
    },
    {
        title: 'Клиент',
        path: `/organization/${ID}/qr_codes`,
    },
    {
        title: 'Карта',
        path: `/organization/${ID}/qr_codes/${ID2}`,
    },
];

function deleteItem() {
    confirmDelete('Удалить' , (fn) => {
        getData(`/admin/nfc_tag/${ID2}`, METHODS.DELETE).then((res) => {
            if (res.success) {
                router.push(`/organization/${ID}/qr_codes`);
            }
        });

        fn();
    });
}

</script>

<template>
    <div class="q-pa-lg">
        <BreadCrumbs
                :routeList="crumbList"
        />

        <div class="row justify-between items-center page-header">
            <h2 class="text-h4 text-bold q-my-none">Qr код</h2>

            <div class="row q-gutter-md justify-end">
                <div class="q-gutter-sm">
                    <q-btn
                            no-caps
                            color="primary"
                            label="Продлить подписку"
                            :disable="+ID2 === 0"
                            @click="router.push({ name: 'bills-subscribe', state: { ID: ID2 } })"
                            size="12px"
                    />

                    <q-btn
                            v-if="tab === 'links'"
                            no-caps
                            color="primary"
                            class="btn-default"
                            label="Создать ссылку"
                            :disable="+ID2 === 0"
                            @click="$router.push(`/organization/${ID}/qr_codes/${ID2}/link/0`)"
                            size="12px"
                    />

                    <q-btn
                            no-caps
                            outline
                            class="btn-default"
                            label="Составить отчёт"
                            :disable="+ID2 === 0"
                            size="12px"
                            @click="$router.push(`/qr_codes/${ID2}/report`)"
                    />

                    <q-btn
                            no-caps
                            outline
                            class="btn-default"
                            :disable="+ID2 === 0"
                            label="Удалить"
                            size="12px"
                            @click="deleteItem"
                    />

                    <q-btn
                            no-caps
                            outline
                            class="btn-default"
                            label="Назад"
                            @click="$router.push(`/organization/${ID}/qr_codes`)"
                            size="12px"
                    />
                </div>
            </div>
        </div>
    </div>

    <q-separator class="separator-color" size="10px"/>

    <q-tabs
            v-model="tab"
            dense
            class="text-black"
            align="center"
            narrow-indicator
    >
        <q-route-tab :to="`/organization/${ID}/qr_codes/${ID2}/main`" name="main" label="Основная информация"/>
        <q-route-tab :disable="+ID2 === 0" :to="`/organization/${ID}/qr_codes/${ID2}/links`" name="links" label="Ссылки qr кода"/>
    </q-tabs>

    <router-view/>
</template>

<style scoped>

</style>