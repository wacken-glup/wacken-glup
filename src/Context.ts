import type { FirebaseApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { getAuth, type Auth, type User } from "firebase/auth";

import { ref } from "vue";
import delay from "delay";

import type Client from "./sdk/Client";

export default class Context {

    client: Client = undefined as any

    db: Firestore
    auth: Auth
    
    dontAutoCreateSpace: Boolean = false

    currentUser = ref<User>()

    darkMode = ref<Boolean>(true)
    systemDarkMode = ref<Boolean>(true)

    loaded = ref<Boolean>(false)

    constructor(fbApp: FirebaseApp) {
        this.auth = getAuth(fbApp)
        this.db = getFirestore(fbApp)

        /* update user state */
        this.auth.onAuthStateChanged(async (user) => {
            this.currentUser.value = user || undefined

            await delay(50)
            this.loaded.value = true
        });
    }

}