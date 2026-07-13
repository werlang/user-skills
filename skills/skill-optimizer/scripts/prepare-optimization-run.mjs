import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const [, , targetSkillPath, runDirectory] = process.argv;

if (!targetSkillPath || !runDirectory) {
  throw new Error('Usage: node scripts/prepare-optimization-run.mjs <target-skill.md> <run-directory>');
}

const optimizerDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const memoryPath = join(dirname(targetSkillPath), 'mutation-memory.json');
const memoryTemplatePath = join(optimizerDirectory, 'mutation-memory.template.json');
const skillId = basename(dirname(targetSkillPath));

const pathExists = async (path) => {
  try {
    await readFile(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
};

const skill = await readFile(targetSkillPath);
await mkdir(runDirectory, { recursive: true });

if (!await pathExists(memoryPath)) {
  const memory = JSON.parse(await readFile(memoryTemplatePath, 'utf8'));
  memory.skillId = skillId;
  await writeFile(memoryPath, `${JSON.stringify(memory, null, 2)}\n`);
} else {
  const memory = JSON.parse(await readFile(memoryPath, 'utf8'));
  if (memory.skillId !== skillId) {
    throw new Error(`Memory skillId ${memory.skillId} does not match target skill ${skillId}`);
  }
}

const manifest = {
  schemaVersion: 1,
  runId: randomUUID(),
  skillId,
  targetSkillPath,
  memoryPath,
  baseSkillSha256: createHash('sha256').update(skill).digest('hex'),
  baseMemorySha256: createHash('sha256').update(await readFile(memoryPath)).digest('hex'),
  baselineSkillPath: join(runDirectory, `baseline-${basename(targetSkillPath)}`)
};

await writeFile(manifest.baselineSkillPath, skill);
await writeFile(join(runDirectory, 'run-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify(manifest, null, 2));