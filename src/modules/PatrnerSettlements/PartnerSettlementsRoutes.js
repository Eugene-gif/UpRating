import PartnerSettlements from "@/modules/PatrnerSettlements/PartnerSettlements.vue";
import Incoming from "@/modules/PatrnerSettlements/Tabs/Incoming.vue";
import AllSettlements from "@/modules/PatrnerSettlements/Tabs/AllSettlements.vue";

export default [
    {
        path: "settlement",
        name: "settlement",
        redirect: 'settlement/incoming',
        component: PartnerSettlements,
        meta: {
            breadCrumbs: [
                {
                    title: 'Расчёты',
                    path: '/settlement',
                },
            ],
            isDetail: true,
            role: ['ROLE_PARTNER']
        },
        children: [
            {
                path: "incoming",
                name: "settlement-incoming",
                component: Incoming,
                meta: {
                    breadCrumbs: [
                        {
                            title: 'Расчёты',
                            path: '/settlement',
                        },
                    ],
                    isDetail: true,
                    role: ['ROLE_PARTNER']
                }
            },
            {
                path: "settlements",
                name: "settlement-all",
                component: AllSettlements,
                meta: {
                    breadCrumbs: [
                        {
                            title: 'Расчёты',
                            path: '/settlement',
                        },
                    ],
                    isDetail: true,
                    role: ['ROLE_PARTNER']
                }
            },
        ],
    },
];