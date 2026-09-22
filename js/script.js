const redirectURL = "LINK OFFER";

const pageTitle = document.getElementById("pageTitle");
const playerBox = document.getElementById("playerBox");
const video = document.getElementById("mainVideo");

const playButton = document.getElementById("playButton");
const loader = document.getElementById("loader");


const ytWrap = document.getElementById("ytWrap");
const watchNowBtn = document.getElementById("watchNowBtn");

const signupPopup = document.getElementById("signupPopup");
const popupClose = document.getElementById("popupClose");
const signupBtn = document.getElementById("signupBtn");



const movieNameInPopup = document.getElementById("movieNameInPopup");
const signupForm = document.getElementById("signupForm");
/* Bottom bar controls */
const playToggle = document.getElementById("playToggle");
const playIcon = document.getElementById("playIcon");

const muteBtn = document.getElementById("muteBtn");
const volWaves = document.getElementById("volWaves");

const pipBtn = document.getElementById("pipBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

/* -------------------------
   TITLE from URL:
   - ?movie=Fast+Action+2025
   - ?title=Fast+Action+2025
-------------------------- */
function setPageTitle(text) {
  if (!text) return;
  pageTitle.textContent = text;
  document.title = text;
  if (movieNameInPopup) movieNameInPopup.textContent = text;
}

function getMovieTitleFromURL() {
  const params = new URLSearchParams(window.location.search);
  let title = params.get("movie") || params.get("title");
  if (!title) return null;

  // Convert + to spaces
  title = title.replace(/\+/g, " ");
  try { title = decodeURIComponent(title); } catch (_) {}

  return title.trim();
}


/* -------------------------
   OMDb Auto Details (Title -> Poster/Plot/Meta)
-------------------------- */
const OMDB_API_KEY = "61dd9b8d";
const movieTagEl = document.getElementById("movieTag");
const movieTitle2El = document.getElementById("movieTitle2");
const movieSynopsisEl = document.getElementById("movieSynopsis");

const metaYearEl = document.getElementById("metaYear");
const metaRuntimeEl = document.getElementById("metaRuntime");
const metaImdbEl = document.getElementById("metaImdb");
const metaGenreEl = document.getElementById("metaGenre");
const metaDirectorEl = document.getElementById("metaDirector");

function minutesToHM(runtimeText) {
  const m = /([0-9]+)\s*min/i.exec(runtimeText || "");
  if (!m) return runtimeText || "â€”";
  const mins = parseInt(m[1], 10);
  const h = Math.floor(mins / 60);
  const r = mins % 60;
  return h > 0 ? `${h}h ${r}m` : `${r}m`;
}

async function fetchMovieDetailsByTitle(title) {
  if (!title) return;
  try {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || data.Response === "False") {
      console.log("OMDb: not found:", data?.Error);
      return;
    }

    // Title everywhere
    const finalTitle = (data.Title && data.Title !== "N/A") ? data.Title : title;
    setPageTitle(finalTitle);
    if (movieTitle2El) movieTitle2El.textContent = `Watch ${finalTitle}`;

    // Tag: Genre â€¢ Rated â€¢ Year
    const genre = (data.Genre || "").split(",")[0]?.trim();
    const year = data.Year || "";
    const rated = data.Rated && data.Rated !== "N/A" ? data.Rated : "";
    const tagParts = [genre, rated, year].filter(Boolean);
    if (movieTagEl && tagParts.length) movieTagEl.textContent = tagParts.join(" â€¢ ");

    // Plot
    if (movieSynopsisEl && data.Plot && data.Plot !== "N/A") {
      movieSynopsisEl.textContent = data.Plot;
    }

    // Meta
    if (metaYearEl && data.Year && data.Year !== "N/A") metaYearEl.textContent = data.Year;
    if (metaRuntimeEl && data.Runtime && data.Runtime !== "N/A") metaRuntimeEl.textContent = minutesToHM(data.Runtime);
    if (metaImdbEl && data.imdbRating && data.imdbRating !== "N/A") metaImdbEl.textContent = data.imdbRating;
    if (metaGenreEl && data.Genre && data.Genre !== "N/A") metaGenreEl.textContent = data.Genre.split(",")[0].trim();
    if (metaDirectorEl && data.Director && data.Director !== "N/A") metaDirectorEl.textContent = data.Director.split(",")[0].trim();

    // Poster -> video poster
    if (data.Poster && data.Poster !== "N/A") {
      try { video.setAttribute("poster", data.Poster); } catch (_) {}
    }
  } catch (e) {
    console.log("OMDb fetch error:", e);
  }
}

/* INIT */
const urlMovieTitle = getMovieTitleFromURL();
if (urlMovieTitle) {
  setPageTitle(urlMovieTitle);
  fetchMovieDetailsByTitle(urlMovieTitle);
}


/* -------------------------
   Center Play Button (your original flow)
-------------------------- */
playButton.onclick = function () {
  playButton.style.display = "none";
  loader.style.display = "none";
  video.currentTime = 0;
  video.play();
};

/* WATCH LIVE NOW */
watchNowBtn.onclick = () => (window.location.href = redirectURL);

/* POPUP */
function openPopup() {
  signupPopup.style.display = "flex";
}
function closePopup() {
  signupPopup.style.display = "none";
  playButton.style.display = "flex";
}
popupClose.addEventListener("click", closePopup);

/* SIGNUP REDIRECT */
/* -------------------------
   Play/Pause
-------------------------- */
function setPlayIcon(isPlaying) {
  playIcon.innerHTML = isPlaying
    ? '<path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z"></path>' // pause
    : '<path d="M8 5v14l11-7z"></path>'; // play
}

playToggle.addEventListener("click", () => {
  if (video.paused) video.play();
  else video.pause();
});

video.addEventListener("play", () => setPlayIcon(true));
video.addEventListener("pause", () => setPlayIcon(false));
setPlayIcon(!video.paused);

/* -------------------------
   Mute
-------------------------- */
function setMuteUI(isMuted) {
  volWaves.style.display = isMuted ? "none" : "";
}

muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
  setMuteUI(video.muted);
});
setMuteUI(video.muted);

/* -------------------------
   Picture-in-Picture
-------------------------- */
pipBtn.addEventListener("click", async () => {
  try {
    if (!document.pictureInPictureEnabled) return;

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  } catch (e) {
    console.log("PiP error:", e);
  }
});


/* -------------------------
   Fullscreen
-------------------------- */
fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    playerBox.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});


// Close popup when clicking on the overlay (outside the box)
signupPopup.addEventListener("click", (e) => {
  if (e.target === signupPopup) closePopup();
});




/* Show popup after video finishes */
video.addEventListener("ended", () => {
  openPopup();
});


/* Signup submit -> redirect */
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.href = redirectURL;
  });
} else {
  // fallback if form not found
  signupBtn?.addEventListener("click", () => (window.location.href = redirectURL));
}

/* Social buttons -> redirect */
document.getElementById("googleBtn")?.addEventListener("click", () => (window.location.href = redirectURL));


/* "Signup Using Email" button -> jump to email field */
document.getElementById("emailBtn")?.addEventListener("click", () => {
  const emailInput = document.querySelector('#signupForm input[type="email"]');
  emailInput?.focus();
});
