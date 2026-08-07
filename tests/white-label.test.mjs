import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("clinic-specific content is isolated from components", async () => {
  const components = await read("app/components.tsx");
  assert.doesNotMatch(components, /101 Sorrisos|Gravataí|Matriz|Filial/);
  assert.doesNotMatch(components, /\/images\//);
});

test("brand colors are sourced from CSS variables", async () => {
  const css = await read("app/globals.css");
  const layout = await read("app/layout.tsx");
  const requiredVariables = [
    "--color-primary",
    "--color-primary-dark",
    "--color-accent",
    "--color-secondary",
    "--color-background",
    "--color-surface",
    "--color-text",
    "--color-muted",
    "--color-whatsapp",
  ];

  for (const variable of requiredVariables) {
    assert.match(layout, new RegExp(variable));
    assert.match(css, new RegExp(`var\\(${variable}\\)`));
  }

  assert.doesNotMatch(css, /#[\da-f]{3,8}\b/iu);
  assert.doesNotMatch(css, /rgba?\(/iu);
});

test("all required local brand assets exist", async () => {
  const assets = [
    "public/brand/logo.webp",
    "public/brand/hero.webp",
    "public/brand/og-image.webp",
    "public/brand/procedimentos/clareamento-antes.webp",
    "public/brand/procedimentos/clareamento-depois.webp",
    "public/brand/procedimentos/alinhamento-antes.webp",
    "public/brand/procedimentos/alinhamento-depois.webp",
    "public/brand/procedimentos/restauracao-antes.webp",
    "public/brand/procedimentos/restauracao-depois.webp",
  ];

  for (const asset of assets) {
    const url = new URL(asset, root);
    await access(url);
    assert.ok((await stat(url)).size > 0, `${asset} must not be empty`);
  }
});

test("configuration exposes every white-label domain", async () => {
  const config = await read("src/config/clinic.ts");
  for (const name of [
    "clinic",
    "theme",
    "assets",
    "units",
    "treatments",
    "beforeAfter",
    "faq",
    "seo",
    "featureFlags",
  ]) {
    assert.match(config, new RegExp(`export const ${name}\\b`));
  }

  const whatsappLinks = config.match(/https:\/\/wa\.me\/\d+/g) ?? [];
  assert.ok(whatsappLinks.length >= 3);
  assert.match(config, /whatsappMessage:\s*[\r\n\s]*"[^"]+"/);
});

test("responsive overflow safeguards remain enabled", async () => {
  const css = await read("app/globals.css");
  assert.match(css, /html\s*\{[^}]*overflow-x:\s*clip/s);
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*clip/s);
  assert.match(css, /@media\s*\(max-width:\s*390px\)/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(max-width:\s*1120px\)/);
});
