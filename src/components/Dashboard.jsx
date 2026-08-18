import { supabase } from "../supabaseClient";

function Dashboard() {

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    alert("Logged out!");
  };

  return (
    <div>
      <h1>Welcome to Dashboard</h1>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;