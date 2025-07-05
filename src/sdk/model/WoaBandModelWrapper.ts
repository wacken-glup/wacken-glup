import type { WoaBand } from "./WoaBandModels"

import BaseCardDataModel from "./BaseCardDataModel"

export default class WoaBandModelWrapper extends BaseCardDataModel {

    data: WoaBand

    constructor(model: WoaBand) {
        super(`y${model.festival.uid}-band-${model.uid}`)
        this.data = model
    }

    cardThumbnailUrl() {
        return `https://wacken.com${ this.data.thumbnail }`
    }

    cardTitle() {
        this._cardTitle = this.data.artist.title
        return this.data.artist.title
    }

    cardDescription() {
        return this.data.biography
    }

    isConcert() {
        return true
    }

    performance() {
        return this.data.performance[0].title
    }

}