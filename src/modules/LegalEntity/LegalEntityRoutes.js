import LegalEntity from "@/modules/LegalEntity/views/LegalEntity.vue";
import LegalEntityDetail from "@/modules/LegalEntity/views/LegalEntityDetail.vue";

export default [
    {
        path: "legal_entity",
        component: LegalEntity,
        name: "legal_entity",
        meta: {
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN']
        },
    },
    {
        path: "legal_entity/:id",
        component: LegalEntityDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN']
        }
    },
]