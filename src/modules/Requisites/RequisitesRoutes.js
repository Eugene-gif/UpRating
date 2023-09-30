import Requisites from "@/modules/Requisites/Requisites.vue";

export default [
    {
        path: "requisites",
        name: "requisites",
        component: Requisites,
        meta: {
            breadCrumbs: [
                {
                    title: 'Реквизиты',
                    path: '/requisites',
                },
            ],
            isDetail: true,
            role: ['ROLE_PARTNER']
        }
    },
];