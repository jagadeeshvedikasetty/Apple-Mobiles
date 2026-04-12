import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPhones, createPhone, deletePhone } from "../api/phoneApi";
import { useToast } from "../components/ToastProvider";
import AddBrandModal from "../components/AddBrandModal";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/Dashboard.css";

const BRAND_EMOJIS = ["📱", "🔥", "⚡", "💎", "🌟", "🚀", "🎯", "💡"];

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    try {
      setLoading(true);
      const res = await getAllPhones();
      setPhones(res.data);
    } catch (err) {
      addToast("Failed to load brands", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async (name) => {
    try {
      const res = await createPhone(name);
      setPhones((prev) => [...prev, res.data]);
      setShowAddModal(false);
      addToast(`"${name}" added!`, "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add brand", "error");
    }
  };

  const handleDeleteBrand = async () => {
    if (!deleteTarget) return;
    try {
      await deletePhone(deleteTarget._id);
      setPhones((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      addToast(`"${deleteTarget.name}" deleted`, "info");
      setDeleteTarget(null);
    } catch (err) {
      addToast("Failed to delete brand", "error");
    }
  };

  const totalModels    = phones.reduce((s, p) => s + p.models.length, 0);
  const totalSold      = phones.reduce((s, p) => s + p.models.reduce((x, m) => x + m.sold, 0), 0);
  const totalRemaining = phones.reduce((s, p) => s + p.models.reduce((x, m) => x + m.remaining, 0), 0);

  return (
    <>
      <div className="page-wrapper">

        {/* ── Compact stat pills at top ── */}
        <div className="stat-bar animate-in" style={{ animationDelay: "0.04s" }}>
          <div className="stat-pill stat-pill-blue">
            <span>Brands</span>
            <span className="stat-pill-value">{phones.length}</span>
          </div>
          <div className="stat-pill stat-pill-blue">
            <span>Models</span>
            <span className="stat-pill-value">{totalModels}</span>
          </div>
          <div className="stat-pill stat-pill-green">
            <span>In Stock</span>
            <span className="stat-pill-value">{totalRemaining}</span>
          </div>
          <div className="stat-pill stat-pill-red">
            <span>Sold</span>
            <span className="stat-pill-value">{totalSold}</span>
          </div>
        </div>

        {/* ── Page header ── */}
        <div className="page-header animate-in" style={{ animationDelay: "0.08s" }}>
          <div>
            <h1 className="page-title">Phone <span>Brands</span></h1>
            <p className="page-desc">{totalModels} models · click a brand to manage</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            ➕ Add Brand
          </button>
        </div>

        {/* ── Brand cards ── */}
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <div className="empty-state-text">Loading...</div>
          </div>
        ) : phones.length === 0 ? (
          <div className="empty-state animate-in">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-text">No brands yet</div>
            <div className="empty-state-sub">Add your first phone brand to get started</div>
          </div>
        ) : (
          <div className="grid-cards">
            {phones.map((phone, i) => {
              const remaining = phone.models.reduce((s, m) => s + m.remaining, 0);
              const sold      = phone.models.reduce((s, m) => s + m.sold, 0);
              const total     = phone.models.reduce((s, m) => s + m.totalAdded, 0);
              const pct       = total > 0 ? Math.round((remaining / total) * 100) : 0;

              return (
                <div
                  key={phone._id}
                  className="card card-clickable animate-in"
                  style={{ animationDelay: `${0.12 + i * 0.05}s` }}
                  onClick={() => navigate(`/brand/${phone._id}`)}
                >
                  <div className="brand-card-icon">
                    {BRAND_EMOJIS[i % BRAND_EMOJIS.length]}
                  </div>
                  <div className="brand-card-name">{phone.name}</div>
                  <div className="brand-card-meta">
                    {phone.models.length} model{phone.models.length !== 1 ? "s" : ""}
                  </div>

                  {total > 0 && (
                    <div className="progress-bar-wrap" style={{ marginTop: 10 }}>
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  )}

                  <div className="brand-card-footer">
                    <div className="brand-card-chips">
                      <span className="chip chip-green">✅ {remaining}</span>
                      <span className="chip chip-red">💸 {sold}</span>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(phone); }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddBrandModal onClose={() => setShowAddModal(false)} onAdd={handleAddBrand} />
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Brand"
          message={`Delete "${deleteTarget.name}" and all its models? This cannot be undone.`}
          onConfirm={handleDeleteBrand}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
};

export default Dashboard;
