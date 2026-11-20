
import { test } from "node:test";
import assert from "node:assert/strict";

import { calculateScore } from "./scoringService.js";

// Test 1: Full-score student gets 90.
test("Full-score student gets 90 points", () => {
    const result = calculateScore({
        verifiedCgpa: 10,
        semester: 8,
        distanceKm: 250,
        previousHostel: true,
    });

    assert.equal(result.total, 90);

    assert.deepEqual(result.breakdown, {
        cgpa: 40,
        semester: 25,
        distance: 15,
        previousHostel: 10,
    });
});

// Test 2: Zero-distance student gets zero distance points.
test("Zero-distance student gets zero distance points", () => {
    const result = calculateScore({
        verifiedCgpa: 8,
        semester: 4,
        distanceKm: 0,
        previousHostel: false,
    });

    assert.equal(result.breakdown.distance, 0);
});

// Test 3: Null CGPA throws an error.
test("Null CGPA throws an error", () => {
    assert.throws(
        () =>
            calculateScore({
                verifiedCgpa: null,
                semester: 4,
                distanceKm: 100,
                previousHostel: false,
            })
    );
});

// Test 4: Previous-hostel student gets exactly 10 points.
test("Previous-hostel student gets 10 points", () => {
    const result = calculateScore({
        verifiedCgpa: 7,
        semester: 3,
        distanceKm: 20,
        previousHostel: true,
    });

    assert.equal(result.breakdown.previousHostel, 10);
});

// Test 5: Semester scoring follows the linear formula.
test("Semester 8 gets 25 points and semester 4 gets 12.5 points", () => {
    const semester8 = calculateScore({
        verifiedCgpa: 10,
        semester: 8,
        distanceKm: 0,
        previousHostel: false,
    });

    const semester4 = calculateScore({
        verifiedCgpa: 10,
        semester: 4,
        distanceKm: 0,
        previousHostel: false,
    });

    assert.equal(semester8.breakdown.semester, 25);
    assert.equal(semester4.breakdown.semester, 12.5);
});
