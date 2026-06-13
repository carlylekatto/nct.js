export const BASE_URL = 'https://graph.nct.vn';

export const ENDPOINTS = {
  HOME: '/api/v6/app/home/index',
  PLAYLIST_DETAIL: '/api/v1/playlist/detail',
  SONG_DETAIL: '/api/v1/song/detail',
  SONG_LYRIC: '/api/v2/song/lyric/detail',
  SEARCH_SONG: '/api/v1/search/song',
  SEARCH_PLAYLIST: '/api/v2/search/playlist',
  SEARCH_ALBUM: '/api/v1/search/album',
  SEARCH_ARTIST: '/api/v1/search/artist',
  SEARCH_VIDEO: '/api/v1/search/video',
  HOT_KEYWORDS: '/api/v1/search/top-key/keyword-hot',
  TRENDING_LIST: '/api/v2/search/top-key/list',
  LOGIN: '/api/v1/user/login/loginByAccount',
  USER_PLAYLISTS: '/api/v1/playlist/cloud/user-playlists',
  SEARCH_ALL: '/api/v4/search/all',
  SONG_SIMILAR: '/api/v1/song/similar',
  SEARCH_SUGGESTION: '/api/v1/search/prefix-word',
  USER_INFO: '/api/v1/user/account/info',
  USER_FOLLOWED_PLAYLISTS: '/api/v1/user/follow/userFollowingList/playlist',
  USER_FOLLOWED_ALBUMS: '/api/v1/user/follow/userFollowingList/album',
  SEARCH_LYRIC: '/api/v1/search/lyric',
  NOTIFY_INIT: '/api/v1/notify/init',
  NOTIFY_LIST: '/api/v1/push/notify/list',
  SAVE_FCM: '/api/v1/push/saveFcm',
  UPGRADE_VERSION: '/api/v1/devices/upgrade-version',
  POPUP_CONFIG: '/api/v1/user/configure/popup',
  ACTIVITY_INFO: '/api/v1/app/activity/info',
  TOPIC_CATEGORIES: '/api/v1/topics/categories',
} as const;

export const DEFAULT_HEADERS = {
  'User-Agent': 'okhttp/4.12.0',
  'Accept-Encoding': 'gzip',
  'Content-Type': 'application/json',
  'x-os': 'android'
} as const;
