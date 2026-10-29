#!/usr/bin/env python3
"""Fetch the five public Kepka 74 sheets and atomically publish a compact bundle.

This script intentionally requires no third-party dependencies or credentials.
Only use for Sheets already intended to be readable by anonymous visitors.
Run from the repository root (GitHub Actions does this).
"""
import csv
import hashlib
import io
import json
import os
from pathlib import Path
import sys
import time
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

DATA_ID = '1sjrl57Gv9K0Xv_KNcPJSZggGDsFa0tv7DyRSUcc_JAM'
TOKO_ID = '1ccDgtXNATxSYMZuDgd3polvRiTFNiFnjIGMP7b9qmrU'
SOURCES = [
    (DATA_ID, 'ITKP_REKAP_OPD', 'A1:AD250', 'Satuan Kerja'),
    (DATA_ID, 'ITKP_TARGET_OPD', 'A1:N250', 'Satuan Kerja'),
    (DATA_ID, 'ITKP_KONTROL', 'A1:D60', 'Pemeriksaan'),
    (DATA_ID, 'ITKP_TANPA_RUP', 'A1:K2000', 'Nama Satuan Kerja'),
    (TOKO_ID, 'TOKO_DARING', 'A1:T6000', None),
]
OUTPUT = Path(__file__).resolve().parent.parent / 'assets' / 'data' / 'itkp74-boot.json'
DETAIL_DIR = OUTPUT.parent / 'itkp74-details'
MASTER_COLUMNS = ('Satuan Kerja', 'Kode RUP', 'Nama Paket', 'Program', 'Kegiatan', 'Sub Kegiatan', 'Jenis RUP', 'Metode RUP', 'Pagu RUP', 'Total Realisasi', 'Status Monitoring')
RAW_COLUMNS = ('Nama Satuan Kerja', 'Kode RUP', 'Kode Paket', 'Jenis Pengadaan', 'Metode Pengadaan', 'Nama Paket', 'Nama Penyedia', 'Status Paket', 'Total Nilai (Rp)', 'Sumber Transaksi')


def fetch_one(spreadsheet_id, sheet, range_, required_header):
    params = urlencode({'tqx':'out:csv', 'sheet':sheet, 'range':range_, 'v':int(time.time())})
    url = f'https://docs.google.com/spreadsheets/d/{spreadsheet_id}/gviz/tq?{params}'
    data = None
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={'User-Agent':'SIPPBJ-Snapshot/1.0', 'Accept':'text/csv'}), timeout=75) as response:
                data = response.read(18 * 1024 * 1024 + 1)
                if len(data) > 18 * 1024 * 1024:
                    raise ValueError(f'{sheet} melebihi batas aman 18 MB')
            break
        except Exception as exc:
            if attempt == 2:
                raise RuntimeError(f'{sheet}: gagal diunduh dari Sheets ({exc})') from exc
            time.sleep(2 * (attempt + 1))
    text = data.decode('utf-8-sig')
    if '<html' in text[:200].lower() or 'googlevisualization' in text[:200].lower():
        raise ValueError(f'{sheet}: bukan data CSV publik, periksa izin akses')
    parsed = list(csv.reader(io.StringIO(text, newline='')))
    if not parsed:
        raise ValueError(f'{sheet}: header kosong')
    headers = [h.strip() for h in parsed[0]]
    if required_header and required_header not in headers:
        raise ValueError(f'{sheet}: kolom {required_header!r} tidak ditemukan')
    if not any(headers):
        raise ValueError(f'{sheet}: header kosong')
    rows = [row for row in parsed[1:] if any(value.strip() for value in row)]
    print(f'  {sheet}: {len(rows)} baris, {len(data):,} bytes', flush=True)
    # Column headers are transmitted once; the browser expands them into the
    # original key/value row shape used by the existing modules.
    return {'headers': headers, 'rows': rows}


