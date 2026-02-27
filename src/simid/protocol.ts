import type { RejectArgs, ResolveArgs, SimidMessage } from "./types.js";

/** SIMID version this implementation supports. */
export const SIMID_VERSION = "1.2";

/** Generate a cryptographically secure session ID (spec §8.4). */
export function createSessionId(): string {
	return crypto.randomUUID();
}

/** Build a SIMID message (spec §8.1.1). */
export function buildMessage(
	sessionId: string,
	messageId: number,
	type: string,
	args?: unknown,
): SimidMessage {
	return {
		sessionId,
		messageId,
		timestamp: Date.now(),
		type,
		args,
	};
}

/** Build a resolve response (spec §8.2.1). */
export function buildResolve(
	sessionId: string,
	messageId: number,
	inReplyTo: number,
	value?: unknown,
): SimidMessage {
	const args: ResolveArgs = { messageId: inReplyTo };
	if (value !== undefined) {
		args.value = value;
	}
	return buildMessage(sessionId, messageId, "resolve", args);
}

/** Build a reject response (spec §8.2.2). */
export function buildReject(
	sessionId: string,
	messageId: number,
	inReplyTo: number,
	errorCode: number,
	errorMessage?: string,
): SimidMessage {
	const value: { errorCode: number; message?: string } = { errorCode };
	if (errorMessage !== undefined) {
		value.message = errorMessage;
	}
	const args: RejectArgs = { messageId: inReplyTo, value };
	return buildMessage(sessionId, messageId, "reject", args);
}

/**
 * Parse and validate an incoming message.
 * Returns null for malformed data — never throws.
 */
export function parseMessage(data: unknown): SimidMessage | null {
	if (typeof data !== "object" || data === null) return null;

	const obj = data as Record<string, unknown>;

	if (typeof obj.sessionId !== "string") return null;
	if (typeof obj.messageId !== "number") return null;
	if (typeof obj.timestamp !== "number") return null;
	if (typeof obj.type !== "string") return null;

	return {
		sessionId: obj.sessionId,
		messageId: obj.messageId,
		timestamp: obj.timestamp,
		type: obj.type,
		args: obj.args,
	};
}

export function isCreateSession(msg: SimidMessage): boolean {
	return msg.type === "createSession";
}

export function isResolve(msg: SimidMessage): boolean {
	return msg.type === "resolve";
}

export function isReject(msg: SimidMessage): boolean {
	return msg.type === "reject";
}
