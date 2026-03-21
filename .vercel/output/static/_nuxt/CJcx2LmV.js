import{a9 as n,aa as r,$ as i,B as s}from"./BAoBiKPo.js";const u=n(async a=>{let t,e;if(a.path.startsWith("/minha-conta")&&a.path!=="/minha-conta/login"&&a.path!=="/minha-conta/esqueci-senha"&&a.path!=="/minha-conta/reset")try{[t,e]=r(()=>i("/api/customer/auth/me")),await t,e();return}catch{return s("/minha-conta/login")}});export{u as default};
//# sourceMappingURL=CJcx2LmV.js.map
