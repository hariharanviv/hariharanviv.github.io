// Minimal client-side markdown loader + renderer (no build required)
(function(){
  'use strict';

  function $(sel,root=document){return root.querySelector(sel)}
  function $all(sel,root=document){return Array.from(root.querySelectorAll(sel))}

  function showLoaderMessage(html){
    const el = $('#content');
    if(el) el.innerHTML = html;
  }

  async function loadMarkdown(path, pushHistory=true){
    try{
      // Provide helpful guidance when the page is opened via file://
      if(location.protocol === 'file:'){
        showLoaderMessage(`<h2>Unable to load content locally</h2><p>Browsers block fetching local files when opening <strong>index.html</strong> directly. Start a simple static server and open <code>http://localhost:8000</code> instead. Example:</p><pre><code>python3 -m http.server 8000</code></pre>`);
        return;
      }

      const res = await fetch(path);
      if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const md = await res.text();
      $('#content').innerHTML = renderMarkdown(md);
      $('#content').focus();

      // update browser history (use hash to avoid server reloads)
      if(pushHistory){
        try{ history.pushState({md: path}, '', '#'+path); }catch(e){ /* ignore */ }
      }
    } catch(e){
      showLoaderMessage(`<h2>Unable to load ${path}</h2><p>${escapeHtml(e.message)}</p><p>If you're running from the file system, start a static server (see README).</p>`);
      console.error('loadMarkdown error:', e);
    }
  }

  function escapeHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function inlineMarkdown(str){
    // images
    str = str.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');
    // links
    str = str.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    // bold
    str = str.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // italics
    str = str.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // inline code
    str = str.replace(/`([^`]+)`/g, '<code>$1</code>');
    return str;
  }

  function renderMarkdown(md){
    const lines = md.replace(/\r\n/g,'\n').split('\n');
    let out = '';

    // Detect blog listing format by checking if ANY line has ### Category | Date format
    let isBlogListing = false;
    for(let line of lines){
      if(/^###\s+.+?\s*\|/.test(line)){
        isBlogListing = true;
        break;
      }
    }
    
    if(isBlogListing){
      // BLOG LISTING MODE: parse cards only
      let blogCards = [];
      let currentCard = null;
      let foundFirstH3 = false;
      
      for(let i=0; i<lines.length; i++){
        let raw = lines[i];
        
        // Render h1/h2 before first h3
        if(!foundFirstH3 && /^#{1,2}\s/.test(raw)){
          const m = raw.match(/^(#{1,2})\s*(.*)$/);
          if(m){ out += `<h${m[1].length}>${escapeHtml(m[2])}</h${m[1].length}>`; }
          continue;
        }
        
        // Render regular paragraphs before first h3
        if(!foundFirstH3 && !/^#{1,6}\s|^---$|^\s*$/.test(raw)){
          out += '<p>'+inlineMarkdown(escapeHtml(raw))+'</p>';
          continue;
        }
        
        // Blog post header: ### Category | Date
        if(/^###\s+/.test(raw)){
          foundFirstH3 = true;
          if(currentCard) blogCards.push(currentCard);
          
          const match = raw.match(/^###\s+(.+?)\s*\|\s*(.+)$/);
          if(match){
            currentCard = {
              category: match[1].trim(),
              date: match[2].trim(),
              title: '',
              excerpt: ''
            };
          }
          continue;
        }
        
        // Blog post separator
        if(/^---$/.test(raw)){
          if(currentCard){
            blogCards.push(currentCard);
            currentCard = null;
          }
          continue;
        }
        
        // Populate current blog card
        if(currentCard){
          if(!currentCard.title && raw.trim()){
            const titleLine = raw.trim();
            const linkMatch = titleLine.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if(linkMatch){
              currentCard.title = linkMatch[1].trim();
              currentCard.link = linkMatch[2].trim();
            } else {
              currentCard.title = titleLine;
              currentCard.link = null;
            }
          } else if(currentCard.title && raw.trim()){
            if(currentCard.excerpt) currentCard.excerpt += ' ';
            currentCard.excerpt += raw.trim();
          }
        }
      }
      
      if(currentCard) blogCards.push(currentCard);
      
      // Render all blog cards (Jean Fan style)
      blogCards.forEach(card => {
        const href = card.link ? card.link : '#';
        out += `<div class="row">
        <div class="col-md-12">
          <div class="ux-design wow fadeInUp">
            <div class="design-info">
              <div class="design-title mb-25">
                <h5>${escapeHtml(card.category)}</h5>
              </div>
              <span class="pb-10">${escapeHtml(card.date)}</span>
              <a href="${href}">
                ${escapeHtml(card.title)}
                <p class="pt-20 pb-10">
                  ${inlineMarkdown(escapeHtml((card.excerpt||'').substring(0, 350)))}
                  <i>(continue reading)</i>
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>`;
      });
      
      return out;
    }
    
    // REGULAR MARKDOWN MODE
    let inCode=false, codeBuf=[], inList=false, listBuf=[];
    function flushCode(){ if(codeBuf.length){ out += '<pre><code>'+escapeHtml(codeBuf.join('\n'))+'</code></pre>'; codeBuf=[]; inCode=false } }
    function flushList(){ if(listBuf.length){ out += '<ul>' + listBuf.map(li=>'<li>'+inlineMarkdown(escapeHtml(li.replace(/^-\s+/,'')))+'</li>').join('') + '</ul>'; listBuf=[]; inList=false } }
    
    for(let i=0; i<lines.length; i++){
      let raw = lines[i];
      
      if(raw.startsWith('```')){
        if(!inCode){ inCode=true; } else { flushCode(); }
        continue;
      }
      if(inCode){ codeBuf.push(raw); continue; }

      if(/^#/.test(raw)){
        flushList();
        const m = raw.match(/^(#{1,6})\s*(.*)$/);
        if(m){ const level=m[1].length; out += `<h${level}>${escapeHtml(m[2])}</h${level}>`; continue }
      }

      if(/^[-*+]\s+/.test(raw)){
        inList=true; listBuf.push(raw); continue;
      } else {
        if(inList) flushList();
      }

      if(/^>\s?/.test(raw)){
        flushList(); out += '<blockquote>'+inlineMarkdown(escapeHtml(raw.replace(/^>\s?/,'')))+'</blockquote>'; continue;
      }

      if(/^\s*$/.test(raw)){
        continue;
      }

      out += '<p>'+inlineMarkdown(escapeHtml(raw))+'</p>';
    }
    
    flushCode(); flushList();
    return out;
  }

  // attach nav handlers
  document.addEventListener('DOMContentLoaded', ()=>{
    // initialize theme
    initTheme();

    $all('.nav-link[data-md]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const path = btn.getAttribute('data-md');
        loadMarkdown(path);
      });
    });

    // delegate clicks on markdown links inside #content to the client loader
    const content = document.getElementById('content');
    if(content){
      content.addEventListener('click', (ev)=>{
        const a = ev.target.closest && ev.target.closest('a');
        if(!a) return;
        const href = a.getAttribute('href') || '';
        // handle local markdown links (relative paths ending with .md)
        if(href.endsWith('.md')){
          ev.preventDefault();
          loadMarkdown(href);
        }
      });
    }

    // load default page (respect hash if present)
    const initial = (location.hash && location.hash.length>1) ? location.hash.slice(1) : 'about.md';
    loadMarkdown(initial, false);
    // load sidebar tidbit if available
    loadTidbit('tidbit.md');
  });

  // handle back/forward navigation
  window.addEventListener('popstate', (ev)=>{
    const md = (ev.state && ev.state.md) || ((location.hash && location.hash.length>1) ? location.hash.slice(1) : null);
    if(md){ loadMarkdown(md, false); }
    else { loadMarkdown('about.md', false); }
  });

  function initTheme(){
    const savedTheme = localStorage.getItem('theme') || 'light';
    const toggle = $('#theme-toggle');
    if(toggle){
      toggle.addEventListener('click', toggleTheme);
      updateThemeButton();
    }
    applyTheme(savedTheme);
  }

  function toggleTheme(){
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton();
  }

  function applyTheme(theme){
    if(theme === 'dark'){
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  function updateThemeButton(){
    const toggle = $('#theme-toggle');
    if(toggle){
      const isDark = document.body.classList.contains('dark-mode');
      toggle.textContent = isDark ? '☀️ Light' : '🌙 Dark';
    }
  }

  async function loadTidbit(path){
    try{
      if(location.protocol === 'file:') return; // skip when opened via file://
      const res = await fetch(path);
      if(!res.ok) return; // no tidbit available
      const md = await res.text();
      const el = $('#tidbit');
      if(el) el.innerHTML = renderMarkdown(md);
    } catch(e){
      // silently ignore
      console.debug('tidbit load error', e);
    }
  }

  // expose for debugging
  window.loadMarkdown = loadMarkdown;

})();
