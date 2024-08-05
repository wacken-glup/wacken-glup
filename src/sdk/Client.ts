
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore"
import { reactive, ref, type Reactive } from "vue"

import type Context from "@/Context"
import Container from "./Container"

import WoaEventModelWrapper from "./model/WoaEventModelWrapper"
import WoaBandModelWrapper from "./model/WoaBandModelWrapper"
import type { WoaEvent } from "./model/WoaModels"

import Space from "./model/Space"
import type { UserData } from "./model/UserData"

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

        setTimeout(() => {
            this.ctx.showOfflineButton.value = true
        }, 1500)

        this.ctx.auth.onAuthStateChanged(async (user) => {
            if(user == null) return

            // request user data
            try {
                let userData = await this.getUserData()

                if(this.offline.value == true) return
                this.ctx.showOfflineButton.value = false

                if(ctx.dontAutoCreateSpace !== true) if(userData == undefined || userData.spaceId == undefined) {
                    await this.createSpace()
                    return
                }

                if(userData == undefined) return
                this.space = reactive(new Space(ctx, userData.spaceId, () => { this.leaveSpace() }))
            }catch(e) {
                console.error("error while trying to fetch userdata", e)
                this.activateOfflineMode()
            }
        });
    }

    activateOfflineMode() {
        this.ctx.loaded.value = true

        if(localStorage.getItem("cachedSpace") != null) this.space = reactive(new CachedSpace(this.ctx, localStorage.getItem("cachedSpace")!!).space)
        this.offline.value = true
    }

    /* database stuff */

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

    /* woa data stuff */

    async fetchAll() {
        await this.fetchBands()
        await this.fetchEvents()

        this.container.combinedActs.push(... this.container.events)
        
        let includedArtistUids = this.container.events.flatMap(e => e.data.artists.map(a => a.uid))
        this.container.combinedActs.push(... this.container.bands.filter(b => { return !includedArtistUids.includes(b.data.artist.uid) }))

        this.container.combinedActs.sort((a, b) => {
            return a.cardTitle().localeCompare(b.cardTitle())
        })

        // set loading state
        if(this.ctx.authLoaded.value) {
            this.ctx.loaded.value = true
        }else{
            this.ctx.auth.onAuthStateChanged((_) => {
                this.ctx.loaded.value = true
            })
        }
    }

    async fetchEvents() {
        let festivalDayUids: Number[] = [];
        let stageUids: Number[] = [];

        const eventsComplete = await import("@/assets/data/events-complete.json")

        this.container.events = reactive([])
        for(let event of eventsComplete.default) {
            if(event.festival.uid !== this.ctx.currentFestivalUid) continue

            let model = new WoaEventModelWrapper(event as WoaEvent)
            this.container.events.push(model)

            this.container.eventByUid.value.set(model.uid, model)
            this.container.eventByUidNonRef.set(model.uid, model)

            this.container.actByUid.value.set(model.uid, model)
            this.container.actByUidNonRef.set(model.uid, model)

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

            let festival = event.artists[0]?.assets[0]?.festival
            if(festival != undefined) this.container.festival.value = festival
        }

        this.container.stages.value.sort((a,b) => {
            return parseInt(a.sorting) - parseInt(b.sorting)
        })

        this.container.sortedEvents.push(... this.container.events.sort((a, b) => {
            return a.cardTitle().localeCompare(b.cardTitle())
        }))
    }

    async fetchBands() {
        const bands = await import("@/assets/data/bands.json")

        this.container.events = reactive([])
        for(let band of bands.default) {
            if(band.festival.uid !== this.ctx.currentFestivalUid) continue

            let model = new WoaBandModelWrapper(band as any)
            this.container.bands.push(model)

            this.container.actByUid.value.set(model.uid, model)
            this.container.actByUidNonRef.set(model.uid, model)

            this.container.festival.value = band.festival as any
        }
    }

}