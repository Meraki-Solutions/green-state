export class DeferredValue {
  constructor() {
    this.set = value => this.value = value;
    this.valueOf = () => {
      // Force cypress to retry by throwing
      if (this.value === undefined || this.value === null) {
        throw new Error('No value!');
      }

      return this.value;
    }
  }
}

