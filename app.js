'use strict';
// A central consulta apenas publicações públicas do repositório oficial de distribuição.
const RELEASES_API='https://api.github.com/repos/jeanmaczewski/comandas-erp-updates/releases?per_page=30';
const RELEASES_PAGE='https://github.com/jeanmaczewski/comandas-erp-updates/releases';
const area=document.getElementById('release-area');
const status=document.getElementById('source-status');
const escapeHtml=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtSize=(n)=>((Number(n)||0)/1048576).toLocaleString('pt-BR',{maximumFractionDigits:1})+' MB';
function classify(name){
 const n=name.toLowerCase();
 if(/\.(exe|msi)$/.test(n)&&/(setup|instala|installer)/.test(n))return 'Instalador Windows — confirme se é instalação inicial';
 if(/\.(exe|msi)$/.test(n))return 'Executável Windows — verificar finalidade';
 if(/\.deb$/.test(n))return 'Pacote Linux (Debian/Ubuntu)';
 if(/\.zip$/.test(n)&&/(atualiza|update|patch)/.test(n))return 'Atualização — não é instalador inicial';
 if(/\.zip$/.test(n))return 'Arquivo ZIP — verificar finalidade';
 return 'Arquivo de distribuição';
}
function githubLink(url){
 return typeof url==='string'&&/^https:\/\/github\.com\/jeanmaczewski\/comandas-erp-updates\/releases\/download\//.test(url)?url:null;
}
function assetHtml(a){
 const link=githubLink(a.browser_download_url);if(!link)return '';
 const sha=typeof a.digest==='string'&&/^sha256:[a-f0-9]{64}$/i.test(a.digest)?a.digest.slice(7):null;
 return '<div class="file-item"><div><strong>'+escapeHtml(a.name)+'</strong><small>'+escapeHtml(classify(a.name))+' · '+fmtSize(a.size)+'</small>'+(sha?'<code class="hash">SHA-256: '+sha+'</code>':'')+'</div><a class="file-btn" href="'+escapeHtml(link)+'" target="_blank" rel="noopener noreferrer" aria-label="Baixar '+escapeHtml(a.name)+'">Baixar ↗</a></div>';
}
function isSetupAsset(a){
 return /\.(exe|msi)$/i.test(a.name||'') && /(?:setup|instala(?:dor)?|installer)/i.test(a.name||'') && !!githubLink(a.browser_download_url);
}
function renderRelease(release){
 const assets=(release.assets||[]).filter(a=>githubLink(a.browser_download_url));
 const setup=assets.find(isSetupAsset);
 const linux=assets.find(a=>/^comandaserp[_-].*amd64\.deb$/i.test(a.name||'') && !!githubLink(a.browser_download_url));
 const published=release.published_at?new Date(release.published_at).toLocaleDateString('pt-BR',{timeZone:'UTC'}):'Data indisponível';
 const version=escapeHtml(release.tag_name);
 const title=escapeHtml(release.name||release.tag_name);
 const header='<article class="download-card"><div class="card-head"><div><span class="tag">VERSÃO OFICIAL</span><h3>'+title+'</h3><p>Publicada em '+escapeHtml(published)+' · Tag '+version+'</p></div></div>';
 if(setup){
  area.innerHTML=header+'<div class="file-group">'+assetHtml(setup)+'</div></article>'+
   '<aside class="note-card"><h3>Instalação Windows</h3><p>O instalador vem em um único arquivo. Execute o Setup e siga as etapas exibidas.</p><ul><li>Confira a versão e o SHA-256, quando disponível.</li><li>Antes de instalar sobre um sistema em uso, preserve um backup.</li><li>O Windows pode alertar sobre editor desconhecido em arquivos sem assinatura comercial.</li></ul>'+
   (linux?'<h3>Instalador Linux</h3>'+assetHtml(linux):'<p>Não há instalador Linux desta versão publicado no canal oficial.</p>')+
   '</aside>';
  return;
 }
 // Exibir apenas instaladores finais: nunca divulgar ZIPs de atualização como downloads do site.
 area.innerHTML=header+'<p><strong>Instalador Windows desta versão ainda não disponível para download direto.</strong></p><p>Esta central publica somente instaladores completos. Nenhum pacote técnico de atualização será oferecido aqui.</p></article>'+
 '<aside class="note-card"><h3>Disponibilidade</h3><p>O Setup Windows em arquivo único ainda não foi anexado à publicação oficial '+version+'.</p>'+
 (linux?'<h3>Instalador Linux</h3>'+assetHtml(linux):'<p>O instalador Linux desta versão também não foi publicado.</p>')+
 '<p>O software e as atualizações internas permanecem separados desta central de downloads.</p></aside>';
}

async function load(){
 try{
  const response=await fetch(RELEASES_API,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const all=await response.json();
  if(!Array.isArray(all))throw Error('Resposta inesperada');
  const releases=all.filter(r=>!r.draft&&!r.prerelease&&Array.isArray(r.assets)&&r.assets.length>0).sort((a,b)=>new Date(b.published_at||0)-new Date(a.published_at||0));
  if(releases.length){renderRelease(releases[0]);status.textContent='● Publicações consultadas';}
  else{area.innerHTML='<div class="loading">Nenhum arquivo disponível nas publicações oficiais. <a href="'+RELEASES_PAGE+'" target="_blank" rel="noopener noreferrer">Ver repositório de releases</a>.</div>';status.textContent='Sem arquivos publicados';}
 }catch(err){
  area.innerHTML='<div class="loading"><strong>Não foi possível consultar as publicações agora.</strong><p>Por segurança, não exibiremos um link de download não verificado. Acesse a <a href="'+RELEASES_PAGE+'" target="_blank" rel="noopener noreferrer">página oficial de versões no GitHub</a>.</p></div>';
  status.textContent='Consulta temporariamente indisponível';
 }
}
load();
