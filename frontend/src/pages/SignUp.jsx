import React, { useState, useEffect } from "react";
import { api } from "../api/client";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    doj: "",
    phone: "",
    email: "",
    department: "",
    password: "",
    password2: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = (data) => {
    const errs = {};

    if (!data.name.trim()) {
      errs.name = "Name is required.";
    } else if (data.name.length < 2) {
      errs.name = "Name should be at least 2 characters.";
    }

    if (!data.dob) {
      errs.dob = "Date of Birth is required.";
    } else if (new Date(data.dob) >= new Date()) {
      errs.dob = "Date of Birth must be in the past.";
    }

    if (!data.doj) {
      errs.doj = "Date of Joining is required.";
    } else if (new Date(data.doj) > new Date()) {
      errs.doj = "Date of Joining cannot be in the future.";
    } else if (data.dob && new Date(data.doj) < new Date(data.dob)) {
      errs.doj = "Date of Joining cannot be before Date of Birth.";
    }

    if (!data.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!/^\+?[\d\s\-]{7,15}$/.test(data.phone)) {
      errs.phone = "Invalid phone number.";
    }

    if (!data.email.trim()) {
      errs.email = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email.trim())
    ) {
      errs.email = "Invalid email address.";
    }

    if (!data.password) {
      errs.password = "Password is required.";
    } else if (data.password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }

    if (data.password !== data.password2) {
      errs.password2 = "Passwords do not match.";
    }

    if (!data.department) {
      errs.department = "Please select a department.";
    }

    return errs;
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate(formData));
    }
  }, [formData, touched]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  // FIX: Change the isValid logic to only check for errors
  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setTouched({
      name: true,
      dob: true,
      doj: true,
      phone: true,
      email: true,
      department: true,
      password: true,
      password2: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) {
      setSubmitSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    try {
      const payload = {
        username: formData.email.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password2: formData.password2,
        first_name: formData.name.trim(),
        department: formData.department || null,
        phone: formData.phone.trim() || null,
        dob: formData.dob || null,
        doj: formData.doj || null,
      };
      const data = await api.post("/accounts/users/register", payload);
      setSubmitSuccess(true);
      if (data.access && data.user) {
        const u = {
          id: data.user.id,
          name: data.user.first_name ? `${data.user.first_name} ${data.user.last_name || ""}`.trim() : data.user.username,
          email: data.user.email,
          role: data.user.role,
          department: data.user.department,
        };
        localStorage.setItem("crmUser", JSON.stringify(u));
        localStorage.setItem("crmToken", data.access);
        if (data.refresh) localStorage.setItem("crmRefreshToken", data.refresh);
        setTimeout(() => { window.location.href = "/"; }, 1500);
      } else {
        setTimeout(() => setSubmitSuccess(false), 4000);
      }
    } catch (err) {
      setSubmitError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={styles.container} aria-live="polite">
      <form onSubmit={handleSubmit} noValidate style={styles.form}>
        <h2 style={styles.heading}>Sign Up</h2>
        {submitError && (
          <p role="alert" style={{ ...styles.error, marginBottom: "1rem" }}>
            {submitError}
          </p>
        )}

        {/* Name */}
        <label htmlFor="name" style={styles.label}>
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Your full name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby="name-error"
          style={{
            ...styles.input,
            borderColor: errors.name ? "#d9534f" : "#ccc",
          }}
          autoComplete="name"
        />
        {errors.name && touched.name && (
          <p id="name-error" style={styles.error}>
            {errors.name}
          </p>
        )}

        {/* Date of Birth */}
        <label htmlFor="dob" style={styles.label}>
          Date of Birth (DOB)
        </label>
        <input
          type="date"
          id="dob"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={errors.dob ? "true" : "false"}
          aria-describedby="dob-error"
          max={new Date().toISOString().split("T")[0]}
          style={{
            ...styles.input,
            borderColor: errors.dob ? "#d9534f" : "#ccc",
            ...styles.smoothHoverFocus,
          }}
        />
        {errors.dob && touched.dob && (
          <p id="dob-error" style={styles.error}>
            {errors.dob}
          </p>
        )}

        {/* Date of Joining */}
        <label htmlFor="doj" style={styles.label}>
          Date of Joining (DOJ)
        </label>
        <input
          type="date"
          id="doj"
          name="doj"
          value={formData.doj}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={errors.doj ? "true" : "false"}
          aria-describedby="doj-error"
          max={new Date().toISOString().split("T")[0]}
          min={formData.dob || "1900-01-01"}
          style={{
            ...styles.input,
            borderColor: errors.doj ? "#d9534f" : "#ccc",
            ...styles.smoothHoverFocus,
          }}
        />
        {errors.doj && touched.doj && (
          <p id="doj-error" style={styles.error}>
            {errors.doj}
          </p>
        )}

        {/* Phone */}
        <label htmlFor="phone" style={styles.label}>
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="+123 456 7890"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={errors.phone ? "true" : "false"}
          aria-describedby="phone-error"
          style={{
            ...styles.input,
            borderColor: errors.phone ? "#d9534f" : "#ccc",
          }}
          autoComplete="tel"
        />
        {errors.phone && touched.phone && (
          <p id="phone-error" style={styles.error}>
            {errors.phone}
          </p>
        )}

        {/* Email */}
        <label htmlFor="email" style={styles.label}>
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="example@mail.com"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby="email-error"
          style={{
            ...styles.input,
            borderColor: errors.email ? "#d9534f" : "#ccc",
          }}
          autoComplete="email"
        />
        {errors.email && touched.email && (
          <p id="email-error" style={styles.error}>
            {errors.email}
          </p>
        )}

        {/* Password */}
        <label htmlFor="password" style={styles.label}>
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={errors.password ? "true" : "false"}
          style={{
            ...styles.input,
            borderColor: errors.password ? "#d9534f" : "#ccc",
          }}
          autoComplete="new-password"
        />
        {errors.password && touched.password && (
          <p id="password-error" style={styles.error}>
            {errors.password}
          </p>
        )}

        {/* Confirm Password */}
        <label htmlFor="password2" style={styles.label}>
          Confirm Password
        </label>
        <input
          type="password"
          id="password2"
          name="password2"
          placeholder="Re-enter password"
          value={formData.password2}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={errors.password2 ? "true" : "false"}
          style={{
            ...styles.input,
            borderColor: errors.password2 ? "#d9534f" : "#ccc",
          }}
          autoComplete="new-password"
        />
        {errors.password2 && touched.password2 && (
          <p id="password2-error" style={styles.error}>
            {errors.password2}
          </p>
        )}

        {/* Department */}
        <label htmlFor="department" style={styles.label}>
          Department
        </label>
        <select
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={errors.department ? "true" : "false"}
          aria-describedby="department-error"
          style={{
            ...styles.select,
            borderColor: errors.department ? "#d9534f" : "#ccc",
            ...styles.smoothHoverFocus,
          }}
        >
          <option value="" disabled>
            -- Select Department --
          </option>
          <option value="domestic">Domestic Sales</option>
          <option value="international">International Sales</option>
          <option value="finance">Finance</option>
          <option value="hr">HR</option>
          <option value="techsupport">Tech Support</option>
        </select>
        {errors.department && touched.department && (
          <p id="department-error" style={styles.error}>
            {errors.department}
          </p>
        )}

        <button
          type="submit"
          style={{
            ...styles.button,
            backgroundColor: isValid && !isSubmitting ? "#4953ff" : "#888",
            cursor: isValid && !isSubmitting ? "pointer" : "not-allowed",
          }}
          disabled={!isValid || isSubmitting}
          aria-disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>

        {submitSuccess && (
          <p role="alert" style={styles.success}>
            🎉 Registration successful!
          </p>
        )}
      </form>
    </main>
  );
};

const styles = {
  container: {
    maxWidth: "480px",
    margin: "3rem auto",
    padding: "2rem",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxSizing: "border-box",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    marginBottom: "2rem",
    color: "#333",
    textAlign: "center",
    fontWeight: "700",
    fontSize: "2rem",
  },
  label: {
    marginBottom: "0.3rem",
    fontWeight: "600",
    color: "#555",
    fontSize: "1rem",
  },
  input: {
    padding: "0.75rem 1rem",
    marginBottom: "1.2rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    transition: "border-color 0.3s, box-shadow 0.3s",
    fontFamily: "inherit",
    outline: "none",
  },
  select: {
    padding: "0.75rem 1rem",
    marginBottom: "1.8rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#fff",
    transition: "border-color 0.3s, box-shadow 0.3s",
    fontFamily: "inherit",
    outline: "none",
  },
  button: {
    backgroundColor: "#4953ff",
    color: "#fff",
    fontWeight: "700",
    padding: "0.85rem 1rem",
    fontSize: "1.1rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
    marginTop: "0.5rem",
  },
  error: {
    color: "#d9534f",
    fontSize: "0.85rem",
    marginTop: "-0.9rem",
    marginBottom: "1rem",
  },
  success: {
    marginTop: "1rem",
    color: "#28a745",
    fontWeight: "600",
    textAlign: "center",
    fontSize: "1.1rem",
    animation: "fadeInOut 4s ease forwards",
  },
  smoothHoverFocus: {
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
  },
};

export default SignUp;