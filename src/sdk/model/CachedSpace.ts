import type Context from "@/Context";
import Space from "./Space";
import SpaceMember from "./SpaceMember";

export class CachedSpace {

    ctx: Context
    space: Space

    constructor(ctx: Context, data: Space | string) {
        this.ctx = ctx

        if(data instanceof Space) {
            this.space = data
        }else if(typeof data === "string") {
            // fake space
            let dataJs = JSON.parse(data)

            this.space = new Space(ctx, dataJs.id, () => { }, true)
            this.space.name = dataJs.name
            this.space.authKey = dataJs.authKey

            this.space.self.value = this.createMember(dataJs.self)
            this.space.selfMemberId = dataJs.selfMemberId
            
            for(let memberData of dataJs.members) this.space.members.push(this.createMember(memberData) as any)
            this.space.publishMembersToContainer()

            this.space.loaded.value = true
            this.space.cached.value = true
        }else{
            throw "INVALID_DATA_VALUE"
        }
    }

    serialize(): string {
        return JSON.stringify({
            id: this.space.id,
            name: this.space.name,
            authKey: this.space.authKey,
            self: this.serializeMember(this.space.self.value),
            selfMemberId: this.space.selfMemberId,
            members: this.space.members.map(m => this.serializeMember(m as any))
        })
    }

    private createMember(data: any): SpaceMember | undefined {
        if(data == undefined) return undefined

        let member = new SpaceMember(this.ctx, this.space, data.id, data)
        member.offline = true
        return member
    }

    private serializeMember(member: SpaceMember | undefined): any {
        if(member == undefined) return undefined
        return { id: member.id, ...member._data  }
    }

}