def calculate_transaksional(raw):
    """Hitung PL/Penunjukan hanya dari metode + sumber Non Tender.

    Pencatatan Non Tender sengaja tidak dihitung di sini; barisnya tetap
    dipertahankan utuh di RAW dan rincian Digitalisasi PBJ.
    """
    headers = raw['headers']
    required = ('Nama Satuan Kerja','Metode Pengadaan','Sumber Transaksi','Total Nilai (Rp)')
    if any(field not in headers for field in required):
        raise ValueError('Kolom wajib agregat transaksional tidak ditemukan')
    i_opd, i_metode, i_sumber, i_nilai = (headers.index(field) for field in required)
    totals = {}
    for row in raw['rows']:
        value = lambda idx: row[idx].strip() if len(row) > idx else ''
        if value(i_sumber) != 'Non Tender':
            continue
        method = value(i_metode)
        metric = 'pl' if method == 'Pengadaan Langsung' else ('penunjukan' if method == 'Penunjukan Langsung' else None)
        opd = value(i_opd)
        if not metric or not opd:
            continue
        try:
            amount = float(value(i_nilai).replace(',', '') or '0')
        except (ValueError, TypeError) as error:
            raise ValueError(f'Nilai transaksi Non Tender tidak sah pada {opd}: {value(i_nilai)!r}') from error
        if amount < 0:
            raise ValueError(f'Nilai transaksi negatif pada {opd}')
        totals.setdefault(opd, {'pl': 0, 'penunjukan': 0})[metric] += amount
    return totals


def write_if_changed(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_text('utf-8') == content:
        return False
    temp = path.with_suffix(path.suffix + '.tmp')
    temp.write_text(content, encoding='utf-8')
    os.replace(temp, path)
    return True


def publish_detail_snapshots(master, raw):
    """Prepare tiny per-OPD files, never expose an entire 12k-row dataset to visitors.

    All input data must be fetched and validated before touching published files.
    An index is written LAST so a failed generator cannot point to missing files.
    """
    def project(data, fields, opd_field):
        header = data['headers']
        missing = [field for field in fields if field not in header]
        if missing:
            raise ValueError(f'Missing detail columns: {missing}')
        indexes = [header.index(field) for field in fields]
        opd_index = header.index(opd_field)
        groups = {}
        for row in data['rows']:
            opd = row[opd_index].strip() if len(row) > opd_index else ''
            if not opd:
                continue
            groups.setdefault(opd, []).append([row[i] if i < len(row) else '' for i in indexes])
        return groups

    master_groups = project(master, MASTER_COLUMNS, 'Satuan Kerja')
    raw_groups = project(raw, RAW_COLUMNS, 'Nama Satuan Kerja')
    existing = None
    manifest_file = DETAIL_DIR / 'index.json'
    if manifest_file.exists():
        try:
            existing = json.loads(manifest_file.read_text('utf-8'))
        except (ValueError, OSError):
            pass
    mapping = {}
    rendered = {}
    for opd in sorted(set(master_groups) | set(raw_groups)):
        # The OPD hash is stable; the data hash changes only on a real edit.
        file_name = hashlib.sha256(opd.encode('utf-8')).hexdigest()[:16] + '.json'
        item = {
            'version': 1,
            'opd': opd,
            'master': {'headers': MASTER_COLUMNS, 'rows': master_groups.get(opd, [])},
            'raw': {'headers': RAW_COLUMNS, 'rows': raw_groups.get(opd, [])},
        }
        body = json.dumps(item, ensure_ascii=False, separators=(',', ':'))
        digest = hashlib.sha256(body.encode('utf-8')).hexdigest()[:16]
        mapping[opd] = {'file': file_name, 'digest': digest}
        rendered[file_name] = body
    if not mapping:
        raise ValueError('Tidak ada OPD pada MASTER / RAW; detail tidak diterbitkan.')
    age = 999999
    if existing and existing.get('generatedAt'):
        try:
            age = (datetime.now(timezone.utc) - datetime.fromisoformat(existing['generatedAt'].replace('Z','+00:00'))).total_seconds()
        except (ValueError, TypeError):
            pass
    unchanged = existing and existing.get('opds') == mapping
    if unchanged and age < 6 * 3600 and all((DETAIL_DIR / name).exists() for name in rendered):
        print('  Detail per OPD masih sama; tidak perlu commit.', flush=True)
        return
    changed_count = 0
    for name, content in rendered.items():
        if write_if_changed(DETAIL_DIR / name, content):
            changed_count += 1
    # Stale OPD files are removed only after all the new files are prepared.
    for old in DETAIL_DIR.glob('*.json'):
        if old.name != 'index.json' and old.name not in rendered:
            old.unlink()
    manifest = {'version': 1, 'generatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z'), 'opds': mapping}
    write_if_changed(manifest_file, json.dumps(manifest, ensure_ascii=False, separators=(',', ':')))
    print(f'  Detail cepat: {len(mapping)} OPD, {changed_count} file diperbarui', flush=True)


