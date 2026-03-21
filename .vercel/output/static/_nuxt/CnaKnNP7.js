import{s as M}from"./luk5rRYq.js";import{u as F}from"./AugevS0B.js";import{e as Z,f as b,z as E,v as N,c as m,a as g,k as l,t as v,x as R,o as h}from"./BAoBiKPo.js";import"./BK_mIkFx.js";import"./CoNK7_gV.js";const Y={class:"py-20"},O={class:"max-w-4xl mx-auto px-6"},V={key:0,class:"text-gray-500"},W={key:1},j={class:"text-2xl font-bold"},q={key:2},D={class:"text-3xl font-bold mb-6"},K=["innerHTML"],ot=Z({__name:"[slug]",async setup(P){let f,y;const k=F(),p=b(()=>k.language.value==="en"?{defaultTitle:"Activation tutorial",loading:"Loading tutorial...",notFound:"Tutorial not found",noContent:"No content."}:k.language.value==="es"?{defaultTitle:"Tutorial de activación",loading:"Cargando tutorial...",notFound:"Tutorial no encontrado",noContent:"Sin contenido."}:{defaultTitle:"Tutorial de Ativação",loading:"Carregando tutorial...",notFound:"Tutorial não encontrado",noContent:"Sem conteúdo."}),S=E().params.slug,{data:T,pending:$,error:C}=([f,y]=N(()=>R(()=>`/api/products/${S}?includeTutorial=1`,{server:!1})),f=await f,y(),f),_=b(()=>{const e=T.value;return e?{title:e.tutorialTitle||p.value.defaultTitle,content:e.tutorialContent||""}:null});function d(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function w(e){const t=String(e||"").trim();return/^https?:\/\//i.test(t)||/^mailto:/i.test(t)||t.startsWith("/")}function z(e){const t=String(e||"").trim();if(!/^https?:\/\//i.test(t))return"";const n=t.match(/^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{6,})/i);if(n?.[1])return n[1];const i=t.match(/[?&]v=([a-zA-Z0-9_-]{6,})/i);if(i?.[1])return i[1];const r=t.match(/^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/i);return r?.[1]?r[1]:""}function A(e){const t=String(e||"").replace(/[^a-zA-Z0-9_-]/g,"");return t?`
<div class="my-6 aspect-video w-full overflow-hidden rounded-lg bg-black/5">
  <iframe
    class="h-full w-full"
    src="https://www.youtube-nocookie.com/embed/${t}"
    title="YouTube video"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</div>
`.trim():""}function x(e,t){const n=String(e||"").trim();if(!w(n))return"";const i=d(String(t||"").trim());return`
<figure class="my-6">
  <img src="${d(n)}" alt="${i}" class="max-w-full rounded-lg border bg-white" loading="lazy" />
</figure>
`.trim()}function B(e){return d(String(e||"")).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(i,r,a)=>{const s=String(a||"");return w(s)?`<a href="${s}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${r}</a>`:`${r} (${s})`}).replace(/(https?:\/\/[^\s<]+)/g,i=>{const r=String(i||"");return w(r)?`<a href="${r}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${r}</a>`:r})}function H(e){const t=String(e||"").trim();if(!t)return"";if(/^https?:\/\//i.test(t)&&!/\s/.test(t)){const o=z(t);if(o)return A(o)}if(/^https?:\/\//i.test(t)&&!/\s/.test(t)){const c=String(t).match(/^https?:\/\/(?:www\.)?vimeo\.com\/(\d{6,})/i);if(c?.[1]){const u=String(c[1]).replace(/[^0-9]/g,"");if(u)return`
<div class="my-6 aspect-video w-full overflow-hidden rounded-lg bg-black/5">
  <iframe
    class="h-full w-full"
    src="https://player.vimeo.com/video/${u}"
    title="Vimeo video"
    frameborder="0"
    allow="autoplay; fullscreen; picture-in-picture"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</div>
`.trim()}}const n=t.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);if(n){const o=x(n[2],n[1]);if(o)return o}const r=d(t).replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,(o,c,u)=>x(String(u||""),String(c||""))||o),a="__HTML_BLOCK__",s=[],L=r.replace(/<figure[\s\S]*?<\/figure>/g,o=>(s.push(o),`${a}${s.length-1}${a}`));return`<p class="mb-4 whitespace-pre-wrap">${B(L).replace(new RegExp(`${a}(\\d+)${a}`,"g"),(o,c)=>{const u=Number(c);return s[u]||""})}</p>`}const I=b(()=>{const i=String(_.value?.content||"").replace(/\r\n/g,`
`).split(/\n{2,}/g).map(s=>H(s)).filter(Boolean).join(""),r=`<p class="text-gray-500">${d(p.value.noContent)}</p>`;return M(i||r,{allowIframes:!0})});return(e,t)=>(h(),m("section",Y,[g("div",O,[l($)?(h(),m("div",V,v(l(p).loading),1)):l(C)||!l(_)?(h(),m("div",W,[g("h1",j,v(l(p).notFound),1)])):(h(),m("div",q,[g("h1",D,v(l(_).title),1),g("div",{class:"bg-gray-50 p-6 rounded-lg text-sm",innerHTML:l(I)},null,8,K)]))])]))}});export{ot as default};
//# sourceMappingURL=CnaKnNP7.js.map
