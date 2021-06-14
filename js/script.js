const wrapper = document.querySelector(".box"),
    musicImg = wrapper.querySelector(".img-area img"),
    musicName = wrapper.querySelector(".song-details .name"),
    musicArtist = wrapper.querySelector(".song-details .artist"),
    musicAudio = wrapper.querySelector("#music-audio"),
    playPauseBtn = wrapper.querySelector(".play-pause"),
    prevBtn = wrapper.querySelector("#prev"),
    nextBtn = wrapper.querySelector("#next"),
    progressArea = wrapper.querySelector(".progress-area"),
    progressBar = wrapper.querySelector(".progress-bar"),
    musicList = wrapper.querySelector(".music_list"),
    showMoreBtn = wrapper.querySelector("#more_music"),
    hideMoreBtn = musicList.querySelector("#close"),
    ulTag = wrapper.querySelector("ul"),
    api = "https://gmusicflaskapi.herokuapp.com/",
    musicPaths = "https://siasky.net/",
    Filter = document.querySelector('#filter'),
    Audio = document.querySelector('audio'),
    volume = document.getElementById('volume'),
    volume_down = document.getElementById('volume_down');

//  Fetch APi
let allMusic = [];
let musicIndex = 0;
let allLiTags

// API fetch function
async function apiFetchFunc() {
    data = await fetch(api);
    loadedData = await data.json();
    return loadedData;
}

// calling load music function once window load 
window.addEventListener("load", () => {
    apiFetchFunc().then((result) => {
        allMusic = result;
        musicIndex = Math.round((Math.random() * allMusic.length) + 1);
        // be safe .... below codw will blow your mind
        // let's create li according to array length
        for (let i = 0; i < allMusic.length; i++) {
            // let's pass the song name and artist name from the array
            let liTag = `<li li-index="${i + 1}">
                            <div class="row">
                                <span>${allMusic[i].name}</span>
                                <p>${allMusic[i].artist}</p>
                            </div>
                            <audio class="${allMusic[i].music}" src="${musicPaths}${allMusic[i].music}"></audio>
                            <span id="${allMusic[i].music}" class="audio-duration">3:40</span>
                        </li>`;

            ulTag.insertAdjacentHTML("beforeend", liTag);
            let liAudioTag = ulTag.querySelector(`.${allMusic[i].music}`);
            let liAudioDuration = ulTag.querySelector(`#${allMusic[i].music}`);

            liAudioTag.addEventListener("loadeddata", () => {
                let audioDuration = liAudioTag.duration;
                let totalMin = Math.floor(audioDuration / 60);
                let totalSec = Math.floor(audioDuration % 60);
                if (totalSec < 10) {
                    totalSec = `0${totalSec}`
                }
                liAudioDuration.innerText = `${totalMin}:${totalSec}`;
                liAudioDuration.setAttribute("t-duration", `${totalMin}:${totalSec}`)
            })
        }
        allLiTags = ulTag.querySelectorAll("li")
        loadMusic(musicIndex);
        playingNow();

    }).catch((err) => {
        console.log(err);

    });
})

// load music function
function loadMusic(indexNumber) {
    musicName.innerText = allMusic[indexNumber - 1].name;
    musicArtist.innerText = allMusic[indexNumber - 1].artist;
    musicImg.src = `${musicPaths}${allMusic[indexNumber - 1].poster}`;
    musicAudio.src = `${musicPaths}${allMusic[indexNumber - 1].music}`;
}
// play Music function
function playMusic() {
    wrapper.classList.add("paused");
    playPauseBtn.querySelector("i").innerHTML = "pause"
    musicAudio.play();

}
// pause Music function
function pauseMusic() {
    wrapper.classList.remove("paused");
    playPauseBtn.querySelector("i").innerHTML = "play_arrow"
    musicAudio.pause();
}

// next music function
function nextMusic() {
    // as simple as we just increase a count by one
    musicIndex++;
    musicIndex > allMusic.length ? musicIndex = 1 : musicIndex = musicIndex;
    loadMusic(musicIndex);
    playMusic();
    playingNow()
}

// previous music function
function prevMusic() {
    // as simple as we just decrease a count by one
    musicIndex--;
    musicIndex < 1 ? musicIndex = allMusic.length : musicIndex = musicIndex;
    loadMusic(musicIndex);
    playMusic();
    playingNow()
}

// play button 
playPauseBtn.addEventListener("click", () => {
    const isMusicPause = wrapper.classList.contains("paused");
    // if isMusicPause true call pauseMusic else ...
    isMusicPause ? pauseMusic() : playMusic();
    playingNow()
});

// onclick next button calling next music
nextBtn.addEventListener("click", () => {
    nextMusic();
});

// onclick previous button calling next music
prevBtn.addEventListener("click", () => {
    prevMusic();
});

