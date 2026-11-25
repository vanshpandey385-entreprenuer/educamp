"use client";

import { useEffect, useState } from "react";
import { navFor } from "@/config/navigation";
import { Login } from "@/features/auth/components/Login";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { ErrorState } from "@/shared/components";
import { Shell } from "@/shared/layout/Shell";
import { useAppStore } from "@/store/AppStore";
import { adminRoutes } from "./adminRoutes";
import { familyRoutes } from "./familyRoutes";
import { superAdminRoutes } from "./superAdminRoutes";
import { teacherRoutes } from "./teacherRoutes";
import type { RouteTable } from "./types";

/** Chooses the route table for the signed-in role. */
function routesFor(
  session: NonNullable<ReturnType<typeof useAppStore>["session"]>,
  data: ReturnType<typeof useAppStore>["data"],
  go: (id: string) => void,
  allClasses: string[],
): RouteTable {
  if (session.role === "Super Admin") return superAdminRoutes(go);
  if (session.role === "Admin") return adminRoutes(go, allClasses);

  if (session.role === "Teacher") {
    const teacher = data.teachers.find((t) => t.id === session.teacherId);
    return teacher ? teacherRoutes(teacher, go) : {};
  }

  const student = data.students.find((s) => s.id === session.studentId);
  return student ? familyRoutes(student, Boolean(session.isParentAccount), go) : {};
}

/** The signed-in app: sidebar, top bar and the current page. */
function Workspace() {
  const { session, data } = useAppStore();
  const allClasses = useClasses();
  const [activePage, setActivePage] = useState("overview");

  // Start on the page the role lands on after sign-in.
  useEffect(() => {
    setActivePage(session?.landing ?? "overview");
  }, [session?.role, session?.loginId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activePage]);

  if (!session) return null;

  const school = data.schools.find((s) => s.id === session.schoolId);
  const menuIds = navFor(session.role, school).flatMap((section) => section.items.map((item) => item.id));
  const pageId = menuIds.includes(activePage) ? activePage : "overview";

  const routes = routesFor(session, data, setActivePage, allClasses);

  return (
    <Shell active={pageId} go={setActivePage}>
      {routes[pageId] ?? null}
    </Shell>
  );
}

/** Shows a spinner while loading, the login page when signed out, and the workspace when signed in. */
export function AppRouter() {
  const { ready, loadFailed, session } = useAppStore();
  if (!ready) {
    return (
      <div className="boot">
        <span className="spinner dark" />
      </div>
    );
  }
  if (loadFailed) {
    return (
      <div className="boot">
        <ErrorState
          title="Could not reach the server"
          text="Check your internet connection and try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }
  return session ? <Workspace /> : <Login />;
}
