/* Customer form: only explicitly entered data is exported. No CRM connection. */
(function(){
'use strict';
const fields=[['company','Razón social'],['address','Dirección'],['zip','Código postal'],['city','Ciudad'],['state','Estado / provincia'],['country','País'],['tax','Identificación fiscal'],['phone','Teléfono'],['logistic','Contacto principal'],['logisticEmail','Correo del contacto principal'],['account','Contacto de contabilidad'],['accountEmail','Correo de contabilidad'],['payment','Condiciones de pago']];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const enc=new TextEncoder();
function zip(files){
 const local=[],central=[];let offset=0;
 const record=(n,fn)=>{const a=new Uint8Array(n);fn(new DataView(a.buffer));return a;};
 const crc=b=>{let c=0xffffffff;for(const x of b){c^=x;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;};
 for(const [path,xml] of Object.entries(files)){
  const name=enc.encode(path),body=enc.encode(xml),sum=crc(body);
  const h=record(30,v=>{v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,sum,true);v.setUint32(18,body.length,true);v.setUint32(22,body.length,true);v.setUint16(26,name.length,true);});
  const c=record(46,v=>{v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint32(16,sum,true);v.setUint32(20,body.length,true);v.setUint32(24,body.length,true);v.setUint16(28,name.length,true);v.setUint32(42,offset,true);});
  local.push(h,name,body);central.push(c,name);offset+=h.length+name.length+body.length;
 }
 const size=central.reduce((n,b)=>n+b.length,0),end=record(22,v=>{v.setUint32(0,0x06054b50,true);v.setUint16(8,Object.keys(files).length,true);v.setUint16(10,Object.keys(files).length,true);v.setUint32(12,size,true);v.setUint32(16,offset,true);});
 return new Blob([...local,...central,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
function workbook(d){
 const rows=[['customer details'],['company name:',d.company,'','city:',d.city],['address:',d.address,'','state:',d.state],['','','','country:',d.country],['C.P..:',d.zip,'','tax ID:',d.tax],['tel.:',d.phone],['main contact:',d.logistic,'','e-mail:',d.logisticEmail],['contact account:',d.account,'','e-mail:',d.accountEmail],['payment:',d.payment,'','notes:','']];
 const sheet='<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews><cols>'+[24,36,4,20,40,4].map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join('')+'</cols><sheetData>'+rows.map((row,r)=>'<row r="'+(r+1)+'" ht="'+(r===0?48:r===8?90:36)+'" customHeight="1">'+row.map((v,c)=>'<c r="'+String.fromCharCode(65+c)+(r+1)+'" t="inlineStr" s="'+(r===0?1:0)+'"><is><t xml:space="preserve">'+esc(v)+'</t></is></c>').join('')+'</row>').join('')+'</sheetData><mergeCells count="1"><mergeCell ref="A1:F1"/></mergeCells></worksheet>';
 return zip({
 '[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
 '_rels/.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
 'xl/workbook.xml':'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Ficha Informativa Cliente" sheetId="1" r:id="rId1"/></sheets></workbook>',
 'xl/_rels/workbook.xml.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
 'xl/styles.xml':'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="17"/><name val="Arial"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf fontId="1" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
 'xl/worksheets/sheet1.xml':sheet});
}
window.openCustomerSheet=function(main,client,onBack){
 main.innerHTML='<button type="button" class="back" id="sheet-back">‹ Volver al cliente</button><h2 style="margin:18px 0">Generar ficha cliente</h2><div class="panel"><p>Extracción automática de Zoho pendiente de conexión.</p><p class="muted" style="margin-top:8px">Completa los datos verificados del cliente. Los campos vacíos se exportarán vacíos. No se modifica Zoho.</p></div><form id="customer-sheet-form" class="section">'+fields.map(([id,label])=>'<div class="field"><label for="sheet-'+id+'">'+label+'</label>'+(id==='notes'?'<textarea':'<input')+' id="sheet-'+id+'" name="'+id+'" '+(id.toLowerCase().includes('email')?'type="email"':'')+' '+(id==='company'?'required':'')+'>'+(id==='notes'?'</textarea>':'')+'</div>').join('')+'<p id="sheet-missing" class="muted" aria-live="polite"></p><button type="submit" class="action full" style="margin-top:16px">Descargar PDF</button><button type="submit" name="export-format" value="xlsx" class="action secondary full" style="margin-top:8px">Descargar Excel</button><p id="sheet-result" class="feedback" role="status"></p></form>';
 const form=main.querySelector('form');form.elements.company.value=client.name;
 main.querySelector('#sheet-back').onclick=onBack;
 function missing(){const empty=fields.filter(([id])=>!form.elements[id].value.trim()).map(([,label])=>label);main.querySelector('#sheet-missing').textContent=empty.length?'Campos sin completar: '+empty.join(', ')+'.':'Todos los campos están completos.';}
 form.addEventListener('input',missing);missing();
 form.onsubmit=async e=>{e.preventDefault();try{const d=Object.fromEntries(fields.map(([id])=>[id,form.elements[id].value.trim()]));const isExcel=e.submitter?.value==='xlsx';const blob=isExcel?workbook(d):await window.customerSheetPdf(d);const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Anagrafica_'+(d.company.replace(/[^\p{L}\p{N}_-]+/gu,'_')||'Cliente')+(isExcel?'.xlsx':'.pdf');document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);main.querySelector('#sheet-result').textContent=(isExcel?'Excel generado.':'PDF generado con el modelo Obra Creativa.')+' Puedes guardarlo o compartirlo desde la descarga.';}catch(error){main.querySelector('#sheet-result').textContent=error.message||'No se pudo generar la ficha. Vuelve a intentarlo.';}};
};
if(typeof module!=='undefined')module.exports={workbook};
})();
