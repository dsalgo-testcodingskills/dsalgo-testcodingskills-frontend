import React, { useEffect, useState } from "react";
import PageContainer from "./PageContainer";
import { getPricing, updatePricing } from "../../Services/api";
import { toast } from "react-toastify";
import CustomToast from "../../components/CustomToast/CustomToast";
import CustomLoadingAnimation from "../../components/CustomLoadingAnimation";
import EditIcon from "@material-ui/icons/Edit";

const PricingSettings = () => {
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState({
    pricePerTest: 0,
    pricePerQuestion: 0,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const response = await getPricing();
      setPricing({
        pricePerTest: response.data.pricePerTest || 0,
        pricePerQuestion: response.data.pricePerQuestion || 0,
      });
    } catch (error) {
      toast(<CustomToast type="error" message="Failed to load pricing" />);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePricing({
        pricePerTest: Number(pricing.pricePerTest),
        pricePerQuestion: Number(pricing.pricePerQuestion),
      });
      toast(
        <CustomToast type="success" message="Pricing updated successfully" />,
      );
      setIsEditing(false);
    } catch (error) {
      toast(<CustomToast type="error" message="Failed to update pricing" />);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPricing({
      ...pricing,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <PageContainer
      title="Pricing Settings"
      sub="Manage global pricing configurations for tests and questions"
    >
      <CustomLoadingAnimation isLoading={loading} />

      <div
        className="table-wrap"
        style={{
          maxWidth: "600px",
          margin: "20px auto",
          padding: "30px",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            borderBottom: "1px solid var(--gray-200)",
            paddingBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "var(--gray-900)",
                margin: 0,
              }}
            >
              Current Pricing
            </h2>

            {!isEditing && (
              <EditIcon
                onClick={() => setIsEditing(true)}
                style={{
                  fontSize: "20px",
                  color: "var(--gray-500)",
                  cursor: "pointer",
                }}
              />
            )}
          </div>
          {!isEditing ? null : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  setIsEditing(false);
                  fetchPricing(); // Reset to original values
                }}
                style={{
                  height: "34px",
                  padding: "0 16px",
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  color: "#374151",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0 16px",
                  background: "#00bcd4", // Secondary color from variables
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Update
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "var(--gray-700)",
              }}
            >
              Price Per Test (₹)
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--gray-500)",
                  fontWeight: "500",
                }}
              >
                ₹
              </span>
              <input
                type="number"
                name="pricePerTest"
                value={pricing.pricePerTest}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field"
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 30px",
                  fontSize: "15px",
                  borderRadius: "6px",
                  border: "1px solid var(--gray-300)",
                  background: isEditing ? "#fff" : "var(--gray-50)",
                  color: "var(--gray-900)",
                  transition: "all 0.2s",
                }}
              />
            </div>
            <p
              style={{ fontSize: "12px", color: "var(--gray-500)", margin: 0 }}
            >
              This is the base price organizations will pay per individual test
              created.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "var(--gray-700)",
              }}
            >
              Price Per Question (₹)
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--gray-500)",
                  fontWeight: "500",
                }}
              >
                ₹
              </span>
              <input
                type="number"
                name="pricePerQuestion"
                value={pricing.pricePerQuestion}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field"
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 30px",
                  fontSize: "15px",
                  borderRadius: "6px",
                  border: "1px solid var(--gray-300)",
                  background: isEditing ? "#fff" : "var(--gray-50)",
                  color: "var(--gray-900)",
                  transition: "all 0.2s",
                }}
              />
            </div>
            <p
              style={{ fontSize: "12px", color: "var(--gray-500)", margin: 0 }}
            >
              This is the base price organizations will pay to add custom
              questions to their bank.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PricingSettings;
