import axios from 'axios'

export class NeteaseApi {
  private cookie = ''

  async setCookie(cookie: string) {
    try {
      // 先保存 Cookie
      this.cookie = cookie

      // 尝试获取用户信息（两个 API 备选）
      const userInfo = await this.fetchUserInfo()

      if (userInfo) {
        return {
          success: true,
          nickname: userInfo.nickname,
          avatar: userInfo.avatar
        }
      }

      // Cookie 已保存，但获取用户信息失败（可能未登录或 Cookie 过期）
      // 仍然返回成功，因为 Cookie 可能仍可用于搜索和播放
      return { success: true, nickname: '已登录', avatar: '' }
    } catch (error: any) {
      console.error('Set cookie error:', error)
      // Cookie 已保存，不返回失败
      return { success: true, nickname: '已登录', avatar: '' }
    }
  }

  // 获取用户信息（双 API 备选）
  private async fetchUserInfo(): Promise<{ nickname: string; avatar: string } | null> {
    const apis = [
      'https://music.163.com/api/v1/user/info',
      'https://music.163.com/api/nuser/account/getprofile',
    ]

    for (const url of apis) {
      try {
        const res = await axios.get(url, {
          headers: this.getHeaders(),
          timeout: 8000
        })
        const profile = res.data?.profile
        if (profile) {
          return {
            nickname: profile.nickname || '已登录',
            avatar: profile.avatarUrl || ''
          }
        }
      } catch (e: any) {
        console.log(`User info API failed (${url}):`, e.message)
      }
    }

    return null
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Referer': 'https://music.163.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    if (this.cookie) {
      headers['Cookie'] = `MUSIC_U=${this.cookie}`
    }
    return headers
  }

  async search(keyword: string, limit = 30) {
    try {
      console.log('Searching:', keyword)

      const res = await axios.get(
        `https://music.163.com/api/search/get?s=${encodeURIComponent(keyword)}&type=1&limit=${limit}&offset=0`,
        { headers: this.getHeaders() }
      )

      const songs = res.data?.result?.songs || []
      console.log('Found songs:', songs.length)

      return songs.map((song: any) => ({
        id: song.id,
        name: song.name,
        artists: song.artists || [],
        album: song.album || {},
        duration: song.duration || 0
      }))
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }

  async getSongUrl(id: number) {
    console.log('Getting song URL for ID:', id)

    const apis = [
      async () => {
        const res = await axios.get(
          `https://music.163.com/api/song/enhance/player/url?id=${id}&br=320000`,
          { headers: this.getHeaders(), timeout: 5000 }
        )
        return res.data?.data?.[0]?.url
      },
      async () => {
        const res = await axios.get(
          `https://music.163.com/api/song/enhance/player/url/v1?id=${id}&br=320000`,
          { headers: this.getHeaders(), timeout: 5000 }
        )
        return res.data?.data?.[0]?.url
      },
      async () => {
        const res = await axios.get(
          `https://music.163.com/api/song/enhance/player/url?id=${id}&br=128000`,
          { headers: this.getHeaders(), timeout: 5000 }
        )
        return res.data?.data?.[0]?.url
      },
      async () => {
        const res = await axios.get(
          `https://api.injahow.cn/meting/?type=song&source=netease&id=${id}`,
          { timeout: 5000 }
        )
        return res.data?.url
      }
    ]

    for (let i = 0; i < apis.length; i++) {
      try {
        console.log(`Trying API ${i + 1}...`)
        const url = await apis[i]()
        if (url) {
          console.log(`Got URL from API ${i + 1}`)
          return url
        }
        console.log(`API ${i + 1} returned null`)
      } catch (e: any) {
        console.log(`API ${i + 1} failed:`, e.message)
      }
    }

    console.log('All APIs failed for song:', id)
    return null
  }

  async getSongDetail(id: number) {
    try {
      const res = await axios.get(
        `https://music.163.com/api/song/detail?id=${id}&ids=[${id}]`,
        { headers: this.getHeaders() }
      )
      return res.data?.songs?.[0] || null
    } catch (error) {
      console.error('Get song detail error:', error)
      return null
    }
  }

  async getLyric(id: number) {
    try {
      const res = await axios.get(
        `https://music.163.com/api/song/lyric?id=${id}&lv=1&kv=1&tv=-1`,
        { headers: this.getHeaders() }
      )
      return {
        lrc: res.data?.lrc?.lyric || '',
        tlyric: res.data?.tlyric?.lyric || ''
      }
    } catch (error) {
      console.error('Get lyric error:', error)
      return { lrc: '', tlyric: '' }
    }
  }

  async getUserInfo() {
    if (!this.cookie) return null
    return await this.fetchUserInfo()
  }
}
