import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const [, , memoryPath, evaluationPath, currentSkillPath] = process.argv;

if (!memoryPath || !evaluationPath || !currentSkillPath) {
  throw new Error('Usage: node scripts/update-mutation-memory.mjs <memory.json> <evaluation.json> <current-skill.md>');
}

const readJson = async (path) => {
  try {
    const source = await readFile(path, 'utf8');
    return { source, value: JSON.parse(source) };
  } catch (error) {
    throw new Error(`Cannot read valid JSON from ${path}: ${error.message}`);
  }
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;

const validateMutation = (mutation, label) => {
  assert(mutation && typeof mutation === 'object', `${label} must be an object`);
  assert(typeof mutation.id === 'string' && mutation.id.length > 0, `${label}.id must be a non-empty string`);
  assert(typeof mutation.summary === 'string' && mutation.summary.length > 0, `${label}.summary must be a non-empty string`);
  assert(Array.isArray(mutation.tags) && mutation.tags.length > 0 && mutation.tags.every((tag) => typeof tag === 'string' && tag.length > 0), `${label}.tags must be a non-empty array of strings`);
};

const memoryFile = await readJson(memoryPath);
const evaluationFile = await readJson(evaluationPath);
const memory = memoryFile.value;
const evaluation = evaluationFile.value;

assert(memory && typeof memory === 'object', 'Memory must be an object');
assert(memory.schemaVersion === 1, 'Memory schemaVersion must be 1');
assert(typeof memory.skillId === 'string' && memory.skillId.length > 0, 'Memory skillId must be a non-empty string');
assert(Array.isArray(memory.processedEvaluationIds) && memory.processedEvaluationIds.every((evaluationId) => typeof evaluationId === 'string' && evaluationId.length > 0), 'Memory processedEvaluationIds must be an array of non-empty strings');
assert(new Set(memory.processedEvaluationIds).size === memory.processedEvaluationIds.length, 'Memory processedEvaluationIds must be unique');
assert(Array.isArray(memory.mutations), 'Memory mutations must be an array');

const memoryMutationIds = new Set();
for (const [index, mutation] of memory.mutations.entries()) {
  validateMutation(mutation, `memory.mutations[${index}]`);
  assert(!memoryMutationIds.has(mutation.id), `Memory mutation id ${mutation.id} is duplicated`);
  assert(isNonNegativeInteger(mutation.wins), `memory.mutations[${index}].wins must be a non-negative integer`);
  assert(isNonNegativeInteger(mutation.losses), `memory.mutations[${index}].losses must be a non-negative integer`);
  assert(isNonNegativeInteger(mutation.evaluations), `memory.mutations[${index}].evaluations must be a non-negative integer`);
  assert(Number.isInteger(mutation.score), `memory.mutations[${index}].score must be an integer`);
  assert(mutation.evaluations === mutation.wins + mutation.losses, `memory.mutations[${index}].evaluations must equal wins plus losses`);
  memoryMutationIds.add(mutation.id);
}

assert(evaluation && typeof evaluation === 'object', 'Evaluation must be an object');
assert(typeof evaluation.evaluationId === 'string' && evaluation.evaluationId.length > 0, 'Evaluation evaluationId must be a non-empty string');
assert(!memory.processedEvaluationIds.includes(evaluation.evaluationId), `Evaluation ${evaluation.evaluationId} has already been processed`);
assert(typeof evaluation.skillId === 'string' && evaluation.skillId.length > 0, 'Evaluation skillId must be a non-empty string');
assert(evaluation.skillId === memory.skillId, 'Evaluation skillId must match memory skillId');
assert(typeof evaluation.baseSkillSha256 === 'string' && /^[a-f0-9]{64}$/.test(evaluation.baseSkillSha256), 'Evaluation baseSkillSha256 must be a lowercase SHA-256 digest');
assert(typeof evaluation.baseMemorySha256 === 'string' && /^[a-f0-9]{64}$/.test(evaluation.baseMemorySha256), 'Evaluation baseMemorySha256 must be a lowercase SHA-256 digest');
assert(Array.isArray(evaluation.candidates) && evaluation.candidates.length === 3, 'Evaluation must contain exactly three candidates');
assert(evaluation.winnerId === null || typeof evaluation.winnerId === 'string', 'Evaluation winnerId must be a candidate id or null');

const currentSkillSha256 = createHash('sha256').update(await readFile(currentSkillPath)).digest('hex');
assert(currentSkillSha256 === evaluation.baseSkillSha256, 'Evaluation was generated from a different current skill');
const currentMemorySha256 = createHash('sha256').update(memoryFile.source).digest('hex');
assert(currentMemorySha256 === evaluation.baseMemorySha256, 'Evaluation was generated from different mutation memory');

const ids = new Set();
for (const [index, candidate] of evaluation.candidates.entries()) {
  validateMutation(candidate, `evaluation.candidates[${index}]`);
  assert(!ids.has(candidate.id), `Candidate id ${candidate.id} is duplicated`);
  assert(typeof candidate.candidateSkill === 'string' && candidate.candidateSkill.length > 0, `${candidate.id}.candidateSkill must be a non-empty string`);
  assert(typeof candidate.response === 'string', `${candidate.id}.response must be a string`);
  ids.add(candidate.id);
}

assert(evaluation.winnerId === null || ids.has(evaluation.winnerId), 'Evaluation winnerId must identify a supplied candidate');

assert(Array.isArray(evaluation.outcomes) && evaluation.outcomes.length === evaluation.candidates.length, 'Evaluation must contain one outcome per candidate');
const outcomesByCandidateId = new Map();
for (const [index, outcome] of evaluation.outcomes.entries()) {
  assert(outcome && typeof outcome === 'object', `evaluation.outcomes[${index}] must be an object`);
  assert(typeof outcome.candidateId === 'string' && ids.has(outcome.candidateId), `evaluation.outcomes[${index}].candidateId must identify a supplied candidate`);
  assert(typeof outcome.improved === 'boolean', `evaluation.outcomes[${index}].improved must be a boolean`);
  assert(!outcomesByCandidateId.has(outcome.candidateId), `Outcome for ${outcome.candidateId} is duplicated`);
  outcomesByCandidateId.set(outcome.candidateId, outcome);
}

assert(outcomesByCandidateId.size === evaluation.candidates.length, 'Evaluation outcomes must cover every candidate exactly once');

const mutationsById = new Map(memory.mutations.map((mutation) => [mutation.id, {
  ...mutation,
  score: mutation.wins - mutation.losses
}]));
for (const candidate of evaluation.candidates) {
  const mutation = mutationsById.get(candidate.id) ?? {
    id: candidate.id,
    summary: candidate.summary,
    tags: [...candidate.tags],
    wins: 0,
    losses: 0,
    evaluations: 0
  };

  if (outcomesByCandidateId.get(candidate.id).improved) {
    mutation.wins += 1;
  } else {
    mutation.losses += 1;
  }

  mutation.evaluations = mutation.wins + mutation.losses;
  mutation.score = mutation.wins - mutation.losses;
  mutationsById.set(candidate.id, mutation);
}

const winningMutation = evaluation.winnerId ? mutationsById.get(evaluation.winnerId) : null;
const winnerImproved = Boolean(winningMutation && outcomesByCandidateId.get(winningMutation.id).improved);
const promoted = Boolean(winningMutation && winnerImproved && winningMutation.score > 0);
const reason = !winningMutation
  ? 'Evaluator selected no winner.'
  : !winnerImproved
    ? 'The evaluator winner did not improve on the baseline in this evaluation.'
  : promoted
    ? 'The evaluator winner has a positive skill-local score after this update.'
    : 'The evaluator winner does not have a positive skill-local score after this update.';

console.log(JSON.stringify({
  updatedMemory: {
    schemaVersion: memory.schemaVersion,
    skillId: memory.skillId,
    processedEvaluationIds: [...memory.processedEvaluationIds, evaluation.evaluationId],
    mutations: [...mutationsById.values()]
  },
  promotion: {
    action: promoted ? 'promote' : 'no-promotion',
    mutationId: promoted ? winningMutation.id : null,
    reason
  }
}, null, 2));