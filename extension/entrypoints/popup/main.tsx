import ReactDOM from "react-dom/client";

import { PopupApp } from "./PopupApp";
import "./popup.css";

const container = document.getElementById("root");
if (container) {
	ReactDOM.createRoot(container).render(<PopupApp />);
}
