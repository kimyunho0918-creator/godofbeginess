// =========================================================================
// 1. 게임 환경설정 데이터 (config.js의 내용을 통합)
// =========================================================================
const BIZ_DATA = {
    '치킨': { icon: '🍗', p:[12000, 18000, 24000], g:[65, 45, 30], m:0.38, 
              locs:[{n:'홍대입구', r:6000000, l:300000, w:[1.2, 1.6]}, {n:'성안길', r:4000000, l:150000, w:[0.9, 1.2]}, {n:'3지구', r:2000000, l:80000, w:[0.7, 1.0]}],
              wFx: { '☀️': { m:1.2, desc:'치맥하기 완벽한 날! (손님 20% 증가)' } } 
    },
    '카페': { icon: '☕', p:[2500, 4500, 6000], g:[200, 140, 90], m:0.45, 
              locs:[{n:'홍대입구', r:6000000, l:300000, w:[1.2, 1.6]}, {n:'성안길', r:4000000, l:180000, w:[0.9, 1.2]}, {n:'3지구', r:2000000, l:90000, w:[0.7, 1.0]}],
              wFx: { '🌧️': { m:1.2, desc:'비 오는 날의 카페 감성 (손님 20% 증가)' }, '❄️': { m:1.1, desc:'따뜻한 커피 한 잔 (손님 10% 증가)' } } 
    },
    '토스트':{ icon: '🥪', p:[3000, 4000, 5000], g:[190, 160, 110], m:0.42, 
              locs:[{n:'홍대입구', r:6000000, l:250000, w:[1.2, 1.6]}, {n:'성안길', r:4000000, l:120000, w:[0.9, 1.2]}, {n:'3지구', r:2000000, l:60000, w:[0.7, 1.0]}],
              wFx: { '☀️': { m:1.2, desc:'야외 나들이객 증가 (손님 20% 증가)' }, '❄️': { m:0.6, desc:'길거리 장사 최악의 날씨 (손님 40% 감소)' } } 
    },
    '전집': { icon: '🥘', p:[15000, 25000, 35000], g:[55, 35, 20], m:0.35,
              locs:[{n:'홍대입구', r:6000000, l:300000, w:[1.2, 1.6]}, {n:'성안길', r:4000000, l:150000, w:[0.9, 1.2]}, {n:'3지구', r:2000000, l:80000, w:[0.7, 1.0]}],
              wFx: { '🌧️': { m:2.0, desc:'비 오는 날엔 무조건 전과 막걸리!! (손님 100% 폭증)' }, '☀️': { m:0.7, desc:'더워서 전이 안 팔려요 (손님 30% 감소)' } } 
    }
};

const WEATHER_BASE = {
    '☀️': { t: '맑음', m: 1.1, desc: '야외 활동하기 좋은 날 (손님 10% 증가)' },
    '☁️': { t: '흐림', m: 1.0, desc: '평범 하루' },
    '🌧️': { t: '비', m: 0.7, desc: '외출을 꺼리는 날씨 (손님 30% 감소)' },
    '❄️': { t: '눈', m: 0.8, desc: '길이 미끄러운 날 (손님 20% 감소)' }
};
const WEATHER_TYPES = ['☀️', '☁️', '🌧️', '❄️'];

// =========================================================================
// 2. 메인 게임 로직
// =========================================================================
let s = { day:1, money:10000000, totalProfit:0, weekly:0, type:'', loc:null, price:0, pIdx:0, activeBuffs: [], eventDays:[], todayWeatherType: null };

function init() {
    const tBox = document.getElementById('type-list');
    if (!tBox) return; // HTML이 덜 불려왔을 경우 에러 방지
    
    Object.keys(BIZ_DATA).forEach(k => {
        let b = document.createElement('div'); b.className = 'opt-btn t-o'; 
        b.innerHTML = `<span>${k}</span><span>${BIZ_DATA[k].icon}</span>`;
        b.onclick = () => { s.type = k; updateUIBtn('.t-o', b); renderLocs(); };
        tBox.appendChild(b);
    });
    setWeeklyEvents();
    setWeather();
}

// 창이 켜지면 무조건 안전하게 버튼을 생성하도록 보장
window.onload = init;

