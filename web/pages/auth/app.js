const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// Video fade loop smooth transition
const videoBackground = document.querySelector('.video-background');
if (videoBackground) {
  // Đặt video bắt đầu từ giây thứ 10
  videoBackground.currentTime = 10;
  
  videoBackground.addEventListener('timeupdate', function() {
    const duration = this.duration;
    const currentTime = this.currentTime;
    const timeLeft = duration - currentTime;
    
    // Fade out ở 1.5 giây cuối
    if (timeLeft <= 1.5 && timeLeft > 0) {
      this.style.opacity = timeLeft / 1.5;
    }
    // Fade in ở 1.5 giây đầu (từ giây 10-11.5)
    else if (currentTime >= 10 && currentTime <= 11.5) {
      this.style.opacity = (currentTime - 10) / 1.5;
    }
    // Opacity bình thường
    else {
      this.style.opacity = 1;
    }
  });
  
  // Đảm bảo fade in khi video load
  videoBackground.addEventListener('loadeddata', function() {
    this.currentTime = 10;
    this.style.opacity = 0;
    this.style.transition = 'opacity 1.5s ease-in-out';
  });
  
  // Khi video kết thúc, quay về giây thứ 10
  videoBackground.addEventListener('ended', function() {
    this.currentTime = 10;
    this.play();
  });
  
  // Fade in khi video bắt đầu play
  videoBackground.addEventListener('play', function() {
    if (this.currentTime < 10.5) {
      this.style.opacity = 0;
      setTimeout(() => {
        this.style.opacity = 1;
      }, 50);
    }
  });
}
