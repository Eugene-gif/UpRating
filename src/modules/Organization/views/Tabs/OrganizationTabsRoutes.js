import OrganizationLegalEntityDetail
    from "@/modules/Organization/views/Tabs/organizationLegalEntity/OrganizationLegalEntityDetail.vue";
import OrganizationLegalEntity from "@/modules/Organization/views/Tabs/organizationLegalEntity/OrganizationLegalEntity.vue";

// Детальные страницы
import OrganizationUserDetail from "@/modules/Organization/views/Tabs/organizationUsers/OrganizationUserDetail.vue";
import OrganizationCardDetail from "@/modules/Organization/views/Tabs/organizationCards/organizationCardDetail.vue";
import OrganizationBillDetail from "@/modules/Organization/views/Tabs/organizationBills/organizationBillDetail.vue";
import OrganizationBillEdit from "@/modules/Organization/views/Tabs/organizationBills/organizationBillEdit.vue";
import OrganizationNewCard from "@/modules/Organization/views/Tabs/organizationBills/organizationNewCard.vue";
import MainInformation from "@/modules/Organization/views/Tabs/MainInformation.vue";
import OrganizationUsers from "@/modules/Organization/views/Tabs/organizationUsers/OrganizationUsers.vue";
import OrganizationCards from "@/modules/Organization/views/Tabs/organizationCards/OrganizationCards.vue";
import OrganizationBills from "@/modules/Organization/views/Tabs/organizationBills/OrganizationBills.vue";
import OrganizationQrCodes from "@/modules/Organization/views/Tabs/organizationQrCodes/OrganizationQrCodes.vue";

export default [
    {
        path: "main",
        name: "organization-main",
        component: MainInformation,
        meta: {
            isDetail: true,
        }
    },
    {
        path: "legal_entity",
        name: "organization-legal-entity",
        component: OrganizationLegalEntity,
        meta: {
            isDetail: true,
        }
    },
    {
        path: "/organization/:id/user",
        name: "organization-user",
        component: OrganizationUsers,
        meta: {
            isDetail: true,
        }
    },
    {
        path: "/organization/:id/card",
        name: "organization-card",
        component: OrganizationCards,
        meta: {
            isDetail: true,
        }
    },
    {
        path: "/organization/:id/qr_codes",
        name: "organization-qr-codes",
        component: OrganizationQrCodes,
        meta: {
            isDetail: true,
        }
    },
    {
        path: "/organization/:id/bill",
        name: "organization-bill",
        component: OrganizationBills,
        meta: {

            isDetail: true,
        }
    },

];