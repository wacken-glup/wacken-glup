export interface WoaEvent {
  artists: WoaArtist[]
  end: string
  festival: Festival
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

export interface WoaArtist {
  assets: Asset[]
  country: Country[]
  pathSegment: string
  title: string
  uid: number
}

export interface Asset {
  artist: WoaAssetArtist
  biography: string
  detailLink: string
  externalMediaRatio: string
  externalMediaSource: string
  extraDay: boolean
  festival?: Festival
  firsttime: boolean
  images: Image[]
  networkuri: Networkuri[]
  pid: number
  spotifyalbum: string
  spotifyartist: string
  subtitle: string
  thumbnail: string
  uid: number
}

export interface WoaAssetArtist {
  origUid: any
  pathSegment: string
  pid: number
  title: string
  uid: number
}

export interface Festival {
  runningOrderActive: boolean
  title: string
  uid: number
}

export interface Image {
  originalResource: OriginalResource
}

export interface OriginalResource {
  alternative: string
  description: string
  name: string
  publicUrl: string
  title: string
  type: number
  uid: number
}

export interface Networkuri {
  socialnetwork?: Socialnetwork
  uid: number
  uri: string
}

export interface Socialnetwork {
  title: string
  uid: number
}

export interface Country {
  nameLocalized: string
  uid: number
}

export interface WoaFestivalDay {
  end: string
  start: string
  title: string
  uid: number
}

export interface Performance {
  title: string
  uid: number
}

export interface WoaStage {
  description: string
  latitude: string
  longitude: string
  pid: number
  sorting: string
  subtitle: string
  title: string
  uid: number
}