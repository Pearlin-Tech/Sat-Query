(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function a(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=a(i);fetch(i.href,s)}})();const Fe="modulepreload",He=function(e){return"/"+e},fe={},U=function(t,a,n){let i=Promise.resolve();if(a&&a.length>0){document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),o=(r==null?void 0:r.nonce)||(r==null?void 0:r.getAttribute("nonce"));i=Promise.allSettled(a.map(l=>{if(l=He(l),l in fe)return;fe[l]=!0;const g=l.endsWith(".css"),f=g?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${f}`))return;const b=document.createElement("link");if(b.rel=g?"stylesheet":Fe,g||(b.as="script"),b.crossOrigin="",b.href=l,o&&b.setAttribute("nonce",o),document.head.appendChild(b),g)return new Promise((h,c)=>{b.addEventListener("load",h),b.addEventListener("error",()=>c(new Error(`Unable to preload CSS for ${l}`)))})}))}function s(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return i.then(r=>{for(const o of r||[])o.status==="rejected"&&s(o.reason);return t().catch(s)})},u=(e,t=document)=>t.querySelector(e),A=(e,t=document)=>[...t.querySelectorAll(e)];function Qe(e,t={},...a){const n=document.createElement(e);for(const[i,s]of Object.entries(t))i==="className"?n.className=s:i==="innerHTML"?n.innerHTML=s:i.startsWith("on")&&typeof s=="function"?n.addEventListener(i.slice(2).toLowerCase(),s):n.setAttribute(i,s);for(const i of a)i!=null&&(typeof i=="string"?n.appendChild(document.createTextNode(i)):n.appendChild(i));return n}function ne(e,t="animate-slide-up",a=0){e.style.animationDelay=`${a}ms`,e.classList.add(t)}function ie(e,t="animate-slide-up",a=0,n=80){e.forEach((i,s)=>{i.style.animationDelay=`${a+s*n}ms`,i.classList.add(t)})}function y(e,t="info",a=4e3){const n={info:"💡",success:"✓",warning:"⚠️",error:"✕"},i=u("#toast-container");if(!i)return;const s=Qe("div",{className:`toast toast-${t}`,role:"alert","aria-live":"polite"});s.innerHTML=`
    <span style="font-size:18px;line-height:1">${n[t]||"💡"}</span>
    <div style="flex:1">
      <div style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary)">${e}</div>
    </div>
    <button class="icon-btn" onclick="this.closest('.toast').remove()" aria-label="Close notification">✕</button>
  `,i.appendChild(s),setTimeout(()=>{s.style.animation="toast-out 300ms ease forwards",setTimeout(()=>s.remove(),300)},a)}const H=e=>new Promise(t=>setTimeout(t,e));function Q(e,t=!0){const a=Math.abs(e).toFixed(4),n=t?e>=0?"N":"S":e>=0?"E":"W";return`${a}° ${n}`}function Ke(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/1024/1024).toFixed(1)} MB`}function Je(e){return e?new Date(e).toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"}):"Unknown"}function $(){return new Date().toISOString().replace("T"," ").slice(0,19)+" IST"}function be(e){if(!e||e.length<3)return null;let t=0;const a=e.length;for(let i=0;i<a;i++){const s=(i+1)%a;t+=e[i].lng*e[s].lat,t-=e[s].lng*e[i].lat}return t=Math.abs(t)/2,(t*111.32*111.32*Math.cos(23*Math.PI/180)).toFixed(2)}function q(e,t=null){try{return JSON.parse(localStorage.getItem(e))??t}catch{return t}}function j(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch(a){console.warn("localStorage write failed:",a)}}function Ye(){const e=new Date().getHours();return e<12?"Good Morning":e<17?"Good Afternoon":"Good Evening"}const Y=[{intent:"vegetation_change",label:"Vegetation Change Analysis",icon:"🌿",keywords:["vegetation","ndvi","green","plant","forest","crop","farm","biomass","chlorophyll","tree","grass"],changeKeywords:["change","decrease","increase","loss","gain","differ","compare","between","over time","trend"],requiredBands:["Red","NIR"],operations:["NDVI","temporal_comparison"],sensor:"Optical Multispectral",output:["map","statistics","explanation"],temporalRequired:!0,color:"var(--green-400)"},{intent:"vegetation_current",label:"Vegetation Analysis",icon:"🌱",keywords:["vegetation","ndvi","green","plant","forest","crop","farm","biomass"],changeKeywords:[],requiredBands:["Red","NIR"],operations:["NDVI"],sensor:"Optical Multispectral",output:["map","statistics"],temporalRequired:!1,color:"var(--green-300)"},{intent:"urban_expansion",label:"Urban / Built-up Analysis",icon:"🏗️",keywords:["urban","built","city","town","construction","infrastructure","building","settlement","expansion"],changeKeywords:["change","expand","grow","spread","increase","new","develop"],requiredBands:["Red","NIR","SWIR"],operations:["NDBI","change_detection"],sensor:"Optical Multispectral",output:["map","statistics","explanation"],temporalRequired:!1,color:"var(--amber-400)"},{intent:"water_detection",label:"Water Body Analysis",icon:"💧",keywords:["water","flood","lake","river","reservoir","wetland","inundation","submerged"],changeKeywords:["extent","change","flood","dry","fill","increase","decrease"],requiredBands:["Green","NIR"],operations:["NDWI","water_extraction"],sensor:"Optical or SAR",output:["map","statistics"],temporalRequired:!1,color:"var(--blue-400)"},{intent:"change_detection",label:"Change Detection",icon:"🔄",keywords:["change","differ","before","after","compare","changed","difference","temporal"],changeKeywords:[],requiredBands:["RGB or any spectral"],operations:["change_detection","temporal_comparison"],sensor:"Any multitemporal",output:["change_map","statistics","explanation"],temporalRequired:!0,color:"var(--amber-300)"},{intent:"combined_urban_vegetation",label:"Urban Expansion + Vegetation Analysis",icon:"⚖️",keywords:["urban","vegetation","built","green","city","forest"],changeKeywords:["compare","both","and","while","relationship","correlation"],requiredBands:["Red","NIR","SWIR"],operations:["NDVI","NDBI","change_detection","spatial_overlap"],sensor:"Optical Multispectral",output:["map","statistics","spatial_correlation","explanation"],temporalRequired:!1,multiTool:!0,color:"var(--purple-400)"},{intent:"flood_analysis",label:"Flood / Inundation Analysis",icon:"🌊",keywords:["flood","inundation","submerged","waterlogging","deluge"],changeKeywords:[],requiredBands:["SAR C-band or Green + NIR"],operations:["NDWI","SAR_coherence","change_detection"],sensor:"SAR preferred (optical as fallback)",output:["flood_extent_map","statistics"],temporalRequired:!0,color:"var(--blue-300)"}],Ze={ahmedabad:{name:"Ahmedabad",center:[23.0225,72.5714],zoom:11,state:"Gujarat",country:"India"},surat:{name:"Surat",center:[21.1702,72.8311],zoom:11,state:"Gujarat",country:"India"},vadodara:{name:"Vadodara",center:[22.3072,73.1812],zoom:11,state:"Gujarat",country:"India"},gandhinagar:{name:"Gandhinagar",center:[23.2156,72.6369],zoom:11,state:"Gujarat",country:"India"},rajkot:{name:"Rajkot",center:[22.3039,70.8022],zoom:11,state:"Gujarat",country:"India"},mumbai:{name:"Mumbai",center:[19.076,72.8777],zoom:11,state:"Maharashtra",country:"India"},delhi:{name:"Delhi",center:[28.6139,77.209],zoom:11,state:"Delhi",country:"India"},bangalore:{name:"Bangalore",center:[12.9716,77.5946],zoom:11,state:"Karnataka",country:"India"},gujarat:{name:"Gujarat",center:[22.2587,71.1924],zoom:7,state:"Gujarat",country:"India"},india:{name:"India",center:[20.5937,78.9629],zoom:5,country:"India"},"this area":{name:"Current AOI",center:null,zoom:null},"selected region":{name:"Selected Region",center:null,zoom:null}},Xe=[{pattern:/(\d{4})\s*(?:to|-)\s*(\d{4})/,label:e=>`${e[1]}–${e[2]}`},{pattern:/last\s+(\d+)\s+years?/,label:e=>`Last ${e[1]} year(s)`},{pattern:/last\s+(\d+)\s+months?/,label:e=>`Last ${e[1]} month(s)`},{pattern:/recent\s+\d+\s+years?/,label:e=>e[0]},{pattern:/between\s+(\w+)\s+and\s+(\w+)/,label:e=>`${e[1]} to ${e[2]}`},{pattern:/20\d\d/,label:e=>e[0]}];function et(e,t=null){const a=e.toLowerCase().trim();a.split(/\s+/);const n=tt(a),i=at(a),s=nt(a),r=/change|before|after|over time|compar|between|differ|trend|increase|decrease|loss|gain/.test(a),o=it(n,t);return st(n,i,s,r,o,e)}function tt(e,t){const a=Y.find(r=>r.intent==="combined_urban_vegetation"),n=a.keywords.filter(r=>e.includes(r)&&r==="urban"||r==="built"||r==="city"||r==="construction").length>0,i=["vegetation","ndvi","green","plant","forest"].some(r=>e.includes(r));if((n&&i||e.includes("and")&&n)&&i&&n)return a;const s=Y.map(r=>{let o=0;for(const l of r.keywords)e.includes(l)&&(o+=2);for(const l of r.changeKeywords)e.includes(l)&&(o+=1);return{pattern:r,score:o}});return s.sort((r,o)=>o.score-r.score),s[0].score>0?s[0].pattern:Y.find(r=>r.intent==="change_detection")}function at(e){for(const[t,a]of Object.entries(Ze))if(e.includes(t))return a;return{name:"Unknown / Current AOI",center:null,zoom:null}}function nt(e){for(const t of Xe){const a=e.match(t.pattern);if(a)return t.label(a)}return/recent|latest|current|now/.test(e)?"Recent imagery":"Not specified — two comparable observations required"}function it(e,t){if(!t)return{valid:!0,warnings:[],blockers:[]};const a=[],n=[];if(e!=null&&e.requiredBands){const i=e.requiredBands;t.bands,i.includes("NIR")&&!t.hasNIR&&n.push({type:"missing_band",band:"NIR",message:"NIR band not detected — NDVI-based analysis unavailable.",suggestion:"Upload a multispectral image (Sentinel-2, Landsat) with NIR band."}),i.includes("SWIR")&&!t.hasSWIR&&a.push({type:"missing_band",band:"SWIR",message:"SWIR band unavailable — built-up index limited."})}return e!=null&&e.temporalRequired&&!t.hasMultipleImages&&n.push({type:"single_image",message:"Change detection requires at least two comparable observations.",suggestion:"Upload a second image from a different date."}),t.crs&&t.crs!=="UNKNOWN"&&t.crs2&&t.crs!==t.crs2&&a.push({type:"crs_mismatch",message:"Images have different coordinate reference systems — alignment may be required."}),t.cloudy&&a.push({type:"cloud_cover",message:"Cloud cover detected — optical analysis may be affected."}),{valid:n.length===0,warnings:a,blockers:n}}function st(e,t,a,n,i,s){var o;return e?{id:((o=crypto.randomUUID)==null?void 0:o.call(crypto))??Date.now().toString(),timestamp:$(),originalQuery:s,intent:e.intent,intentLabel:e.label,intentIcon:e.icon,location:t,timeRange:a,isChangeQuery:n,requiredBands:e.requiredBands,operations:e.operations,sensor:e.sensor,output:e.output,multiTool:e.multiTool||!1,temporalRequired:e.temporalRequired,validation:i,color:e.color,steps:ot(e,i),evidenceRequired:!0}:rt(s)}function ot(e,t){const a=[{id:1,title:"Understand question",detail:`Intent recognized as: ${e.label}. Query parsed for location, temporal context, and required analysis type.`,status:"pending"},{id:2,title:"Inspect dataset",detail:`Checking band availability (${e.requiredBands.join(", ")}), CRS, resolution, NoData values, and acquisition metadata.`,status:"pending"},{id:3,title:"Select analysis method",detail:`Selected: ${e.operations.join(" → ")}. Method chosen based on query intent and available spectral bands.`,status:"pending"},{id:4,title:"Run computation",detail:`Performing ${e.operations.join(", ")} on loaded raster data. All computations are deterministic.`,status:"pending"},{id:5,title:"Validate result",detail:"Checking output for data gaps, CRS consistency, NoData regions, and computation integrity.",status:"pending"},{id:6,title:"Generate evidence",detail:"Assembling visual evidence: before/after layers, change map, statistics, source metadata.",status:"pending"},{id:7,title:"Explain result",detail:"Generating structured explanation with KNOWN / INFERRED / CANNOT DETERMINE distinction.",status:"pending"}];return t.blockers.length>0&&(a[3].detail=`⚠️ Blocked: ${t.blockers.map(n=>n.message).join("; ")}`,a[3].blocked=!0,a[4].blocked=!0,a[5].blocked=!0,a[6].blocked=!0),a}function rt(e){return{id:Date.now().toString(),timestamp:$(),originalQuery:e,intent:"unknown",intentLabel:"Unrecognized Query",intentIcon:"❓",location:{name:"Unknown"},timeRange:"Unknown",requiredBands:[],operations:[],output:[],validation:{valid:!1,blockers:[{type:"unknown_intent",message:"Query intent could not be determined.",suggestion:"Try asking about vegetation, urban areas, water bodies, or change detection."}],warnings:[]},steps:[],evidenceRequired:!1}}function B(e=null){const t=[{icon:"🌿",category:"Vegetation",query:"Where is vegetation strongest?",intent:"vegetation_current",requiredBands:["NIR"],unavailableReason:"NDVI suggestions unavailable — NIR band not detected."},{icon:"🔄",category:"Change",query:"What changed between the available dates?",intent:"change_detection",requiredBands:[],temporalRequired:!0,unavailableReason:"Temporal comparison unavailable — only one image loaded."},{icon:"🏗️",category:"Built-up",query:"Where are major built-up regions?",intent:"urban_expansion",requiredBands:[]},{icon:"💧",category:"Water",query:"Where are water-like regions visible?",intent:"water_detection",requiredBands:["NIR"],unavailableReason:"Water index unavailable — NIR band not detected."},{icon:"⚖️",category:"Combined",query:"Has urban expansion increased while vegetation decreased?",intent:"combined_urban_vegetation",requiredBands:["NIR"],unavailableReason:"Combined analysis unavailable — NIR band not detected."},{icon:"📍",category:"Region",query:"What is happening around this selected region?",intent:"change_detection",requiredBands:[]}];return e?t.map(a=>{var s;let n=!0,i=null;return(s=a.requiredBands)!=null&&s.includes("NIR")&&!e.hasNIR&&(n=!1,i=a.unavailableReason),a.temporalRequired&&!e.hasMultipleImages&&(n=!1,i=a.unavailableReason),{...a,available:n,unavailableReason:i}}):t}function lt(e){const t=e.toLowerCase().trim();return/zoom.*change|focus.*change/.test(t)?{action:"zoom_to_change"}:/show.*vegetation|vegetation.*only/.test(t)?{action:"show_layer",layer:"ndvi"}:/show.*water/.test(t)?{action:"show_layer",layer:"water"}:/show.*built|show.*urban/.test(t)?{action:"show_layer",layer:"buildup"}:/show.*change|change.*layer/.test(t)?{action:"show_layer",layer:"change"}:/hide.*original|remove.*image/.test(t)?{action:"hide_layer",layer:"base"}:/before.*after|compare.*date/.test(t)?{action:"toggle_comparison"}:/largest.*change|biggest.*change/.test(t)?{action:"highlight_largest_change"}:/reset.*map|clear.*map/.test(t)?{action:"reset_map"}:/zoom.*in/.test(t)?{action:"zoom",direction:"in"}:/zoom.*out/.test(t)?{action:"zoom",direction:"out"}:/north|south|east|west/.test(t)?{action:"pan",direction:t.match(/(north|south|east|west)/)[1]}:{action:"unknown",text:e}}async function Te(e){const t={filename:e.name,filesize:Ke(e.size),format:"Unknown",width:null,height:null,bands:0,bandNames:[],crs:"Unknown",resolution:null,nodata:!1,nodataValue:null,acquisitionDate:null,sensor:"Unknown",hasNIR:!1,hasRed:!1,hasGreen:!1,hasBlue:!1,hasSWIR:!1,hasThermal:!1,hasMultipleImages:!1,cloudy:!1,bbox:null,pixelStats:null,health:0,healthChecks:[],raw:null,isGeoTIFF:!1,pixelData:null,error:null},a=e.name.toLowerCase();a.endsWith(".tif")||a.endsWith(".tiff")||a.endsWith(".geotiff")?(t.format="GeoTIFF",t.isGeoTIFF=!0):a.endsWith(".jpg")||a.endsWith(".jpeg")?t.format="JPEG":a.endsWith(".png")?t.format="PNG":t.format=e.type||"Unknown";try{t.isGeoTIFF&&window.GeoTIFF?await ct(e,t):(t.format==="PNG"||t.format==="JPEG")&&await dt(e,t)}catch(n){t.error=`Could not fully parse file: ${n.message}`}return pt(t),mt(t,e.name),vt(t,e.name),gt(t),t}async function ct(e,t){const a=await e.arrayBuffer(),i=await(await window.GeoTIFF.fromArrayBuffer(a)).getImage();t.width=i.getWidth(),t.height=i.getHeight(),t.bands=i.getSamplesPerPixel();const s=i.getBoundingBox();s&&(t.bbox={west:s[0].toFixed(4),south:s[1].toFixed(4),east:s[2].toFixed(4),north:s[3].toFixed(4),center:[(s[1]+s[3])/2,(s[0]+s[2])/2]});const[r,o]=i.getResolution(i)||[null,null];r&&(t.resolution=Math.abs(r).toFixed(2)+"m (approx)");const l=i.fileDirectory;l!=null&&l.GeoAsciiParamsTag&&(t.crs=l.GeoAsciiParamsTag.trim().replace(/\|/g,"").trim(),t.crs.includes("WGS 84")?t.crs="EPSG:4326":t.crs.includes("UTM zone 43N")?t.crs="EPSG:32643":t.crs.includes("UTM zone 44N")&&(t.crs="EPSG:32644"));const g=l==null?void 0:l.GDAL_NODATA;g!=null&&(t.nodata=!0,t.nodataValue=g);try{const f=await i.readRasters({samples:[0]}),b=f[0];t.pixelData=f,t.pixelStats=ut(b,t.nodataValue)}catch{t.pixelStats=null}t.raw=l}async function dt(e,t){return new Promise(a=>{const n=new Image,i=URL.createObjectURL(e);n.onload=()=>{t.width=n.naturalWidth,t.height=n.naturalHeight,t.bands=3,t.crs="Unknown (non-geospatial image)",URL.revokeObjectURL(i),a()},n.onerror=()=>{URL.revokeObjectURL(i),a()},n.src=i})}function ut(e,t){let a=1/0,n=-1/0,i=0,s=0;for(let r=0;r<e.length;r+=10){const o=e[r];t!==null&&o===parseFloat(t)||isNaN(o)||o===0||(o<a&&(a=o),o>n&&(n=o),i+=o,s++)}return s>0?{min:a.toFixed(2),max:n.toFixed(2),mean:(i/s).toFixed(2),count:s}:null}function pt(e){var n;const t=e.bands,a=((n=e.filename)==null?void 0:n.toLowerCase())||"";t>=4||a.includes("s2")||a.includes("sentinel")||a.includes("landsat")||a.includes("ms")?(e.hasBlue=!0,e.hasGreen=!0,e.hasRed=!0,e.hasNIR=!0,e.bandNames=t>=4?["Blue","Green","Red","NIR",...t>4?Array.from({length:t-4},(i,s)=>`Band ${s+5}`):[]]:["Blue","Green","Red"]):t===3?(e.hasBlue=!0,e.hasGreen=!0,e.hasRed=!0,e.bandNames=["Red","Green","Blue"]):t===1?e.bandNames=["Panchromatic"]:t===2&&(e.bandNames=["Band 1","Band 2"]),a.includes("nir")&&(e.hasNIR=!0),a.includes("swir")&&(e.hasSWIR=!0),a.includes("thermal")&&(e.hasThermal=!0)}function mt(e,t){const a=t.toLowerCase();a.includes("s1")||a.includes("sentinel-1")||a.includes("sentinel1")?e.sensor="Sentinel-1 (SAR)":a.includes("s2")||a.includes("sentinel-2")||a.includes("sentinel2")?e.sensor="Sentinel-2 (MSI)":a.includes("l8")||a.includes("landsat8")||a.includes("landsat-8")?e.sensor="Landsat-8 (OLI)":a.includes("l9")||a.includes("landsat9")?e.sensor="Landsat-9 (OLI-2)":a.includes("resourcesat")||a.includes("liss")?e.sensor="ResourceSat (LISS)":a.includes("cartosat")?e.sensor="Cartosat":e.bands>=4?e.sensor="Multispectral (Detected)":e.bands===1?e.sensor="Panchromatic":e.bands===3&&(e.sensor="RGB (Optical)")}function vt(e,t){const a=t.match(/20\d{2}/);if(a){const n=t.match(/20\d{2}[-_]?\d{0,2}[-_]?\d{0,2}/);e.acquisitionDate=n?n[0].replace(/[-_]/g,"-"):a[0]}}function gt(e){const t=[];let a=0;const n=e.crs&&e.crs!=="Unknown"&&e.crs!=="Unknown (non-geospatial image)";t.push({label:"CRS",pass:n,detail:n?e.crs:"CRS not detected"}),n&&(a+=20);const i=e.width>0&&e.height>0;t.push({label:"Dimensions",pass:i,detail:i?`${e.width} × ${e.height} px`:"Not read"}),i&&(a+=20);const s=e.bands>0;t.push({label:"Band availability",pass:s,detail:s?`${e.bands} band(s): ${e.bandNames.join(", ")}`:"No bands detected"}),s&&(a+=20),t.push({label:"NIR band",pass:e.hasNIR,detail:e.hasNIR?"Detected — NDVI possible":"Not detected — NDVI unavailable"}),e.hasNIR&&(a+=20);const r=e.sensor!=="Unknown"||e.acquisitionDate;t.push({label:"Metadata",pass:r,detail:r?`Sensor: ${e.sensor}`:"Minimal metadata"}),r&&(a+=10),t.push({label:"NoData handling",pass:!0,detail:e.nodata?`NoData value: ${e.nodataValue}`:"Not detected"}),a+=10,e.health=Math.min(a,100),e.healthChecks=t}function se(){return{filename:"ahmedabad_sentinel2_2023.tif",filesize:"42.3 MB",format:"GeoTIFF",width:10980,height:10980,bands:4,bandNames:["Blue","Green","Red","NIR"],crs:"EPSG:32643 (WGS84 / UTM Zone 43N)",resolution:"10.0m",nodata:!0,nodataValue:0,acquisitionDate:"2023-11-15",sensor:"Sentinel-2 MSI (Simulated)",hasNIR:!0,hasRed:!0,hasGreen:!0,hasBlue:!0,hasSWIR:!1,hasThermal:!1,hasMultipleImages:!0,cloudy:!1,bbox:{west:"72.25",south:"22.85",east:"72.85",north:"23.30",center:[23.075,72.55]},health:100,healthChecks:[{label:"CRS",pass:!0,detail:"EPSG:32643"},{label:"Dimensions",pass:!0,detail:"10980 × 10980 px"},{label:"Band availability",pass:!0,detail:"4 bands: Blue, Green, Red, NIR"},{label:"NIR band",pass:!0,detail:"Detected — NDVI possible"},{label:"Metadata",pass:!0,detail:"Sensor: Sentinel-2 MSI"},{label:"NoData handling",pass:!0,detail:"NoData = 0"}],pixelStats:{min:"0.00",max:"10000.00",mean:"1845.32",count:12e5},isGeoTIFF:!0,isDemo:!0,error:null}}const ft=Object.freeze(Object.defineProperty({__proto__:null,analyzeDataset:Te,createDemoProfile:se},Symbol.toStringTag,{value:"Module"}));async function bt(e,t,a,n={red:2,nir:3}){if(!e)return null;const{red:i,nir:s}=n,r=e[i],o=e[s];if(!r||!o)return null;const l=new Float32Array(t*a);let g=1,f=-1,b=0,h=0;for(let w=0;w<t*a;w++){const m=r[w],N=o[w];if(m===0&&N===0){l[w]=-9999;continue}const I=(N-m)/(N+m+1e-10);l[w]=I,I>-1&&I<=1&&(I<g&&(g=I),I>f&&(f=I),b+=I,h++)}const c={min:g.toFixed(3),max:f.toFixed(3),mean:(b/h).toFixed(3),pixelCount:h,vegetationPixels:0,barePixels:0,waterPixels:0,urbanPixels:0};for(let w=0;w<l.length;w++){const m=l[w];m!==-9999&&(m>.3?c.vegetationPixels++:m>0&&m<=.3?c.barePixels++:m<0&&c.waterPixels++)}c.urbanPixels=Math.max(0,h-c.vegetationPixels-c.barePixels-c.waterPixels),c.vegetationPct=(c.vegetationPixels/h*100).toFixed(1),c.barePct=(c.barePixels/h*100).toFixed(1),c.waterPct=(c.waterPixels/h*100).toFixed(1);const E=yt(l,t,a);return{type:"ndvi",data:l,colorized:E,stats:c,width:t,height:a,formula:"(NIR - Red) / (NIR + Red)",bands:{red:`Band ${i+1}`,nir:`Band ${s+1}`}}}function yt(e,t,a){const n=new Uint8ClampedArray(t*a*4),i=[[-1,[139,0,0]],[-.5,[215,48,39]],[-.1,[244,109,67]],[0,[253,174,97]],[.1,[254,224,139]],[.2,[217,239,139]],[.3,[166,217,106]],[.5,[102,189,99]],[.7,[26,152,80]],[1,[0,104,55]]];for(let s=0;s<t*a;s++){const r=e[s],o=s*4;if(r===-9999){n[o]=n[o+1]=n[o+2]=0,n[o+3]=0;continue}const[l,g,f]=ht(i,r);n[o]=l,n[o+1]=g,n[o+2]=f,n[o+3]=220}return n}function ht(e,t){const a=Math.max(-1,Math.min(1,t));for(let n=0;n<e.length-1;n++){const[i,s]=e[n],[r,o]=e[n+1];if(a>=i&&a<=r){const l=(a-i)/(r-i);return[Math.round(s[0]+l*(o[0]-s[0])),Math.round(s[1]+l*(o[1]-s[1])),Math.round(s[2]+l*(o[2]-s[2]))]}}return e[e.length-1][1]}function ye(e="ahmedabad_2023"){const t={ahmedabad_2022:{mean:"0.342",max:"0.821",min:"-0.187",vegetationPct:"38.2",barePct:"31.5",waterPct:"4.1",urbanPct:"26.2"},ahmedabad_2023:{mean:"0.298",max:"0.814",min:"-0.201",vegetationPct:"31.7",barePct:"28.4",waterPct:"3.8",urbanPct:"36.1"},ahmedabad_change:{vegetationChange:"-6.5",urbanChange:"+9.9",waterChange:"-0.3",bareChange:"-3.1",direction:"decrease"}};return t[e]||t.ahmedabad_2023}function he(){return{type:"change",stats:{increasedPct:"12.4",decreasedPct:"8.7",unchangedPct:"78.9",threshold:200,description:"Change detected between observation dates."},regions:[{name:"Northern Urban Fringe",type:"increase",areaSqKm:"14.2",confidence:"high"},{name:"Eastern Agricultural Zone",type:"decrease",areaSqKm:"8.6",confidence:"high"},{name:"Sabarmati Riverfront",type:"unchanged",areaSqKm:"5.1",confidence:"medium"}]}}async function wt(e,t,a){const n={plan:e,steps:[]};for(let i=0;i<e.steps.length;i++){const s=e.steps[i];if(a==null||a(i,"active",s),await H(600+Math.random()*400),s.blocked){a==null||a(i,"blocked",s),n.steps.push({...s,status:"blocked"});break}a==null||a(i,"completed",s),n.steps.push({...s,status:"completed"})}return n}function xt(e,t,a){var M,O;const n=[],i=!!t;n.push({label:"Compatible imagery loaded",pass:i,warn:!1,detail:i?`${t.filename} — ${t.format}`:"No image uploaded"});const r=(e.requiredBands||[]).includes("NIR"),o=!r||t&&t.hasNIR;n.push({label:"Required bands available",pass:o,warn:r&&!o,detail:o?`Bands: ${((M=t==null?void 0:t.bandNames)==null?void 0:M.join(", "))||"RGB"}`:"NIR band missing — spectral indices unavailable"});const l=e.temporalRequired,g=!l||t&&t.hasMultipleImages;n.push({label:"Temporal requirement met",pass:g,warn:l&&!g,detail:g?l?"Multiple observations available":"Temporal comparison not required for this analysis":"Only one image available — change detection requires two observations"});const f=!t||t.crs!=="Unknown";n.push({label:"Spatial alignment verified",pass:f,warn:!f,detail:f?`CRS: ${(t==null?void 0:t.crs)||"Not required"}`:"CRS unknown — spatial alignment cannot be verified"});const b=!!a;n.push({label:"Deterministic calculation completed",pass:b,warn:!1,detail:b?`Method: ${(O=e.operations)==null?void 0:O.join(", ")}`:"Calculation not yet performed"});const h=b;n.push({label:"Result visualized",pass:h,warn:!1,detail:h?"Map layer and statistics generated":"Pending analysis"});const c=n.filter(C=>C.pass).length,E=n.filter(C=>C.warn).length,w=n.length;let m,N,I;return c===w?(m="SUPPORTED",N="supported",I="✓"):c>=w*.5&&E<=1?(m="PARTIALLY SUPPORTED",N="partial",I="⚠"):(m="INSUFFICIENT EVIDENCE",N="insufficient",I="✕"),{checks:n,verdict:m,verdictClass:N,verdictIcon:I,score:Math.round(c/w*100)}}function It(e,t){var s,r,o,l,g,f;const a=[],n=[],i=[];return t?t.type==="ndvi"?(a.push(`Spectral index computed: mean NDVI = ${(s=t.stats)==null?void 0:s.mean}`),a.push(`${(r=t.stats)==null?void 0:r.vegetationPct}% of analyzed pixels classified as vegetation (NDVI > 0.3)`),((o=t.stats)==null?void 0:o.waterPct)>2&&a.push("Water-like regions detected (NDVI < 0)"),n.push("Regions with NDVI > 0.3 likely correspond to vegetated surfaces under standard atmospheric conditions"),n.push("NDVI values vary with seasonality, soil brightness, and atmospheric effects"),i.push("Exact plant species composition cannot be determined from NDVI alone"),i.push("Sub-pixel vegetation cannot be resolved at this spatial resolution")):t.type==="change"?(a.push("Spatial pixel difference computed between two observations"),a.push(`${(l=t.stats)==null?void 0:l.increasedPct}% of area shows positive change, ${(g=t.stats)==null?void 0:g.decreasedPct}% shows negative change`),n.push("Regions of positive change may correspond to increased surface reflectance"),n.push("Negative change regions may indicate decreased surface reflectance or land cover change"),i.push("The cause of detected change cannot be determined from imagery alone"),i.push("Atmospheric effects, phenological variation, and sensor differences may contribute to detected change")):(a.push("Spectral analysis performed on available imagery"),n.push("Results correspond to spectral patterns within the analyzed region"),i.push("Ground-truth validation not performed in this analysis")):(a.push(`Query intent: ${e.intentLabel}`),a.push(`Required analysis: ${(f=e.operations)==null?void 0:f.join(", ")}`),n.push("Analysis pending data availability and computation"),i.push("Results not yet available — analysis not complete")),{known:a,inferred:n,cannotDetermine:i}}function Lt(e,t,a,n){var i,s,r;return[{label:"Question understood as",value:e.intentLabel},{label:"Location",value:((i=e.location)==null?void 0:i.name)||"Not specified"},{label:"Data used",value:t?`${t.filename} (${t.bands} band(s), ${t.sensor})`:"No data uploaded"},{label:"Calculation",value:((s=e.operations)==null?void 0:s.join(" → "))||"None"},{label:"Evidence status",value:(n==null?void 0:n.verdict)||"Not computed"},{label:"Validation",value:(n==null?void 0:n.verdict)==="SUPPORTED"?"Passed — all evidence checks satisfied":`Partial — ${((r=n==null?void 0:n.checks)==null?void 0:r.filter(o=>!o.pass).length)||0} check(s) failed`},{label:"Limitations",value:"Change detection indicates spatial difference; it does not independently establish the cause. All results are based on spectral analysis only."},{label:"Timestamp",value:$()}]}function Et(e,t,a){var i,s,r;const n=[];return n.push({time:$(),action:"Query received",detail:`"${e.originalQuery}"`,status:"ok"}),n.push({time:$(),action:"Intent parsed",detail:`${e.intentLabel} (${e.intent})`,status:"ok"}),n.push({time:$(),action:"Dataset inspected",detail:t?`${t.filename}, ${t.bands} bands, ${t.crs}`:"No dataset loaded",status:t?"ok":"warn"}),((s=(i=e.validation)==null?void 0:i.blockers)==null?void 0:s.length)>0?n.push({time:$(),action:"Validation failed",detail:e.validation.blockers.map(o=>o.message).join("; "),status:"error"}):n.push({time:$(),action:"Analysis method selected",detail:`${(r=e.operations)==null?void 0:r.join(", ")}`,status:"ok"}),a&&(n.push({time:$(),action:"Computation completed",detail:`Type: ${a.type}, Formula: ${a.formula||"N/A"}`,status:"ok"}),n.push({time:$(),action:"Evidence assembled",detail:"Statistics, visualization, and explanation generated",status:"ok"})),n}function Nt(e){const t={vegetation_current:{sensor:"Optical Multispectral",examples:["Sentinel-2 MSI","Landsat-8/9 OLI"],reason:"Requires Red and NIR spectral bands for NDVI computation.",bands:"Red (Band 4) + NIR (Band 8)"},vegetation_change:{sensor:"Optical Multispectral (Multitemporal)",examples:["Sentinel-2 MSI","Landsat archive"],reason:"Requires multispectral bands at two or more comparable dates.",bands:"Red + NIR, two observations"},urban_expansion:{sensor:"Optical Multispectral",examples:["Sentinel-2 MSI","Landsat-8 OLI","ResourceSat LISS-III"],reason:"SWIR bands improve built-up area discrimination.",bands:"Red + NIR + SWIR"},water_detection:{sensor:"Optical (or SAR under cloud cover)",examples:["Sentinel-2 (optical)","Sentinel-1 (SAR)"],reason:"NDWI uses Green + NIR. SAR complements under cloud conditions.",bands:"Green + NIR (optical), C-band VV/VH (SAR)"},flood_analysis:{sensor:"SAR (preferred)",examples:["Sentinel-1 C-band","RISAT-1","NISAR (planned)"],reason:"Radar observations can penetrate cloud cover — critical for flood monitoring.",bands:"C-band SAR (VV or VH polarization)",note:"SAR data acquisition is PLANNED in SatQuery prototype."},change_detection:{sensor:"Any multitemporal imagery",examples:["Sentinel-2","Landsat","PlanetScope","CartoSat"],reason:"Requires two or more images from comparable acquisition conditions.",bands:"Any matching spectral bands"}};return t[e]||t.change_detection}function At(e){const t={missing_band:{NIR:[{label:"Visual vegetation assessment",detail:"Qualitatively assess green areas from RGB imagery."},{label:"Upload multispectral imagery",detail:"Add a GeoTIFF with NIR band (Sentinel-2 or Landsat)."},{label:"Use Sentinel-2 data from Copernicus",detail:"Free access at scihub.copernicus.eu (PLANNED integration)."}]},single_image:[{label:"Analyze single-date statistics",detail:"Perform NDVI or spectral analysis on the available image."},{label:"Upload a second image",detail:"Add an earlier or later observation to enable change detection."},{label:"Use demo scenario",detail:"Load the built-in Ahmedabad demo dataset with pre-loaded temporal pair."}],unknown_intent:[{label:"Try a clearer question",detail:'e.g., "Show NDVI in this area" or "What changed between 2022 and 2023?"'},{label:"Select from suggested queries",detail:"Use the query suggestions panel to explore available analyses."},{label:"Use the Query Planner",detail:"Build a structured query manually using the analysis planner."}]};return e.type==="missing_band"?t.missing_band[e.band]||[]:t[e.type]||[]}const Z={NDVI:{id:"NDVI",name:"Spectral Index Engine — NDVI",icon:"🌿",description:"Computes Normalized Difference Vegetation Index from Red and NIR bands.",formula:"(NIR - Red) / (NIR + Red)",inputs:["Red band","NIR band"],outputs:["NDVI raster","Classification map","Statistics"],requiredBands:["Red","NIR"],why:e=>`The question concerns ${e} and the available data contains Red and NIR spectral bands.`,status:"LIVE"},NDWI:{id:"NDWI",name:"Water Detection Engine — NDWI",icon:"💧",description:"Detects water bodies using Normalized Difference Water Index.",formula:"(Green - NIR) / (Green + NIR)",inputs:["Green band","NIR band"],outputs:["Water extent map","Statistics"],requiredBands:["Green","NIR"],why:()=>"The query involves water body detection or flood analysis.",status:"LIVE"},CHANGE_DETECTION:{id:"CHANGE_DETECTION",name:"Change Detection Engine",icon:"🔄",description:"Detects pixel-level differences between two temporal observations.",formula:"Δ = Band_t2 - Band_t1",inputs:["Image (t1)","Image (t2)","Band selection"],outputs:["Change raster","Statistics","Changed regions"],requiredBands:["Any matching bands"],why:()=>"The question involves temporal comparison — detecting what changed between observations.",status:"LIVE"},SPATIAL_OVERLAP:{id:"SPATIAL_OVERLAP",name:"Spatial Correlation Engine",icon:"⚖️",description:"Identifies spatial overlap between two analysis layers.",formula:"Pixel-wise AND of thresholded masks",inputs:["Layer A","Layer B"],outputs:["Overlap map","Overlap statistics"],requiredBands:["Two computed layers"],why:()=>"Cross-analysis between vegetation and urban layers requires spatial comparison.",status:"LIVE"},VISUAL_QA:{id:"VISUAL_QA",name:"Visual Question Answering",icon:"🤖",description:"Answers natural language questions about satellite imagery content.",inputs:["Satellite image","Text query"],outputs:["Text answer","Evidence"],requiredBands:["RGB or multispectral"],why:()=>"The question is best answered by direct visual analysis of image content.",status:"DEMO",note:"Uses Qwen2.5-VL architecture. Demo responses are curated."},NDBI:{id:"NDBI",name:"Built-up Index Engine — NDBI",icon:"🏗️",description:"Detects built-up and urban areas using Normalized Difference Built-up Index.",formula:"(SWIR - NIR) / (SWIR + NIR)",inputs:["SWIR band","NIR band"],outputs:["Built-up map","Statistics"],requiredBands:["SWIR","NIR"],why:()=>"The question involves urban areas and SWIR band is available for NDBI computation.",status:"LIVE",fallback:"Without SWIR, urban extent estimated from spectral brightness analysis."}};function St(e,t){const a=[],n=[],i=e.operations||[];for(const s of i){const r=s.toUpperCase().replace(/[\s-]/g,"_"),o=Z[r]||Z[s.toUpperCase()];if(!o){const l=Object.values(Z).find(g=>g.id.toLowerCase().includes(s.toLowerCase())||s.toLowerCase().includes(g.id.toLowerCase().slice(0,4)));l&&a.push(l);continue}if(o.requiredBands.includes("NIR")&&t&&!t.hasNIR){n.push({tool:o.id,reason:`NIR band missing — ${o.name} unavailable`,suggestion:o.fallback});continue}if(o.requiredBands.includes("SWIR")&&t&&!t.hasSWIR){n.push({tool:o.id,reason:`SWIR band missing — ${o.name} limited`,suggestion:o.fallback}),o.fallback&&a.push({...o,degraded:!0,degradedReason:o.fallback});continue}a.push(o)}return e.multiTool&&a.length>=2?{tools:a,isMultiTool:!0,finalStep:"Cross-analysis",finalDescription:"Combine results from all specialist tools to identify spatial relationships.",warnings:n}:{tools:a,isMultiTool:!1,warnings:n}}function Dt(e,t){var n;const a=[];a.push({id:"query",type:"input",label:"USER QUESTION",value:e.length>40?e.slice(0,40)+"...":e,icon:"💬",status:"completed"}),a.push({id:"data",type:"data",label:"DATASET",value:"Spectral raster data",icon:"🗂️",status:"completed"});for(const i of t.tools)a.push({id:`tool_${i.id}`,type:"tool",label:"SPECIALIST TOOL",value:i.name,icon:i.icon,status:"pending",detail:((n=i.why)==null?void 0:n.call(i,e))||i.description,formula:i.formula,inputs:i.inputs,outputs:i.outputs,statusBadge:i.status,degraded:i.degraded});return t.isMultiTool&&a.push({id:"cross",type:"cross",label:"CROSS-ANALYSIS",value:"Spatial correlation + synthesis",icon:"⚖️",status:"pending"}),a.push({id:"evidence",type:"evidence",label:"EVIDENCE",value:"Visual + statistical + explanation",icon:"🔍",status:"pending"}),a.push({id:"answer",type:"output",label:"ANSWER",value:"Structured, evidence-backed response",icon:"✓",status:"pending"}),a}function $t(e,t){var a;return{toolName:e.name,reason:((a=e.why)==null?void 0:a.call(e,t.intentLabel))||`Selected because the query involves ${t.intentLabel.toLowerCase()}.`,formula:e.formula,inputs:e.inputs,outputs:e.outputs,status:e.status,note:e.note||null,degraded:e.degraded||!1,degradedReason:e.degradedReason||null}}let v=null,G=null,T={},oe=null,X=!1;function Pe(e="leaflet-map"){return v&&(v.remove(),v=null),v=L.map(e,{center:[23.0225,72.5714],zoom:10,zoomControl:!1,attributionControl:!0}),L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",{attribution:"© Google",maxZoom:20}).addTo(v),L.control.zoom({position:"bottomright"}).addTo(v),L.control.scale({metric:!0,imperial:!1,position:"bottomleft"}).addTo(v),G=new L.FeatureGroup,v.addLayer(G),Rt(),v}function Rt(){const e=document.getElementById("map-coords");e&&v.on("mousemove",t=>{e.textContent=`${Q(t.latlng.lat,!0)}  ${Q(t.latlng.lng,!1)}`})}function re(e,t,a,n={}){Ce(a);const i=L.imageOverlay(e,t,{opacity:n.opacity||.85,...n});return i.addTo(v),T[a]=i,i}function Ce(e){T[e]&&(v.removeLayer(T[e]),delete T[e])}function V(e,t){const a=T[e];a&&(t?a.setOpacity(.85):a.setOpacity(0))}function _e(e){for(const[t,a]of Object.entries(T))t===e?a.setOpacity(.85):t!=="base"&&a.setOpacity(0)}function Ve(){for(const e of Object.values(T))e.setOpacity(.85)}function Me(){const e=[[22.85,72.25],[23.3,72.85]],a=kt().toDataURL("image/png");return re(a,e,"ndvi",{opacity:.8})}function Oe(){const e=[[22.85,72.25],[23.3,72.85]],a=Tt().toDataURL("image/png");return re(a,e,"change",{opacity:.75})}function kt(){const a=document.createElement("canvas");a.width=512,a.height=512;const n=a.getContext("2d");n.fillStyle="#f9a05a",n.fillRect(0,0,512,512);const i=[{x:80,y:60,r:80,color:"#1a9850"},{x:380,y:180,r:60,color:"#66bd63"},{x:220,y:320,r:45,color:"#1a9850"},{x:100,y:400,r:55,color:"#a6d96a"},{x:440,y:380,r:40,color:"#66bd63"},{x:300,y:100,r:35,color:"#a6d96a"}];return[{x:260,y:240,w:25,h:180,color:"#4393c3"}].forEach(o=>{n.fillStyle=o.color,n.beginPath(),n.ellipse(o.x,o.y,o.w,o.h,.1,0,Math.PI*2),n.fill()}),i.forEach(o=>{const l=n.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);l.addColorStop(0,o.color),l.addColorStop(.7,o.color+"bb"),l.addColorStop(1,"transparent"),n.fillStyle=l,n.beginPath(),n.arc(o.x,o.y,o.r,0,Math.PI*2),n.fill()}),[{x:240,y:200,r:100,color:"#d73027"},{x:180,y:160,r:70,color:"#f46d43"},{x:310,y:280,r:60,color:"#d73027"}].forEach(o=>{n.fillStyle=o.color+"66",n.beginPath(),n.arc(o.x,o.y,o.r,0,Math.PI*2),n.fill()}),a}function Tt(){const a=document.createElement("canvas");a.width=512,a.height=512;const n=a.getContext("2d");n.clearRect(0,0,512,512);const i=[{x:350,y:150,r:65,label:"Urban expansion"},{x:420,y:260,r:45,label:"New development"},{x:280,y:380,r:40,label:"Construction"}];return[{x:100,y:120,r:55,label:"Vegetation loss"},{x:170,y:360,r:45,label:"Agricultural change"}].forEach(r=>{const o=n.createRadialGradient(r.x,r.y,0,r.x,r.y,r.r);o.addColorStop(0,"#d73027dd"),o.addColorStop(.6,"#d7302799"),o.addColorStop(1,"transparent"),n.fillStyle=o,n.beginPath(),n.arc(r.x,r.y,r.r,0,Math.PI*2),n.fill()}),i.forEach(r=>{const o=n.createRadialGradient(r.x,r.y,0,r.x,r.y,r.r);o.addColorStop(0,"#1a9850dd"),o.addColorStop(.6,"#1a985099"),o.addColorStop(1,"transparent"),n.fillStyle=o,n.beginPath(),n.arc(r.x,r.y,r.r,0,Math.PI*2),n.fill()}),a}function te(e="rectangle",t){if(!v)return;G.clearLayers();let a;switch(e){case"rectangle":a=new L.Draw.Rectangle(v,{shapeOptions:{color:"#00bcd4",weight:2,fillOpacity:.1}});break;case"polygon":a=new L.Draw.Polygon(v,{shapeOptions:{color:"#00bcd4",weight:2,fillOpacity:.1}});break;case"circle":a=new L.Draw.Circle(v,{shapeOptions:{color:"#00bcd4",weight:2,fillOpacity:.1}});break;case"marker":a=new L.Draw.Marker(v);break;default:a=new L.Draw.Rectangle(v,{shapeOptions:{color:"#00bcd4",weight:2,fillOpacity:.1}})}a.enable(),v.once(L.Draw.Event.CREATED,n=>{const i=n.layer;G.addLayer(i),a.disable();const s=Pt(i,e);oe=s,t==null||t(s)})}function Pt(e,t){let a,n,i=null,s=null;if(t==="rectangle"||t==="polygon")if(a=e.getBounds(),n=a.getCenter(),t==="polygon"){const r=e.getLatLngs()[0];s=r.map(o=>[o.lat.toFixed(4),o.lng.toFixed(4)]),i=be(r)}else{const r=a.getSouthWest(),o=a.getNorthEast();s=[[r.lat.toFixed(4),r.lng.toFixed(4)],[o.lat.toFixed(4),o.lng.toFixed(4)]],a.getSouthWest(),a.getNorthEast(),a.getNorthEast(),a.getSouthWest(),i=be([a.getSouthWest(),a.getSouthEast(),a.getNorthEast(),a.getNorthWest()])}else if(t==="circle"){n=e.getLatLng();const r=e.getRadius();i=(Math.PI*r*r/1e6).toFixed(2),s=[[n.lat.toFixed(4),n.lng.toFixed(4)]],a=e.getBounds()}else t==="marker"&&(n=e.getLatLng(),s=[[n.lat.toFixed(4),n.lng.toFixed(4)]],a=L.latLngBounds([n]));return{type:t,bounds:a,center:n,area:i,coords:s,layer:e,timestamp:new Date().toISOString()}}function le(){G.clearLayers(),oe=null}function qe(){return oe}function ze(e){v.on("click",t=>{const{lat:a,lng:n}=t.latlng,i=`
      <div style="min-width:220px;font-family:var(--font-sans)">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;font-family:var(--font-mono)">
          ${Q(a,!0)}&nbsp;&nbsp;${Q(n,!1)}
        </div>
        <div style="font-size:12px;font-weight:600;color:var(--cyan-300);margin-bottom:8px">Map Copilot</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="map-copilot-btn" data-q="What is happening here?" style="text-align:left;background:var(--bg-panel);border:1px solid var(--border-subtle);border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;color:var(--text-secondary)">What is happening here?</button>
          <button class="map-copilot-btn" data-q="How much vegetation is present?" style="text-align:left;background:var(--bg-panel);border:1px solid var(--border-subtle);border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;color:var(--text-secondary)">How much vegetation is present?</button>
          <button class="map-copilot-btn" data-q="What changed here?" style="text-align:left;background:var(--bg-panel);border:1px solid var(--border-subtle);border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;color:var(--text-secondary)">What changed here?</button>
          <button class="map-copilot-btn" data-q="Compare this region with surroundings" style="text-align:left;background:var(--bg-panel);border:1px solid var(--border-subtle);border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;color:var(--text-secondary)">Compare with surroundings</button>
        </div>
      </div>
    `;L.popup({maxWidth:280,className:"satquery-popup"}).setLatLng(t.latlng).setContent(i).openOn(v),setTimeout(()=>{document.querySelectorAll(".map-copilot-btn").forEach(s=>{s.addEventListener("click",()=>{const r=s.dataset.q;v.closePopup(),e==null||e({query:r,lat:a,lng:n})})})},100)})}function Ct(){v.off("click")}function Be(e){if(!v)return!1;switch(e.action){case"zoom_to_change":return _t(),!0;case"show_layer":return _e(e.layer),y(`Showing ${e.layer} layer`,"info",2e3),!0;case"hide_layer":return V(e.layer,!1),y(`Hidden: ${e.layer}`,"info",2e3),!0;case"toggle_comparison":return Vt(),!0;case"reset_map":return Ve(),v.setView([23.0225,72.5714],10),y("Map reset","info",2e3),!0;case"zoom":return e.direction==="in"?v.zoomIn():v.zoomOut(),!0;case"pan":const t=.05,a=v.getCenter(),n={north:[t,0],south:[-t,0],east:[0,t],west:[0,-t]},[i,s]=n[e.direction]||[0,0];return v.panTo([a.lat+i,a.lng+s]),!0;default:return!1}}function _t(){v.flyTo([23.12,72.68],12,{duration:1.5})}function Vt(){X=!X,X?(V("ndvi",!0),V("change",!1),y("Before view active — toggle again for After","info",3e3)):(V("ndvi",!1),V("change",!0),y("After view (change layer) active","info",3e3))}function Ge(e){!v||!(e!=null&&e.center)||v.flyTo(e.center,e.zoom||11,{duration:1.5})}function Mt(e,t="#00bcd4",a=""){const n=L.rectangle(e,{color:t,weight:2,fillOpacity:.1,dashArray:"6 4"}).addTo(v);return a&&n.bindTooltip(a,{permanent:!0,direction:"top",className:"satquery-tooltip"}),T[`highlight_${Date.now()}`]=n,n}function Ot(e,t,a,n){const i=L.map(e,{center:a||[23.0225,72.5714],zoom:10,zoomControl:!1}),s=L.map(t,{center:n||[21.1702,72.8311],zoom:10,zoomControl:!1}),r=()=>L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",{attribution:"© Google",subdomains:"abcd"});return r().addTo(i),r().addTo(s),i.on("moveend",()=>s.setView(i.getCenter(),i.getZoom(),{animate:!1})),s.on("moveend",()=>i.setView(s.getCenter(),s.getZoom(),{animate:!1})),{map1:i,map2:s}}function qt(){return v==null?void 0:v.getCenter()}function zt(){return v==null?void 0:v.getZoom()}function Bt(){return v}function ce(){v==null||v.invalidateSize()}const K=Object.freeze(Object.defineProperty({__proto__:null,addClickPopup:ze,addDemoChangeLayer:Oe,addDemoNDVILayer:Me,addImageOverlay:re,clearAOI:le,executeMapCommand:Be,flyToLocation:Ge,getAOI:qe,getMap:Bt,getMapCenter:qt,getMapZoom:zt,highlightRegion:Mt,initDualMap:Ot,initMap:Pe,invalidateMap:ce,removeClickPopup:Ct,removeLayer:Ce,resetLayers:Ve,showOnlyLayer:_e,startDrawing:te,toggleLayer:V},Symbol.toStringTag,{value:"Module"}));let D=null,z=!1;function Gt(e,t,a){const n=window.SpeechRecognition||window.webkitSpeechRecognition;return n?(D=new n,D.lang="en-IN",D.continuous=!1,D.interimResults=!0,D.maxAlternatives=1,D.onresult=i=>{const s=i.results[0][0].transcript,r=i.results[0].isFinal;e==null||e({transcript:s,isFinal:r})},D.onerror=i=>{z=!1,t==null||t(i.error==="no-speech"?"No speech detected. Please try again.":`Voice error: ${i.error}`)},D.onend=()=>{z=!1,a==null||a()},D.start(),z=!0,!0):(t==null||t("Voice input is not supported in this browser. Please use Chrome or Edge."),!1)}function Wt(){D==null||D.stop(),z=!1}function Ut(){return z}const ae={en:{understood_query:"Understood Query",location:"Location",analysis:"Analysis",required_data:"Required Data",temporal:"Temporal Requirement",output:"Output",evidence_quality:"Evidence Quality",supported:"SUPPORTED",partial:"PARTIALLY SUPPORTED",insufficient:"INSUFFICIENT EVIDENCE",known:"WHAT WE KNOW",inferred:"WHAT WE INFER",cannot_determine:"WHAT WE CANNOT DETERMINE",loading:"Analyzing...",no_data:"No data available",spatial_overlap:"Spatial overlap detected.",disclaimer:"Change detection indicates spatial difference; it does not independently establish the cause.",data_profile:"Dataset Profile",data_health:"Data Health",analysis_plan:"Analysis Plan",agent_plan:"Agent Plan",evidence_graph:"Evidence Graph",answer_trace:"Why did SatQuery say this?",challenge:"Challenge Result",rerun:"Re-run Analysis",vegetation:"Vegetation",urban:"Built-up",water:"Water",change:"Change",sensor_recommendation:"Recommended Data",alternatives:"Available Alternatives"},hi:{understood_query:"समझी गई क्वेरी",location:"स्थान",analysis:"विश्लेषण",required_data:"आवश्यक डेटा",temporal:"समयिक आवश्यकता",output:"आउटपुट",evidence_quality:"साक्ष्य गुणवत्ता",supported:"समर्थित",partial:"आंशिक रूप से समर्थित",insufficient:"अपर्याप्त साक्ष्य",known:"हम क्या जानते हैं",inferred:"हम क्या अनुमान लगाते हैं",cannot_determine:"हम क्या निर्धारित नहीं कर सकते",loading:"विश्लेषण हो रहा है...",no_data:"डेटा उपलब्ध नहीं",spatial_overlap:"स्थानिक अतिव्यापन का पता चला।",disclaimer:"परिवर्तन का पता लगाना स्थानिक अंतर को इंगित करता है; यह स्वतंत्र रूप से कारण स्थापित नहीं करता।",data_profile:"डेटासेट प्रोफाइल",data_health:"डेटा स्वास्थ्य",analysis_plan:"विश्लेषण योजना",agent_plan:"एजेंट योजना",evidence_graph:"साक्ष्य ग्राफ",answer_trace:"SatQuery ने यह क्यों कहा?",challenge:"परिणाम को चुनौती दें",rerun:"विश्लेषण दोबारा चलाएं",vegetation:"वनस्पति",urban:"निर्मित क्षेत्र",water:"जल",change:"परिवर्तन",sensor_recommendation:"अनुशंसित डेटा",alternatives:"उपलब्ध विकल्प"},gu:{understood_query:"સ્વીકૃત ક્વેરી",location:"સ્થળ",analysis:"વિશ્લેષણ",required_data:"જરૂરી ડેટા",temporal:"સ્થાયી જરૂરિયાત",output:"આઉટપુટ",evidence_quality:"પુરાવાની ગુણવત્તા",supported:"સમર્થિત",partial:"આંશિક સમર્થિત",insufficient:"અપૂરતા પુરાવા",known:"આપણે શું જાણીએ છીએ",inferred:"આપણે શું અનુમાન કરીએ છીએ",cannot_determine:"આપણે શું નક્કી કરી શકતા નથી",loading:"વિશ્લેષણ ચાલી રહ્યું છે...",no_data:"ડેટા ઉપલબ્ધ નથી",spatial_overlap:"અવકાશી ઓવરલેપ શોધાયેલ.",disclaimer:"ફેરફાર શોધ અવકાશી તફાવત દર્શાવે છે; તે સ્વતંત્ર રીતે કારણ સ્થાપિત કરતું નથી.",data_profile:"ડેટાસેટ પ્રોફાઇલ",data_health:"ડેટા આરોગ્ય",analysis_plan:"વિશ્લેષણ યોજના",agent_plan:"એજન્ટ યોજના",evidence_graph:"પુરાવા ગ્રાફ",answer_trace:"SatQuery એ આ શા માટે કહ્યું?",challenge:"પરિણામ પડકારો",rerun:"વિશ્લેષણ ફરી ચલાવો",vegetation:"વનસ્પતિ",urban:"નિર્મિત વિસ્તાર",water:"પાણી",change:"ફેરફાર",sensor_recommendation:"ભલામણ કરેલ ડેટા",alternatives:"ઉપલબ્ધ વિકલ્પો"}};let We="en";function Ue(e){We=e,document.documentElement.lang=e,localStorage.setItem("satquery_lang",e)}function _(e){var t,a;return((t=ae[We])==null?void 0:t[e])||((a=ae.en)==null?void 0:a[e])||e}function jt(){const e=localStorage.getItem("satquery_lang");e&&ae[e]&&Ue(e)}const de="satquery_history",we=50;function Ft(e){var n,i;const t=ue(),a={id:((n=crypto.randomUUID)==null?void 0:n.call(crypto))??Date.now().toString(),timestamp:new Date().toISOString(),query:e.query,intent:e.intent,intentLabel:e.intentLabel,location:((i=e.location)==null?void 0:i.name)||"Unknown",dataset:e.dataset||null,analysisType:e.analysisType,evidenceVerdict:e.evidenceVerdict||"PENDING",status:e.status||"completed",icon:e.icon||"📊"};return t.unshift(a),t.length>we&&t.splice(we),localStorage.setItem(de,JSON.stringify(t)),a}function ue(){try{return JSON.parse(localStorage.getItem(de)||"[]")}catch{return[]}}function Ht(e){const t=ue().filter(a=>a.id!==e);localStorage.setItem(de,JSON.stringify(t))}const je="satquery_aois";function Qt(e,t){const a=Kt();a.push({id:Date.now().toString(),name:e,...t,savedAt:new Date().toISOString()}),localStorage.setItem(je,JSON.stringify(a))}function Kt(){try{return JSON.parse(localStorage.getItem(je)||"[]")}catch{return[]}}function Jt(e){var g,f,b,h;const{query:t,plan:a,profile:n,evidenceScore:i,uncertainty:s,auditTrail:r,timestamp:o}=e;return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SatQuery AI Analysis Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Space Grotesk',sans-serif;background:#f8f9fa;color:#1a1a2e;line-height:1.6}
  .report{max-width:900px;margin:0 auto;background:white;box-shadow:0 0 40px rgba(0,0,0,0.1)}
  .header{background:linear-gradient(135deg,#0a0e27,#0d1b4b);color:white;padding:40px;position:relative;overflow:hidden}
  .header::before{content:'🛰️';position:absolute;right:40px;top:50%;transform:translateY(-50%);font-size:80px;opacity:0.1}
  .header h1{font-size:28px;font-weight:700;margin-bottom:6px}
  .header .subtitle{font-size:13px;opacity:0.7;font-family:'JetBrains Mono',monospace;letter-spacing:0.06em}
  .section{padding:30px 40px;border-bottom:1px solid #e8ecf0}
  .section-title{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-bottom:16px;display:flex;align-items:center;gap:8px}
  .section-title::after{content:'';flex:1;height:1px;background:#e8ecf0;margin-left:8px}
  h2{font-size:20px;font-weight:700;color:#0d1b4b;margin-bottom:8px}
  p{color:#475569;font-size:14px;margin-bottom:10px}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px}
  .meta-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}
  .meta-label{color:#94a3b8;font-weight:600;font-size:11px;letter-spacing:0.06em;text-transform:uppercase}
  .meta-value{color:#0d1b4b;font-family:'JetBrains Mono',monospace;font-size:12px}
  .evidence-item{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px}
  .evidence-pass{color:#16a34a}
  .evidence-fail{color:#dc2626}
  .evidence-warn{color:#d97706}
  .verdict{font-size:22px;font-weight:700;margin:16px 0}
  .verdict.supported{color:#16a34a}
  .verdict.partial{color:#d97706}
  .verdict.insufficient{color:#dc2626}
  .unc-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:#e8ecf0;border-radius:8px;overflow:hidden;margin-top:16px}
  .unc-col{background:white;padding:16px}
  .unc-label{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px}
  .unc-label.known{color:#16a34a}.unc-label.inferred{color:#d97706}.unc-label.unknown{color:#dc2626}
  .unc-item{font-size:12px;color:#475569;margin-bottom:6px;padding-left:12px;position:relative}
  .unc-item::before{content:'•';position:absolute;left:0}
  .audit-row{display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px}
  .audit-time{color:#94a3b8;font-family:'JetBrains Mono',monospace;font-size:10px;min-width:140px}
  .audit-action{color:#0d1b4b;font-weight:600}
  .audit-detail{color:#475569}
  .status-ok{color:#16a34a}.status-warn{color:#d97706}.status-error{color:#dc2626}
  .footer{padding:20px 40px;background:#f8f9fa;text-align:center;font-size:11px;color:#94a3b8;font-family:'JetBrains Mono',monospace}
  .badge{display:inline-block;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase}
  .badge-live{background:#dcfce7;color:#16a34a}
  .badge-demo{background:#fef3c7;color:#d97706}
  .badge-planned{background:#f1f5f9;color:#64748b}
  .disclaimer{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:12px;color:#92400e;margin-top:16px}
  @media print{body{background:white}.report{box-shadow:none}}
</style>
</head>
<body>
<div class="report">
  <div class="header">
    <div class="subtitle">SatQuery AI — Geospatial Intelligence Platform</div>
    <h1>Analysis Report</h1>
    <div class="subtitle" style="margin-top:8px">${o||new Date().toLocaleString()}</div>
  </div>

  <div class="section">
    <div class="section-title">01 — Executive Summary</div>
    <h2>${(a==null?void 0:a.intentLabel)||"Geospatial Analysis"}</h2>
    <p>This report documents a ${((g=a==null?void 0:a.intentLabel)==null?void 0:g.toLowerCase())||"geospatial analysis"} performed using SatQuery AI on ${(n==null?void 0:n.filename)||"uploaded imagery"}. The analysis was triggered by a natural language query and processed through the intelligent query pipeline.</p>
  </div>

  <div class="section">
    <div class="section-title">02 — User Question</div>
    <p style="font-size:16px;color:#0d1b4b;font-style:italic">"${t||(a==null?void 0:a.originalQuery)||"N/A"}"</p>
    <div class="grid-2" style="margin-top:16px">
      <div><div class="meta-label">Intent Detected</div><div style="font-size:14px;font-weight:600;color:#0d1b4b;margin-top:4px">${(a==null?void 0:a.intentLabel)||"N/A"}</div></div>
      <div><div class="meta-label">Location</div><div style="font-size:14px;font-weight:600;color:#0d1b4b;margin-top:4px">${((f=a==null?void 0:a.location)==null?void 0:f.name)||"Not specified"}</div></div>
      <div><div class="meta-label">Temporal Range</div><div style="font-size:14px;color:#475569;margin-top:4px">${(a==null?void 0:a.timeRange)||"Not specified"}</div></div>
      <div><div class="meta-label">Analysis Operations</div><div style="font-size:14px;color:#475569;margin-top:4px">${((b=a==null?void 0:a.operations)==null?void 0:b.join(" → "))||"N/A"}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">03 — Dataset Information</div>
    ${n?`
    <div>
      ${[["File",n.filename],["Format",n.format],["Sensor",n.sensor],["Dimensions",n.width?`${n.width} × ${n.height} px`:"N/A"],["Bands",`${n.bands} — ${((h=n.bandNames)==null?void 0:h.join(", "))||"N/A"}`],["CRS",n.crs],["Resolution",n.resolution||"N/A"],["Acquisition Date",n.acquisitionDate||"Unknown"],["File Size",n.filesize],["NoData",n.nodata?`Detected (value: ${n.nodataValue})`:"Not detected"],["NIR Available",n.hasNIR?"✓ Yes — NDVI possible":"✗ No — NDVI unavailable"],["Data Health",`${n.health}%`]].map(([c,E])=>`<div class="meta-row"><span class="meta-label">${c}</span><span class="meta-value">${E}</span></div>`).join("")}
    </div>`:"<p>No dataset uploaded — analysis performed in demo mode.</p>"}
  </div>

  <div class="section">
    <div class="section-title">04 — Evidence Quality</div>
    <div class="verdict ${(i==null?void 0:i.verdictClass)||"partial"}">${(i==null?void 0:i.verdictIcon)||"⚠"} ${(i==null?void 0:i.verdict)||"NOT COMPUTED"}</div>
    <div>
      ${((i==null?void 0:i.checks)||[]).map(c=>`
        <div class="evidence-item ${c.pass?"evidence-pass":c.warn?"evidence-warn":"evidence-fail"}">
          <span>${c.pass?"✓":c.warn?"⚠":"✕"}</span>
          <span><strong>${c.label}</strong>${c.detail?" — "+c.detail:""}</span>
        </div>
      `).join("")}
    </div>
  </div>

  <div class="section">
    <div class="section-title">05 — Uncertainty Assessment</div>
    <div class="unc-grid">
      <div class="unc-col">
        <div class="unc-label known">What we know</div>
        ${((s==null?void 0:s.known)||["Analysis completed"]).map(c=>`<div class="unc-item">${c}</div>`).join("")}
      </div>
      <div class="unc-col">
        <div class="unc-label inferred">What we infer</div>
        ${((s==null?void 0:s.inferred)||["See full analysis"]).map(c=>`<div class="unc-item">${c}</div>`).join("")}
      </div>
      <div class="unc-col">
        <div class="unc-label unknown">Cannot determine</div>
        ${((s==null?void 0:s.cannotDetermine)||["Causal factors"]).map(c=>`<div class="unc-item">${c}</div>`).join("")}
      </div>
    </div>
    <div class="disclaimer">
      ⚠️ <strong>Scientific Limitation:</strong> Change detection indicates spatial difference between observations. It does not independently establish the cause of any detected change. All results are based on spectral analysis of the provided imagery.
    </div>
  </div>

  <div class="section">
    <div class="section-title">06 — Audit Trail</div>
    <div>
      ${(r||[]).map(c=>`
        <div class="audit-row">
          <div class="audit-time">${c.time||""}</div>
          <div style="flex:1">
            <span class="audit-action status-${c.status||"ok"}">${c.action}</span>
            ${c.detail?`<div class="audit-detail">${c.detail}</div>`:""}
          </div>
        </div>
      `).join("")}
    </div>
  </div>

  <div class="footer">
    Generated by SatQuery AI — Intelligent Geospatial Analysis Platform<br>
    Report generated: ${o||new Date().toLocaleString()} &nbsp;|&nbsp; All analysis is evidence-based and deterministic &nbsp;|&nbsp; Demo mode: curated data
  </div>
</div>
</body>
</html>`}function Yt(e,t="satquery-report.html"){const a=new Blob([e],{type:"text/html;charset=utf-8"}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=t,i.click(),URL.revokeObjectURL(n)}const Zt={ahmedabad_vegetation_change:{query:"Has vegetation decreased around Ahmedabad between 2022 and 2023?"}},ee=[{step:1,title:"Welcome to SatQuery AI",duration:8,action:"intro",narration:"SatQuery AI is an intelligent, evidence-first geospatial analysis platform. It understands natural language questions, validates data, selects specialist tools, and knows when it cannot answer."},{step:2,title:"Loading Demo Dataset",duration:5,action:"load_demo_dataset",narration:"Loading curated Ahmedabad Sentinel-2 demo dataset. This is a simulated multispectral dataset — clearly marked as DEMO."},{step:3,title:"Dataset Intelligence",duration:6,action:"show_dataset_profile",narration:"SatQuery automatically analyzes the dataset: detecting bands, CRS, resolution, sensor type, and computing a Data Health score."},{step:4,title:"Intelligent Query",duration:10,action:"type_query",query:"Has vegetation decreased around Ahmedabad between 2022 and 2023?",narration:"Watch as SatQuery converts this natural language question into a structured analysis plan — showing exactly what it understood."},{step:5,title:"Analysis Planning",duration:8,action:"show_agent_plan",narration:"The Agent Plan shows which specialist tools are selected and why. NDVI Engine selected because the question concerns vegetation and NIR band is available."},{step:6,title:"Running Analysis",duration:12,action:"run_analysis",narration:"Step-by-step analysis execution — each step is visible, transparent, and logged to the audit trail."},{step:7,title:"Map Visualization",duration:8,action:"show_map",narration:"NDVI layer rendered on the interactive map. Green regions indicate healthy vegetation. Red-orange indicates bare/urban areas."},{step:8,title:"Evidence & Answer",duration:8,action:"show_evidence",narration:"Evidence score computed: SUPPORTED. Uncertainty panel distinguishes what is KNOWN, INFERRED, and CANNOT BE DETERMINED."},{step:9,title:"Intelligent Failure",duration:8,action:"show_failure_case",narration:"Now SatQuery demonstrates what happens when analysis cannot be performed — educational failure with alternatives suggested."},{step:10,title:"Platform Capabilities",duration:6,action:"show_judge_mode",narration:"Judge Mode provides a complete architectural overview — LIVE, DEMO, and PLANNED features clearly distinguished."}],Xt={title:"Vegetation change detected in Ahmedabad study area",body:"Spectral analysis of the demo dataset shows a 6.5 percentage-point decrease in vegetation coverage and a 9.9 percentage-point increase in urban-like spectral signatures between the two available observations.",tags:["DEMO DATASET","NOT REAL-TIME"],disclaimer:"This is a demo observation from a curated dataset. It does not represent current real-world satellite intelligence.",icon:"🌿",evidenceVerdict:"SUPPORTED"},ea={problem:{title:"Problem Statement",content:"Satellite imagery analysis requires expert GIS knowledge. Citizens, farmers, and decision-makers cannot easily query, understand, or act upon geospatial data. Existing tools are either too technical or too superficial."},solution:{title:"SatQuery AI Solution",content:"An intelligent, evidence-first geospatial AI platform that understands natural language questions, validates data, routes to specialist tools, performs transparent analysis, and explains results with uncertainty quantification — making satellite intelligence accessible to everyone."},architecture:{layers:[{label:"User Interface",detail:"Responsive SPA — HTML + Vanilla JS + CSS",status:"LIVE",tech:"Web APIs, Leaflet.js"},{label:"Query Intelligence",detail:"Rule-based NLP → structured analysis plan",status:"LIVE",tech:"Custom NLP engine (LLM-swap ready)"},{label:"Dataset Intelligence",detail:"GeoTIFF reader, metadata analyzer, health scorer",status:"LIVE",tech:"geotiff.js, georaster"},{label:"Agent Orchestrator",detail:"Multi-tool routing, plan builder, execution",status:"LIVE",tech:"LangGraph-inspired (planned)"},{label:"Analysis Engine",detail:"NDVI, NDWI, change detection (pixel-level)",status:"LIVE",tech:"Deterministic raster math"},{label:"Evidence Engine",detail:"Checklist scoring, audit trail, uncertainty",status:"LIVE",tech:"Evidence-first framework"},{label:"Geospatial Engine",detail:"Map, AOI drawing, layer management",status:"LIVE",tech:"Leaflet.js + Leaflet.draw"},{label:"Backend API",detail:"FastAPI + Python (geospatial processing)",status:"PLANNED",tech:"FastAPI, Rasterio, GDAL, PostGIS"},{label:"Data Catalog",detail:"Live satellite data retrieval",status:"PLANNED",tech:"Copernicus API, Bhuvan NRSC"},{label:"LLM Integration",detail:"Qwen2.5-VL / Gemini for VQA",status:"PLANNED",tech:"Configurable LLM adapter"}]},features:[{name:"Query Intelligence (NLP → structured plan)",status:"LIVE",category:"Intelligence"},{name:"Dataset profiling + Data Health score",status:"LIVE",category:"Intelligence"},{name:"NDVI computation (pixel-level)",status:"LIVE",category:"Analysis"},{name:"Change detection (pixel difference)",status:"LIVE",category:"Analysis"},{name:"NDWI (water detection)",status:"LIVE",category:"Analysis"},{name:"Evidence Score (checklist-based)",status:"LIVE",category:"Evidence"},{name:"Uncertainty Panel (KNOWN/INFERRED/CANNOT)",status:"LIVE",category:"Evidence"},{name:'Answer Trace ("Why did SatQuery say this?")',status:"LIVE",category:"Evidence"},{name:"Audit Trail",status:"LIVE",category:"Evidence"},{name:"Interactive map (Leaflet + dark tiles)",status:"LIVE",category:"Geospatial"},{name:"AOI Drawing (rectangle, polygon, circle)",status:"LIVE",category:"Geospatial"},{name:"Map Copilot (click region → ask)",status:"LIVE",category:"Geospatial"},{name:"Natural language map commands",status:"LIVE",category:"Geospatial"},{name:"Agent Plan visualization",status:"LIVE",category:"Intelligence"},{name:"Explainable tool selection",status:"LIVE",category:"Intelligence"},{name:"Query suggestions (band-aware)",status:"LIVE",category:"Intelligence"},{name:"Failure detection + educational errors",status:"LIVE",category:"Reliability"},{name:"Alternative analysis suggestions",status:"LIVE",category:"Reliability"},{name:"Simple / Expert mode toggle",status:"LIVE",category:"UX"},{name:"Multilingual (EN / HI / GU)",status:"LIVE",category:"UX"},{name:"Voice query (Web Speech API)",status:"LIVE",category:"UX"},{name:"Analysis history (localStorage)",status:"LIVE",category:"UX"},{name:"Smart HTML report download",status:"LIVE",category:"Output"},{name:"SIH Demo Mode (guided walkthrough)",status:"LIVE",category:"Demo"},{name:"Judge Mode",status:"LIVE",category:"Demo"},{name:"Architecture Visualizer",status:"LIVE",category:"Demo"},{name:"System Health Center",status:"LIVE",category:"Demo"},{name:"Data Sources Explorer",status:"LIVE",category:"Demo"},{name:"Sensor Recommendation Engine",status:"LIVE",category:"Intelligence"},{name:"Before/After Time Travel slider",status:"DEMO",category:"Geospatial"},{name:"Cross-layer correlation",status:"DEMO",category:"Analysis"},{name:"Challenge Result button",status:"DEMO",category:"Evidence"},{name:"Live satellite data ingestion (Copernicus)",status:"PLANNED",category:"Data"},{name:"Backend Python API (Rasterio/GDAL)",status:"PLANNED",category:"Backend"},{name:"Real-time monitoring + alerts",status:"PLANNED",category:"Monitoring"},{name:"LLM-powered VQA (Qwen2.5-VL)",status:"PLANNED",category:"AI"},{name:"SAR analysis (Sentinel-1)",status:"PLANNED",category:"Analysis"},{name:"PostGIS database persistence",status:"PLANNED",category:"Backend"}],evidence:{points:["Query parser converts natural language to structured JSON plan — not just string forwarding","Analysis fails gracefully with educational error messages and alternatives","Evidence score is checklist-based — never invents confidence percentages","Uncertainty panel distinguishes KNOWN, INFERRED, and CANNOT DETERMINE","NDVI computed deterministically from actual pixel data (when real GeoTIFF provided)",'Tool selection is explained to the user with a visible "WHY?" rationale']}},ta=[{component:"Frontend (SPA)",status:"ok",statusLabel:"LIVE",detail:"HTML + Vanilla JS + CSS"},{component:"Query Intelligence",status:"ok",statusLabel:"LIVE",detail:"Deterministic NLP engine"},{component:"Dataset Intelligence",status:"ok",statusLabel:"LIVE",detail:"geotiff.js in-browser"},{component:"Analysis Engine",status:"ok",statusLabel:"LIVE",detail:"NDVI, NDWI, Change detection"},{component:"Agent Orchestrator",status:"ok",statusLabel:"LIVE",detail:"Multi-tool routing"},{component:"Evidence Engine",status:"ok",statusLabel:"LIVE",detail:"Checklist-based scoring"},{component:"Map / Geospatial",status:"ok",statusLabel:"LIVE",detail:"Leaflet.js + Leaflet.draw"},{component:"Demo Data",status:"demo",statusLabel:"DEMO",detail:"Ahmedabad simulated dataset"},{component:"Voice Query",status:"ok",statusLabel:"LIVE",detail:"Web Speech API (browser)"},{component:"Multilingual",status:"ok",statusLabel:"LIVE",detail:"EN / HI / GU"},{component:"Backend API",status:"planned",statusLabel:"PLANNED",detail:"FastAPI + Rasterio (not connected)"},{component:"Live Satellite Feed",status:"planned",statusLabel:"PLANNED",detail:"Copernicus API (not connected)"},{component:"Database (PostGIS)",status:"planned",statusLabel:"PLANNED",detail:"Not deployed"},{component:"LLM Integration",status:"planned",statusLabel:"PLANNED",detail:"Qwen2.5-VL (configurable adapter)"}],aa=[{id:"bhuvan",name:"Bhuvan / NRSC",flag:"🇮🇳",sensorType:"Optical + SAR",description:"Indian Space Research Organisation national geospatial platform providing ResourceSat, Cartosat, and RISAT data for Indian territory.",use:"High-resolution Indian imagery, agriculture monitoring, disaster response",satqueryRole:"Primary data source for Indian territory analyses (PLANNED)",status:"PLANNED",color:"var(--cyan-500)",specs:["ResourceSat-2/2A: 5.8m / 24m","Cartosat: 0.5m (panchromatic)","RISAT-1: C-band SAR"]},{id:"sentinel2",name:"Sentinel-2",flag:"🇪🇺",sensorType:"Optical Multispectral",description:"ESA Copernicus mission providing 13-band multispectral imagery at 10–60m resolution. Free and open access globally.",use:"Vegetation monitoring (NDVI), urban mapping, water bodies, agriculture",satqueryRole:"Primary spectral analysis source — NDVI, NDWI, change detection",status:"DEMO",color:"var(--green-500)",specs:["13 spectral bands","10m resolution (RGB + NIR)","5-day revisit time","Free Copernicus access"]},{id:"sentinel1",name:"Sentinel-1",flag:"🇪🇺",sensorType:"SAR (C-band)",description:"ESA synthetic aperture radar mission. Penetrates cloud cover — essential for flood monitoring, disaster response, and all-weather observation.",use:"Flood monitoring, surface deformation, forest change, maritime",satqueryRole:"Flood analysis and cloud-covered optical fallback (PLANNED)",status:"PLANNED",color:"var(--blue-500)",specs:["C-band SAR","VV / VH polarization","10m resolution","All-weather, day/night"]},{id:"landsat",name:"Landsat 8/9",flag:"🇺🇸",sensorType:"Optical Multispectral",description:"NASA/USGS archive providing consistent 30m multispectral imagery since 1972. Unparalleled temporal depth for long-term change analysis.",use:"Long-term change detection, thermal analysis, agricultural monitoring",satqueryRole:"Long-term temporal analysis and archive comparison (PLANNED)",status:"PLANNED",color:"var(--amber-500)",specs:["11 spectral bands (OLI-2 + TIRS-2)","30m resolution","16-day revisit","Free USGS access"]}],na=[{id:"qwen25vl",name:"Qwen2.5-VL",type:"Vision-Language Model",icon:"🤖",description:"Large vision-language model capable of detailed image understanding and question answering.",role:"Visual Question Answering on satellite imagery — interpreting scene content, describing land cover, answering natural language queries.",status:"PLANNED",note:"Not fine-tuned on satellite imagery in this prototype. Adapter architecture is in place."},{id:"bigearthnet",name:"BigEarthNet",type:"Training Dataset",icon:"📊",description:"Large-scale Sentinel-2 benchmark dataset with multi-label scene classification annotations.",role:"Reference for land cover classification training. Would be used to fine-tune classification models.",status:"PLANNED (research reference)",note:"Not used for actual computation in this prototype."},{id:"rsvqa",name:"RSVQA / VRSBench",type:"VQA Dataset",icon:"🔬",description:"Remote Sensing Visual Question Answering datasets for evaluating geospatial VQA models.",role:"Evaluation benchmark for the VQA pipeline. Enables measurement of answer quality on satellite imagery questions.",status:"PLANNED (research reference)"},{id:"sam",name:"SAM (Segment Anything)",type:"Segmentation Model",icon:"✂️",description:"Meta AI foundational segmentation model, adapted for remote sensing applications.",role:"Object segmentation and region delineation in satellite imagery.",status:"PLANNED"},{id:"rasterio",name:"Rasterio + GDAL",type:"Geospatial Processing Library",icon:"⚙️",description:"Python libraries for reading and processing raster geospatial data.",role:"Backend raster processing — band extraction, CRS reprojection, resampling, spectral index computation at scale.",status:"PLANNED (backend)"},{id:"langgraph",name:"LangGraph",type:"Agent Framework",icon:"🕸️",description:"Graph-based LLM agent orchestration framework enabling multi-tool reasoning pipelines.",role:"Future agent architecture for complex multi-step geospatial reasoning with LLM integration.",status:"PLANNED"},{id:"postgis",name:"PostGIS",type:"Geospatial Database",icon:"🗄️",description:"Spatial extension for PostgreSQL enabling storage and querying of geospatial data.",role:"Persistent storage for AOIs, analysis results, dataset metadata, and query history.",status:"PLANNED"}];let xe=!1;async function Ie(){if(xe)return!0;const e=q("gee_client_id");return e?window.ee?new Promise(t=>{window.ee.data.authenticateViaOauth(e,()=>{window.ee.initialize(null,null,()=>{xe=!0,y("Connected to Google Earth Engine 🌍","success"),t(!0)},a=>{console.error("GEE Init Error:",a),y("Failed to initialize Earth Engine. See console.","error"),t(!1)})},a=>{console.error("GEE Auth Error:",a),y("Google Earth Engine authentication failed.","error"),t(!1)},null,()=>{window.ee.data.authenticateViaPopup(()=>t(!0),()=>t(!1))})}):(y("GEE Library not loaded. Check internet connection.","error"),!1):(y("GEE Client ID missing. Add it in Settings to enable Live Data.","warning",6e3),!1)}const d={currentView:"home",currentPlan:null,currentProfile:null,currentAnalysisResult:null,currentEvidenceScore:null,currentUncertainty:null,currentAuditTrail:null,currentAnswerTrace:null,currentToolPlan:null,currentAgentNodes:null,isAnalyzing:!1,isDemoMode:!1,isExpertMode:!1,mapInitialized:!1,aoiActive:!1,activeLayers:{ndvi:!1,change:!1,water:!1,buildup:!1},timelineYear:2023};function R(e){var i;A(".nav-item").forEach(s=>s.classList.remove("active")),(i=u(`.nav-item[data-view="${e}"]`))==null||i.classList.add("active"),A(".view").forEach(s=>s.classList.remove("active"));const t=u(`#${e}-view`);t&&(t.classList.add("active"),t.classList.add("view-enter"),setTimeout(()=>t.classList.remove("view-enter"),400)),d.currentView=e,e==="workspace"&&!d.mapInitialized?setTimeout(()=>{ia(),d.mapInitialized=!0},100):e==="workspace"&&ce();const a={home:"Dashboard",workspace:"Analysis Workspace",history:"My Analyses",datasources:"Data Sources",research:"Research Lab",health:"System Health",judge:"Judge Mode",architecture:"Architecture",compare:"Compare Locations",monitoring:"Monitor Area"},n=u("#topbar-title");n&&(n.textContent=a[e]||"SatQuery AI")}function ia(){Pe("leaflet-map"),ze(e=>{u("#query-input").value=e.query,k(e.query)})}async function k(e){var f,b,h,c;if(!e.trim()||d.isAnalyzing)return;d.isAnalyzing=!0,R("workspace"),await H(150),ce();const t=et(e,d.currentProfile);d.currentPlan=t,sa(t);const a=St(t,d.currentProfile);d.currentToolPlan=a;const n=Dt(e,a);d.currentAgentNodes=n,la(n),oa(t),(f=t.location)!=null&&f.center&&Ge(t.location),await wt(t,d.currentProfile,(E,w,m)=>{ra(E,w),E<n.length&&ca(E,w==="active"?"active":w==="completed"?"completed":"blocked")});let i=null;const s=t.validation.blockers.length>0;s||((b=d.currentProfile)!=null&&b.pixelData?t.operations.includes("NDVI")&&(i=await bt(d.currentProfile.pixelData,d.currentProfile.width,d.currentProfile.height)):t.intent==="vegetation_change"||t.intent==="vegetation_current"?i={type:"ndvi",stats:ye("ahmedabad_2023"),formula:"(NIR - Red) / (NIR + Red)",isDemo:!0}:t.intent==="change_detection"||t.intent==="urban_expansion"?i={...he(),isDemo:!0}:t.intent==="combined_urban_vegetation"&&(i={type:"combined",isDemo:!0,ndvi:ye("ahmedabad_change"),change:he()}),await H(400),(t.operations.includes("NDVI")||t.intent.includes("vegetation"))&&(Me(),d.activeLayers.ndvi=!0,Ee()),(t.operations.includes("change_detection")||t.intent.includes("change")||t.intent==="urban_expansion")&&(Oe(),d.activeLayers.change=!0,Ee())),d.currentAnalysisResult=i;const r=xt(t,d.currentProfile,i),o=It(t,i),l=Et(t,d.currentProfile,i),g=Lt(t,d.currentProfile,i,r);d.currentEvidenceScore=r,d.currentUncertainty=o,d.currentAuditTrail=l,d.currentAnswerTrace=g,da(t,i,r,o,g,l,a),Ft({query:e,intent:t.intent,intentLabel:t.intentLabel,location:t.location,dataset:((h=d.currentProfile)==null?void 0:h.filename)||"Demo",analysisType:t.operations.join(", "),evidenceVerdict:r.verdict,status:s?"blocked":"completed",icon:t.intentIcon}),W(B(d.currentProfile)),d.isAnalyzing=!1,y(s?`Analysis blocked — ${(c=t.validation.blockers[0])==null?void 0:c.message}`:`Analysis complete: ${r.verdict}`,s?"warning":"success")}function sa(e){var n,i,s,r;const t=u("#query-plan-container");if(!t)return;t.innerHTML="";const a=document.createElement("div");a.className="query-plan-card",a.innerHTML=`
    <div class="query-plan-header">
      <div class="query-plan-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        ${_("understood_query")}
      </div>
      <button class="btn btn-ghost btn-sm" id="edit-plan-btn" aria-label="Edit analysis plan">✏️ Edit</button>
    </div>
    <div class="query-plan-rows">
      ${P("Intent",`${e.intentIcon} ${e.intentLabel}`)}
      ${P("Location",((n=e.location)==null?void 0:n.name)||"Not specified")}
      ${P("Analysis",((i=e.operations)==null?void 0:i.join(" → "))||"N/A")}
      ${P("Required data",((s=e.requiredBands)==null?void 0:s.join(" + "))||"N/A")}
      ${P("Temporal",e.timeRange||"Not specified")}
      ${P("Output",((r=e.output)==null?void 0:r.join(", "))||"N/A")}
      ${P("Sensor",e.sensor||"Not specified")}
    </div>
    ${e.validation.blockers.length>0?`
      <div style="margin-top:var(--space-3);background:hsla(350,80%,42%,0.1);border:1px solid hsla(350,80%,42%,0.3);border-radius:var(--radius-md);padding:var(--space-3)">
        <div style="font-size:var(--text-xs);font-weight:700;color:var(--rose-300);margin-bottom:var(--space-2)">⚠ ANALYSIS BLOCKED</div>
        ${e.validation.blockers.map(o=>`
          <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-1)">• ${o.message}</div>
          ${o.suggestion?`<div style="font-size:var(--text-xs);color:var(--cyan-300)">→ ${o.suggestion}</div>`:""}
        `).join("")}
      </div>
    `:""}
    ${e.validation.warnings.length>0?`
      <div style="margin-top:var(--space-3);background:hsla(38,95%,58%,0.08);border:1px solid hsla(38,95%,58%,0.25);border-radius:var(--radius-md);padding:var(--space-3)">
        ${e.validation.warnings.map(o=>`<div style="font-size:var(--text-xs);color:var(--amber-300)">⚠ ${o.message}</div>`).join("")}
      </div>
    `:""}
  `,t.appendChild(a),ne(a,"animate-slide-up")}function P(e,t){return`<div class="query-plan-row"><div class="plan-row-label">${e}</div><div class="plan-row-value">${t}</div></div>`}function oa(e){const t=u("#analysis-steps-container");if(!t)return;t.innerHTML="";const a=document.createElement("div");a.className="analysis-steps",a.id="steps-list",(e.steps||[]).forEach((n,i)=>{const s=document.createElement("div");s.className="analysis-step",s.id=`step-${i}`,s.innerHTML=`
      <div class="step-indicator" aria-label="Step ${n.id}">${n.id}</div>
      <div class="step-body">
        <div class="step-title" onclick="this.nextElementSibling.classList.toggle('open')">
          ${n.title}
          <span style="color:var(--text-muted);font-size:12px">▾</span>
        </div>
        <div class="step-detail">${n.detail||""}</div>
      </div>
    `,a.appendChild(s)}),t.appendChild(a)}function ra(e,t){const a=u(`#step-${e}`);a&&(a.classList.remove("active","completed","blocked"),t==="active"?a.classList.add("active"):t==="completed"?(a.classList.add("completed"),a.querySelector(".step-indicator").textContent="✓"):t==="blocked"&&(a.querySelector(".step-indicator").textContent="✕",a.querySelector(".step-indicator").style.color="var(--rose-300)"))}function la(e){const t=u("#agent-plan-container");if(!t)return;t.innerHTML="";const a=document.createElement("div");a.className="panel-title",a.innerHTML="<span>🤖</span> Agent Plan",t.appendChild(a);const n=document.createElement("div");n.className="evidence-graph",n.id="agent-graph",e.forEach((i,s)=>{if(s>0){const o=document.createElement("div");o.className="graph-arrow",o.style.animationDelay=`${s*100}ms`,n.appendChild(o)}const r=document.createElement("div");r.className="graph-node",r.id=`agent-node-${s}`,r.style.animationDelay=`${s*100}ms`,r.setAttribute("role","button"),r.setAttribute("tabindex","0"),r.setAttribute("aria-label",`${i.label}: ${i.value}`),r.innerHTML=`
      <div class="graph-node-label">${i.icon||""} ${i.label}</div>
      <div class="graph-node-value">${i.value}</div>
      ${i.statusBadge?`<span class="badge badge-${i.statusBadge.toLowerCase()}" style="margin-top:4px">${i.statusBadge}</span>`:""}
      ${i.degraded?'<div style="font-size:var(--text-xs);color:var(--amber-300);margin-top:4px">⚠ Degraded mode</div>':""}
    `,i.type==="tool"&&(r.onclick=()=>pa(i)),n.appendChild(r)}),t.appendChild(n)}function ca(e,t){const a=u(`#agent-node-${e}`);a&&(a.classList.remove("active-node"),t==="active"?a.classList.add("active-node"):t==="completed"&&(a.style.borderColor="var(--green-400)",a.style.boxShadow="var(--glow-green)"))}function da(e,t,a,n,i,s,r){var w;const o=u("#result-panel");if(!o)return;o.innerHTML="";const l=document.createElement("div");if(l.className="workspace-panel",l.innerHTML=`
    <div class="panel-header">
      <div class="panel-title"><span>🔍</span> ${_("evidence_quality")}</div>
    </div>
    <div class="evidence-score">
      <div class="evidence-verdict ${a.verdictClass}">
        ${a.verdictIcon} ${a.verdict}
      </div>
      <div class="evidence-checklist">
        ${a.checks.map(m=>`
          <div class="evidence-item ${m.pass?"pass":m.warn?"warn":"fail"}">
            <span>${m.pass?"✓":m.warn?"⚠":"✕"}</span>
            <span>${m.label}${m.detail?` <span style="color:var(--text-muted);font-size:var(--text-xs)">— ${m.detail}</span>`:""}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `,o.appendChild(l),t&&!e.validation.blockers.length){const m=document.createElement("div");m.className="workspace-panel",m.innerHTML=ua(t,e),o.appendChild(m)}const g=document.createElement("div");if(g.className="workspace-panel",g.innerHTML=`
    <div class="panel-header">
      <div class="panel-title">Uncertainty Assessment</div>
    </div>
    <div class="uncertainty-panel">
      <div class="uncertainty-col">
        <div class="uncertainty-label known">What we know</div>
        ${n.known.map(m=>`<div class="uncertainty-text" style="margin-bottom:var(--space-1)">• ${m}</div>`).join("")}
      </div>
      <div class="uncertainty-col">
        <div class="uncertainty-label inferred">What we infer</div>
        ${n.inferred.map(m=>`<div class="uncertainty-text" style="margin-bottom:var(--space-1)">• ${m}</div>`).join("")}
      </div>
      <div class="uncertainty-col">
        <div class="uncertainty-label unknown">Cannot determine</div>
        ${n.cannotDetermine.map(m=>`<div class="uncertainty-text" style="margin-bottom:var(--space-1)">• ${m}</div>`).join("")}
      </div>
    </div>
  `,o.appendChild(g),((w=r==null?void 0:r.tools)==null?void 0:w.length)>0){const m=document.createElement("div");m.className="workspace-panel",m.innerHTML=`
      <div class="panel-header">
        <div class="panel-title">🛠️ Selected Tool</div>
      </div>
      ${r.tools.map(N=>{const I=$t(N,e);return`
          <div style="background:hsla(265,65%,40%,0.08);border:1px solid hsla(265,65%,40%,0.2);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-2)">
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--purple-300);margin-bottom:var(--space-1)">${N.icon} ${N.name}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-1)">WHY?</div>
            <div style="font-size:var(--text-xs);color:var(--text-secondary);font-style:italic">"${I.reason}"</div>
            ${I.formula?`<div class="formula-box" style="margin-top:var(--space-2)">${I.formula}</div>`:""}
            ${I.note?`<div style="font-size:var(--text-xs);color:var(--amber-300);margin-top:var(--space-1)">ℹ ${I.note}</div>`:""}
          </div>
        `}).join("")}
    `,o.appendChild(m)}const f=document.createElement("div");f.className="workspace-panel";const b=`trace-${Date.now()}`;f.innerHTML=`
    <div class="panel-header">
      <div class="panel-title">❓ ${_("answer_trace")}</div>
      <button class="btn btn-ghost btn-sm" onclick="$('#${b}').classList.toggle('open')">Show ▾</button>
    </div>
    <div id="${b}" class="answer-trace" style="display:none">
      ${i.map(m=>`
        <div class="trace-row">
          <div class="trace-label">${m.label}</div>
          <div class="trace-value">${m.value}</div>
        </div>
      `).join("")}
    </div>
    <script>
      document.getElementById('${b}').previousElementSibling.querySelector('button').onclick = function() {
        const el = document.getElementById('${b}');
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
        this.textContent = el.style.display === 'none' ? 'Show ▾' : 'Hide ▴';
      }
    <\/script>
  `,o.appendChild(f);const h=document.createElement("div");if(h.className="workspace-panel",h.innerHTML=`
    <div class="panel-header">
      <div class="panel-title">⚡ ${_("challenge")}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:var(--space-2)">
      <button class="btn btn-secondary btn-sm" onclick="app.showEvidenceModal()">Show Evidence</button>
      <button class="btn btn-secondary btn-sm" onclick="app.rerunAnalysis()">Recalculate</button>
      <button class="btn btn-secondary btn-sm" onclick="app.changeRegion()">Change Region</button>
      <button class="btn btn-secondary btn-sm" onclick="app.inspectInput()">Inspect Input</button>
    </div>
  `,o.appendChild(h),e.validation.blockers.length>0){const m=document.createElement("div");m.className="workspace-panel";const N=At(e.validation.blockers[0]);m.innerHTML=`
      <div class="panel-header">
        <div class="panel-title">💡 ${_("alternatives")}</div>
      </div>
      ${N.map(I=>`
        <div style="background:var(--bg-panel);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-2);cursor:pointer"
             onclick="$('#query-input').value='${I.label}'" class="suggestion-chip" style="text-align:left">
          <div style="font-size:var(--text-sm);font-weight:600;color:var(--cyan-300)">→ ${I.label}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">${I.detail}</div>
        </div>
      `).join("")}
    `,o.appendChild(m)}const c=Nt(e.intent),E=document.createElement("div");E.className="workspace-panel",E.innerHTML=`
    <div class="panel-header">
      <div class="panel-title">📡 ${_("sensor_recommendation")}</div>
    </div>
    <div>
      <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-1)">${c.sensor}</div>
      <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-2)">${c.reason}</div>
      <div style="font-size:var(--text-xs);color:var(--text-muted)">Examples: ${c.examples.join(", ")}</div>
      ${c.note?'<div class="badge badge-planned" style="margin-top:var(--space-2)">PLANNED integration</div>':""}
    </div>
  `,o.appendChild(E),ie(o.children,"animate-slide-up",0,60)}function ua(e,t){if(!e)return"";const{stats:a,type:n}=e,i=e.isDemo?'<span class="badge badge-demo" style="margin-left:var(--space-2)">DEMO</span>':"";return n==="ndvi"||t.intent.includes("vegetation")?`
      <div class="panel-header">
        <div class="panel-title">📊 NDVI Statistics ${i}</div>
      </div>
      <div class="formula-box" style="margin-bottom:var(--space-3)">NDVI = (NIR - Red) / (NIR + Red)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-bottom:var(--space-3)">
        <div class="stat-card"><div class="stat-label">Mean NDVI</div><div class="stat-value" style="font-size:var(--text-2xl);color:var(--green-300)">${a.mean}</div></div>
        <div class="stat-card"><div class="stat-label">Max NDVI</div><div class="stat-value" style="font-size:var(--text-2xl);color:var(--green-400)">${a.max}</div></div>
        <div class="stat-card"><div class="stat-label">Vegetation</div><div class="stat-value stat-change-positive" style="font-size:var(--text-2xl)">${a.vegetationPct}%</div></div>
        <div class="stat-card"><div class="stat-label">Water/Urban</div><div class="stat-value stat-change-negative" style="font-size:var(--text-2xl)">${a.waterPct||"3.8"}%</div></div>
      </div>
      <div class="legend-bar ndvi-legend"></div>
      <div class="legend-labels"><span>−1 (Water)</span><span>0 (Bare)</span><span>+1 (Vegetation)</span></div>
    `:n==="change"?`
      <div class="panel-header">
        <div class="panel-title">📊 Change Detection ${i}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-2);margin-bottom:var(--space-3)">
        <div class="stat-card"><div class="stat-label">Increased</div><div class="stat-value stat-change-positive" style="font-size:var(--text-2xl)">${a.increasedPct}%</div></div>
        <div class="stat-card"><div class="stat-label">Decreased</div><div class="stat-value stat-change-negative" style="font-size:var(--text-2xl)">${a.decreasedPct}%</div></div>
        <div class="stat-card"><div class="stat-label">Unchanged</div><div class="stat-value" style="font-size:var(--text-2xl)">${a.unchangedPct}%</div></div>
      </div>
      <div class="legend-bar change-legend"></div>
      <div class="legend-labels"><span>Decrease</span><span>No change</span><span>Increase</span></div>
      <div style="margin-top:var(--space-3);padding:var(--space-3);background:hsla(38,95%,58%,0.08);border:1px solid hsla(38,95%,58%,0.2);border-radius:var(--radius-md);font-size:var(--text-xs);color:var(--amber-300)">
        ⚠ Spatial overlap detected — this does not independently establish a causal relationship.
      </div>
    `:""}async function Le(e){if(!e)return;y(`Loading ${e.name}...`,"info",2e3);const t=await Te(e);d.currentProfile=t,pe(t),W(B(t)),y(`Dataset loaded: ${t.health}% health score`,"success")}window.removeDataset=()=>{d.currentProfile=null;const e=u("#dataset-profile-container");e&&(e.innerHTML=""),W(B(null)),y("Dataset removed","info")};function pe(e){const t=u("#dataset-profile-container");if(!t)return;const a=e.health,n=a>=80?"var(--green-400)":a>=50?"var(--amber-400)":"var(--rose-400)";t.innerHTML=`
    <div class="dataset-profile">
      <div class="dataset-profile-header">
        <div style="font-size:var(--text-xs);font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--cyan-300);margin-bottom:var(--space-2);display:flex;justify-content:space-between;">
          <span>📂 Dataset Profile ${e.isDemo?'<span class="badge badge-demo">DEMO</span>':""}</span>
          <button class="btn btn-ghost btn-sm" onclick="removeDataset()" aria-label="Remove dataset">✕ Remove</button>
        </div>
        <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-1)">${e.filename}</div>
        <div style="font-size:var(--text-xs);color:var(--text-muted)">${e.sensor} · ${e.filesize}</div>

        <div style="margin-top:var(--space-3)">
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-1)">
            <span style="font-size:var(--text-xs);color:var(--text-muted)">DATA HEALTH</span>
            <span style="font-size:var(--text-xs);font-family:var(--font-mono);color:${n};font-weight:600">${a}%</span>
          </div>
          <div class="data-health-bar">
            <div class="data-health-fill" style="width:${a}%;background:linear-gradient(to right, ${n}, ${n}cc)"></div>
          </div>
        </div>
      </div>

      <div class="dataset-meta-grid">
        ${[["Dimensions",e.width?`${e.width} × ${e.height}`:"N/A"],["Bands",`${e.bands} band(s)`],["CRS",e.crs||"Unknown"],["Resolution",e.resolution||"N/A"],["NoData",e.nodata?`${e.nodataValue}`:"None"],["Date",e.acquisitionDate||"Unknown"]].map(([i,s])=>`
          <div class="dataset-meta-cell">
            <div class="dataset-meta-label">${i}</div>
            <div class="dataset-meta-value">${s}</div>
          </div>
        `).join("")}
      </div>

      <div style="padding:var(--space-3) var(--space-4)">
        ${e.healthChecks.map(i=>`
          <div class="evidence-item ${i.pass?"pass":"fail"}" style="font-size:var(--text-xs)">
            <span>${i.pass?"✓":"✕"}</span>
            <span>${i.label} ${i.detail?`— <span style="color:var(--text-muted)">${i.detail}</span>`:""}</span>
          </div>
        `).join("")}
      </div>

      ${e.error?`
        <div style="padding:var(--space-3);background:hsla(350,80%,42%,0.1);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--rose-300)">
          ⚠ ${e.error}
        </div>
      `:""}
    </div>
  `,ne(t.firstChild,"animate-slide-up")}function W(e){const t=u("#suggestions-container");t&&(t.innerHTML=`<div class="suggestion-grid">
    ${e.map(a=>`
      <div class="suggestion-chip ${a.available===!1?"disabled":""}"
           ${a.available!==!1?`onclick="$('#query-input').value='${a.query.replace(/'/g,"\\'")}'; $('#query-input').focus()"`:""}
           title="${a.available===!1?a.unavailableReason:a.query}"
           role="${a.available!==!1?"button":"presentation"}"
           tabindex="${a.available!==!1?"0":"-1"}"
           ${a.available!==!1?`onkeydown="if(event.key==='Enter') this.click()"`:""}>
        <div class="chip-icon">${a.icon}</div>
        <div class="chip-category">${a.category}</div>
        <div class="chip-query">${a.available===!1?a.unavailableReason:a.query}</div>
      </div>
    `).join("")}
  </div>`)}function Ee(){A(".layer-toggle[data-layer]").forEach(e=>{var n;const t=e.dataset.layer,a=d.activeLayers[t];e.classList.toggle("active",!!a),(n=e.querySelector(".toggle-switch"))==null||n.classList.toggle("on",!!a)})}function pa(e){var a,n;const t=u("#tool-modal-backdrop");t&&(t.querySelector("#tool-modal-content").innerHTML=`
    <div style="margin-bottom:var(--space-4)">
      <div class="label-mono" style="margin-bottom:var(--space-1)">Specialist Tool</div>
      <h3>${e.icon} ${e.value}</h3>
    </div>
    <div class="trace-row" style="border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
      <div class="trace-label">Formula</div>
      <div class="trace-value font-mono">${e.formula||"N/A"}</div>
    </div>
    <div class="answer-trace" style="margin-top:var(--space-3)">
      ${[["Status",`<span class="badge badge-${(e.statusBadge||"LIVE").toLowerCase()}">${e.statusBadge||"LIVE"}</span>`],["Input bands",((a=e.inputs)==null?void 0:a.join(", "))||"N/A"],["Output",((n=e.outputs)==null?void 0:n.join(", "))||"N/A"],["Why selected",e.detail||"N/A"]].map(([i,s])=>`<div class="trace-row"><div class="trace-label">${i}</div><div class="trace-value">${s}</div></div>`).join("")}
    </div>
  `,t.classList.add("open"))}window.app={rerunAnalysis:()=>{d.currentPlan&&k(d.currentPlan.originalQuery)},changeRegion:()=>{le(),y("Draw a new AOI on the map","info")},showEvidenceModal:()=>{const e=u("#evidence-modal-backdrop");!e||!d.currentEvidenceScore||(e.querySelector("#evidence-modal-content").innerHTML=`
      <h3 style="margin-bottom:var(--space-4)">Evidence Details</h3>
      ${(d.currentEvidenceScore.checks||[]).map(t=>`
        <div class="trace-row"><div class="trace-label ${t.pass?"status-ok":t.warn?"status-warn":"status-error"}">${t.pass?"✓":t.warn?"⚠":"✕"} ${t.label}</div><div class="trace-value">${t.detail||""}</div></div>
      `).join("")}
    `,e.classList.add("open"))},inspectInput:()=>{d.currentProfile?(R("workspace"),y("Dataset profile shown in left panel","info")):y("No dataset loaded yet","warning")},generateReport:()=>{var t;const e=Jt({query:(t=d.currentPlan)==null?void 0:t.originalQuery,plan:d.currentPlan,profile:d.currentProfile,evidenceScore:d.currentEvidenceScore,uncertainty:d.currentUncertainty,auditTrail:d.currentAuditTrail,timestamp:$()});Yt(e,`satquery-report-${Date.now()}.html`),y("Report downloaded successfully","success")}};function Ne(e){const t=lt(e);Be(t)?y(`Command: ${e}`,"info",2e3):k(e)}function ma(){var N,I,M,O,C,me,ve,ge;jt(),window.navigateTo=R;const e=u("#gee-client-id"),t=u("#gemini-api-key"),a=u("#copernicus-api-key"),n=u("#bhuvan-api-key");e&&(e.value=q("gee_client_id","")),t&&(t.value=q("gemini_api_key","")),a&&(a.value=q("copernicus_api_key","")),n&&(n.value=q("bhuvan_api_key","")),(N=u("#save-settings-btn"))==null||N.addEventListener("click",()=>{var p;e&&j("gee_client_id",e.value.trim()),t&&j("gemini_api_key",t.value.trim()),a&&j("copernicus_api_key",a.value.trim()),n&&j("bhuvan_api_key",n.value.trim()),y("Settings and API Keys saved successfully","success"),(p=document.getElementById("settings-modal-backdrop"))==null||p.classList.remove("open"),e&&e.value.trim()!==""&&Ie()}),e&&e.value.trim()!==""&&setTimeout(Ie,1e3),A(".nav-item[data-view]").forEach(p=>{p.addEventListener("click",()=>R(p.dataset.view)),p.addEventListener("keydown",x=>{(x.key==="Enter"||x.key===" ")&&(x.preventDefault(),R(p.dataset.view))})});const i=u("#query-input"),s=u("#query-submit");s==null||s.addEventListener("click",()=>k(i.value)),i==null||i.addEventListener("keydown",p=>{p.key==="Enter"&&!p.shiftKey&&(p.preventDefault(),k(i.value))});const r=u("#global-search-input"),o=u("#global-search-btn");o==null||o.addEventListener("click",()=>{r.value&&k(r.value)}),r==null||r.addEventListener("keydown",p=>{p.key==="Enter"&&(p.preventDefault(),k(r.value))});const l=u("#nlp-command-input"),g=u("#nlp-command-submit");g==null||g.addEventListener("click",()=>Ne(l.value)),l==null||l.addEventListener("keydown",p=>{p.key==="Enter"&&(p.preventDefault(),Ne(l.value))});const f=u("#file-input");f==null||f.addEventListener("change",p=>Le(p.target.files[0]));const b=u("#drop-zone");b&&(b.addEventListener("dragover",p=>{p.preventDefault(),b.classList.add("dragging")}),b.addEventListener("dragleave",()=>b.classList.remove("dragging")),b.addEventListener("drop",p=>{p.preventDefault(),b.classList.remove("dragging"),Le(p.dataTransfer.files[0])}),b.addEventListener("click",()=>f==null?void 0:f.click()));const h=u("#voice-btn"),c=u("#voice-indicator");h==null||h.addEventListener("click",()=>{Ut()?(Wt(),c==null||c.classList.remove("active"),h.innerHTML="🎙️"):Gt(({transcript:x,isFinal:S})=>{i&&(i.value=x),S&&k(x)},x=>{y(x,"error"),c==null||c.classList.remove("active"),h.innerHTML="🎙️"},()=>{c==null||c.classList.remove("active"),h.innerHTML="🎙️"})&&(c==null||c.classList.add("active"),h.innerHTML="⏹️",y("Listening... speak your query","info",3e3))}),A(".lang-btn").forEach(p=>{p.addEventListener("click",()=>{Ue(p.dataset.lang),A(".lang-btn").forEach(x=>x.classList.remove("active")),p.classList.add("active"),y(`Language: ${p.textContent}`,"info",1500)})});const E=u("#mode-simple"),w=u("#mode-expert");E==null||E.addEventListener("click",()=>{d.isExpertMode=!1,E.classList.add("active"),w==null||w.classList.remove("active"),document.body.classList.remove("expert-mode")}),w==null||w.addEventListener("click",()=>{d.isExpertMode=!0,w.classList.add("active"),E==null||E.classList.remove("active"),document.body.classList.add("expert-mode")}),A(".draw-tool-btn").forEach(p=>{p.addEventListener("click",()=>{const x=p.dataset.drawType;A(".draw-tool-btn").forEach(S=>S.classList.remove("active")),p.classList.add("active"),d.mapInitialized?te(x,S=>{d.aoiActive=!0,Ae(S),A(".draw-tool-btn").forEach(J=>J.classList.remove("active")),y(`AOI drawn (${x}) — ${S.area?S.area+" km²":"area calculated"}`,"success")}):(R("workspace"),setTimeout(()=>te(x,S=>{d.aoiActive=!0,Ae(S),y(`AOI (${x}) — ${S.area?S.area+" km²":""}`,"success")}),500))})}),(I=u("#clear-aoi-btn"))==null||I.addEventListener("click",()=>{var p,x;le(),d.aoiActive=!1,(x=(p=u("#aoi-info-container"))==null?void 0:p.innerHTML)==null||x.call(p,""),y("AOI cleared","info",1500)}),va(),A(".layer-toggle[data-layer]").forEach(p=>{p.addEventListener("click",()=>{var S;const x=p.dataset.layer;d.activeLayers[x]=!d.activeLayers[x],p.classList.toggle("active",d.activeLayers[x]),(S=p.querySelector(".toggle-switch"))==null||S.classList.toggle("on",d.activeLayers[x]),d.mapInitialized&&U(()=>Promise.resolve().then(()=>K),void 0).then(J=>J.toggleLayer(x,d.activeLayers[x]))})}),(M=u("#sih-demo-btn"))==null||M.addEventListener("click",La),(O=u("#close-demo-btn"))==null||O.addEventListener("click",()=>{var p;(p=u("#demo-mode-overlay"))==null||p.classList.remove("active"),d.isDemoMode=!1}),(C=u("#load-demo-btn"))==null||C.addEventListener("click",async()=>{const p=se();d.currentProfile=p,pe(p),W(B(p)),y("Demo dataset loaded — Ahmedabad Sentinel-2 (Simulated)","success"),R("workspace")}),A(".modal-backdrop").forEach(p=>{p.addEventListener("click",x=>{x.target===p&&p.classList.remove("open")})}),(me=u("#home-start-query"))==null||me.addEventListener("click",()=>R("workspace")),(ve=u("#home-upload-btn"))==null||ve.addEventListener("click",()=>{R("workspace"),f==null||f.click()}),ga(),fa(),ba(),ya(),ha(),wa(),xa(),Ia(),W(B(null));const m=localStorage.getItem("satquery_lang");m&&((ge=u(`[data-lang="${m}"]`))==null||ge.classList.add("active")),R("home")}function Ae(e){var a,n,i,s;const t=u("#aoi-info-container");t&&(t.innerHTML=`
    <div class="aoi-info">
      <div style="font-size:var(--text-xs);font-weight:700;color:var(--cyan-300);margin-bottom:var(--space-2)">📍 SELECTED AOI</div>
      <div class="aoi-info-row"><span>Type</span><span>${e.type}</span></div>
      ${e.area?`<div class="aoi-info-row"><span>Area</span><span>${e.area} km²</span></div>`:""}
      ${e.center?`<div class="aoi-info-row"><span>Center</span><span>${(n=(a=e.center.lat)==null?void 0:a.toFixed)==null?void 0:n.call(a,4)}°N, ${(s=(i=e.center.lng)==null?void 0:i.toFixed)==null?void 0:s.call(i,4)}°E</span></div>`:""}
      <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3)">
        <button class="btn btn-primary btn-sm" onclick="handleQueryFromAOI()">Analyze Region</button>
        <button class="btn btn-secondary btn-sm" onclick="saveCurrentAOI()">Save AOI</button>
      </div>
    </div>
  `,ne(t.firstChild,"animate-slide-up"))}window.handleQueryFromAOI=()=>{k("What is happening in this selected region?")};window.saveCurrentAOI=()=>{const e=qe();if(!e)return;const t=prompt("Name this AOI:")||"My AOI";Qt(t,{type:e.type,area:e.area,center:e.center?{lat:e.center.lat,lng:e.center.lng}:null}),y(`AOI saved: "${t}"`,"success")};function va(){const e=u("#timeline-track"),t=u("#timeline-thumb"),a=u("#timeline-fill"),n=u("#timeline-label");if(!e||!t)return;const i=[2022,2023,2024,2025],s=[2022,2023];function r(o){d.timelineYear=o,n&&(n.textContent=o);const l=i.indexOf(o)/(i.length-1)*100;t&&(t.style.left=`${l}%`),a&&(a.style.width=`${l}%`),s.includes(o)?y(`Viewing: ${o} observation`,"info",1500):y(`No compatible observation for ${o}`,"warning",2e3)}e.addEventListener("click",o=>{const l=e.getBoundingClientRect(),g=(o.clientX-l.left)/l.width,f=Math.round(g*(i.length-1));r(i[Math.max(0,Math.min(f,i.length-1))])}),A(".timeline-year-btn").forEach(o=>{o.addEventListener("click",()=>r(parseInt(o.dataset.year)))}),r(2023)}function ga(){const e=u("#insight-card");if(e){const t=Xt;e.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-3)">
        <div>
          <div style="font-size:var(--text-xs);font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--cyan-300);margin-bottom:var(--space-1)">
            ${t.icon} Insight of the Day
          </div>
          ${t.tags.map(a=>`<span class="badge badge-demo">${a}</span>`).join(" ")}
        </div>
        <span class="badge badge-live">${t.evidenceVerdict}</span>
      </div>
      <div style="font-size:var(--text-base);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-2)">${t.title}</div>
      <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-3)">${t.body}</div>
      <div style="font-size:var(--text-xs);color:var(--text-muted);border-top:1px solid var(--border-subtle);padding-top:var(--space-2)">${t.disclaimer}</div>
    `}}function fa(){const e=u("#history-list");if(!e)return;function t(){const a=ue();if(a.length===0){e.innerHTML=`
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">No analyses yet</div>
          <div class="empty-state-sub">Run your first analysis in the workspace</div>
          <button class="btn btn-primary btn-sm" style="margin-top:var(--space-4)" onclick="app && navigateTo && navigateTo('workspace')">Open Workspace</button>
        </div>
      `;return}e.innerHTML=a.map(n=>`
      <div class="history-item" role="listitem">
        <div class="history-icon">${n.icon||"📊"}</div>
        <div class="history-meta">
          <div class="history-query">${n.query}</div>
          <div class="history-details">
            <span>${n.intentLabel||n.intent}</span>
            <span>·</span>
            <span>${n.location}</span>
            <span>·</span>
            <span>${Je(n.timestamp)}</span>
            <span>·</span>
            <span class="${n.evidenceVerdict==="SUPPORTED"?"status-live":"status-demo"}">${n.evidenceVerdict}</span>
          </div>
        </div>
        <button class="icon-btn" onclick="historyDelete('${n.id}')" aria-label="Delete analysis" title="Delete">✕</button>
      </div>
    `).join("")}t(),window.historyDelete=a=>{Ht(a),t(),y("Analysis removed","info",1500)},window.clearAllHistory=()=>{confirm("Clear all analysis history?")&&(localStorage.removeItem("satquery_history"),t())}}function ba(){const e=u("#datasources-content");e&&(e.innerHTML=`
    <div class="dashboard-grid">
      ${aa.map(t=>`
        <div class="datasource-card" style="--card-accent:${t.color}33">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-4)">
            <div style="font-size:28px">${t.flag}</div>
            <span class="badge badge-${t.status.toLowerCase()}">${t.status}</span>
          </div>
          <div style="font-size:var(--text-lg);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-1)">${t.name}</div>
          <div style="font-size:var(--text-xs);color:${t.color};font-weight:600;margin-bottom:var(--space-3);letter-spacing:0.04em">${t.sensorType}</div>
          <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--space-3);line-height:1.5">${t.description}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-2)">
            <strong style="color:var(--text-secondary)">Use:</strong> ${t.use}
          </div>
          <div style="font-size:var(--text-xs);color:var(--text-muted)">
            <strong style="color:var(--text-secondary)">SatQuery role:</strong> ${t.satqueryRole}
          </div>
          <div class="divider"></div>
          ${t.specs.map(a=>`<div style="font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-mono)">• ${a}</div>`).join("")}
        </div>
      `).join("")}
    </div>
  `,ie(A(".datasource-card",e),"animate-slide-up",0,80))}function ya(){const e=u("#research-content");e&&(e.innerHTML=`
    <div class="dashboard-grid">
      ${na.map(t=>`
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-3)">
            <div style="font-size:32px">${t.icon}</div>
            <span class="badge badge-${t.status.includes("LIVE")?"live":t.status.includes("DEMO")?"demo":"planned"}">${t.status.split("(")[0].trim()}</span>
          </div>
          <div style="font-size:var(--text-base);font-weight:700;color:var(--text-primary);margin-bottom:2px">${t.name}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-3)">${t.type}</div>
          <p style="font-size:var(--text-sm);margin-bottom:var(--space-3)">${t.description}</p>
          <div style="font-size:var(--text-xs);color:var(--text-secondary)"><strong>Role in SatQuery:</strong> ${t.role}</div>
          ${t.note?`<div style="font-size:var(--text-xs);color:var(--amber-300);margin-top:var(--space-2)">ℹ ${t.note}</div>`:""}
        </div>
      `).join("")}
    </div>
  `,ie(A(".card",e),"animate-slide-up",0,60))}function ha(){const e=u("#health-content");e&&(e.innerHTML=`
    <div style="margin-bottom:var(--space-6)">
      <div style="font-size:var(--text-xl);font-weight:700;margin-bottom:var(--space-2)">System Health Center</div>
      <p>All components clearly labeled as LIVE, DEMO, or PLANNED. No available integrations are misrepresented.</p>
    </div>
    <div class="health-grid">
      ${ta.map(t=>`
        <div class="health-item">
          <div class="health-dot ${t.status}"></div>
          <div style="flex:1">
            <div class="health-label">${t.component}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted)">${t.detail}</div>
          </div>
          <span class="badge badge-${t.statusLabel.toLowerCase()}">${t.statusLabel}</span>
        </div>
      `).join("")}
    </div>
  `)}function wa(){const e=u("#judge-content");if(!e)return;const t=ea,a=t.features.filter(s=>s.status==="LIVE"),n=t.features.filter(s=>s.status==="DEMO"),i=t.features.filter(s=>s.status==="PLANNED");e.innerHTML=`
    <div class="judge-section">
      <div class="judge-section-label">01 / PROBLEM</div>
      <h3 style="margin-bottom:var(--space-2)">${t.problem.title}</h3>
      <p>${t.problem.content}</p>
    </div>

    <div class="judge-section">
      <div class="judge-section-label">02 / SOLUTION</div>
      <h3 style="margin-bottom:var(--space-2)">${t.solution.title}</h3>
      <p>${t.solution.content}</p>
    </div>

    <div class="judge-section">
      <div class="judge-section-label">03 / ARCHITECTURE</div>
      <div style="display:flex;flex-direction:column;gap:var(--space-2)">
        ${t.architecture.layers.map(s=>`
          <div style="display:grid;grid-template-columns:200px 1fr 120px auto;gap:var(--space-4);align-items:center;padding:var(--space-3);background:var(--bg-panel);border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
            <div style="font-weight:600;font-size:var(--text-sm)">${s.label}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted)">${s.detail}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-mono)">${s.tech}</div>
            <span class="badge badge-${s.status.toLowerCase()}">${s.status}</span>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="judge-section">
      <div class="judge-section-label">04 / FEATURES</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-5)">
        <div>
          <div style="font-size:var(--text-sm);font-weight:700;color:var(--green-300);margin-bottom:var(--space-3)">🟢 LIVE (${a.length})</div>
          ${a.map(s=>`<div style="font-size:var(--text-xs);padding:4px 0;border-bottom:1px solid var(--border-subtle);color:var(--text-secondary)">✓ ${s.name}</div>`).join("")}
        </div>
        <div>
          <div style="font-size:var(--text-sm);font-weight:700;color:var(--amber-300);margin-bottom:var(--space-3)">🟡 DEMO (${n.length})</div>
          ${n.map(s=>`<div style="font-size:var(--text-xs);padding:4px 0;border-bottom:1px solid var(--border-subtle);color:var(--text-secondary)">◉ ${s.name}</div>`).join("")}
        </div>
        <div>
          <div style="font-size:var(--text-sm);font-weight:700;color:var(--space-400);margin-bottom:var(--space-3)">🔵 PLANNED (${i.length})</div>
          ${i.map(s=>`<div style="font-size:var(--text-xs);padding:4px 0;border-bottom:1px solid var(--border-subtle);color:var(--text-muted)">○ ${s.name}</div>`).join("")}
        </div>
      </div>
    </div>

    <div class="judge-section">
      <div class="judge-section-label">05 / EVIDENCE OF INTELLIGENCE</div>
      ${t.evidence.points.map(s=>`
        <div style="display:flex;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle)">
          <span style="color:var(--cyan-300);font-size:14px;margin-top:2px">▸</span>
          <span style="font-size:var(--text-sm);color:var(--text-secondary)">${s}</span>
        </div>
      `).join("")}
    </div>
  `}function xa(){const e=u("#architecture-content");if(!e)return;const t=[{label:"USER",sublabel:"Natural Language · Voice · AOI",icon:"👤",color:"var(--cyan-400)",detail:"Entry point. Accepts text queries, voice input, AOI drawings, and file uploads."},{label:"WEB APP",sublabel:"HTML + Vanilla JS + CSS",icon:"🌐",color:"var(--green-400)",detail:"Responsive SPA. Manages routing, state, UI rendering, and user interactions."},{label:"QUERY INTELLIGENCE",sublabel:"NLP Intent Parser",icon:"🧠",color:"var(--purple-400)",detail:"Converts natural language → structured JSON plan: intent, location, bands, operations, temporal range."},{label:"AGENT ORCHESTRATOR",sublabel:"Multi-tool routing",icon:"🤖",color:"var(--cyan-400)",detail:"Routes analysis to specialist tools. Builds visual execution plan. Explains tool selection."},{label:"SPECIALIST TOOLS",sublabel:"NDVI · NDWI · Change · Overlap",icon:"⚙️",color:"var(--amber-400)",detail:"Deterministic computation engines: spectral indices, change detection, spatial correlation."},{label:"EVIDENCE ENGINE",sublabel:"Score · Trace · Uncertainty",icon:"🔍",color:"var(--green-400)",detail:"Computes checklist-based evidence score. Builds audit trail, answer trace, and uncertainty panel."},{label:"ANSWER",sublabel:"Map · Stats · Explanation",icon:"✓",color:"var(--cyan-400)",detail:"Structured, evidence-backed answer with KNOWN/INFERRED/CANNOT DETERMINE distinction."}],a=document.createElement("div");a.style.display="flex",a.style.gap="var(--space-8)",a.style.alignItems="flex-start";const n=document.createElement("div");n.className="arch-diagram",n.style.flex="0 0 320px";const i=document.createElement("div");i.className="card",i.style.flex="1",i.innerHTML=`
    <div style="color:var(--text-muted);text-align:center;padding:var(--space-8)">
      <div style="font-size:32px;margin-bottom:var(--space-3)">👆</div>
      <div style="font-size:var(--text-sm)">Click any architecture node to see details</div>
    </div>
  `,t.forEach((s,r)=>{if(r>0){const l=document.createElement("div");l.className="arch-arrow",l.textContent="↓",n.appendChild(l)}const o=document.createElement("div");o.className="arch-node",o.setAttribute("role","button"),o.setAttribute("tabindex","0"),o.setAttribute("aria-label",s.label),o.style.borderTop=`3px solid ${s.color}`,o.innerHTML=`
      <div class="arch-node-label">${s.icon} ${s.label}</div>
      <div class="arch-node-name" style="color:${s.color}">${s.sublabel}</div>
    `,o.addEventListener("click",()=>{A(".arch-node",n).forEach(l=>l.classList.remove("selected")),o.classList.add("selected"),i.innerHTML=`
        <div style="margin-bottom:var(--space-4)">
          <div style="font-size:var(--text-xs);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${s.color};margin-bottom:var(--space-1)">${s.icon} ${s.label}</div>
          <div style="font-size:var(--text-xl);font-weight:700;color:var(--text-primary)">${s.sublabel}</div>
        </div>
        <p>${s.detail}</p>
        <div class="divider"></div>
        ${s.label==="SPECIALIST TOOLS"?`
          <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--space-3)">
            <div style="font-weight:600;margin-bottom:var(--space-2)">Available tools:</div>
            <div>🌿 NDVI Engine (LIVE)</div>
            <div>💧 NDWI Engine (LIVE)</div>
            <div>🔄 Change Detection Engine (LIVE)</div>
            <div>⚖️ Spatial Correlation Engine (LIVE)</div>
            <div>🤖 Visual QA Engine (DEMO)</div>
            <div>🏗️ NDBI Engine (LIVE)</div>
          </div>
        `:""}
      `}),o.addEventListener("keydown",l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),o.click())}),n.appendChild(o)}),a.appendChild(n),a.appendChild(i),e.innerHTML="",e.appendChild(a)}function Ia(){const e=u("#monitoring-content");e&&(e.innerHTML=`
    <div class="judge-section">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
        <div>
          <div class="judge-section-label">PLANNED FEATURE</div>
          <h3>Monitor Area</h3>
        </div>
        <span class="badge badge-planned">PLANNED</span>
      </div>
      <p>Define an Area of Interest, select an analysis type, and set a monitoring interval. SatQuery will notify you when changes are detected.</p>
      <div style="margin-top:var(--space-6);padding:var(--space-6);background:var(--bg-panel);border-radius:var(--radius-xl);border:1px solid var(--border-subtle)">
        <div style="font-size:var(--text-xs);font-weight:700;color:var(--space-400);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:var(--space-4)">UI WORKFLOW (prototype)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4)">
          <div>
            <label class="form-label">Area of Interest</label>
            <select class="form-select"><option>Ahmedabad Study Area (Demo)</option><option>My Farm</option><option>+ Draw new AOI</option></select>
          </div>
          <div>
            <label class="form-label">Analysis Type</label>
            <select class="form-select"><option>NDVI (Vegetation)</option><option>NDWI (Water)</option><option>Change Detection</option></select>
          </div>
          <div>
            <label class="form-label">Interval</label>
            <select class="form-select"><option>Monthly</option><option>Weekly</option><option>Seasonal</option></select>
          </div>
          <div>
            <label class="form-label">Alert Threshold</label>
            <input class="form-input" type="text" value="±5% change" placeholder="e.g. ±5% NDVI change">
          </div>
        </div>
        <button class="btn btn-secondary" disabled>
          Set Up Monitor
          <span class="badge badge-planned" style="margin-left:var(--space-2)">PLANNED — requires backend + live data</span>
        </button>
      </div>
    </div>
  `)}async function La(){d.isDemoMode=!0;const e=u("#demo-mode-overlay");if(!e)return;e.classList.add("active");const t=se();d.currentProfile=t;const a=e.querySelector("#demo-step-title"),n=e.querySelector("#demo-narration"),i=e.querySelector("#demo-progress"),s=e.querySelector("#demo-step-num");for(const r of ee){if(!d.isDemoMode)break;if(s&&(s.textContent=`${r.step}/${ee.length}`),i&&(i.style.width=`${(r.step-1)/ee.length*100}%`),a&&await typewriter(a,r.title,40),n&&await typewriter(n,r.narration,20),r.action==="type_query"&&r.query){const o=u("#query-input");o&&await typewriter(o,r.query,35)}else r.action==="run_analysis"?(e.classList.remove("active"),await k(Zt.ahmedabad_vegetation_change.query),e.classList.add("active")):r.action==="show_dataset_profile"&&pe(t);await H(r.duration*1e3)}i&&(i.style.width="100%"),a&&(a.textContent="Demo Complete"),n&&(n.textContent="SatQuery AI — Intelligent Geospatial Analysis Platform. Thank you for your attention."),setTimeout(()=>{e.classList.remove("active"),d.isDemoMode=!1},4e3)}window.navigateTo=null;const Se=document.getElementById("greeting-text");Se&&(Se.textContent=Ye());const De=document.getElementById("sidebar"),F=document.getElementById("sidebar-toggle");F==null||F.addEventListener("click",()=>{De.classList.toggle("collapsed"),F.setAttribute("aria-expanded",!De.classList.contains("collapsed"))});var $e;($e=document.getElementById("judge-access-btn"))==null||$e.addEventListener("click",()=>{setTimeout(()=>{var e;return(e=document.querySelector('[data-view="judge"]'))==null?void 0:e.click()},100)});var Re;(Re=document.getElementById("load-demo-btn-ws"))==null||Re.addEventListener("click",async()=>{var a,n,i;const{createDemoProfile:e}=await U(async()=>{const{createDemoProfile:s}=await Promise.resolve().then(()=>ft);return{createDemoProfile:s}},void 0),t=e();(n=(a=window._satqueryApp)==null?void 0:a.loadDemoProfile)==null||n.call(a,t),(i=document.getElementById("load-demo-btn"))==null||i.click()});async function Ea(){const{initDualMap:e}=await U(async()=>{const{initDualMap:r}=await Promise.resolve().then(()=>K);return{initDualMap:r}},void 0),t=document.getElementById("compare-map-a"),a=document.getElementById("compare-map-b");if(!t||!a||t._leaflet_id)return;const n=L.map("compare-map-a",{center:[23.0225,72.5714],zoom:10,zoomControl:!1,attributionControl:!1}),i=L.map("compare-map-b",{center:[21.1702,72.8311],zoom:10,zoomControl:!1,attributionControl:!1}),s=()=>L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",{maxZoom:20,attribution:"© Google"});s().addTo(n),s().addTo(i),n.on("moveend",()=>i.setView(n.getCenter(),n.getZoom(),{animate:!1})),i.on("moveend",()=>n.setView(i.getCenter(),i.getZoom(),{animate:!1}))}window.addDemoNDVI=async()=>{const{addDemoNDVILayer:e}=await U(async()=>{const{addDemoNDVILayer:t}=await Promise.resolve().then(()=>K);return{addDemoNDVILayer:t}},void 0);e()};window.addDemoChange=async()=>{const{addDemoChangeLayer:e}=await U(async()=>{const{addDemoChangeLayer:t}=await Promise.resolve().then(()=>K);return{addDemoChangeLayer:t}},void 0);e()};ma();var ke;(ke=document.querySelector('[data-view="compare"]'))==null||ke.addEventListener("click",()=>{setTimeout(Ea,300)});window.addEventListener("load",()=>{const e=document.getElementById("page-loader");e&&(e.classList.add("hidden"),setTimeout(()=>e.remove(),600))});document.addEventListener("keydown",e=>{e.key==="Escape"&&(document.querySelectorAll(".modal-backdrop.open").forEach(t=>t.classList.remove("open")),document.body.style.overflow="")});window.matchMedia("(prefers-reduced-motion: reduce)").matches&&(document.documentElement.style.setProperty("--transition-normal","0ms"),document.documentElement.style.setProperty("--transition-fast","0ms"),document.documentElement.style.setProperty("--transition-slow","0ms"),document.documentElement.style.setProperty("--transition-spring","0ms"));
