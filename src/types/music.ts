export interface Song {
  id: number
  name: string
  artists: Artist[]
  album: Album
  duration: number
  url?: string
}

export interface Artist {
  id: number
  name: string
}

export interface Album {
  id: number
  name: string
  picUrl: string
}

export interface LyricLine {
  time: number
  text: string
}

export interface Playlist {
  id: number
  name: string
  songs: Song[]
}
