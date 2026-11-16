import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const directory = fileURLToPath(new URL("../../lib/preinscripcion/", import.meta.url));
const cache = new Map();

// Transpile in memory like next-config.test.mjs, resolving only local TS imports.
// No generated files, experimental Node flags or application-side test hooks.
export function loadPreinscripcion(name) {
  if (!["config", "types", "validation"].includes(name)) {
    throw new Error(`Unsupported shared module: ${name}`);
  }
  return loadModule(path.join(directory, `${name}.ts`));
}

function loadModule(filename) {
  const relative = path.relative(directory, filename);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !filename.endsWith(".ts")) {
    throw new Error("Only preregistration TypeScript modules may be loaded");
  }
  if (cache.has(filename)) return cache.get(filename).exports;
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  });
  const module = { exports: {} };
  cache.set(filename, module);
  const localRequire = (specifier) => {
    if (!specifier.startsWith("./")) throw new Error(`Unsupported import: ${specifier}`);
    const resolved = path.resolve(path.dirname(filename), specifier);
    return loadModule(resolved.endsWith(".ts") ? resolved : `${resolved}.ts`);
  };
  const execute = new vm.Script(`(function(exports, require, module) {\n${outputText}\n})`, { filename });
  execute.runInThisContext()(module.exports, localRequire, module);
  return module.exports;
}
