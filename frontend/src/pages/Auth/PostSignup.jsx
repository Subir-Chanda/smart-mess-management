import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function PostSignup() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // "choice" | "create" | "join"
  const [screen, setScreen] = useState("choice");

  // Create mess state
  const [messName, setMessName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Join mess state
  const [messes, setMesses] = useState([]);
  const [messesLoading, setMessesLoading] = useState(false);
  const [selectedMess, setSelectedMess] = useState(null);
  const [joinRole, setJoinRole] = useState("member"); // NEW: role for joining
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinDone, setJoinDone] = useState(false);
  const [joinMessName, setJoinMessName] = useState("");

  // ── Load messes when "join" is selected ──
  async function handleChooseJoin() {
    setScreen("join");
    setMessesLoading(true);
    try {
      const res = await axios.get(`${API}/mess/list`);
      setMesses(res.data.messes || []);
    } catch (err) {
      setMesses([]);
    }
    setMessesLoading(false);
  }

  // ── Create mess → user becomes admin automatically ──
  async function handleCreateMess() {
    if (!messName.trim()) {
      setCreateError("Please enter a mess name.");
      return;
    }
    setCreateLoading(true);
    setCreateError("");
    try {
      // Backend will set role = "admin" when creating a mess
      const res = await axios.post(
        `${API}/mess/create`,
        { name: messName.trim() },
        { headers },
      );

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...stored,
          role: "admin", // update local user role
          messName: res.data.mess.name,
          messId: res.data.mess._id,
          setupStatus: "active",
        }),
      );

      navigate("/dashboard");
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create mess.");
    }
    setCreateLoading(false);
  }

  // ── Send join request with chosen role ──
  async function handleJoinRequest() {
    if (!selectedMess) return;
    setJoinLoading(true);
    try {
      await axios.post(
        `${API}/mess/join-request`,
        { messId: selectedMess._id, role: joinRole }, // send role to backend
        { headers },
      );
      setJoinMessName(selectedMess.name);
      setJoinDone(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send join request.");
    }
    setJoinLoading(false);
  }

  // ─────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────

  // Join request sent screen
  if (joinDone) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.bigIcon}>✅</div>
          <h2 style={s.heading}>Request Sent!</h2>
          <p style={s.sub}>
            Your request to join <strong>{joinMessName}</strong> as{" "}
            <strong>{joinRole}</strong> has been sent. The admin will review and
            approve your request. You'll be able to log in once approved.
          </p>
          <button style={s.btn} onClick={() => navigate("/")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Choice screen
  if (screen === "choice") {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.bigIcon}>🏠</div>
          <h2 style={s.heading}>Welcome! What would you like to do?</h2>
          <p style={s.sub}>
            Create a new mess and become its admin, or join an existing one.
          </p>
          <div style={s.choiceRow}>
            <button style={s.choiceBtn} onClick={() => setScreen("create")}>
              <span style={s.choiceIcon}>➕</span>
              <span style={s.choiceTitle}>Create a New Mess</span>
              <span style={s.choiceDesc}>
                You'll be the <strong>Admin</strong>. Set up your mess and
                invite members.
              </span>
            </button>
            <button style={s.choiceBtn} onClick={handleChooseJoin}>
              <span style={s.choiceIcon}>🔍</span>
              <span style={s.choiceTitle}>Join an Existing Mess</span>
              <span style={s.choiceDesc}>
                Browse available messes and send a join request as Admin or
                Member.
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create mess screen — no role choice, always admin
  if (screen === "create") {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <button style={s.backBtn} onClick={() => setScreen("choice")}>
            ← Back
          </button>
          <div style={s.bigIcon}>🏗️</div>
          <h2 style={s.heading}>Create Your Mess</h2>
          <p style={s.sub}>
            Give your mess a name. You will be the <strong>Admin</strong> of
            this mess.
          </p>
          <input
            style={s.input}
            type="text"
            placeholder="e.g. NDC, Sunrise Mess, Block B Mess..."
            value={messName}
            onChange={(e) => setMessName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateMess()}
          />
          {createError && <p style={s.error}>{createError}</p>}
          <button
            style={{ ...s.btn, opacity: createLoading ? 0.7 : 1 }}
            onClick={handleCreateMess}
            disabled={createLoading}
          >
            {createLoading ? "Creating..." : "Create Mess & Continue"}
          </button>
        </div>
      </div>
    );
  }

  // Join mess screen — with role selection
  if (screen === "join") {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <button style={s.backBtn} onClick={() => setScreen("choice")}>
            ← Back
          </button>
          <div style={s.bigIcon}>🔍</div>
          <h2 style={s.heading}>Join a Mess</h2>
          <p style={s.sub}>
            Select the mess you want to join and choose your role.
          </p>

          {messesLoading ? (
            <p style={s.loading}>Loading available messes...</p>
          ) : messes.length === 0 ? (
            <p style={s.empty}>
              No messes available yet.{" "}
              <button style={s.linkBtn} onClick={() => setScreen("create")}>
                Create one instead?
              </button>
            </p>
          ) : (
            <div style={s.messList}>
              {messes.map((mess) => (
                <button
                  key={mess._id}
                  style={{
                    ...s.messItem,
                    ...(selectedMess?._id === mess._id ? s.messItemActive : {}),
                  }}
                  onClick={() => setSelectedMess(mess)}
                >
                  <span style={s.messName}>{mess.name}</span>
                  <span style={s.memberCount}>
                    {mess.memberCount} member{mess.memberCount !== 1 ? "s" : ""}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ROLE SELECTION — only shown when joining */}
          {selectedMess && (
            <>
              <div style={s.roleBox}>
                <p style={s.roleLabel}>Join as:</p>
                <div style={s.roleRow}>
                  <button
                    style={{
                      ...s.roleBtn,
                      ...(joinRole === "member" ? s.roleBtnActive : {}),
                    }}
                    onClick={() => setJoinRole("member")}
                  >
                    👤 Member
                    <span style={s.roleDesc}>Regular mess member</span>
                  </button>
                  <button
                    style={{
                      ...s.roleBtn,
                      ...(joinRole === "admin" ? s.roleBtnActive : {}),
                    }}
                    onClick={() => setJoinRole("admin")}
                  >
                    🛡️ Admin
                    <span style={s.roleDesc}>
                      Manage mess (subject to approval)
                    </span>
                  </button>
                </div>
              </div>

              <button
                style={{
                  ...s.btn,
                  marginTop: 16,
                  opacity: joinLoading ? 0.7 : 1,
                }}
                onClick={handleJoinRequest}
                disabled={joinLoading}
              >
                {joinLoading
                  ? "Sending..."
                  : `Send Join Request to ${selectedMess.name}`}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "40px 36px",
    maxWidth: 520,
    width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    position: "relative",
  },
  bigIcon: { fontSize: 48, textAlign: "center", marginBottom: 12 },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 1.6,
  },
  choiceRow: { display: "flex", gap: 16 },
  choiceBtn: {
    flex: 1,
    padding: "20px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    transition: "border-color 0.15s",
  },
  choiceIcon: { fontSize: 28 },
  choiceTitle: { fontWeight: 700, fontSize: 14, color: "#1e293b" },
  choiceDesc: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 1.4,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "2px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 15,
    marginBottom: 12,
    boxSizing: "border-box",
    outline: "none",
  },
  error: { color: "#dc2626", fontSize: 13, marginBottom: 10 },
  btn: {
    width: "100%",
    padding: "13px",
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
  },
  loading: { textAlign: "center", color: "#6b7280", padding: "20px 0" },
  empty: { textAlign: "center", color: "#6b7280", padding: "20px 0" },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#1d4ed8",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  messList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 16,
  },
  messItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: 10,
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
  },
  messItemActive: { borderColor: "#1d4ed8", background: "#eff6ff" },
  messName: { fontWeight: 700, fontSize: 15, color: "#1e293b" },
  memberCount: { fontSize: 13, color: "#6b7280" },
  // Role selection styles
  roleBox: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "16px",
    marginTop: 8,
  },
  roleLabel: {
    fontWeight: 700,
    fontSize: 13,
    color: "#374151",
    marginBottom: 10,
  },
  roleRow: { display: "flex", gap: 10 },
  roleBtn: {
    flex: 1,
    padding: "12px 10px",
    border: "2px solid #e5e7eb",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    transition: "all 0.15s",
  },
  roleBtnActive: {
    borderColor: "#1d4ed8",
    background: "#eff6ff",
    color: "#1d4ed8",
  },
  roleDesc: {
    fontSize: 11,
    fontWeight: 400,
    color: "#6b7280",
    textAlign: "center",
  },
};
