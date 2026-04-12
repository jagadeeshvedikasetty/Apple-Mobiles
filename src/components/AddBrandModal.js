import React, { useState } from "react";
import "../styles/Modal.css";

const AddBrandModal = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onAdd(name.trim());
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
          ➕ Add <span>Brand</span>
        </div>
        <div className="form-group">
          <label className="form-label">Brand Name</label>
          <input
            className="form-input"
            placeholder="e.g. Samsung, Apple, Xiaomi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
          >
            {loading ? "Adding..." : "Add Brand"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBrandModal;
