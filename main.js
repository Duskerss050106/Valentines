// main.js — shared behaviors: audio handling, hearts, and page polish
(function(){
  // Smoothly fade in audio after first user interaction to comply with autoplay rules
  const audio = document.getElementById('bgm');
  let audioStarted = false;
  function startAudioOnce(){
    if(audioStarted || !audio) return; audioStarted = true;
    try{
      audio.volume = 0.0; // start silent
      const p = audio.play();
      if(p !== undefined){
        p.then(()=>{
          // fade volume to ~0.45
          const target = 0.45;
          const step = 0.02;
          let v = 0.0;
          const iv = setInterval(()=>{
            v = Math.min(target, v + step);
            audio.volume = v;
            if(v >= target) clearInterval(iv);
          }, 120);
        }).catch(()=>{ /* play blocked */ });
      }
    }catch(e){ /* ignore */ }
  }

  // Start audio on first user gesture anywhere
  ['click','keydown','touchstart'].forEach(evt=>{
    window.addEventListener(evt, startAudioOnce, {once:true,passive:true});
  });
  // Also try to autoplay on load (may be blocked by browser policies)
  window.addEventListener('load', ()=>{
    try{
      if(audio) audio.autoplay = true;
      startAudioOnce();
    }catch(e){}
  }, {once:true});

  // HEARTS: spawn decorative hearts and make them float
  const layers = document.querySelectorAll('.hearts-layer');
  function createHeart(x, y, opts = {}){
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = opts.char || (Math.random()>0.6? '💞':'💖');
    const size = opts.size || (12 + Math.random()*28);
    heart.style.fontSize = size + 'px';
    heart.style.left = (x - size/2) + 'px';
    heart.style.top = (y - size/2) + 'px';
    const duration = opts.duration || (3000 + Math.random()*4200);
    const delay = (opts.delay || 0);
    heart.style.opacity = '0.98';
    heart.style.pointerEvents = 'none';
    heart.style.transition = `opacity ${duration}ms linear`;
    const layer = layers[Math.floor(Math.random()*layers.length) || 0];
    if(!layer) return;
    layer.appendChild(heart);
    // animate using keyframes via JS: translateY and fade
    heart.animate([
      {transform: 'translateY(0) scale(1)', opacity:1},
      {transform: `translateY(-${160 + Math.random()*300}px) scale(${1+Math.random()*0.4})`, opacity:0}
    ],{duration:duration, easing:'cubic-bezier(.2,.8,.2,1)', delay:delay});
    // cleanup
    setTimeout(()=>{ try{ heart.remove(); }catch(e){} }, duration + 150);
  }

  // Spawn gentle floating hearts periodically
  setInterval(()=>{
    layers.forEach(layer=>{
      const rect = layer.getBoundingClientRect();
      if(rect.width===0 || rect.height===0) return;
      const x = Math.random()*rect.width;
      const y = rect.height + 20;
      createHeart(x,y,{size:12 + Math.random()*18, duration:3500 + Math.random()*3000});
    });
  }, 700);

  // Mouse-spawn hearts where user moves
  window.addEventListener('mousemove',(e)=>{
    layers.forEach(layer=>{
      const rect = layer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // spawn a small heart
      createHeart(x,y,{size:10 + Math.random()*10, duration:1800 + Math.random()*1200});
    });
  }, {passive:true});

  // Extra celebration flourish on the celebrate page
  document.addEventListener('DOMContentLoaded', ()=>{
    const pid = document.body.querySelector('.page')?.id || '';
    if(pid && pid.includes('celebrate')){
      // spawn many hearts quickly
      const layer = document.querySelector('.hearts-layer');
      if(layer){
        for(let i=0;i<28;i++){
          const rect = layer.getBoundingClientRect();
          const x = Math.random()*rect.width;
          const y = Math.random()*rect.height;
          createHeart(x,y,{size:16 + Math.random()*28, duration:2200 + Math.random()*1600, delay: Math.random()*500});
        }
      }
      // small confetti-style hearts
      setInterval(()=>{
        const layer = document.querySelector('.hearts-layer');
        if(!layer) return;
        const rect = layer.getBoundingClientRect();
        for(let i=0;i<6;i++){
          createHeart(Math.random()*rect.width, Math.random()*rect.height,{size:12 + Math.random()*20, duration:1200 + Math.random()*1000});
        }
      }, 700);
    }
  });

  // Small safety: ensure pages add visible class on load if not already (extra fade-in)
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.page').forEach(p=>{ if(!p.classList.contains('visible')) setTimeout(()=>p.classList.add('visible'),60); });
  });

})();