def main():
    sources = {}
    for spreadsheet_id, sheet, range_, required in SOURCES:
        key = f'{spreadsheet_id}|{sheet}|{range_}'
        sources[key] = fetch_one(spreadsheet_id, sheet, range_, required)
    # Optional lightweight lookup table so applying Toko Daring values does
    # not trigger a 12,000-row MASTER read on the first submenu visit.
    # If the MASTER source is temporarily unavailable, the browser uses its
    # original live lookup. It must not stop the five essential sources.
    toko_key = f'{TOKO_ID}|TOKO_DARING|A1:T6000'
    toko = sources[toko_key]
    toko_headers = toko['headers']
    rup_col = next((toko_headers.index(h) for h in ('rup_no', 'Kode RUP') if h in toko_headers), None)
    codes = set()
    if rup_col is not None:
        codes = {row[rup_col].strip().removesuffix('.0') for row in toko['rows'] if len(row)>rup_col and row[rup_col].strip()}
    # RAW ini wajib agar snapshot skor PL/Penunjukan tidak pernah memakai
    # angka gabungan V5 dari sheet. Bila gagal, pertahankan snapshot lama.
    raw = fetch_one(DATA_ID, 'RAW_REALISASI', 'A1:J12000', 'Nama Satuan Kerja')
    transaksional = calculate_transaksional(raw)
    print(f'  Agregat transaksional: {len(transaksional)} OPD', flush=True)
    toko_map = {}
    # MASTER is read only once and reused for both the Toko Daring lookup
    # and per-OPD detail snapshots. RAW is separate and is never sent on boot.
    try:
        master = fetch_one(DATA_ID, 'ITKP_MASTER_PAKET', 'A1:S12000', 'Kode RUP')
        if codes:
            h = master['headers']
            code_idx, opd_idx = h.index('Kode RUP'), h.index('Satuan Kerja')
            for row in master['rows']:
                if len(row) <= max(code_idx,opd_idx): continue
                code = row[code_idx].strip().removesuffix('.0')
                if code in codes: toko_map[code] = row[opd_idx].strip()
            print(f'  MASTER lookup ringkas: {len(toko_map)} kode RUP ditemukan', flush=True)
        try:
            publish_detail_snapshots(master, raw)
        except Exception as error:
            # Keep last known good per-OPD snapshots. The browser falls back
            # to live Sheets if the old index is too stale.
            print(f'  Detail snapshot belum diperbarui: {error}', flush=True)
    except Exception as error:
        print(f'  MASTER lookup / detail snapshot belum tersedia: {error}', flush=True)
    canonical = json.dumps({'sources':sources,'tokoMap':toko_map,'transaksionalByOpd':transaksional}, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    digest = hashlib.sha256(canonical.encode('utf-8')).hexdigest()
    existing = None
    if OUTPUT.exists():
        try:
            existing = json.loads(OUTPUT.read_text('utf-8'))
        except (ValueError, OSError):
            pass
    if existing and existing.get('digest') == digest:
        previous = existing.get('generatedAt', '')
        try:
            age = (datetime.now(timezone.utc) - datetime.fromisoformat(previous.replace('Z','+00:00'))).total_seconds()
        except (ValueError, TypeError):
            age = 999999
        if age < 6 * 3600:
            print('Tidak ada perubahan: snapshot yang ada masih segar, tidak perlu commit.')
            return
    bundle = {
        'version': 1,
        'generatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z'),
        'digest': digest,
        'tokoMasterOpdByRup': toko_map if toko_map else None,
        'transaksionalByOpd': transaksional,
        'sources': sources,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    tmp = OUTPUT.with_suffix('.json.tmp')
    tmp.write_text(json.dumps(bundle, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    os.replace(tmp, OUTPUT)
    print(f'Snapshot tersimpan: {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'GAGAL: snapshot lama tidak akan diganti. {exc}', file=sys.stderr)
        sys.exit(1)
