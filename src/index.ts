import crypto from 'crypto';
import { ENDPOINTS } from './constants';
import { request, LogLevel } from './client';
export { LogLevel };
import {
  cleanSong,
  cleanPlaylist,
  parseLyrics,
  Song,
  Playlist,
  UserProfile,
  UserPlaylist,
  HomeSection,
  LyricsData,
  SearchSongsResult,
  SearchPlaylistsResult,
  SearchAlbumsResult,
  ArtistSearchResult,
  VideoSearchResult,
  UnifiedSearchResult,
  SimilarSongsResult,
  SearchLyricsResult,
  NotificationItem,
  TopicCategory,
  TopicCategoryDetailSection
} from './utils';

export interface NhacCuaTuiConfig {
  token?: string | null;
  logLevel?: LogLevel;
}

export class NhacCuaTui {
  public token: string | null;
  public logLevel: LogLevel;

  /**
   * @param {NhacCuaTuiConfig} [config] 
   */
  constructor(config: NhacCuaTuiConfig = {}) {
    this.token = config.token || null;
    this.logLevel = config.logLevel || 'none';
  }

  /**
   * Internal request wrapper that automatically attaches the authentication token if set
   */
  private async _request(
    path: string,
    params: Record<string, any> = {},
    method: string = 'GET',
    body: any = null,
    contentType: string | null = null
  ): Promise<any> {
    const customHeaders: Record<string, string> = {};
    if (this.token) {
      customHeaders['x-token'] = this.token;
    }
    if (contentType) {
      customHeaders['Content-Type'] = contentType;
    }
    return request(path, params, customHeaders, method, body, this.logLevel);
  }

  /**
   * Authenticate NhacCuaTui account and store JWT session token
   * @param {string} account Email or phone number
   * @param {string} password Account password
   * @returns {Promise<UserProfile>} Logged-in user profile details
   */
  public async login(account: string, password: string): Promise<UserProfile> {
    if (!account || !password) throw new Error('Account and password are required');
    const pwdHash = crypto.createHash('md5').update(password).digest('hex');

    const body = new URLSearchParams({
      phone: '',
      countryCode: '',
      account,
      pwd: pwdHash,
      source: 'other'
    });

    const data = await this._request(
      ENDPOINTS.LOGIN,
      {},
      'POST',
      body.toString(),
      'application/x-www-form-urlencoded'
    );

    if (data && data.accessToken) {
      this.token = data.accessToken.jwtToken;
    }
    return data;
  }

  /**
   * Fetch logged-in user's cloud playlists (requires authentication)
   * @param {number} [page=0]
   * @param {number} [size=999]
   * @returns {Promise<UserPlaylist[]>} List of user playlists
   */
  public async getUserPlaylists(page: number = 0, size: number = 999): Promise<UserPlaylist[]> {
    if (!this.token) throw new Error('Authentication required to get user playlists. Call login() first.');
    
    let uid = '0';
    try {
      const payload = JSON.parse(Buffer.from(this.token.split('.')[1], 'base64').toString('utf8'));
      uid = payload.userId || '0';
    } catch (e) {}

    const data = await this._request(ENDPOINTS.USER_PLAYLISTS, {
      uid,
      pn: page,
      rn: size
    });
    
    if (!data || !data.listPlaylist) return [];
    
    return data.listPlaylist.map((p: any) => ({
      key: p.key || '',
      name: p.name || '',
      thumbnail: p.image || '',
      songCount: p.totalSong || 0,
      isPublic: !!p.pub,
      userId: p.userId || null
    }));
  }

  /**
   * Fetch home page sections (hot songs, albums, playlists)
   * @returns {Promise<HomeSection[]>}
   */
  public async getHome(): Promise<HomeSection[]> {
    const data = await this._request(ENDPOINTS.HOME);
    if (!data || !data.list) return [];
    
    return data.list.map((section: any) => ({
      key: section.key || '',
      title: section.title || '',
      showType: section.showType || '',
      viewMore: !!section.viewMore,
      items: (section.child || section.child_v3 || []).map((item: any) => {
        if (item.type === 'song') return cleanSong(item);
        if (item.type === 'playlist') {
          return {
            key: item.key || '',
            name: item.name || '',
            thumbnail: item.image || '',
            type: 'playlist'
          };
        }
        return item;
      })
    }));
  }

  /**
   * Fetch song detail including direct stream links
   * @param {string} songKey 
   * @returns {Promise<Song | null>}
   */
  public async getSongDetail(songKey: string): Promise<Song | null> {
    if (!songKey) throw new Error('songKey is required');
    const data = await this._request(`${ENDPOINTS.SONG_DETAIL}/${songKey}`);
    return cleanSong(data);
  }

