const $ = s => document.querySelector(s),
    D = ['T2', 'T3', 'T4', 'T5', 'T6'],
    LB = ['Chưa phát', 'Đang mượn', 'Đã trả'];

let S,
    role = 'lib',
    flt = '',
    tab = 0,
    today = 0;

// ---------------------------------------------------------------------------
// Dữ liệu mẫu
// ---------------------------------------------------------------------------
const mk = () => {
    const cl = ['6A1', '6A2', '6A3'],
        sb = ['Toán', 'Ngữ văn', 'KHTN', 'LS-ĐL'],
        V = [
            [14, 12, 16, 9],
            [18, 15, 11, 12],
            [9, 10, 13, 8],
        ],
        need = {};

    cl.forEach((c, i) => sb.forEach((s, j) => (need[c + '|' + s] = V[i][j])));

    // Định dạng mỗi tiết: ngày,tiết,lớp,môn
    const L =
        "0,1,6A1,Toán;0,1,6A2,Toán;0,2,6A3,Ngữ văn;0,2,6A1,KHTN;0,3,6A2,KHTN;0,3,6A3,Toán;" +
        "1,1,6A1,Ngữ văn;1,1,6A2,Ngữ văn;1,2,6A3,KHTN;1,2,6A1,LS-ĐL;1,3,6A2,LS-ĐL;1,3,6A3,Ngữ văn;" +
        "2,1,6A1,Toán;2,1,6A2,Toán;2,1,6A3,Toán;2,2,6A1,KHTN;2,2,6A2,KHTN;" +
        "3,1,6A3,LS-ĐL;3,1,6A1,LS-ĐL;3,2,6A2,Ngữ văn;3,2,6A3,Ngữ văn";

    return {
        share: 1,
        books: { 'Toán': 20, 'Ngữ văn': 16, 'KHTN': 14, 'LS-ĐL': 10 },
        cl,
        need,
        lessons: L.split(';').map(x => {
            const a = x.split(',');
            return { d: +a[0], p: +a[1], c: a[2], s: a[3] };
        }),
        st: {},
    };
};

try {
    S = JSON.parse(localStorage.getItem('sach_v1'));
} catch (e) {}
S = S || mk();

const save = () => {
    try {
        localStorage.setItem('sach_v1', JSON.stringify(S));
    } catch (e) {}
};

// ---------------------------------------------------------------------------
// Thuật toán: mỗi tiết, mỗi quyển được giao lần lượt cho lớp có tỷ lệ được
// phục vụ (tích lũy) thấp nhất còn thiếu sách => công bằng max-min.
// ---------------------------------------------------------------------------
function solve() {
    const cov = {},
        dem = {},
        R = [],
        sl = {};

    // Gom các tiết theo khung (ngày * 10 + tiết)
    S.lessons.forEach(l =>
        (sl[l.d * 10 + l.p] = sl[l.d * 10 + l.p] || []).push(l)
    );

    Object.keys(sl)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach(k => {
            // Trong mỗi khung, gom theo môn
            const bs = {};
            sl[k].forEach(l => (bs[l.s] = bs[l.s] || []).push(l));

            for (const s in bs) {
                let cap = (S.books[s] || 0) * S.share;
                const A = bs[s].map(l => ({
                    l,
                    n: +S.need[l.c + '|' + s] || 0,
                    g: 0,
                }));

                A.forEach(x => {
                    const q = x.l.c + '|' + s;
                    dem[q] = (dem[q] || 0) + x.n;
                    cov[q] = cov[q] || 0;
                });

                while (cap > 0) {
                    let b = null,
                        br = 9,
                        bm = 0;

                    for (const x of A) {
                        if (x.g >= x.n) continue;
                        const q = x.l.c + '|' + s,
                            r = (cov[q] + x.g) / (dem[q] || 1),
                            m = x.n - x.g;
                        if (r < br || (r == br && m > bm)) {
                            br = r;
                            bm = m;
                            b = x;
                        }
                    }

                    if (!b) break;
                    b.g++;
                    cap--;
                }

                A.forEach(x => {
                    cov[x.l.c + '|' + s] += x.g;
                    R.push({
                        ...x.l,
                        need: x.n,
                        give: x.g,
                        id: [x.l.d, x.l.p, x.l.c, x.l.s].join('-'),
                    });
                });
            }
        });

    return R;
}

// ---------------------------------------------------------------------------
// Tiện ích
// ---------------------------------------------------------------------------
const vis = R =>
    R.filter(x => role == 'lib' || (role == 'cn' ? x.c == flt : x.s == flt)).sort(
        (a, b) => a.d - b.d || a.p - b.p
    );

const bk = x => Math.ceil(x.give / S.share),
    stt = x => S.st[x.id] || 0;

function opts(a, v) {
    return a.map(o => `<option ${o == v ? 'selected' : ''}>${o}</option>`).join('');
}

