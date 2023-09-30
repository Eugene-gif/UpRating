import Bills from "@/modules/Bills/views/Bills.vue";
import BillEdit from "@/modules/Bills/views/BillEdit.vue";
import BillDetail from "@/modules/Bills/views/BillDetail.vue";
import NewCard from "@/modules/Bills/views/NewCard.vue";
import ExtendSubscribe from "@/modules/Bills/views/ExtendSubscribe.vue";
import QrCode from "@/modules/Bills/views/QrCode.vue";
import ExtendQRSubscribe from "@/modules/Bills/views/ExtendQRSubscribe.vue";

export  default [
    {
        path: "bills",
        name: "bills",
        component: Bills,
        meta: {
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "bills/:id",
        name: "bills-detail",
        component: BillDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "bills/:id/edit",
        name: "bills-detail-edit",
        component: BillEdit,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "bills/subscribe",
        name: "bills-subscribe",
        component: ExtendSubscribe,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "bills/subscribe_qr",
        name: "bills-subscribe-qr",
        component: ExtendQRSubscribe,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "bills/cards",
        name: "bills-cards",
        component: NewCard,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_PARTNER']
        }
    },
    {
        path: "bills/:id/qr",
        name: "bills-code",
        component: QrCode,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN', 'ROLE_PARTNER']
        }
    },
];