<script setup>
import {ref, inject, watch} from "vue";
import {useRouter} from "vue-router";
import {useStore} from "@/store/store";

const {getMessage, message} = inject('crossMessage');

const store = useStore();
// Профиль
let storeProfile = store.profile;
const roles = storeProfile.role;
// Флаг админа клиента
const isAdmin = roles.some((role) => role.value === 'ROLE_SUPER_ADMIN');
const isPartner = roles.some((role) => role.value === 'ROLE_PARTNER');
const isUser = roles.some((role) => role.value === 'ROLE_USER');

const drawer = ref(false);
const miniState = ref(false);
const router = useRouter();

const items = [
    {
        img: "count",
        activeImg: "count-active",
        text: "Мои реквизиты",
        path: "/requisites",
        roles: ['ROLE_PARTNER']
    },
    {
        img: "organizations",
        activeImg: "organizations-active",
        text: "Клиенты",
        path: "/organization",
        roles: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
    },
    {
        img: "port",
        activeImg: "port-active",
        text: "Юридические лица",
        path: "/legal_entity",
        roles: [
            'ROLE_SUPER_ADMIN',
            'ROLE_ORGANIZATION_ADMIN',
        ]
    },
    {
        img: "users",
        activeImg: "users-active",
        text: "Пользователи",
        path: "/users",
        roles: [
            'ROLE_SUPER_ADMIN',
            'ROLE_ORGANIZATION_ADMIN'
        ]
    },
    {
        img: "card",
        activeImg: "card-active",
        text: "Карты",
        path: "/cards",
        roles: [
            'ROLE_SUPER_ADMIN',
            'ROLE_ORGANIZATION_ADMIN',
            'ROLE_USER',
            'ROLE_PARTNER'
        ]
    },
    {
        img: "qr",
        activeImg: "qr-active",
        text: "QR коды",
        path: "/qr_codes",
        roles: [
            'ROLE_SUPER_ADMIN',
            'ROLE_ORGANIZATION_ADMIN',
            'ROLE_USER',
            'ROLE_PARTNER'
        ]
    },
    {
        img: "tarifs",
        activeImg: "tarifs-active",
        text: "Тарифы",
        path: "/tariffs",
        roles: ['ROLE_SUPER_ADMIN',]
    },
    {
        img: "check",
        activeImg: "check-active",
        text: "Счета",
        path: "/bills",
        roles: [
            'ROLE_SUPER_ADMIN',
            'ROLE_ORGANIZATION_ADMIN',
            'ROLE_PARTNER'
        ]
    },
    {
        img: "partners",
        activeImg: "partners-active",
        text: "Партнёры",
        path: "/partners",
        roles: ['ROLE_SUPER_ADMIN']
    },
    {
        img: "count",
        activeImg: "count-active",
        text: "Взаиморасчеты",
        path: "/settlements",
        roles: ['ROLE_SUPER_ADMIN']
    },
    {
        img: "count",
        activeImg: "count-active",
        text: "Мои расчёты",
        path: "/settlement/incoming",
        roles: ['ROLE_PARTNER']
    },
    // {
    //   img: "count",
    //   activeImg: "count-active",
    //   text: "Ссылки",
    //   path: "/links",
    //   roles: ['ROLE_USER']
    // },
];

const items2 = [
    {
        img: "options",
        activeImg: "options-active",
        text: "Настройки",
        path: "/options",
        roles: [
            'ROLE_SUPER_ADMIN',
        ]
    },
    {
        path: "instruction",
        roles: [
            'ROLE_SUPER_ADMIN',
            'ROLE_ORGANIZATION_ADMIN',
            'ROLE_USER'
        ]
    },
];

const link = ref();
const rolesList = {
    isAdmin: 'https://uprating.org/Spravka',
    isPartner: 'https://uprating.org/PartnersInstruction',
    isUser: 'https://uprating.org/Spravka#:~:' +
        'text=%D0%98%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BA%D1%86%D0%B8%D1%8F%20%D0%BF%D0%BE%20%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%B5%20%D0%B4%D0%BB%D1%8F%20%D1%81%D0%BE%D1%82%D1%80%D1%83%D0%B4%D0%BD%D0%B8%D0%BA%D0%BE%D0%B2%20(%D1%81%D1%82%D0%B0%D1%82%D1%83%D1%81%20%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8C).',
};

if (isPartner) {
    link.value = rolesList.isPartner;
} else if (isUser) {
    link.value = rolesList.isUser;
} else {
    link.value = rolesList.isAdmin
}

watch(message, (msg) => {
    if (Object.prototype.hasOwnProperty.call(msg, 'drawer')) {
        drawer.value = true;
    }
});

function hasPartnerLogo() {
    return storeProfile.organization.partner && storeProfile.organization.partner.logo;
}

