"use client";

import {
  Bell,
  ChevronRight,
  Command,
  GraduationCap,
  LifeBuoy,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { navFor } from "@/config/navigation";
import { PAGE_INFO, PAGE_INFO_ROLE } from "@/config/pageInfo";
import { uncoveredLessons } from "@/features/timetable/utils/timetable";
import { Avatar, ThemeToggle } from "@/shared/components";
import { useSidebarCollapsed } from "@/shared/hooks/useSidebarCollapsed";
import { isoToday } from "@/shared/lib/date";
import { useHomeworkAlerts } from "@/features/homework/hooks/useHomeworkAlerts";
import { useAppStore } from "@/store/AppStore";

export function Shell({
  active,
  go,
  actions,
  children,
}: {
  active: string;
  go: (id: string) => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { session, data, signOut, toast, resetDemo } = useAppStore();
  const homeworkAlerts = useHomeworkAlerts();
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();
  const [menu, setMenu] = useState(false);
  const [pop, setPop] = useState<"" | "bell" | "user">("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setPop("");
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!session) return null;
  const school = data.schools.find((s) => s.id === session.schoolId);
  const schoolName = school?.name ?? "Efficht Platform";
  const sections = navFor(session.role, school);
  const roleKey =
    session.role === "Parent / Student" ? (session.isParentAccount ? "Parent" : "Student") : session.role;
  const allPages = sections.flatMap((s) => s.items);
  const searchablePages = allPages.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );
  const current = allPages.find((i) => i.id === active);
  const pendingLeaves = data.leaves.filter((item) => item.status === "Pending").length;
  const pendingFees = data.fees.filter(
    (item) => item.status === "Pending" || item.status === "Overdue",
  ).length;
  const uncovered = session.role === "Admin" ? uncoveredLessons(data, isoToday()) : 0;
  const unreadMsgs =
    session.role === "Teacher"
      ? data.messages.filter((m) => m.teacherId === session.teacherId && m.from === "family" && !m.read)
          .length
      : session.role === "Parent / Student"
        ? data.messages.filter((m) => m.studentId === session.studentId && m.from === "teacher" && !m.read)
            .length
        : 0;
  const notificationCount =
    session.role === "Admin"
      ? Math.min(data.notices.length, 4) +
        (pendingLeaves ? 1 : 0) +
        (pendingFees ? 1 : 0) +
        (uncovered ? 1 : 0)
      : session.role === "Teacher"
        ? data.notices.length + unreadMsgs + homeworkAlerts.toReview.length
        : session.role === "Parent / Student"
          ? data.notices.length + unreadMsgs + homeworkAlerts.newDecisions.length
          : data.notices.length;
  const title =
    active === "overview"
      ? session.role === "Super Admin"
        ? "Platform overview"
        : session.role === "Admin"
          ? "School overview"
          : session.role === "Teacher"
            ? "Teaching overview"
            : roleKey === "Parent"
              ? "Family overview"
              : "My overview"
      : (current?.label ?? "");
  const pick = (id: string) => {
    go(id);
    setMenu(false);
  };

  return (
    <div className={`app ${collapsed ? "is-collapsed" : ""}`}>
      {menu && <div className="scrim" onClick={() => setMenu(false)} />}
      <aside className={`sidebar ${menu ? "is-open" : ""}`}>
        <div className="side-top">
          <div className="brand-row">
            <span className="brand-mark">
              <GraduationCap size={19} strokeWidth={2.4} />
            </span>
            <span className="brand-word">EFFICHT</span>
            <button
              className="side-collapse icon-btn"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <button className="side-close icon-btn" onClick={() => setMenu(false)} aria-label="Close menu">
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="side-nav" aria-label="Main">
          {sections.map((sec) => (
            <div key={sec.title} className="nav-group">
              <p className="nav-cap">{sec.title}</p>
              {sec.items.map(({ id, label, icon: I }) => (
                <button
                  key={id}
                  className={`nav-item ${active === id ? "on" : ""}`}
                  onClick={() => pick(id)}
                  aria-current={active === id ? "page" : undefined}
                  title={collapsed ? label : undefined}
                >
                  <I size={17} />
                  <span className="nav-label">{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="side-bottom">
          <div className="help">
            <LifeBuoy size={16} />
            <div>
              <b>Need assistance?</b>
              <small>Contact your school administrator.</small>
            </div>
          </div>
          <button className="nav-item signout" onClick={signOut} title={collapsed ? "Sign out" : undefined}>
            <LogOut size={17} />
            <span className="nav-label">Sign out</span>
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMenu(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <nav className="crumbs" aria-label="Breadcrumb">
            <span>EFFICHT</span>
            <ChevronRight size={13} />
            <b>{current?.label ?? "Overview"}</b>
          </nav>
          <div className="top-right" ref={popRef}>
            <button
              type="button"
              className="global-search-button"
              onClick={() => {
                setSearchQuery("");
                setSearchOpen(true);
              }}
              aria-label="Search pages"
            >
              <Search size={16} />
              <span>Search pages</span>
              <kbd>Ctrl K</kbd>
            </button>
            <ThemeToggle />
            <div className="pop-wrap">
              <button
                className="icon-btn bell"
                onClick={() => setPop(pop === "bell" ? "" : "bell")}
                aria-label={`Notifications, ${notificationCount} updates`}
              >
                <Bell size={18} />
                <i />
                {notificationCount > 0 && (
                  <span className="notification-count">{Math.min(notificationCount, 99)}</span>
                )}
              </button>
              {pop === "bell" && (
                <div className="pop notification-pop">
                  <p className="pop-title">
                    Notifications <span>{notificationCount} updates</span>
                  </p>
                  {session.role === "Admin" && pendingLeaves > 0 && (
                    <button
                      className="pop-row"
                      onClick={() => {
                        setPop("");
                        go("leaves");
                      }}
                    >
                      <b>
                        {pendingLeaves} leave request{pendingLeaves === 1 ? "" : "s"} awaiting review
                      </b>
                      <small>Review and approve or reject</small>
                    </button>
                  )}
                  {homeworkAlerts.toReview.length > 0 && (
                    <button
                      className="pop-row"
                      onClick={() => {
                        setPop("");
                        go("homework");
                      }}
                    >
                      <b>
                        {homeworkAlerts.toReview.length} homework PDF
                        {homeworkAlerts.toReview.length === 1 ? "" : "s"} to review
                      </b>
                      <small>Open Homework, then Review PDFs</small>
                    </button>
                  )}
                  {homeworkAlerts.newDecisions.length > 0 && (
                    <button
                      className="pop-row"
                      onClick={() => {
                        setPop("");
                        go("homework");
                      }}
                    >
                      <b>
                        Your teacher checked {homeworkAlerts.newDecisions.length} homework
                        {homeworkAlerts.newDecisions.length === 1 ? "" : "s"}
                      </b>
                      <small>Open Homework to see the decision</small>
                    </button>
                  )}
                  {unreadMsgs > 0 && (
                    <button
                      className="pop-row"
                      onClick={() => {
                        setPop("");
                        go("messages");
                      }}
                    >
                      <b>
                        {unreadMsgs} unread message{unreadMsgs === 1 ? "" : "s"}
                      </b>
                      <small>Open Messages</small>
                    </button>
                  )}
                  {uncovered > 0 && (
                    <button
                      className="pop-row"
                      onClick={() => {
                        setPop("");
                        go("teacher-attendance");
                      }}
                    >
                      <b>
                        {uncovered} lesson{uncovered === 1 ? "" : "s"} need a substitute today
                      </b>
                      <small>Arrange cover for absent teachers</small>
                    </button>
                  )}
                  {session.role === "Admin" && pendingFees > 0 && (
                    <button
                      className="pop-row"
                      onClick={() => {
                        setPop("");
                        go("fees");
                      }}
                    >
                      <b>
                        {pendingFees} fee record{pendingFees === 1 ? "" : "s"} need attention
                      </b>
                      <small>Pending or overdue payments</small>
                    </button>
                  )}
                  {data.notices.slice(0, 4).map((notice) => (
                    <button
                      key={notice.id}
                      className="pop-row"
                      onClick={() => {
                        setPop("");
                        go("notices");
                      }}
                    >
                      <b>{notice.title}</b>
                      <small>
                        {notice.date} · {notice.type}
                      </small>
                    </button>
                  ))}
                  {notificationCount === 0 && <p className="notification-empty">You're all caught up.</p>}
                </div>
              )}
            </div>
            <div className="pop-wrap">
              <button className="user-btn" onClick={() => setPop(pop === "user" ? "" : "user")}>
                <Avatar name={session.name} size={34} />
                <span>
                  <b>{session.name}</b>
                  <small>{session.role}</small>
                </span>
              </button>
              {pop === "user" && (
                <div className="pop pop-user">
                  <div className="pop-id">
                    <Avatar name={session.name} size={40} />
                    <div>
                      <b>{session.name}</b>
                      <small>
                        {session.role} · {session.loginId}
                      </small>
                    </div>
                  </div>
                  {/* Only platform staff may reset the demo data (the server enforces this too). */}
                  {session.role === "Super Admin" && (
                    <button
                      className="pop-row pop-act"
                      onClick={() => {
                        setPop("");
                        resetDemo();
                      }}
                    >
                      <RotateCcw size={15} /> Reset demo data
                    </button>
                  )}
                  <button className="pop-row pop-act" onClick={signOut}>
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content" key={active}>
          <div className="page-head">
            <div>
              <p className="eyebrow">{schoolName.toUpperCase()}</p>
              <h1>{title}</h1>
              <p className="page-desc">{PAGE_INFO_ROLE[`${roleKey}:${active}`] ?? PAGE_INFO[active] ?? ""}</p>
            </div>
            {actions}
          </div>
          {children}
          <footer className="foot">
            <span>© 2026 EFFICHT · School Management Platform</span>
            <span>Prototype · not real authentication</span>
          </footer>
        </div>
      </div>
      {searchOpen && (
        <div className="search-backdrop" onMouseDown={() => setSearchOpen(false)}>
          <div
            className="search-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Search dashboard pages"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="search-input-row">
              <Search size={19} />
              <input
                autoFocus
                placeholder="Search pages in your workspace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search pages"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={18} />
              </button>
            </div>
            <div className="search-results">
              {searchablePages.length ? (
                searchablePages.map(({ id, label, icon: Icon }) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => {
                      go(id);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <Icon size={17} />
                    <span>{label}</span>
                    <ChevronRight size={15} />
                  </button>
                ))
              ) : (
                <p>No matching pages in your workspace.</p>
              )}
            </div>
            <div className="search-foot">
              <Command size={14} /> Search is limited to pages available for your selected role.
            </div>
          </div>
        </div>
      )}
      <div className={`toast ${toast ? "show" : ""}`} role="status">
        {toast}
      </div>
    </div>
  );
}
