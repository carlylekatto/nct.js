<p align="center">
  <img src="nct-js.png" alt="nct.js Logo" width="120" />
</p>

<h1 align="center">nct.js</h1>

Thư viện Node.js client gọn nhẹ, không phụ thuộc thư viện ngoài (zero-dependency) để truy cập API của NhacCuaTui (NCT). Hỗ trợ tìm kiếm, lấy liên kết stream nhạc, phân tích lời bài hát, duyệt danh mục chủ đề và quản lý phiên đăng nhập người dùng.

Được xây dựng bằng `fetch` gốc (yêu cầu Node.js 18 trở lên). Hỗ trợ cả CommonJS và ES Modules (TypeScript).

Tiếng Việt | [English](../README.md)

## Mục lục

- [Cài đặt](#cài-đặt)
- [Khởi đầu nhanh](#khởi-đầu-nhanh)
  - [CommonJS (JavaScript)](#commonjs-javascript)
  - [ES Modules (TypeScript)](#es-modules-typescript)
- [Tính năng](#tính-năng)
  - [Cấu hình Client](#cấu-hình-client)
  - [Xác thực & Dữ liệu người dùng](#xác-thực--dữ-liệu-người-dùng)
  - [Khám phá & Duyệt nhạc](#khám-phá--duyệt-nhạc)
  - [Chi tiết & Gợi ý nhạc](#chi-tiết--gợi-y-nhạc)
  - [Tìm kiếm](#tìm-kiếm)
  - [Thông báo & Thiết bị](#thông-báo--thiết-bị)
- [Phát triển](#phát-triển)
  - [Biên dịch](#biên-dịch)
  - [Kiểm thử](#kiểm-thử)
- [Giấy phép](#giấy-phép)

---

## Cài đặt

```bash
npm install nct.js
```

## Khởi đầu nhanh

### CommonJS (JavaScript)

```javascript
const NhacCuaTui = require('nct.js');
const nct = new NhacCuaTui({ logLevel: 'info' });

async function run() {
  // Tìm kiếm bài hát
  const searchResult = await nct.searchSongs('Chúng Ta Của Tương Lai', 1, 5);
  console.log(searchResult.songs);

  if (searchResult.songs.length > 0) {
    // Lấy liên kết phát nhạc và chi tiết
    const song = await nct.getSongDetail(searchResult.songs[0].key);
    console.log(song.streams);
  }
}
run();
```

### ES Modules (TypeScript)

```typescript
import NhacCuaTui, { Song } from 'nct.js';
const nct = new NhacCuaTui();

async function run() {
  const song: Song | null = await nct.getSongDetail('m0ooS1OfYFVi');
  console.log(song?.streams);
}
run();
```

## Tính năng

### Cấu hình Client
Khởi tạo client với các tùy chọn cấu hình:
```javascript
const nct = new NhacCuaTui({
  token: 'existing_jwt_token', // Token phiên đăng nhập (tùy chọn)
  logLevel: 'info' // 'debug' | 'info' | 'warn' | 'error' | 'none' (mặc định: 'none')
});
```

### Xác thực & Dữ liệu người dùng
- **`login(account, password)`**: Đăng nhập tài khoản NCT. Tự động mã hóa mật mã bằng MD5, thực hiện yêu cầu xác thực và lưu token phiên làm việc.
- **`getUserInfo()`**: Lấy thông tin hồ sơ của người dùng đang đăng nhập.
- **`getUserPlaylists(page = 0, size = 999)`**: Lấy danh sách danh sách phát đám mây cá nhân.
- **`getUserFollowedPlaylists(page = 0, size = 999)`**: Lấy danh sách danh sách phát đang theo dõi/yêu thích.
- **`getUserFollowedAlbums(page = 0, size = 999)`**: Lấy danh sách album đang theo dõi/yêu thích.

### Khám phá & Duyệt nhạc
- **`getHome()`**: Lấy cấu trúc trang chủ chứa các biểu ngữ, danh sách phát nổi bật, bài hát hot và chuyên mục.
- **`getTrendingList()`**: Lấy các bảng xếp hạng âm nhạc hiện tại (V-Pop, US-UK, K-Pop).
- **`getTopicCategories()`**: Lấy danh sách các chủ đề duyệt nhạc có sẵn (tab chủ đề).
- **`getTopicCategoryDetails(categoryId, page = 1, size = 30)`**: Lấy các nhóm bài hát/danh sách phát chi tiết trong một chủ đề theo ID.

### Chi tiết & Gợi ý nhạc
- **`getSongDetail(songKey)`**: Trả về siêu dữ liệu chi tiết bài hát, danh sách nghệ sĩ, thời lượng và liên kết trực tiếp stream nhạc từ CDN.
- **`getPlaylistDetail(playlistKey)`**: Lấy chi tiết danh sách phát/album cùng danh sách các bài hát bên trong.
- **`getLyrics(songKey)`**: Lấy lời bài hát (trả về văn bản thuần hoặc các dòng LRC có mốc thời gian cụ thể).
- **`getSimilarSongs(songKey, page = 1, size = 20)`**: Lấy danh sách gợi ý các bài hát tương tự (hữu ích cho chế độ tự động phát/autoplay).

### Tìm kiếm
- **`searchAll(keyword)`**: Tìm kiếm hợp nhất trả về kết quả phân loại cho bài hát, danh sách phát, album, nghệ sĩ, video và từ khóa gợi ý.
- **`searchSongs(keyword, page = 1, size = 20)`**
- **`searchPlaylists(keyword, page = 1, size = 20)`**
- **`searchAlbums(keyword, page = 1, size = 20)`**
- **`searchArtists(keyword, page = 1, size = 20)`**
- **`searchVideos(keyword, page = 1, size = 20)`**
- **`searchLyrics(keyword, page = 1, size = 20)`**
- **`getSuggestions(prefix)`**: Tự động gợi ý từ khóa khi người dùng đang nhập.
- **`getHotKeywords()`**: Lấy danh sách các từ khóa tìm kiếm hot nhất.

### Thông báo & Thiết bị
- **`initNotifications()`**: Khởi tạo trung tâm thông báo người dùng.
- **`getNotifications(page = 1, size = 30)`**: Lấy danh sách lịch sử thông báo đẩy.
- **`saveFcmToken(fcmToken)`**: Đăng ký token Firebase Cloud Messaging (FCM) để nhận thông báo đẩy.
- **`checkAppUpgrade()`**: Kiểm tra cấu hình nâng cấp ứng dụng.
- **`getPopupConfigs()`**: Lấy cấu hình hiển thị popup.
- **`getActivityInfo()`**: Lấy thông tin các chiến dịch/sự kiện đang diễn ra.

## Phát triển

### Biên dịch
Để biên dịch mã nguồn TypeScript thành đầu ra định dạng ES Modules và CommonJS:
```bash
npm run build
```

### Kiểm thử
Chạy bộ kiểm thử tích hợp (gọi trực tiếp tới API NCT):
```bash
npm test
```

## Giấy phép
MIT
