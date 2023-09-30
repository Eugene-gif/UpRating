import QrCodes from "@/modules/QrCodes/views/QrCodes.vue";
import CardInformation from "@/modules/Cards/views/DetailTabs/CardInformation.vue";
import QrCodeDetail from "@/modules/QrCodes/views/QrCodeDetail.vue";
import QrCodeInformation from "@/modules/QrCodes/views/DetailTabs/QrCodeInformation.vue";
import CreateCardBill from "@/modules/Cards/views/CreateCardBill.vue";
import CreateQrCodeBill from "@/modules/QrCodes/views/CreateQrCodeBill.vue";
import CardLinkDetail from "@/modules/Cards/views/DetailTabs/CardLinkDetail.vue";
import CardLinks from "@/modules/Cards/views/DetailTabs/CardLinks.vue";
import QrCodeLinks from "@/modules/QrCodes/views/DetailTabs/QrCodeLinks.vue";
import QrCodeLinkDetail from "@/modules/QrCodes/views/DetailTabs/QrCodeLinkDetail.vue";
import CreateReport from "@/modules/Cards/views/CreateReport.vue";
import ReportFromAllCards from "@/modules/Cards/views/ReportFromAllCards.vue";
import QrCodeReport from "@/modules/QrCodes/views/DetailTabs/QrCodeReport.vue";
import ReportFromAllQrCodes from "@/modules/QrCodes/views/DetailTabs/ReportFromAllQrCodes.vue";
import ExtendCardSubscribe from "@/modules/Cards/views/ExtendCardSubscribe.vue";
import ExtendQrCodeSubscribe from "@/modules/QrCodes/views/ExtendQrCodeSubscribe.vue";

export default [
    {
        path: "qr_codes",
        name: "qr-codes",
        component: QrCodes,
        meta: {
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_USER', 'ROLE_PARTNER']
        }
    },
    {
        path: "qr_codes/:id",
        name: "qr-code-detail",
        component: QrCodeDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_USER', 'ROLE_PARTNER']
        },
        children: [
            {
                path: "main",
                name: "qr-code-detail-main",
                component: QrCodeInformation,
                meta: {
                    isDetail: true,
                    role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_USER', 'ROLE_PARTNER']
                },
            },
            {
                path: "links",
                name: "qr-code-detail-links",
                component: QrCodeLinks,
                meta: {
                    isDetail: true,
                    role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_USER', 'ROLE_PARTNER']
                },
            },
        ]
    },
    {
        path: "qr_codes/:id/report",
        name: "qr-code-report",
        component: QrCodeReport,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "qr_codes/all_report",
        name: "qr-codes-all-report",
        component: ReportFromAllQrCodes,
        meta: {
            isDetail: true,
            role: ['ROLE_ORGANIZATION_ADMIN']
        }
    },
    {
        path: "qr_codes/:id/link/:id2",
        name: "qr-code-links",
        component: QrCodeLinkDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_USER', 'ROLE_PARTNER']
        }
    },
    {
        path: "qr_codes/new",
        name: "qr-codes-new",
        component: CreateQrCodeBill,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "qr_codes/:id/extend",
        name: "qr-code-extend",
        component: ExtendQrCodeSubscribe,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_PARTNER']
        }
    },
]