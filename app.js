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
function renderRelease(release){
 const files=(release.assets||[]).filter(a=>githubLink(a.browser_download_url));
 const isInstaller=files.some(a=>/\.(exe|msi)$/i.test(a.name)&&/(setup|instala|installer)/i.test(a.name));
 const published=release.published_at?new Date(release.published_at).toLocaleDateString('pt-BR',{timeZone:'UTC'}):'Data indisponível';
 area.innerHTML='<article class="download-card"><div class="card-head"><div><span class="tag">PUBLICAÇÃO DISPONÍVEL</span><h3>'+escapeHtml(release.name||release.tag_name)+'</h3><p>Publicada em '+escapeHtml(published)+' · Tag '+escapeHtml(release.tag_name)+'</p></div></div><div class="file-group">'+(files.length?files.map(assetHtml).join(''):'<p>Esta publicação não possui arquivos anexados.</p>')+'</div></article><aside class="note-card"><h3>Antes de baixar</h3><p>'+(isInstaller?'Há um arquivo identificado pelo nome como instalador. Confira a documentação antes de executar.':'Esta publicação não contém um instalador Windows completo identificado. Os arquivos podem ser destinados à atualização de uma instalação existente.')+'</p><ul><li>Confira plataforma e tipo de pacote.</li><li>Em produção, siga as orientações oficiais e preserve backup.</li><li>Compare o SHA-256, quando disponível.</li></ul><p><a href="'+RELEASES_PAGE+'" target="_blank" rel="noopener noreferrer">Consultar todas as versões no GitHub ↗</a></p></aside>';
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
