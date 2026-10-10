/* SIPPBJ fast read-only CSV transport. Tidak menyimpan kata sandi/token dan tidak meng-cache POST. */
(function () {
  'use strict';
  const memory = new Map();
  const pending = new Map();
  const DB_NAME = 'sippbj-public-data-cache-v1';
  const STORE = 'csv';
  const DEFAULT_TTL = 300000; // data publik disimpan selama 5 menit; tombol Refresh memaksa pembacaan baru
  const MAX_MEMORY = 28;
  const MAX_PERSIST_BYTES = 12 * 1024 * 1024;
  let dbPromise;

  function isPublicSheet(url) {
    try {
      const u = new URL(url, location.href);
      return u.protocol === 'https:' && u.hostname === 'docs.google.com' &&
        /^\/spreadsheets\/d\/[^/]+\/(gviz\/tq|export)$/.test(u.pathname) &&
        (u.pathname.endsWith('/gviz/tq') ? u.searchParams.get('tqx') === 'out:csv' : u.searchParams.get('format') === 'csv');
    } catch (_) { return false; }
  }
  function cacheKey(url) {
    const u = new URL(url, location.href);
    u.searchParams.delete('v');
    u.searchParams.delete('cache_bust');
    u.searchParams.sort();
    return u.toString();
  }
  function openDB() {
    if (!('indexedDB' in window)) return Promise.resolve(null);
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(resolve => {
      let req;
      try { req = indexedDB.open(DB_NAME, 1); } catch (_) { resolve(null); return; }
      req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    });
    return dbPromise;
  }
  async function readDisk(key) {
    const db = await openDB();
    if (!db) return null;
    return new Promise(resolve => {
      try {
        const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (_) { resolve(null); }
    });
  }
  async function writeDisk(key, record) {
    const db = await openDB();
    if (!db) return;
    try { db.transaction(STORE, 'readwrite').objectStore(STORE).put(record, key); } catch (_) {}
  }
  function storeMemory(key, record) {
    memory.delete(key);
    memory.set(key, record);
    while (memory.size > MAX_MEMORY) memory.delete(memory.keys().next().value);
  }
  async function fetchText(url, options = {}) {
    const {force = false, persist = false, ttlMs = DEFAULT_TTL} = options;
    if (!isPublicSheet(url)) throw new Error('FastData hanya untuk CSV Google Sheets publik.');
    const key = cacheKey(url);
    const ttl = Math.max(0, Number(ttlMs) || 0);
    const cached = memory.get(key);
    if (!force && cached && Date.now() - cached.time < ttl) return cached.text;
    if (!force && pending.has(key)) return pending.get(key);
    const task = (async () => {
      if (!force && persist) {
        const saved = await readDisk(key);
        if (saved && typeof saved.text === 'string' && Date.now() - saved.time < ttl) {
          storeMemory(key, saved);
          return saved.text;
        }
      }
      // Stabil pada jendela TTL: perintah refresh eksplisit tetap selalu membaca sumber baru.
      const source = new URL(url, location.href);
      source.searchParams.delete('v');
      source.searchParams.delete('cache_bust');
      source.searchParams.set('v', force ? String(Date.now()) : String(Math.floor(Date.now() / Math.max(ttl, 1000))));
      const response = await fetch(source.toString(), {method: 'GET', cache: force ? 'no-store' : 'default'});
      if (!response.ok) throw new Error(`HTTP ${response.status} saat mengambil data Google Sheets`);
      const text = await response.text();
      if (!text.trim() || /<!doctype html|<html|googlevisualization/i.test(text.slice(0, 300))) {
        throw new Error('Respons Google Sheets bukan CSV yang valid.');
      }
      const record = {time: Date.now(), text};
      storeMemory(key, record);
      if (persist && text.length < MAX_PERSIST_BYTES) void writeDisk(key, record);
      return text;
    })();
    if (!force) pending.set(key, task);
    try { return await task; }
    finally { if (pending.get(key) === task) pending.delete(key); }
  }
  function hasFresh(url, ttlMs = DEFAULT_TTL) {
    if (!isPublicSheet(url)) return false;
    const record = memory.get(cacheKey(url));
    return Boolean(record && Date.now()-record.time < ttlMs);
  }
  function invalidate(url) {
    if (url) {
      const key = cacheKey(url); memory.delete(key);
      // Cache tersimpan akan dilewati jika force=true pada refresh berikutnya.
    } else memory.clear();
  }
  window.SippbjFastData = Object.freeze({fetchText, hasFresh, invalidate});
})();
