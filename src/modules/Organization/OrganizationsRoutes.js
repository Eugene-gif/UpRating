import Organization from "@/modules/Organization/views/Organization.vue";
import OrganizationDetail from "@/modules/Organization/views/OrganizationDetail.vue";
import RegisterReport from "@/modules/Organization/views/RegisterReport.vue";
import OrganizationCreateForm from "@/modules/Organization/views/OrganizationCreateForm.vue";
import OrganizationTabsRoutes from "@/modules/Organization/views/Tabs/OrganizationTabsRoutes";
import OrganizationLegalEntityDetail
    from "@/modules/Organization/views/Tabs/organizationLegalEntity/OrganizationLegalEntityDetail.vue";
import OrganizationUserDetail from "@/modules/Organization/views/Tabs/organizationUsers/OrganizationUserDetail.vue";
import OrganizationCardDetail from "@/modules/Organization/views/Tabs/organizationCards/organizationCardDetail.vue";
import OrganizationNewCard from "@/modules/Organization/views/Tabs/organizationBills/organizationNewCard.vue";
import OrganizationBillDetail from "@/modules/Organization/views/Tabs/organizationBills/organizationBillDetail.vue";
import OrganizationBillEdit from "@/modules/Organization/views/Tabs/organizationBills/organizationBillEdit.vue";
import OrganizationExtendCardSubscribe
    from "@/modules/Organization/views/Tabs/organizationCards/OrganizationExtendCardSubscribe.vue";
import OrganizationCreateReport from "@/modules/Organization/views/Tabs/organizationCards/OrganizationCreateReport.vue";
import OrganizationReportCard from "@/modules/Organization/views/Tabs/organizationCards/OrganizationReportCard.vue";
import OrganizationCardLinkDetail
    from "@/modules/Organization/views/Tabs/organizationCards/Tabs/OrganizationCardLinkDetail.vue";
import CardInformation from "@/modules/Organization/views/Tabs/organizationCards/Tabs/CardInformation.vue";
import OrganizationCardLinks from "@/modules/Organization/views/Tabs/organizationCards/Tabs/OrganizationCardLinks.vue";
import OrganizationQrCodeDetail
    from "@/modules/Organization/views/Tabs/organizationQrCodes/OrganizationQrCodeDetail.vue";
import OrganizationQrCodeInformation
    from "@/modules/Organization/views/Tabs/organizationQrCodes/OrganizationQrCodeInformation.vue";
import OrganizationQrCodeLinks from "@/modules/Organization/views/Tabs/organizationQrCodes/OrganizationQrCodeLinks.vue";
import OrganizationQrCreateReport
    from "@/modules/Organization/views/Tabs/organizationQrCodes/OrganizationQrCreateReport.vue";
import OrganizationReportQr from "@/modules/Organization/views/Tabs/organizationQrCodes/OrganizationReportQr.vue";
import OrganizationQrLinkDetail
    from "@/modules/Organization/views/Tabs/organizationQrCodes/OrganizationQrLinkDetail.vue";

export default [
    {
        path: "/organization",
        name: "organization",
        component: Organization,
        meta: {
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/create",
        name: "organization-create",
        component: OrganizationCreateForm,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id",
        name: "organization-detail",
        component: OrganizationDetail,
        children: [
            ...OrganizationTabsRoutes,
        ],
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/report",
        name: "organization-report",
        component: RegisterReport,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/legal_entity/:id2",
        name: "organization-legal-entity-detail",
        component: OrganizationLegalEntityDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/user/:id2",
        name: "organization-user-detail",
        component: OrganizationUserDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/card/:id2",
        name: "organization-card-detail",
        component: OrganizationCardDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        },
        children: [
            {
                path: "main",
                name: "organization-card-detail-main",
                component: CardInformation,
                meta: {
                    isDetail: true,
                    role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
                },
            },
            {
                path: "links",
                name: "organization-card-detail-links",
                component: OrganizationCardLinks,
                meta: {
                    isDetail: true,
                    role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
                },
            }
        ],
    },
    {
        path: "/organization/:id/qr_codes/:id2",
        name: "organization-qr-code-detail",
        component: OrganizationQrCodeDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        },
        children: [
            {
                path: "main",
                name: "organization-qr-code-detail-main",
                component: OrganizationQrCodeInformation,
                meta: {
                    isDetail: true,
                    role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
                },
            },
            {
                path: "links",
                name: "organization-qr-code-detail-links",
                component: OrganizationQrCodeLinks,
                meta: {
                    isDetail: true,
                    role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
                },
            }
        ],
    },
    {
        path: "/organization/:id/qr_codes/:id2/report",
        name: "organization-qr-code-report",
        component: OrganizationQrCreateReport,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/qr_codes/org_report",
        name: "organization-qr-codes-org-report",
        component: OrganizationReportQr,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/qr_codes/:id2/link/:id3",
        name: "organization-qr-code-link-detail",
        component: OrganizationQrLinkDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/qr_codes/:id2/extend",
        name: "organization-card-subscribe",
        component: OrganizationExtendCardSubscribe,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/card/:id2/link/:id3",
        name: "organization-card-link-detail",
        component: OrganizationCardLinkDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/card/:id2/extend",
        name: "organization-card-subscribe",
        component: OrganizationExtendCardSubscribe,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/card/:id2/report",
        name: "organization-card-report",
        component: OrganizationCreateReport,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/card/org_report",
        name: "organization-card-org-report",
        component: OrganizationReportCard,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/bill/:id2",
        name: "organization-bill-detail",
        component: OrganizationBillDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/bill/card",
        name: "organization-bill-card",
        component: OrganizationNewCard,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "/organization/:id/bill/:id2/edit",
        name: "organization-bill-edit",
        component: OrganizationBillEdit,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
]