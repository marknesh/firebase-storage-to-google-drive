const ua = process.env.npm_config_user_agent || "";
if (!ua.toLowerCase().includes("pnpm")) {
  console.error(
    "\nERROR: This project requires pnpm. Please do not use npm or yarn.\n"
  );
  process.exit(1);
}
