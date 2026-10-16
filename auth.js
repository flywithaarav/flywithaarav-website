/* FlyWithAarav password authentication and email recovery. Use only the public/publishable Supabase key here. */
(() => {
  const SUPABASE_URL = "https://upvkjgwnavtkcsyzwjjn.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_nUSXAIb0eqF7eQuyFYVycw_VHEB3p2k";
  const SITE_URL = "https://flywithaarav.github.io/flywithaarav-website/";
  const $ = (id) => document.getElementById(id);
  $("year").textContent = new Date().getFullYear();

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  let mode = new URLSearchParams(window.location.search).get("mode") === "signin" ? "signin" : "signup";
  let pendingEmail = "";
  let recoveryMode = false;

  const showMessage = (message, error = false) => {
    $("message").textContent = message;
    $("message").classList.toggle("error", error);
  };
  const showOnly = (id) => {
    ["auth-forms", "verify-panel", "reset-panel", "account-panel"].forEach((key) => {
      $(key).hidden = key !== id;
    });
  };
  function setMode(nextMode) {
    mode = nextMode;
    $("show-signin").classList.toggle("active", mode === "signin");
    $("show-signup").classList.toggle("active", mode === "signup");
    $("password").autocomplete = mode === "signin" ? "current-password" : "new-password";
    $("account-submit").textContent = mode === "signin" ? "SIGN IN ↗" : "CREATE ACCOUNT ↗";
    $("forgot-password").hidden = mode !== "signin";
    $("intro").textContent = mode === "signin"
      ? "Sign in with the email and password you used when creating your account."
      : "Create an account with your email and a password. We'll email you a code to verify your address.";
    showMessage("");
  }
  function showAccount(user) {
    if (!user) return;
    recoveryMode = false;
    showOnly("account-panel");
    $("signup-note").hidden = true;
    $("account-email").textContent = user.email || "";
    showMessage("You're signed in.");
  }
  function showRecovery() {
    recoveryMode = true;
    showOnly("reset-panel");
    $("signup-note").hidden = true;
    $("intro").textContent = "Reset your password securely.";
    showMessage("Choose a new password below.");
    $("new-password").focus();
  }

  const otpInputs = Array.from(document.querySelectorAll(".otp-digit"));
  const otpBoxes = Array.from(document.querySelectorAll(".otp-box"));
  function syncOtp() {
    const token = ($("code").value || "").replace(/\\D/g, "").slice(0, 6);
    if ($("code").value !== token) $("code").value = token;
    otpBoxes.forEach((box, i) => {
      box.textContent = token[i] || "";
      box.classList.toggle("filled", Boolean(token[i]));
      box.classList.toggle("active", i === Math.min(token.length, 5) && token.length < 6);
    });
  }
  function otpStatus(message, kind = "") {
    const box = $("verify-status");
    if (!box) return;
    box.classList.remove("error", "success");
    if (kind) box.classList.add(kind);
    $("verify-status-text").textContent = message;
  }
  $("code").addEventListener("input", () => {
    syncOtp();
    otpStatus($("code").value.length === 6 ? "Code ready to verify" : "Enter all 6 digits");
  });
  $("otp-entry-wrap").addEventListener("click", () => $("code").focus());
  syncOtp();

  $("show-signin").addEventListener("click", () => setMode("signin"));
  $("show-signup").addEventListener("click", () => setMode("signup"));

  $("account-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("email").value.trim();
    const password = $("password").value;
    if (!email || !password) return;
    const button = $("account-submit");
    button.disabled = true;
    showMessage(mode === "signin" ? "Signing in…" : "Creating your account…");
    try {
      if (mode === "signin") {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showAccount(data.user);
      } else {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: SITE_URL + "auth.html" }
        });
        if (error) throw error;
        if (data.session && data.user) {
          showAccount(data.user);
        } else {
          pendingEmail = email;
          showOnly("verify-panel");
          $("signup-note").hidden = false;
          showMessage("Account created. Enter the 6-digit code from your confirmation email.");
          $("code").value = "";\n          syncOtp();\n          $("code").focus();
          otpStatus("Enter all 6 digits");
        }
      }
    } catch (error) {
      showMessage(error.message || "Something went wrong. Please try again.", true);
    } finally {
      button.disabled = false;
    }
  });

  $("verify-panel").addEventListener("submit", async (event) => {
    event.preventDefault();
    syncOtp();
    const token = ($("code").value || "").replace(/\\D/g, "").slice(0, 6);
    if (!/^[0-9]{6}$/.test(token)) { otpStatus("Enter all 6 digits", "error"); otpInputs.find(input => !input.value)?.focus(); return; }
    const button = $("verify-panel").querySelector("button");
    button.disabled = true;
    showMessage("Verifying your email…");
    try {
      const { data, error } = await client.auth.verifyOtp({
        email: pendingEmail || $("email").value.trim(),
        token,
        type: "signup"
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

  $("forgot-password").addEventListener("click", async () => {
    const email = $("email").value.trim();
    if (!email) {
      showMessage("Enter your email address first, then choose Forgot your password.", true);
      $("email").focus();
      return;
    }
    const button = $("forgot-password");
    button.disabled = true;
    showMessage("Sending password reset email…");
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: SITE_URL + "auth.html"
      });
      if (error) throw error;
      showMessage("If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.");
    } catch (error) {
      showMessage(error.message || "Couldn't send the reset email. Please try again.", true);
    } finally {
      button.disabled = false;
    }
  });

  $("reset-panel").addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = $("new-password").value;
    const button = $("reset-panel").querySelector("button");
    button.disabled = true;
    showMessage("Updating your password…");
    try {
      const { data, error } = await client.auth.updateUser({ password });
      if (error) throw error;
      recoveryMode = false;
      $("new-password").value = "";
      showAccount(data.user);
      showMessage("Password updated successfully. You're signed in.");
    } catch (error) {
      showMessage(error.message || "Couldn't update the password. Open a fresh reset email and try again.", true);
    } finally {
      button.disabled = false;
    }
  });

  $("logout").addEventListener("click", async () => {
    const button = $("logout");
    button.disabled = true;
    const { error } = await client.auth.signOut();
    if (error) {
      showMessage(error.message, true);
      button.disabled = false;
      return;
    }
    $("email").value = "";
    $("password").value = "";
    $("code").value = "";
    pendingEmail = "";
    showOnly("auth-forms");
    setMode("signin");
    showMessage("You've signed out.");
    button.disabled = false;
  });

  client.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      showRecovery();
    } else if (session && !recoveryMode) {
      showAccount(session.user);
    }
  });

  client.auth.getSession().then(({ data, error }) => {
    if (error) showMessage(error.message, true);
    if (data.session && !recoveryMode) showAccount(data.session.user);
    else if (!data.session) setMode(mode);
  });
})();