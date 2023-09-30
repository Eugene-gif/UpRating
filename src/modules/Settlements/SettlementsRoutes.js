import Settlements from "@/modules/Settlements/views/Settlements.vue";
import SettlementDetail from "@/modules/Settlements/views/SettlementDetail.vue";

export default [
    {
        path: "settlements",
        name: "settlements",
        component: Settlements,
        meta: {
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "settlements/:id",
        name: "settlements-detail",
        component: SettlementDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
];