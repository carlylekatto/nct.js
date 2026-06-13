const NhacCuaTui = require('../');

async function runTests() {
  const nct = new NhacCuaTui();
  console.log('--- STARTING NHACCUATUI API INTEGRATION TESTS ---');

  try {
    // 1. Test Home Index
    console.log('\n[1] Testing getHome()...');
    const homeSections = await nct.getHome();
    console.log(`✅ Success! Found ${homeSections.length} sections on homepage.`);
    homeSections.slice(0, 3).forEach(sec => {
      console.log(`   - Section: "${sec.title || 'Untitled'}" | Items count: ${sec.items.length}`);
    });

    // 2. Test Hot Keywords
    console.log('\n[2] Testing getHotKeywords()...');
    const keywords = await nct.getHotKeywords();
    console.log(`✅ Success! Hot search terms: ${keywords.join(', ')}`);

    // 3. Test Song Search
    const searchKeyword = 'Son Tung M-TP';
    console.log(`\n[3] Testing searchSongs("${searchKeyword}")...`);
    const searchResult = await nct.searchSongs(searchKeyword, 1, 3);
    console.log(`✅ Success! Found ${searchResult.songs.length} search results.`);
    searchResult.songs.forEach(song => {
      console.log(`   - Song: "${song.name}" by "${song.primaryArtist.name}" [Key: ${song.key}]`);
    });

    if (searchResult.songs.length > 0) {
      const targetSong = searchResult.songs[0];

      // 4. Test Song Detail
      console.log(`\n[4] Testing getSongDetail("${targetSong.key}")...`);
      const songDetail = await nct.getSongDetail(targetSong.key);
      console.log(`✅ Success! Fetched song detail: "${songDetail.name}"`);
      console.log(`   - Duration: ${songDetail.duration}s`);
      console.log(`   - Stream links:`);
      songDetail.streams.forEach(s => {
        console.log(`     * Quality: ${s.quality} | Link: ${s.streamUrl.substring(0, 80)}...`);
      });

      // 5. Test Lyrics
      console.log(`\n[5] Testing getLyrics("${targetSong.key}")...`);
      const lyricsData = await nct.getLyrics(targetSong.key);
      if (lyricsData && lyricsData.lyrics) {
        console.log('✅ Success! Fetched lyrics.');
        const sampleText = typeof lyricsData.lyrics === 'string'
          ? lyricsData.lyrics.substring(0, 200)
          : JSON.stringify(lyricsData.lyrics.slice(0, 3));
        console.log(`   - Sample lyrics:\n${sampleText}...`);
      } else {
        console.log('⚠️ Song has no lyrics.');
      }
    }

    // 6. Test Playlist search and detail
    console.log('\n[6] Testing Playlist search and details...');
    const plSearch = await nct.searchPlaylists('viet', 1, 1);
    if (plSearch.playlists.length > 0) {
      const pl = plSearch.playlists[0];
      console.log(`   - Found playlist search result: "${pl.name}" [Key: ${pl.key}]`);
      
      const plDetail = await nct.getPlaylistDetail(pl.key);
      console.log(`✅ Success! Fetched playlist: "${plDetail.name}"`);
      console.log(`   - Creator: ${plDetail.creator.username}`);
      console.log(`   - Song count: ${plDetail.songs.length}`);
      if (plDetail.songs.length > 0) {
        console.log(`   - First song: "${plDetail.songs[0].name}" by "${plDetail.songs[0].primaryArtist.name}"`);
      }
    } else {
      console.log('⚠️ No playlist found for test search.');
    }

    // 7. Test Trending Chart List
    console.log('\n[7] Testing getTrendingList()...');
    const charts = await nct.getTrendingList();
    console.log('✅ Success! Fetched top charts.');
    Object.keys(charts).forEach(chartName => {
      console.log(`   - Chart: "${chartName}" | Track count: ${charts[chartName].length}`);
      if (charts[chartName].length > 0) {
        console.log(`     * Top song: "${charts[chartName][0].name}" by "${charts[chartName][0].primaryArtist.name}"`);
      }
    });

    // 8. Test Authentication and Session Management
    const email = process.env.NCT_TEST_EMAIL;
    const pwd = process.env.NCT_TEST_PASSWORD;

    if (email && pwd) {
      console.log('\n[8] Testing login()...');
      const profile = await nct.login(email, pwd);
      console.log(`✅ Success! Authenticated as: "${profile.fullName}" (VIP: ${profile.isVIP})`);
      console.log(`   - Token (truncated): ${nct.token.substring(0, 50)}...`);

      // 9. Test Fetch Authenticated User Playlists
      console.log('\n[9] Testing getUserPlaylists()...');
      const userPlaylists = await nct.getUserPlaylists();
      console.log(`✅ Success! Found ${userPlaylists.length} user playlists.`);
      userPlaylists.forEach(p => {
        console.log(`   - Playlist: "${p.name}" | Tracks: ${p.songCount}`);
      });
    } else {
      console.log('\n[8-9] Skipping login and getUserPlaylists() (NCT_TEST_EMAIL and NCT_TEST_PASSWORD env variables not set)');
    }

    // 10. Test searchAll()
    console.log('\n[10] Testing searchAll("au5")...');
    const searchAllResults = await nct.searchAll('au5');
    console.log(`✅ Success! Unified search results retrieved:`);
    console.log(`   - Songs: ${searchAllResults.songs.length}`);
    console.log(`   - Playlists: ${searchAllResults.playlists.length}`);
    console.log(`   - Albums: ${searchAllResults.albums.length}`);
    console.log(`   - Artists: ${searchAllResults.artists.length}`);

    // 11. Test getSimilarSongs()
    const similarSongKey = (typeof targetSong !== 'undefined' && targetSong) ? targetSong.key : '08kN8ekLppxW';
    console.log(`\n[11] Testing getSimilarSongs("${similarSongKey}")...`);
    const similarSongs = await nct.getSimilarSongs(similarSongKey, 1, 5);
    console.log(`✅ Success! Found ${similarSongs.songs.length} similar songs (Total: ${similarSongs.total}).`);
    similarSongs.songs.slice(0, 3).forEach(song => {
      console.log(`   - Similar Song: "${song.name}" by "${song.primaryArtist.name}"`);
    });

    // 12. Test getSuggestions()
    console.log('\n[12] Testing getSuggestions("au5")...');
    const suggestions = await nct.getSuggestions('au5');
    console.log(`✅ Success! Autocomplete suggestions: ${JSON.stringify(suggestions)}`);

    if (email && pwd) {
      // 13. Test getUserInfo()
      console.log('\n[13] Testing getUserInfo()...');
      const userInfo = await nct.getUserInfo();
      console.log(`✅ Success! User info: "${userInfo.fullName}" | Email: "${userInfo.email}" | Followed: ${userInfo.followingNum}`);

      // 14. Test getUserFollowedPlaylists()
      console.log('\n[14] Testing getUserFollowedPlaylists()...');
      const followedPlaylists = await nct.getUserFollowedPlaylists();
      console.log(`✅ Success! Found ${followedPlaylists.length} followed playlists.`);
      followedPlaylists.forEach(p => {
        console.log(`   - Followed Playlist: "${p.name}" (Songs: ${p.songCount})`);
      });

      // 15. Test getUserFollowedAlbums()
      console.log('\n[15] Testing getUserFollowedAlbums()...');
      const followedAlbums = await nct.getUserFollowedAlbums();
      console.log(`✅ Success! Found ${followedAlbums.length} followed albums.`);
      followedAlbums.forEach(a => {
        console.log(`   - Followed Album: "${a.name}" (Songs: ${a.songCount})`);
      });
    } else {
      console.log('\n[13-15] Skipping authenticated user profile & followed items tests (NCT_TEST_EMAIL and NCT_TEST_PASSWORD env variables not set)');
    }

    // 16. Test searchLyrics()
    console.log('\n[16] Testing searchLyrics("au5")...');
    const lyricSearchResults = await nct.searchLyrics('au5');
    console.log(`✅ Success! Found ${lyricSearchResults.songs.length} songs with matching lyrics (Total: ${lyricSearchResults.total}).`);
    lyricSearchResults.songs.slice(0, 2).forEach(song => {
      console.log(`   - Song: "${song.name}" by "${song.primaryArtist.name}"`);
    });

    if (email && pwd) {
      // 17. Test initNotifications()
      console.log('\n[17] Testing initNotifications()...');
      const initNotify = await nct.initNotifications();
      console.log(`✅ Success! Notification init payload: ${JSON.stringify(initNotify)}`);

      // 18. Test getNotifications()
      console.log('\n[18] Testing getNotifications()...');
      const notifications = await nct.getNotifications();
      console.log(`✅ Success! Found ${notifications.length} push notifications.`);
      notifications.slice(0, 2).forEach(n => {
        console.log(`   - Notify: "${n.name}" | Message: "${n.message}"`);
      });

      // 19. Test saveFcmToken()
      console.log('\n[19] Testing saveFcmToken()...');
      const testFcmToken = 'eJzZxC9UTTyJx1pkSJN6sX:APA91bHwsvzZvbSDenr8WvVudPNtPgXpvrZBpRpFbSuAjZvyuKt18WCu-iHOc35UVq1oI_LHbpHAmPMVupT1VJfdSvRsDwkGzP15icrpxt_2NYOwsCffxM0';
      try {
        const saveFcmRes = await nct.saveFcmToken(testFcmToken);
        console.log(`✅ Success! Save FCM result: ${JSON.stringify(saveFcmRes)}`);
      } catch (err) {
        console.log(`⚠️ Warning: Save FCM token failed (expected for expired/invalid tokens): ${err.message}`);
      }
    } else {
      console.log('\n[17-19] Skipping notifications and FCM token registration tests (NCT_TEST_EMAIL and NCT_TEST_PASSWORD env variables not set)');
    }

    // 20. Test checkAppUpgrade()
    console.log('\n[20] Testing checkAppUpgrade()...');
    const upgradeRes = await nct.checkAppUpgrade();
    console.log(`✅ Success! App upgrade payload: ${JSON.stringify(upgradeRes)}`);

    // 21. Test getPopupConfigs()
    console.log('\n[21] Testing getPopupConfigs()...');
    const popupRes = await nct.getPopupConfigs();
    console.log(`✅ Success! Popup config: ${JSON.stringify(popupRes)}`);

    // 22. Test getActivityInfo()
    console.log('\n[22] Testing getActivityInfo()...');
    const activityRes = await nct.getActivityInfo();
    console.log(`✅ Success! Activity info: ${JSON.stringify(activityRes)}`);

    // 23. Test getTopicCategories()
    console.log('\n[23] Testing getTopicCategories()...');
    const categories = await nct.getTopicCategories();
    console.log(`✅ Success! Found ${categories.length} topic categories.`);
    categories.slice(0, 3).forEach(c => {
      console.log(`   - Category: "${c.title}" (ID: ${c.id})`);
    });

    // 24. Test getTopicCategoryDetails()
    console.log('\n[24] Testing getTopicCategoryDetails(5)...');
    const details = await nct.getTopicCategoryDetails(5);
    console.log(`✅ Success! Found details for category 5 with ${details.length} groups.`);
    details.slice(0, 2).forEach(sec => {
      console.log(`   - Group: "${sec.category.title}" containing ${sec.items.length} items.`);
      sec.items.slice(0, 3).forEach(item => {
        console.log(`     * Item: "${item.name}" (Type: ${item.type})`);
      });
    });

    // 25. Test Log Levels Logging Output
    console.log('\n[25] Testing Log Levels debug output...');
    const debugNct = new NhacCuaTui({ logLevel: 'debug' });
    console.log('--- Triggering debug logs for getHotKeywords() ---');
    await debugNct.getHotKeywords();
    console.log('--- Debug logs ended ---');

    console.log('\n🌟 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🌟');
  } catch (err) {
    console.error('\n❌ Test execution failed with error:');
    console.error(err);
    process.exit(1);
  }
}

runTests();
