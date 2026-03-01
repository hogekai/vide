import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ImaConditional, ImaHook, ImaWrapping } from "./ImaApp";

type Page = "vast" | "ima-wrap" | "ima-ref" | "ima-hook";

function Root() {
	const [page, setPage] = useState<Page>("ima-wrap");

	return (
		<div
			style={{
				fontFamily: "system-ui, sans-serif",
				maxWidth: 800,
				margin: "2rem auto",
				padding: "0 1rem",
			}}
		>
			<h1>vide — React</h1>
			<nav style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
				{(
					[
						["vast", "VAST + HLS"],
						["ima-wrap", "IMA (wrap)"],
						["ima-ref", "IMA (ref)"],
						["ima-hook", "IMA (hook)"],
					] as const
				).map(([id, label]) => (
					<button
						key={id}
						type="button"
						onClick={() => setPage(id)}
						style={{ fontWeight: page === id ? "bold" : "normal" }}
					>
						{label}
					</button>
				))}
			</nav>

			{page === "vast" && <App />}
			{page === "ima-wrap" && <ImaWrapping key="ima-wrap" />}
			{page === "ima-ref" && <ImaConditional key="ima-ref" />}
			{page === "ima-hook" && <ImaHook key="ima-hook" />}
		</div>
	);
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Root />
	</StrictMode>,
);
