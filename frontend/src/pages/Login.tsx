import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCopy } from "../hooks/useCopy";
import styles from "./Login.module.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { get } = useCopy();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{get("auth.login.title")}</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          placeholder={get("auth.login.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={get("auth.login.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? get("auth.login.submitting") : get("auth.login.submit")}
        </button>
      </form>
      <p className={styles.link}>
        {get("auth.login.noAccount")} <Link to="/register">{get("auth.login.registerLink")}</Link>
      </p>
    </div>
  );
}
