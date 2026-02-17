// [ ACOUSTIC_RESONANCE_SYSTEM_V2.2 ]
const playlist = [
    { title: "Track1", file: "track1.mp3" },
    { title: "Track2", file: "track2.mp3" },
    { title: "Track3", file: "track3.mp3" },
    { title: "Track4", file: "track4.mp3" }
];

let currentTrackIndex = 0;
const audio = new Audio();
audio.volume = 0.5;

const initJukebox = () => {
    const jukeboxHTML = `
    <div id="jukebox-card" style="position: fixed; top: 100px; left: 20px; width: 120px; z-index: 999999; background: rgba(5,5,10,0.98); border: 1px solid var(--warning-orange); border-left: 3px solid var(--warning-orange); padding: 12px; pointer-events: all; cursor: default; box-shadow: 0 0 20px rgba(0,0,0,0.8); user-select: none;">
        
        <div id="jukebox-header" style="color:var(--warning-orange); font-size:0.55rem; font-weight:bold; margin-bottom:10px; display:flex; justify-content:space-between; cursor: move; border-bottom: 1px solid #333; padding-bottom: 5px;">
            <span>[ MY PLAYLIST ]</span>
            <span>☊</span>
        </div>

        <div id="track-info" style="font-size: 0.7rem; margin-bottom: 10px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Fira Code', monospace;">TRACK: IDLE</div>
        
        <div id="progress-container" style="width: 100%; height: 6px; background: #111; margin-bottom: 12px; cursor: pointer; position: relative; border-radius: 2px;">
            <div id="progress-bar" style="width: 0%; height: 100%; background: var(--warning-orange); box-shadow: 0 0 8px var(--warning-orange); border-radius: 2px;"></div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
            <button id="prev-btn" class="btn-mini">⟪</button>
            <button id="play-pause" class="btn-mini" style="color: var(--plasma-cyan); border-color: var(--plasma-cyan); font-size: 1rem; min-width: 45px;">▶</button>
            <button id="next-btn" class="btn-mini">⟫</button>
        </div>
        
        <input type="range" id="vol-slider" min="0" max="1" step="0.01" value="0.5" 
               style="width: 100%; margin-top: 12px; accent-color: var(--warning-orange); cursor: pointer; height: 3px;">
    </div>

    <style>
        .btn-mini {
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--warning-orange);
            color: var(--warning-orange);
            cursor: pointer;
            font-family: 'Fira Code', monospace;
            padding: 4px 10px;
            font-size: 0.75rem;
            transition: 0.2s;
        }
        .btn-mini:hover { background: rgba(255, 174, 0, 0.2); box-shadow: 0 0 8px var(--warning-orange); }
        #jukebox-card:active { cursor: grabbing; }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', jukeboxHTML);

    const card = document.getElementById('jukebox-card');
    const header = document.getElementById('jukebox-header');
    const progressContainer = document.getElementById('progress-container');
    const playBtn = document.getElementById('play-pause');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const volSlider = document.getElementById('vol-slider');

    // --- BEAM INTERFERENCE PROTECTION ---
    // This stops the "pointerdown" event from reaching the background simulation
    const stopBeam = (e) => e.stopPropagation();
    card.addEventListener('pointerdown', stopBeam);
    card.addEventListener('mousedown', stopBeam);
    card.addEventListener('click', stopBeam);

    // --- DRAGGABLE LOGIC ---
    let isDragging = false, offset = { x: 0, y: 0 };

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offset = { x: card.offsetLeft - e.clientX, y: card.offsetTop - e.clientY };
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        card.style.left = (e.clientX + offset.x) + 'px';
        card.style.top = (e.clientY + offset.y) + 'px';
        card.style.bottom = 'auto'; 
    });

    document.addEventListener('mouseup', () => isDragging = false);

    // --- BUTTON CONTROLS ---
    playBtn.addEventListener('click', (e) => {
        if (audio.paused) {
            audio.play().catch(() => console.log("User interaction required"));
            playBtn.innerText = "‖";
        } else {
            audio.pause();
            playBtn.innerText = "▶";
        }
    });

    nextBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        audio.play();
        playBtn.innerText = "‖";
    });

    prevBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        audio.play();
        playBtn.innerText = "‖";
    });

    // --- SCRUBBING (FORWARDING) ---
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        if (audio.duration) audio.currentTime = pos * audio.duration;
    });

    // --- AUDIO UPDATES ---
    volSlider.oninput = (e) => { audio.volume = e.target.value; };
    
    audio.ontimeupdate = () => {
        const pct = (audio.currentTime / audio.duration) * 100;
        document.getElementById('progress-bar').style.width = (pct || 0) + "%";
    };
    
    audio.onended = () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        audio.play();
    };

    function loadTrack(index) {
        const track = playlist[index];
        audio.src = track.file;
        document.getElementById('track-info').innerText = `TRACK: ${track.title}`;
    }

    loadTrack(currentTrackIndex);
};

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJukebox);
} else {
    initJukebox();
}