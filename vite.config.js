var _a;
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// For GitHub Pages **project** sites the app is served from
// https://<user>.github.io/<repo>/ , so the base path must match the repo name.
// Default below assumes the repo is named "homevault-web". Override at build time
// with VITE_BASE=/your-repo/ if your repo has a different name, or VITE_BASE=/ for
// a user/organization page or a custom domain.
export default defineConfig({
    plugins: [react()],
    base: (_a = process.env.VITE_BASE) !== null && _a !== void 0 ? _a : "/homevault-web/",
});