function remind(R) {
    const L = vis(R),
        day = L.filter(x => x.d == today),
        od = L.filter(x => x.d < today && stt(x) < 2 && x.give > 0);

    let t =
        (role == 'lib' ?
            '📚 Thủ thư' :
            role == 'cn' ?
            '📚 GVCN lớp ' + flt :
            '📚 GV bộ môn ' + flt) +
        ' – Nhắc lịch ' +
        D[today] +
        '\n';

    t += day.length ?
        day
        .map(
            x =>
            `- Tiết ${x.p}: ${
              role == 'lib'
                ? `xuất ${bk(x)} quyển ${x.s} cho lớp ${x.c}`
                : `lớp ${x.c} nhận ${bk(x)} quyển ${x.s} tại thư viện`
            } (${x.give}/${x.need} HS có sách; trả lại cuối tiết)`
        )
        .join('\n')
    : '- Không có tiết cần sách.';

  if (od.length)
    t +=
      '\n\n⚠ Chưa ghi nhận trả:\n' +
      od.map(x => `- ${D[x.d]} tiết ${x.p}: ${x.c} – ${bk(x)} quyển ${x.s}`).join('\n');

  t += '\n\nGợi ý: luân phiên học sinh dùng sách để mỗi em đều có lượt.';
  return t;
}

// ---------------------------------------------------------------------------
// Giao diện
// ---------------------------------------------------------------------------
function render() {
  const R = solve(),
    subs = Object.keys(S.books),
    tot = R.reduce((a, x) => a + x.need, 0),
    got = R.reduce((a, x) => a + x.give, 0),
    L = vis(R),
    fo = role == 'cn' ? S.cl : subs;

  if (role != 'lib' && !fo.includes(flt)) flt = fo[0];

  // Tổng nhu cầu / được phục vụ theo lớp
  const cc = {};
  R.forEach(x => {
    const c = (cc[x.c] = cc[x.c] || { n: 0, g: 0 });
    c.n += x.need;
    c.g += x.give;
  });

  // --- Khung chung: KPI, thanh vai trò, tab ---
  let h = `<div class="kp"><div class="k"><b>${tot ? Math.round((got / tot) * 100) : 0}%</b><span>lượt HS có sách / nhu cầu</span></div><div class="k"><b>${got}/${tot}</b><span>lượt HS được phục vụ</span></div><div class="k"><b class="${tot - got ? 'wa' : ''}">${tot - got}</b><span>lượt HS còn thiếu</span></div><div class="k"><b>${R.filter(x => x.give > 0 && stt(x) == 1).length}</b><span>suất đang mượn</span></div></div>
<div class="bar"><label>Vai trò <select id="role"><option value="lib" ${role == 'lib' ? 'selected' : ''}>Phụ trách sách / thư viện</option><option value="cn" ${role == 'cn' ? 'selected' : ''}>GV chủ nhiệm</option><option value="bm" ${role == 'bm' ? 'selected' : ''}>GV bộ môn</option></select></label>${
    role != 'lib' ? `<select id="flt">${opts(fo, flt)}</select>` : ''
  }<label>Dùng chung <select id="sh">${[1, 2, 3]
    .map(n => `<option value="${n}" ${S.share == n ? 'selected' : ''}>${n} HS/quyển</option>`)
    .join('')}</select></label></div>
<div class="tabs bar" style="margin:0;gap:4px">${['Lịch & theo dõi', 'Nhắc lịch', 'Dữ liệu']
    .map((t, i) => `<button data-a="tab" data-v="${i}" class="${tab == i ? 'on' : ''}">${t}</button>`)
    .join('')}</div><div class="box" style="border-radius:0 10px 10px 10px">`;

  // --- Tab 0: Lịch & theo dõi ---
  if (tab == 0) {
    if (tot - got > 0)
      h += `<div class="al">Còn ${tot - got} lượt HS chưa có sách. Thử tăng "HS/quyển", dùng sách số chính thống (Tầng 1) hoặc xin phép nhà xuất bản (Tầng 3).</div>`;

    h +=
      '<h2 style="margin-top:0">Độ phủ theo lớp</h2>' +
      Object.keys(cc)
        .map(c => {
          const p = cc[c].n ? Math.round((cc[c].g / cc[c].n) * 100) : 0;
          return `<div class="cv"><span>${c}</span><div class="pg"><i style="width:${p}%"></i></div><b>${p}%</b></div>`;
        })
        .join('');

    h += `<h2>Lịch mượn–trả</h2><div class="ov"><table><tr><th>Tiết</th><th>Lớp</th><th>Môn</th><th>HS thiếu</th><th>HS có sách</th><th>Số quyển</th><th>Trạng thái</th></tr>${
      L.map(
        x =>
          `<tr><td>${D[x.d]} · tiết ${x.p}</td><td>${x.c}</td><td>${x.s}</td><td>${x.need}</td><td class="${x.give < x.need ? 'wa' : ''}">${x.give}</td><td>${bk(x)}</td><td>${
            x.give
              ? `<button class="st${stt(x)}" data-a="st" data-v="${x.id}">${LB[stt(x)]}</button>`
              : '–'
          }</td></tr>`
      ).join('') || '<tr><td colspan=7>Chưa có tiết học nào.</td></tr>'
    }</table></div><p class="mu">Bấm vào trạng thái để chuyển: Chưa phát → Đang mượn → Đã trả.</p>`;
  }

  // --- Tab 1: Nhắc lịch ---
  if (tab == 1)
    h += `<div class="bar"><label>Ngày <select id="td">${D.map(
      (d, i) => `<option value="${i}" ${today == i ? 'selected' : ''}>${d}</option>`
    ).join('')}</select></label><button class="pri" data-a="cp">Sao chép tin nhắn</button></div><textarea id="tx" readonly>${remind(R)}</textarea><p class="mu">Dán vào Zalo/nhóm lớp. Mục "Chưa ghi nhận trả" lấy từ bảng theo dõi.</p>`;

  // --- Tab 2: Dữ liệu ---
  if (tab == 2) {
    h += `<h2 style="margin-top:0">Số quyển sách trường đang có</h2><div class="bar">${subs
      .map(
        s =>
          `<label>${s} <input type="number" min="0" data-a="bk" data-v="${s}" value="${S.books[s]}"></label>`
      )
      .join('')}</div>
<h2>Số HS thiếu sách theo lớp</h2><div class="ov"><table><tr><th>Lớp</th>${subs
      .map(s => `<th>${s}</th>`)
      .join('')}</tr>${S.cl
      .map(
        c =>
          `<tr><td>${c}</td>${subs
            .map(
              s =>
                `<td><input type="number" min="0" data-a="nd" data-v="${c}|${s}" value="${S.need[c + '|' + s] || 0}"></td>`
            )
            .join('')}</tr>`
      )
      .join('')}</table></div>
<div class="bar" style="margin-top:8px"><input id="ncl" placeholder="Tên lớp mới" size="10"><button data-a="acl">Thêm lớp</button></div>
<h2>Thời khóa biểu cần sách</h2><div class="bar"><select id="nd">${opts(D)}</select><select id="np">${[1, 2, 3, 4, 5, 6, 7, 8]
      .map(n => `<option value="${n}">Tiết ${n}</option>`)
      .join('')}</select><select id="nc">${opts(S.cl)}</select><select id="ns">${opts(subs)}</select><button data-a="al">Thêm tiết</button></div>
<div class="ov"><table>${S.lessons
      .map(
        (l, i) =>
          `<tr><td>${D[l.d]} · tiết ${l.p}</td><td>${l.c}</td><td>${l.s}</td><td><button data-a="dl" data-v="${i}">Xóa</button></td></tr>`
      )
      .join('')}</table></div>
<div class="bar" style="margin-top:10px"><button data-a="rs">Nạp lại dữ liệu mẫu</button></div><p class="mu">Dữ liệu lưu trên trình duyệt này. Thuật toán: mỗi tiết, từng quyển được giao cho lớp đang có tỷ lệ phục vụ tích lũy thấp nhất, nên không lớp nào bị bỏ rơi.</p>`;
  }

  $('#app').innerHTML = h + '</div>';
}