function setWeeklyEvents() {
    s.eventDays = [];
    while(s.eventDays.length < 6) {
        let d = Math.floor(Math.random() * 28) + 1;
        if(!s.eventDays.includes(d) && d % 7 !== 0) s.eventDays.push(d);
    }
}

function setWeather() {
    s.todayWeatherType = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
    updateWeatherUI();
}

function updateWeatherUI() {
    if(!s.todayWeatherType) return;
    let fx = WEATHER_BASE[s.todayWeatherType];
    if(s.type && BIZ_DATA[s.type].wFx && BIZ_DATA[s.type].wFx[s.todayWeatherType]) {
        fx = BIZ_DATA[s.type].wFx[s.todayWeatherType];
    }
    document.getElementById('weather-icon').innerText = s.todayWeatherType;
    document.getElementById('weather-text').innerText = `${WEATHER_BASE[s.todayWeatherType].t} (${fx.desc})`;
}

function renderLocs() { 
    const lBox = document.getElementById('loc-list'); 
    lBox.innerHTML = ''; 
    BIZ_DATA[s.type].locs.forEach((l) => { 
        let b = document.createElement('div'); 
        b.className = 'opt-btn l-o'; 
        b.innerHTML = `<span><b>${l.n}</b></span><span style="color:var(--text-dim)">권리금/보증금: ${l.r/10000}만</span>`; 
        b.onclick = () => { s.loc = l; updateUIBtn('.l-o', b); renderPrices(); }; 
        lBox.appendChild(b); 
    }); 
}

function renderPrices() { 
    const pBox = document.getElementById('price-list'); 
    pBox.innerHTML = ''; 
    ['실속', '표준', '프리미엄'].forEach((n, i) => { 
        let b = document.createElement('div'); 
        b.className = 'opt-btn p-o'; 
        b.innerHTML = `<span><b>${n}</b></span><span style="color:var(--accent)">${BIZ_DATA[s.type].p[i].toLocaleString()}원</span>`; 
        b.onclick = () => { s.price = BIZ_DATA[s.type].p[i]; s.pIdx = i; updateUIBtn('.p-o', b); }; 
        pBox.appendChild(b); 
    }); 
}

function updateUIBtn(cls, target) { 
    document.querySelectorAll(cls).forEach(el => el.classList.remove('selected')); 
    target.classList.add('selected'); 
}

function startGame() { 
    if(!s.type || !s.loc || !s.price) return alert("전략을 모두 선택해주세요!"); 
    s.money -= s.loc.r; 
    
    const priceTierNames = ['실속형', '표준형', '프리미엄'];
    document.getElementById('info-type').innerText = `${s.type} ${BIZ_DATA[s.type].icon}`;
    document.getElementById('info-loc').innerText = `📍 상권: ${s.loc.n}`;
    document.getElementById('info-price').innerText = `💰 가격: ${priceTierNames[s.pIdx]} (${s.price.toLocaleString()}원)`;

    document.getElementById('setup-screen').classList.add('hidden'); 
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('log-box').innerHTML = `
        <div class="log-card" style="border-left-color: var(--danger); background: rgba(244, 63, 94, 0.1);">
            <span style="color:var(--danger); font-weight:bold;">가게 보증금/인테리어 비용 지출: -${s.loc.r.toLocaleString()}원</span>
        </div>
    `; 
    updateWeatherUI(); 
    updateMainUI(); 
}

