(function(){
  async function loadLeaflet(){
    if(window.L) return Promise.resolve();
    // load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    // load script
    return new Promise((resolve,reject)=>{
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = ()=>resolve();
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  async function initTalks(){
    try{
      await loadLeaflet();
      const res = await fetch('talks/talks.json');
      if(!res.ok) throw new Error('talks.json not found');
      const talks = await res.json();
      const container = document.getElementById('talkmap');
      if(!container) return;
      // init map centered on mean coordinates
      const lat = (talks.reduce((s,t)=>s+(t.lat||0),0) / talks.length) || 20;
      const lng = (talks.reduce((s,t)=>s+(t.lng||0),0) / talks.length) || 0;
      const map = L.map(container).setView([lat,lng], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      talks.forEach(t=>{
        if(!t.lat || !t.lng) return;
        const marker = L.marker([t.lat,t.lng]).addTo(map);
        const date = t.date ? new Date(t.date).toLocaleDateString() : '';
        const slides = t.slides ? `<a href="${t.slides}" target="_blank">Slides</a>` : '';
        marker.bindPopup(`<strong>${t.title}</strong><br>${t.venue} — ${t.location}<br>${date}<br>${slides}`);
      });

      // render list below map
      const content = document.getElementById('content');
      if(content){
        const list = document.createElement('div');
        list.className = 'talk-list';
        list.innerHTML = '<h3>Talks</h3>' + talks.map(t=>{
          const date = t.date ? new Date(t.date).toLocaleDateString() : '';
          const slides = t.slides ? ` — <a href="${t.slides}" target="_blank">Slides</a>` : '';
          return `<div class="talk-item"><strong>${t.title}</strong> — ${t.venue}, ${t.location} <span class="muted">${date}</span>${slides}</div>`;
        }).join('\n');
        content.appendChild(list);
      }
    }catch(e){
      console.error('initTalks error', e);
      const container = document.getElementById('talkmap');
      if(container) container.innerHTML = '<p>Unable to load talks map.</p>';
    }
  }

  // expose
  window.initTalks = initTalks;
})();
