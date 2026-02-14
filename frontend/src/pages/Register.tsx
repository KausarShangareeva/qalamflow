import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCopy } from "../hooks/useCopy";
import styles from "./Register.module.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { get } = useCopy();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{get("auth.register.title")}</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder={get("auth.register.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder={get("auth.register.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={get("auth.register.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? get("auth.register.submitting") : get("auth.register.submit")}
        </button>
      </form>
      <p className={styles.link}>
        {get("auth.register.hasAccount")} <Link to="/login">{get("auth.register.loginLink")}</Link>
      </p>
    </div>
  );
}
