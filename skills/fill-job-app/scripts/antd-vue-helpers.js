// 北森（Ant Design Vue v1）网申表单辅助函数
// 用法：把本文件全文作为 chrome-devtools MCP evaluate_script 的 function 参数传入，
//       注入后调用 window._pickEl / window._radio 等。页面导航后需重新注入。
async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  window._sleep = sleep;

  // ---------- 下拉：元素作用域（推荐） ----------
  window._openEl = async (s) => {
    if (!s) return null;
    const selEl = s.querySelector('.ant-select-selection');
    if (!selEl) return null;
    ['mousedown', 'mouseup', 'click'].forEach((t) =>
      selEl.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }))
    );
    await sleep(600);
    const dds = [...document.querySelectorAll('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')];
    return dds[dds.length - 1] || null;
  };

  window._readOptionsEl = async (s, cap = 40) => {
    const dd = await window._openEl(s);
    if (!dd) return ['<no dropdown>'];
    const opts = [...dd.querySelectorAll('.ant-select-dropdown-menu-item')].map((e) => e.textContent.trim());
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await sleep(250);
    return opts.slice(0, cap);
  };

  window._pickEl = async (s, optText) => {
    const dd = await window._openEl(s);
    if (!dd) return 'NO_DROPDOWN';
    const items = [...dd.querySelectorAll('.ant-select-dropdown-menu-item')];
    const hit =
      items.find((el) => el.textContent.trim() === optText) ||
      items.find((el) => el.textContent.trim().includes(optText));
    if (!hit) return 'NO_OPTION: ' + items.map((e) => e.textContent.trim()).slice(0, 30).join('|');
    ['mousedown', 'mouseup', 'click'].forEach((t) =>
      hit.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }))
    );
    await sleep(400);
    const shown = (s.querySelector('.ant-select-selection').textContent || '').replace(/\s+/g, ' ').trim();
    return 'OK=>' + shown.slice(0, 40);
  };

  // ---------- 下拉：全局索引版（条目增删后索引会偏移，慎用） ----------
  window._sel = (i) => [...document.querySelectorAll('.ant-select')][i];
  window._open = async (i) => window._openEl(window._sel(i));
  window._readOptions = async (i, cap) => window._readOptionsEl(window._sel(i), cap);
  window._pick = async (i, optText) => window._pickEl(window._sel(i), optText);

  // ---------- 可搜索下拉（专业/院校等，远程加载选项） ----------
  // sOrI: .ant-select 元素或全局索引；query: 搜索词；optText: 目标选项文本（精确或包含匹配）
  window._searchPick = async (sOrI, query, optText) => {
    const s = typeof sOrI === 'number' ? window._sel(sOrI) : sOrI;
    let dd = await window._openEl(s);
    if (!dd) return 'NO_DROPDOWN';
    const inp = dd.querySelector('input') || (s && s.querySelector('input.ant-select-search__field'));
    if (inp && query) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(inp, query);
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(1500);
      const dds = [...document.querySelectorAll('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')];
      dd = dds[dds.length - 1] || dd;
    }
    const items = [...dd.querySelectorAll('.ant-select-dropdown-menu-item')];
    const hit =
      items.find((el) => el.textContent.trim() === optText) ||
      items.find((el) => el.textContent.trim().includes(optText));
    if (!hit) return 'NO_OPTION(' + query + '): ' + items.map((e) => e.textContent.trim()).slice(0, 45).join('|');
    ['mousedown', 'mouseup', 'click'].forEach((t) =>
      hit.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }))
    );
    await sleep(500);
    const shown = (s.querySelector('.ant-select-selection').textContent || '').replace(/\s+/g, ' ').trim();
    return 'OK=> ' + shown.slice(0, 50);
  };

  // ---------- 文本输入（合成设值可能不触发 Vue 校验；关键字段用真实键盘复核） ----------
  window._setVal = (el, val) => {
    if (!el) return 'NO_EL';
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement : HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value').set;
    setter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return (el.value || '').slice(0, 15);
  };

  // 按 placeholder 找第一个可见输入并设值（应急；配 focus + Ctrl+A + 真实键盘复核）
  window._fill = (ph, val) => {
    const el = [...document.querySelectorAll('input,textarea')].find(
      (x) => (x.placeholder || '').includes(ph) && !x.readOnly
    );
    return el ? window._setVal(el, val) : 'NO_INPUT:' + ph;
  };

  // ---------- 日期 ----------
  // 往打开的日历面板输入框输值 + Enter（readonly 外层输入框不能直接设值）
  window._setDateEl = async (el, val) => {
    if (!el) return 'NO_EL';
    ['mousedown', 'mouseup', 'click'].forEach((t) =>
      el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }))
    );
    await sleep(600);
    const conts = [...document.querySelectorAll('.ant-calendar-picker-container')].filter(
      (c) => !/hidden/.test(c.className)
    );
    const cont = conts[conts.length - 1];
    const pin = cont && cont.querySelector('input.ant-calendar-input');
    if (!pin) return 'NO_PANEL';
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(pin, val);
    pin.dispatchEvent(new Event('input', { bubbles: true }));
    pin.dispatchEvent(new Event('change', { bubbles: true }));
    pin.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', keyCode: 13, which: 13 }));
    await sleep(500);
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await sleep(200);
    return el.value;
  };

  window._clearDateEl = async (el) => {
    if (!el) return 'NO_EL';
    if (!el.value) return 'ALREADY_EMPTY';
    const wrap = el.closest('.ant-calendar-picker') || el.parentElement;
    wrap.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    await sleep(200);
    const clear = wrap.querySelector('.ant-calendar-picker-clear');
    if (clear) {
      ['mousedown', 'mouseup', 'click'].forEach((t) =>
        clear.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }))
      );
      await sleep(300);
    }
    if (!el.value) return 'CLEARED';
    // 兜底：打开面板、清空输入框再 Enter
    ['mousedown', 'mouseup', 'click'].forEach((t) =>
      el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }))
    );
    await sleep(600);
    const conts = [...document.querySelectorAll('.ant-calendar-picker-container')].filter(
      (c) => !/hidden/.test(c.className)
    );
    const cont = conts[conts.length - 1];
    const pin = cont && cont.querySelector('input.ant-calendar-input');
    if (pin) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(pin, '');
      pin.dispatchEvent(new Event('input', { bubbles: true }));
      pin.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', keyCode: 13, which: 13 }));
      await sleep(400);
    }
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await sleep(200);
    return el.value ? 'STILL:' + el.value : 'CLEARED2';
  };

  // ---------- 单选 ----------
  // 按表单项 label 文本找组，再点选项文本（如 _radio('性别', '男')）
  window._radio = (groupLabel, optText) => {
    const row = [...document.querySelectorAll('.ant-form-item')].find((r) => {
      const lab = r.querySelector('.ant-form-item-label');
      return lab && lab.textContent.includes(groupLabel);
    });
    if (!row) return 'NO_ROW:' + groupLabel;
    const wraps = [...row.querySelectorAll('.ant-radio-wrapper')];
    const wrap = wraps.find((w) => w.textContent.trim() === optText);
    if (!wrap) return 'NO_OPT:' + groupLabel + ' => ' + wraps.map((w) => w.textContent.trim()).join(',');
    wrap.click();
    const inp = wrap.querySelector('input');
    if (inp && !inp.checked) inp.click();
    return 'RADIO:' + groupLabel + '=' + optText + ' checked=' + (inp ? inp.checked : '?');
  };

  // ---------- 条目容器 ----------
  // 按内部文本定位经历/技能条目（如 _cells('实习地点')）
  window._cells = (scanText) =>
    [...document.querySelectorAll('.form-cell-inner')].filter((c) => c.textContent.includes(scanText));

  return 'helpers ready';
}
