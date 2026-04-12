import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPhoneById, addModel, deleteModel } from "../api/phoneApi";
import { useToast } from "../components/ToastProvider";
import AddModelModal from "../components/AddModelModal";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/BrandPage.css";

const BrandPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();

  const [phone, setPhone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModel, setShowAddModel] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchPhone();
    // eslint-disable-next-line
  }, [id]);

  const fetchPhone = async () => {
    try {
      setLoading(true);
      const res = await getPhoneById(id);
      setPhone(res.data);
    } catch (err) {
      addToast("Failed to load brand", "error");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = async (modelName, totalAdded) => {
    try {
      const res = await addModel(id, modelName, totalAdded);
      setPhone(res.data);
      setShowAddModel(false);
      addToast(`"${modelName}" added!`, "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add model", "error");
    }
  };

  const handleDeleteModel = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteModel(id, deleteTarget._id);
      setPhone(res.data);
      addToast(`"${deleteTarget.modelName}" deleted`, "info");
      setDeleteTarget(null);
    } catch (err) {
      addToast("Failed to delete model", "error");
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <div className="empty-state-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (!phone) return null;

  const totalRemaining = phone.models.reduce((s, m) => s + m.remaining, 0);
  const totalSold      = phone.models.reduce((s, m) => s + m.sold, 0);
  const totalStock     = phone.models.reduce((s, m) => s + m.totalAdded, 0);

  return (
    <>
      <div className="page-wrapper">

        {/* ── Breadcrumb ── */}
        <div className="breadcrumb animate-in">
          <span className="breadcrumb-item" onClick={() => navigate("/")}>Dashboard</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{phone.name}</span>
        </div>

        {/* ── Compact stat strip at top ── */}
        <div className="stat-strip animate-in" style={{ animationDelay: "0.05s" }}>
          <div className="stat-strip-item stat-strip-blue">
            <div className="stat-strip-value">{totalStock}</div>
            <div className="stat-strip-label">Total Added</div>
          </div>
          <div className="stat-strip-item stat-strip-green">
            <div className="stat-strip-value">{totalRemaining}</div>
            <div className="stat-strip-label">Remaining</div>
          </div>
          <div className="stat-strip-item stat-strip-red">
            <div className="stat-strip-value">{totalSold}</div>
            <div className="stat-strip-label">Sold</div>
          </div>
        </div>

        {/* ── Page header ── */}
        <div className="page-header animate-in" style={{ animationDelay: "0.09s" }}>
          <div>
            <h1 className="page-title">{phone.name} <span>Models</span></h1>
            <p className="page-desc">
              {phone.models.length} model{phone.models.length !== 1 ? "s" : ""} · click to manage stock
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModel(true)}>
            ➕ Add Model
          </button>
        </div>

        {/* ── Models list ── */}
        {phone.models.length === 0 ? (
          <div className="empty-state animate-in">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">No models yet</div>
            <div className="empty-state-sub">Add the first model for {phone.name}</div>
          </div>
        ) : (
          <div className="model-list">
            {phone.models.map((model, i) => {
              const pct   = model.totalAdded > 0 ? Math.round((model.remaining / model.totalAdded) * 100) : 0;
              const isLow = model.remaining > 0 && model.remaining <= 3;
              const isOut = model.remaining === 0;

              return (
                <div
                  key={model._id}
                  className="model-row animate-in"
                  style={{ animationDelay: `${0.13 + i * 0.04}s` }}
                  onClick={() => navigate(`/brand/${id}/model/${model._id}`)}
                >
                  <div className="model-row-left">
                    <div className="model-row-name">{model.modelName}</div>
                    <div className="model-row-bar">
                      <div className="progress-bar-wrap">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: isOut
                              ? "var(--red)"
                              : isLow
                              ? "linear-gradient(90deg,var(--yellow),var(--red))"
                              : undefined,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="model-row-right">
                    <span className="chip chip-blue">📦 {model.totalAdded}</span>
                    <span className="chip chip-green">✅ {model.remaining}</span>
                    <span className="chip chip-red">💸 {model.sold}</span>
                    {isOut && <span className="chip chip-red">OUT</span>}
                    {isLow && !isOut && <span className="chip chip-yellow">LOW</span>}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(model); }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button className="back-btn animate-in" onClick={() => navigate("/")}>
          ← Back to Dashboard
        </button>
      </div>

      {showAddModel && (
        <AddModelModal
          brandName={phone.name}
          onClose={() => setShowAddModel(false)}
          onAdd={handleAddModel}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Model"
          message={`Delete "${deleteTarget.modelName}"? All stock data will be lost.`}
          onConfirm={handleDeleteModel}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
};

export default BrandPage;