function runDay() {
    const biz = BIZ_DATA[s.type];
    
    let currentEventMod = 1.0;
    let buffLogText = '';
    
    for (let i = s.activeBuffs.length - 1; i >= 0; i--) {
        currentEventMod *= s.activeBuffs[i].m;
        buffLogText += `<span style="color:${s.activeBuffs[i].m > 1 ? 'var(--accent)' : 'var(--danger)'};">[${s.activeBuffs[i].n}] </span>`;
        
        s.activeBuffs[i].d--; 
        if (s.activeBuffs[i].d <= 0) {
            s.activeBuffs.splice(i, 1); 
        }
    }
    
    let fx = WEATHER_BASE[s.todayWeatherType];
    if(biz.wFx && biz.wFx[s.todayWeatherType]) fx = biz.wFx[s.todayWeatherType];
    
    let phaseMod = 1.0;
    if (s.type === '치킨') {
        if (s.day <= 15) { phaseMod = 0.8; }
        else { phaseMod = 1.3; } 
    } else if (s.type === '카페') {
        if (s.day <= 15) { phaseMod = 1.3; }
        else if (s.day <= 21) { phaseMod = 0.8; }
        else { phaseMod = 1.0; } 
    }

    const finalGuestMod = currentEventMod * fx.m * phaseMod;
    const guests = Math.floor(biz.g[s.pIdx] * (Math.random() * (s.loc.w[1] - s.loc.w[0]) + s.loc.w[0]) * finalGuestMod);
    
    const sales = guests * s.price;
    const matCost = Math.floor(sales * (1 - biz.m)); 
    const fixedExp = s.loc.l; 
    
    const profit = sales - matCost - fixedExp;
    
    s.money += profit; 
    s.totalProfit += profit;
    s.weekly += profit;
    updateMainUI();

    const isProfit = profit >= 0;
    const logBox = document.getElementById('log-box');
    const l = document.createElement('div'); 
    l.className = 'log-card'; 
    l.style.borderLeftColor = isProfit ? 'var(--primary)' : 'var(--danger)'; 
    
    l.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:1.1rem; font-weight:bold;">Day ${s.day} 마감 ${buffLogText}</span>
            <div style="font-size:1.3rem;">${s.todayWeatherType}</div>
        </div>
        <div style="display:flex; justify-content:space-between; color:var(--text-dim); font-size:0.9rem; margin-bottom:5px;">
            <span>총 방문객: ${guests}명</span>
            <span>매출: ${sales.toLocaleString()}원</span>
        </div>
        <div style="display:flex; justify-content:space-between; color:var(--text-dim); font-size:0.9rem;">
            <span style="color:var(--danger)">재료비/유지비: -${(matCost + fixedExp).toLocaleString()}원</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px;">
            <span style="color:var(--text-main);">일일 순이익</span>
            <b class="${isProfit ? 'text-green' : 'text-red'}" style="font-size:1.2rem;">
                ${isProfit ? '+' : ''}${profit.toLocaleString()}원
            </b>
        </div>
    `; 
    logBox.prepend(l);

    setWeather(); 
    if (s.eventDays.includes(s.day)) triggerEventUI(); 
    else finishDay(); 
}

function triggerEventUI() {
    let events = [
        { 
            t: "📺 대형 유튜버 홍보 제안", cost: 1500000, 
            accept: { win: { m: "알고리즘 대폭발! 3일간 인파가 몰려옵니다.", b: 2.0, d: 3, n: "유튜브 떡상" }, lose: { m: "조회수가 처참합니다... 3일간 파리만 날립니다.", b: 0.8, d: 3, n: "유튜브 폭망" } },
            reject: { win: { m: "알고 보니 뒷광고 논란 유튜버! 하루 동안 손님이 안심하고 찾아옵니다.", b: 1.2, d: 1, n: "현명한 거절" }, lose: { m: "경쟁 업체가 유튜버 버프를 받았습니다. 3일간 손님이 줄어듭니다.", b: 0.8, d: 3, n: "경쟁사 떡상" } }
        },
        { 
            t: "🌟 지상파 맛집 프로그램", cost: 3000000, 
            accept: { win: { m: "전국구 맛집 등극! 무려 5일 동안 역대급 오픈런이 시작됩니다.", b: 2.5, d: 5, n: "TV 방영 효과" }, lose: { m: "시청률 0%대... 5일간 낙인 효과로 손님이 감소합니다.", b: 0.7, d: 5, n: "TV 방영 실패" } },
            reject: { win: { m: "방송국 PD의 갑질 논란이 터졌습니다. 하루 동안 응원 손님이 옵니다.", b: 1.2, d: 1, n: "위기 모면" }, lose: { m: "옆집 상가가 방송을 탔습니다. 5일 동안 손님을 다 뺏깁니다.", b: 0.7, d: 5, n: "상권 주도권 상실" } }
        },
        { 
            t: "🏫 인근 학교 축제 단체 예약", cost: 800000, 
            accept: { win: { m: "학생들이 엄청난 먹성을 자랑하며 하루 매출이 폭발합니다!", b: 3.5, d: 1, n: "단체석 대박" }, lose: { m: "충격적인 노쇼... 하루 치 재료를 모두 폐기합니다.", b: 0.3, d: 1, n: "대규모 노쇼" } },
            reject: { win: { m: "단체를 안 받아 일반 손님들이 쾌적하게 식사했습니다.", b: 1.1, d: 1, n: "안정적 운영" }, lose: { m: "거절당한 학생들이 악의적 소문을 퍼트렸습니다. 2일간 영향이 갑니다.", b: 0.8, d: 2, n: "악성 루머" } }
        }
    ];

    if (s.type === '치킨' && s.day <= 15) {
        events.push({
            t: "⚽ 월드컵 특수! 대형 스크린 설치", cost: 2000000, 
            accept: { 
                win: { m: "대한민국 4강 신화! 치킨 주문 폭주가 5일간 이어집니다!", b: 3.5, d: 5, n: "월드컵 특수" }, 
                lose: { m: "예선 광탈... 준비한 닭을 모두 폐기합니다. 3일간 타격이 큽니다.", b: 0.5, d: 3, n: "예선 탈락 후폭풍" } 
            },
            reject: {
                win: { m: "조용한 분위기를 찾는 손님들이 몰려옵니다.", b: 1.1, d: 1, n: "틈새 시장" },
                lose: { m: "스크린이 있는 경쟁 치킨집으로 동네 사람들이 다 몰려갔습니다. 3일간 썰렁합니다.", b: 0.6, d: 3, n: "월드컵 패배자" }
            }
        });
    }

    s.currentEvent = events[Math.floor(Math.random() * events.length)];
    const modal = document.getElementById('modal-content');
    modal.innerHTML = `
        <div style="font-size:3.5rem; margin-bottom:10px;">🚨</div>
        <h2 class="text-yellow" style="font-size:2rem; margin-bottom:15px;">${s.currentEvent.t}</h2>
        <p style="font-size:1.1rem; color:var(--text-dim); line-height:1.5;">
            선택의 갈림길입니다. 진행 시 <b class="text-yellow">${s.currentEvent.cost.toLocaleString()}원</b>이 즉시 소모됩니다.<br>
            투자 여부에 상관없이 결과는 <b style="color:white;">50% 확률</b>로 갈립니다.
        </p>
        <div style="display:flex; gap:15px; margin-top:30px;">
            <button class="choice-btn" style="background:var(--primary); flex:1;" onclick='handleEvent(true)'>위험 감수 (투자)</button>
            <button class="choice-btn" style="background:var(--border); flex:1;" onclick='handleEvent(false)'>안전 제일 (거절)</button>
        </div>
    `;
    document.getElementById('center-overlay').style.display = 'flex';
}

function handleEvent(isAccept) {
    const ev = s.currentEvent;
    const isWin = Math.random() < 0.50; 
    
    let result;
    if (isAccept) {
        s.money -= ev.cost; 
        result = isWin ? ev.accept.win : ev.accept.lose;
    } else {
        result = isWin ? ev.reject.win : ev.reject.lose;
    }
    
    s.activeBuffs.push({ m: result.b, d: result.d, n: result.n });
    
    updateMainUI();

    const modal = document.getElementById('modal-content');
    modal.innerHTML = `
        <div style="font-size:3.5rem; margin-bottom:10px;">${isWin ? '🎉' : '💀'}</div>
        <h2 class="${isWin ? 'text-green' : 'text-red'}" style="font-size:2rem; margin-bottom:15px;">
            ${isAccept ? (isWin ? '성공적인 투자!' : '최악의 한 수...') : (isWin ? '위기 모면!' : '뼈아픈 손실...')}
        </h2>
        <p style="font-size:1.2rem; margin-bottom:20px;">"${result.m}"</p>
        <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:1rem; border:1px solid var(--border);">
            ${isAccept ? `<p class="text-red">투자 지출: -${ev.cost.toLocaleString()}원</p>` : `<p class="text-dim">투자 지출 없음 (거절함)</p>`}
            <p class="${isWin ? 'text-yellow' : 'text-red'}" style="font-weight:bold; font-size:1.1rem; margin-top:5px;">
                적용 효과: 매출 x${result.b}배 (${result.d}일간 지속)
            </p>
        </div>
        <button class="action-btn" style="margin-top:25px;" onclick="closeEventModal()">확인</button>
    `;
}

function closeEventModal() {
    document.getElementById('center-overlay').style.display = 'none';
    finishDay();
}

function finishDay() {
    if (s.day % 7 === 0) {
        const weekNum = s.day / 7;
        
        const modal = document.getElementById('modal-content');
        modal.innerHTML = `
            <div style="font-size:3.5rem; margin-bottom:10px;">📅</div>
            <h2 style="color:var(--secondary); font-size:2rem; margin-bottom:10px;">Week ${weekNum} 정산 완료</h2>
            <p style="color:var(--text-dim); margin-bottom:20px;">치열했던 이번 주 누적 순수익입니다.</p>
            <div style="font-size:3rem; font-weight:900; color:${s.weekly >= 0 ? 'var(--accent)' : 'var(--danger)'}; margin-bottom:30px; background:rgba(0,0,0,0.3); padding:20px; border-radius:1rem; border:1px solid var(--border);">
                ${s.weekly > 0 ? '+' : ''}${s.weekly.toLocaleString()}원
            </div>
            <button class="action-btn" onclick="closeWeeklyModal()">다음 주 시작하기</button>
        `;
        document.getElementById('center-overlay').style.display = 'flex';
        
        const card = document.createElement('div'); 
        card.className = 'week-report-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h4 style="margin:0; color:var(--text-dim);">WEEK ${weekNum}</h4>
                <b style="font-size:1.2rem; color:${s.weekly >= 0 ? 'var(--accent)' : 'var(--danger)'};">${s.weekly > 0 ? '+' : ''}${s.weekly.toLocaleString()}원</b>
            </div>
        `; 
        document.getElementById('report-list').prepend(card); 
        
        s.weekly = 0; 
    } else {
        nextDay();
    }
}

