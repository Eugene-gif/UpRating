import Partners from "@/modules/Partners/views/Partners.vue";
import PartnerDetail from "@/modules/Partners/views/PartnerDetail.vue";
import MainInformation from "@/modules/Partners/views/DetailTabs/MainInformation.vue";
import Settlements from "@/modules/Partners/views/DetailTabs/Settlements.vue";
import Clients from "@/modules/Partners/views/DetailTabs/Clients.vue";
import Users from "@/modules/Partners/views/DetailTabs/Users/Users.vue";
import PartnerUserDetail from "@/modules/Partners/views/DetailTabs/Users/PartnerUserDetail.vue";

export default [
    {
        path: "partners",
        name: "partners",
        component: Partners,
        meta: {
            breadCrumbs: [
                {
                    title: 'Партнёры',
                    path: '/partners',
                },
            ],
            role: ['ROLE_SUPER_ADMIN']
        }
    },
    {
        path: "partners/:id",
        name: "partners-detail",
        component: PartnerDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN']
        },
        children: [
            {
                path: "main",
                name: "partners-detail-main",
                component: MainInformation,
                meta: {
                    isDetail: true,
                    role: ['ROLE_SUPER_ADMIN']
                },
            },
            {
                path: "clients",
                name: "partners-detail-clients",
                component: Clients,
                meta: {
                    isDetail: true,
                    role: ['ROLE_SUPER_ADMIN']
                },
            },
            {
                path: "settlements",
                name: "partners-detail-settlements",
                component: Settlements,
                meta: {
                    isDetail: true,
                    role: ['ROLE_SUPER_ADMIN']
                },
            },
            {
                path: "users",
                name: "partners-detail-users",
                component: Users,
                meta: {
                    isDetail: true,
                    role: ['ROLE_SUPER_ADMIN']
                },
            },
        ],
    },
    {
        path: "partners/:id/users/:id2",
        name: "partners-detail-users-detail",
        component: PartnerUserDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN']
        },
    }
]