function getLogo() {
    if (hasPartnerLogo()) {
        return import.meta.env.VITE_API_URL + '/admin/attachment/download/' + storeProfile.organization.partner.logo.id;
    }

    return '/logo.svg';
}

</script>

<template>
    <q-drawer
            v-model="drawer"
            show-if-above
            :mini="miniState"
            :width="280"
            :mini-width="67"
            :breakpoint="920"
            side="left"
    >
        <q-scroll-area
                style="height: calc(100% - 0px); border-right: 1px solid #ddd"
                :bar-style="{
        borderRadius: '5px',
        background: 'lightgray',
        opacity: 0.5,
        width: '2px',
      }"
                :thumb-style="{
        right: '2px',
        borderRadius: '5px',
        background: '#e2e2e2',
        width: '2px',
        opacity: 1,
      }"
        >
            <q-list>
                <q-item class="q-pa-none q-py-md q-mb-md">
                    <q-btn
                            v-if="hasPartnerLogo()" style="width: 100%"
                            class="q-mx-md"
                            flat
                            @click="miniState = !miniState"
                            dense
                            no-caps
                    >
                        <img style="width: 100%" :src="getLogo()" alt=""/>
                    </q-btn>

                    <template v-else>
                        <q-btn
                                size="25px"
                                flat
                                @click="miniState = !miniState"
                                dense
                                no-caps
                        >
                            <template #default>
                                <img width="40" :src="getLogo()" alt=""/>
                            </template>
                        </q-btn>

                        <template v-if="!miniState">
                            <div class="text-h4 text-bold q-pl-sm q-pt-sm">UpRating</div>
                        </template>
                    </template>
                </q-item>

                <q-list
                        v-for="(item) in items"
                        :key="item.img"
                >
                    <template v-for="userRole in roles">
                        <template v-for="itemRole in item.roles">
                            <template v-if="userRole.value === itemRole">
                                <q-item
                                        active-class="active"
                                        class="rounded-borders q-mx-sm"
                                        :to="item.path"
                                        clickable
                                        v-ripple
                                >
                                    <q-item-section
                                            class="q-pr-none"
                                            :class="!miniState ? 'small-width q-mr-md' : ''"
                                            avatar
                                    >
                                        <template v-if="item.path === router.currentRoute.value.path">
                                            <img width="15" :src="`/${item.activeImg}.svg`"/>
                                        </template>

                                        <template v-else>
                                            <img width="15" :src="`/${item.img}.svg`"/>
                                        </template>
                                    </q-item-section>

                                    <q-item-section>{{ item.text }}</q-item-section>
                                </q-item>
                            </template>
                        </template>
                    </template>
                </q-list>

                <q-separator
                        inset
                        spaced="md"
                />

                <q-list>
                    <q-item
                            v-if="isAdmin"
                            class="rounded-borders q-mx-sm"
                            active-class="active"
                            :to="items2[0].path"
                            clickable
                            v-ripple
                    >
                        <q-item-section
                                class="q-pr-none"
                                :class="!miniState ? 'small-width q-mr-md' : ''"
                                avatar
                        >
                            <template v-if="items2[0].path === router.currentRoute.value.path">
                                <img width="17" height="17" src="/options-active.svg"/>
                            </template>
                            <template v-else>
                                <img width="17" height="17" src="/options.svg"/>
                            </template>
                        </q-item-section>

                        <q-item-section> Настройки</q-item-section>
                    </q-item>

                    <q-item v-if="!miniState">
                        <q-item-section class="text-uppercase text-caption text-grey-5">
                            Поддержка
                        </q-item-section>
                    </q-item>

                    <q-item
                            class="rounded-borders q-mx-sm"
                            :href="link"
                            target="_blank"
                            clickable
                            v-ripple
                    >
                        <q-item-section
                                class="q-pr-none"
                                :class="!miniState ? 'small-width q-mr-md' : ''"
                                avatar
                        >
                            <img width="17" height="17" src="/instruction.svg"/>
                        </q-item-section>

                        <q-item-section> Общая инструкция</q-item-section>
                    </q-item>

                    <q-item
                            v-if="!miniState"
                            class="q-py-none"
                    >
                        <q-item-section>
                            <a
                                    class="text-black"
                                    style="text-decoration: none"
                                    href="mailto:nfcstandart@gmail.com"
                            >
                                nfcstandart@gmail.com
                            </a>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-list>
        </q-scroll-area>
    </q-drawer>
</template>


<style scoped>
.active {
    background-color: #000000;
    color: #ffffff;
}

/* :deep() [data-v-e065371e].q-drawer-container aside {
  width: 100px !important;
} */

:deep() .q-drawer-container .q-drawer--mini {
    width: 70px;
}

.small-width {
    min-width: 0;
}
</style>