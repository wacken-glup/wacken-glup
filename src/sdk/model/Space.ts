import type Context from "@/Context";
import { getDoc, doc, collection, getDocs, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { reactive, ref } from "vue";
import SpaceMember from "./SpaceMember";

export default class Space {

    private ctx: Context

    id: string
    name = ""
    authKey = ""

    onLeave: () => void

    selfMemberId: string | undefined = undefined

    self = ref<SpaceMember>()
    members = reactive<SpaceMember[]>([])

    loaded = ref<Boolean>(false)

    constructor(
        ctx: Context, 
        spaceId: string,
        onLeave: () => void
    ) {
        this.ctx = ctx
        this.id = spaceId

        this.onLeave = onLeave

        this.init()
    }

    generateInvite($t: any): {
        title: string,
        text: string,
        url: string
    } {
        const params = new URLSearchParams({
            space: this.id,
            key: this.authKey,
            
            name: this.name,
            host: this.self.value?.name || this.ctx.auth.currentUser?.displayName || ""
        })

        return {
            title: $t("brand.name"),
            text: $t("brand.share.invite"),
            url: `${ window.location.origin }/join?${ params.toString() }`,
        }
    }

    getLikersForId(id: number, ignoreSelf: Boolean = false): SpaceMember[] {
        return (this.members || []).filter(
            m => m.likes.includes(id) && (!ignoreSelf || m.id != this.self.value?.id)
        ) as any
    }

    getSuggestorsForId(id: number, ignoreSelf: Boolean = false): SpaceMember[] {
        return (this.members || []).filter(
            m => m.suggestions.includes(id) && (!ignoreSelf || m.id != this.self.value?.id)
        ) as any
    }

    async updateName(name: string) {
        try {
            await updateDoc(doc(this.ctx.db, "spaces", this.id), {
                name: name
            })
        }catch(e: any) {
            console.error("error while updating space name", e)
        }
    }

    async resetInvite() {
        try {
            await updateDoc(doc(this.ctx.db, "spaces", this.id), {
                authKey: window.crypto.randomUUID()
            })
        }catch(e: any) {
            console.error("error while resetting invite key", e)
        }
    }

    async setMemberId(userId: string, memberId: string) {
        await setDoc(doc(this.ctx.db, "spaces", this.id, "users", userId), {
            memberId: memberId
        })

        this.selfMemberId = memberId
        this.findSelf()
    }

    async createMember(name: string, color: string): Promise<string> {
        let id = window.crypto.randomUUID()

        await setDoc(doc(this.ctx.db, "spaces", this.id, "members", id), {
            name: name,
            color: color,
            likes: [],
            suggestions: []
        })

        return id
    }

    private async init() {
        try {
            let info = await getDoc(doc(this.ctx.db, "spaces", this.id))
            
            let data = info.data()
            if(data == undefined) throw "DATA_UNDEFINED_ERROR"

            this.parseData(data)
            this.listenMembers()

            let userDataReq = await getDoc(doc(this.ctx.db, "spaces", this.id, "users", this.ctx.currentUser.value!!.uid))
            let userData = userDataReq.data()
            if(userData != undefined) {
                this.selfMemberId = userData.memberId
                this.findSelf()
            }

            // listening for space changes
            onSnapshot(doc(this.ctx.db, "spaces", this.id), (data) => {
                if(data.data() === undefined) return
                this.parseData(data.data())
            })

            if(this.authKey.length < 3) this.resetInvite()
        }catch(e: any) {
            if(e.code === "permission-denied") {
                this.onLeave()
                console.error("leaving space due to permission-denied error")
            }

            console.error("could not fetch space info", e)
        }

        console.dir(this)
    }

    private findSelf() {
        if(this.selfMemberId == undefined) return

        try {
            this.self.value = this.members.find(m => m.id == this.selfMemberId) as any
        }catch(e) {
            console.error(e)
        }
    }

    private async listenMembers() {
        let query = collection(this.ctx.db, "spaces", this.id, "members")
        onSnapshot(query, (users) => {
            console.info("users collection updated", users.size)

            this.members = []
            users.forEach(u => {
                this.members.push(new SpaceMember(
                    this.ctx, this, u.id, u.data()
                ) as any)
            })

            this.findSelf()

            this.members = this.members.filter(
                m => m.name != undefined && m.color != undefined && m.likes != undefined && m.suggestions != undefined
            )  

            this.members.forEach(m => {
                this.ctx.client.container.spaceMemberById.set(m.id, m)
            })

            for(let event of this.ctx.client.container.events) {
                event.suggestorIds = this.members.filter(m => m.suggestions.includes(event.data.uid)).map(m => m.id)
                event.likerIds = this.members.filter(m => m.likes.includes(event.data.uid)).map(m => m.id)
            }

            this.loaded.value = true
        })
    }

    private parseData(data: any) {
        this.name = data.name
        this.authKey = data.authKey
    }

}