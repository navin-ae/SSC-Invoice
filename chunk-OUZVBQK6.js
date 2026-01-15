import{a as s}from"./chunk-UUTQQLSI.js";function p(d){let o=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],r=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];function e(t){return t===0?"Zero":t<20?o[t]:t<100?r[Math.floor(t/10)]+(t%10?" "+o[t%10]:""):t<1e3?o[Math.floor(t/100)]+" Hundred"+(t%100?" "+e(t%100):""):t<1e5?e(Math.floor(t/1e3))+" Thousand"+(t%1e3?" "+e(t%1e3):""):t<1e7?e(Math.floor(t/1e5))+" Lakh"+(t%1e5?" "+e(t%1e5):""):e(Math.floor(t/1e7))+" Crore"+(t%1e7?" "+e(t%1e7):"")}let a=Math.round(d);return e(a)+" Only"}function h(d){let o={};for(let r of d){let e=r.gstRate;o[e]||(o[e]={taxable:0,cgst:0,sgst:0,totalGst:0});let t=r.rate/(1+r.gstRate/100)*r.qty,n=r.amount-t;o[e].taxable+=t,o[e].totalGst+=n,o[e].cgst+=n/2,o[e].sgst+=n/2}return Object.entries(o).map(([r,e])=>s({rate:+r},e))}function g(d){let o={name:"RAAJAMANI TRADERSS",addr1:"192, Kovai Road",addr2:"Annur - PIN-641653",gstin:"GSTIN: 33AAGPE8531J1ZT",phone:"Phone: 9994813066"},r=d.items.map((i,c)=>`<tr>
      <td style="text-align:center">${c+1}</td>
      <td>${i.name}</td>
      <td style="text-align:center">${i.hsn??""}</td>
      <td style="text-align:center">${i.gstRate}%</td>
      <td style="text-align:center">${i.qty}</td>
      <td style="text-align:right">\u20B9${i.rate.toFixed(2)}</td>
      <td style="text-align:right">\u20B9${i.amount.toFixed(2)}</td>
    </tr>`).join(""),a=`
    <div style="flex: 1;">
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #ccc;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 4px; background-color: #f2f2f2;">GST Rate</th>
            <th style="border: 1px solid #ccc; padding: 4px; background-color: #f2f2f2;">Taxable</th>
            <th style="border: 1px solid #ccc; padding: 4px; background-color: #f2f2f2;">CGST</th>
            <th style="border: 1px solid #ccc; padding: 4px; background-color: #f2f2f2;">SGST</th>
            <th style="border: 1px solid #ccc; padding: 4px; background-color: #f2f2f2;">Total GST</th>
          </tr>
        </thead>
        <tbody>
          ${h(d.items).map(i=>`
            <tr>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: center;">${i.rate}%</td>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">\u20B9${i.taxable.toFixed(2)}</td>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">\u20B9${i.cgst.toFixed(2)}</td>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">\u20B9${i.sgst.toFixed(2)}</td>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">\u20B9${i.totalGst.toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `,t=d.totalGst/2,n=d.totalGst/2,l=`
    <tr><td>Taxable Value</td><td style="text-align:right">\u20B9${d.subtotal.toFixed(2)}</td></tr>
    <tr><td>CGST</td><td style="text-align:right">\u20B9${t.toFixed(2)}</td></tr>
    <tr><td>SGST</td><td style="text-align:right">\u20B9${n.toFixed(2)}</td></tr>
    <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>\u20B9${d.total.toFixed(2)}</strong></td></tr>
  `;return`<!doctype html><html><head><meta charset="utf-8"><title>Invoice</title><style>
    @page { size: A4 portrait; margin: 8mm; }
    body{font-family:Arial;padding:10px;color:#111;max-width:148mm;margin:0 auto}
    .header{display:flex;justify-content:space-between;margin-bottom:12px}
    .seller{font-weight:normal}
    .seller .name{font-weight:700}
    table{width:100%;border-collapse:separate;border-spacing:0}
    th,td{padding:6px;font-size:13px;border-top:0;border-bottom:0;border-left:1px solid #ccc;border-right:1px solid #ccc}
    thead th{border-top:1px solid #ccc; border-bottom:1px solid #ccc}
    tr th:first-child, tr td:first-child{border-left:1px solid #ccc}
    tr th:last-child, tr td:last-child{border-right:1px solid #ccc}
    tbody tr:last-child td{border-bottom:1px solid #ccc}
    .right-table{width:300px;border:0;margin-left:auto;border-collapse:separate}
    .right-table td{border-left:1px solid #ddd;border-right:1px solid #ddd;border-top:0;border-bottom:0;padding:6px}
    .right-table tr:last-child td{border-bottom:1px solid #ddd}
    .no-border td{border:0;padding:2px}
  </style></head><body>
    <div class="header">
      <div class="seller">
        <div class="name" style="font-size:16px">${o.name}</div>
        <div>${o.addr1}</div>
        <div>${o.addr2}</div>
        <div>${o.gstin}</div>
        <div>${o.phone}</div>
      </div>
      <div class="inv-meta" style="text-align:right">
        <div>Invoice No: <strong>${d.invoiceNo}</strong></div>
        <div>Date: ${new Date(d.date).toLocaleDateString()}</div>
        <div>Time: ${new Date(d.date).toLocaleTimeString()}</div>
        <div>Bill To: ${d.customerName??"Walk-in"}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:40px">S.No</th>
          <th>Description</th>
          <th style="width:80px">HSN/SAC</th>
          <th style="width:60px">GST</th>
          <th style="width:60px">Qty</th>
          <th style="width:100px">Rate</th>
          <th style="width:120px">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${r}
      </tbody>
    </table>

    <div style="display:flex;margin-top:8px; align-items: flex-start;">
      ${a}
      <div style="width:320px; margin-left: 10px;">
        <table class="right-table">
          <tbody>
            ${l}
          </tbody>
        </table>
      </div>
    </div>

    <div style="margin-top:12px;font-size:12px">Amount in words: INR ${p(d.total)}</div>
  </body></html>`}async function x(d,o){let r=g(d),e=document.createElement("iframe");e.style.position="fixed",e.style.left="-9999px",e.style.top="0",e.width="800",e.height="1100",document.body.appendChild(e);let a=e.contentDocument||e.contentWindow&&e.contentWindow.document;if(!a)throw new Error("Unable to access iframe document");a.open(),a.write(r),a.close(),await new Promise(l=>setTimeout(l,250));let t;try{let l=await import("./chunk-UQEPPINM.js");t=l&&l.default?l.default:l}catch{t=window.html2pdf}if(!t)throw new Error("html2pdf library not available");let n={filename:o||`${d.invoiceNo}.pdf`,margin:8,image:{type:"jpeg",quality:.98},html2canvas:{scale:2},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};try{await t().from(e.contentWindow.document.body).set(n).save()}finally{setTimeout(()=>{try{document.body.removeChild(e)}catch{}},300)}}export{g as a,x as b};
