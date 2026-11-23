# Site de downloads — Comandas ERP

Site estático responsivo, sem dependências, criado como protótipo independente. Não altera o repositório privado do ERP, seu instalador nem o feed assinado de atualizações.

## Executar localmente

Abra `index.html` no navegador. Para simular melhor hospedagem:

```powershell
cd caminho\para\comandas-erp-site
python -m http.server 8080
```

Acesse `http://localhost:8080`.

## Publicação

Pode ser hospedado como site estático (GitHub Pages, Cloudflare Pages, Netlify ou outra hospedagem de arquivos estáticos). O repositório público `comandas-erp-updates` serve **apenas como fonte de releases**. Recomenda-se publicar o website em repositório próprio, separado do código do ERP e separado do feed existente.

## Origem dos downloads

`app.js` consulta a API pública de releases de `jeanmaczewski/comandas-erp-updates` e exibe o release não-pré-lançamento mais recente que possua assets. Links de download são validados para o host GitHub e repositório indicado. Quando a API falha, o site não inventa versão: apresenta link à página oficial de releases.

**Importante:** Versões em desenvolvimento, instaladores locais ou feeds de atualização distintos não aparecem automaticamente. Para disponibilizar instalação inicial, é necessário publicar **um instalador homologado e autorizado** como asset em release pública ou integrar uma outra fonte de distribuição oficial, evitando expor arquivos privados.

## Pendências antes de colocar em produção

1. Definir identidade visual final, domínio e contato de suporte.
2. Validar política de distribuição pública e licenciamento do software.
3. Preparar instalador completo homologado (o pacote ZIP de atualização não substitui o instalador inicial).
4. Verificar integridade de arquivos, checksum e código assinado segundo política do projeto.
5. Testar instalação inicial, atualização e recuperação em ambiente de homologação.
6. Publicar site e habilitar HTTPS/domínio.

O painel no topo é ilustração, não screenshot da interface real.