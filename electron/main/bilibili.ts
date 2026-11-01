import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'

export class BilibiliApi {
  private headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://www.bilibili.com'
  }

  async search(keyword: string) {
    try {
      const res = await axios.get(
        'https://api.bilibili.com/x/web-interface/search/type',
        {
          params: {
            keyword,
            search_type: 'video',
            order: 'totalrank',
            page: 1,
            pagesize: 10
          },
          headers: this.headers
        }
      )
      return res.data?.data?.result || []
    } catch (error) {
      console.error('Bilibili search error:', error)
      return []
    }
  }

  async getCid(bvid: string) {
    try {
      const res = await axios.get(
        'https://api.bilibili.com/x/web-interface/view',
        {
          params: { bvid },
          headers: this.headers
        }
      )
      return res.data?.data?.cid || null
    } catch (error) {
      console.error('Bilibili get cid error:', error)
      return null
    }
  }

  async getDanmaku(bvid: string) {
    try {
      const cid = await this.getCid(bvid)
      if (!cid) return []

      const res = await axios.get(
        `https://api.bilibili.com/x/v1/dm/list.so?oid=${cid}`,
        {
          headers: this.headers,
          responseType: 'arraybuffer'
        }
      )

      // 解析XML弹幕
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_'
      })
      const xml = Buffer.from(res.data).toString('utf-8')
      const result = parser.parse(xml)

      const dms = result?.i?.d || []
      return dms.map((dm: any) => {
        const attrs = dm['@_']?.p?.split(',') || []
        return {
          time: parseFloat(attrs[0]) || 0,
          mode: parseInt(attrs[1]) || 1,
          color: parseInt(attrs[3]) || 16777215,
          text: typeof dm === 'string' ? dm : dm['#text'] || ''
        }
      }).sort((a: any, b: any) => a.time - b.time)
    } catch (error) {
      console.error('Bilibili danmaku error:', error)
      return []
    }
  }
}
