import {createWebHistory, createRouter} from "vue-router";
import {useStore} from '@/store/store.js';

import BaseLayout from "@/layouts/BaseLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";

// Роуты экрана авторизации
import AuthRoutes from "@/components/AuthComponents/AuthRoutes";
// Дочерние роуты
import LegalEntityRoutes from "@/modules/LegalEntity/LegalEntityRoutes";
import CardsRoutes from "@/modules/Cards/CardsRoutes";
import UsersRoutes from "@/modules/Users/UsersRoutes";
import TariffsRoutes from "@/modules/Tariffs/TariffsRoutes";
import BillsRoutes from "@/modules/Bills/BillsRoutes";
import PartnersRoutes from "@/modules/Partners/PartnersRoutes";
import SettlementsRoutes from "@/modules/Settlements/SettlementsRoutes";
import OrganizationsRoutes from "@/modules/Organization/OrganizationsRoutes";
import LinksRoutes from "@/modules/Links/LinksRoutes";
import PartnerSettlementsRoutes from "@/modules/PatrnerSettlements/PartnerSettlementsRoutes";
import OptionsRoutes from "@/modules/Settings/OptionsRoutes";
import RequisitesRoutes from "@/modules/Requisites/RequisitesRoutes";
import QrCodesRoutes from "@/modules/QrCodes/QrCodesRoutes";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "BaseLayout",
            component: BaseLayout,
            redirect: "/organization",
            meta: {
                requiresAuth: true,
            },
            children: [
                ...OrganizationsRoutes,
                ...LegalEntityRoutes,
                ...CardsRoutes,
                ...UsersRoutes,
                ...TariffsRoutes,
                ...BillsRoutes,
                ...PartnersRoutes,
                ...SettlementsRoutes,
                ...LinksRoutes,
                ...OptionsRoutes,
                ...RequisitesRoutes,
                ...PartnerSettlementsRoutes,
                ...QrCodesRoutes
            ],
        },
        {
            path: "/",
            name: "AuthLayout",
            component: AuthLayout,
            redirect: "/login",
            children: [
                ...AuthRoutes,
            ],
        },
        {
            path: "/:pathMath(.*)*",
            redirect: "/cards",
        },
    ],
});

router.beforeEach((to, from, next) => {
    const store = useStore();
    const profile = store.profile;
    const requireAuth = to.matched.some((record) => record.meta.requiresAuth);
    const roles = to.matched.some((record) => record.meta.role);

    function checkRole() {
        let requiredRoles = to.meta.role;

        for (let i = 0; i < requiredRoles.length; i++) {
            const hasRole = profile.role.findIndex((role) => role.value === requiredRoles[i]) !== -1;

            if (hasRole) {
                next();

                return;
            }
        }

        profile.role.forEach((role) => {
           if (role.value === 'ROLE_SUPER_ADMIN') next('/organization');

           if (role.value === 'ROLE_ORGANIZATION_ADMIN') next('/legal_entity');

           if (role.value === 'ROLE_USER') next('/cards');
        });
    }


    if (to.path === '/login' && store.isAuthenticated) {
        next('/');
    }

    if (requireAuth) {
        if (!store.isAuthenticated) {
            next({
                path: '/login',
            });
        } else {
            if (roles) {
                checkRole();
            } else {
                next();
            }
        }
    } else {
        next();
    }

});

export default router;