//update progressbar according to music current time 
musicAudio.addEventListener("timeupdate", (e) => {
    const currentTime = e.target.currentTime; //getting current time of song
    const duration = e.target.duration; // getting duration of song
    let progressWidth = (currentTime / duration) * 100;
    progressBar.style.width = `${progressWidth}%`;

    let musicCurrentTime = wrapper.querySelector(".current"),
        musicDuration = wrapper.querySelector(".duration-time");

    musicAudio.addEventListener("loadeddata", () => {

        // update song total duration
        let audioDuration = musicAudio.duration;
        let totalMin = Math.floor(audioDuration / 60);
        let totalSec = Math.floor(audioDuration % 60);
        if (totalSec < 10) {
            totalSec = `0${totalSec}`
        }
        musicDuration.innerText = `${totalMin}:${totalSec}`;

    });

    // update playing song currrent time

    let currentMin = Math.floor(currentTime / 60);
    let currentSec = Math.floor(currentTime % 60);
    if (currentSec < 10) {
        currentSec = `0${currentSec}`
    }
    musicCurrentTime.innerText = `${currentMin}:${currentSec}`;
});

// now let's play with progress bar 
progressArea.addEventListener("click", (e) => {
    let progressWidthVal = progressArea.clientWidth; //getting width of progressbar
    let clickedAtX = e.offsetX; //get X value - btw value of x is > #loL
    let songDuration = musicAudio.duration; // get total duration of song

    musicAudio.currentTime = (clickedAtX / progressWidthVal) * songDuration
    playMusic()
})
// now play with repeat and shuffle

const repeatBtn = wrapper.querySelector("#repeat-plist");
repeatBtn.addEventListener("click", () => {
    let getText = repeatBtn.innerText;

    switch (getText) {
        case "repeat":
            repeatBtn.innerText = "repeat_one"
            break;
        case "repeat_one":
            repeatBtn.innerText = "shuffle"
            break;
        case "shuffle":
            repeatBtn.innerText = "repeat"
            break;
    }
})
// above we just change the icon . now let's change what to do 

musicAudio.addEventListener("ended", () => {
    let getText = repeatBtn.innerText;

    switch (getText) {
        // if text is repeat then simple play the next music.
        case "repeat":
            nextMusic();
            break;
        // id repeat one then simple do time 0 so it will play again
        case "repeat_one":
            musicAudio.currentTime = 0;
            loadMusic(musicIndex);
            playMusic();
            break;
        // 
        case "shuffle":
            let randIndex = Math.round((Math.random() * allMusic.length) + 1)
            do {
                randIndex = Math.round((Math.random() * allMusic.length) + 1)

            } while (musicIndex == randIndex);
            musicIndex = randIndex;
            loadMusic(musicIndex);
            playMusic()
            playingNow()
            break;
    }
});

// for show music list
showMoreBtn.addEventListener("click", () => {
    musicList.classList.toggle("show")
});
// for hide music list
hideMoreBtn.addEventListener("click", () => {
    musicList.classList.toggle("show")
})

// play song on click
function playingNow() {
    for (let j = 0; j < allLiTags.length; j++) {

        let audioTag = allLiTags[j].querySelector(".audio-duration")

        if (allLiTags[j].classList.contains("playing")) {
            allLiTags[j].classList.remove("playing")
            let adDuration = audioTag.getAttribute("t-duration");
            audioTag.innerText = adDuration;
        }

        if (allLiTags[j].getAttribute("li-index") == musicIndex) {
            allLiTags[j].classList.add("playing");
            audioTag.innerText = "playing"
        }
        allLiTags[j].setAttribute("onclick", "clicked(this)")

    }
}

function clicked(element) {
    let getLiIndex = element.getAttribute("li-index");
    musicIndex = getLiIndex;
    loadMusic(musicIndex)
    playMusic();
    playingNow();
}

// Filter  music
Filter.addEventListener('keyup', filter);

function filter(e) {
    let text = e.target.value.toLowerCase();
    document.querySelectorAll('li div span').forEach((task) => {
        let item = task.firstChild.textContent;
        // console.log(item);
        if (item.toLocaleLowerCase().indexOf(text) !== -1) {
            task.parentElement.parentElement.style.display = 'flex';
        } else {
            task.parentElement.parentElement.style.display = 'none';
        }
    });
}

// Volume bar
document.getElementById("volume").oninput = function () {
    let value = (this.value - this.min) / (this.max - this.min) * 100;


    this.style.background = 'linear-gradient(to right, var(--pink) 0%, var(--violet) ' + value + '%, rgb(224, 222, 222) ' + value + '%, rgb(224, 222, 222) 100%)'

    Audio.volume = value / 100;
    if (value === 0) {
        volume_down.innerText = 'volume_mute';
    } else if (value <= 70) {
        volume_down.innerText = 'volume_down';
    } else {
        volume_down.innerText = 'volume_up';
    }
};
