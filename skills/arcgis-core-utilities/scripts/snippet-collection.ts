// snippet-collection.ts — the SDK's observable Collection type. Smoke-tested.
import Collection from "@arcgis/core/core/Collection.js";

const numbers = new Collection<number>([1, 2, 3]);
numbers.add(4);
numbers.addMany([5, 6]);

const evens = numbers.filter((n) => n % 2 === 0);
console.log(evens.toArray());

export { numbers, evens };
