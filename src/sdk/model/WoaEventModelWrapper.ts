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
                if(!asset.thumbnail) continue 
                return `https://wacken.com${ asset.thumbnail }`
            }
        }
        
        return "https://www.wacken.com/fileadmin/_processed_/7/7/csm_woa_26_bandposter_260508_fb-pageheader_1640x924_f60009192b.jpg"
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