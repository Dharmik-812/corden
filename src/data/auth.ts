export interface AuthFeature {
  title: string;
  desc: string;
}

export const AUTH_DATA = {
  badge: "Corden Atelier",
  title: "Your drafting workspace,",
  titleHighlight: "in the browser.",
  desc: "Design in 2D and 3D with zero installation. Projects persist in your browser session for seamless continuation.",
  previewTitle: "corden : scene editor",
  backToHome: "Back to home",
  features: [
    { title: "2D Pixel Studio", desc: "Draft precision blueprints and pixel schemes" },
    { title: "3D Spatial Editor", desc: "Model, light, and sculpt scenes natively" },
    { title: "Local Persistence", desc: "Instant project recovery across sessions" },
  ],
  login: {
    title: "Welcome back",
    subtitle: "Sign in to access your spatial drafts and workspace.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    cta: "Sign in",
    signingIn: "Signing in...",
    newToCorden: "New to Corden?",
    createAccount: "Create a free account",
    trustBadge: "Encrypted session : Zero install required",
  },
  signup: {
    title: "Create your atelier account",
    subtitle: "Start drafting in 2D and 3D directly from your browser.",
    nameLabel: "Full Name",
    namePlaceholder: "Jane Doe",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Create a password",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm your password",
    cta: "Create account",
    creatingAccount: "Creating account...",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign in to workspace",
    trustBadge: "Free forever tier : Zero setup required",
  },
} as const;
