/* Kiber optional browser-only conversation memory, OFF by default. Not model training. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KiberDialogMemory=api})(typeof window==='object'?window:globalThis,()=>{
'use strict';
const PREFERENCE='kiber_conversation_memory_optin_v1',DATA='kiber_conversation_history_local_v1',MAX=24;
function allowed(){try{return localStorage.getItem(PREFERENCE)==='on'}catch{return false}}
function clear(){try{localStorage.removeItem(DATA)}catch{}}
function setEnabled(on){try{if(on){localStorage.setItem(PREFERENCE,'on')}else{localStorage.removeItem(PREFERENCE);clear()}}catch{return false}return allowed()}
function recent(){if(!allowed())return[];try{const a=JSON.parse(localStorage.getItem(DATA)||'[]');return Array.isArray(a)?a.filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').slice(-MAX).map(x=>({role:x.role,content:x.content.slice(0,950)})):[]}catch{return[]}}
function add(role,content){if(!allowed()||!['user','assistant'].includes(role))return false;let rows=recent();rows.push({role,content:String(content||'').slice(0,950)});try{localStorage.setItem(DATA,JSON.stringify(rows.slice(-MAX)));return true}catch{return false}}
function statusText(){return allowed()?'Memoria ON':'Memoria OFF'}
return Object.freeze({allowed,setEnabled,clear,recent,add,statusText,scope:'solo questo browser',training:false,version:'1.0'});
});
