import assert from "node:assert/strict";
import { test } from "node:test";
import { loadAdmin } from "./helpers/load-admin.mjs";

const STATE = "K".repeat(43);
const CODE = "4/synthetic-authorization-code";

/** Exact shape observed on a real Google redirect back to /admin/confirm. */
function googleRedirect(overrides = {}) {
  return {
    state: STATE,
    iss: "https://accounts.google.com",
    code: CODE,
    scope: "email https://www.googleapis.com/auth/userinfo.profile openid",
    authuser: "0",
    prompt: "consent",
    ...overrides,
  };
}

function callback() {
  const f = loadAdmin();
  try {
    return f.load("lib/admin/google.ts").googleCallback;
  } finally {
    f.restore();
  }
}

test("a real Google redirect carrying iss is accepted", () => {
  const googleCallback = callback();
  assert.deepEqual({ ...googleCallback(googleRedirect()) }, { code: CODE, state: STATE });
});

test("iss must name Google itself when present", () => {
  const googleCallback = callback();
  for (const iss of ["https://evil.invalid", "https://accounts.google.com.evil.invalid", ""]) {
    assert.equal(googleCallback(googleRedirect({ iss })), null, iss);
  }
});

test("an unexpected parameter is still rejected", () => {
  const googleCallback = callback();
  assert.equal(googleCallback(googleRedirect({ injected: "1" })), null);
});
