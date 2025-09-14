export class LoginComponent {
  constructor(authService, onLoginSuccess) {
    this.authService = authService;
    this.onLoginSuccess = onLoginSuccess;
    this.init();
  }

  init() {
    this.loginForm = document.getElementById("loginFormElement");
    this.registerForm = document.getElementById("registerFormElement");
    this.loginError = document.getElementById("loginError");
    this.registerError = document.getElementById("registerError");
    this.loginErrorText = document.getElementById("loginErrorText");
    this.registerErrorText = document.getElementById("registerErrorText");

    this.bindEvents();
  }

  bindEvents() {
    if (this.loginForm) {
      this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    if (this.registerForm) {
      this.registerForm.addEventListener("submit", (e) =>
        this.handleRegister(e)
      );
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    this.setLoadingState(this.loginForm, true, "Wird angemeldet...");

    const result = await this.authService.login(email, password);

    if (result.success) {
      this.onLoginSuccess(this.authService.user);
    } else {
      this.showError(this.loginError, this.loginErrorText, result.message);
    }

    this.setLoadingState(this.loginForm, false, "Anmelden");
  }

  async handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById(
      "registerConfirmPassword"
    ).value;

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
  }

  setLoadingState(form, isLoading, text) {
    const submitBtn = form.querySelector('button[type="submit"]');
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
    errorTextElement.textContent = message;
    errorElement.classList.remove("hidden");
  }

  resetErrors() {
    if (this.loginError) this.loginError.classList.add("hidden");
    if (this.registerError) this.registerError.classList.add("hidden");
  }
}
