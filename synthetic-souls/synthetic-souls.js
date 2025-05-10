// synthetic-souls.js

document.addEventListener("DOMContentLoaded", () => {
    // Glitch hover effect on title
    const title = document.querySelector('.glitch-title');
    title.addEventListener('mouseenter', () => {
      title.style.animation = 'glitch-offset 0.3s infinite';
    });
    title.addEventListener('mouseleave', () => {
      title.style.animation = 'glitch-flicker 1.2s infinite';
    });
  
    // Hover-triggered sounds on member cards
    const members = document.querySelectorAll('.member');
    members.forEach(member => {
      const audio = member.querySelector('audio');
      if (audio) {
        member.addEventListener('mouseenter', () => {
          audio.currentTime = 0;
          audio.volume = 0.3;
          audio.play();
        });
        member.addEventListener('mouseleave', () => {
          audio.pause();
          audio.currentTime = 0;
        });
      }
    });
  
    // Autoplay toggle for music gallery
    const gallery = document.querySelectorAll('.audio-gallery audio');
    let currentPlaying = null;
    gallery.forEach(audio => {
      audio.addEventListener('play', () => {
        if (currentPlaying && currentPlaying !== audio) {
          currentPlaying.pause();
        }
        currentPlaying = audio;
      });
    });
  });
  