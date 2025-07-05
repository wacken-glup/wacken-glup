import type { WoaFestival, Image, Networkuri, WoaPerformance, WoaFestivalDay, WoaStage } from "./WoaModels"

export interface WoaBand {
  artist: WoaBandArtist
  biography: string
  detailLink: string
  externalMediaRatio: string
  externalMediaSource: string
  extraDay: boolean
  festival: WoaFestival
  images: Image[]
  networkuri: Networkuri[]
  performance: WoaPerformance[]
  spotifyalbum: string
  spotifyartist: string
  subtitle: string
  thumbnail: string
  uid: number
}

export interface WoaBandArtist {
  country: WoaBandCountry[]
  events: WoaBandArtistEvent[]
  pathSegment: string
  title: string
  uid: number
}

export interface WoaBandCountry {
  nameLocalized: string
  shortNameDe: string
  shortNameEn: string
  uid: number
}

export interface WoaBandArtistEvent {
  uid: number
}

export interface WoaBandArtist {
  title: string
  uid: number
}