  /**
   * Fetch playlist or album tracklist and metadata
   * @param {string} playlistKey 
   * @returns {Promise<Playlist | null>}
   */
  public async getPlaylistDetail(playlistKey: string): Promise<Playlist | null> {
    if (!playlistKey) throw new Error('playlistKey is required');
    const data = await this._request(`${ENDPOINTS.PLAYLIST_DETAIL}/${playlistKey}`);
    return cleanPlaylist(data);
  }

  /**
   * Fetch lyrics of a song
   * @param {string} songKey 
   * @returns {Promise<LyricsData | null>}
   */
  public async getLyrics(songKey: string): Promise<LyricsData | null> {
    if (!songKey) throw new Error('songKey is required');
    const data = await this._request(ENDPOINTS.SONG_LYRIC, { songKey });
    if (!data) return null;
    
    return {
      songKey: data.songKey || songKey,
      aiGenerated: !!data.aiGenerated,
      lyrics: parseLyrics(data.content || '')
    };
  }

  /**
   * Search songs by keyword
   * @param {string} keyword 
   * @param {number} [page=1] 
   * @param {number} [size=20] 
   * @returns {Promise<SearchSongsResult>}
   */
  public async searchSongs(keyword: string, page: number = 1, size: number = 20): Promise<SearchSongsResult> {
    const data = await this._request(ENDPOINTS.SEARCH_SONG, {
      keyword,
      pageindex: page,
      pagesize: size,
      correct: 'true'
    });
    
    return {
      songs: (data.songs || []).map(cleanSong).filter((s: any): s is Song => s !== null),
      recommends: data.recommends || []
    };
  }

  /**
   * Search playlists by keyword
   * @param {string} keyword 
   * @param {number} [page=1] 
   * @param {number} [size=20] 
   * @returns {Promise<SearchPlaylistsResult>}
   */
  public async searchPlaylists(keyword: string, page: number = 1, size: number = 20): Promise<SearchPlaylistsResult> {
    const data = await this._request(ENDPOINTS.SEARCH_PLAYLIST, {
      keyword,
      pageindex: page,
      pagesize: size,
      correct: 'true'
    });

    return {
      playlists: (data.playlists || []).map((p: any) => ({
        key: p.key || '',
        name: p.name || '',
        thumbnail: p.image || '',
        artistName: p.artistName || '',
        totalLiked: p.totalLiked || 0
      })),
      recommends: data.recommends || []
    };
  }

  /**
   * Search albums by keyword
   * @param {string} keyword 
   * @param {number} [page=1] 
   * @param {number} [size=20] 
   * @returns {Promise<SearchAlbumsResult>}
   */
  public async searchAlbums(keyword: string, page: number = 1, size: number = 20): Promise<SearchAlbumsResult> {
    const data = await this._request(ENDPOINTS.SEARCH_ALBUM, {
      keyword,
      pageindex: page,
      pagesize: size
    });

    return {
      albums: (data.albums || []).map((a: any) => ({
        key: a.key || '',
        name: a.name || '',
        thumbnail: a.image || '',
        artistName: a.artistName || ''
      })),
      recommends: data.recommends || []
    };
  }

