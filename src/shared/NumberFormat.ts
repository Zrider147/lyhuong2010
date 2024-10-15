type NumberFormat = {
    /** Formatted number with no decimals */
    number0: (value: number) => string,
    /** Formatted number with (forced) decimals */
    number: (value: number, forced?: boolean) => string,
    /** Formatted number currency with no decimals */
    currency0: (value: number) => string,
    /** Formatted number currency with (forced) decimals */
    currency: (value: number, forced?: boolean) => string
};

export let fmt = undefined as unknown as NumberFormat;

export function setNumberFormat(currency: string) {
    const selection: Record<string, NumberFormat> = {
        EUR: EURFormat,
        USD: USDFormat,
        MAD: MADFormat,
        TRY: TRYFormat
    };
    fmt = selection[currency];
}


const EURFormat: NumberFormat = {
    number0: function(value: number) {
        value = Math.floor(value / 100);
        if (value < 1000)
            return `${value}`;
        else {
            let units = value % 1000;
            value = Math.floor(value / 1000);
            if (value < 1000)
                return `${value}.${units.pad0(3)}`;
            else {
                let thousands = value % 1000;
                return `${value}.${thousands.pad0(3)}.${units.pad0(3)}`;
            }
        }
    },

    number: function(value: number, forced=true) {
        let decimal = value % 100;
        let s = this.number0(value);
        if (forced || decimal > 0)
            return `${s},${decimal.pad0(2)}`;
        else return s;
    },

    currency0: function(value: number) {
        return `€${this.number0(value)}`;
    },
    currency: function(value: number, forced=true) {
        return `€${this.number(value, forced)}`;
    }
}

const USDFormat: NumberFormat = {
    number0: function(value: number) {
        value = Math.floor(value / 100);
        if (value < 1000)
            return `${value}`;
        else {
            let units = value % 1000;
            value = Math.floor(value / 1000);
            if (value < 1000)
                return `${value},${units.pad0(3)}`;
            else {
                let thousands = value % 1000;
                return `${value},${thousands.pad0(3)},${units.pad0(3)}`;
            }
        }
    },

    number: function(value: number, forced=true) {
        let decimal = value % 100;
        let s = this.number0(value);
        if (forced || decimal > 0)
            return `${s}.${decimal.pad0(2)}`;
        else return s;
    },

    currency0: function(value: number) {
        return `$${this.number0(value)}`;
    },
    currency: function(value: number, forced=true) {
        return `$${this.number(value, forced)}`;
    }
}

const MADFormat: NumberFormat = {
    number0: function(value: number) {
        value = Math.floor(value / 100);
        if (value < 1000)
            return `${value}`;
        else {
            let units = value % 1000;
            value = Math.floor(value / 1000);
            if (value < 1000)
                return `${value},${units.pad0(3)}`;
            else {
                let thousands = value % 1000;
                return `${value},${thousands.pad0(3)},${units.pad0(3)}`;
            }
        }
    },

    number: function(value: number, forced=true) {
        let decimal = value % 100;
        let s = this.number0(value);
        if (forced || decimal > 0)
            return `${s}.${decimal.pad0(2)}`;
        else return s;
    },

    currency0: function(value: number) {
        return `DH ${this.number0(value)}`;
    },
    currency: function(value: number, forced=true) {
        return `DH ${this.number(value, forced)}`;
    }
}

const TRYFormat: NumberFormat = {
    number0: function(value: number) {
        value = Math.floor(value / 100);
        if (value < 1000)
            return `${value}`;
        else {
            let units = value % 1000;
            value = Math.floor(value / 1000);
            if (value < 1000)
                return `${value}.${units.pad0(3)}`;
            else {
                let thousands = value % 1000;
                return `${value}.${thousands.pad0(3)}.${units.pad0(3)}`;
            }
        }
    },

    number: function(value: number) {
        return this.number0(value);
    },

    currency0: function(value: number) {
        return `₺${this.number0(value)}`;
    },
    currency: function(value: number) {
        return `₺${this.number(value)}`;
    }
}
