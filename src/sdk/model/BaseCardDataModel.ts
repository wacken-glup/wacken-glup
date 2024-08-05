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
        return "https://www.wacken.com/fileadmin/_processed_/5/f/csm_woa_25_bandposter_announcement_240803_fb-page-header_e4c70e6c02.jpg"
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

}