  /**
   * Search artists by character prefix
   * @param {string} keyword 
   * @param {number} [page=1] 
   * @param {number} [size=20] 
   * @returns {Promise<ArtistSearchResult[]>}
   */
  public async searchArtists(keyword: string, page: number = 1, size: number = 20): Promise<ArtistSearchResult[]> {
    const data = await this._request(ENDPOINTS.SEARCH_ARTIST, {
      char: keyword,
      pageindex: page,
      pagesize: size,
      correct: 'true'
    });
    
    const artists: ArtistSearchResult[] = [];
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'recommends' && value && (value as any).key) {
          artists.push({
            key: (value as any).key,
            name: (value as any).name,
            thumbnail: (value as any).image,
            totalFollow: (value as any).totalFollow || 0
          });
        }
      }
    }
    return artists;
  }

  /**
   * Search videos by keyword
   * @param {string} keyword 
   * @param {number} [page=1] 
   * @param {number} [size=20] 
   * @returns {Promise<VideoSearchResult[]>}
   */
  public async searchVideos(keyword: string, page: number = 1, size: number = 20): Promise<VideoSearchResult[]> {
    const data = await this._request(ENDPOINTS.SEARCH_VIDEO, {
      keyword,
      pageindex: page,
      pagesize: size,
      correct: 'true'
    }).catch(err => {
      if (err.message.includes('code 224')) return { videos: [] };
      throw err;
    });

    return (data.videos || []).map((v: any) => ({
      key: v.key || '',
      title: v.name || '',
      thumbnail: v.image || '',
      artistName: v.artistName || '',
      duration: v.duration || 0,
      viewCount: v.viewed || 0
    }));
  }

  /**
   * Get trending hot search keywords
   * @returns {Promise<string[]>}
   */
  public async getHotKeywords(): Promise<string[]> {
    const data = await this._request(ENDPOINTS.HOT_KEYWORDS);
    return data || [];
  }

  /**
   * Get trending rankings (top charts)
   * @returns {Promise<Record<string, Song[]>>}
   */
  public async getTrendingList(): Promise<Record<string, Song[]>> {
    const data = await this._request(ENDPOINTS.TRENDING_LIST);
    if (!data || !data.musicRankList) return {};
    
    const charts: Record<string, Song[]> = {};
    data.musicRankList.forEach((rank: any) => {
      const name = rank.enRankName ? (rank.enRankName['V-POP'] || rank.enRankName['US-UK'] || rank.enRankName['K-POP']) : 'V-POP';
      charts[name] = (rank.items || []).map((item: any) => cleanSong(item)).filter((s: any): s is Song => s !== null);
    });
    return charts;
  }

  /**
   * Unified search across songs, playlists, albums, artists, lyrics, and videos in a single request
   * @param {string} keyword 
   * @returns {Promise<UnifiedSearchResult>}
   */
  public async searchAll(keyword: string): Promise<UnifiedSearchResult> {
    if (!keyword) throw new Error('keyword is required');
    const data = await this._request(ENDPOINTS.SEARCH_ALL, {
      keyword,
      typeSearch: '0',
      correct: 'true'
    });

    if (!data) return { top: null, songs: [], playlists: [], albums: [], artists: [], videos: [], recommends: [] };

    return {
      top: data.top ? {
        key: data.top.key || '',
        name: data.top.name || '',
        thumbnail: data.top.image || '',
        type: data.top.type || ''
      } : null,
      songs: (data.songs || []).map(cleanSong).filter((s: any): s is Song => s !== null),
      playlists: (data.playlists || []).map((p: any) => ({
        key: p.key || '',
        name: p.name || '',
        thumbnail: p.image || '',
        artistName: p.artistName || '',
        totalLiked: p.totalLiked || 0
      })),
      albums: (data.albums || []).map((a: any) => ({
        key: a.key || '',
        name: a.name || '',
        thumbnail: a.image || '',
        artistName: a.artistName || ''
      })),
      artists: (data.artists || []).map((art: any) => ({
        key: art.key || '',
        name: art.name || '',
        thumbnail: art.image || '',
        totalFollow: art.totalFollow || 0
      })),
      videos: (data.videos || []).map((v: any) => ({
        key: v.key || '',
        title: v.name || '',
        thumbnail: v.image || '',
        artistName: v.artistName || '',
        duration: v.duration || 0,
        viewCount: v.viewed || 0
      })),
      recommends: data.recommends || []
    };
  }

  /**
   * Fetch similar songs (for autoplay recommendations)
   * @param {string} songKey 
   * @param {number} [page=1] 
   * @param {number} [size=20] 
   * @returns {Promise<SimilarSongsResult>}
   */
  public async getSimilarSongs(songKey: string, page: number = 1, size: number = 20): Promise<SimilarSongsResult> {
    if (!songKey) throw new Error('songKey is required');
    const data = await this._request(`${ENDPOINTS.SONG_SIMILAR}/${songKey}`, {
      pn: page,
      rn: size
    });

    return {
      songs: (data.list || []).map(cleanSong).filter((s: any): s is Song => s !== null),
      total: data.total || 0
    };
  }

  /**
   * Get autocompletion suggestions for search
   * @param {string} prefix 
   * @returns {Promise<string[]>}
   */
  public async getSuggestions(prefix: string): Promise<string[]> {
    if (!prefix) return [];
    const data = await this._request(ENDPOINTS.SEARCH_SUGGESTION, { prefix });
    return data || [];
  }

  /**
   * Get authenticated user profile details
   * @returns {Promise<UserProfile>}
   */
  public async getUserInfo(): Promise<UserProfile> {
    if (!this.token) throw new Error('Authentication required. Call login() first.');
    const data = await this._request(ENDPOINTS.USER_INFO);
    return data;
  }

  /**
   * Get user's followed/favorite playlists (requires authentication)
   * @param {number} [page=0] 
   * @param {number} [size=999] 
   * @returns {Promise<UserPlaylist[]>}
   */
  public async getUserFollowedPlaylists(page: number = 0, size: number = 999): Promise<UserPlaylist[]> {
    if (!this.token) throw new Error('Authentication required. Call login() first.');
    
    let uid = '0';
    try {
      const payload = JSON.parse(Buffer.from(this.token.split('.')[1], 'base64').toString('utf8'));
      uid = payload.userId || '0';
    } catch (e) {}

    const data = await this._request(ENDPOINTS.USER_FOLLOWED_PLAYLISTS, {
      uid,
      pn: page,
      rn: size
    });

    return (data?.list || []).map((p: any) => ({
      key: p.key || '',
      name: p.name || '',
      thumbnail: p.image || '',
      songCount: p.totalSong || 0,
      isPublic: !!p.pub,
      userId: p.userId || null
    }));
  }

  /**
   * Get user's followed/favorite albums (requires authentication)
   * @param {number} [page=0] 
   * @param {number} [size=999] 
   * @returns {Promise<UserPlaylist[]>}
   */
  public async getUserFollowedAlbums(page: number = 0, size: number = 999): Promise<UserPlaylist[]> {
    if (!this.token) throw new Error('Authentication required. Call login() first.');
    
    let uid = '0';
    try {
      const payload = JSON.parse(Buffer.from(this.token.split('.')[1], 'base64').toString('utf8'));
      uid = payload.userId || '0';
    } catch (e) {}

    const data = await this._request(ENDPOINTS.USER_FOLLOWED_ALBUMS, {
      uid,
      pn: page,
      rn: size
    });

    return (data?.list || []).map((a: any) => ({
      key: a.key || '',
      name: a.name || '',
      thumbnail: a.image || '',
      songCount: a.totalSong || 0,
      isPublic: !!a.pub,
      userId: a.userId || null
    }));
  }

  /**
   * Search songs by lyric keyword
   * @param {string} keyword 
   * @param {number} [page=1] 
   * @param {number} [size=20] 
   * @returns {Promise<SearchLyricsResult>}
   */
  public async searchLyrics(keyword: string, page: number = 1, size: number = 20): Promise<SearchLyricsResult> {
    if (!keyword) throw new Error('keyword is required');
    const data = await this._request(ENDPOINTS.SEARCH_LYRIC, {
      keyword,
      typeSearch: '0',
      pageindex: page,
      pagesize: size,
      correct: 'true'
    });

    return {
      songs: (data?.songs || []).map(cleanSong).filter((s: any): s is Song => s !== null),
      total: data?.total || 0
    };
  }

  /**
   * Initialize notifications (requires authentication)
   * @returns {Promise<any>}
   */
  public async initNotifications(): Promise<any> {
    return await this._request(ENDPOINTS.NOTIFY_INIT);
  }

  /**
   * Get history of user push notifications (requires authentication)
   * @param {number} [page=1] 
   * @param {number} [size=30] 
   * @returns {Promise<NotificationItem[]>}
   */
  public async getNotifications(page: number = 1, size: number = 30): Promise<NotificationItem[]> {
    const data = await this._request(ENDPOINTS.NOTIFY_LIST, {
      pageindex: page,
      pagesize: size
    });
    return data || [];
  }

  /**
   * Save FCM push registration token to NhacCuaTui (requires authentication)
   * @param {string} fcmToken 
   * @returns {Promise<any>}
   */
  public async saveFcmToken(fcmToken: string): Promise<any> {
    if (!fcmToken) throw new Error('fcmToken is required');
    const body = `notifykey=${encodeURIComponent(fcmToken)}`;
    return await this._request(
      ENDPOINTS.SAVE_FCM,
      {},
      'POST',
      body,
      'application/x-www-form-urlencoded; charset=utf-8'
    );
  }

  /**
   * Verify app version updates & requirements
   * @returns {Promise<any>}
   */
  public async checkAppUpgrade(): Promise<any> {
    return await this._request(ENDPOINTS.UPGRADE_VERSION);
  }

  /**
   * Fetch startup/popup configurations
   * @returns {Promise<any>}
   */
  public async getPopupConfigs(): Promise<any> {
    return await this._request(ENDPOINTS.POPUP_CONFIG);
  }

  /**
   * Fetch active app campaigns/events
   * @returns {Promise<any>}
   */
  public async getActivityInfo(): Promise<any> {
    return await this._request(ENDPOINTS.ACTIVITY_INFO);
  }

  /**
   * Fetch topic/browse categories tabs
   * @returns {Promise<TopicCategory[]>}
   */
  public async getTopicCategories(): Promise<TopicCategory[]> {
    const data = await this._request(ENDPOINTS.TOPIC_CATEGORIES);
    return data || [];
  }

  /**
   * Fetch detailed items and groups within a topic category
   * @param {number} categoryId 
   * @param {number} [page=1] 
   * @param {number} [size=30] 
   * @returns {Promise<TopicCategoryDetailSection[]>}
   */
  public async getTopicCategoryDetails(
    categoryId: number,
    page: number = 1,
    size: number = 30
  ): Promise<TopicCategoryDetailSection[]> {
    const data = await this._request(`${ENDPOINTS.TOPIC_CATEGORIES}/${categoryId}`, {
      pageindex: page,
      pagesize: size
    });
    return data || [];
  }
}

export default NhacCuaTui;
