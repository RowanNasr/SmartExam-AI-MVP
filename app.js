
const video = document.getElementById('video');
const fallback = document.getElementById('fallback');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');
const feedBadge = document.getElementById('feedBadge');
const feedDot = document.getElementById('feedDot');
const statStatus = document.getElementById('statStatus');
const statEvents = document.getElementById('statEvents');
const statReviewed = document.getElementById('statReviewed');
const eventList = document.getElementById('eventList');
const report = document.getElementById('report');
const selectedIncident = document.getElementById('selectedIncident');

let stream = null;
let monitoring = false;
let events = [];
let selectedId = null;
let reviewed = 0;

function nowTime(){
  return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
function uid(){ return 'EVT-' + String(Date.now()).slice(-6); }

function setFeedMode(mode){
  if(mode==='video'){
    video.style.display='block'; fallback.style.display='none';
  }else{
    video.style.display='none'; fallback.style.display='block';
  }
}
function setStatus(text, live=false){
  statStatus.textContent=text;
  feedDot.classList.toggle('live', live);
}
function resizeCanvas(){
  overlay.width = overlay.clientWidth;
  overlay.height = overlay.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);

document.getElementById('videoFile').addEventListener('change', e=>{
  const file=e.target.files[0]; if(!file) return;
  if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
  video.srcObject=null;
  video.src=URL.createObjectURL(file);
  setFeedMode('video');
  feedBadge.textContent='UPLOADED VIDEO';
  video.play();
});

document.getElementById('cameraBtn').addEventListener('click', async()=>{
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    video.srcObject=stream; video.src='';
    setFeedMode('video'); feedBadge.textContent='LIVE CAMERA';
    await video.play();
  }catch(e){
    alert('Camera access was not available. You can upload a video instead.');
  }
});

document.getElementById('startBtn').addEventListener('click', ()=>{
  monitoring=true; setStatus('Monitoring', true);
  feedBadge.textContent = (video.style.display==='block' ? 'MONITORING' : 'DEMO MONITORING');
  animateOverlay();
});

document.getElementById('stopBtn').addEventListener('click', ()=>{
  monitoring=false; setStatus('Stopped', false);
  ctx.clearRect(0,0,overlay.width,overlay.height);
});

function animateOverlay(){
  resizeCanvas();
  const draw=()=>{
    ctx.clearRect(0,0,overlay.width,overlay.height);
    if(!monitoring) return;
    ctx.strokeStyle='#27d5de'; ctx.lineWidth=2;
    ctx.fillStyle='rgba(39,213,222,.09)';
    const boxes=[
      [.18,.36,.15,.28],[.46,.34,.14,.26],[.67,.37,.14,.27]
    ];
    boxes.forEach(b=>{
      const [x,y,w,h]=b; ctx.strokeRect(x*overlay.width,y*overlay.height,w*overlay.width,h*overlay.height);
      ctx.fillRect(x*overlay.width,y*overlay.height,w*overlay.width,h*overlay.height);
    });
    requestAnimationFrame(draw);
  };
  draw();
}

document.querySelectorAll('.eventBtn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    if(!monitoring){
      monitoring=true; setStatus('Monitoring', true); animateOverlay();
    }
    const evt={
      id:uid(),
      type:btn.dataset.type,
      risk:btn.dataset.risk,
      seat:document.getElementById('seatInput').value.trim() || 'A12',
      time:nowTime(),
      decision:'Pending human review'
    };
    events.unshift(evt); selectedId=evt.id;
    statEvents.textContent=events.length;
    renderEvents(); selectEvent(evt.id);
    flashAlert();
  });
});

function flashAlert(){
  resizeCanvas();
  ctx.save();
  ctx.strokeStyle='#ff6b6b'; ctx.lineWidth=4;
  ctx.strokeRect(.55*overlay.width,.32*overlay.height,.18*overlay.width,.32*overlay.height);
  ctx.restore();
}

function renderEvents(){
  if(!events.length){
    eventList.className='eventList emptyState';
    eventList.innerHTML='No incidents flagged yet.';
    return;
  }
  eventList.className='eventList';
  eventList.innerHTML=events.map(e=>`
    <div class="eventItem ${e.id===selectedId?'selected':''}" data-id="${e.id}">
      <div class="dot ${e.risk.toLowerCase()}"></div>
      <div><b>${e.type}</b><div class="eventMeta">${e.id} • Seat ${e.seat} • ${e.time} • ${e.decision}</div></div>
      <div class="risk">${e.risk}</div>
    </div>`).join('');
  document.querySelectorAll('.eventItem').forEach(el=>el.addEventListener('click',()=>selectEvent(el.dataset.id)));
}

function selectEvent(id){
  selectedId=id; renderEvents();
  const e=events.find(x=>x.id===id);
  selectedIncident.textContent=e? `${e.id} — ${e.type} — Seat ${e.seat}`:'None';
}

document.getElementById('generateBtn').addEventListener('click', ()=>{
  const e=events.find(x=>x.id===selectedId);
  if(!e){ report.innerHTML='<strong>No event selected.</strong><br>Please flag or select an incident first.'; return; }
  report.innerHTML=`
    <strong>Potential Incident — Pending Human Review</strong><br><br>
    <b>Event ID:</b> ${e.id}<br>
    <b>Seat:</b> ${e.seat}<br>
    <b>Timestamp:</b> ${e.time}<br>
    <b>Risk level:</b> ${e.risk}<br>
    <b>Observed indicator:</b> ${e.type}.<br>
    <b>System interpretation:</b> The observed behavior may warrant invigilator attention and evidence review.<br>
    <b>Recommended action:</b> Review the source feed and contextual evidence before making any decision.<br><br>
    <b>AI safety note:</b> This summary is an assistance layer and must not be treated as proof of cheating or as an automated disciplinary decision.
  `;
});

document.getElementById('copyBtn').addEventListener('click', async()=>{
  await navigator.clipboard.writeText(report.innerText);
  alert('Report copied.');
});

document.getElementById('downloadBtn').addEventListener('click', ()=>{
  const payload={project:'SmartExam AI', exportedAt:new Date().toISOString(), events};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='smartexam_events.json'; a.click();
});

document.getElementById('clearBtn').addEventListener('click', ()=>{
  events=[];selectedId=null;reviewed=0;statEvents.textContent='0';statReviewed.textContent='0';
  selectedIncident.textContent='None';
  report.textContent='Select an event from the queue, then generate a structured incident summary.';
  renderEvents();
});

document.querySelectorAll('[data-decision]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const e=events.find(x=>x.id===selectedId);
    if(!e){ alert('Select an incident first.'); return; }
    if(e.decision==='Pending human review') reviewed++;
    e.decision=btn.dataset.decision;
    statReviewed.textContent=reviewed;
    renderEvents();
    report.innerHTML += `<br><br><strong>Reviewer decision:</strong> ${e.decision}`;
  });
});
