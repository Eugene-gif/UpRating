import Tariffs from "@/modules/Tariffs/views/Tariffs.vue";
import TariffDetail from "@/modules/Tariffs/views/TariffDetail.vue";

export default [
    {
        path: "tariffs",
        name: "tariffs",
        component: Tariffs,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN']
        }
    },
    {
        path: "tariffs/:id",
        name: "tariffs-detail",
        component: TariffDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN']
        }
    },
]