import type WampSocket from '.'

export function CheckIfInitialized(
    target: Object,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<any>
) {
    const originalMethod = descriptor.value

    descriptor.value = function (this: WampSocket, ...args: any[]) {
        if (!this.isInitialized || this.socket?.readyState !== WebSocket.OPEN) {
            throw new Error('Socket is not initialized or not open.')
        }

        return originalMethod.apply(this, args)
    }
}
