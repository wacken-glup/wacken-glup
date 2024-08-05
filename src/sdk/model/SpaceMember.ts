import type Context from "@/Context";
import type Space from "./Space";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";

export default class SpaceMember {

    private ctx: Context
    space: Space

    id: string
    name: string = ""
    color: string = ""

    suggestions: string[] = []
    likes: string[] = []

    _data: any

    offline: Boolean = false

    constructor(ctx: Context, space: Space, id: string, data: any) {
        this.ctx = ctx
        this.space = space

        this.id = id
        this.parseData(data)
    }

    isOwner() {
        return this.id == this.space.id
    }

    isLiked(id: string) {
        return this.likes.includes(id)
    }

    isSuggested(id: string) {
        return this.suggestions.includes(id)
    }

    toggleLike(id: string) {
        if(this.offline) {
            console.error("cannot execute request: member is cached")
            return
        }

        if(this.isLiked(id)) {
            this.likes = this.likes.filter(v => v !== id)

            this.ctx.client.container.actByUidNonRef.get(id)!!.likerIds
                = this.ctx.client.container.actByUidNonRef.get(id)!!.likerIds.filter(v => v !== this.id)
        }else{
            this.likes.push(id)

            this.ctx.client.container.actByUidNonRef.get(id)
                ?.likerIds.push(this.id)
        }

        this.update()
    }

    toggleSuggested(id: string) {
        if(this.offline) {
            console.error("cannot execute request: member is cached")
            return
        }

        if(this.isSuggested(id)) {
            this.suggestions = this.suggestions.filter(v => v !== id)

            this.ctx.client.container.actByUidNonRef.get(id)!!.suggestorIds
                = this.ctx.client.container.actByUidNonRef.get(id)!!.suggestorIds.filter(v => v !== this.id)
        }else{
            this.suggestions.push(id)

            this.ctx.client.container.actByUidNonRef.get(id)
                ?.suggestorIds.push(this.id)
        }

        this.update()
    }

    calculateTasteMatch(against: SpaceMember): number {
        let combinedThis = [
            ... new Set([
                ... this.likes,
                ... this.suggestions
            ])
        ]

        let combinedAgainst = [
            ... new Set([
                ... (against?.likes || []),
                ... (against?.suggestions || [])
            ])
        ]
    
        let lessInteractions = (combinedThis.length > combinedAgainst.length) ? combinedAgainst : combinedThis
        let moreInteractions = (combinedThis.length > combinedAgainst.length) ? combinedThis : combinedAgainst

        let score = 0
        for(let id of lessInteractions) if(moreInteractions.includes(id)) score ++

        return (score / lessInteractions.length) * 100
    }

    async delete() {
        if(this.offline) {
            console.error("cannot execute request: member is cached")
            return
        }

        try {
            let req = await getDocs(collection(this.ctx.db, "spaces", this.space.id, "users"))
            req.forEach(d => {
                if(d.data().memberId !== this.id) return
                deleteDoc(doc(this.ctx.db, "spaces", this.space.id, "users", d.id))
            })

            await deleteDoc(doc(this.ctx.db, "spaces", this.space.id, "members", this.id))
        }catch(e: any) {
            console.error("error while deleting SpaceMember", e)
        }
    }

    private async update() {
        if(this.offline) {
            console.error("cannot execute request: member is cached")
            return
        }

        try {
            await setDoc(doc(this.ctx.db, "spaces", this.space.id, "members", this.id), {
                name: this.name,
                color: this.color,

                suggestions: this.suggestions,
                likes: this.likes
            })
        }catch(e: any) {
            console.error("error while updating SpaceMember", e)
        }
    }

    parseData(data: any) {
        this.name = data.name
        this.color = data.color

        if(this.ctx.client.container.festival.value?.uid === undefined) {
            this.suggestions = data.suggestions
            this.likes = data.likes    
        }else{
            this.suggestions = data.suggestions?.filter?.((id: string) => (id+"").startsWith(`y${ this.ctx.client.container.festival.value?.uid }`)) || data.suggestions
            this.likes = data.likes?.filter?.((id: string) => (id+"").startsWith(`y${ this.ctx.client.container.festival.value?.uid }`)) || data.likes
        }

        // TODO: add all events to suggestions/likes that contain suggested/liked bands

        this._data = data
    }

}