export class CaptchaDetectedError extends Error {
	constructor(message = "CAPTCHA detected") {
		super(message)
		this.name = "CaptchaDetectedError"
	}
}

export class BotBlockedError extends Error {
	constructor(message = "Bot detection block encountered") {
		super(message)
		this.name = "BotBlockedError"
	}
}
