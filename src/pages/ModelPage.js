import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPhoneById, updateStock, renameModel } from "../api/phoneApi";
import { useToast } from "../components/ToastProvider";
import "../styles/ModelPage.css";

const ModelPage = () => {
  const { id, modelId } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();

  const [phone, setPhone] = useState(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id, modelId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPhoneById(id);
      const found = res.data.models.find((m) => m._id === modelId);
      if (!found) {
        addToast("Model not found", "error");
        navigate(`/brand/${id}`);
        return;
      }
      setPhone(res.data);
      setModel(found);
      setNewName(found.modelName);
    } catch (err) {
      addToast("Failed to load model", "error");
      navigate(`/brand/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStock = async (action) => {
    const quantity = Number(qty);
    if (!quantity || quantity <= 0) {
      addToast("Enter a valid quantity", "error");
      return;
    }
    if (action === "sell" && model.remaining < quantity) {
      addToast("Not enough stock to sell", "error");
      return;
    }
    try {
      setActionLoading(true);
      const res = await updateStock(id, modelId, action, quantity);
      const updated = res.data.models.find((m) => m._id === modelId);
      setModel(updated);
      setPhone(res.data);
      addToast(
        action === "sell"
          ? `Sold ${quantity} unit${quantity > 1 ? "s" : ""}!`
          : `Restocked ${quantity} unit${quantity > 1 ? "s" : ""}!`,
        action === "sell" ? "info" : "success"
      );
    } catch (err) {
      addToast(err.response?.data?.message || "Action failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === model.modelName) {
      setEditingName(false);
      return;
    }
    try {
      const res = await renameModel(id, modelId, newName.trim());
      const updated = res.data.models.find((m) => m._id === modelId);
      setModel(updated);
      setPhone(res.data);
      setEditingName(false);
      addToast("Model renamed!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Rename failed", "error");
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

  if (!model || !phone) return null;

  const pct   = model.totalAdded > 0 ? Math.round((model.remaining / model.totalAdded) * 100) : 0;
  const isOut = model.remaining === 0;
  const isLow = model.remaining > 0 && model.remaining <= 3;

  return (
    <div className="page-wrapper">

      {/* ── Breadcrumb ── */}
      <div className="breadcrumb animate-in">
        <span className="breadcrumb-item" onClick={() => navigate("/")}>Dashboard</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-item" onClick={() => navigate(`/brand/${id}`)}>
          {phone.name}
        </span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{model.modelName}</span>
      </div>

      {/* ── Compact stat strip at top ── */}
      <div className="model-stat-strip animate-in" style={{ animationDelay: "0.05s" }}>
        <div className="model-stat-item model-stat-blue">
          <div className="model-stat-value">{model.totalAdded}</div>
          <div className="model-stat-label">Total Added</div>
        </div>
        <div className="model-stat-item model-stat-green">
          <div className="model-stat-value">{model.remaining}</div>
          <div className="model-stat-label">Remaining</div>
        </div>
        <div className="model-stat-item model-stat-red">
          <div className="model-stat-value">{model.sold}</div>
          <div className="model-stat-label">Sold</div>
        </div>
      </div>

      {/* ── Model title + rename ── */}
      <div className="model-hero animate-in" style={{ animationDelay: "0.09s" }}>
        <div>
          {editingName ? (
            <div className="model-rename-row">
              <input
                className="form-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") { setEditingName(false); setNewName(model.modelName); }
                }}
                autoFocus
                style={{ maxWidth: 260, fontSize: 15 }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleRename}>Save</button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setEditingName(false); setNewName(model.modelName); }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="model-rename-row">
              <h1 className="model-hero-title">
                {phone.name} <span>{model.modelName}</span>
              </h1>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setEditingName(true)}
                title="Rename model"
              >
                ✏️
              </button>
            </div>
          )}
          <p className="model-hero-status">
            {isOut ? "❌ Out of stock" : isLow ? "⚠️ Low stock — restock soon" : "✅ In stock"}
          </p>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="progress-block animate-in" style={{ animationDelay: "0.13s" }}>
        <div className="progress-meta">
          <span>Stock level</span>
          <span>{pct}% remaining</span>
        </div>
        <div className="progress-bar-wrap" style={{ height: 10 }}>
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

      {/* ── Action panel ── */}
      <div className="action-panel animate-in" style={{ animationDelay: "0.17s" }}>
        <div className="action-panel-title">⚡ Update Stock</div>

        <div className="qty-row">
          <span className="qty-label">Qty</span>
          <input
            className="qty-input"
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>

        <div className="action-btns">
          <button
            className="btn btn-success"
            onClick={() => handleStock("restock")}
            disabled={actionLoading}
          >
            ⬆ Restock
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleStock("sell")}
            disabled={actionLoading || isOut}
          >
            ⬇ Mark as Sold
          </button>
        </div>
      </div>

      {/* ── Back ── */}
      <button className="back-btn animate-in" style={{ animationDelay: "0.21s" }} onClick={() => navigate(`/brand/${id}`)}>
        ← Back to {phone.name}
      </button>
    </div>
  );
};

export default ModelPage;
