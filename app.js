'use strict';
// Site público: disponibiliza apenas instaladores completos, nunca pacotes de atualização.
const RELEASES_API='https://api.github.com/repos/jeanmaczewski/comandas-erp-updates/releases?per_page=100';
const area=document.getElementById('release-area');
const status=document.getElementById('source-status');
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const size=(bytes)=>((Number(bytes)||0)/1048576).toLocaleString('pt-BR',{maximumFractionDigits:1})+' MB';
function official(asset){
 const url=asset?.browser_download_url;
 return typeof url==='string' && /^https:\/\/github\.com\/jeanmaczewski\/comandas-erp-updates\/releases\/download\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(url);
}
function windowsType(asset){
 const n=asset?.name||'';
 if(/(?:setup|instalador|installer)/i.test(n)&&/\.(exe|msi)$/i.test(n))return 'exe';
 if(/instalador[-_ ]completo/i.test(n)&&/\.zip$/i.test(n))return 'zip';
 return null;
}
function linuxType(asset){
 return /(?:^|[-_])comandaserp[_-].*(?:amd64|x64)\.deb$/i.test(asset?.name||'');
}
function findInstallers(releases){
 const valid=releases.filter(r=>!r.draft&&!r.prerelease&&Array.isArray(r.assets))
   .sort((a,b)=>new Date(b.published_at||0)-new Date(a.published_at||0));
 let win=null, linux=null;
 for(const release of valid){
  const assets=release.assets.filter(official);
  if(!win){
   const setup=assets.find(a=>windowsType(a)==='exe');
   const archive=assets.find(a=>windowsType(a)==='zip');
   if(setup||archive)win={release,asset:setup||archive,type:setup?'exe':'zip'};
  }
  if(!linux){
   const deb=assets.find(linuxType);
   if(deb)linux={release,asset:deb,type:'deb'};
  }
  if(win&&linux)break;
 }
 return {win,linux};
}
function fileCard(item,platform){
 if(!item)return '<div class="file-item"><div><strong>'+platform+'</strong><small>Instalador indisponível no canal público.</small></div></div>';
 const a=item.asset,r=item.release;
 const digest=typeof a.digest==='string'&&/^sha256:[0-9a-f]{64}$/i.test(a.digest)?a.digest.slice(7):'';
 const detail=item.type==='zip'?'Instalador completo em ZIP — extraia antes de instalar':item.type==='deb'?'Pacote instalador Debian/Ubuntu (AMD64)':'Setup único — execute para instalar';
 return '<div class="file-item"><div><strong>'+esc(platform)+' — versão '+esc(r.tag_name.replace(/^v/,''))+'</strong><small>'+esc(detail)+' · '+size(a.size)+'</small><small>'+esc(a.name)+'</small>'+(digest?'<code class="hash">SHA-256: '+digest+'</code>':'')+'</div><a class="file-btn" href="'+esc(a.browser_download_url)+'" target="_blank" rel="noopener noreferrer">Baixar ↗</a></div>';
}
function render(data){
 const {win,linux}=data;
 area.innerHTML='<article class="download-card"><div class="card-head"><div><span class="tag">INSTALADORES OFICIAIS</span><h3>Baixe o Comandas ERP</h3><p>Escolha o instalador disponível para seu sistema operacional.</p></div></div><div class="file-group">'+fileCard(win,'Windows')+fileCard(linux,'Linux')+'</div></article>'+
 '<aside class="note-card"><h3>Como instalar</h3><p>Windows: '+(win?.type==='zip'?'o instalador completo disponível está dentro de um ZIP. Extraia o pacote e siga as instruções incluídas.':'execute o Setup seguindo as instruções.')+'</p><p>Linux: '+(linux?'utilize o pacote .deb compatível com Debian/Ubuntu.':'nenhum instalador publicado.')+'</p><ul><li>As versões podem ser diferentes entre plataformas.</li><li>Faça backup antes de instalar sobre uma instalação existente.</li><li>Consulte o SHA-256 exibido para conferir a integridade do download.</li></ul></aside>';
 status.textContent=win||linux?'● Instaladores verificados':'Nenhum instalador publicado';
}
async function load(){
 try{
  const response=await fetch(RELEASES_API,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const releases=await response.json();
  if(!Array.isArray(releases))throw Error('Resposta inválida do GitHub');
  render(findInstallers(releases));
 }catch(error){
  status.textContent='Consulta indisponível';
  area.innerHTML='<div class="loading"><strong>Não foi possível consultar os instaladores agora.</strong><p>Por segurança, não exibimos links não verificados. Tente novamente mais tarde.</p></div>';
 }
}
load();
