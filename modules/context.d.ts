interface MessageEvent {
	type: "message";
	text: string;
	user: string;
	channel: string;
    event_ts: string;
}

declare const event: MessageEvent;

declare namespace interactions {
	export function log(message: string): void;
	export function sendMessage(channel: string, text: string): void;
	export function addReaction(channel: string, name: string, timestamp: string): void;
}