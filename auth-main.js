(() => {
  const SUPABASE_URL = "https://upvkjgwnavtkcsyzwjjn.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_nUSXAIb0eqF7eQuyFYVycw_VHEB3p2k";
  const link = document.getElementById("account-link");
  const signupLink = document.getElementById("auth-signup-link");
  const loginLink = document.getElementById("auth-login-link");
  const signedIn = document.getElementById("signed-in-account");
  const accountLink = document.getElementById("account-email-link");
  const signOutButton = document.getElementById("main-signout");
  if (!window.supabase || !link || !signedIn || !signOutButton) return;

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  async function renderSession(session) {
    const user = session && session.user;
    link.hidden = Boolean(user);
    if (signupLink) signupLink.hidden = Boolean(user);
    if (loginLink) loginLink.hidden = Boolean(user);
    signedIn.hidden = !user;
    signedIn.style.display = user ? "inline-flex" : "none";
    if (!user) return;

    let displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || "";
    try {
      const { data } = await client.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      if (data?.display_name?.trim()) displayName = data.display_name.trim();
    } catch (_) {}
    accountLink.textContent = displayName || "My account";
    accountLink.href = "profile.html";
    accountLink.title = "View your profile";
  }

  client.auth.getSession().then(({ data }) => renderSession(data.session));
  client.auth.onAuthStateChange((_event, session) => renderSession(session));

  signOutButton.addEventListener("click", async () => {
    signOutButton.disabled = true;
    signOutButton.textContent = "Signing out…";
    const { error } = await client.auth.signOut();
    if (error) {
      signOutButton.textContent = "Sign out failed";
      signOutButton.title = error.message;
      signOutButton.disabled = false;
      return;
    }
    renderSession(null);
    signOutButton.textContent = "Sign out";
    signOutButton.disabled = false;
    window.location.href = "index.html";
  });
})();