// This type represents a value in satoshis
export class Value {
    private readonly value: bigint;

    private constructor(value: bigint) {
        this.value = value;
    }

    add(other: Value): Value {
        return new Value(this.value + other.value);
    }

    subtract(other: Value): Value {
        return new Value(this.value - other.value);
    }

    isGreaterThan(other: Value): boolean {
        return this.value > other.value;
    }

    isLessThan(other: Value): boolean {
        return this.value < other.value;
    }

    isEqualTo(other: Value): boolean {
        return this.value === other.value;
    }

    toBigInt(): bigint {
        return this.value;
    }

    // TODO: Better implement infinity.
    static get infinity(): Value {
        return new Value(2n ** 64n + 1n);
    }

    static get zero(): Value {
        return new Value(0n);
    }

    static fromNumber(value: number): Value {
        return new Value(BigInt(value));
    }

    static fromBigInt(value: bigint): Value {
        return new Value(value);
    }
}
