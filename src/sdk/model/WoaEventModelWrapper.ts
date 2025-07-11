import type { WoaEvent } from "./WoaModels"
import BaseCardDataModel from "./BaseCardDataModel"

export default class WoaEventModelWrapper extends BaseCardDataModel {

    data: WoaEvent

    start: number
    end: number

    constructor(model: WoaEvent) {
        super(`y${model.festival.uid}-event-${model.uid}`)

        this.data = model

        this.start = parseInt(this.data.start)
        this.end = parseInt(this.data.end)
    }

    columnSpan: number = 1

    cardThumbnailUrl() {
        for(let artist of this.data.artists) {
            for(let asset of artist.assets) {
                if(asset.thumbnail == null) continue
                return `https://wacken.com${ asset.thumbnail }`
            }
        }
        
        return "https://www.metal-hammer.de/wp-content/uploads/2024/02/10/10/wacken-2024-725x1024.jpg"
    }

    cardTitle() {
        let internal = () => {
            let artists = this.data.artists.map((v) => { return v.title }).join(", ")
            return artists + ((this.data.title == null) ? " " : ` ${ this.data.title }`)
        }

        this._cardTitle = internal()
        return this._cardTitle
    }

    cardDescription() {
        try {
            return this.data.artists[0].assets[0].biography
        }catch(e) {

        }

        return ""
    }

    isConcert() {
        return this.data.performance.title == "Concert"
    }

    performance() {
        return this.data.performance.title
    }

}