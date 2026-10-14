/*
 FlyWithAarav email-code authentication.
 Setup required: create a Supabase project, enable email auth, and paste the
 Project URL and publishable/anon key below. Never put a service_role key here.
 In Supabase > Authentication > Email Templates, set the confirmation email
 body to include the one-time code: {{ .Token }}.
*/
(() => {
  const SUPABASE_URL = "https://upvkjgwnavtkcsyzwjjn.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_nUSXAIb0eqF7eQuyFYVycw_VHEB3p2k";
  const $ = (id) => document.getElementById(id);
  $("year").textContent = new Date().getFullYear();

  const showMessage = (message, error = false) => {
    $("message").textContent = message;
    $("message").classList.toggle("error", error);
  };

  if (!window.supabase || SUPABASE_URL.startsWith("PASTE_") || SUPABASE_ANON_KEY.startsWith("PASTE_")) {
    showMessage("Setup needed: connect this page to a Supabase project before accounts can work.", true);
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  let pendingEmail = "";

  function showAccount(user) {
    $("email-form").hidden = true;
    $("verify-panel").hidden = true;
    $("signup-note").hidden = true;
    $("account-panel").hidden = !user;
    if (user) {
      $("account-email").textContent = user.email || "";
      showMessage("Your email is verified and you're signed in.");
    }
  }

  client.auth.getSession().then(({ data, error }) => {
    if (error) showMessage(error.message, true);
    if (data.session) showAccount(data.session.user);
  });

  $("email-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("email").value.trim();
    if (!email) return;
    const button = $("email-form").querySelector("button");
    button.disabled = true;
    showMessage("Sending your verification code…");
    try {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }
      });
      if (error) throw error;
      pendingEmail = email;
      $("email-form").hidden = true;
      $("verify-panel").hidden = false;
      $("signup-note").hidden = false;
      showMessage("Code sent. Enter the 6-digit code from your email.");
      $("code").focus();
    } catch (error) {
      showMessage(error.message || "Couldn't send a code. Please try again.", true);
    } finally {
      button.disabled = false;
    }
  });

  $("verify-panel").addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = $("code").value.trim();
    const button = $("verify-panel").querySelector("button");
    button.disabled = true;
    showMessage("Checking your code…");
    try {
      const { data, error } = await client.auth.verifyOtp({
        email: pendingEmail || $("email").value.trim(),
        token,
        type: "email"
      });
      if (error) throw error;
      if (!data.user) throw new Error("Verification didn't return an account. Please try again.");
      showAccount(data.user);
    } catch (error) {
      showMessage(error.message || "That code didn't work. Request a new one and try again.", true);
    } finally {
      button.disabled = false;
    }
  });

  $("logout").addEventListener("click", async () => {
    const { error } = await client.auth.signOut();
    if (error) {
      showMessage(error.message, true);
      return;
    }
    $("account-panel").hidden = true;
    $("email-form").hidden = false;
    $("email").value = "";
    $("code").value = "";
    pendingEmail = "";
    showMessage("You've signed out.");
  });

  client.auth.onAuthStateChange((_event, session) => {
    if (session) showAccount(session.user);
  });
})();
