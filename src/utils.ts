export interface Artist {
  key: string;
  name: string;
  thumbnail: string;
}

export interface PrimaryArtist {
  id: string | number;
  name: string;
  thumbnail: string;
}

export interface Genre {
  id: string | number | null;
  name: string;
}

export interface Provider {
  key: string;
  name: string;
  thumbnail: string;
}

export interface Stream {
  quality: string;
  streamUrl: string;
  downloadUrl: string;
  onlyVIP: boolean;
}

export interface QualityDownload {
  quality: string;
  name: string;
  fileSize: number;
  onlyVIP: boolean;
}

export interface Song {
  key: string;
  name: string;
  thumbnail: string;
  bgImage: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  artists: Artist[];
  primaryArtist: PrimaryArtist;
  genre: Genre;
  provider: Provider | null;
  vipFree: boolean;
  streams: Stream[];
  qualities: QualityDownload[];
}

export interface Playlist {
  key: string;
  name: string;
  thumbnail: string;
  description: string;
  viewCount: number;
  likeCount: number;
  songCount: number;
  creator: {
    userId: string | number | null;
    username: string;
    avatar: string;
  };
  songs: Song[];
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface UserProfile {
  userId: number;
  username: string;
  avatar: string;
  avatarMax: string;
  isVIP: boolean;
  isBaseVip?: boolean;
  baseVipTime?: string;
  baseVipTimestamp?: number;
  isPayVip?: boolean;
  payVipTime?: string;
  payVipTimestamp?: number;
  vipExpire: string;
  fullName: string;
  displayName?: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  birthday?: string;
  followerNum?: number;
  followingNum?: number;
}

export interface UserPlaylist {
  key: string;
  name: string;
  thumbnail: string;
  songCount: number;
  isPublic: boolean;
  userId: number | null;
}

export interface HomeSectionItem {
  key: string;
  name: string;
  thumbnail: string;
  type: string;
  [key: string]: any;
}

export interface HomeSection {
  key: string;
  title: string;
  showType: string;
  viewMore: boolean;
  items: (Song | HomeSectionItem | any)[];
}

export interface LyricsData {
  songKey: string;
  aiGenerated: boolean;
  lyrics: LyricLine[] | string;
}

export interface PlaylistSearchResult {
  key: string;
  name: string;
  thumbnail: string;
  artistName: string;
  totalLiked: number;
}

export interface AlbumSearchResult {
  key: string;
  name: string;
  thumbnail: string;
  artistName: string;
}

export interface ArtistSearchResult {
  key: string;
  name: string;
  thumbnail: string;
  totalFollow: number;
}

export interface VideoSearchResult {
  key: string;
  title: string;
  thumbnail: string;
  artistName: string;
  duration: number;
  viewCount: number;
}

export interface SearchSongsResult {
  songs: Song[];
  recommends: any[];
}

export interface SearchPlaylistsResult {
  playlists: PlaylistSearchResult[];
  recommends: any[];
}

export interface SearchAlbumsResult {
  albums: AlbumSearchResult[];
  recommends: any[];
}

export interface UnifiedSearchResult {
  top: {
    key: string;
    name: string;
    thumbnail: string;
    type: string;
  } | null;
  songs: Song[];
  playlists: PlaylistSearchResult[];
  albums: AlbumSearchResult[];
  artists: ArtistSearchResult[];
  videos: VideoSearchResult[];
  recommends: any[];
}

export interface SimilarSongsResult {
  songs: Song[];
  total: number;
}

export interface SearchLyricsResult {
  songs: Song[];
  total: number;
}

export interface NotificationItem {
  key: string;
  name: string;
  message: string;
  image: string;
  time: number;
  timePush: string;
  type: string;
  value: string;
}

export interface TopicCategory {
  id: number;
  isMain: boolean;
  isTab: boolean;
  name: string;
  priority: number;
  title: string;
  titleEn: string;
}

export interface TopicCategoryDetailItem {
  id: number;
  name: string;
  image: string;
  type: string;
  refKey: string;
  bgColor: string;
  desc: string | null;
  priority: number;
  mainPriority: number;
  status: boolean;
}

export interface TopicCategoryDetailSection {
  category: {
    id: number;
    isMain: boolean;
    isTab: boolean;
    name: string;
    priority: number;
    title: string;
    titleEn: string;
  };
  items: TopicCategoryDetailItem[];
}

/**
 * Cleans song data returned by NCT API
 */
export function cleanSong(song: any): Song | null {
  if (!song) return null;

  return {
    key: song.key || '',
    name: song.name || '',
    thumbnail: song.image || '',
    bgImage: song.bgImage || '',
    duration: song.duration || 0,
    viewCount: song.viewed || 0,
    likeCount: song.totalLiked || 0,
    shareCount: song.shareCnt || 0,
    commentCount: song.commentCnt || 0,
    artists: (song.artist || []).map((a: any) => ({
      key: a.key || '',
      name: a.name || '',
      thumbnail: a.image || ''
    })),
    primaryArtist: {
      id: song.artistId || '',
      name: song.artistName || '',
      thumbnail: song.artistImage || ''
    },
    genre: {
      id: song.genreId || null,
      name: song.genreName || ''
    },
    provider: song.provider ? {
      key: song.provider.key || '',
      name: song.provider.name || '',
      thumbnail: song.provider.image || ''
    } : null,
    vipFree: !!song.vipFree,
    streams: (song.streamURL || []).map((s: any) => ({
      quality: s.typeUI || s.type || '',
      streamUrl: s.stream || '',
      downloadUrl: s.download || '',
      onlyVIP: !!s.onlyVIP
    })),
    qualities: (song.qualityDownload || []).map((q: any) => ({
      quality: q.key || '',
      name: q.name || '',
      fileSize: q.fileSize || 0,
      onlyVIP: !!q.onlyVIP
    }))
  };
}

/**
 * Cleans playlist data returned by NCT API
 */
export function cleanPlaylist(playlist: any): Playlist | null {
  if (!playlist) return null;

  return {
    key: playlist.key || '',
    name: playlist.name || '',
    thumbnail: playlist.image || '',
    description: playlist.description || '',
    viewCount: playlist.viewed || 0,
    likeCount: playlist.totalLiked || 0,
    songCount: playlist.totalSongs || 0,
    creator: {
      userId: playlist.userId || null,
      username: playlist.userCreated || '',
      avatar: playlist.userAvatar || ''
    },
    songs: (playlist.listSong || []).map(cleanSong).filter((s: any): s is Song => s !== null)
  };
}

/**
 * Parse raw lyrics text into a structured LRC format if applicable
 */
export function parseLyrics(content: string): LyricLine[] | string {
  if (!content) return '';
  
  const lines = content.split('\n');
  const lrc: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const ms = parseInt(match[3], 10);
      const time = mins * 60 + secs + (ms / (match[3].length === 3 ? 1000 : 100));
      const text = line.replace(timeRegex, '').trim();
      lrc.push({ time, text });
    }
  }

  return lrc.length > 0 ? lrc : content;
}
