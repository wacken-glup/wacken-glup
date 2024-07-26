
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore"
import { reactive, ref, type Reactive } from "vue"

import type Context from "@/Context"
import Container from "./Container"

import WoaEventModelWrapper from "./model/WoaEventModelWrapper"
import type { WoaEvent } from "./model/WoaModels"
import Space from "./model/Space"
import type { UserData } from "./model/UserData"

import * as eventsDataArray from "@/assets/data/events-complete.json"
import { CachedSpace } from "./model/CachedSpace"

export default class Client {

    ctx: Context
    container = new Container()

    hasSpace = ref(false)
    space: Reactive<Space> | undefined = undefined

    offline = ref(false)

    constructor(ctx: Context) {
        this.ctx = ctx
        this.ctx.client = this

        this.ctx.auth.onAuthStateChanged(async (user) => {
            if(user == null) return

            // request user data
            try {
                let userData = await this.getUserData()
                if(ctx.dontAutoCreateSpace !== true) if(userData == undefined || userData.spaceId == undefined) {
                    await this.createSpace()
                    return
                }

                if(userData == undefined) return
                this.space = reactive(new Space(ctx, userData.spaceId, () => { this.leaveSpace() }))
            }catch(e) {
                console.error("error while trying to fetch userdata", e)

                if(localStorage.getItem("cachedSpace") != null) this.space = reactive(new CachedSpace(ctx, localStorage.getItem("cachedSpace")!!).space)
                this.offline.value = true
            }
        });
    }

    async setUserData(userData: UserData) {
        await setDoc(doc(this.ctx.db, "users", this.ctx.currentUser.value!!.uid), {
            spaceId: userData.spaceId
        })
    }

    async getUserData(): Promise<UserData | undefined> {
        let res = await getDoc(doc(this.ctx.db, "users", this.ctx.currentUser.value!!.uid))
        let data = res.data()
        if(data == undefined) return undefined

        return { spaceId: data.spaceId }
    }

    async registerUser(spaceId: string, authKey: string) {
        if(this.ctx.currentUser.value == undefined) throw "UNDEFINED_USER"

        await setDoc(doc(this.ctx.db, "spaces", spaceId, "users", this.ctx.currentUser.value!!.uid), {
            authKey: authKey
        })

        await this.setUserData({ spaceId: spaceId })
        setTimeout(() => {
            this.space = reactive(new Space(this.ctx, spaceId, () => { this.leaveSpace() }))
        }, 500)
    }

    async createSpace() {
        if(this.ctx.currentUser.value == undefined) throw "UNDEFINED_USER"
        console.info("creating new space")

        await setDoc(doc(this.ctx.db, "spaces", this.ctx.currentUser.value!!.uid), {
            name: "Our space",
            authKey: ""
        })

        await setDoc(doc(this.ctx.db, "spaces", this.ctx.currentUser.value!!.uid, "members", this.ctx.currentUser.value!!.uid), {
            name: this.ctx.currentUser.value?.displayName || "Admin",
            color: "red",
            likes: [],
            suggestions: []
        })

        await this.setUserData({ spaceId: this.ctx.currentUser.value!!.uid })
        await setDoc(doc(this.ctx.db, "spaces", this.ctx.currentUser.value!!.uid, "users", this.ctx.currentUser.value!!.uid), {
            memberId: this.ctx.currentUser.value!!.uid
        })

        this.space = reactive(new Space(this.ctx, this.ctx.currentUser.value!!.uid, () => { this.leaveSpace() }))
    }

    async leaveSpace() {
        console.info("leaving space, creating new private space ...")

        this.space = undefined
        await this.createSpace()

        window.location.reload()
    }

    async deleteAccount() {
        if(this.ctx.currentUser.value == undefined) return

        console.info("deleting account and data ...")

        await deleteDoc(doc(this.ctx.db, "spaces", this.ctx.currentUser.value!!.uid))
        await deleteDoc(doc(this.ctx.db, "users", this.ctx.currentUser.value!!.uid))

        await this.ctx.currentUser.value?.delete()
    }

    fetchEvents() {
        let festivalDayUids: Number[] = []
        let stageUids: Number[] = []

        this.container.events = reactive([])
        for(let event of (eventsDataArray as any).default) {
            let model = new WoaEventModelWrapper(event as WoaEvent)
            this.container.events.push(model)

            this.container.eventByUid.value.set(model.data.uid, model)
            this.container.eventByUidNonRef.set(model.data.uid, model)

            if(!festivalDayUids.includes(model.data.festivalday.uid)) {
                this.container.days.value.push(model.data.festivalday)
                festivalDayUids.push(model.data.festivalday.uid)   

                this.container.eventsByDayUid.value.set(model.data.festivalday.uid, [])
            }

            if(this.container.eventsByStageUid.value.get(model.data.stage.uid) === undefined) {
                this.container.eventsByStageUid.value.set(model.data.stage.uid, [])
            }

            this.container.eventsByStageUid.value.get(model.data.stage.uid)
                ?.push(model)

            this.container.eventsByDayUid.value.get(model.data.festivalday.uid)
                ?.push(model)

            if(!stageUids.includes(model.data.stage.uid)) {
                this.container.stages.value.push(model.data.stage)
                stageUids.push(model.data.stage.uid)   
            }
        }

        this.container.stages.value.sort((a,b) => {
            return parseInt(a.sorting) - parseInt(b.sorting)
        })

        this.container.sortedEvents.push(... this.container.events.sort((a, b) => {
            return a.cardTitle().localeCompare(b.cardTitle())
        }))
    }

}