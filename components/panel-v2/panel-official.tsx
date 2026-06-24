"use client"

import { useEffect, useRef, useState } from "react"
import { AnalyticsBoard } from "@/components/dashboard-v2/analytics-board"
import { DashboardOverview } from "@/components/dashboard-v2/dashboard-overview"
import { CatalogBoard } from "@/components/dashboard-v2/catalog-board"
import { StoreSettingsBoard } from "@/components/dashboard-v2/store-settings-board"
import { OrdersBoard } from "@/components/dashboard-v2/orders-board"
import { DesignBoard } from "@/components/dashboard-v2/design-board"
import { useAuth } from "@/contexts/auth-context"

type View = "dashboard" | "catalog" | "orders" | "design" | "data" | "config"

const STYLES = `
.bpanel { background: var(--bg); overflow-x: hidden; min-height: 100vh; color: var(--ink); font-family: var(--font-sans); }
.bpanel.bp-mobile { background: #0a0a0a; padding: 32px 0; }
.bpanel .demo-toggle { position: fixed; top: 14px; right: 14px; z-index: 10000; background: var(--ink); color: #fff; border-radius: 999px; padding: 6px; display: flex; gap: 4px; box-shadow: 0 8px 22px -8px rgba(0,0,0,0.4); font-family: var(--font-mono); font-size: 11px; font-weight: 600; }
.bpanel .demo-toggle button { background: transparent; color: rgba(255,255,255,0.5); border: none; padding: 7px 14px; border-radius: 999px; cursor: pointer; font: inherit; transition: all .15s; }
.bpanel .demo-toggle button.active { background: var(--brand); color: #fff; }
.bpanel.bp-mobile .device-frame { width: 390px; height: 844px; margin: 0 auto; background: #fff; border-radius: 44px; box-shadow: 0 0 0 12px #1a1a1a, 0 30px 80px -20px rgba(0,0,0,0.6); overflow: hidden; position: relative; border: 2px solid #2a2a2a; }
.bpanel.bp-mobile .device-frame::before { content: ''; position: absolute; top: 16px; left: 50%; transform: translateX(-50%); width: 110px; height: 28px; background: #0a0a0a; border-radius: 16px; z-index: 1000; }
.bpanel:not(.bp-mobile) .device-frame { width: 100%; min-height: 100vh; }
.bpanel .top-dock { position: fixed; top: 18px; left: 50%; transform: translateX(-50%); z-index: 100; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(0,0,0,0.06); border-radius: 999px; padding: 6px; display: flex; align-items: center; gap: 4px; box-shadow: 0 14px 40px -16px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.4) inset; }
.bpanel.bp-mobile .top-dock { display: none; }
.bpanel .td-logo { width: 36px; height: 36px; border-radius: 999px; background: var(--ink); color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 16px; font-family: var(--font-serif); font-style: italic; margin-right: 4px; }
.bpanel .td-tab { background: transparent; border: none; padding: 8px 14px; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 600; color: var(--ink-2); cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all var(--dur-fast); }
.bpanel .td-tab svg { width: 16px; height: 16px; opacity: 0.7; }
.bpanel .td-tab:hover { background: rgba(0,0,0,0.04); color: var(--ink); }
.bpanel .td-tab.active { background: var(--ink); color: #fff; }
.bpanel .td-tab.active svg { opacity: 1; }
.bpanel .td-divider { width: 1px; height: 22px; background: var(--line); margin: 0 4px; }
.bpanel .td-pill { display: flex; align-items: center; gap: 8px; padding: 7px 13px; background: rgba(0,0,0,0.04); border-radius: 999px; font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--ink-2); }
.bpanel .td-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.18); animation: bpPulse 2s ease infinite; }
@keyframes bpPulse { 0%, 100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.18); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.05); } }
.bpanel .td-pill svg { width: 12px; height: 12px; opacity: 0.5; }
.bpanel .stage { min-height: 100vh; padding: 96px 32px 48px; position: relative; }
.bpanel.bp-mobile .stage { padding: 56px 0 80px; min-height: 0; height: 100%; overflow-y: auto; }
.bpanel .view { display: none; }
.bpanel .view.active { display: block; }
.bpanel .dash-grid { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr; gap: 18px; }
.bpanel.bp-mobile .dash-grid { grid-template-columns: 1fr; gap: 12px; padding: 0 14px; }
.bpanel .dash-header { grid-column: 1 / -1; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 6px; flex-wrap: wrap; }
.bpanel .dash-header .h-eyebrow { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
.bpanel .dash-header h1 { font-size: 30px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
.bpanel .dash-header h1 em { font-family: var(--font-serif); font-style: italic; color: var(--brand); font-weight: 400; }
.bpanel.bp-mobile .dash-header h1 { font-size: 22px; }
.bpanel .h-actions { display: flex; gap: 8px; }
.bpanel .h-btn { padding: 9px 14px; background: var(--ink); color: #fff; border: none; border-radius: 10px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.bpanel .h-btn.ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
.bpanel .h-btn svg { width: 14px; height: 14px; }
.bpanel .kpi-strip { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.bpanel.bp-mobile .kpi-strip { grid-template-columns: 1fr 1fr; }
.bpanel .kpi { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; position: relative; overflow: hidden; }
.bpanel .kpi::before { content:''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--accent); }
.bpanel .kpi.up::before { background: #10b981; }
.bpanel .kpi.down::before { background: var(--accent); }
.bpanel .kpi.flat::before { background: var(--ink-3); }
.bpanel .kpi-label { font-family: var(--font-mono); font-size: 10px; color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }
.bpanel .kpi-label .delta { font-weight: 700; padding: 1px 6px; border-radius: 4px; font-size: 9px; }
.bpanel .kpi.up .delta { background: rgba(16,185,129,0.12); color: #047857; }
.bpanel .kpi.down .delta { background: rgba(220,74,61,0.12); color: var(--accent); }
.bpanel .kpi.flat .delta { background: rgba(0,0,0,0.06); color: var(--ink-2); }
.bpanel .kpi-value { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
.bpanel .kpi-value .unit { font-size: 12px; color: var(--ink-3); font-weight: 500; margin-left: 2px; }
.bpanel .kpi-spark { margin-top: 8px; height: 24px; width: 100%; }
.bpanel .panel { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; }
.bpanel .panel h3 { margin: 0 0 12px; font-size: 13px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; }
.bpanel .panel h3 .more { font-size: 11px; font-weight: 500; color: var(--ink-3); cursor: pointer; }
.bpanel .chart { height: 200px; position: relative; background: linear-gradient(180deg, transparent 0%, rgba(30,58,138,0.02) 100%); border-radius: 8px; }
.bpanel .chart svg { width: 100%; height: 100%; display: block; }
.bpanel .chart-meta { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 10px; color: var(--ink-3); margin-top: 6px; }
.bpanel .ord { display: grid; grid-template-columns: auto 1fr auto auto; gap: 10px; align-items: center; padding: 9px 0; border-bottom: 1px dashed var(--line); font-size: 13px; }
.bpanel .ord:last-child { border-bottom: none; }
.bpanel .ord-avatar { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, var(--brand), var(--brand-2)); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 11px; }
.bpanel .ord-name { font-weight: 600; }
.bpanel .ord-meta { font-family: var(--font-mono); font-size: 10px; color: var(--ink-3); }
.bpanel .ord-amount { font-weight: 700; font-family: var(--font-mono); font-size: 12px; }
.bpanel .ord-status { font-size: 10px; padding: 2px 8px; border-radius: 999px; font-weight: 700; }
.bpanel .ord-status.paid { background: rgba(16,185,129,0.12); color: #047857; }
.bpanel .ord-status.pending { background: rgba(251,191,36,0.18); color: #92400e; }
.bpanel .ord-status.shipped { background: rgba(30,58,138,0.1); color: var(--brand); }
.bpanel .side-stack { display: flex; flex-direction: column; gap: 18px; }
.bpanel.bp-mobile .side-stack { gap: 12px; }
.bpanel .top-products li { display: grid; grid-template-columns: 28px 1fr auto; gap: 10px; align-items: center; padding: 7px 0; font-size: 12px; border-bottom: 1px dashed var(--line); }
.bpanel .top-products li:last-child { border-bottom: none; }
.bpanel .top-products .rank { font-family: var(--font-mono); font-size: 10px; color: var(--ink-3); font-weight: 700; }
.bpanel .top-products .name { font-weight: 600; }
.bpanel .top-products .units { font-family: var(--font-mono); font-size: 10px; color: var(--ink-3); }
.bpanel .top-products .bar { height: 3px; background: var(--bg-2); border-radius: 999px; margin-top: 3px; overflow: hidden; }
.bpanel .top-products .bar-fill { height: 100%; background: var(--brand); border-radius: 999px; }
.bpanel .traffic-bars { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.bpanel .tr-row { display: grid; grid-template-columns: 70px 1fr 36px; gap: 8px; align-items: center; font-size: 11px; }
.bpanel .tr-label { font-weight: 600; }
.bpanel .tr-bar { height: 6px; background: var(--bg-2); border-radius: 999px; overflow: hidden; }
.bpanel .tr-bar-fill { height: 100%; border-radius: 999px; background: var(--brand); }
.bpanel .tr-pct { font-family: var(--font-mono); color: var(--ink-3); font-size: 10px; text-align: right; }
.bpanel .next-up li { display: grid; grid-template-columns: 18px 1fr auto; gap: 8px; align-items: center; padding: 7px 0; font-size: 12px; border-bottom: 1px dashed var(--line); cursor: pointer; }
.bpanel .next-up li:last-child { border-bottom: none; }
.bpanel .next-up .ck { width: 14px; height: 14px; border: 1.5px solid var(--line-2); border-radius: 4px; }
.bpanel .next-up .ck.done { background: var(--brand); border-color: var(--brand); }
.bpanel .next-up .ck.done::after { content: '✓'; color: #fff; font-size: 10px; display: grid; place-items: center; font-weight: 800; }
.bpanel .next-up .badge { font-family: var(--font-mono); font-size: 9px; padding: 2px 6px; border-radius: 4px; background: rgba(220,74,61,0.1); color: var(--accent); font-weight: 700; }
.bpanel .cat-wrap { max-width: 1400px; margin: 0 auto; }
.bpanel.bp-mobile .cat-wrap { padding: 0 14px; }
.bpanel .cat-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 18px; flex-wrap: wrap; }
.bpanel .cat-header h1 { font-size: 30px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
.bpanel .cat-header h1 em { font-family: var(--font-serif); font-style: italic; color: var(--brand); font-weight: 400; }
.bpanel.bp-mobile .cat-header h1 { font-size: 22px; }
.bpanel .cat-header .meta { font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); margin-top: 4px; }
.bpanel .cat-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.bpanel .search-box { flex: 1; min-width: 200px; position: relative; }
.bpanel .search-box svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--ink-3); }
.bpanel .search-box input { width: 100%; padding: 9px 12px 9px 34px; background: var(--bg-elev); border: 1px solid var(--line); border-radius: 10px; font: inherit; font-size: 13px; }
.bpanel .search-box input:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px rgba(30,58,138,0.08); }
.bpanel .filter-chip { padding: 8px 12px; background: var(--bg-elev); border: 1px solid var(--line); border-radius: 10px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; color: var(--ink-2); }
.bpanel .filter-chip svg { width: 12px; height: 12px; }
.bpanel .filter-chip:hover { border-color: var(--ink-2); }
.bpanel .view-toggle { display: flex; background: var(--bg-elev); border: 1px solid var(--line); border-radius: 10px; padding: 3px; }
.bpanel .view-toggle button { background: transparent; border: none; padding: 5px 10px; border-radius: 7px; cursor: pointer; display: grid; place-items: center; color: var(--ink-3); transition: all var(--dur-fast); }
.bpanel .view-toggle button svg { width: 14px; height: 14px; }
.bpanel .view-toggle button.active { background: var(--ink); color: #fff; }
.bpanel .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.bpanel.bp-mobile .gallery-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
.bpanel .product-card { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; cursor: pointer; transition: all var(--dur-fast); position: relative; }
.bpanel .product-card:hover { border-color: var(--brand); transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(0,0,0,0.12); }
.bpanel .pc-img { aspect-ratio: 4/5; position: relative; overflow: hidden; }
.bpanel .pc-img::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4)); }
.bpanel .pc-badge { position: absolute; top: 10px; left: 10px; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; z-index: 1; }
.bpanel .pc-badge.low { background: rgba(220,74,61,0.95); color: #fff; }
.bpanel .pc-badge.draft { background: rgba(255,255,255,0.95); color: var(--ink-3); }
.bpanel .pc-actions { position: absolute; top: 10px; right: 10px; display: flex; gap: 4px; opacity: 0; transition: opacity var(--dur-fast); z-index: 1; }
.bpanel .product-card:hover .pc-actions { opacity: 1; }
.bpanel .pc-actions button { width: 28px; height: 28px; border-radius: 8px; border: none; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); display: grid; place-items: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
.bpanel .pc-actions svg { width: 13px; height: 13px; }
.bpanel .pc-info { padding: 10px 12px; }
.bpanel .pc-name { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
.bpanel .pc-meta { display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
.bpanel .pc-price { font-weight: 700; font-family: var(--font-mono); }
.bpanel .pc-stock { color: var(--ink-3); font-family: var(--font-mono); font-size: 10px; }
.bpanel .list-table { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.bpanel .lt-head, .bpanel .lt-row { display: grid; grid-template-columns: 32px 60px 1fr 100px 80px 100px 50px; gap: 12px; align-items: center; padding: 10px 14px; font-size: 12px; }
.bpanel .lt-head { background: var(--bg-2); font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-3); font-weight: 700; }
.bpanel .lt-row { border-top: 1px solid var(--line); cursor: pointer; transition: background var(--dur-fast); }
.bpanel .lt-row:hover { background: rgba(30,58,138,0.03); }
.bpanel .lt-checkbox { width: 16px; height: 16px; border: 1.5px solid var(--line-2); border-radius: 4px; }
.bpanel .lt-thumb { width: 44px; height: 44px; border-radius: 8px; }
.bpanel .lt-name { font-weight: 600; font-size: 13px; }
.bpanel .lt-sku { font-family: var(--font-mono); font-size: 10px; color: var(--ink-3); margin-top: 1px; }
.bpanel .lt-price { font-family: var(--font-mono); font-weight: 700; }
.bpanel .lt-stock-pill { font-size: 10px; padding: 2px 8px; border-radius: 999px; font-weight: 700; display: inline-block; }
.bpanel .lt-stock-pill.ok { background: rgba(16,185,129,0.12); color: #047857; }
.bpanel .lt-stock-pill.low { background: rgba(220,74,61,0.12); color: var(--accent); }
.bpanel .lt-stock-pill.zero { background: rgba(0,0,0,0.06); color: var(--ink-3); }
.bpanel .lt-cat { color: var(--ink-2); font-size: 12px; }
.bpanel .lt-more { color: var(--ink-3); }
.bpanel.bp-mobile .list-table .lt-head { display: none; }
.bpanel.bp-mobile .lt-row { grid-template-columns: 50px 1fr auto; padding: 12px; }
.bpanel.bp-mobile .lt-row .lt-checkbox, .bpanel.bp-mobile .lt-row .lt-cat, .bpanel.bp-mobile .lt-row .lt-more { display: none; }
.bpanel.bp-mobile .lt-row .lt-stock-pill { font-size: 9px; }
.bpanel .design-hub { max-width: 1200px; margin: 0 auto; padding: 24px; display: grid; gap: 18px; }
.bpanel .design-hub .dh-head { display: flex; align-items: end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.bpanel .design-hub .dh-head h1 { margin: 0 0 4px; font-size: 28px; letter-spacing: -0.02em; font-weight: 700; }
.bpanel .design-hub .dh-head h1 em { font-family: var(--font-serif); font-style: italic; color: var(--brand); font-weight: 400; }
.bpanel .design-hub .dh-head p { margin: 0; color: var(--ink-2); font-size: 14px; }
.bpanel .design-hub .dh-meta { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); letter-spacing: 0.05em; text-transform: uppercase; }
.bpanel .dh-top { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.bpanel .dh-card { position: relative; background: var(--bg-elev); border: 1px solid var(--line); border-radius: 16px; padding: 22px; cursor: pointer; text-decoration: none; color: inherit; transition: all .18s ease; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
.bpanel .dh-card:hover { border-color: var(--brand); box-shadow: 0 18px 36px -16px rgba(15,27,61,0.18); transform: translateY(-2px); }
.bpanel .dh-card .dh-icon { width: 38px; height: 38px; border-radius: 10px; background: var(--brand); color: #fff; display: grid; place-items: center; flex-shrink: 0; }
.bpanel .dh-card .dh-icon svg { width: 18px; height: 18px; stroke-width: 2; }
.bpanel .dh-card.alt .dh-icon { background: var(--accent); }
.bpanel .dh-card h3 { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }
.bpanel .dh-card h3 em { font-family: var(--font-serif); font-style: italic; color: var(--brand); font-weight: 400; }
.bpanel .dh-card p { margin: 0; color: var(--ink-2); font-size: 13px; line-height: 1.5; }
.bpanel .dh-card .dh-meta-row { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--line); font-size: 12px; color: var(--ink-3); }
.bpanel .dh-card .dh-meta-row strong { color: var(--ink); font-weight: 600; }
.bpanel .dh-card .dh-go { display: inline-flex; align-items: center; gap: 4px; font-weight: 600; color: var(--brand); font-size: 12px; }
.bpanel .dh-thumb { position: relative; height: 110px; border-radius: 10px; overflow: hidden; background: var(--bg-2); border: 1px solid var(--line); }
.bpanel .dh-thumb-builder { padding: 10px; display: grid; grid-template-columns: 70px 1fr; gap: 8px; height: 100%; }
.bpanel .dh-thumb-builder .col { background: #fff; border-radius: 6px; padding: 6px; display: flex; flex-direction: column; gap: 4px; border: 1px solid var(--line); }
.bpanel .dh-thumb-builder .col .ln { height: 6px; border-radius: 2px; background: var(--bg-2); }
.bpanel .dh-thumb-builder .col .ln.brand { background: var(--brand); width: 50%; }
.bpanel .dh-thumb-builder .preview { background: #fff; border-radius: 6px; border: 1px solid var(--line); padding: 6px; display: flex; flex-direction: column; gap: 4px; }
.bpanel .dh-thumb-builder .preview .row { height: 8px; border-radius: 2px; background: var(--bg-2); }
.bpanel .dh-thumb-builder .preview .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; flex: 1; }
.bpanel .dh-thumb-builder .preview .grid div { background: linear-gradient(135deg, var(--brand), var(--brand-2)); border-radius: 3px; opacity: 0.85; }
.bpanel .dh-thumb-themes { padding: 10px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; height: 100%; }
.bpanel .dh-thumb-themes .tt { border-radius: 6px; border: 1px solid var(--line); position: relative; overflow: hidden; }
.bpanel .dh-thumb-themes .tt::after { content: ''; position: absolute; top: 6px; left: 6px; right: 6px; height: 12px; border-radius: 3px; background: rgba(255,255,255,0.7); }
.bpanel .dh-thumb-themes .tt.a { background: linear-gradient(135deg, #f5d5c5, #c97864); }
.bpanel .dh-thumb-themes .tt.b { background: #111; }
.bpanel .dh-thumb-themes .tt.b::after { background: rgba(255,255,255,0.15); }
.bpanel .dh-thumb-themes .tt.c { background: linear-gradient(135deg, #d4e6d4, #5a8a5a); }
.bpanel .dh-card-premium { background: linear-gradient(135deg, #0F1B3D 0%, #1E3A8A 100%); border-color: transparent; color: #fff; }
.bpanel .dh-card-premium:hover { border-color: #E8C07A; box-shadow: 0 24px 48px -16px rgba(15,27,61,0.5); }
.bpanel .dh-card-premium .dh-icon { background: #E8C07A; color: #0F1B3D; }
.bpanel .dh-card-premium h3 em { color: #E8C07A; }
.bpanel .dh-card-premium p { color: rgba(255,255,255,0.75); }
.bpanel .dh-card-premium .dh-meta-row { border-top-color: rgba(232,192,122,0.18); color: rgba(255,255,255,0.7); }
.bpanel .dh-card-premium .dh-meta-row strong { color: #E8C07A; }
.bpanel .dh-thumb-premium { background: linear-gradient(135deg, rgba(232,192,122,0.12), rgba(232,192,122,0.04)); border: 1px solid rgba(232,192,122,0.25); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.bpanel .dh-thumb-premium .pm-glow { position: absolute; inset: -40%; background: radial-gradient(circle at center, rgba(232,192,122,0.35) 0%, transparent 60%); filter: blur(20px); }
.bpanel .dh-thumb-premium .pm-content { position: relative; z-index: 1; text-align: center; }
.bpanel .dh-thumb-premium .pm-tag { display: inline-block; padding: 5px 12px; border-radius: 999px; background: rgba(232,192,122,0.18); border: 1px solid rgba(232,192,122,0.35); color: #E8C07A; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }
.bpanel .dh-thumb-premium .pm-stars { font-family: var(--font-serif); font-size: 26px; color: #E8C07A; letter-spacing: 0.1em; text-shadow: 0 2px 12px rgba(232,192,122,0.4); }
.bpanel.bp-mobile .design-hub { padding: 16px 14px 100px; }
.bpanel.bp-mobile .design-hub .dh-head h1 { font-size: 22px; }
.bpanel.bp-mobile .dh-top { display: contents; }
.bpanel.bp-mobile .dh-card { padding: 18px; }
.bpanel.bp-mobile .dh-card-premium { order: 10; }
.bpanel.bp-mobile .dh-thumb { height: 90px; }
@media (max-width: 980px) { .bpanel .dh-top { display: contents; } .bpanel .dh-card-premium { order: 10; } }
.bpanel .m-bottom-nav, .bpanel .m-fab, .bpanel .m-topbar { display: none; }
.bpanel.bp-mobile .m-topbar { display: flex; position: absolute; top: 50px; left: 0; right: 0; z-index: 50; padding: 10px 16px; align-items: center; gap: 10px; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
.bpanel .m-topbar .m-logo { width: 30px; height: 30px; border-radius: 50%; background: var(--ink); color: #fff; display: grid; place-items: center; font-family: var(--font-serif); font-style: italic; font-weight: 800; font-size: 14px; }
.bpanel .m-topbar .m-store-pill { flex: 1; padding: 6px 10px; background: var(--bg-2); border-radius: 999px; display: flex; align-items: center; gap: 6px; font-size: 11px; font-family: var(--font-mono); color: var(--ink-2); overflow: hidden; }
.bpanel .m-topbar .m-store-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; flex-shrink: 0; }
.bpanel .m-topbar .m-store-pill .url { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bpanel .m-topbar .m-icon-btn { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-2); border: none; display: grid; place-items: center; cursor: pointer; }
.bpanel .m-topbar .m-icon-btn svg { width: 14px; height: 14px; }
.bpanel.bp-mobile .m-bottom-nav { display: grid; grid-template-columns: repeat(4, 1fr); position: absolute; bottom: 0; left: 0; right: 0; z-index: 50; background: rgba(255,255,255,0.96); backdrop-filter: blur(20px); border-top: 1px solid var(--line); padding: 6px 4px 18px; }
.bpanel .m-bottom-nav button { background: transparent; border: none; padding: 6px 4px; display: flex; flex-direction: column; align-items: center; gap: 3px; font: inherit; font-size: 10px; font-weight: 600; color: var(--ink-3); cursor: pointer; border-radius: 8px; }
.bpanel .m-bottom-nav button svg { width: 18px; height: 18px; }
.bpanel .m-bottom-nav button.active { color: var(--brand); }
.bpanel.bp-mobile .m-fab { display: grid; place-items: center; position: absolute; bottom: 76px; right: 16px; z-index: 60; width: 52px; height: 52px; border-radius: 50%; background: var(--accent); color: #fff; border: none; box-shadow: 0 12px 28px -6px rgba(220,74,61,0.5); cursor: pointer; }
.bpanel .m-fab svg { width: 22px; height: 22px; }
.bpanel.bp-mobile .quick-actions-sheet { position: absolute; left: 12px; right: 12px; bottom: 80px; z-index: 70; background: #fff; border-radius: 18px; padding: 8px; box-shadow: 0 30px 60px -10px rgba(0,0,0,0.3), 0 0 0 1px var(--line); display: none; flex-direction: column; gap: 2px; }
.bpanel.bp-mobile .quick-actions-sheet.open { display: flex; animation: bpSheetIn .25s ease; }
@keyframes bpSheetIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.bpanel .qa-item { display: flex; align-items: center; gap: 10px; padding: 12px 12px; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600; }
.bpanel .qa-item:active { background: var(--bg-2); }
.bpanel .qa-item svg { width: 18px; height: 18px; color: var(--brand); }
`

