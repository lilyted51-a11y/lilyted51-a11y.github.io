/* node tools/zh_try.js "frase 1" "frase 2" ...  — cómo las pinta el parche de chino (copia local) */
const fs = require('fs'), path = require('path'), vm = require('vm');
const out = [];
class Ctx { constructor() { this.font = '16px Pixelify'; } fillText(s) { out.push(String(s)); } strokeText() {} measureText(s) { return { width: String(s).length * 8 }; } }
const el = () => ({ setAttribute() {}, appendChild() {}, append() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {}, toggle() {} }, querySelector: () => null, querySelectorAll: () => [], closest: () => null });
const document = { createElement: el, head: el(), body: el(), documentElement: el(), addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, createTreeWalker: () => ({ nextNode: () => null }), readyState: 'complete' };
const win = { CanvasRenderingContext2D: Ctx, addEventListener() {}, location: { hostname: 'localhost', pathname: '/', href: 'http://localhost/' }, document, alert() {}, confirm() {}, navigator: { language: 'zh-TW' }, setTimeout, clearTimeout, requestAnimationFrame: () => 0 };
win.parent = win; win.window = win;
vm.createContext(Object.assign(win, { MutationObserver: class { observe() {} }, Node: { TEXT_NODE: 3, ELEMENT_NODE: 1 }, NodeFilter: {}, console }));
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'zh-tw.js'), 'utf8'), win);
const ctx = new Ctx();
for (const s of process.argv.slice(2)) { out.length = 0; ctx.fillText(s); console.log(s + '\n   → ' + out[0]); }
