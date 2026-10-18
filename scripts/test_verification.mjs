/**
 * scratch/test_verification.mjs
 * 
 * Programmatic verification script for Part 1: Dashboard 1
 * IIIT Pune Campus Bus Booking & Deterministic Allocation Engine
 * Verification for:
 * 1. 52-Seater (3 Emergency Held-Back Quota, 49 General Seats) & 32-Seater (2 Quota, 30 General Seats)
 * 2. Infeasible Requests (Direction Mismatch without NaN or empty tags)
 * 3. Elimination of legacy point scores (+50 pts) & 5-Rule Deterministic Decision Trace
 * 4. Emergency Priority Override (Medical / Accessibility allocations from Emergency Reserve Quota)
 */

import { 
  ROUTE_INFO, 
  STOPS, 
  FLEET, 
  TIMETABLE, 
  TRIP_REASONS, 
  HOSTELS, 
  getAvailableBranches, 
  DEMO_STUDENTS 
} from '../src/data/iiitBusData.js';

import { 
  evaluateIIITCampusAllocation, 
  solveTripContention, 
  generateRealisticCampusRequests, 
  getTripCapacity, 
  checkTimetableClash, 
  computeDeterministicPriorityScore, 
  computeExplanationAndCounterfactual 
} from '../src/utils/allocationEngine.js';

console.log('================================================================');
console.log('  DASHBOARD 1: IIIT PUNE CAMPUS BUS ALLOCATION ENGINE VERIFICATION');
console.log('================================================================\n');

let allPassed = true;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    allPassed = false;
  }
}

// -------------------------------------------------------------
// Criterion 1: Dependent Branch Validation Logic & Student Profiles
// -------------------------------------------------------------
console.log('\n--- 1. Testing Dependent Branch Validation Logic ---');

const btech2026Branches = getAvailableBranches('B.Tech', '2026-2030');
assert(
  btech2026Branches.includes('AIDS') && 
  btech2026Branches.includes('Cybersecurity') && 
  btech2026Branches.includes('VLSI') &&
  btech2026Branches.includes('CSE') &&
  btech2026Branches.includes('ECE'),
  `B.Tech 2026-2030 unlocks 5 branches (CSE, ECE, VLSI, Cybersecurity, AIDS): [${btech2026Branches.join(', ')}]`
);

const btechOtherBranches = getAvailableBranches('B.Tech', '2024-2028');
assert(
  btechOtherBranches.length === 2 && 
  btechOtherBranches.includes('CSE') && 
  btechOtherBranches.includes('ECE') && 
  !btechOtherBranches.includes('AIDS'),
  `B.Tech other batches restricted to CSE and ECE: [${btechOtherBranches.join(', ')}]`
);

// -------------------------------------------------------------
// Criterion 2: Emergency Held-Back Quota (3 in 52-Seater, 2 in 32-Seater)
// -------------------------------------------------------------
console.log('\n--- 2. Testing Emergency Held-Back Seat Quotas ---');

// 52-Seater (Bus 1 & 2, e.g. T7)
const tripT7 = TIMETABLE.find(t => t.tripId === 'T7');
const capT7 = getTripCapacity(tripT7);

assert(
  capT7.totalCapacity === 60 &&
  capT7.totalAvailable === 57 && 
  capT7.availableSeated === 49 && 
  capT7.availableStanding === 8 && 
  capT7.heldBackSeats === 3 &&
  capT7.emergencySeats.length === 3 &&
  capT7.emergencySeats.includes('1A') &&
  capT7.emergencySeats.includes('1B') &&
  capT7.emergencySeats.includes('2A'),
  `52-Seater Bus (T7): 60 Total, 3 Held-Back ('1A', '1B', '2A'), 49 General Seats, 8 Standing = 57 Available Places`
);

// 32-Seater (Bus 3, e.g. T8)
const tripT8 = TIMETABLE.find(t => t.tripId === 'T8');
const capT8 = getTripCapacity(tripT8);

assert(
  capT8.totalCapacity === 37 &&
  capT8.totalAvailable === 35 && 
  capT8.availableSeated === 30 && 
  capT8.availableStanding === 5 && 
  capT8.heldBackSeats === 2 &&
  capT8.emergencySeats.length === 2 &&
  capT8.emergencySeats.includes('1A') &&
  capT8.emergencySeats.includes('1B'),
  `32-Seater Bus (T8): 37 Total, 2 Held-Back ('1A', '1B'), 30 General Seats, 5 Standing = 35 Available Places`
);

