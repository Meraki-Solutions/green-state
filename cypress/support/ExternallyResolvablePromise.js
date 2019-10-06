export class ExternallyResolvablePromise {

	constructor() {

		let resolve;
		const promise = new Promise(_resolve => {
			resolve = _resolve;
		});

		this.then = (cb) => promise.then(cb);
		this.catch = (cb) => promise.catch(cb);
		this.resolve = value => resolve(value);

	}

}

