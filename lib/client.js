window.__ModuleLoader__.load({
  id: "dsh-workspace-hub",
  factory: (require) => {
    // dsh-workspace-hub — browser half.
    // ModuleLoader handoff bundle: registration only; the body runs at
    // materialization inside the factory (window.__ModuleLoader__.load contract).
    'use strict'
    const React = require('react')
    
    // Host RPC over HTTP (the sandbox 'host.call' does not exist in shipped packages).
    function hostCall(method, payload) {
      if (typeof fetch === 'undefined') return Promise.reject(new Error('wsfm: fetch unavailable'))
      return fetch('/api/wsfm/' + method, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload || {}),
      }).then((res) => {
        if (!res.ok) throw new Error('wsfm: HTTP ' + res.status)
        return res.json()
      })
    }
    
    ﻿const STORAGE_KEY = 'dsh.wsFolders.v1'
    const MIME = 'application/x-wsfm'
    const BEFORE_BIAS = 0.75
    const FOLDER_COLORS = ['#7aa2f7', '#9ece6a', '#e0af68', '#bb9af7', '#f7768e', '#2ac3de', '#73daca', '#ff9e64']
    const IC_CHEVRON = 'M6 9l6 6 6-6'
    const IC_PLUS = 'M12 5v14M5 12h14'
    const IC_CLOSE = 'M6 6l12 12M18 6L6 18'
    const IC_CHECK = 'M4 12l5 5L20 6'
    const IC_PENCIL = 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'
    const IC_TRASH = 'M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6'
    const IC_FOLDER = 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'
    const IC_FORK = 'M7 3v9a3 3 0 0 0 3 3h7M14 11l3 4-3 4'
    const IC_ARCHIVE = 'M3 5h18v4H3zM5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4'
    const IC_SEARCH = 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3'
    const IC_SESSION = 'M21 12a9 9 0 1 1-9-9M21 3l-9 9M15 3h6v6'
    const IC_MOVE = 'M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4'
    const IC_UNFOLD = 'M7 13l5 5 5-5M7 6l5 5 5-5'
    const IC_FOLD = 'M7 11l5-5 5 5M7 18l5-5 5 5'
    const IC_CHART = 'M4 20v-7M10 20V6M16 20v-4M3 20h18'
    const PRICE_KEY = 'dsh.wsPrices.v1'
    const REF_PRICES = {
      'deepseek/deepseek-v4-flash': { input: 1.5, cacheRead: 0.05, output: 4.5, inputPeak: 3.0, cacheReadPeak: 0.1, outputPeak: 9.0 },
      'deepseek/deepseek-v4-pro': { input: 4.5, cacheRead: 0.15, output: 13.5, inputPeak: 9.0, cacheReadPeak: 0.3, outputPeak: 27.0 },
    }
    const IC_GEAR = 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19.4 12a7.4 7.4 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7.4 7.4 0 0 0-2-1.2L14.7 3h-4l-.3 2.7a7.4 7.4 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7.4 7.4 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7.4 7.4 0 0 0 2 1.2l.3 2.7h4l.3-2.7a7.4 7.4 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.07-.4.1-.8.1-1.2z'
    const IC_BACK = 'M19 12H5M12 19l-7-7 7-7'
    const IC_RESET = 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15'
    
    const CSS = `
    .wsfm-root{display:flex;flex-direction:column;height:100%;min-height:0;font-size:12px;line-height:1.45;color:var(--dsw-alias-label-primary,#e7e9ee);font-family:"Segoe UI Variable Text","Segoe UI",-apple-system,"PingFang SC","Microsoft YaHei UI",sans-serif}
    .wsfm-head{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:9px 12px 7px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(148,163,184,.12))}
    .wsfm-title{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;letter-spacing:.02em;color:var(--dsw-alias-label-primary,#e7e9ee)}
    .wsfm-title-chip{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;background:var(--dsw-alias-button-primary-dimmed,rgba(110,168,255,.14));color:var(--dsw-alias-brand-primary,#6ea8ff)}
    .wsfm-head-actions{display:flex;align-items:center;gap:2px}
    .wsfm-hbtn{display:inline-flex;align-items:center;gap:4px;padding:3px 7px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary,#b8bfcc);cursor:pointer;font-size:11.5px;font-family:inherit;white-space:nowrap;transition:background .12s ease,color .12s ease,border-color .12s ease}
    .wsfm-hbtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.1));color:var(--dsw-alias-label-primary,#e7e9ee)}
    .wsfm-hbtn-primary{background:var(--dsw-alias-button-primary-dimmed,rgba(110,168,255,.14));color:var(--dsw-alias-brand-primary,#6ea8ff);border-color:rgba(110,168,255,.2)}
    .wsfm-hbtn-primary:hover{background:var(--dsw-alias-button-primary-hover,rgba(110,168,255,.24))}
    .wsfm-hbtn-on{background:var(--dsw-alias-button-primary-hover,rgba(110,168,255,.24));color:var(--dsw-alias-brand-primary,#6ea8ff);border-color:rgba(110,168,255,.35)}
    .wsfm-hbtn-ic{display:inline-flex;align-items:center;justify-content:center;width:26px;height:24px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary,#b8bfcc);cursor:pointer;padding:0;transition:background .12s ease,color .12s ease,border-color .12s ease}
    .wsfm-hbtn-ic:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.1));color:var(--dsw-alias-label-primary,#e7e9ee)}
    .wsfm-hbtn-ic.on{color:var(--dsw-alias-brand-primary,#6ea8ff);background:var(--dsw-alias-button-primary-dimmed,rgba(110,168,255,.14))}
    .wsfm-srch{display:flex;align-items:center;gap:6px;margin:8px 12px 2px;padding:0 9px;border:1px solid var(--dsw-alias-border-l1,rgba(148,163,184,.18));border-radius:8px;background:var(--dsw-alias-bg-layer-1,rgba(148,163,184,.07));color:var(--dsw-alias-label-tertiary,#9aa3b2);transition:border-color .15s ease,box-shadow .15s ease}
    .wsfm-srch:focus-within{border-color:var(--dsw-alias-brand-primary,#6ea8ff);box-shadow:0 0 0 3px rgba(110,168,255,.13)}
    .wsfm-srch input{flex:1;min-width:0;padding:5px 0;border:none;background:transparent;color:inherit;font-size:11.5px;font-family:inherit;outline:none}
    .wsfm-srch input::placeholder{color:var(--dsw-alias-label-tertiary,#9aa3b2)}
    .wsfm-clear{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border:none;border-radius:4px;background:transparent;color:var(--dsw-alias-label-tertiary,#9aa3b2);cursor:pointer;padding:0}
    .wsfm-clear:hover{color:var(--dsw-alias-label-primary,#e7e9ee);background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.12))}
    .wsfm-tree{flex:1;overflow-y:auto;padding:6px 10px 16px}
    .wsfm-fcard{position:relative;background:var(--dsw-alias-bg-layer-1,rgba(148,163,184,.05));border:1px solid var(--dsw-alias-border-l1,rgba(148,163,184,.12));border-radius:10px;padding:2px;margin-bottom:6px;animation:wsfm-rise .28s ease both;transition:border-color .15s ease,background .15s ease;cursor:grab}
    .wsfm-fcard:active{cursor:grabbing}
    .wsfm-fcard:hover{border-color:var(--dsw-alias-border-l2,rgba(148,163,184,.26))}
    .wsfm-fcard.wsfm-dragging{opacity:.45}
    @keyframes wsfm-rise{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
    .wsfm-fhead{position:relative;display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:8px;cursor:pointer;user-select:none;min-height:26px;border:1px dashed transparent;transition:background .12s ease}
    .wsfm-fhead:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.08))}
    .wsfm-fhead.wsfm-drop{border-color:var(--dsw-alias-brand-primary,#6ea8ff);background:var(--dsw-alias-button-primary-dimmed,rgba(110,168,255,.14))}
    .wsfm-chev{transition:transform .18s ease;color:var(--dsw-alias-label-tertiary,#9aa3b2);flex:none}
    .wsfm-chev.closed{transform:rotate(-90deg)}
    .wsfm-dot{width:7px;height:7px;border-radius:50%;flex:none;box-shadow:0 0 0 2px rgba(148,163,184,.12)}
    .wsfm-fname{font-weight:650;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
    .wsfm-count{min-width:26px;box-sizing:border-box;text-align:center;font-size:10px;color:var(--dsw-alias-label-tertiary,#9aa3b2);background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.1));border-radius:99px;padding:1px 6px;flex:none;font-variant-numeric:tabular-nums}
    .wsfm-facts{visibility:hidden;opacity:0;display:flex;align-items:center;gap:1px;transition:opacity .12s ease}
    .wsfm-fhead:hover .wsfm-facts{visibility:visible;opacity:1}
    .wsfm-wlist{padding:1px 1px 3px 8px}
    .wsfm-ws{position:relative;border-radius:8px;cursor:grab}
    .wsfm-ws:active{cursor:grabbing}
    .wsfm-ws-target{background:var(--dsw-alias-interactive-bg-active,rgba(110,168,255,.1))}
    .wsfm-whead{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:8px;cursor:pointer;user-select:none;transition:background .12s ease}
    .wsfm-whead:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.08))}
    .wsfm-wav{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:6px;font-size:10px;font-weight:700;flex:none}
    .wsfm-wmid{flex:1;min-width:0}
    .wsfm-wtitle{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:1.3}
    .wsfm-tokline{margin-top:1px;display:flex;align-items:center;line-height:1.3}
    .wsfm-wacts{visibility:hidden;opacity:0;display:flex;align-items:center;gap:1px;transition:opacity .12s ease}
    .wsfm-whead:hover .wsfm-wacts{visibility:visible;opacity:1}
    .wsfm-ws-hovered{background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.08))}
    .wsfm-slist{margin:3px 0 5px 6px;padding:3px 0 3px 8px}
    .wsfm-sess{position:relative;display:flex;align-items:center;gap:8px;padding:5px 7px;border-radius:8px;cursor:grab;margin:2px 0;transition:background .12s ease}
    .wsfm-sess:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.08))}
    .wsfm-sess.current{background:var(--dsw-alias-interactive-bg-active,rgba(110,168,255,.13))}
    .wsfm-sess-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px}
    .wsfm-sess-tag{font-size:9.5px;color:var(--dsw-alias-label-tertiary,#9aa3b2);border:1px dashed var(--dsw-alias-border-l1,rgba(148,163,184,.3));border-radius:4px;padding:0 4px;flex:none}
    .wsfm-sacts{visibility:hidden;opacity:0;display:flex;align-items:center;gap:1px;transition:opacity .12s ease}
    .wsfm-sess:hover .wsfm-sacts{visibility:visible;opacity:1}
    .wsfm-ic{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#b8bfcc);cursor:pointer;padding:0;transition:background .12s ease,color .12s ease}
    .wsfm-ic:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.14));color:var(--dsw-alias-label-primary,#e7e9ee)}
    .wsfm-ic.danger:hover{color:var(--dsw-alias-state-error-primary,#ff7a7a);background:rgba(255,122,122,.12)}
    .wsfm-ic.ok:hover{color:var(--dsw-alias-state-success-primary,#4ade80);background:rgba(74,222,128,.12)}
    .wsfm-ic.mbtn-open{color:var(--dsw-alias-brand-primary,#6ea8ff);background:var(--dsw-alias-button-primary-dimmed,rgba(110,168,255,.16))}
    .wsfm-st{width:7px;height:7px;border-radius:50%;flex:none;transition:transform .15s ease}
    .wsfm-sess:hover .wsfm-st{transform:scale(1.25)}
    .wsfm-st.run{background:var(--dsw-alias-brand-primary,#6ea8ff);box-shadow:0 0 0 3px rgba(110,168,255,.2)}
    .wsfm-st.done{background:var(--dsw-alias-state-success-primary,#4ade80);box-shadow:0 0 0 3px rgba(74,222,128,.16)}
    .wsfm-st.ask{background:var(--dsw-alias-state-warn-primary,#fbbf24);box-shadow:0 0 0 3px rgba(251,191,36,.16)}
    .wsfm-st.idle{background:var(--dsw-alias-label-tertiary,#9aa3b2);opacity:.5}
    .wsfm-sec{display:flex;align-items:center;gap:8px;padding:8px 4px 4px;font-size:10px;color:var(--dsw-alias-label-tertiary,#9aa3b2);font-weight:700;letter-spacing:.08em;text-transform:uppercase}
    .wsfm-sec::after{content:'';flex:1;height:1px;background:var(--dsw-alias-border-l1,rgba(148,163,184,.14))}
    .wsfm-empty{padding:28px 16px;text-align:center;color:var(--dsw-alias-label-tertiary,#9aa3b2);font-size:11.5px;display:flex;flex-direction:column;align-items:center;gap:8px}
    .wsfm-empty-ic{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-button-primary-dimmed,rgba(110,168,255,.12));color:var(--dsw-alias-brand-primary,#6ea8ff)}
    .wsfm-empty b{color:var(--dsw-alias-label-secondary,#b8bfcc);font-weight:600}
    .wsfm-snip{font-size:10.5px;color:var(--dsw-alias-label-secondary,#b8bfcc);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:110px;flex:none}
    .wsfm-rail{display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 5px;overflow-y:auto}
    .wsfm-rail-btn{position:relative;width:30px;height:30px;border:none;border-radius:9px;background:transparent;color:var(--dsw-alias-label-secondary,#b8bfcc);cursor:pointer;font-size:12px;font-weight:700;font-family:inherit;transition:background .12s ease,transform .12s ease}
    .wsfm-rail-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.12));color:var(--dsw-alias-label-primary,#e7e9ee);transform:translateY(-1px)}
    .wsfm-rail-dot{position:absolute;top:4px;right:4px;width:5px;height:5px;border-radius:50%}
    .wsfm-inline{flex:1;min-width:0;font-size:11.5px;font-family:inherit;color:inherit;background:var(--dsw-alias-bg-layer-2,rgba(0,0,0,.15));border:1px solid var(--dsw-alias-brand-primary,#6ea8ff);border-radius:7px;padding:3px 7px;outline:none;box-shadow:0 0 0 3px rgba(110,168,255,.12)}
    .wsfm-newrow{display:flex;align-items:center;gap:4px;padding:4px 6px;border-radius:9px;margin:2px 0 6px;background:var(--dsw-alias-button-primary-dimmed,rgba(110,168,255,.1));border:1px dashed var(--dsw-alias-border-l2,rgba(148,163,184,.35));color:var(--dsw-alias-brand-primary,#6ea8ff);animation:wsfm-rise .22s ease both}
    .wsfm-menu{position:absolute;right:2px;top:calc(100% - 2px);z-index:60;min-width:132px;max-width:190px;background:var(--dsw-alias-bg-overlay,#1c1d21);border:1px solid var(--dsw-alias-border-l2,rgba(148,163,184,.3));border-radius:9px;padding:4px;box-shadow:0 8px 24px rgba(0,0,0,.35);animation:wsfm-rise .15s ease both}
    .wsfm-menu-item{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:6px;cursor:pointer;font-size:11.5px;color:var(--dsw-alias-label-secondary,#b8bfcc);white-space:nowrap}
    .wsfm-menu-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.12));color:var(--dsw-alias-label-primary,#e7e9ee)}
    .wsfm-menu-item.cur{color:var(--dsw-alias-brand-primary,#6ea8ff)}
    .wsfm-menu-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
    .wsfm-menu-check{color:var(--dsw-alias-brand-primary,#6ea8ff);flex:none}
    .wsfm-floatline{position:fixed;height:2px;border-radius:2px;background:var(--dsw-alias-brand-primary,#6ea8ff);box-shadow:0 0 8px rgba(110,168,255,.6);pointer-events:none;z-index:2147483000;transition:top .05s linear}
    .wsfm-tokwrap{position:relative;flex:none;display:inline-flex;align-items:center}
    .wsfm-tok{font-size:10px;color:var(--dsw-alias-label-tertiary,#9aa3b2);padding:1px 5px;border-radius:6px;cursor:default;font-variant-numeric:tabular-nums;white-space:nowrap}
    .wsfm-tokwrap:hover .wsfm-tok{color:var(--dsw-alias-brand-primary,#6ea8ff);background:var(--dsw-alias-button-primary-dimmed,rgba(110,168,255,.12))}
    .wsfm-tokpop{position:fixed;z-index:2147483000;min-width:240px;max-width:320px;max-height:min(340px,60vh);overflow-y:auto;background:var(--dsw-alias-bg-overlay,#1c1d21);border:1px solid var(--dsw-alias-border-l2,rgba(148,163,184,.3));border-radius:10px;padding:8px 10px;box-shadow:0 12px 32px rgba(0,0,0,.45);font-size:11.5px;color:var(--dsw-alias-label-primary,#e7e9ee);animation:wsfm-rise .15s ease both}
    .wsfm-tokpop-title{font-weight:700;font-size:11px;margin-bottom:5px;color:var(--dsw-alias-label-secondary,#b8bfcc)}
    .wsfm-tokpop-row{display:flex;justify-content:space-between;align-items:center;padding:2px 0}
    .wsfm-tokpop-row b{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary,#e7e9ee)}
    .wsfm-tokpop-sec{font-size:10px;color:var(--dsw-alias-label-tertiary,#9aa3b2);margin:6px 0 3px;font-weight:600}
    .wsfm-tokpop-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;padding:2px 0}
    .wsfm-tokpop-cell{display:flex;justify-content:space-between;font-size:11px;color:var(--dsw-alias-label-secondary,#b8bfcc);font-variant-numeric:tabular-nums}
    .wsfm-tokpop-sess{display:flex;align-items:center;gap:6px;padding:2px 0;font-size:11px;color:var(--dsw-alias-label-secondary,#b8bfcc);cursor:pointer}
    .wsfm-tokpop-sess:hover{color:var(--dsw-alias-brand-primary,#6ea8ff)}
    .wsfm-tokpop-sess-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .wsfm-tokpop-sess-tok{flex:none;font-variant-numeric:tabular-nums}
    .wsfm-tokpop-arch{font-size:9px;color:var(--dsw-alias-label-tertiary,#9aa3b2);border:1px dashed var(--dsw-alias-border-l1,rgba(148,163,184,.3));border-radius:4px;padding:0 3px;flex:none}
    .wsfm-panel-scrim{position:fixed;inset:0;background:rgba(0,0,0,.32);z-index:2147482900;pointer-events:auto;animation:wsfm-fade .15s ease}
    .wsfm-panel{position:fixed;top:0;right:0;bottom:0;width:430px;max-width:92vw;z-index:2147482990;pointer-events:auto;display:flex;flex-direction:column;background:var(--dsw-alias-bg-overlay,#1c1d21);border-left:1px solid var(--dsw-alias-border-l2,rgba(148,163,184,.3));box-shadow:-14px 0 40px rgba(0,0,0,.4);color:var(--dsw-alias-label-primary,#e7e9ee);font-size:12.5px;animation:wsfm-in .18s cubic-bezier(.2,.8,.3,1)}
    @keyframes wsfm-in{from{transform:translateX(28px);opacity:.4}to{transform:none;opacity:1}}
    @keyframes wsfm-fade{from{opacity:0}to{opacity:1}}
    .wsfm-panel-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(148,163,184,.12))}
    .wsfm-panel-title{font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px}
    .wsfm-panel-title svg{color:var(--dsw-alias-brand-primary,#6ea8ff)}
    .wsfm-panel-body{flex:1;overflow-y:auto;padding:12px 16px 24px}
    .wsfm-seg{display:inline-flex;background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.1));border-radius:8px;padding:2px;margin-top:10px}
    .wsfm-seg button{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#b8bfcc);font-size:12px;padding:4px 12px;border-radius:6px;cursor:pointer;font-family:inherit}
    .wsfm-seg button.on{background:var(--dsw-alias-button-primary-dimmed,rgba(110,168,255,.16));color:var(--dsw-alias-brand-primary,#6ea8ff)}
    .wsfm-segs{display:flex;align-items:center;gap:8px;margin-top:10px}
    .wsfm-segs .wsfm-seg{margin-top:0}
    .wsfm-summary{padding:10px 0 2px;font-size:11.5px;color:var(--dsw-alias-label-tertiary,#9aa3b2)}
    .wsfm-summary b{color:var(--dsw-alias-label-primary,#e7e9ee);font-variant-numeric:tabular-nums}
    .wsfm-psec{display:flex;align-items:center;gap:8px;padding:12px 0 6px;font-size:10.5px;color:var(--dsw-alias-label-tertiary,#9aa3b2);font-weight:700;letter-spacing:.08em;text-transform:uppercase}
    .wsfm-psec::after{content:'';flex:1;height:1px;background:var(--dsw-alias-border-l1,rgba(148,163,184,.14))}
    .wsfm-prow{display:flex;align-items:center;gap:8px;padding:5px 0}
    .wsfm-prow-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
    .wsfm-prow-sub{font-size:11px;color:var(--dsw-alias-label-tertiary,#9aa3b2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px;flex:none}
    .wsfm-prow-tok{font-size:11.5px;color:var(--dsw-alias-label-secondary,#b8bfcc);font-variant-numeric:tabular-nums;flex:none;min-width:52px;text-align:right}
    .wsfm-pbar{flex:none;width:110px;height:6px;border-radius:3px;background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.12));overflow:hidden}
    .wsfm-pbar i{display:block;height:100%;border-radius:3px;background:var(--dsw-alias-brand-primary,#6ea8ff)}
    .wsfm-prow.clickable{cursor:pointer;border-radius:7px;padding:5px 6px}
    .wsfm-prow.clickable:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.08))}
    .wsfm-psess{display:flex;align-items:center;gap:6px;padding:3px 6px 3px 16px;font-size:11px;color:var(--dsw-alias-label-secondary,#b8bfcc)}
    .wsfm-psess-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .wsfm-psess-tok{font-variant-numeric:tabular-nums;flex:none}
    .wsfm-pempty{padding:32px 0;text-align:center;color:var(--dsw-alias-label-tertiary,#9aa3b2);font-size:12px}
    .wsfm-money{font-size:10px;color:var(--dsw-alias-state-success-primary,#4ade80);font-variant-numeric:tabular-nums;margin-left:3px;opacity:.92}
    .wsfm-tokpop-right{display:flex;align-items:baseline;gap:7px}
    .wsfm-tokpop-money{font-variant-numeric:tabular-nums;color:var(--dsw-alias-state-success-primary,#4ade80)}
    .wsfm-tokpop-model{display:flex;align-items:center;gap:6px;padding:2px 0;font-size:11px;color:var(--dsw-alias-label-secondary,#b8bfcc)}
    .wsfm-tokpop-model-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .wsfm-pmoney{font-size:11px;color:var(--dsw-alias-state-success-primary,#4ade80);font-variant-numeric:tabular-nums;flex:none;min-width:64px;text-align:right}
    .wsfm-pmoney-dim{color:var(--dsw-alias-label-tertiary,#9aa3b2)}
    .wsfm-psess-money{font-variant-numeric:tabular-nums;color:var(--dsw-alias-state-success-primary,#4ade80);flex:none;min-width:56px;text-align:right}
    .wsfm-price-card{background:var(--dsw-alias-bg-layer-1,rgba(148,163,184,.05));border:1px solid var(--dsw-alias-border-l1,rgba(148,163,184,.14));border-radius:10px;padding:9px 11px;margin-bottom:8px;animation:wsfm-rise .2s ease both}
    .wsfm-price-card-head{display:flex;align-items:center;gap:6px;padding-bottom:7px;margin-bottom:7px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(148,163,184,.1))}
    .wsfm-price-name{flex:1;min-width:0;font-weight:650;font-size:11.5px;color:var(--dsw-alias-label-primary,#e7e9ee);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .wsfm-price-tag{font-size:9.5px;color:var(--dsw-alias-state-success-primary,#4ade80);border:1px solid rgba(74,222,128,.35);border-radius:4px;padding:0 4px;flex:none}
    .wsfm-price-tag-warn{color:var(--dsw-alias-state-warn-primary,#fbbf24);border-color:rgba(251,191,36,.35)}
    .wsfm-price-grid{display:grid;grid-template-columns:44px 1fr 1fr 1fr;gap:6px 10px;align-items:center}
    .wsfm-price-grid-head{font-size:9.5px;color:var(--dsw-alias-label-tertiary,#9aa3b2);text-align:center;font-weight:600}
    .wsfm-price-grid-label{font-size:10px;color:var(--dsw-alias-label-secondary,#b8bfcc);text-align:center;padding:3px 0;border-radius:6px;background:var(--dsw-alias-interactive-bg-hover,rgba(148,163,184,.09))}
    .wsfm-price-grid-label-peak{color:var(--dsw-alias-state-warn-primary,#fbbf24)}
    .wsfm-price-grid input{width:100%;box-sizing:border-box;padding:5px 8px;border:1px solid var(--dsw-alias-border-l1,rgba(148,163,184,.25));border-radius:7px;background:var(--dsw-alias-bg-layer-1,rgba(148,163,184,.07));color:var(--dsw-alias-label-primary,#e7e9ee);font-size:12px;font-family:inherit;font-variant-numeric:tabular-nums;outline:none;text-align:center}
    .wsfm-price-grid input:focus{border-color:var(--dsw-alias-brand-primary,#6ea8ff);box-shadow:0 0 0 3px rgba(110,168,255,.12)}
    .wsfm-price-note{font-size:10.5px;color:var(--dsw-alias-label-tertiary,#9aa3b2);line-height:1.65;margin-top:12px}
    .wsfm-price-badge{font-size:9.5px;color:var(--dsw-alias-state-warn-primary,#fbbf24);border:1px dashed rgba(251,191,36,.4);border-radius:4px;padding:0 4px;flex:none}
    .wsfm-price-ref{display:inline-flex;align-items:center;gap:4px;margin-top:12px;padding:4px 10px;border-radius:7px;border:1px solid rgba(110,168,255,.2);background:var(--dsw-alias-button-primary-dimmed,rgba(110,168,255,.14));color:var(--dsw-alias-brand-primary,#6ea8ff);font-size:11px;font-family:inherit;cursor:pointer;transition:background .12s ease}
    .wsfm-price-ref:hover{background:var(--dsw-alias-button-primary-hover,rgba(110,168,255,.24))}
    button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#6ea8ff);outline-offset:1px}
    `
    
    function uid() {
      return 'f' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
    }
    
    function loadData() {
      const base = { folders: [], assign: {}, order: {} }
      try {
        if (typeof localStorage === 'undefined') return base
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return base
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object') return base
        const folders = Array.isArray(parsed.folders)
          ? parsed.folders.filter((f) => f && typeof f.id === 'string' && typeof f.name === 'string')
            .map((f) => ({ id: f.id, name: f.name, color: typeof f.color === 'string' ? f.color : FOLDER_COLORS[0] }))
          : []
        const assign = parsed.assign && typeof parsed.assign === 'object' && !Array.isArray(parsed.assign) ? parsed.assign : {}
        const order = parsed.order && typeof parsed.order === 'object' && !Array.isArray(parsed.order) ? parsed.order : {}
        return { folders, assign, order }
      } catch (err) {
        console.error('wsfm: load failed', err)
        return base
      }
    }
    
    function saveData(data) {
      try {
        if (typeof localStorage === 'undefined') return
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (err) {
        console.error('wsfm: save failed', err)
      }
    }
    
    function nextColor(folders) {
      const counts = {}
      folders.forEach((f) => { counts[f.color] = (counts[f.color] || 0) + 1 })
      let best = FOLDER_COLORS[0]
      let bestCount = Infinity
      FOLDER_COLORS.forEach((c) => {
        const n = counts[c] || 0
        if (n < bestCount) { bestCount = n; best = c }
      })
      return best
    }
    
    function Icon({ d, size, className }) {
      return React.createElement('svg', { className: className || '', width: size || 13, height: size || 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        React.createElement('path', { d }),
      )
    }
    
    function IconBtn({ title, icon, onClick, danger, ok, label, className }) {
      return React.createElement('button', {
        type: 'button',
        className: 'wsfm-ic' + (danger ? ' danger' : '') + (ok ? ' ok' : '') + (className ? ' ' + className : ''),
        title: title,
        'aria-label': label || title,
        onClick: (e) => { e.stopPropagation(); onClick() },
      }, React.createElement(Icon, { d: icon, size: 11 }))
    }
    
    function InlineEditor({ initial, placeholder, onCommit, onCancel }) {
      const commit = (raw) => {
        const t = (raw || '').trim()
        if (!t) { onCancel(); return }
        onCommit(t)
      }
      return React.createElement('input', {
        type: 'text',
        className: 'wsfm-inline',
        defaultValue: initial,
        placeholder: placeholder || '',
        autoFocus: true,
        spellCheck: false,
        onClick: (e) => e.stopPropagation(),
        onKeyDown: (e) => {
          e.stopPropagation()
          if (e.key === 'Enter') commit(e.target.value)
          else if (e.key === 'Escape') onCancel()
        },
        onBlur: (e) => commit(e.target.value),
      })
    }
    
    function fmtTokens(n) {
      if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
      if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
      if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k'
      return String(Math.round(n))
    }
    
    function fmtMoney(n) {
      if (!isFinite(n) || n <= 0) return '¥0'
      if (n >= 1e6) return '¥' + (n / 1e6).toFixed(1) + 'M'
      if (n >= 1e3) return '¥' + (n / 1e3).toFixed(1) + 'k'
      if (n >= 1) return '¥' + n.toFixed(2)
      if (n >= 0.001) return '¥' + n.toFixed(4)
      return '¥' + n.toPrecision(2)
    }
    
    function loadPrices() {
      const base = { models: Object.assign({}, REF_PRICES) }
      try {
        if (typeof localStorage === 'undefined') return base
        const raw = localStorage.getItem(PRICE_KEY)
        if (!raw) return base
        const parsed = JSON.parse(raw)
        const models = parsed && parsed.models && typeof parsed.models === 'object' ? parsed.models : {}
        // Official reference prices are the default; user-saved rows win.
        return { models: Object.assign({}, REF_PRICES, models) }
      } catch (err) {
        console.error('wsfm: price load failed', err)
        return base
      }
    }
    
    function savePrices(prices) {
      try {
        if (typeof localStorage === 'undefined') return
        localStorage.setItem(PRICE_KEY, JSON.stringify(prices))
      } catch (err) {
        console.error('wsfm: price save failed', err)
      }
    }
    
    // Cost of one model's token buckets under one price row (CNY). Cache writes
    // are billed at the input (cache-miss) price, matching DeepSeek's model.
    // Band 'all' = off-peak buckets at off-peak rates PLUS peak buckets at peak
    // rates (the true total spend); 'offpeak'/'peak' count only their own bucket.
    function costOfModel(m, p, band) {
      if (!m || !p) return 0
      const rate = (isPeak) => ({
        input: isPeak ? (p.inputPeak !== undefined ? p.inputPeak : p.input) : p.input,
        cacheRead: isPeak ? (p.cacheReadPeak !== undefined ? p.cacheReadPeak : p.cacheRead) : p.cacheRead,
        output: isPeak ? (p.outputPeak !== undefined ? p.outputPeak : p.output) : p.output,
      })
      const costFor = (u, r) => (u.uncachedInputTokens / 1e6 * r.input
        + u.cacheWriteTokens / 1e6 * r.input
        + u.cacheReadTokens / 1e6 * r.cacheRead
        + u.outputTokens / 1e6 * r.output)
      const buckets = (peak) => ({
        uncachedInputTokens: peak ? (m.peakUncachedInputTokens || 0) : (m.uncachedInputTokens || 0),
        cacheWriteTokens: peak ? (m.peakCacheWriteTokens || 0) : (m.cacheWriteTokens || 0),
        cacheReadTokens: peak ? (m.peakCacheReadTokens || 0) : (m.cacheReadTokens || 0),
        outputTokens: peak ? (m.peakOutputTokens || 0) : (m.outputTokens || 0),
      })
      if (band === 'all') {
        return costFor(buckets(false), rate(false)) + costFor(buckets(true), rate(true))
      }
      const isPeak = band === 'peak'
      return costFor(buckets(isPeak), rate(isPeak))
    }
    
    // Official price for one model key: exact REF_PRICES match wins; any other
    // deepseek/* model defaults to the V4-Flash official rate. Non-deepseek
    // models without a reference price return undefined (user must set them).
    function officialPriceFor(key) {
      if (REF_PRICES[key]) return REF_PRICES[key]
      if (key && key.indexOf('deepseek/') === 0) return REF_PRICES['deepseek/deepseek-v4-flash']
      return undefined
    }
    
    // Effective price row for one model key: user-saved row wins, else official.
    function priceOf(key, prices) {
      const m = prices && prices.models ? prices.models[key] : undefined
      if (m !== undefined) return m
      return officialPriceFor(key)
    }
    
    function modelTotalTokens(m) {
      if (!m) return 0
      return (m.uncachedInputTokens || 0) + (m.cacheWriteTokens || 0) + (m.cacheReadTokens || 0) + (m.outputTokens || 0)
    }
    
    function sumUsage(ids, tokenMap) {
      const out = { uncachedInputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 }
      ids.forEach((id) => {
        const u = tokenMap[id]
        if (!u) return
        out.uncachedInputTokens += u.uncachedInputTokens || 0
        out.outputTokens += u.outputTokens || 0
        out.cacheReadTokens += u.cacheReadTokens || 0
        out.cacheWriteTokens += u.cacheWriteTokens || 0
      })
      return out
    }
    
    function usageTotal(u) {
      if (!u) return 0
      return (u.uncachedInputTokens || 0) + (u.outputTokens || 0) + (u.cacheReadTokens || 0) + (u.cacheWriteTokens || 0)
    }
    
    function Browser({ wide, expandSidebar, useSessions, useWorkspaces, workspacesApi, sessionsApi }) {
      const items = (useWorkspaces ? useWorkspaces((s) => s.items) : []) || []
      const archivedIds = (useWorkspaces ? useWorkspaces((s) => s.archivedSessionIds) : []) || []
      const sState = useSessions ? useSessions((s) => s) : { ids: [], byId: {}, current: undefined, phase: undefined }
      const ids = (sState && sState.ids) || []
      const sessions = (sState && sState.byId) || {}
      const current = sState && sState.current
      const openSession = (id) => { if (sessionsApi && typeof sessionsApi.open === 'function') sessionsApi.open(id) }
      const [data, setData] = React.useState(loadData)
      const [expFolders, setExpFolders] = React.useState({})
      const [expWorkspaces, setExpWorkspaces] = React.useState({})
      const [query, setQuery] = React.useState('')
      const [remote, setRemote] = React.useState({ status: 'idle', items: [], hasMore: false })
      const [dragOver, setDragOver] = React.useState(null)
      const [editing, setEditing] = React.useState(null)
      const [menuFor, setMenuFor] = React.useState(null)
      const [dragState, setDragState] = React.useState(null)
      const [dropMarker, setDropMarker] = React.useState(null)
      const [dropLine, setDropLine] = React.useState(null)
      const [tokPop, setTokPop] = React.useState(null)
      const [tokenMap, setTokenMap] = React.useState({})
      const [costMap, setCostMap] = React.useState({})
      const [prices, setPrices] = React.useState(loadPrices)
      const [panelView, setPanelView] = React.useState('overview')
      const [priceBand, setPriceBand] = React.useState('all')
      const [panelOpen, setPanelOpen] = React.useState(false)
      const [caliber, setCaliber] = React.useState('current')
      const [expandWs, setExpandWs] = React.useState(null)
      const dragRef = React.useState({ current: null, lastOver: null })[0]
      const tokenRef = React.useState({ current: {} })[0]
      const costRef = React.useState({ current: {} })[0]
      const tokTimerRef = React.useState({ current: null })[0]
    
      const cancelTokHide = () => {
        if (tokTimerRef.current !== null) {
          if (typeof window !== 'undefined') window.clearTimeout(tokTimerRef.current)
          tokTimerRef.current = null
        }
      }
    
      const startTokHide = () => {
        if (tokTimerRef.current !== null) {
          if (typeof window !== 'undefined') window.clearTimeout(tokTimerRef.current)
        }
        tokTimerRef.current = typeof window !== 'undefined' ? window.setTimeout(() => {
          tokTimerRef.current = null
          setTokPop(null)
        }, 150) : null
      }
    
      const resetDrag = () => {
        dragRef.current = null
        dragRef.lastOver = null
        setDragState(null)
        setDropMarker(null)
        setDragOver(null)
        setDropLine(null)
      }
    
      // Lazy per-session per-model cost data (provider/model breakdown) via host.
      const loadCost = (ids) => {
        if (!ids || ids.length === 0) return
        if (typeof fetch === 'undefined') return
        const need = ids.filter((id) => costRef.current[id] === undefined)
        if (need.length === 0) return
        hostCall('wsfm-cost', { sessionIds: need }).then((res) => {
          if (!res || typeof res !== 'object') return
          const next = Object.assign({}, costRef.current)
          let changed = false
          Object.keys(res).forEach((k) => {
            if (res[k] !== undefined && costRef.current[k] === undefined) {
              next[k] = res[k]
              changed = true
            }
          })
          if (changed) {
            costRef.current = next
            setCostMap(next)
          }
        }).catch((err) => console.error('wsfm: cost fetch failed', err))
      }
    
      // Total CNY cost of one session id list under the configured price table.
      const costFor = (ids) => {
        let cost = 0
        ids.forEach((id) => {
          const models = costMap[id]
          if (!models) return
          Object.keys(models).forEach((key) => {
            cost += costOfModel(models[key], priceOf(key, prices), priceBand)
          })
        })
        return cost
      }
    
      // True when every session id has a cost record (null = fetched, no data).
      const costLoaded = (ids) => ids.every((id) => costMap[id] !== undefined)
    
      // Fetch per-session token usage (incl. archived) via the host projection cache.
      React.useEffect(() => {
        if (typeof fetch === 'undefined') return
        const needed = {}
        items.forEach((ws) => ws.sessionIds.forEach((id) => { if (tokenRef.current[id] === undefined) needed[id] = true }))
        const needIds = Object.keys(needed)
        if (needIds.length === 0) return
        let alive = true
        let timer = null
        if (typeof window !== 'undefined') {
          timer = window.setTimeout(() => {
            hostCall('wsfm-tokens', { sessionIds: needIds }).then((res) => {
              if (!alive || !res || typeof res !== 'object') return
              const next = Object.assign({}, tokenRef.current)
              let changed = false
              Object.keys(res).forEach((k) => {
                if (res[k] !== undefined && tokenRef.current[k] === undefined) {
                  next[k] = res[k]
                  changed = true
                }
              })
              if (changed) {
                tokenRef.current = next
                setTokenMap(next)
              }
            }).catch((err) => console.error('wsfm: token fetch failed', err))
          }, 250)
        }
        return () => {
          if (timer !== null && typeof window !== 'undefined') window.clearTimeout(timer)
          alive = false
        }
      }, [items])
    
      // Prune stale assignments and orders for workspaces that no longer exist.
      React.useEffect(() => {
        const known = {}
        items.forEach((w) => { known[w.workspaceId] = true })
        let changed = false
        const assign = {}
        Object.keys(data.assign).forEach((k) => {
          if (known[k]) assign[k] = data.assign[k]
          else changed = true
        })
        const order = {}
        Object.keys(data.order || {}).forEach((key) => {
          const kept = (data.order[key] || []).filter((id) => known[id])
          if (kept.length > 0) order[key] = kept
          else if (kept.length !== (data.order[key] || []).length) changed = true
          if (kept.length === 0 && (data.order[key] || []).length > 0) changed = true
        })
        if (changed || JSON.stringify(order) !== JSON.stringify(data.order || {})) {
          const next = { folders: data.folders, assign, order }
          saveData(next)
          setData(next)
        }
      }, [items])
    
      React.useEffect(() => {
        if (typeof window === 'undefined') return
        const onStorage = (e) => { if (e.key === STORAGE_KEY) setData(loadData()) }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
      }, [])
    
      React.useEffect(() => {
        if (!current) return
        const ws = items.find((w) => w.sessionIds.indexOf(current) !== -1)
        if (!ws) return
        setExpWorkspaces((prev) => (prev[ws.workspaceId] ? prev : Object.assign({}, prev, { [ws.workspaceId]: true })))
        const fid = data.assign[ws.workspaceId]
        if (fid && data.folders.some((f) => f.id === fid)) {
          setExpFolders((prev) => (prev[fid] ? prev : Object.assign({}, prev, { [fid]: true })))
        }
      }, [current, items, data.assign])
    
      React.useEffect(() => {
        if (!menuFor) return
        if (typeof window === 'undefined' || typeof document === 'undefined') return
        const close = (e) => {
          const t = e.target
          if (t && typeof t.closest === 'function') {
            if (t.closest('.wsfm-menu')) return
            if (t.closest('.wsfm-mbtn')) return
          }
          setMenuFor(null)
        }
        const onKey = (e) => { if (e.key === 'Escape') setMenuFor(null) }
        document.addEventListener('mousedown', close)
        document.addEventListener('keydown', onKey)
        return () => {
          document.removeEventListener('mousedown', close)
          document.removeEventListener('keydown', onKey)
        }
      }, [menuFor])
    
      // Load cost data for every workspace's sessions when the panel opens.
      React.useEffect(() => {
        if (!panelOpen) return
        const all = []
        items.forEach((ws) => ws.sessionIds.forEach((id) => { if (all.indexOf(id) === -1) all.push(id) }))
        loadCost(all)
      }, [panelOpen, items])
    
      // Close the token panel on Escape.
      React.useEffect(() => {
        if (!panelOpen || typeof window === 'undefined') return
        const onKey = (e) => { if (e.key === 'Escape') setPanelOpen(false) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [panelOpen])
    
      const q = query.trim().toLowerCase()
    
      React.useEffect(() => {
        if (!q) {
          setRemote({ status: 'idle', items: [], hasMore: false })
          return
        }
        if (!sessionsApi || typeof sessionsApi.search !== 'function') return
        const controller = new AbortController()
        setRemote({ status: 'loading', items: [], hasMore: false })
        let timer = null
        if (typeof window !== 'undefined') {
          timer = window.setTimeout(() => {
            sessionsApi.search(q, controller.signal).then((result) => {
              if (controller.signal.aborted) return
              if (result && result.ok) {
                const value = result.value || {}
                setRemote({ status: 'ready', items: value.items || [], hasMore: !!value.hasMore })
              } else {
                setRemote({ status: 'error', items: [], hasMore: false })
              }
            }).catch(() => {
              if (!controller.signal.aborted) setRemote({ status: 'error', items: [], hasMore: false })
            })
          }, 250)
        }
        return () => {
          if (timer !== null && typeof window !== 'undefined') window.clearTimeout(timer)
          controller.abort()
        }
      }, [q, sessionsApi])
    
      const update = (fn) => {
        setData((prev) => {
          const d = { folders: prev.folders.slice(), assign: Object.assign({}, prev.assign), order: Object.assign({}, prev.order || {}) }
          fn(d)
          saveData(d)
          return d
        })
      }
    
      const assignTo = (workspaceId, folderId) => {
        update((d) => {
          if (folderId) d.assign[workspaceId] = folderId
          else delete d.assign[workspaceId]
        })
      }
    
      const moveFolder = (id, beforeId) => {
        update((d) => {
          const from = d.folders.findIndex((x) => x.id === id)
          if (from === -1) return
          const list = d.folders.filter((x) => x.id !== id)
          const at = beforeId == null ? list.length : list.findIndex((x) => x.id === beforeId)
          const idx = at === -1 ? list.length : at
          list.splice(idx, 0, d.folders[from])
          d.folders = list
        })
      }
    
      // Strongly biased split: the top BEFORE_BIAS of the target element means "insert before".
      const halfOf = (e, el) => {
        const target = el || e.currentTarget
        if (!target || typeof target.getBoundingClientRect !== 'function') return 'after'
        const rect = target.getBoundingClientRect()
        return e.clientY < rect.top + rect.height * BEFORE_BIAS ? 'before' : 'after'
      }
    
      const parsePayload = (e) => {
        try {
          const raw = e.dataTransfer.getData(MIME) || ''
          const parts = raw.split(':')
          if (parts[0] === 'session' && parts.length >= 3) {
            return { kind: 'session', wsId: parts.slice(1, -1).join(':'), id: parts[parts.length - 1] }
          }
          if ((parts[0] === 'workspace' || parts[0] === 'folder') && parts.length >= 2) {
            return { kind: parts[0], id: parts.slice(1).join(':') }
          }
        } catch (err) { /* ignore */ }
        return null
      }
    
      // Display order of workspaces inside one folder bucket (folder-local order, global fallback).
      const folderOrdered = (fid) => {
        const key = fid === 'none' ? null : fid
        const members = items.filter((w) => (data.assign[w.workspaceId] || null) === (key || null))
        const order = (data.order || {})[fid || 'none']
        if (!order || order.length === 0) return members
        const byId = {}
        members.forEach((w) => { byId[w.workspaceId] = w })
        const seen = {}
        const ordered = []
        order.forEach((id) => {
          if (byId[id] && !seen[id]) { seen[id] = true; ordered.push(byId[id]) }
        })
        const rest = members.filter((w) => !seen[w.workspaceId])
        return ordered.concat(rest)
      }
    
      // Move a workspace into a folder bucket at a position (same-folder reorder or cross-folder move).
      const moveWorkspaceInto = (fid, dragId, beforeId) => {
        const current = folderOrdered(fid).map((w) => w.workspaceId)
        const had = current.indexOf(dragId)
        const rest = current.filter((id) => id !== dragId)
        const at = beforeId == null ? rest.length : rest.indexOf(beforeId)
        if (at === -1) return
        if (had !== -1) {
          if (beforeId == null) { if (had === rest.length) return }
          else if (at === had) return
        }
        const next = rest.slice()
        next.splice(at, 0, dragId)
        update((d) => {
          if (!d.order) d.order = {}
          d.order[fid || 'none'] = next
          if (fid) d.assign[dragId] = fid
          else delete d.assign[dragId]
        })
      }
    
      const moveSessionBefore = (wsId, dragId, beforeId) => {
        if (!workspacesApi || typeof workspacesApi.insertSessionBefore !== 'function') return
        if (dragId === beforeId) return
        workspacesApi.insertSessionBefore(wsId, dragId, beforeId || undefined).catch((err) => console.error('wsfm: reorder session failed', err))
      }
    
      // The marker (target row + half) and the floating line (snapped to that row's
      // boundary, spanning the row's width) are written from the SAME dragover event.
      const markOver = (marker, e, el) => {
        dragRef.lastOver = marker
        setDropMarker(marker)
        const target = el || (e ? e.currentTarget : null)
        if (target && typeof target.getBoundingClientRect === 'function') {
          const rect = target.getBoundingClientRect()
          setDropLine({
            top: marker.half === 'before' ? rect.top : rect.bottom,
            left: rect.left,
            width: rect.width,
          })
        } else if (e && typeof e.clientY === 'number') {
          setDropLine({ top: e.clientY, left: 0, width: 240 })
        }
      }
    
      const toggleAll = () => {
        const allFoldersOpen = data.folders.length > 0 && data.folders.every((f) => !!expFolders[f.id])
        if (allFoldersOpen) {
          setExpFolders({})
          setExpWorkspaces({})
        } else {
          const ef = {}
          data.folders.forEach((f) => { ef[f.id] = true })
          setExpFolders(ef)
          const ew = {}
          items.forEach((w) => { ew[w.workspaceId] = true })
          ew['__none__'] = true
          setExpWorkspaces(ew)
        }
      }
    
      const beginEdit = (edit) => setEditing(edit)
    
      const commitEdit = (next) => {
        const ed = editing
        setEditing(null)
        if (!ed) return
        const t = (next || '').trim()
        if (!t) return
        if (ed.kind === 'new-folder') {
          update((d) => { d.folders.push({ id: uid(), name: t, color: nextColor(d.folders) }) })
        } else if (ed.kind === 'folder') {
          update((d) => { d.folders.forEach((f) => { if (f.id === ed.id) f.name = t }) })
        } else if (ed.kind === 'workspace') {
          if (workspacesApi && typeof workspacesApi.rename === 'function') {
            workspacesApi.rename(ed.id, t).catch((err) => console.error('wsfm: rename workspace failed', err))
          }
        } else if (ed.kind === 'session') {
          renameSessionById(ed.id, t)
        }
      }
    
      const cancelEdit = () => setEditing(null)
    
      const deleteFolder = (id) => {
        if (!window.confirm('删除该分组？其中的工作区会变为「未分组」，工作区本身及其目录、会话都不会被删除。')) return
        update((d) => {
          d.folders = d.folders.filter((x) => x.id !== id)
          Object.keys(d.assign).forEach((k) => { if (d.assign[k] === id) delete d.assign[k] })
          if (d.order) delete d.order[id]
        })
      }
    
      const startSession = (workspaceId) => {
        if (workspacesApi && typeof workspacesApi.startSession === 'function') {
          try { workspacesApi.startSession(workspaceId) } catch (err) { console.error('wsfm: startSession', err) }
        }
      }
    
      const addWorkspace = async (folderId) => {
        if (!workspacesApi) return
        try {
          const path = await workspacesApi.pickDirectory()
          if (!path) return
          const ws = await workspacesApi.create({ path })
          if (folderId) assignTo(ws.workspaceId, folderId)
        } catch (err) {
          console.error('wsfm: add workspace failed', err)
        }
      }
    
      const deleteWorkspace = (ws) => {
        if (!workspacesApi || !window.confirm('删除工作区「' + ws.title + '」？仅移除注册，目录与所有会话日志会保留。')) return
        workspacesApi.delete(ws.workspaceId)
          .then(() => { update((d) => { delete d.assign[ws.workspaceId] }) })
          .catch((err) => console.error('wsfm: delete failed', err))
      }
    
      const renameSessionById = (sessionId, title) => {
        let binding = null
        if (sessionsApi && typeof sessionsApi.binding === 'function') binding = sessionsApi.binding(sessionId)
        const session = binding && binding.session
        if (!session || typeof session.rename !== 'function') {
          console.error('wsfm: session binding unavailable for rename')
          return
        }
        session.rename(title).then((r) => {
          if (r && !r.ok) console.error('wsfm: rename session rejected', r.error && r.error.message)
        }).catch((err) => console.error('wsfm: rename session failed', err))
      }
    
      const forkSession = (sessionId) => {
        if (!sessionsApi || typeof sessionsApi.fork !== 'function') return
        sessionsApi.fork({ sessionId, increaseTitle: true })
          .then((childId) => { openSession(childId) })
          .catch((err) => console.error('wsfm: fork failed', err))
      }
    
      const archiveSession = (sessionId) => {
        if (!workspacesApi) return
        workspacesApi.archiveSession(sessionId).catch((err) => console.error('wsfm: archive failed', err))
      }
    
      const archivedSet = {}
      archivedIds.forEach((id) => { archivedSet[id] = true })
    
      const statusOf = (s) => {
        if (s.pendingInteraction) return 'ask'
        if (s.running) return 'run'
        if (s.completed) return 'done'
        return 'idle'
      }
    
      const nextSessionId = (list, id) => {
        const i = list.findIndex((x) => x.id === id)
        return i === -1 || i + 1 >= list.length ? null : list[i + 1].id
      }
    
      const renderTokPopChildren = (ws) => {
        const visibleIds = ws.sessionIds.filter((id) => !archivedSet[id])
        const curUsage = sumUsage(visibleIds, tokenMap)
        const allUsage = sumUsage(ws.sessionIds, tokenMap)
        const curTotal = usageTotal(curUsage)
        const allTotal = usageTotal(allUsage)
        const curCost = costFor(visibleIds)
        const allCost = costFor(ws.sessionIds)
        const children = [
          React.createElement('div', { key: 'title', className: 'wsfm-tokpop-title' }, 'Token 消耗 · ' + ws.title),
          React.createElement('div', { key: 'cur', className: 'wsfm-tokpop-row' },
            React.createElement('span', null, '当前会话'),
            React.createElement('span', { className: 'wsfm-tokpop-right' },
              React.createElement('b', null, fmtTokens(curTotal)),
              curCost > 0 ? React.createElement('span', { className: 'wsfm-tokpop-money' }, fmtMoney(curCost)) : null,
            ),
          ),
          React.createElement('div', { key: 'all', className: 'wsfm-tokpop-row' },
            React.createElement('span', null, '含历史归档'),
            React.createElement('span', { className: 'wsfm-tokpop-right' },
              React.createElement('b', null, fmtTokens(allTotal)),
              allCost > 0 ? React.createElement('span', { className: 'wsfm-tokpop-money' }, fmtMoney(allCost)) : null,
            ),
          ),
          React.createElement('div', { key: 'sec1', className: 'wsfm-tokpop-sec' }, '明细（当前，输入/输出/缓存读/缓存写）'),
          React.createElement('div', { key: 'grid', className: 'wsfm-tokpop-grid' },
            React.createElement('div', { className: 'wsfm-tokpop-cell' }, React.createElement('span', null, '输入'), React.createElement('span', null, fmtTokens(curUsage.uncachedInputTokens))),
            React.createElement('div', { className: 'wsfm-tokpop-cell' }, React.createElement('span', null, '输出'), React.createElement('span', null, fmtTokens(curUsage.outputTokens))),
            React.createElement('div', { className: 'wsfm-tokpop-cell' }, React.createElement('span', null, '缓存读'), React.createElement('span', null, fmtTokens(curUsage.cacheReadTokens))),
            React.createElement('div', { className: 'wsfm-tokpop-cell' }, React.createElement('span', null, '缓存写'), React.createElement('span', null, fmtTokens(curUsage.cacheWriteTokens))),
          ),
          React.createElement('div', { key: 'sec2', className: 'wsfm-tokpop-sec' }, '各会话'),
        ]
        ws.sessionIds.forEach((sid) => {
          const s = sessions[sid]
          const u = tokenMap[sid]
          const t = usageTotal(u)
          children.push(React.createElement('div', {
            key: sid,
            className: 'wsfm-tokpop-sess',
            onClick: () => { if (s) openSession(sid) },
          },
            React.createElement('span', { className: 'wsfm-tokpop-sess-name', title: s ? s.displayTitle : sid }, s ? s.displayTitle : sid),
            archivedSet[sid] ? React.createElement('span', { className: 'wsfm-tokpop-arch' }, '归档') : null,
            React.createElement('span', { className: 'wsfm-tokpop-sess-tok' }, u ? fmtTokens(t) : '—'),
          ))
        })
        const modelAgg = {}
        visibleIds.forEach((id) => {
          const models = costMap[id]
          if (!models) return
          Object.keys(models).forEach((key) => {
            const m = models[key]
            let a = modelAgg[key]
            if (!a) a = modelAgg[key] = { uncachedInputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, peakUncachedInputTokens: 0, peakOutputTokens: 0, peakCacheReadTokens: 0, peakCacheWriteTokens: 0 }
            a.uncachedInputTokens += m.uncachedInputTokens || 0
            a.outputTokens += m.outputTokens || 0
            a.cacheReadTokens += m.cacheReadTokens || 0
            a.cacheWriteTokens += m.cacheWriteTokens || 0
            a.peakUncachedInputTokens += m.peakUncachedInputTokens || 0
            a.peakOutputTokens += m.peakOutputTokens || 0
            a.peakCacheReadTokens += m.peakCacheReadTokens || 0
            a.peakCacheWriteTokens += m.peakCacheWriteTokens || 0
          })
        })
        const modelKeys = Object.keys(modelAgg)
        if (modelKeys.length > 0) {
          children.push(React.createElement('div', { key: 'sec3', className: 'wsfm-tokpop-sec' }, '按模型（当前）'))
          modelKeys.forEach((key) => {
            const m = modelAgg[key]
            const p = priceOf(key, prices)
            const cost = costOfModel(m, p, priceBand)
            children.push(React.createElement('div', { key: 'm' + key, className: 'wsfm-tokpop-model' },
              React.createElement('span', { className: 'wsfm-tokpop-model-name', title: key }, key),
              React.createElement('span', { className: 'wsfm-tokpop-sess-tok' }, fmtTokens(modelTotalTokens(m))),
              React.createElement('span', { className: 'wsfm-tokpop-money' }, p ? fmtMoney(cost) : '未定价'),
            ))
          })
        }
        return children
      }
    
      // ---- Standalone token overview panel ----
      const renderTokenPanel = () => {
        const panelHead = React.createElement('div', { className: 'wsfm-panel-head' },
          React.createElement('span', { className: 'wsfm-panel-title' },
            panelView === 'prices'
              ? React.createElement(React.Fragment, null, React.createElement(Icon, { d: IC_GEAR, size: 14 }), '单价设置')
              : React.createElement(React.Fragment, null, React.createElement(Icon, { d: IC_CHART, size: 14 }), 'Token 总览'),
          ),
          React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 2 } },
            panelView === 'prices'
              ? React.createElement(IconBtn, { title: '返回总览', icon: IC_BACK, onClick: () => setPanelView('overview') })
              : React.createElement(IconBtn, { title: '单价设置（CNY / 1M tokens）', icon: IC_GEAR, onClick: () => setPanelView('prices') }),
            React.createElement(IconBtn, { title: '关闭 (Esc)', icon: IC_CLOSE, onClick: () => setPanelOpen(false) }),
          ),
        )
    
        if (panelView === 'prices') {
          const seen = {}
          Object.keys(costMap).forEach((id) => {
            const models = costMap[id]
            if (!models) return
            Object.keys(models).forEach((key) => { seen[key] = true })
          })
          const keys = Object.keys(prices.models).concat(Object.keys(seen)).filter((k, i, arr) => arr.indexOf(k) === i).sort()
          const setPrice = (key, field, value) => {
            setPrices((prev) => {
              const models = Object.assign({}, prev.models)
              const row = Object.assign({ input: 0, cacheRead: 0, output: 0, inputPeak: 0, cacheReadPeak: 0, outputPeak: 0 }, models[key])
              row[field] = Math.max(0, parseFloat(value) || 0)
              models[key] = row
              const next = { models }
              savePrices(next)
              return next
            })
          }
          const removePrice = (key) => {
            setPrices((prev) => {
              const models = Object.assign({}, prev.models)
              models[key] = { input: 0, cacheRead: 0, output: 0, inputPeak: 0, cacheReadPeak: 0, outputPeak: 0 }
              const next = { models }
              savePrices(next)
              return next
            })
          }
          const resetRef = (key) => {
            setPrices((prev) => {
              const models = Object.assign({}, prev.models)
              models[key] = Object.assign({}, officialPriceFor(key))
              const next = { models }
              savePrices(next)
              return next
            })
          }
          const body = []
          body.push(React.createElement('div', { key: 'hint', className: 'wsfm-summary' }, '每个模型一张卡片：官方模型已内置 2026-08-17 峰谷价，可直接修改；其他模型请自行填写'))
          if (keys.length === 0) {
            body.push(React.createElement('div', { key: 'empty', className: 'wsfm-pempty' }, '暂无模型数据'))
          } else {
            keys.forEach((key) => {
              const row = prices.models[key] || Object.assign({ input: 0, cacheRead: 0, output: 0, inputPeak: 0, cacheReadPeak: 0, outputPeak: 0 }, officialPriceFor(key) || {})
              const isRef = !!officialPriceFor(key)
              const unset = !priceOf(key, prices)
              body.push(React.createElement('div', { key: key, className: 'wsfm-price-card' },
                React.createElement('div', { className: 'wsfm-price-card-head' },
                  React.createElement('span', { className: 'wsfm-price-name', title: key }, key),
                  isRef
                    ? React.createElement('span', { className: 'wsfm-price-tag' }, '官方价')
                    : (unset ? React.createElement('span', { className: 'wsfm-price-tag wsfm-price-tag-warn' }, '未定价') : null),
                  React.createElement('span', { style: { flex: 1 } }),
                  React.createElement(IconBtn, { title: isRef ? '恢复官方参考价' : '清除此模型单价', icon: isRef ? IC_RESET : IC_TRASH, danger: !isRef, onClick: () => (isRef ? resetRef(key) : removePrice(key)) }),
                ),
                React.createElement('div', { className: 'wsfm-price-grid' },
                  React.createElement('span', { className: 'wsfm-price-grid-head' }, ''),
                  React.createElement('span', { className: 'wsfm-price-grid-head' }, '输入'),
                  React.createElement('span', { className: 'wsfm-price-grid-head' }, '缓存读'),
                  React.createElement('span', { className: 'wsfm-price-grid-head' }, '输出'),
                  React.createElement('span', { className: 'wsfm-price-grid-label' }, '空闲'),
                  React.createElement('input', { type: 'number', min: 0, step: 0.01, value: String(row.input), onChange: (e) => setPrice(key, 'input', e.target.value), 'aria-label': key + ' 空闲输入单价' }),
                  React.createElement('input', { type: 'number', min: 0, step: 0.01, value: String(row.cacheRead), onChange: (e) => setPrice(key, 'cacheRead', e.target.value), 'aria-label': key + ' 空闲缓存读单价' }),
                  React.createElement('input', { type: 'number', min: 0, step: 0.01, value: String(row.output), onChange: (e) => setPrice(key, 'output', e.target.value), 'aria-label': key + ' 空闲输出单价' }),
                  React.createElement('span', { className: 'wsfm-price-grid-label wsfm-price-grid-label-peak' }, '高峰'),
                  React.createElement('input', { type: 'number', min: 0, step: 0.01, value: String(row.inputPeak), onChange: (e) => setPrice(key, 'inputPeak', e.target.value), 'aria-label': key + ' 高峰输入单价' }),
                  React.createElement('input', { type: 'number', min: 0, step: 0.01, value: String(row.cacheReadPeak), onChange: (e) => setPrice(key, 'cacheReadPeak', e.target.value), 'aria-label': key + ' 高峰缓存读单价' }),
                  React.createElement('input', { type: 'number', min: 0, step: 0.01, value: String(row.outputPeak), onChange: (e) => setPrice(key, 'outputPeak', e.target.value), 'aria-label': key + ' 高峰输出单价' }),
                ),
              ))
            })
          }
          body.push(React.createElement('div', { key: 'note', className: 'wsfm-price-note' },
            '· 单价为每百万 token 的人民币（¥），按 DeepSeek 官方 2026-08-17 峰谷定价。\n· 高峰时段为北京时间每日 9:00–14:00，价格翻倍；金额按所选时段估算，精确值以账单为准。\n· 未设置单价的模型按 ¥0 计费并标记「未定价」。\n· 缓存写入按「输入」单价计费。\n· 价格仅保存在本机浏览器（localStorage）。',
          ))
          return React.createElement('div', { className: 'wsfm-panel', role: 'dialog', 'aria-label': '单价设置' },
            panelHead,
            React.createElement('div', { className: 'wsfm-panel-body' }, body),
          )
        }
    
        const useAll = caliber === 'all'
        const caliberIdsOf = (ws) => (useAll ? ws.sessionIds : ws.sessionIds.filter((id) => !archivedSet[id]))
        const wsRows = items.map((ws) => {
          const ids = caliberIdsOf(ws)
          const u = sumUsage(ids, tokenMap)
          const total = usageTotal(u)
          const fid = data.assign[ws.workspaceId] || null
          const folder = fid ? data.folders.find((f) => f.id === fid) : undefined
          return { ws, total, u, ids, cost: costFor(ids), folderName: folder ? folder.name : '未分组', color: folder ? folder.color : '#9aa3b2' }
        }).filter((r) => r.ws.sessionIds.some((id) => tokenMap[id]))
        wsRows.sort((a, b) => b.total - a.total)
    
        const folderTotals = []
        data.folders.forEach((f) => {
          const ids = []
          wsByFolder[f.id].forEach((w) => ids.push.apply(ids, caliberIdsOf(w)))
          const total = usageTotal(sumUsage(ids, tokenMap))
          if (total > 0) folderTotals.push({ name: f.name, color: f.color, total, cost: costFor(ids) })
        })
        const noneIds = []
        wsByFolder['none'].forEach((w) => noneIds.push.apply(noneIds, caliberIdsOf(w)))
        const noneTotal = usageTotal(sumUsage(noneIds, tokenMap))
        if (noneTotal > 0) folderTotals.push({ name: '未分组', color: '#9aa3b2', total: noneTotal, cost: costFor(noneIds) })
        folderTotals.sort((a, b) => b.total - a.total)
        const grandTotal = folderTotals.reduce((s, x) => s + x.total, 0)
        const grandCost = folderTotals.reduce((s, x) => s + x.cost, 0)
        const fMax = folderTotals.length ? folderTotals[0].total : 1
        const wMax = wsRows.length ? wsRows[0].total : 1
    
        const pbar = (total, max) => React.createElement('span', { className: 'wsfm-pbar' },
          React.createElement('i', { style: { width: Math.max(total > 0 ? 2 : 0, Math.round((total / max) * 100)) + '%' } }),
        )
    
        const body = []
        body.push(React.createElement('div', { key: 'segs', className: 'wsfm-segs' },
          React.createElement('div', { className: 'wsfm-seg' },
            React.createElement('button', { type: 'button', className: caliber === 'current' ? 'on' : '', onClick: () => setCaliber('current') }, '当前会话'),
            React.createElement('button', { type: 'button', className: caliber === 'all' ? 'on' : '', onClick: () => setCaliber('all') }, '含历史归档'),
          ),
          React.createElement('div', { className: 'wsfm-seg' },
            React.createElement('button', { type: 'button', className: priceBand === 'all' ? 'on' : '', onClick: () => setPriceBand('all') }, '全部'),
            React.createElement('button', { type: 'button', className: priceBand === 'offpeak' ? 'on' : '', onClick: () => setPriceBand('offpeak') }, '空闲'),
            React.createElement('button', { type: 'button', className: priceBand === 'peak' ? 'on' : '', onClick: () => setPriceBand('peak') }, '高峰'),
          ),
        ))
        body.push(React.createElement('div', { key: 'sum', className: 'wsfm-summary' },
          '合计 ', React.createElement('b', null, fmtTokens(grandTotal)),
          React.createElement('span', { className: 'wsfm-tokpop-money', style: { marginLeft: 8 } }, fmtMoney(grandCost)),
          ' · ' + String(folderTotals.length) + ' 分组 · ' + String(wsRows.length) + ' 工作区',
        ))
        body.push(React.createElement('div', { key: 'secf', className: 'wsfm-psec' }, '分组小计'))
        if (folderTotals.length === 0) {
          body.push(React.createElement('div', { key: 'emptyf', className: 'wsfm-pempty' }, '暂无 Token 数据'))
        } else {
          folderTotals.forEach((ft, i) => {
            body.push(React.createElement('div', { key: 'f' + i, className: 'wsfm-prow' },
              React.createElement('span', { className: 'wsfm-dot', style: { background: ft.color } }),
              React.createElement('span', { className: 'wsfm-prow-name' }, ft.name),
              pbar(ft.total, fMax),
              React.createElement('span', { className: 'wsfm-prow-tok' }, fmtTokens(ft.total)),
              React.createElement('span', { className: 'wsfm-pmoney' + (ft.cost > 0 ? '' : ' wsfm-pmoney-dim') }, fmtMoney(ft.cost)),
            ))
          })
        }
        body.push(React.createElement('div', { key: 'secw', className: 'wsfm-psec' }, '工作区排行'))
        if (wsRows.length === 0) {
          body.push(React.createElement('div', { key: 'emptyw', className: 'wsfm-pempty' }, '暂无 Token 数据'))
        } else {
          wsRows.forEach((r) => {
            const open = expandWs === r.ws.workspaceId
            body.push(React.createElement('div', { key: 'w' + r.ws.workspaceId, className: 'wsfm-prow clickable', onClick: () => setExpandWs(open ? null : r.ws.workspaceId) },
              React.createElement('span', { className: 'wsfm-wav', style: { background: r.color + '26', color: r.color } }, (r.ws.title || '?').slice(0, 1).toUpperCase()),
              React.createElement('span', { className: 'wsfm-prow-name' }, r.ws.title),
              React.createElement('span', { className: 'wsfm-prow-sub' }, r.folderName),
              pbar(r.total, wMax),
              React.createElement('span', { className: 'wsfm-prow-tok' }, fmtTokens(r.total)),
              React.createElement('span', { className: 'wsfm-pmoney' + (r.cost > 0 ? '' : ' wsfm-pmoney-dim') }, fmtMoney(r.cost)),
            ))
            if (open) {
              r.ids.forEach((sid) => {
                const s = sessions[sid]
                const u = tokenMap[sid]
                const t = usageTotal(u)
                const c = costFor([sid])
                body.push(React.createElement('div', { key: 's' + sid, className: 'wsfm-psess' },
                  React.createElement('span', { className: 'wsfm-psess-name', title: s ? s.displayTitle : sid }, s ? s.displayTitle : sid),
                  archivedSet[sid] ? React.createElement('span', { className: 'wsfm-tokpop-arch' }, '归档') : null,
                  React.createElement('span', { className: 'wsfm-psess-tok' }, u ? fmtTokens(t) : '—'),
                  React.createElement('span', { className: 'wsfm-psess-money' + (c > 0 ? '' : ' wsfm-pmoney-dim') }, fmtMoney(c)),
                ))
              })
            }
          })
        }
    
        return React.createElement('div', { className: 'wsfm-panel', role: 'dialog', 'aria-label': 'Token 总览' },
          panelHead,
          React.createElement('div', { className: 'wsfm-panel-body' }, body),
        )
      }
    
      const renderSessionRow = (s, wsId, sessList) => {
        const isCurrent = s.id === current
        const isEditing = editing && editing.kind === 'session' && editing.id === s.id
        const kids = [
          React.createElement('span', { key: 'st', className: 'wsfm-st ' + statusOf(s) }),
        ]
        if (isEditing) {
          kids.push(React.createElement(InlineEditor, {
            key: 'edit',
            initial: s.displayTitle,
            placeholder: '会话名称',
            onCommit: (t) => commitEdit(t),
            onCancel: cancelEdit,
          }))
          kids.push(React.createElement(IconBtn, { key: 'ok', title: '确定', icon: IC_CHECK, ok: true, onClick: () => commitEdit('') }))
          kids.push(React.createElement(IconBtn, { key: 'no', title: '取消', icon: IC_CLOSE, onClick: cancelEdit }))
        } else {
          kids.push(React.createElement('span', { key: 't', className: 'wsfm-sess-title', title: s.displayTitle }, s.displayTitle))
          if (s.blank) kids.push(React.createElement('span', { key: 'tag', className: 'wsfm-sess-tag' }, '空白'))
          kids.push(React.createElement('span', { key: 'acts', className: 'wsfm-sacts' },
            React.createElement(IconBtn, { title: '重命名会话', icon: IC_PENCIL, onClick: () => beginEdit({ kind: 'session', id: s.id }) }),
            React.createElement(IconBtn, { title: '分叉此会话', icon: IC_FORK, onClick: () => forkSession(s.id) }),
            React.createElement(IconBtn, { title: '归档会话', icon: IC_ARCHIVE, onClick: () => archiveSession(s.id) }),
          ))
        }
        return React.createElement('div', {
          key: s.id,
          className: 'wsfm-sess' + (isCurrent ? ' current' : ''),
          onClick: () => openSession(s.id),
          title: '打开会话',
          draggable: true,
          onDragStart: (e) => {
            e.stopPropagation()
            e.dataTransfer.setData(MIME, 'session:' + wsId + ':' + s.id)
            e.dataTransfer.effectAllowed = 'move'
            dragRef.current = { kind: 'session', id: s.id, wsId }
            setDragState(dragRef.current)
          },
          onDragEnd: resetDrag,
          onDragOver: (e) => {
            const d = dragRef.current
            if (!d || d.kind !== 'session' || d.id === s.id || d.wsId !== wsId) return
            e.preventDefault()
            e.stopPropagation()
            markOver({ kind: 'session', id: s.id, half: halfOf(e) }, e, e.currentTarget)
          },
          onDrop: (e) => {
            const p = parsePayload(e)
            if (p && p.kind === 'session' && p.id !== s.id && p.wsId === wsId) {
              e.preventDefault()
              e.stopPropagation()
              const lo = dragRef.lastOver
              const half = lo && lo.kind === 'session' && lo.id === s.id ? lo.half : halfOf(e)
              const anchor = half === 'before' ? s.id : nextSessionId(sessList, s.id)
              moveSessionBefore(wsId, p.id, anchor)
              resetDrag()
            }
            // non-session payloads pass through to the workspace row / folder card
          },
        }, kids)
      }
    
      const renderWorkspaceGroup = (ws, fid, tone) => {
        const expanded = !!expWorkspaces[ws.workspaceId]
        const sess = ws.sessionIds.map((id) => sessions[id]).filter(Boolean).filter((s) => !archivedSet[s.id])
        const isEditing = editing && editing.kind === 'workspace' && editing.id === ws.workspaceId
        const menuOpen = menuFor === ws.workspaceId
        const marker = dropMarker && dropMarker.kind === 'workspace' && dropMarker.id === ws.workspaceId
        const curUsage = sumUsage(ws.sessionIds.filter((id) => !archivedSet[id]), tokenMap)
        const curTotal = usageTotal(curUsage)
        const curCost = costFor(ws.sessionIds.filter((id) => !archivedSet[id]))
        const costReady = costLoaded(ws.sessionIds)
        const hasTok = ws.sessionIds.some((id) => tokenMap[id])
        const tokOpen = tokPop !== null && tokPop.wsId === ws.workspaceId
        const headKids = [
          React.createElement(Icon, { key: 'chev', d: IC_CHEVRON, size: 10, className: 'wsfm-chev' + (expanded ? '' : ' closed') }),
        ]
        if (isEditing) {
          headKids.push(React.createElement(InlineEditor, {
            key: 'edit',
            initial: ws.title,
            placeholder: '工作区名称',
            onCommit: (t) => commitEdit(t),
            onCancel: cancelEdit,
          }))
          headKids.push(React.createElement(IconBtn, { key: 'ok', title: '确定', icon: IC_CHECK, ok: true, onClick: () => commitEdit('') }))
          headKids.push(React.createElement(IconBtn, { key: 'no', title: '取消', icon: IC_CLOSE, onClick: cancelEdit }))
        } else {
          headKids.push(React.createElement('span', { key: 'count', className: 'wsfm-count' }, String(sess.length)))
          headKids.push(React.createElement('span', {
            key: 'av',
            className: 'wsfm-wav',
            style: { background: tone.tint, color: tone.color },
          }, (ws.title || '?').slice(0, 1).toUpperCase()))
          headKids.push(React.createElement('span', { key: 'mid', className: 'wsfm-wmid' },
            React.createElement('span', { className: 'wsfm-wtitle' }, ws.title),
            hasTok ? React.createElement('span', { className: 'wsfm-tokline' },
              React.createElement('span', {
                className: 'wsfm-tokwrap',
                onMouseEnter: (e) => {
                  loadCost(ws.sessionIds)
                  cancelTokHide()
                  const r = e.currentTarget.getBoundingClientRect()
                  const vw = window.innerWidth
                  const vh = window.innerHeight
                  const popH = 340
                  const up = r.bottom + 4 + popH > vh
                  setTokPop({
                    wsId: ws.workspaceId,
                    left: Math.max(8, Math.min(r.left, vw - 330 - 8)),
                    top: up ? undefined : r.bottom + 4,
                    bottom: up ? vh - r.top + 4 : undefined,
                  })
                },
                onMouseLeave: () => startTokHide(),
              },
                React.createElement('span', { className: 'wsfm-tok', title: 'Token 消耗（当前会话，悬停看明细）' }, fmtTokens(curTotal)),
                costReady && curCost > 0
                  ? React.createElement('span', { className: 'wsfm-money', title: '估算花费（当前会话）' }, fmtMoney(curCost))
                  : null,
              ),
            ) : null,
          ))
          headKids.push(React.createElement('span', { key: 'acts', className: 'wsfm-wacts' },
            React.createElement(IconBtn, { title: '在此工作区新建会话', icon: IC_SESSION, onClick: () => startSession(ws.workspaceId) }),
            React.createElement(IconBtn, { title: '移动到分组', icon: IC_MOVE, className: 'wsfm-mbtn' + (menuOpen ? ' mbtn-open' : ''), onClick: () => setMenuFor(menuOpen ? null : ws.workspaceId) }),
            React.createElement(IconBtn, { title: '重命名工作区', icon: IC_PENCIL, onClick: () => beginEdit({ kind: 'workspace', id: ws.workspaceId }) }),
            React.createElement(IconBtn, { title: '删除工作区（保留目录与会话日志）', icon: IC_TRASH, danger: true, onClick: () => deleteWorkspace(ws) }),
          ))
        }
        const menuItems = [
          { id: null, label: '未分组' },
        ]
        data.folders.forEach((f) => menuItems.push({ id: f.id, label: f.name, color: f.color }))
        return React.createElement('div', {
          key: ws.workspaceId,
          className: 'wsfm-ws' + (marker ? ' wsfm-ws-target' : '') + (tokOpen ? ' wsfm-ws-hovered' : '') + (dragState && dragState.kind === 'workspace' && dragState.id === ws.workspaceId ? ' wsfm-dragging' : ''),
          draggable: true,
          onDragStart: (e) => {
            e.stopPropagation()
            e.dataTransfer.setData(MIME, 'workspace:' + ws.workspaceId)
            e.dataTransfer.effectAllowed = 'move'
            dragRef.current = { kind: 'workspace', id: ws.workspaceId }
            setDragState(dragRef.current)
          },
          onDragEnd: resetDrag,
          onDragOver: (e) => {
            const d = dragRef.current
            if (!d || d.kind !== 'workspace' || d.id === ws.workspaceId) return
            e.preventDefault()
            e.stopPropagation()
            markOver({ kind: 'workspace', id: ws.workspaceId, half: halfOf(e, e.currentTarget) }, e, e.currentTarget)
            setDragOver(null)
          },
          onDrop: (e) => {
            const p = parsePayload(e)
            if (p && p.kind === 'workspace' && p.id !== ws.workspaceId) {
              e.preventDefault()
              e.stopPropagation()
              const lo = dragRef.lastOver
              const half = lo && lo.kind === 'workspace' && lo.id === ws.workspaceId ? lo.half : halfOf(e, e.currentTarget)
              const targetFid = data.assign[ws.workspaceId] || null
              const list = folderOrdered(targetFid)
              const idx = list.findIndex((w) => w.workspaceId === ws.workspaceId)
              const anchor = half === 'before'
                ? ws.workspaceId
                : (idx !== -1 && idx + 1 < list.length ? list[idx + 1].workspaceId : null)
              moveWorkspaceInto(targetFid, p.id, anchor)
              resetDrag()
            }
            // non-workspace payloads (folder/session) pass through to the folder card
          },
        },
          React.createElement('div', {
            className: 'wsfm-whead',
            onClick: () => setExpWorkspaces((prev) => Object.assign({}, prev, { [ws.workspaceId]: !prev[ws.workspaceId] })),
            title: ws.path,
          }, headKids),
          expanded ? React.createElement('div', { className: 'wsfm-slist' }, sess.map((s) => renderSessionRow(s, ws.workspaceId, sess))) : null,
          menuOpen ? React.createElement('div', { className: 'wsfm-menu', role: 'menu', 'aria-label': '移动到分组' },
            menuItems.map((item) => React.createElement('div', {
              key: item.id || 'none',
              role: 'menuitem',
              className: 'wsfm-menu-item' + (fid === item.id ? ' cur' : ''),
              onClick: (e) => { e.stopPropagation(); assignTo(ws.workspaceId, item.id); setMenuFor(null) },
            },
              item.color
                ? React.createElement('span', { className: 'wsfm-dot', style: { background: item.color } })
                : React.createElement('span', { className: 'wsfm-dot', style: { background: '#9aa3b2', opacity: 0.6 } }),
              React.createElement('span', { className: 'wsfm-menu-label' }, item.label),
              fid === item.id ? React.createElement(Icon, { d: IC_CHECK, size: 10, className: 'wsfm-menu-check' }) : null,
            )),
          ) : null,
        )
      }
    
      const dropTargetProps = (key) => ({
        onDragOver: (e) => {
          const d = dragRef.current
          if (!d) return
          if (d.kind === 'workspace') {
            e.preventDefault()
            e.stopPropagation()
            setDragOver(key)
            setDropMarker(null)
            dragRef.lastOver = null
            setDropLine(null)
          }
        },
        onDrop: (e) => {
          e.preventDefault()
          e.stopPropagation()
          const p = parsePayload(e)
          if (p && p.kind === 'workspace' && p.id) {
            moveWorkspaceInto(key === 'none' ? null : key, p.id, null)
          }
          resetDrag()
        },
      })
    
      const renderFolderGroup = (f, index) => {
        const list = wsByFolder[f.id] || []
        const expanded = !!expFolders[f.id]
        const isEditing = editing && editing.kind === 'folder' && editing.id === f.id
        const tone = { color: f.color, tint: f.color + '26' }
        const headKids = [
          React.createElement(Icon, { key: 'chev', d: IC_CHEVRON, size: 11, className: 'wsfm-chev' + (expanded ? '' : ' closed') }),
        ]
        if (isEditing) {
          headKids.push(React.createElement(InlineEditor, {
            key: 'edit',
            initial: f.name,
            placeholder: '分组名称',
            onCommit: (t) => commitEdit(t),
            onCancel: cancelEdit,
          }))
          headKids.push(React.createElement(IconBtn, { key: 'ok', title: '确定', icon: IC_CHECK, ok: true, onClick: () => commitEdit('') }))
          headKids.push(React.createElement(IconBtn, { key: 'no', title: '取消', icon: IC_CLOSE, onClick: cancelEdit }))
        } else {
          headKids.push(React.createElement('span', { key: 'count', className: 'wsfm-count' }, String(list.length)))
          headKids.push(React.createElement('span', { key: 'dot', className: 'wsfm-dot', style: { background: f.color } }))
          headKids.push(React.createElement('span', { key: 'name', className: 'wsfm-fname', title: f.name }, f.name))
          headKids.push(React.createElement('span', { key: 'acts', className: 'wsfm-facts' },
            React.createElement(IconBtn, { title: '在此分组新建工作区', icon: IC_PLUS, onClick: () => addWorkspace(f.id) }),
            React.createElement(IconBtn, { title: '重命名分组', icon: IC_PENCIL, onClick: () => beginEdit({ kind: 'folder', id: f.id }) }),
            React.createElement(IconBtn, { title: '删除分组', icon: IC_TRASH, danger: true, onClick: () => deleteFolder(f.id) }),
          ))
        }
        return React.createElement('div', {
          key: f.id,
          className: 'wsfm-fcard' + (dragState && dragState.kind === 'folder' && dragState.id === f.id ? ' wsfm-dragging' : ''),
          style: { animationDelay: String(index * 35) + 'ms' },
          draggable: true,
          onDragStart: (e) => {
            e.stopPropagation()
            e.dataTransfer.setData(MIME, 'folder:' + f.id)
            e.dataTransfer.effectAllowed = 'move'
            dragRef.current = { kind: 'folder', id: f.id }
            setDragState(dragRef.current)
          },
          onDragEnd: resetDrag,
          onDragOver: (e) => {
            const d = dragRef.current
            if (!d || d.id === f.id) return
            if (d.kind === 'folder') {
              e.preventDefault()
              e.stopPropagation()
              markOver({ kind: 'folder', id: f.id, half: halfOf(e, e.currentTarget) }, e, e.currentTarget)
              setDragOver(null)
            } else if (d.kind === 'workspace') {
              e.preventDefault()
              e.stopPropagation()
              // Workspace dropped on a folder = insert at the TOP of the folder;
              // the line snaps to the folder head's bottom edge (= list top).
              setDragOver(f.id)
              const head = e.currentTarget.querySelector('.wsfm-fhead')
              markOver({ kind: 'ws-assign', id: f.id, half: 'after' }, e, head)
            }
          },
          onDrop: (e) => {
            e.preventDefault()
            e.stopPropagation()
            const p = parsePayload(e)
            if (p && p.kind === 'workspace' && p.id) {
              const firstId = (wsByFolder[f.id] && wsByFolder[f.id].length ? wsByFolder[f.id][0].workspaceId : null)
              moveWorkspaceInto(f.id, p.id, firstId)
            } else if (p && p.kind === 'folder' && p.id && p.id !== f.id) {
              const lo = dragRef.lastOver
              const half = lo && lo.kind === 'folder' && lo.id === f.id ? lo.half : halfOf(e, e.currentTarget)
              const next = data.folders[data.folders.findIndex((x) => x.id === f.id) + 1]
              moveFolder(p.id, half === 'after' && next ? next.id : f.id)
            }
            resetDrag()
          },
        },
          React.createElement('div', Object.assign({
            className: 'wsfm-fhead' + (dragOver === f.id ? ' wsfm-drop' : ''),
            onClick: () => setExpFolders((prev) => Object.assign({}, prev, { [f.id]: !prev[f.id] })),
          }, {}), headKids),
          expanded ? React.createElement('div', { className: 'wsfm-wlist' }, list.map((ws) => renderWorkspaceGroup(ws, f.id, tone))) : null,
        )
      }
    
      const wsByFolder = {}
      data.folders.forEach((f) => { wsByFolder[f.id] = folderOrdered(f.id) })
      wsByFolder['none'] = folderOrdered(null)
    
      const accounted = {}
      items.forEach((ws) => ws.sessionIds.forEach((id) => { accounted[id] = true }))
      const ungroupedSessionIds = ids.filter((id) => sessions[id] && !accounted[id] && !archivedSet[id])
    
      const titleMatches = q
        ? ids.filter((id) => {
            const s = sessions[id]
            return s && !archivedSet[id] && (s.displayTitle || '').toLowerCase().indexOf(q) !== -1
          })
        : []
    
      const rail = React.createElement('div', { className: 'wsfm-rail' },
        items.map((ws) => {
          const fid = data.assign[ws.workspaceId]
          const folder = fid ? data.folders.find((f) => f.id === fid) : undefined
          const color = folder ? folder.color : '#9aa3b2'
          return React.createElement('button', {
            key: ws.workspaceId,
            type: 'button',
            className: 'wsfm-rail-btn',
            title: (folder ? folder.name + ' · ' : '未分组 · ') + ws.title + '\n' + ws.path,
            style: { background: color + '1f' },
            onClick: () => {
              if (typeof expandSidebar === 'function') expandSidebar()
              setExpWorkspaces((prev) => Object.assign({}, prev, { [ws.workspaceId]: true }))
              if (folder) setExpFolders((prev) => Object.assign({}, prev, { [folder.id]: true }))
            },
          },
            React.createElement('span', { className: 'wsfm-rail-dot', style: { background: color } }),
            (ws.title || '?').slice(0, 1),
          )
        }),
      )
    
      const treeBody = (() => {
        if (q) {
          const parts = []
          if (titleMatches.length > 0) {
            parts.push(React.createElement('div', { key: 'sec1', className: 'wsfm-sec' }, '标题匹配 (' + String(titleMatches.length) + ')'))
            titleMatches.forEach((id) => parts.push(renderSessionRow(sessions[id], null, [])))
          }
          if (remote.status !== 'idle') {
            parts.push(React.createElement('div', { key: 'sec2', className: 'wsfm-sec' },
              '消息匹配',
              remote.status === 'loading' ? React.createElement('small', null, '搜索中…') : null,
              remote.status === 'ready' ? React.createElement('small', null, '(' + String(remote.items.length) + ')') : null,
            ))
            if (remote.status === 'ready') {
              remote.items.forEach((item) => {
                const s = sessions[item.sessionId]
                parts.push(React.createElement('div', {
                  key: item.sessionId + '-m',
                  className: 'wsfm-sess',
                  onClick: () => openSession(item.sessionId),
                  title: '打开会话',
                },
                  React.createElement('span', { className: 'wsfm-st idle' }),
                  React.createElement('span', { className: 'wsfm-sess-title' }, s ? s.displayTitle : item.sessionId),
                  React.createElement('span', { className: 'wsfm-snip' }, item.snippet || ''),
                ))
              })
              if (remote.items.length === 0) {
                parts.push(React.createElement('div', { key: 'nom', className: 'wsfm-empty' }, '没有找到消息匹配'))
              }
              if (remote.hasMore) {
                parts.push(React.createElement('div', { key: 'more', className: 'wsfm-sec' }, '结果较多，请缩小关键词'))
              }
            }
          }
          if (parts.length === 0) {
            parts.push(React.createElement('div', { key: 'empty', className: 'wsfm-empty' }, '没有匹配结果'))
          }
          return parts
        }
    
        const parts = []
        if (editing && editing.kind === 'new-folder') {
          parts.push(React.createElement('div', { key: 'newrow', className: 'wsfm-newrow' },
            React.createElement(Icon, { d: IC_FOLDER, size: 12 }),
            React.createElement(InlineEditor, {
              initial: '',
              placeholder: '输入分组名称，回车创建',
              onCommit: (t) => commitEdit(t),
              onCancel: cancelEdit,
            }),
            React.createElement(IconBtn, { title: '确定', icon: IC_CHECK, ok: true, onClick: () => commitEdit('') }),
            React.createElement(IconBtn, { title: '取消', icon: IC_CLOSE, onClick: cancelEdit }),
          ))
        }
        data.folders.forEach((f, i) => parts.push(renderFolderGroup(f, i)))
        const noneList = wsByFolder['none'] || []
        const noneExpanded = !!expWorkspaces['__none__']
        parts.push(React.createElement('div', { key: 'none', className: 'wsfm-fcard', style: { animationDelay: String(data.folders.length * 35) + 'ms' } },
          React.createElement('div', Object.assign({
            className: 'wsfm-fhead' + (dragOver === 'none' ? ' wsfm-drop' : ''),
            onClick: () => setExpWorkspaces((prev) => Object.assign({}, prev, { __none__: !prev.__none__ })),
          }, dropTargetProps('none')),
            React.createElement(Icon, { d: IC_CHEVRON, size: 11, className: 'wsfm-chev' + (noneExpanded ? '' : ' closed') }),
            React.createElement('span', { className: 'wsfm-count' }, String(noneList.length)),
            React.createElement('span', { className: 'wsfm-dot', style: { background: '#9aa3b2', opacity: 0.6 } }),
            React.createElement('span', { className: 'wsfm-fname' }, '未分组'),
            React.createElement('span', { className: 'wsfm-facts' },
              React.createElement(IconBtn, { title: '新建工作区（未分组）', icon: IC_PLUS, onClick: () => addWorkspace(null) }),
            ),
          ),
          noneExpanded ? React.createElement('div', { className: 'wsfm-wlist' }, noneList.map((ws) => renderWorkspaceGroup(ws, null, { color: '#9aa3b2', tint: 'rgba(148,163,184,.16)' }))) : null,
        ))
        if (ungroupedSessionIds.length > 0) {
          parts.push(React.createElement('div', { key: 'sec-u', className: 'wsfm-sec' }, '未归类会话 (' + String(ungroupedSessionIds.length) + ')'))
          ungroupedSessionIds.forEach((id) => parts.push(renderSessionRow(sessions[id], null, [])))
        }
        if (items.length === 0 && data.folders.length === 0 && !(editing && editing.kind === 'new-folder')) {
          parts.push(React.createElement('div', { key: 'empty', className: 'wsfm-empty' },
            React.createElement('span', { className: 'wsfm-empty-ic' }, React.createElement(Icon, { d: IC_FOLDER, size: 15 })),
            React.createElement('p', null, React.createElement('b', null, '还没有工作区'), '，点击上方按钮开始管理'),
          ))
        }
        return parts
      })()
    
      if (!wide) return rail
    
      const allFoldersOpen = data.folders.length > 0 && data.folders.every((f) => !!expFolders[f.id])
    
      const popWs = tokPop ? items.find((w) => w.workspaceId === tokPop.wsId) : null
    
      return React.createElement('div', { className: 'wsfm-root' },
        React.createElement('header', { className: 'wsfm-head' },
          React.createElement('span', { className: 'wsfm-title' },
            React.createElement('span', { className: 'wsfm-title-chip' }, React.createElement(Icon, { d: IC_FOLDER, size: 11 })),
            '工作区',
          ),
          React.createElement('span', { className: 'wsfm-head-actions' },
            React.createElement('button', {
              type: 'button',
              className: 'wsfm-hbtn-ic' + (panelOpen ? ' on' : ''),
              title: 'Token 总览',
              'aria-label': 'Token 总览',
              onClick: () => setPanelOpen(!panelOpen),
            }, React.createElement(Icon, { d: IC_CHART, size: 13 })),
            React.createElement('button', {
              type: 'button',
              className: 'wsfm-hbtn-ic' + (allFoldersOpen ? ' on' : ''),
              title: allFoldersOpen ? '折叠全部分组' : '展开全部分组',
              'aria-label': allFoldersOpen ? '折叠全部分组' : '展开全部分组',
              onClick: toggleAll,
            }, React.createElement(Icon, { d: allFoldersOpen ? IC_FOLD : IC_UNFOLD, size: 13 })),
            React.createElement('button', { type: 'button', className: 'wsfm-hbtn', title: '新建会话', onClick: () => startSession(undefined) },
              React.createElement(Icon, { d: IC_SESSION, size: 11 }),
              '会话',
            ),
            React.createElement('button', { type: 'button', className: 'wsfm-hbtn', title: '添加工作区', onClick: () => addWorkspace(null) },
              React.createElement(Icon, { d: IC_PLUS, size: 11 }),
              '工作区',
            ),
            React.createElement('button', {
              type: 'button',
              className: 'wsfm-hbtn wsfm-hbtn-primary' + (editing && editing.kind === 'new-folder' ? ' wsfm-hbtn-on' : ''),
              title: '新建分组',
              onClick: () => (editing && editing.kind === 'new-folder' ? cancelEdit() : beginEdit({ kind: 'new-folder' })),
            },
              React.createElement(Icon, { d: IC_FOLDER, size: 11 }),
              '分组',
            ),
          ),
        ),
        React.createElement('div', { className: 'wsfm-srch' },
          React.createElement(Icon, { d: IC_SEARCH, size: 12 }),
          React.createElement('input', {
            type: 'text',
            placeholder: '搜索会话…',
            value: query,
            onChange: (e) => setQuery(e.target.value),
            'aria-label': '搜索会话',
          }),
          query ? React.createElement('button', { type: 'button', className: 'wsfm-clear', title: '清除', 'aria-label': '清除搜索', onClick: () => setQuery('') },
            React.createElement(Icon, { d: IC_CLOSE, size: 10 }),
          ) : null,
        ),
        React.createElement('div', { className: 'wsfm-tree' }, treeBody),
        dropLine !== null
          ? React.createElement('span', { className: 'wsfm-floatline', style: { top: dropLine.top, left: dropLine.left, width: dropLine.width } })
          : null,
        tokPop && popWs
          ? React.createElement('div', {
              className: 'wsfm-tokpop',
              style: { left: tokPop.left, top: tokPop.top, bottom: tokPop.bottom },
              onMouseEnter: cancelTokHide,
              onMouseLeave: startTokHide,
            }, renderTokPopChildren(popWs))
          : null,
        panelOpen
          ? React.createElement('div', { className: 'wsfm-panel-scrim', onClick: () => setPanelOpen(false), 'aria-hidden': true })
          : null,
        panelOpen ? renderTokenPanel() : null,
      )
    }
    
    return {
      name: "workspace-hub",
      inject: ['slots'],
      apply(ctx) {
        // CSS injection owned by this fiber (removed on unload).
        const style = document.createElement('style')
        style.setAttribute('data-dsh-wsfm-css', '')
        style.textContent = CSS
        document.head.appendChild(style)
        ctx.effect(() => () => { style.remove() }, 'wsfm: css')
        const slots = ctx.get('slots')
        if (slots === undefined) return
        slots.inject('sidebar.workspaces', () => slots.register(
          // Single slot: shadow the built-in workspace list (x6) at priority 0
          // by registering lower (ascending priority, lowest renders).
          { name: 'sidebar.workspaces', priority: -100 },
          (props) => React.createElement(Browser, {
            wide: props.wide,
            expandSidebar: props.expandSidebar,
            useSessions: props.useSessions,
            useWorkspaces: props.useWorkspaces,
            workspacesApi: ctx.get('workspaces'),
            sessionsApi: ctx.get('sessions'),
          }),
        ))
      },
    }
  },
})
