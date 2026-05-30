// ═══ Safe localStorage Wrapper ═══
function SG(k) {
  try { return localStorage.getItem(k); }
  catch (e) { return null; }
}

function SS(k, v) {
  try { localStorage.setItem(k, v); }
  catch (e) {}
}
