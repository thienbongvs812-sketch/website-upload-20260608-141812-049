
import { H as Hls } from './hls-dru42stk.js';
function setupPlayer(card){
  const video=card.querySelector('video[data-src]');
  const btn=card.querySelector('[data-play-button]');
  if(!video||!btn)return;
  let ready=false;
  btn.addEventListener('click',async()=>{
    const src=video.dataset.src;
    if(!src)return;
    btn.textContent='正在加载...';
    try{
      if(!ready){
        if(video.canPlayType('application/vnd.apple.mpegurl')){
          video.src=src;
        }else if(Hls && Hls.isSupported && Hls.isSupported()){
          const hls=new Hls({enableWorker:true,lowLatencyMode:true});
          hls.loadSource(src);
          hls.attachMedia(video);
          video._hls=hls;
        }else{
          video.src=src;
        }
        ready=true;
      }
      card.classList.add('playing');
      video.controls=true;
      await video.play();
    }catch(e){
      card.classList.add('playing');
      video.controls=true;
      btn.textContent='点击播放';
    }
  });
}
document.querySelectorAll('.player-card').forEach(setupPlayer);
