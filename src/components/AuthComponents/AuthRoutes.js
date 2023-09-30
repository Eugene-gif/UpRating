import AuthComponent from "@/components/AuthComponents/views/AuthComponent.vue";
import RegisterComponent from "@/components/AuthComponents/views/RegisterComponent.vue";
import ResetComponent from "@/components/AuthComponents/views/ResetComponent.vue";
import ConfirmComponent from "@/components/AuthComponents/views/ConfirmComponent.vue";

export default [
    {
        path: "login",
        name: "login",
        component: AuthComponent,
    },
    {
        path: "register",
        name: "register",
        component: RegisterComponent,
    },
    {
        path: "reset",
        name: "reset",
        component: ResetComponent,
    },
    {
        path: "confirm",
        name: "confirm",
        component: ConfirmComponent,
    },
];