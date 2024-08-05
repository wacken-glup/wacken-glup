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
  events: Event[]
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

export interface WoaBandEvent {
  artists: WoaBandArtist[]
  end: string
  festival: any
  festivalday: WoaFestivalDay
  images: any
  media: any
  performance: Performance
  stage: WoaStage
  start: string
  subtitle: string
  sysLanguageUid: string
  teaser: string
  title: string
  uid: number
}

export interface WoaBandArtist {
  title: string
  uid: number
}