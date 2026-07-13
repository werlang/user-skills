import { readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [, , targetSkillPath, memoryPath, evaluationPath] = process.argv;

if (!targetSkillPath || !memoryPath || !evaluationPath) {
  throw new Error('Usage: node scripts/apply-optimization-result.mjs <target-skill.md> <memory.json> <evaluation.json>');
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const updateScriptPath = join(scriptDirectory, 'update-mutation-memory.mjs');
const update = spawnSync(process.execPath, [updateScriptPath, memoryPath, evaluationPath, targetSkillPath], {
  encoding: 'utf8'
});

if (update.status !== 0) {
  throw new Error(update.stderr || update.stdout || 'Unable to update mutation memory');
}

const result = JSON.parse(update.stdout);
const evaluation = JSON.parse(await readFile(evaluationPath, 'utf8'));
const winner = result.promotion.mutationId
  ? evaluation.candidates.find((candidate) => candidate.id === result.promotion.mutationId)
  : null;

if (result.promotion.action === 'promote' && !winner) {
  throw new Error('Promotion result does not identify a candidate skill');
}

const [currentSkill, currentMemory] = await Promise.all([readFile(targetSkillPath), readFile(memoryPath)]);
if (createHash('sha256').update(currentSkill).digest('hex') !== evaluation.baseSkillSha256) {
  throw new Error('Target skill changed after evaluation validation');
}
if (createHash('sha256').update(currentMemory).digest('hex') !== evaluation.baseMemorySha256) {
  throw new Error('Mutation memory changed after evaluation validation');
}

const writeAtomically = async (path, content) => {
  const temporaryPath = `${path}.${process.pid}.tmp`;
  await writeFile(temporaryPath, content);
  await rename(temporaryPath, path);
};

await writeAtomically(memoryPath, `${JSON.stringify(result.updatedMemory, null, 2)}\n`);

if (winner) {
  await writeAtomically(targetSkillPath, winner.candidateSkill);
}

console.log(JSON.stringify({
  ...result,
  applied: {
    memoryPath,
    targetSkillPath,
    promoted: Boolean(winner)
  }
}, null, 2));