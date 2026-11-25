"use client";

import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarCheck,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  Lock,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEMO_LOGIN, LOGIN_COPY } from "@/features/auth/config/loginCopy";
import { Role, School } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

const ROLES: { id: Exclude<Role, "Super Admin">; icon: typeof Users }[] = [
  { id: "Parent / Student", icon: Users },
  { id: "Teacher", icon: GraduationCap },
  { id: "Admin", icon: ShieldCheck },
];

export function Login() {
  const { data, login } = useAppStore();
  const [platform, setPlatform] = useState(false);
  const [school, setSchool] = useState<School | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Exclude<Role, "Super Admin">>("Parent / Student");
  const [loginId, setLoginId] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const matches = useMemo(
    () => data.schools.filter((s) => (s.name + " " + s.city).toLowerCase().includes(q.toLowerCase())),
    [data.schools, q],
  );
  const activeRole: Role = platform ? "Super Admin" : role;

  function pick(s: School) {
    if (s.status !== "Active") return;
    setSchool(s);
    setQ("");
    setOpen(false);
    setErr("");
  }

  /** Fills the form with the demo account for the chosen role. */
  async function fillDemo() {
    const demoSchool = platform ? null : (data.schools.find((s) => s.status === "Active") ?? null);
    if (!platform) setSchool(demoSchool);
    setLoginId(DEMO_LOGIN[activeRole]);
    setErr("");

    // Parent and student passwords are checked for real, so ask the server for the sample family's password.
    if (activeRole === "Parent / Student") {
      try {
        const res = await fetch("/api/demo-login", { cache: "no-store" });
        const json = await res.json();
        setPw(json.parentPassword ?? "");
      } catch {
        setPw("");
      }
    } else {
      setPw("preview-pass");
    }
  }

  /** Sends the login to the server. The server checks it and sets the cookie. */
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!platform && !school) return setErr("Choose an approved school.");
    if (!loginId.trim() || !pw) return setErr("Enter your login ID and password.");

    setErr("");
    setBusy(true);
    const problem = await login({
      role: activeRole,
      schoolId: platform ? null : school!.id,
      loginId,
      password: pw,
    });
    setBusy(false);
    if (problem) setErr(problem);
  }

  return (
    <main className="login">
      <section className="login-hero" aria-hidden={false}>
        <div className="rings" aria-hidden />
        <div className="brand-row">
          <span className="brand-mark">
            <GraduationCap size={20} strokeWidth={2.4} />
          </span>
          <span className="brand-word">EFFICHT</span>
        </div>

        <div className="hero-copy">
          <p className="eyebrow-lime">SMARTER SCHOOL OPERATIONS</p>
          <h1>
            Everything your school needs.
            <br />
            <em>In one place.</em>
          </h1>
          <p className="hero-sub">
            A connected platform for school teams, teachers, parents and students — designed to make everyday
            school work simpler.
          </p>
          <ul className="hero-points">
            <li>
              <ShieldCheck size={16} /> Secure access
            </li>
            <li>
              <CalendarCheck size={16} /> Attendance
            </li>
            <li>
              <BookOpen size={16} /> Academic updates
            </li>
          </ul>
        </div>

        <div className="hero-card" aria-hidden>
          <div className="hero-card-top">
            <span>Today at a glance</span>
            <i />
          </div>
          <div className="hero-card-row">
            <div>
              <b>94.6%</b>
              <small>Student attendance</small>
            </div>
            <div>
              <b>3</b>
              <small>New notices</small>
            </div>
          </div>
          <div className="hero-bars">
            <span style={{ height: "46%" }} />
            <span style={{ height: "62%" }} />
            <span style={{ height: "54%" }} />
            <span style={{ height: "78%" }} />
            <span style={{ height: "70%" }} />
            <span className="hl" style={{ height: "92%" }} />
          </div>
        </div>

        <p className="hero-foot">EFFICHT School Management Platform</p>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={submit} noValidate>
          <p className="eyebrow">{platform ? "PLATFORM CONSOLE" : "WELCOME BACK"}</p>
          <h2>Sign in to EFFICHT</h2>
          <p className="login-sub">{LOGIN_COPY[activeRole].sub}</p>

          {!platform && (
            <>
              <div className="field" ref={box}>
                <span>School</span>
                <div className={`combo ${open ? "is-open" : ""}`}>
                  <Search size={16} className="combo-icon" />
                  <input
                    value={open ? q : (school?.name ?? "")}
                    placeholder="Search or select your school"
                    onFocus={() => {
                      setOpen(true);
                      setQ("");
                    }}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setOpen(true);
                    }}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="school-list"
                    aria-label="School"
                  />
                  <button
                    type="button"
                    className="combo-toggle"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle school list"
                  >
                    <ChevronDown size={16} />
                  </button>
                  {open && (
                    <ul className="combo-list" id="school-list" role="listbox">
                      {matches.map((s) => (
                        <li
                          key={s.id}
                          role="option"
                          aria-selected={school?.id === s.id}
                          aria-disabled={s.status !== "Active"}
                          className={s.status !== "Active" ? "is-disabled" : ""}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            pick(s);
                          }}
                        >
                          <span className="combo-school">
                            <Building2 size={15} />
                          </span>
                          <div>
                            <b>{s.name}</b>
                            <small>
                              <MapPin size={11} /> {s.city}
                            </small>
                          </div>
                          {s.status === "Active" ? (
                            school?.id === s.id ? (
                              <Check size={16} />
                            ) : null
                          ) : (
                            <em>Awaiting approval</em>
                          )}
                        </li>
                      ))}
                      {!matches.length && <li className="combo-empty">No school matches “{q}”.</li>}
                    </ul>
                  )}
                </div>
              </div>

              <div className="field">
                <span>Login as</span>
                <div className="seg" role="tablist">
                  {ROLES.map(({ id, icon: I }) => (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={role === id}
                      key={id}
                      className={role === id ? "on" : ""}
                      onClick={() => {
                        setRole(id);
                        setErr("");
                      }}
                    >
                      <I size={15} />
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <label className="field">
            <span>{LOGIN_COPY[activeRole].idLabel}</span>
            <input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder={LOGIN_COPY[activeRole].idHint}
              autoComplete="username"
              autoCapitalize="none"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <div className="pw">
              <Lock size={15} />
              <input
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {err && (
            <div className="form-error" role="alert">
              <ShieldAlert size={15} />
              {err}
            </div>
          )}

          <button className="btn-primary btn-block" disabled={busy}>
            {busy ? (
              <span className="spinner" />
            ) : (
              <>
                Sign in <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="login-links">
            <button type="button" className="link-btn" onClick={fillDemo}>
              <Wand2 size={13} /> Fill demo credentials
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setPlatform(!platform);
                setErr("");
                setLoginId("");
                setPw("");
              }}
            >
              {platform ? "← Back to school sign in" : "Platform staff sign in"}
            </button>
          </div>

          <p className="login-note">
            <Lock size={13} /> {LOGIN_COPY[activeRole].note}
          </p>
          <div className="preview-note">
            <Info size={15} />
            <span>
              <b>Preview mode only.</b>{" "}
              {activeRole === "Parent / Student"
                ? "Student and parent passwords are checked by the server against the demo records."
                : "Teacher, admin and platform passwords are not verified in this preview."}{" "}
              Connect secure authentication before real school use.
            </span>
          </div>
        </form>
      </section>
    </main>
  );
}
