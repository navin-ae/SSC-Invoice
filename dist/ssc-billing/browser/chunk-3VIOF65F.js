import{a as c}from"./chunk-LS4SCMUJ.js";function g(o){let d=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],n=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];function t(e){return e===0?"Zero":e<20?d[e]:e<100?n[Math.floor(e/10)]+(e%10?" "+d[e%10]:""):e<1e3?d[Math.floor(e/100)]+" Hundred"+(e%100?" "+t(e%100):""):e<1e5?t(Math.floor(e/1e3))+" Thousand"+(e%1e3?" "+t(e%1e3):""):e<1e7?t(Math.floor(e/1e5))+" Lakh"+(e%1e5?" "+t(e%1e5):""):t(Math.floor(e/1e7))+" Crore"+(e%1e7?" "+t(e%1e7):"")}let s=Math.round(o);return t(s)+" Only"}function h(o){let d={};for(let n of o){let t=n.gstRate;d[t]||(d[t]={taxable:0,cgst:0,sgst:0,totalGst:0});let e=n.rate/(1+n.gstRate/100)*n.qty,i=n.amount-e;d[t].taxable+=e,d[t].totalGst+=i,d[t].cgst+=i/2,d[t].sgst+=i/2}return Object.entries(d).map(([n,t])=>c({rate:+n},t))}function x(o){let d={name:"RAAJAMANI TRADERSS",addr1:"192, Kovai Road",addr2:"Annur - PIN-641653",gstin:"GSTIN: 33AAGPE8531J1ZT",phone:"Phone: 9994813066",bank:{name:"Tamilnadu Mercandile bank",ac:"A/C No: 1715000005704XX",ifsc:"IFSC: TMBL0001742"}},n=o.items.map((r,l)=>`<tr>
      <td style="text-align:center">${l+1}</td>
      <td>${r.name}</td>
      <td style="text-align:center">${r.hsn??""}</td>
      <td style="text-align:center">${r.gstRate}%</td>
      <td style="text-align:center">${r.qty}</td>
      <td style="text-align:right">\u20B9${r.rate.toFixed(2)}</td>
      <td style="text-align:right">\u20B9${r.amount.toFixed(2)}</td>
    </tr>`).join(""),s=`
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
          ${h(o.items).map(r=>`
            <tr>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: center;">${r.rate}%</td>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">\u20B9${r.taxable.toFixed(2)}</td>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">\u20B9${r.cgst.toFixed(2)}</td>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">\u20B9${r.sgst.toFixed(2)}</td>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">\u20B9${r.totalGst.toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `,e=o.totalGst/2,i=o.totalGst/2,a=`
    <tr><td>Taxable Value</td><td style="text-align:right">\u20B9${o.subtotal.toFixed(2)}</td></tr>
    <tr><td>CGST</td><td style="text-align:right">\u20B9${e.toFixed(2)}</td></tr>
    <tr><td>SGST</td><td style="text-align:right">\u20B9${i.toFixed(2)}</td></tr>
    <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>\u20B9${o.total.toFixed(2)}</strong></td></tr>
  `;return`<!doctype html><html><head><meta charset="utf-8"><title>Invoice</title><style>
    @page { size: A4 portrait; margin: 8mm; }
    html, body { width:210mm; height:297mm; margin:0; padding:0; background:#ffffff }
    body{font-family:Arial;padding:0;color:#111;margin:0}
    /* page wrapper with visible border inside page margins */
    .page{box-sizing:border-box;border:1px solid #111;padding:10mm;margin:0 auto;width:190mm;max-width:190mm}
    .header{display:block;text-align:center;margin-bottom:6px}
    .seller{font-weight:normal;width:100%;text-align:center}
    .seller .name{font-weight:800;font-size:18px}
    .seller .addr{font-size:12px;margin-top:4px}
    .meta{display:flex;justify-content:space-between;margin-top:8px;font-size:13px}

    table{width:100%;border-collapse:separate;border-spacing:0}
    th,td{padding:6px;font-size:13px;border-top:0;border-bottom:0;border-left:1px solid #ccc;border-right:1px solid #ccc}
    thead th{border-top:1px solid #ccc; border-bottom:1px solid #ccc;background:#f9f9f9}
    tr th:first-child, tr td:first-child{border-left:1px solid #ccc}
    tr th:last-child, tr td:last-child{border-right:1px solid #ccc}
    tbody tr:last-child td{border-bottom:1px solid #ccc}

    .right-table{width:320px;border:0;margin-left:auto;border-collapse:separate}
    .right-table td{border-left:1px solid #ddd;border-right:1px solid #ddd;border-top:0;border-bottom:0;padding:6px}
    .right-table tr:last-child td{border-bottom:1px solid #ddd}
    .no-border td{border:0;padding:2px}

    /* ensure prints include the border and consistent sizing */
    @media print {
      body{margin:0}
      .page{border:1px solid #111;padding:10mm;margin:0}
      @page { margin: 8mm }
    }
  </style></head><body>
    <div class="page">
      <div class="header">
        <div class="seller">
          <div class="name">${d.name}</div>
          <div class="addr">${d.addr1} \u2022 ${d.addr2}</div>
          <div class="addr">${d.gstin} \u2022 ${d.phone}</div>
        </div>
      </div>

      <div style="height:1px;background:#ddd;margin:6px 0"></div>

      <div class="meta">
        <div style="flex:1;">
          <div><strong>Bill To:</strong> ${o.customerName??"Walk-in"}</div>
          ${o.customerAddress?`<div>${o.customerAddress}</div>`:""}
        </div>
        <div style="text-align:right;min-width:200px">
          <div>Invoice No: <strong>${o.invoiceNo}</strong></div>
          <div>Date: ${new Date(o.date).toLocaleDateString()}</div>
          <div>Time: ${new Date(o.date).toLocaleTimeString()}</div>
        </div>
      </div>

      <table style="margin-top:8px">
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
          ${n}
        </tbody>
      </table>

      <div style="display:flex;margin-top:8px; align-items: flex-start;">
        ${s}
        <div style="width:320px; margin-left: 10px;">
          <table class="right-table">
            <tbody>
              ${a}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-top:12px;font-size:12px">Amount in words: INR ${g(o.total)}</div>

      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:18px">
        <div style="font-size:12px;max-width:60%">
          <div style="font-weight:700;margin-bottom:6px">Bank Details</div>
          <div>${d.bank.name}</div>
          <div>${d.bank.ac}</div>
          <div>${d.bank.ifsc}</div>
          
        </div>

        <div style="text-align:center;width:240px">
          <div style="height:60px"></div>
          <div style="font-weight:700">For ${d.name}</div>
          <div style="margin-top:8px">Authorised Signatory</div>
        </div>
      </div>
    </div>
  </body></html>`}async function m(o,d){let n=x(o),t=document.createElement("div");t.style.position="fixed",t.style.left="-9999px",t.style.top="0",t.style.width="210mm",t.style.height="297mm",t.style.overflow="hidden",t.innerHTML=n,document.body.appendChild(t),await new Promise(i=>setTimeout(i,700));let s;try{let i=await import("./chunk-PCDNA377.js");s=i&&i.default?i.default:i}catch{s=window.html2pdf}if(!s)throw new Error("html2pdf library not available");let e={filename:d||`${o.invoiceNo}.pdf`,margin:[8,8,8,8],image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,allowTaint:!0,backgroundColor:"#ffffff"},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"]}};try{let i=t.querySelector(".page")||t;await s().from(i).set(e).save()}catch(i){let a=document.createElement("iframe");a.style.position="fixed",a.style.left="-9999px",a.style.top="0",a.style.width="210mm",a.style.height="297mm",a.width="210mm",a.height="297mm",document.body.appendChild(a);let r=a.contentDocument||a.contentWindow&&a.contentWindow.document;if(!r)throw i;r.open(),r.write(n),r.close(),await new Promise(p=>setTimeout(p,700));let l=a.contentWindow.document.body||a.contentWindow.document.documentElement;try{await s().from(l).set(e).save()}finally{setTimeout(()=>{try{document.body.removeChild(a)}catch{}},300)}}finally{setTimeout(()=>{try{document.body.removeChild(t)}catch{}},300)}}export{g as a,x as b,m as c};
