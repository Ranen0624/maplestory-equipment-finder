'use strict';
const embedded=window.self!==window.top;
if(embedded)document.documentElement.classList.add('is-embedded');
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const jobs={전사:['아델','히어로','팔라딘','다크나이트','소울마스터','미하일','아란','블래스터','데몬슬레이어','데몬어벤져','카이저','제로','렌'],마법사:['비숍','아크메이지(불,독)','아크메이지(썬,콜)','플레임위자드','에반','루미너스','배틀메이지','키네시스','일리움','라라'],궁수:['보우마스터','신궁','패스파인더','윈드브레이커','메르세데스','와일드헌터','카인'],도적:['나이트로드','섀도어','듀얼블레이더','나이트워커','팬텀','카데나','호영','칼리'],해적:['바이퍼','캡틴','캐논마스터','스트라이커','은월','메카닉','엔젤릭버스터','아크','제논']};
const allJobs=Object.values(jobs).flat();
const equipment=[
 {name:'별빛아델 (예시)',world:'스카니아',job:'아델',level:291,item:'제네시스 튜너',stars:22,grade:'레전드리',pot:[['STR',12],['STR',9],['공격력',9]],addGrade:'레전드리',add:[['공격력',12],['STR',9],['STR',6]],flame:{STR:150,DEX:40},group:'전사'},
 {name:'달빛아델 (예시)',world:'루나',job:'아델',level:292,item:'제네시스 튜너',stars:22,grade:'레전드리',pot:[['STR',12],['STR',12],['STR',9]],addGrade:'유니크',add:[['공격력',9],['STR',6],['DEX',6]],flame:{STR:140,DEX:30},group:'전사'},
 {name:'은하아델 (예시)',world:'루나',job:'아델',level:285,item:'아케인셰이드 튜너',stars:17,grade:'유니크',pot:[['STR',9],['공격력',6],['DEX',6]],addGrade:'잠재없음',add:[],flame:{STR:100},group:'전사'},
 {name:'새벽비숍 (예시)',world:'스카니아',job:'비숍',level:280,item:'제네시스 스태프',stars:22,grade:'레전드리',pot:[['INT',12],['마력',12],['INT',9]],addGrade:'레전드리',add:[['마력',12],['INT',9],['INT',6]],flame:{INT:150},group:'마법사'}
];
const unions=[
 {name:'별자리조합 (예시)',world:'스카니아',job:'아델',level:291,members:[['아델',291],['비숍',280],['나이트로드',275],['메르세데스',260],['은월',260],['제로',250]]},
 {name:'달빛조합 (예시)',world:'루나',job:'아델',level:292,members:[['아델',292],['비숍',280],['나이트로드',275],['메르세데스',260],['은월',260],['제로',250]]}
];
let currentApp='home',currentPage='search',timer=null,detailRecord=null,connected=false;
const records={equipment:[],union:[]}, logs={equipment:[],union:[]};
const selectOptions=(el,values)=>{el.replaceChildren(...values.map(v=>{const o=document.createElement('option');o.value=o.textContent=v;return o;}));};
function optionRows(host,count,kinds,prefix){
 for(let i=0;i<count;i++){
  const row=document.createElement('div');row.className='option-row';
  const name=document.createElement('span');name.textContent=`옵션 ${i+1}`;
  const select=document.createElement('select');select.setAttribute('aria-label',`${prefix} 옵션 ${i+1} 종류`);selectOptions(select,['선택',...kinds]);
  const value=document.createElement('input');value.type='number';value.min='0';value.max='9999';value.placeholder=prefix==='추가옵션'?'수치':'%';value.setAttribute('aria-label',`${prefix} 옵션 ${i+1} 수치`);
  const clear=document.createElement('button');clear.type='button';clear.textContent='×';clear.setAttribute('aria-label',`${prefix} 옵션 ${i+1} 초기화`);clear.addEventListener('click',()=>{select.value='선택';value.value='';});
  row.append(name,select,value,clear);host.append(row);
 }
}
optionRows($('#potential-rows'),3,['STR','DEX','INT','LUK','공격력','마력','보스 데미지'],'잠재능력');
optionRows($('#additional-rows'),3,['STR','DEX','INT','LUK','공격력','마력'],'에디셔널');
optionRows($('#flame-rows'),4,['STR','DEX','INT','LUK','공격력','마력'],'추가옵션');
for(let i=0;i<6;i++){
 const card=document.createElement('div');card.className='character-slot';
 const head=document.createElement('div');head.className='slot-head';const no=document.createElement('span');no.textContent=`#${String(i+1).padStart(2,'0')}`;
 const clear=document.createElement('button');clear.type='button';clear.textContent='×';clear.setAttribute('aria-label',`캐릭터 ${i+1} 초기화`);head.append(no,clear);
 const l1=document.createElement('label');l1.textContent='레벨';const lv=document.createElement('input');lv.type='number';lv.min='1';lv.max='400';lv.placeholder='입력';lv.setAttribute('aria-label',`캐릭터 ${i+1} 레벨`);l1.append(lv);
 const l2=document.createElement('label');l2.textContent='직업';const job=document.createElement('select');job.setAttribute('aria-label',`캐릭터 ${i+1} 직업`);selectOptions(job,['직업 선택',...allJobs]);l2.append(job);
 clear.addEventListener('click',()=>{lv.value='';job.value='직업 선택';});card.append(head,l1,l2);$('#character-slots').append(card);
}
function syncOptions(){
 [['#potential-rows','#eq-grade'],['#additional-rows','#add-grade'],['#flame-rows','#flame-mode']].forEach(([host,grade])=>{
  const disabled=currentApp!=='equipment'||['미적용','잠재없음'].includes($(grade).value);
  $(host).querySelectorAll('input,select,button').forEach(el=>el.disabled=disabled);
 });
}
['#eq-grade','#add-grade','#flame-mode'].forEach(s=>$(s).addEventListener('change',syncOptions));
$('#eq-group').addEventListener('change',()=>selectOptions($('#eq-job'),['전체',...(jobs[$('#eq-group').value]||allJobs)]));
function syncWorlds(prefix){const type=$(`#${prefix}-world-type`).value;selectOptions($(`#${prefix}-world`),type==='에오스·핼리오스'?['전체 월드','에오스','핼리오스']:type==='일반'?['전체 월드','스카니아','루나']:['전체 월드','스카니아','루나','에오스','핼리오스']);}
['eq','un'].forEach(p=>$(`#${p}-world-type`).addEventListener('change',()=>syncWorlds(p)));
function stopSearch(){if(timer){clearTimeout(timer);timer=null;}$('#search-button').disabled=false;$('#search-button').textContent='⌕ 예시 검색 시작';}
function showPage(page){
 currentPage=page;$('.app-content').scrollTop=0;
 if(!embedded&&matchMedia('(max-width:700px)').matches)window.scrollTo({top:0,behavior:'instant'});
 ['search','results','logs'].forEach(p=>$(`#page-${p}`).hidden=page!==p);
 $$('#module-nav [data-page]').forEach(b=>{if(b.dataset.page===page)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 $('#page-results h2').textContent=currentApp==='union'?'검색 기록':'검색 결과';
 if(page==='logs')$('#log-text').textContent=logs[currentApp].join('\n')||'아직 검색한 기록이 없습니다.';
}
function openApp(app){
 if(!['home','equipment','union'].includes(app))return;
 stopSearch();currentApp=app;$('#app-home').hidden=app!=='home';$('#app-module').hidden=app==='home';
 if(app==='home'){window.scrollTo({top:0,behavior:'instant'});return;}
 const eq=app==='equipment';$('#module-name').textContent=eq?'메이플 장비 검색기':'메이플 유니온챔피언 검색기';$('#module-icon').src=`assets/${eq?'equipment':'union'}-icon.webp`;$('#module-art').src=`assets/${eq?'equipment':'union'}-art.webp`;$('#search-title').textContent=eq?'⌕ 장비 검색':'⌕ 조합 검색';
 $('#equipment-form').hidden=!eq;$('#union-form').hidden=eq;$('#union-results').hidden=eq;$('#view-results').hidden=!eq;
 $('#equipment-form').querySelectorAll('input,select,button').forEach(el=>el.disabled=!eq);$('#union-form').querySelectorAll('input,select,button').forEach(el=>el.disabled=eq);syncOptions();
 $('#module-nav [data-page="results"]').textContent=eq?'▦ 검색 결과':'◷ 검색 기록';
 $('#form-message').textContent='예시 조건 채우기를 누르거나 직접 조건을 입력해 보세요. 기준일은 조작 예시입니다.';$('#app-status').textContent='예시 검색을 시작할 수 있습니다.';showPage('search');renderResults();
}
$$('[data-app]').forEach(b=>b.addEventListener('click',()=>openApp(b.dataset.app)));
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
$$('[data-settings]').forEach(b=>b.addEventListener('click',()=>$('#settings-dialog').showModal()));
$$('[data-help]').forEach(b=>b.addEventListener('click',()=>$('#help-dialog').showModal()));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$('#connect-example').addEventListener('click',()=>{connected=!connected;$('#connection-status').textContent=connected?'예시 연결 완료 · 실제 API에는 연결하지 않습니다.':'미연결 · 실제 키는 입력하지 않습니다.';$('#connect-example').textContent=connected?'예시 연결 해제':'예시 연결하기';});
$('#apply-settings').addEventListener('click',()=>{$('#settings-dialog').close();openApp($('#startup-view').value);});
function resetFields(){
 stopSearch();$('#search-form').reset();selectOptions($('#eq-job'),[...jobs.전사,'전체']);syncWorlds('eq');syncWorlds('un');syncOptions();$('#form-message').textContent='입력 조건을 초기화했습니다.';
}
$('#reset-form').addEventListener('click',resetFields);
$('#fill-example').addEventListener('click',()=>{
 resetFields();
 if(currentApp==='equipment'){$('#eq-item').value='제네시스 튜너';$('#eq-star').value='22';$('#eq-grade').value='레전드리';const row=$('#potential-rows .option-row');row.querySelector('select').value='STR';row.querySelector('input').value='12';syncOptions();}
 else {const examples=[['아델',291],['비숍',280],['나이트로드',275]];$$('.character-slot').forEach((card,i)=>{card.querySelector('input').value=examples[i]?.[1]||'';card.querySelector('select').value=examples[i]?.[0]||'직업 선택';});}
 $('#form-message').textContent='예시 조건을 채웠습니다. 검색 시작을 누른 뒤 값을 바꾸어 비교해 보세요.';
});
function rowsToConditions(host){return [...$(host).querySelectorAll('.option-row')].flatMap((row,i)=>{const type=row.querySelector('select').value,value=row.querySelector('input').value;if(type==='선택'&&value==='')return [];if(type==='선택'||value==='')throw Error('옵션의 종류와 수치를 함께 입력해 주세요.');return [{type,value:Number(value),index:i}];});}
function matchOptions(actual,conditions,ordered){
 const used=new Set();return conditions.every(c=>{const index=ordered?(actual[c.index]?.[0]===c.type&&actual[c.index]?.[1]===c.value?c.index:-1):actual.findIndex((v,i)=>!used.has(i)&&v[0]===c.type&&v[1]===c.value);if(index<0)return false;used.add(index);return true;});
}
function worldMatches(row,prefix){const type=$(`#${prefix}-world-type`).value,world=$(`#${prefix}-world`).value;const special=['에오스','핼리오스'].includes(row.world);return (world==='전체 월드'||world===row.world)&&(type==='전체'||(type==='일반'?!special:special));}
function searchEquipment(){
 const min=Number($('#eq-min').value),max=Number($('#eq-max').value);if(min>max)throw Error('최소 레벨은 최대 레벨보다 클 수 없습니다.');
 const item=$('#eq-item').value.trim(),stars=Number($('#eq-star').value),grade=$('#eq-grade').value,addGrade=$('#add-grade').value,flameMode=$('#flame-mode').value;
 if(!item&&!stars&&grade==='미적용'&&addGrade==='미적용'&&flameMode==='미적용')throw Error('장비명·스타포스·잠재능력·에디셔널·추가옵션 중 하나 이상을 설정해 주세요.');
 const pot=['미적용','잠재없음'].includes(grade)?[]:rowsToConditions('#potential-rows'),add=['미적용','잠재없음'].includes(addGrade)?[]:rowsToConditions('#additional-rows'),flame=flameMode==='미적용'?[]:rowsToConditions('#flame-rows');
 return equipment.filter(r=>r.level>=min&&r.level<=max&&worldMatches(r,'eq')&&($('#eq-group').value==='전체'||r.group===$('#eq-group').value)&&($('#eq-job').value==='전체'||r.job===$('#eq-job').value)&&(!item||($('#eq-match').value==='exact'?r.item===item:r.item.includes(item)))&&(!stars||r.stars===stars)&&(grade==='미적용'||r.grade===grade)&&(addGrade==='미적용'||r.addGrade===addGrade)&&matchOptions(r.pot,pot,$('#eq-order').value==='순서까지 일치')&&matchOptions(r.add,add,$('#add-order').value==='순서까지 일치')&&flame.every(c=>(r.flame[c.type]||0)===c.value));
}
function searchUnion(){
 const conditions=$$('.character-slot').flatMap(card=>{const job=card.querySelector('select').value,level=card.querySelector('input').value;if(job==='직업 선택'&&level==='')return [];if(job==='직업 선택'||level==='')throw Error('각 캐릭터의 레벨과 직업을 함께 입력해 주세요.');return [[job,Number(level)]];});
 if(!conditions.length)throw Error('캐릭터의 레벨과 직업을 하나 이상 입력해 주세요.');
 return unions.filter(r=>{const used=new Set();return worldMatches(r,'un')&&conditions.every(c=>{const i=r.members.findIndex((m,j)=>!used.has(j)&&m[0]===c[0]&&m[1]===c[1]);if(i<0)return false;used.add(i);return true;});});
}
$('#search-form').addEventListener('submit',e=>{
 e.preventDefault();if(timer)return;let found;
 try{found=currentApp==='equipment'?searchEquipment():searchUnion();}catch(err){$('#form-message').textContent=err.message;return;}
 const app=currentApp;$('#search-button').disabled=true;$('#search-button').textContent='예시 데이터 비교 중…';$('#form-message').textContent='입력한 조건을 예시 데이터와 비교하고 있습니다.';
 timer=setTimeout(()=>{timer=null;records[app]=found;logs[app].push(`[${new Date().toLocaleTimeString('ko-KR')}] 예시 조건 비교 완료 · ${found.length}개 결과 · API 호출 0회`);stopSearch();$('#app-status').textContent=`예시 검색 완료 · ${found.length}개 결과`;$('#form-message').textContent=found.length?'예시 검색이 완료되었습니다. 결과를 눌러 상세 정보를 확인하세요.':'조건에 맞는 예시가 없습니다. 예시 조건 채우기를 사용해 보세요.';renderResults();if(app==='equipment')showPage('results');},400);
});
function node(tag,text,className){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;}
function resultList(){const list=document.createElement('div');list.className='result-list';const rows=records[currentApp];if(!rows.length){list.append(node('p','표시할 예시 결과가 없습니다. 검색 조건에서 예시 조건을 채워 검색해 보세요.','empty'));return list;}
 rows.forEach(r=>{const b=document.createElement('button');b.type='button';b.className='result-row';b.setAttribute('aria-label',`${r.name} 상세보기`);const a=document.createElement('span');a.append(node('strong',r.name),node('small',`${r.world} · ${r.job} · Lv.${r.level}`));const c=document.createElement('span');c.textContent=r.item||`${r.members.length}개 캐릭터 조합`;c.append(node('small',r.item?`${r.stars}성 · ${r.grade}`:r.members.slice(0,3).map(m=>m[0]).join(' · ')));const d=node('span',r.pot?r.pot.map(p=>`${p[0]} +${p[1]}%`).join(' / '):'조합 상세보기 ↗');b.append(a,c,d);b.addEventListener('click',()=>{detailRecord=r;renderDetail('info');$('#detail-dialog').showModal();});list.append(b);});return list;}
function renderResults(){
 if(currentApp==='home')return;$('#equipment-results').replaceChildren(node('p',`예시 결과 ${records[currentApp].length}개 · 실제 캐릭터 데이터가 아닙니다.`,'result-note'),resultList());
 const host=$('#union-results');host.replaceChildren();if(currentApp==='union'){const head=document.createElement('div');head.className='result-head';head.append(node('h3',`검색 결과 ${records.union.length}개`));const csv=node('button','↓ 결과 내보내기 (CSV)','ghost');csv.type='button';csv.addEventListener('click',exportCSV);head.append(csv);host.append(head,node('p','입력한 조건과 일치하는 가상 조합입니다.','result-note'),resultList());}
}
$('#clear-log').addEventListener('click',()=>{logs[currentApp]=[];$('#log-text').textContent='로그를 비웠습니다.';});
function renderDetail(tab){
 const r=detailRecord;if(!r)return;$('#detail-name').textContent=r.name;$('#detail-meta').textContent=`${r.world} · ${r.job} · Lv.${r.level}`;$$('[data-detail]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.detail===tab)));const body=$('#detail-body');body.replaceChildren();
 if(tab==='info'){const dl=document.createElement('dl');const items=r.item?[['장비',r.item],['스타포스',`${r.stars}성`],['잠재능력',`${r.grade} / ${r.pot.map(v=>v.join(' +')+'%').join(' / ')}`],['에디셔널',`${r.addGrade} / ${r.add.map(v=>v.join(' +')+'%').join(' / ')}`],['추가옵션',Object.entries(r.flame).map(v=>v.join(' +')).join(' / ')]]:r.members.map((m,i)=>[`캐릭터 ${i+1}`,`${m[0]} · Lv.${m[1]}`]);items.forEach(([k,v])=>dl.append(node('dt',k),node('dd',v)));body.append(dl);}
 if(tab==='timeline'){body.append(node('p','아래 날짜와 변화는 타임라인 기능을 설명하기 위한 예시입니다.'));const ol=document.createElement('ol');[['2026-09-21',`Lv.${r.level} 달성`],['2026-09-10','별빛길드 가입'],['2026-09-01','캐릭터 이름 변경']].forEach(x=>ol.append(node('li',x.join(' · '))));body.append(ol);}
 if(tab==='outfit'){body.append(node('p','기간별 코디 변화가 기록되는 방식을 보여주는 텍스트 예시입니다. 실제 캐릭터 이미지는 조회하지 않습니다.'));const wrap=document.createElement('div');wrap.className='outfit-example';[['2026-09-01','달빛 코디','보라색 모자 · 별빛 로브'],['2026-09-21','여행자 코디','베레모 · 여행자 망토']].forEach(([date,title,desc])=>{const c=document.createElement('div');c.append(node('small',date),node('b',title),node('p',desc));wrap.append(c);});body.append(wrap);}
}
$$('[data-detail]').forEach(b=>b.addEventListener('click',()=>renderDetail(b.dataset.detail)));
function exportCSV(){
 const rows=records[currentApp];if(!rows.length){$('#app-status').textContent='저장할 예시 결과가 없습니다. 먼저 검색해 주세요.';return;}
 const quote=v=>'"'+String(v).replaceAll('"','""')+'"';const columns=['구분','닉네임','월드','직업','레벨','장비 또는 조합'];const data=rows.map(r=>['가상 예시',r.name,r.world,r.job,r.level,r.item||r.members.map(m=>`${m[0]} ${m[1]}`).join(' / ')]);const blob=new Blob(['\uFEFF'+[columns,...data].map(row=>row.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`MapleTools_${currentApp}_example.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#app-status').textContent='예시 결과를 CSV로 내보냈습니다.';
}
$$('[data-csv]').forEach(b=>b.addEventListener('click',exportCSV));
selectOptions($('#eq-job'),[...jobs.전사,'전체']);
const initial=new URLSearchParams(location.search).get('app');openApp(initial||'home');

