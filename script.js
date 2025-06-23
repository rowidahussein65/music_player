const audio = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playlistEl = document.getElementById('playlist');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');

// let songs = [
//   {
//     title: " حفلة تنكرية ",
//     artist: " رحمة محسن",
//     file: "songs/2025 l رحمه محسن & أحمد العوضي - حفلة تنكرية - أغنية الفرح مسلسل فهد البطل.mp3",
//     category: "Shaabi"
//   },
//   {
//     title: "We Redet",
//     artist: "  Amr Diab",
//     file: "songs/Amr Diab  We Redet  عمرو دياب  ورضيت.mp3",
//     category: "Romantic"
//   },
//   {
//     title: "   7ADOTA ALMANY",
//     artist: "  MARWAN MOUSSA",
//     file: "songs/MARWAN MOUSSA - 7ADOTA ALMANY (OFFICIAL AUDIO) مروان موسى - حدوتة الماني.mp3",
//     category: "Mahraganat"
//   },
//   {
//     title: " Rez2y",
//     artist: " Muhab",
//     file: "songs/Muhab - Rez2y I مهاب - رزقي Prod. Evo.mp3",
//     category: "Mahraganat"
//   },
//   {
//     title: "  El Hob Eibna ",
//     artist: "Ramy Sabry ",
//     file: "songs/Ramy Sabry - El Hob Eibna  رامي صبري - الحب عيبنا (مسلسل وتقابل حبيب).mp3",
//     category: "Romantic"
//   },
//   {
//     title: " ملوك البحر",
//     artist: "حودة ناصر",
//     file: "songs/كليب ملوك البحر ( بالمكنه البطة اخدت اللقطة ) حوده ناصر شاعر الغية  توزيع سانتوس [ النسخة الاصلية ].mp3",
//     category: "Mahraganat"
//   }
// ];

let filteredSongs = [...songs];
let currentIndex = 0;
let isSeeking = false;

window.onload = () => {
  audio.volume = 0.5;
  document.getElementById('volumeControl').value = 0.5;

  const savedIndex = localStorage.getItem('currentIndex');
  const savedTime = localStorage.getItem('currentTime');

  if (savedIndex !== null) {
    currentIndex = parseInt(savedIndex);
    playSong(currentIndex, true);
    if (savedTime) audio.currentTime = parseFloat(savedTime);
  }

  renderPlaylist();
};

function renderPlaylist() {
  playlistEl.innerHTML = '';
  filteredSongs.forEach((s, i) => {
    let li = document.createElement('li');
    li.innerHTML = `<strong>${s.title}</strong><br><small>${s.artist}</small>`;
    li.className = 'list-group-item' + (i === currentIndex ? ' active' : '');
    li.onclick = () => playSong(i);
    playlistEl.appendChild(li);
  });
}

function playSong(index, autoPause = false) {
  currentIndex = index;
  audio.src = filteredSongs[currentIndex].file;
  audio.load();
  if (!autoPause) audio.play();
  playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  localStorage.setItem('currentIndex', currentIndex);
  document.getElementById('nowPlaying').textContent =
    `${filteredSongs[currentIndex].title} - ${filteredSongs[currentIndex].artist}`;
  renderPlaylist();
}

function togglePlayPause() {
  if (!audio.src) return playSong(currentIndex);
  if (audio.paused) {
    audio.play();
    playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  } else {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  }
}

function nextSong() {
  currentIndex = (currentIndex + 1) % filteredSongs.length;
  playSong(currentIndex);
}

function prevSong() {
  currentIndex = (currentIndex - 1 + filteredSongs.length) % filteredSongs.length;
  playSong(currentIndex);
}

function setVolume(val) {
  audio.volume = val;
}

function filterCategory(cat) {
  filteredSongs = cat === 'Songs' ? [...songs] : songs.filter(s => s.category === cat);
  currentIndex = 0;
  renderPlaylist();
}

function searchSongs() {
  let q = document.getElementById('searchInput').value.toLowerCase();
  filteredSongs = songs.filter(s => s.title.toLowerCase().includes(q));
  currentIndex = 0;
  renderPlaylist();
}

function seek(value) {
  audio.currentTime = (value / 100) * audio.duration;
}

progressBar.addEventListener('input', () => {
  isSeeking = true;
});

progressBar.addEventListener('change', () => {
  seek(progressBar.value);
  isSeeking = false;
});

audio.ontimeupdate = () => {
  if (!isSeeking) {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progress || 0;
  }

  localStorage.setItem('currentTime', audio.currentTime);

  currentTimeEl.textContent = formatTime(audio.currentTime);
  totalTimeEl.textContent = formatTime(audio.duration);
};

function formatTime(sec) {
  if (isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
