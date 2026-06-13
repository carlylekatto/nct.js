/**
 * Example script demonstrating how a developer would use the nct.js library.
 * Run this with: node example.js
 */

const NhacCuaTui = require('./'); // Resolves to dist/cjs/index.js via package.json

async function runDemo() {
  console.log('🎵 --- NhacCuaTui (nct.js) User Demo --- 🎵\n');

  // Initialize the client with 'info' log level to see API request and response timings
  const nct = new NhacCuaTui({ logLevel: 'info' });

  try {
    // 1. Search for a song
    console.log('🔍 [1] Searching for "Chúng Ta Của Tương Lai"...');
    const searchResult = await nct.searchSongs('Chúng Ta Của Tương Lai', 1, 1);
    
    if (searchResult.songs.length === 0) {
      console.log('❌ No song found.');
      return;
    }

    const song = searchResult.songs[0];
    console.log(`\n🎉 Found Song: "${song.name}" by "${song.primaryArtist.name}" (Key: ${song.key})\n`);

    // 2. Fetch complete details (including streams)
    console.log(`📲 [2] Fetching song details & audio streams for key: ${song.key}...`);
    const songDetail = await nct.getSongDetail(song.key);
    
    if (songDetail) {
      console.log('\n💿 Song Metadata:');
      console.log(`   - Title: ${songDetail.name}`);
      console.log(`   - Artist: ${songDetail.primaryArtist.name}`);
      console.log(`   - Duration: ${songDetail.duration} seconds`);
      console.log('   - Audio Streams:');
      songDetail.streams.forEach(s => {
        console.log(`     * Quality [${s.quality}]: ${s.streamUrl.substring(0, 90)}...`);
      });
      console.log();
    }

    // 3. Fetch Lyrics
    console.log(`📝 [3] Fetching lyrics for key: ${song.key}...`);
    const lyricsData = await nct.getLyrics(song.key);
    
    if (lyricsData && lyricsData.lyrics) {
      console.log('\n🎤 Lyrics Preview:');
      if (typeof lyricsData.lyrics === 'string') {
        console.log(lyricsData.lyrics.substring(0, 200) + '...\n');
      } else {
        // Timestamped LRC format
        lyricsData.lyrics.slice(0, 5).forEach(line => {
          console.log(`   [${line.time.toFixed(2)}s] ${line.text}`);
        });
        console.log('   ...\n');
      }
    } else {
      console.log('⚠️ No lyrics found for this song.\n');
    }

    // 4. Browse Topic Categories
    console.log('📂 [4] Browsing topic categories...');
    const categories = await nct.getTopicCategories();
    console.log(`\n🏷️  Available Browse Categories (${categories.length} found):`);
    categories.forEach(c => {
      console.log(`   - [ID: ${c.id}] ${c.title}`);
    });
    console.log();

  } catch (error) {
    console.error('❌ Error during demo execution:', error.message);
  }
}

runDemo();
