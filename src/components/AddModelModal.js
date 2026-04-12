import React, { useState } from "react";
import "../styles/Modal.css";

const AddModelModal = ({ brandName, onClose, onAdd }) => {
  const [modelName, setModelName] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = modelName.trim() && stock !== "" && Number(stock) >= 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    await onAdd(modelName.trim(), Number(stock));
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          ➕ Add <span>Model</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20, fontFamily: "var(--font-mono)" }}>
          Brand: {brandName}
        </p>
        <div className="form-group">
          <label className="form-label">Model Name</label>
          <input
            className="form-input"
            placeholder="e.g. Galaxy S24, iPhone 15 Pro"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Initial Stock</label>
          <input
            className="form-input"
            type="number"
            min="0"
            placeholder="e.g. 20"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!isValid || loading}
          >
            {loading ? "Adding..." : "Add Model"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModelModal;
