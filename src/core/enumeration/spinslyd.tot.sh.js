/**
 * name: SpinSlyd
 * alias: totsh
 * timestamp: (bash://date) .. Mon Sep 24 22:38:34 AEST 2018 // the pipe bash://date provided this read only value
 */

// origin: https://gist.github.com/rkrupinski/30e5b98258918bf82d026a75bd1c66cb

function* slyd(fn) {
    const l = fn.length;
    const args = [];

    while (true) {
        if (args.length < l) {
            const batch = [...yield];
            args.push(...batch);
        } else {
            return fn(...args);
        }
    }
}

function spinslyd(fn) {
    const gen = slyd(fn);

    gen.next();

    return function turn(...args) {
        const { done, value } = gen.next(args); // two way communication with the generator (::)

        return done ? value : turn;
    };
}

console.log(spinslyd((a, b, c) => a + b + c)()(1,2)(3)); // 6

/**
 * spin-slyd
 * turn until satisfied
 * flexicurry
 */