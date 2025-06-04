// src/utils/logout.ts;
export const logout = (navigate: (path: string) => void) => {
  try {
    const result = confirm("Are you sure, you want to log out?");
    if (!result) return;

    localStorage.removeItem("userName");
    localStorage.removeItem("responseMsg");
    localStorage.removeItem("progressError");

    // Redirect to login page
    navigate("/");

  } catch (error) {
    console.error("Logout error:", error);
  }
}