function closeWeeklyModal() {
    document.getElementById('center-overlay').style.display = 'none';
    nextDay();
}

function nextDay() { 
    s.day++; 
    if (s.day > 30) showFinalResult(); 
    else { 
        updateMainUI(); 
        document.getElementById('progress-bar').style.width = `${(s.day / 30) * 100}%`;
    } 
}

function showFinalResult() { 
    updateFinalUI(); 
}

function updateFinalUI(bonus = 0) {
    const modal = document.getElementById('modal-content');
    const finalTotal = s.money + bonus;
    
    let rank = ""; let rColor = "";
    
    if (finalTotal >= 30000000) { 
        rank = "👑 장사의 신"; 
        rColor = "var(--accent)"; 
    } else if (finalTotal >= 20000000) { 
        rank = "🔥 프랜차이즈 대표"; 
        rColor = "#ef4444"; 
    } else if (finalTotal >= 15000000) { 
        rank = "🌟 골목 상권의 지배자"; 
        rColor = "var(--primary)"; 
    } else if (finalTotal >= 10000000) { 
        rank = "💼 훌륭한 방어전 (원금 회수)"; 
        rColor = "var(--secondary)"; 
    } else if (finalTotal > 0) { 
        rank = "😥 눈물의 폐업 (투자금 손실)"; 
        rColor = "var(--text-dim)"; 
    } else { 
        rank = "💀 빚더미 파산 (신용불량)"; 
        rColor = "var(--danger)"; 
    }

    modal.innerHTML = `
        <h3 style="color:var(--text-dim); margin:0;">30일 영업 종료</h3>
        <h1 style="font-size:2.4rem; color:${rColor}; margin:10px 0 30px;">${rank}</h1>
        
        <div style="background:rgba(0,0,0,0.3); padding:25px; border-radius:1.5rem; margin:25px 0; text-align:left; border:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>초기 창업 자본</span><b style="color:var(--text-dim);">10,000,000원</b></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>최종 금고 잔액</span><b>${s.money.toLocaleString()}원</b></div>
            <div style="display:flex; justify-content:space-between; color:${s.totalProfit >= 0 ? 'var(--primary)' : 'var(--danger)'};">
                <span>영업 누적 순수익</span><b>${s.totalProfit > 0 ? '+' : ''}${s.totalProfit.toLocaleString()}원</b>
            </div>
            ${bonus > 0 ? `<div style="display:flex; justify-content:space-between; color:var(--accent); margin-top:10px;"><span>💎 쿠폰 보너스</span><b>+${bonus.toLocaleString()}원</b></div>` : ''}
            
            <div style="display:flex; justify-content:space-between; font-size:2rem; font-weight:900; margin-top:20px; padding-top:20px; border-top:2px solid var(--border);">
                <span>최종 자산 평가</span><span style="color:${finalTotal >= 10000000 ? 'var(--accent)' : 'var(--danger)'}">${finalTotal.toLocaleString()}원</span>
            </div>
        </div>
        
        ${bonus === 0 ? `
        <div style="display:flex; gap:10px;">
            <input type="text" id="coupon-code" style="flex:2; padding:1rem; border-radius:1rem; background:var(--dark-bg); color:white; border:1px solid var(--border);" placeholder="비밀 쿠폰 입력">
            <button class="action-btn" style="flex:1; border-radius:1rem; padding:1rem;" onclick="applyCoupon()">적용</button>
        </div>` : `<h3 class="text-green">정산이 모두 완료되었습니다.</h3>`}
        
        <button class="action-btn" style="background:var(--border); margin-top:20px;" onclick="location.reload()">처음부터 다시 도전</button>
    `;
    document.getElementById('center-overlay').style.display = 'flex';
}

