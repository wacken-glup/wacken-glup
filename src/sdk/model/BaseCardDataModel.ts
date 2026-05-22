import { reactive } from "vue"

export default class BaseCardDataModel {
    
    public uid: string
    
    constructor(uid: string) {
        this.uid = uid
    }

    suggestorIds = reactive<string[]>([])
    likerIds = reactive<string[]>([])

    _cardTitle: string = ""

    cardThumbnailUrl() {
        return "https://www.wacken.com/fileadmin/_processed_/7/7/csm_woa_26_bandposter_260508_fb-pageheader_1640x924_f60009192b.jpg"
    }

    cardTitle() {
        return "unknown"
    }

    cardDescription() {
        return "unknown"
    }

    isConcert() {
        return false
    }

    performance() {
        return ""
    }

}