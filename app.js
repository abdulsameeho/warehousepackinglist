
(() => {
const $ = id => document.getElementById(id);
const today = () => new Date().toISOString().slice(0,10);
const stateKey = 'eutcoPackingListDraft_v1', seqKey = 'eutcoPackingListSequence_v1';
let data, savedCustomers=[], savedPreparers=[];
const blank = () => ({number:nextNumber(),date:today(),customer:'',preparedBy:'',notes:'',boes:[],items:[],pallets:[]});
function nextNumber(){let n=Number(localStorage.getItem(seqKey)||1);localStorage.setItem(seqKey,String(n+1));return 'EUT-PL-'+String(n).padStart(4,'0')}
function bumpSequence(number){let m=String(number||'').match(/EUT-PL-(\d+)/i);if(m)localStorage.setItem(seqKey,String(Math.max(Number(localStorage.getItem(seqKey)||1),Number(m[1])+1)))}
function uid(){return Math.random().toString(36).slice(2,10)}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2500)}
function defaultLoad(){try{const d=JSON.parse(localStorage.getItem(stateKey));if(d&&d.number){data=d;bumpSequence(data.number);return}}catch(e){}data=blank()}
function totals(){return {pallets:data.pallets.length,pieces:data.pallets.reduce((s,p)=>s+p.lines.reduce((a,l)=>a+Math.max(0,Number(l.qty)||0),0),0),boe:data.boes.length,models:new Set(data.pallets.flatMap(p=>p.lines.filter(l=>Number(l.qty)>0).map(l=>l.itemId))).size}}
function save(silent=false){data.customer=$('customer').value;data.preparedBy=$('preparedBy').value;data.date=$('packingDate').value;data.notes=$('notes').value;try{localStorage.setItem(stateKey,JSON.stringify(data));localStorage.setItem('eutcoPackingListPeople_v1',JSON.stringify({customers:[...new Set([...(savedCustomers||[]),data.customer].filter(Boolean))],preparers:[...new Set([...(savedPreparers||[]),data.preparedBy].filter(Boolean))]}));$('saveStatus').textContent='Saved locally · '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});if(!silent)toast('Draft saved in this browser')}catch(e){if(!silent)toast('Could not save locally — export a backup')}}
function syncForm(){ $('packingNo').value=data.number;$('packingDate').value=data.date||today();$('customer').value=data.customer||'';$('preparedBy').value=data.preparedBy||'';$('notes').value=data.notes||''; }
function renderBoes(){$('boeList').innerHTML=data.boes.map((b,i)=>`<div class="boe-chip"><span>${esc(b)}</span><button class="no-print" data-remove-boe="${i}" aria-label="Remove BOE">×</button></div>`).join('');$('boeCount').textContent=data.boes.length;$('statBoe').textContent=data.boes.length;$('summaryBoe').value=data.boes.length}
function renderCatalogue(){
 $('catalogueBody').innerHTML=data.items.map((it,i)=>`<tr><td><input aria-label="Model name" data-item-field="${it.id}" data-field="name" value="${esc(it.name)}" placeholder="e.g. Lenovo ThinkPad"></td><td><input aria-label="Part number" data-item-field="${it.id}" data-field="part" value="${esc(it.part)}" placeholder="Part / SKU"></td><td><input aria-label="Description" data-item-field="${it.id}" data-field="description" value="${esc(it.description||'')}" placeholder="Optional details"></td><td><strong>${data.pallets.reduce((s,p)=>s+p.lines.filter(l=>l.itemId===it.id).reduce((a,l)=>a+(Number(l.qty)||0),0),0)}</strong></td><td class="no-print"><button class="danger small" data-delete-item="${it.id}">Delete</button></td></tr>`).join('');
 $('catalogueEmpty').style.display=data.items.length?'none':'block';
}
function itemOptions(selected){return '<option value="">Select item…</option>'+data.items.map(i=>`<option value="${i.id}" ${i.id===selected?'selected':''}>${esc(i.name||'(Unnamed item)')} — ${esc(i.part||'No part no.')}</option>`).join('')}
function renderPallets(){
 if(!data.pallets.length){$('palletsBody').innerHTML='<div class="empty">No pallets yet. Add a pallet to start assigning items.</div>';return}
 $('palletsBody').innerHTML=data.pallets.map((p,pi)=>`<article class="pallet-card" data-pallet-card="${p.id}">
 <div class="pallet-head"><div class="pallet-heading"><input class="no-print" type="checkbox" data-select-pallet="${p.id}" aria-label="Select pallet" style="width:15px;height:15px"><span class="pallet-badge">PALLET ${p.number}</span><div><strong>Pallet ${p.number}</strong><br><span>${p.lines.length} item line${p.lines.length===1?'':'s'}</span></div></div>
 <div class="pallet-tools no-print"><button class="outline small" data-clone-pallet="${p.id}">⧉ Duplicate</button><button class="danger small" data-delete-pallet="${p.id}">Delete pallet</button></div></div>
 <div class="pallet-body"><div class="table-wrap"><table class="pallet-table"><thead><tr><th style="width:36%">Model / item name · part number</th><th style="width:38%">Part number</th><th style="width:16%">Qty</th><th class="no-print" style="width:10%">Action</th></tr></thead><tbody>${p.lines.map((l,li)=>{const it=data.items.find(x=>x.id===l.itemId);return `<tr><td><select data-line-field="${p.id}:${l.id}" data-field="itemId">${itemOptions(l.itemId)}</select></td><td><span>${esc(it?.part||'—')}</span></td><td><input class="num" type="number" min="0" step="1" data-line-field="${p.id}:${l.id}" data-field="qty" value="${esc(l.qty)}" aria-label="Quantity"></td><td class="no-print"><button class="danger small" data-delete-line="${p.id}:${l.id}">×</button></td></tr>`}).join('')}</tbody></table></div><div class="item-actions no-print" style="margin-top:8px"><button class="secondary small" data-add-line="${p.id}">＋ Add item to pallet</button></div><div class="pallet-total">PALLET TOTAL: ${p.lines.reduce((s,l)=>s+(Number(l.qty)||0),0).toLocaleString()} PCS</div></div></article>`).join('');
}
function renderTotals(){const t=totals();$('statNumber').textContent=data.number;$('statPallets').textContent=t.pallets.toLocaleString();$('statPieces').textContent=t.pieces.toLocaleString();$('summaryPallets').value=t.pallets;$('summaryPieces').value=t.pieces.toLocaleString();$('summaryModels').value=t.models}
function render(){syncForm();renderBoes();renderCatalogue();renderPallets();renderTotals();save(true)}
function addPallet(source=null){let n=data.pallets.reduce((m,p)=>Math.max(m,Number(p.number)||0),0)+1;let lines=source?source.lines.map(l=>({...l,id:uid()})):[{id:uid(),itemId:data.items[0]?.id||'',qty:0}];data.pallets.push({id:uid(),number:n,lines});render();toast('Pallet '+n+' added')}
function addItem(){data.items.push({id:uid(),name:'',part:'',description:''});renderCatalogue();renderPallets();save(true);const inputs=$('catalogueBody').querySelectorAll('input');inputs[inputs.length-3]?.focus()}
function addLine(pid){const p=data.pallets.find(x=>x.id===pid);if(p){p.lines.push({id:uid(),itemId:data.items[0]?.id||'',qty:0});renderPallets();renderTotals();save(true)}}
function download(name,content,type){const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function csvCell(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
function exportCSV(){
 const rows=[['EUTCO Logistics — Warehouse Packing List'],['Packing list number',data.number],['Date',data.date],['Customer / Company',data.customer],['Prepared by',data.preparedBy],['BOE numbers',data.boes.join(', ')],['Notes',data.notes],[],['Pallet No.','Model / Item Name','Part Number','Description','Quantity']];
 data.pallets.forEach(p=>p.lines.forEach(l=>{const it=data.items.find(i=>i.id===l.itemId)||{};rows.push([p.number,it.name,it.part,it.description,l.qty])}));
 rows.push([],['SUMMARY'],['Total pallets',data.pallets.length],['Total pieces',totals().pieces],['Total BOE references',data.boes.length]);
 download(data.number+'.csv','\ufeff'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8;');toast('Excel-compatible CSV downloaded');
}
function exportJSON(){save(true);download(data.number+'-backup.json',JSON.stringify(data,null,2),'application/json');toast('Editable backup downloaded')}
function resetList(){if(!confirm('Start a new packing list? Download or save this draft first if you need it.'))return;save(true);data=blank();render();toast('New packing list created')}
function renderPrintReport(){
 const t=totals();
 const modelTotals=data.items.map(it=>({it,qty:data.pallets.reduce((sum,p)=>sum+p.lines.filter(l=>l.itemId===it.id).reduce((a,l)=>a+(Number(l.qty)||0),0),0)})).filter(x=>x.it.name||x.it.part||x.qty>0);
 const itemNames=modelTotals.filter(x=>x.it.name).map(x=>x.it.name);
 const escP=esc;
 const modelRows=modelTotals.map(x=>`<tr><td>${escP(x.it.name||'—')}</td><td>${escP(x.it.part||'—')}</td><td>${Number(x.qty||0).toLocaleString()}</td></tr>`).join('')||'<tr><td colspan="3">No models added</td></tr>';
 let palletRows='';
 data.pallets.forEach(p=>{
   const lines=p.lines.length?p.lines:[{itemId:'',qty:0}];
   lines.forEach((l,i)=>{
     const it=data.items.find(x=>x.id===l.itemId)||{};
     palletRows+=`<tr>${i===0?`<td class="pr-pallet-id" rowspan="${lines.length}">PALLET NO. ${escP(p.number)}</td>`:''}<td>${escP(it.name||'—')}</td><td>${escP(it.part||'—')}</td><td class="qty">${Number(l.qty||0).toLocaleString()}</td></tr>`;
   });
 });
 if(!palletRows)palletRows='<tr><td colspan="4">No pallets added</td></tr>';
 $('printReport').innerHTML=`
 <div class="pr-top"><div><div class="pr-title">EUTCO Logistics — Warehouse Packing List</div><div class="pr-sub">Warehouse shipment record</div></div><div class="pr-number">${escP(data.number)}</div></div>
 <div class="pr-meta">
  <div class="pr-box"><div class="pr-label">Date</div><div class="pr-value">${escP(data.date||'—')}</div></div>
  <div class="pr-box"><div class="pr-label">Customer name / company</div><div class="pr-value">${escP(data.customer||'—')}</div></div>
  <div class="pr-box"><div class="pr-label">Prepared by</div><div class="pr-value">${escP(data.preparedBy||'—')}</div></div>
  <div class="pr-box"><div class="pr-label">Total shipments / BOE numbers</div><div class="pr-value">${data.boes.length} BOE${data.boes.length===1?'':'s'}: ${escP(data.boes.join(', ')||'—')}</div></div>
 </div>
 <div class="pr-summary">
  <div class="pr-sum"><div class="pr-sum-label">No. of pallets</div><div class="pr-sum-value">${t.pallets}</div></div>
  <div class="pr-sum"><div class="pr-sum-label">Total pieces</div><div class="pr-sum-value">${t.pieces.toLocaleString()}</div></div>
  <div class="pr-sum"><div class="pr-sum-label">No. of models</div><div class="pr-sum-value">${t.models}</div></div>
  <div class="pr-sum"><div class="pr-sum-label">Items names · total qty by model</div><div class="pr-sum-value" style="font-size:8px;font-weight:500">${modelTotals.map(x=>`${escP(x.it.name||'Unnamed')} (${Number(x.qty||0).toLocaleString()})`).join(' · ')||'—'}</div></div>
 </div>
 <div class="pr-items">
  <div><div class="pr-items-title">Model / part quantity summary</div><table class="pr-model-table"><thead><tr><th style="width:42%">Model name</th><th style="width:38%">Part no.</th><th style="width:20%;text-align:right">Total qty</th></tr></thead><tbody>${modelRows}</tbody></table></div>
  <div><div class="pr-items-title">BOE references (${data.boes.length})</div><table class="pr-model-table pr-boe-table"><thead><tr><th>BOE number</th></tr></thead><tbody>${data.boes.map(b=>`<tr><td>${escP(b)}</td></tr>`).join('')||'<tr><td>—</td></tr>'}</tbody></table>${data.notes?`<div style="margin-top:4px"><strong>Notes:</strong> ${escP(data.notes)}</div>`:''}</div>
 </div>
 <div class="pr-section-title">Pallet details</div>
 <table class="pr-pallet-table"><thead><tr><th style="width:17%">Pallet no.</th><th style="width:34%">Item name / model</th><th style="width:31%">Part no.</th><th style="width:18%">Qty in pallet</th></tr></thead><tbody>${palletRows}</tbody></table>
 <div class="pr-footer"><span>EUTCO Logistics · Warehouse Packing List</span><span>Total pallets: ${t.pallets} · Total pieces: ${t.pieces.toLocaleString()} · BOE references: ${data.boes.length}</span></div>`;
}
function printList(){save(true);renderPrintReport();window.print()}
function addBoe(){const v=$('boeInput').value.trim();if(!v)return;if(data.boes.some(b=>b.toLowerCase()===v.toLowerCase())){toast('That BOE number is already added');return}data.boes.push(v);$('boeInput').value='';renderBoes();renderTotals();save(true)}

function savePersonName(kind,value){
 const v=String(value||'').trim();if(!v)return;
 try{
  const p=JSON.parse(localStorage.getItem('eutcoPackingListPeople_v1')||'{}');
  const key=kind==='customer'?'customers':'preparers';
  p[key]=[...new Set([...(p[key]||[]),v])];
  localStorage.setItem('eutcoPackingListPeople_v1',JSON.stringify(p));
  fillPeople();
 }catch(e){}
}

function fillPeople(){try{const p=JSON.parse(localStorage.getItem('eutcoPackingListPeople_v1')||'{}');savedCustomers=p.customers||[];savedPreparers=p.preparers||[];$('customerOptions').innerHTML=savedCustomers.map(v=>`<option value="${esc(v)}">`).join('');$('preparedOptions').innerHTML=savedPreparers.map(v=>`<option value="${esc(v)}">`).join('')}catch(e){}}
$('customer').addEventListener('change',()=>{savePersonName('customer',$('customer').value);save(true)});
$('customer').addEventListener('blur',()=>{savePersonName('customer',$('customer').value);save(true)});
$('preparedBy').addEventListener('change',()=>{savePersonName('preparer',$('preparedBy').value);save(true)});
$('preparedBy').addEventListener('blur',()=>{savePersonName('preparer',$('preparedBy').value);save(true)});
document.addEventListener('input',e=>{
 const t=e.target;
 if(['customer','preparedBy','packingDate','notes'].includes(t.id)){data.customer=$('customer').value;data.preparedBy=$('preparedBy').value;data.date=$('packingDate').value;data.notes=$('notes').value;save(true);return}
 if(t.dataset.itemField){const it=data.items.find(i=>i.id===t.dataset.itemField);if(it){it[t.dataset.field]=t.value;renderPallets();renderTotals();save(true)}}
 if(t.dataset.lineField){const [pid,lid]=t.dataset.lineField.split(':');const p=data.pallets.find(p=>p.id===pid),l=p?.lines.find(l=>l.id===lid);if(l){l[t.dataset.field]=t.dataset.field==='qty'?Math.max(0,Number(t.value)||0):t.value;renderCatalogue();renderTotals();save(true)}}
});
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.dataset.itemField){const it=data.items.find(i=>i.id===t.dataset.itemField);if(it){it[t.dataset.field]=t.value;renderPallets();renderTotals();save(true)}}
 if(t.dataset.lineField){const [pid,lid]=t.dataset.lineField.split(':');const p=data.pallets.find(p=>p.id===pid),l=p?.lines.find(l=>l.id===lid);if(l){l[t.dataset.field]=t.value;renderPallets();renderCatalogue();renderTotals();save(true)}}
});
document.addEventListener('click',e=>{
 const t=e.target.closest('button');if(!t)return;
 if(t.dataset.removeBoe!==undefined){data.boes.splice(Number(t.dataset.removeBoe),1);renderBoes();renderTotals();save(true)}
 if(t.dataset.deleteItem){const id=t.dataset.deleteItem;if(data.pallets.some(p=>p.lines.some(l=>l.itemId===id))&&!confirm('This item is used on a pallet. Delete it from the catalogue and pallet lines?'))return;data.items=data.items.filter(i=>i.id!==id);data.pallets.forEach(p=>p.lines.forEach(l=>{if(l.itemId===id)l.itemId=''}));render(); }
 if(t.dataset.deletePallet){if(confirm('Delete pallet '+t.dataset.deletePallet+'?')){data.pallets=data.pallets.filter(p=>p.id!==t.dataset.deletePallet);render()}}
 if(t.dataset.deleteLine){const [pid,lid]=t.dataset.deleteLine.split(':');const p=data.pallets.find(p=>p.id===pid);if(p){p.lines=p.lines.filter(l=>l.id!==lid);render()}}
 if(t.dataset.addLine)addLine(t.dataset.addLine);
 if(t.dataset.clonePallet){const p=data.pallets.find(p=>p.id===t.dataset.clonePallet);if(p)addPallet(p)}
});
$('addBoeBtn').onclick=addBoe;$('boeInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addBoe()}});
$('addItemBtn').onclick=addItem;$('addPalletBtn').onclick=()=>addPallet();$('saveBtn').onclick=()=>save();$('saveBtnBottom').onclick=()=>save();$('printBtn').onclick=printList;$('printBtnBottom').onclick=printList;$('newBtn').onclick=resetList;$('csvBtn').onclick=exportCSV;$('jsonBtn').onclick=exportJSON;$('backupBtn').onclick=exportJSON;
function openCopy(){if(!data.pallets.length){toast('Add a pallet first');return}$('sourcePallet').innerHTML=data.pallets.map(p=>`<option value="${p.id}">Pallet ${p.number} — ${p.lines.length} line(s)</option>`).join('');$('copyModal').classList.add('open')}
$('duplicateManyBtn').onclick=openCopy;$('closeCopy').onclick=$('cancelCopy').onclick=()=>$('copyModal').classList.remove('open');$('copyModal').addEventListener('click',e=>{if(e.target===$('copyModal'))$('copyModal').classList.remove('open')});
$('confirmCopy').onclick=()=>{const src=data.pallets.find(p=>p.id===$('sourcePallet').value),count=Math.min(100,Math.max(1,Number($('copyCount').value)||1));if(!src)return;for(let i=0;i<count;i++)addPallet(src);$('copyModal').classList.remove('open');render();toast(count+' pallet copies created')};
window.addEventListener('beforeunload',()=>save(true));
defaultLoad();fillPeople();render();
})();
