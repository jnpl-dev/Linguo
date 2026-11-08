import { a as J, l as Y } from "./p-Ct2aBEue-sxnhhSjR.js";
import { d as n$1 } from "./p-CUQjkOdi-BI1Rzy4w.js";
import { c as l, n as c } from "./p-D5_mEbGJ-G80IQrlu.js";
//#region node_modules/@ionic/core/components/p-BBsseItU.js
/*!
* (C) Ionic http://ionicframework.com - MIT License
*/
var n = () => {
	const n = window;
	n.addEventListener("statusTap", (() => {
		J((() => {
			const o = document.elementFromPoint(n.innerWidth / 2, n.innerHeight / 2);
			if (!o) return;
			const e = l(o);
			e && new Promise(((o) => n$1(e, o))).then((() => {
				Y((async () => {
					e.style.setProperty("--overflow", "hidden"), await c(e, 300), e.style.removeProperty("--overflow");
				}));
			}));
		}));
	}));
};
//#endregion
export { n as startStatusTap };