function I({ id }: { id: string }) {
  return <svg><use href={`#ic-${id}`} /></svg>
}

export function PanelOfficial({ initialView = "dashboard" }: { initialView?: View } = {}) {
  const { store } = useAuth()
  const slug = store?.slug ?? "tu-tienda"
  const [mobile, setMobile] = useState(false)
  const [view, setView] = useState<View>(initialView)
  const [sheetOpen, setSheetOpen] = useState(false)
  const fabRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node
      if (sheetRef.current?.contains(t) || fabRef.current?.contains(t)) return
      setSheetOpen(false)
    }
    document.addEventListener("click", onDoc)
    return () => document.removeEventListener("click", onDoc)
  }, [])

  return (
    <div className={`bpanel${mobile ? " bp-mobile" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="demo-toggle">
        <button type="button" className={!mobile ? "active" : ""} onClick={() => setMobile(false)}>desktop</button>
        <button type="button" className={mobile ? "active" : ""} onClick={() => setMobile(true)}>mobile</button>
      </div>

      <div className="device-frame">
        {/* TOP DOCK (desktop) */}
        <div className="top-dock">
          <div className="td-logo">b</div>
          <button type="button" className={`td-tab${view === "dashboard" ? " active" : ""}`} onClick={() => setView("dashboard")}><I id="home" />Inicio</button>
          <button type="button" className={`td-tab${view === "catalog" ? " active" : ""}`} onClick={() => setView("catalog")}><I id="package" />Productos</button>
          <button type="button" className={`td-tab${view === "orders" ? " active" : ""}`} onClick={() => setView("orders")}><I id="msg" />Pedidos</button>
          <button type="button" className={`td-tab${view === "design" ? " active" : ""}`} onClick={() => setView("design")}><I id="layout" />Diseño</button>
          <button type="button" className={`td-tab${view === "data" ? " active" : ""}`} onClick={() => setView("data")}><I id="chart" />Datos</button>
          <button type="button" className={`td-tab${view === "config" ? " active" : ""}`} onClick={() => setView("config")}><I id="settings" />Config</button>
          <div className="td-divider" />
          <a href={store?.slug ? `/${store.slug}` : "#"} target="_blank" rel="noopener noreferrer" className="td-pill" style={{ cursor: store?.slug ? "pointer" : "default" }}><span className="dot" /><span>bylink.app/{slug}</span><I id="external" /></a>
        </div>

        {/* TOPBAR (mobile) */}
        <div className="m-topbar">
          <div className="m-logo">b</div>
          <div className="m-store-pill"><span className="dot" /><span className="url">bylink.app/{slug}</span></div>
          <button type="button" className="m-icon-btn"><I id="bell" /></button>
        </div>

        <div className="stage">
          {/* DASHBOARD */}
          <div className={`view${view === "dashboard" ? " active" : ""}`}>
            <DashboardOverview mobile={mobile} />
          </div>

          {/* CATÁLOGO */}
          <div className={`view${view === "catalog" ? " active" : ""}`}>
            <CatalogBoard />
          </div>

          {/* PEDIDOS */}
          <div className={`view${view === "orders" ? " active" : ""}`}>
            <OrdersBoard />
          </div>

          {/* DESIGN */}
          <div className={`view${view === "design" ? " active" : ""}`}>
            <DesignBoard />
          </div>
          {/* CONFIG */}
          <div className={`view${view === "config" ? " active" : ""}`}>
            <StoreSettingsBoard />
          </div>

          {/* DATOS */}
          <div className={`view${view === "data" ? " active" : ""}`}>
            <div className="cat-wrap">
              <div className="cat-header">
                <div>
                  <h1>Tus <em>datos</em></h1>
                  <div className="meta">resumen, embudo, top productos y tráfico</div>
                </div>
              </div>
              <AnalyticsBoard layout={mobile ? "single" : "auto"} />
            </div>
          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="m-bottom-nav">
          <button type="button" className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}><I id="home" />Inicio</button>
          <button type="button" className={view === "catalog" ? "active" : ""} onClick={() => setView("catalog")}><I id="package" />Productos</button>
          <button type="button" className={view === "design" ? "active" : ""} onClick={() => setView("design")}><I id="layout" />Diseño</button>
          <button type="button" className={view === "data" ? "active" : ""} onClick={() => setView("data")}><I id="chart" />Datos</button>
        </nav>

        <button type="button" ref={fabRef} className="m-fab" onClick={() => setSheetOpen((o) => !o)}><I id="plus" /></button>

        <div ref={sheetRef} className={`quick-actions-sheet${sheetOpen ? " open" : ""}`}>
          <div className="qa-item"><I id="package" />Añadir producto</div>
          <div className="qa-item"><I id="instagram" />Importar de Instagram</div>
          <div className="qa-item"><I id="tag" />Crear cupón / descuento</div>
          <div className="qa-item"><I id="share" />Compartir tienda (link + QR)</div>
        </div>
      </div>
    </div>
  )
}