// -------------------------------------------------------------
// Criterion 3: Contention Solver with General Capacity & Standing Limits
// -------------------------------------------------------------
console.log('\n--- 3. Testing Contention Solver with 66 Requests on 52-Seater ---');

const requests66 = generateRealisticCampusRequests('T7');
assert(requests66.length === 66, `Generated realistic competing pool: ${requests66.length} requests`);

const contentionSolution = solveTripContention({
  tripId: 'T7',
  requests: requests66,
  assignedBusId: tripT7.assignedBus
});

assert(
  contentionSolution.allocatedCount === 57,
  `Exactly 57 general requests allocated on T7 (Actual: ${contentionSolution.allocatedCount})`
);
assert(
  contentionSolution.waitlistedCount === 9,
  `Exactly 9 requests waitlisted out of 66 (Actual: ${contentionSolution.waitlistedCount})`
);

const seatedAllocated = contentionSolution.allocated.filter(a => a.allocationType === 'SEATED');
const standingAllocated = contentionSolution.allocated.filter(a => a.allocationType === 'STANDING');

assert(
  seatedAllocated.length === 49,
  `Exactly 49 seated allocations filled for general requests (Actual: ${seatedAllocated.length})`
);
assert(
  standingAllocated.length === 8,
  `Exactly 8 standing allocations filled (Actual: ${standingAllocated.length})`
);

// -------------------------------------------------------------
// Criterion 4: Emergency Priority Override (Medical / Accessibility Need)
// -------------------------------------------------------------
console.log('\n--- 4. Testing Emergency Priority Override for Medical Commuter ---');

// Create 49 priority requests that completely fill all 49 general seats
const fillingRequests = Array.from({ length: 49 }, (_, i) => ({
  misNumber: `112603${100 + i}`,
  fullName: `Higher Priority Commuter ${i + 1}`,
  hostel: 'GODAVARI',
  course: 'B.Tech',
  batch: '2026-2030',
  branch: 'CSE',
  tripReason: 'MEDICAL',
  canTravelStanding: false,
  declaredAccessibilityNeed: true, // Priority ensures these 49 take all 49 general seats
  rejectedRequestsLast14Days: 2,
  confirmedBookingsThisWeek: 0,
  requestedTimestamp: `08:00:${String(i).padStart(2, '0')}`
}));

// Medical commuter arrives after all 49 general seats are taken
const medicalCommuter = {
  misNumber: '112603888',
  fullName: 'Urgent Medical Patient',
  hostel: 'GODAVARI',
  course: 'B.Tech',
  batch: '2026-2030',
  branch: 'ECE',
  tripReason: 'MEDICAL',
  canTravelStanding: false,
  declaredAccessibilityNeed: false,
  rejectedRequestsLast14Days: 0,
  confirmedBookingsThisWeek: 0,
  requestedTimestamp: '08:59:00',
  ignoreCutoff: true
};

const contentionWithMedical = solveTripContention({
  tripId: 'T7',
  requests: [...fillingRequests, medicalCommuter],
  assignedBusId: tripT7.assignedBus
});

const medicalAllocation = contentionWithMedical.allocated.find(a => a.misNumber === '112603888');

assert(
  medicalAllocation !== undefined,
  `Emergency Quota Override: Medical commuter allocated despite all 49 general seats being fully exhausted`
);

assert(
  medicalAllocation?.isEmergencyQuota === true,
  `Medical commuter flagged with isEmergencyQuota: true`
);

assert(
  medicalAllocation?.allocatedSpot.includes('1A') || medicalAllocation?.allocatedSpot.includes('Emergency Quota'),
  `Medical commuter assigned to held emergency seat (${medicalAllocation?.allocatedSpot})`
);

// Now evaluate via evaluateIIITCampusAllocation for upcoming date
const evalMedicalOverride = evaluateIIITCampusAllocation({
  student: medicalCommuter,
  tripId: 'T7',
  tripReason: 'MEDICAL',
  requestedStop: 'stop-5',
  journeyDate: '2026-10-19',
  existingCompetingRequests: fillingRequests
});

assert(
  evalMedicalOverride.status === 'ALLOCATED' && evalMedicalOverride.isEmergencyQuota === true,
  `evaluateIIITCampusAllocation handles emergency override: status=${evalMedicalOverride.status}, isEmergencyQuota=${evalMedicalOverride.isEmergencyQuota}`
);

