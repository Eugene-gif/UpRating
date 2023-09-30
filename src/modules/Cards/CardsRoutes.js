import Cards from "@/modules/Cards/views/Cards.vue";
import CardDetail from "@/modules/Cards/views/CardDetail.vue";
import ExtendCardSubscribe from "@/modules/Cards/views/ExtendCardSubscribe.vue";
import CreateReport from "@/modules/Cards/views/CreateReport.vue";
import CreateCardBill from "@/modules/Cards/views/CreateCardBill.vue";
import ReportFromAllCards from "@/modules/Cards/views/ReportFromAllCards.vue";
import CardLinkDetail from "@/modules/Cards/views/DetailTabs/CardLinkDetail.vue";
import CardInformation from "@/modules/Cards/views/DetailTabs/CardInformation.vue";
import CardLinks from "@/modules/Cards/views/DetailTabs/CardLinks.vue";

export default [
    {
        path: "cards",
        name: "cards",
        component: Cards,
        meta: {
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_USER', 'ROLE_PARTNER']
        }
    },
    {
        path: "cards/:id",
        name: "cards-detail",
        component: CardDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_USER', 'ROLE_PARTNER']
        },
        children: [
            {
                path: "main",
                name: "cards-detail-main",
                component: CardInformation,
                meta: {
                    isDetail: true,
                    role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_USER', 'ROLE_PARTNER']
                },
            },
            {
                path: "links",
                name: "cards-detail-links",
                component: CardLinks,
                meta: {
                    isDetail: true,
                    role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_USER', 'ROLE_PARTNER']
                },
            },
        ],
    },
    {
        path: "cards/:id/link/:id2",
        name: "cards-links",
        component: CardLinkDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_USER', 'ROLE_PARTNER']
        }
    },
    {
        path: "cards/:id/extend",
        name: "cards-extend",
        component: ExtendCardSubscribe,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "cards/:id/report",
        name: "cards-report",
        component: CreateReport,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "cards/all_report",
        name: "cards-all-report",
        component: ReportFromAllCards,
        meta: {
            isDetail: true,
            role: ['ROLE_ORGANIZATION_ADMIN']
        }
    },
    {
        path: "cards/new",
        name: "cards-new",
        component: CreateCardBill,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_PARTNER']
        }
    },
]