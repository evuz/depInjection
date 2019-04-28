import { Injectify } from '../injectify';

describe('Injectify', () => {
    test('should create a Injectify instance', () => {
        const injectify = new Injectify();
        expect(injectify).toBeTruthy();
        expect(injectify instanceof Injectify).toBeTruthy();
    })
});