function applyCoupon() { 
    if (document.getElementById('coupon-code').value === '0318') { 
        const bonusAmount = Math.max(Math.floor(s.totalProfit * 0.1), 500000); 
        updateFinalUI(bonusAmount); 
    } else { alert("존재하지 않는 쿠폰입니다."); } 
}

function updateMainUI() { 
    document.getElementById('day-num').innerText = `Day ${Math.min(s.day, 30)}`; 
    document.getElementById('money-display').innerText = s.money.toLocaleString(); 
    
    const phaseBox = document.getElementById('phase-box');
    const phaseText = document.getElementById('phase-text');
    
    if (s.type === '치킨') {
        if (s.day <= 15) { phaseText.innerText = '신장개업 (입소문 전, 손님 20% 감소)'; phaseText.style.color = 'var(--danger)'; }
        else { phaseText.innerText = '입소문 폭발! (단골 확보, 손님 30% 증가)'; phaseText.style.color = 'var(--primary)'; }
    } else if (s.type === '카페') {
        if (s.day <= 15) { phaseText.innerText = '오픈빨 발동! (호기심 증가, 손님 30% 증가)'; phaseText.style.color = 'var(--primary)'; }
        else if (s.day <= 21) { phaseText.innerText = '오픈빨 종료... (거품 빠짐, 손님 20% 감소)'; phaseText.style.color = 'var(--danger)'; }
        else { phaseText.innerText = '상권 정착 완료 (단골 형성, 평범한 시기)'; phaseText.style.color = 'var(--text-dim)'; }
    } else {
        phaseText.innerText = '평범한 시기 (특수 효과 없음)'; phaseText.style.color = 'var(--text-dim)';
    }

    const buffBox = document.getElementById('active-buffs');
    if (s.activeBuffs.length === 0) {
        buffBox.innerHTML = '';
    } else {
        buffBox.innerHTML = '<div style="font-size:0.8rem; color:var(--text-dim); margin-bottom:5px; margin-top:10px;">활성화된 마케팅 버프</div>';
        s.activeBuffs.forEach(buff => {
            const color = buff.m > 1 ? 'var(--accent)' : 'var(--danger)';
            const icon = buff.m > 1 ? '📈' : '📉';
            buffBox.innerHTML += `
                <div class="buff-item">
                    <span style="color:${color}; font-weight:bold;">${icon} ${buff.n}</span>
                    <span style="color:var(--text-dim); font-size:0.8rem;">${buff.d}일 남음</span>
                </div>
            `;
        });
    }
}