// ---------------------------------------------------------------------------
// Sự kiện
// ---------------------------------------------------------------------------
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]');
  if (!b) return;

  const a = b.dataset.a,
    v = b.dataset.v;

  if (a == 'tab') {
    tab = +v;
  } else if (a == 'st') {
    S.st[v] = ((S.st[v] || 0) + 1) % 3;
  } else if (a == 'dl') {
    S.lessons.splice(+v, 1);
  } else if (a == 'al') {
    S.lessons.push({
      d: +$('#nd').selectedIndex,
      p: +$('#np').value,
      c: $('#nc').value,
      s: $('#ns').value,
    });
  } else if (a == 'acl') {
    const n = $('#ncl').value.trim();
    if (n && !S.cl.includes(n)) S.cl.push(n);
  } else if (a == 'rs') {
    S = mk();
  } else if (a == 'cp') {
    const t = $('#tx');
    t.select();
    try {
      navigator.clipboard.writeText(t.value);
    } catch (x) {
      try {
        document.execCommand('copy');
      } catch (y) {}
    }
    b.textContent = 'Đã sao chép';
    return;
  }

  save();
  render();
});

document.addEventListener('change', e => {
  const t = e.target,
    a = t.dataset.a;

  if (t.id == 'role') {
    role = t.value;
    flt = '';
  } else if (t.id == 'flt') {
    flt = t.value;
  } else if (t.id == 'sh') {
    S.share = +t.value;
  } else if (t.id == 'td') {
    today = +t.value;
  } else if (a == 'bk') {
    S.books[t.dataset.v] = Math.max(0, +t.value || 0);
  } else if (a == 'nd') {
    S.need[t.dataset.v] = Math.max(0, +t.value || 0);
  } else {
    return;
  }

  save();
  render();
});

render();