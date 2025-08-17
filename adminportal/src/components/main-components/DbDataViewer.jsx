import React, { useEffect, useMemo, useState, useCallback } from "react";
import { IDSCard, IDSButton, IDSSpinner, IDSAlert } from "@inera/ids-react";
import { fetchDbData } from "../../api/ctganApi";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const DbDataViewer = ({ refreshKey = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);

  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetchDbData(); // { count, data: [...] }
      setRows(Array.isArray(res.data) ? res.data : []);
      setCount(res.count ?? 0);
      setPage(1);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.detail || "Kunde inte hämta data från databasen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const cols = useMemo(() => {
    const first = rows[0];
    return first ? Object.keys(first) : [];
  }, [rows]);

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, pageCount);
  const sliceStart = (pageSafe - 1) * pageSize;
  const pageRows = filtered.slice(sliceStart, sliceStart + pageSize);

  return (
    <IDSCard borderTop={2} style={{ marginTop: "1rem" }}>
      <h3 className="ids-heading-m">MongoDB: Sparad syntetisk data</h3>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.5rem" }}>
        <IDSButton type="secondary" size="s" onClick={load} disabled={loading}>
          {loading ? "Laddar..." : "Uppdatera"}
        </IDSButton>

        <input
          className="ids-input"
          placeholder="Sök i alla fält…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: 240 }}
        />

        <label className="ids-heading-xxs" htmlFor="page-size" style={{ marginLeft: "auto" }}>
          Rader/sida
        </label>
        <select
          id="page-size"
          className="ids-input"
          value={pageSize}
          onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
          style={{ width: 100 }}
        >
          {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {err && <IDSAlert status="error" title="Fel">{err}</IDSAlert>}
      {loading && <IDSSpinner size="m" />}

      {!loading && !err && (
        <>
          <p className="ids-body-s" style={{ margin: "0.5rem 0" }}>
            Totalt i DB: <b>{count}</b> · Visar: <b>{filtered.length}</b> (efter filter)
          </p>

          <div style={{ overflowX: "auto" }}>
            <table className="ids-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {cols.length === 0 ? <th>Data</th> : cols.map((c) => <th key={c} style={{ textAlign: "left" }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr><td colSpan={Math.max(1, cols.length)} style={{ padding: "0.75rem" }}>Ingen data att visa.</td></tr>
                ) : pageRows.map((row, idx) => (
                  <tr key={idx}>
                    {cols.length === 0 ? (
                      <td><pre style={{ margin: 0 }}>{JSON.stringify(row, null, 2)}</pre></td>
                    ) : cols.map((c) => {
                      const v = row?.[c];
                      const text = typeof v === "object" ? JSON.stringify(v) : `${v}`;
                      return <td key={c} style={{ padding: "0.5rem 0.75rem", verticalAlign: "top" }}>{text}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.75rem" }}>
            <IDSButton type="secondary" size="s" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe <= 1}>Föregående</IDSButton>
            <span className="ids-body-s">Sida {pageSafe} / {pageCount}</span>
            <IDSButton type="secondary" size="s" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={pageSafe >= pageCount}>Nästa</IDSButton>
          </div>
        </>
      )}
    </IDSCard>
  );
};

export default DbDataViewer;
