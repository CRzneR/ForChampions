export class LoginComponent {
  constructor(authService, onLoginSuccess) {
    this.authService = authService;
    this.onLoginSuccess = onLoginSuccess;
    this.init();
  }

  init() {
    // Forms & Fehlercontainer
    this.loginForm = document.getElementById("loginFormElement");
    this.registerForm = document.getElementById("registerFormElement");
    this.loginError = document.getElementById("loginError");
    this.registerError = document.getElementById("registerError");
    this.loginErrorText = document.getElementById("loginErrorText");
    this.registerErrorText = document.getElementById("registerErrorText");

    // Inputs
    this.loginEmail = document.getElementById("loginEmail");
    this.loginPassword = document.getElementById("loginPassword");
    this.registerUsername = document.getElementById("registerUsername");
    this.registerEmail = document.getElementById("registerEmail");
    this.registerPassword = document.getElementById("registerPassword");
    this.registerConfirmPassword = document.getElementById(
      "registerConfirmPassword"
    );

    this.bindEvents();
  }

  bindEvents() {
    this.loginForm?.addEventListener("submit", this.handleLogin);
    this.registerForm?.addEventListener("submit", this.handleRegister);
  }

  unbindEvents() {
    this.loginForm?.removeEventListener("submit", this.handleLogin);
    this.registerForm?.removeEventListener("submit", this.handleRegister);
  }

  handleLogin = async (e) => {
    e.preventDefault();
    this.resetErrors();

    const email = this.loginEmail?.value || "";
    const password = this.loginPassword?.value || "";

    this.setLoadingState(this.loginForm, true, "Wird angemeldet...");
    const result = await this.authService.login(email, password);

    if (result.success) {
      this.onLoginSuccess(this.authService.user);
    } else {
      this.showError(this.loginError, this.loginErrorText, result.message);
    }

    this.setLoadingState(this.loginForm, false, "Anmelden");
  };

  handleRegister = async (e) => {
    e.preventDefault();
    this.resetErrors();

    const username = this.registerUsername?.value || "";
    const email = this.registerEmail?.value || "";
    const password = this.registerPassword?.value || "";
    const confirmPassword = this.registerConfirmPassword?.value || "";

    if (password !== confirmPassword) {
      this.showError(
        this.registerError,
        this.registerErrorText,
        "Passwörter stimmen nicht überein"
      );
      return;
    }

    this.setLoadingState(this.registerForm, true, "Wird registriert...");
    const result = await this.authService.register(
      username,
      email,
      password,
      confirmPassword
    );

    if (result.success) {
      this.onLoginSuccess(this.authService.user);
    } else {
      this.showError(
        this.registerError,
        this.registerErrorText,
        result.message
      );
    }

    this.setLoadingState(this.registerForm, false, "Registrieren");
  };

  setLoadingState(form, isLoading, text) {
    const submitBtn = form?.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    if (isLoading) {
      submitBtn.setAttribute("data-original-text", submitBtn.textContent);
      submitBtn.textContent = text;
      submitBtn.disabled = true;
    } else {
      submitBtn.textContent =
        submitBtn.getAttribute("data-original-text") || text;
      submitBtn.disabled = false;
    }
  }

  showError(errorElement, errorTextElement, message) {
    if (!errorElement || !errorTextElement) return;
    errorTextElement.textContent = message;
    errorElement.classList.remove("hidden");
  }

  resetErrors() {
    this.loginError?.classList.add("hidden");
    this.registerError?.classList.add("hidden");
  }
}
