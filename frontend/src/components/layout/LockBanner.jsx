import { useEffect, useState } from "react";
import axios from "axios";

function LockBanner() {
  const [lockInfo, setLockInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const checkLock = async () => {
      try {
        const res = await axios.get(
          import.meta.env.VITE_API_URL || "http://localhost:5000"/api/month-lock/status",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.data.success && res.data.isLocked) {
          setLockInfo(res.data);
        } else {
          setLockInfo(null);
        }
      } catch (err) {
        // silently fail — don't break the app
      }
    };

    checkLock();

    // Re-check every 5 minutes
    const interval = setInterval(checkLock, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!lockInfo) return null;

  return (
    <div style={styles.banner}>
      <div style={styles.iconWrap}>⚠️</div>
      <div style={styles.textWrap}>
        <span style={styles.title}>Month-End Alert</span>
        <span style={styles.msg}>
          {lockInfo.month} {lockInfo.year} is ending.{" "}
          <strong>Please complete all data entry for this month.</strong> Admin
          has not performed the monthly reset yet. If not done manually, the
          system will auto-reset on the 1st at 11:00 PM.
        </span>
      </div>
    </div>
  );
}

const styles = {
  banner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    backgroundColor: "#fff7ed",
    borderBottom: "2px solid #f97316",
    borderLeft: "5px solid #f97316",
    padding: "12px 20px",
    width: "100%",
    boxSizing: "border-box",
    zIndex: 100,
  },
  iconWrap: {
    fontSize: "20px",
    flexShrink: 0,
    paddingTop: "1px",
  },
  textWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  title: {
    fontWeight: "700",
    fontSize: "14px",
    color: "#9a3412",
  },
  msg: {
    fontSize: "13px",
    color: "#7c2d12",
    lineHeight: "1.5",
  },
};

export default LockBanner;
