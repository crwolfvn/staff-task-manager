export function saveSession(user, role,staff) {
  localStorage.setItem( "TT_CurrentUser", user );
  localStorage.setItem( "TT_CurrentRole", role ); }

export function clearSession() { localStorage.removeItem( "TT_CurrentUser" );
  localStorage.removeItem( "TT_CurrentRole" ); }

export function loadSession() {  return { user:  localStorage.getItem( "TT_CurrentUser" ),
    role:
      localStorage.getItem(  "TT_CurrentRole"  ) || "Guest",
    staff:
      localStorage.getItem( "TT_CurrentStaff"  ) || "",  }; }