assert(
  evalMedicalOverride.explanation.level2Reason.includes('Emergency Reserve Quota'),
  `Level 2 Plain-Language Reason states: "${evalMedicalOverride.explanation.level2Reason}"`
);

// -------------------------------------------------------------
// Criterion 5: Infeasible Request (Direction Mismatch) - Zero NaN, Clean Message
// -------------------------------------------------------------
console.log('\n--- 5. Testing Infeasible Request (Direction Mismatch) ---');

// Trip T1 is OUTBOUND (from Campus to Talegaon)
// Requesting Boarding at Stop 1 and Dropping at Stop 1 (Campus)
const evalDirectionMismatch = evaluateIIITCampusAllocation({
  student: DEMO_STUDENTS[0],
  tripId: 'T1',
  requestedStop: 'stop-1', // main gate on outbound trip
  tripReason: 'SHOPPING',
  journeyDate: '2026-10-19'
});

assert(
  evalDirectionMismatch.isFeasible === false,
  `Direction mismatch flagged isFeasible === false`
);

assert(
  evalDirectionMismatch.status === 'DIRECTION_MISMATCH',
  `Status code is 'DIRECTION_MISMATCH'`
);

assert(
  evalDirectionMismatch.explanation.level1Headline === 'Constraint Failed: Trip Direction Mismatch',
  `Level 1 Headline matches spec: "${evalDirectionMismatch.explanation.level1Headline}"`
);

assert(
  evalDirectionMismatch.explanation.level2Reason.includes('outbound path') || 
  evalDirectionMismatch.explanation.level2Reason.includes('Godavari Hostel/Talegaon'),
  `Level 2 Reason provides clean guidance: "${evalDirectionMismatch.explanation.level2Reason}"`
);

assert(
  !isNaN(evalDirectionMismatch.capacitySummary.totalAvailable) && 
  evalDirectionMismatch.capacitySummary.totalAvailable > 0,
  `No NaN in capacitySummary: totalAvailable = ${evalDirectionMismatch.capacitySummary.totalAvailable}`
);

assert(
  !isNaN(evalDirectionMismatch.competingStats.totalRequests),
  `No NaN in competingStats: totalRequests = ${evalDirectionMismatch.competingStats.totalRequests}`
);

// -------------------------------------------------------------
// Criterion 6: Elimination of Legacy Point Scores & 5-Rule Policy Trace
// -------------------------------------------------------------
console.log('\n--- 6. Testing Elimination of Point Scores & 5-Rule Decision Trace ---');

const evalTrace = evaluateIIITCampusAllocation({
  student: DEMO_STUDENTS[1], // Sneha Kulkarni
  tripId: 'T7',
  tripReason: 'SHOPPING',
  acceptableWindow: 30,
  journeyDate: '2026-10-19'
});

const counterfactualText = evalTrace.explanation.level3Audit.exactCounterfactual;
assert(
  !counterfactualText.includes('+50 pts') &&
  !counterfactualText.includes('+15 pts') &&
  !counterfactualText.includes('-20 pts') &&
  !counterfactualText.includes('0 pts') &&
  !counterfactualText.includes('pts'),
  `Legacy point score strings completely eliminated from counterfactual: "${counterfactualText}"`
);

const trace = evalTrace.explanation.level3Audit.policyDecisionTrace;
assert(
  trace &&
  trace.rule1 &&
  trace.rule2 &&
  trace.rule3 &&
  trace.rule4 &&
  trace.rule5,
  `5-Rule Policy Decision Trace fully populated with Rules 1-5:`
);
console.log(`    • ${trace.rule1}`);
console.log(`    • ${trace.rule2}`);
console.log(`    • ${trace.rule3}`);
console.log(`    • ${trace.rule4}`);
console.log(`    • ${trace.rule5}`);

// -------------------------------------------------------------
// Overall Result
// -------------------------------------------------------------
console.log('\n================================================================');
if (allPassed) {
  console.log('  ALL SPECIFICATION & OPERATIONAL CRITERIA VERIFIED & PASSED (100%)');
} else {
  console.log('  SOME TESTS FAILED - REVIEW ABOVE LOGS');
}
console.log('================================================================\n');

if (!allPassed) {
  process.exit(1);
}
