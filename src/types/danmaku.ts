export interface Danmaku {
  time: number
  text: string
  color: string
  source: DanmakuSource
}

export enum DanmakuSource {
  MV = 'mv',
  REACTION = 'reaction',
  HOT_COMMENT = 'hot_comment'
}

export interface BilibiliVideo {
  bvid: string
  title: string
  author: string
  play: number
  duration: string
  pic: string
}
