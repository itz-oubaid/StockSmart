// stocksmart-web/src/components/VisionScanner.jsx
import { useRef, useState, useEffect } from "react";
import { automationAPI } from "../services/api"; // ← adjust path to your api.js

export default function VisionScanner() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [rows, setRows] = useState([]);
  const [saved, setSaved] = useState(false);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (result?.detections) {
      setRows(result.detections.map((d) => ({ ...d })));
      setSaved(false);
    }
  }, [result]);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setRows([]);
    setResult(null);
    setError(null);
    setSaved(false);
  };

  const onScan = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await automationAPI.visionUpdate(file); // auth + multipart handled by axios
      setResult(data);
    } catch (err) {
      const r = err.response;
      setError(r ? `Scan failed (${r.status}): ${JSON.stringify(r.data)}` : err.message);
    } finally {
      setLoading(false);
    }
  };

  const setQty = (i, val) => {
    const n = Math.max(0, parseInt(val, 10) || 0);
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, detected_qty: n } : r))
    );
  };

  const onSave = async () => {
    const items = rows
      .filter((r) => r.matched && r.product_id)
      .map((r) => ({ product_id: r.product_id, detected_qty: r.detected_qty }));
    if (items.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await automationAPI.visionApply(items);
      setSaved(true);
    } catch (err) {
      const r = err.response;
      setError(r ? `Save failed (${r.status}): ${JSON.stringify(r.data)}` : err.message);
    } finally {
      setSaving(false);
    }
  };

  const matchedCount = rows.filter((r) => r.matched && r.product_id).length;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold">📷 Shelf Scanner</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload a photo of a shelf. The AI counts the products. Check the
            numbers, then save to stock.
          </p>
        </header>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPick}
            className="hidden"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
            >
              Choose / take photo
            </button>
            <button
              onClick={onScan}
              disabled={!file || loading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 transition"
            >
              {loading ? "Scanning…" : "Scan shelf"}
            </button>
          </div>

          {preview && (
            <img
              src={preview}
              alt="shelf preview"
              className="mt-4 max-h-72 rounded-xl border border-slate-700 object-contain"
            />
          )}
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        {rows.length > 0 && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Detected products</h2>
              <span className="text-xs text-slate-400">
                {matchedCount} matched to your catalog
              </span>
            </div>

            <div className="space-y-2">
              {rows.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2"
                >
                  <div className="flex-1">
                    <div className="font-medium">{r.product_name}</div>
                    <div className="text-xs text-slate-400">
                      {r.matched ? (
                        <>SKU {r.sku} · in DB: {r.db_qty}</>
                      ) : (
                        <span className="text-amber-400">not in your catalog</span>
                      )}
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={r.detected_qty}
                    onChange={(e) => setQty(i, e.target.value)}
                    className="w-20 text-center bg-slate-800 border border-slate-600 rounded-lg px-2 py-1"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={onSave}
              disabled={saving || matchedCount === 0}
              className="w-full mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 transition"
            >
              {saving
                ? "Saving…"
                : `Save ${matchedCount} product${matchedCount === 1 ? "" : "s"} to stock`}
            </button>

            {saved && (
              <p className="text-emerald-400 text-sm text-center">✓ Stock updated.</p>
            )}
            {matchedCount === 0 && (
              <p className="text-amber-400 text-xs text-center">
                None of these names matched your catalog, so nothing can be saved yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}