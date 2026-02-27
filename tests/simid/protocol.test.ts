import { describe, expect, it } from "vitest";
import {
	buildMessage,
	buildReject,
	buildResolve,
	isCreateSession,
	isReject,
	isResolve,
	parseMessage,
} from "../../src/simid/protocol.js";

describe("buildMessage", () => {
	it("produces correct structure", () => {
		const msg = buildMessage("sess-1", 0, "SIMID:Player:init", {
			foo: "bar",
		});
		expect(msg.sessionId).toBe("sess-1");
		expect(msg.messageId).toBe(0);
		expect(msg.type).toBe("SIMID:Player:init");
		expect(msg.args).toEqual({ foo: "bar" });
		expect(typeof msg.timestamp).toBe("number");
	});

	it("omits args when undefined", () => {
		const msg = buildMessage("sess-1", 1, "SIMID:Media:play");
		expect(msg.args).toBeUndefined();
	});
});

describe("buildResolve", () => {
	it("produces resolve message with inReplyTo", () => {
		const msg = buildResolve("sess-1", 5, 3, { id: 42 });
		expect(msg.type).toBe("resolve");
		expect(msg.args).toEqual({ messageId: 3, value: { id: 42 } });
	});

	it("omits value when not provided", () => {
		const msg = buildResolve("sess-1", 5, 3);
		expect(msg.args).toEqual({ messageId: 3 });
	});
});

describe("buildReject", () => {
	it("produces reject message with error code", () => {
		const msg = buildReject("sess-1", 6, 4, 1203, "Not supported");
		expect(msg.type).toBe("reject");
		expect(msg.args).toEqual({
			messageId: 4,
			value: { errorCode: 1203, message: "Not supported" },
		});
	});

	it("omits error message when not provided", () => {
		const msg = buildReject("sess-1", 6, 4, 1200);
		expect(msg.args).toEqual({
			messageId: 4,
			value: { errorCode: 1200 },
		});
	});
});

describe("parseMessage", () => {
	it("parses valid message", () => {
		const data = {
			sessionId: "abc",
			messageId: 0,
			timestamp: 1234567890,
			type: "createSession",
			args: {},
		};
		const msg = parseMessage(data);
		expect(msg).not.toBeNull();
		expect(msg?.sessionId).toBe("abc");
		expect(msg?.type).toBe("createSession");
	});

	it("returns null for non-object", () => {
		expect(parseMessage(null)).toBeNull();
		expect(parseMessage(undefined)).toBeNull();
		expect(parseMessage("string")).toBeNull();
		expect(parseMessage(42)).toBeNull();
	});

	it("returns null when sessionId is missing", () => {
		expect(
			parseMessage({ messageId: 0, timestamp: 0, type: "test" }),
		).toBeNull();
	});

	it("returns null when messageId is not a number", () => {
		expect(
			parseMessage({
				sessionId: "a",
				messageId: "0",
				timestamp: 0,
				type: "test",
			}),
		).toBeNull();
	});

	it("returns null when timestamp is missing", () => {
		expect(
			parseMessage({ sessionId: "a", messageId: 0, type: "test" }),
		).toBeNull();
	});

	it("returns null when type is missing", () => {
		expect(
			parseMessage({ sessionId: "a", messageId: 0, timestamp: 0 }),
		).toBeNull();
	});
});

describe("type guards", () => {
	it("isCreateSession", () => {
		expect(isCreateSession(buildMessage("s", 0, "createSession"))).toBe(true);
		expect(isCreateSession(buildMessage("s", 0, "SIMID:Player:init"))).toBe(
			false,
		);
	});

	it("isResolve", () => {
		expect(isResolve(buildResolve("s", 0, 0))).toBe(true);
		expect(isResolve(buildMessage("s", 0, "reject"))).toBe(false);
	});

	it("isReject", () => {
		expect(isReject(buildReject("s", 0, 0, 1200))).toBe(true);
		expect(isReject(buildMessage("s", 0, "resolve"))).toBe(false);
	});
});
