/* Approved Obra Creativa customer sheet, 20 October 2026. */
(function(root){
'use strict';
const ascii=s=>Uint8Array.from(s,c=>c.charCodeAt(0)&255);
const join=parts=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let n=0;for(const p of parts){out.set(p,n);n+=p.length;}return out;};
const cp={'€':128,'’':146,'‘':145,'“':147,'”':148,'–':150,'—':151};
const text=s=>String(s??'').normalize('NFC').replace(/[\r\n\t]/g,' ').split('').map(c=>cp[c]?String.fromCharCode(cp[c]):c.charCodeAt(0)<=255?c:'?').join('').replace(/([\\()])/g,'\\$1');
function customerPdf(d,logo,font,widths){
 const ops=['0 0 0 rg','20 444 802 93 re f'];
 const put=(x,y,s,size=12,color=0)=>ops.push(`${color} ${color} ${color} rg BT /F1 ${size} Tf ${x} ${y} Td (${text(s)}) Tj ET`);
 const line=(x,y,w)=>ops.push(`0 0 0 RG 0.4 w ${x} ${y} m ${x+w} ${y} l S`);
 const wrap=(s,n)=>{const rows=[];let row='';for(const word of String(s??'').split(/\s+/)){if(!word)continue;if((row+' '+word).trim().length>n&&row){rows.push(row);row='';}for(let i=0;i<word.length;i+=n){const chunk=word.slice(i,i+n);if(chunk.length===n){if(row){rows.push(row);row='';}rows.push(chunk);}else row=(row+' '+chunk).trim();}}if(row)rows.push(row);return rows;};
 put(29,481,'customer details',25,1);
 ops.push('q 216 0 0 70.2 585 455 cm /Logo Do Q');
 let y=419;
 const pair=(left,value,right,rightValue)=>{const l=wrap(value,35),r=wrap(rightValue,28),count=Math.max(1,l.length,r.length);put(22,y,left,11);put(460,y,right,11);l.forEach((v,i)=>put(148,y-i*15,v));r.forEach((v,i)=>put(558,y-i*15,v));line(148,y-(count-1)*15-6,232);line(558,y-(count-1)*15-6,196);y-=Math.max(30,count*15+14);};
 pair('company name:',d.company,'city:',d.city);
 pair('address:',d.address,'state:',d.state);
 pair('','','country:',d.country);
 pair('C.P..:',d.zip,'tax ID:',d.tax);
 pair('tel.:',d.phone,'','');
 pair('main contact:',d.mainContact??d.logistic,'e-mail:',d.mainEmail??d.logisticEmail);
 pair('contact account:',d.account,'e-mail:',d.accountEmail);
 pair('payment:',d.payment,'notes:','');
 for(let i=0;i<3;i++)line(558,y-i*29-6,196);
 const bottom=Math.min(54,y-3*29);ops.push(`0 0 0 RG 0.4 w 20 ${bottom} 802 ${444-bottom} re S`);
 // Keep all rows on one landscape page even for unusually long source values.
 const scale=bottom<20?390/(444-bottom):1;
 const transform=scale<1?`q 1 0 0 ${scale} 0 ${444*(1-scale)} cm\n`:'';
 const stream=ascii(transform+ops.join('\n')+(scale<1?'\nQ':''));
 const objects=[ascii('<< /Type /Catalog /Pages 2 0 R >>'),ascii('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),ascii('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R >> /XObject << /Logo 5 0 R >> >> /Contents 6 0 R >>'),ascii('<< /Type /Font /Subtype /TrueType /BaseFont /DejaVuSans /Encoding /WinAnsiEncoding /FirstChar 32 /LastChar 255 /Widths ['+widths.join(' ')+'] /FontDescriptor 8 0 R >>'),join([ascii(`<< /Type /XObject /Subtype /Image /Width 1200 /Height 390 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.length} >>\nstream\n`),logo,ascii('\nendstream')]),join([ascii(`<< /Length ${stream.length} >>\nstream\n`),stream,ascii('\nendstream')]),join([ascii(`<< /Length ${font.length} /Length1 ${font.length} >>\nstream\n`),font,ascii('\nendstream')]),ascii('<< /Type /FontDescriptor /FontName /DejaVuSans /Flags 32 /FontBBox [-1021 -463 1793 1233] /ItalicAngle 0 /Ascent 928 /Descent -236 /CapHeight 729 /StemV 80 /FontFile2 7 0 R >>')];
 const parts=[ascii('%PDF-1.4\n%âãÏÓ\n')],offsets=[0];let pos=parts[0].length;
 objects.forEach((o,i)=>{offsets.push(pos);const part=join([ascii(`${i+1} 0 obj\n`),o,ascii('\nendobj\n')]);parts.push(part);pos+=part.length;});
 parts.push(ascii(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF`));
 return new Blob(parts,{type:'application/pdf'});
}
root.customerSheetPdf=async d=>{const r=await fetch('/customer-sheet-logo.jpg');if(!r.ok)throw new Error('No se pudo cargar el logo. Vuelve a intentarlo.');const [fr,wr]=await Promise.all([fetch('/customer-sheet-font.ttf'),fetch('/customer-sheet-widths.json')]);if(!fr.ok||!wr.ok)throw new Error('No se pudo cargar el modelo PDF.');return customerPdf(d,new Uint8Array(await r.arrayBuffer()),new Uint8Array(await fr.arrayBuffer()),await wr.json());};
if(typeof module!=='undefined')module.exports={customerPdf};
})(typeof window==='undefined'?globalThis:window);
