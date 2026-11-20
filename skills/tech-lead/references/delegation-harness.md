# Harness de delegação — travas executáveis

Scripts que materializam as regras de "uma árvore, um agente" e "publicar tem uma porta só". Copie e adapte por
projeto; o desenho importa mais que o texto.

## 1. `agent-run` — rodada com papel, trava e registro

Um wrapper por rodada de agente. Garante três coisas que nenhum brief garante: ninguém mais escreve na mesma
árvore, o estado não é um arquivo solto que sessão morta sobrescreve, e órfãos da rodada anterior não sobrevivem.

```sh
agent-run --role tech-lead|supervisor|worker --project DIR [--timeout SEG] -- CMD...
agent-run --project DIR --status     # imprime .agent/state.json
agent-run --project DIR --cleanup    # mata todo agente registrado no projeto
```

Pontos que fazem diferença:

- **`flock` não bloqueante em `$PROJECT/.agent/lock`.** Segunda rodada no mesmo diretório sai com código 3 em vez de
  escrever por cima. É a única trava que impede dois agentes na mesma árvore.
- **Registro em `.agent/pids`** (pid, papel, início) e limpeza no começo de cada rodada: mata o que ficou vivo de
  rodada anterior antes de começar.
- **`AGENT_ROLE` exportado** no ambiente do filho. É dele que os hooks do git e o gate de deploy leem o papel — não
  há como um worker "decidir" que é tech lead sem reescrever o ambiente.
- **`.agent/state.json` com fase/pid/exit code**, nunca um `.status` de texto livre: fases `running`/`finished` e o
  `exit_code` são o que permite distinguir rodada viva de rodada morta.
- **Estado gravado pelo wrapper, não pelo agente.** Agente que morre no meio nunca chega à linha que atualizaria o
  arquivo; se o próprio agente escreve o status, o arquivo mente.

Esqueleto mínimo do núcleo:

```sh
export AGENT_ROLE="$role" AGENT_PROJECT="$project"
cleanup_orphans                       # lê .agent/pids, mata vivos, zera o arquivo
exec 9>"$project/.agent/lock"
flock -n 9 || { echo "rodada já ativa" >&2; exit 3; }
started_at=$(date -u +%FT%TZ)
timeout --signal=TERM --kill-after=60 "$tmo" "$@" & child=$!
echo "$child $role $started_at" >> "$project/.agent/pids"
wait "$child"; code=$?
# grava state.json com phase=finished, exit_code=$code
```

## 2. Hooks de git — barreira de integração

Versionados em `ops/githooks/` e instalados com `git config core.hooksPath ops/githooks` (hook em `.git/hooks` não
sobrevive a clone nem a `git worktree`).

- `pre-commit`: recusa commit em `master`/`main` quando `AGENT_ROLE` não é `tech-lead` nem `human`.
- `pre-merge-commit` e `pre-push`: recusam integração pelo mesmo critério, com a mensagem dizendo `git merge --abort`
  (o hook roda depois que o merge já está montado; sem isso a árvore fica em MERGE_HEAD e confunde a próxima rodada).

**Buraco conhecido, não fingir que está fechado:** merge fast-forward não cria commit e portanto não dispara hook
nenhum. Ele move `master` silenciosamente. Por isso a trava de verdade é a de publicação, abaixo.

## 3. `ops/deploy.sh` — a única porta para produção

```sh
ops/deploy.sh --approve <sha> --verdict APPROVE --reviewer "<modelo do supervisor>"
AGENT_ROLE=tech-lead ops/deploy.sh
```

Checagens, nesta ordem, todas antes de qualquer `docker compose`:

1. papel `tech-lead` (ou `human`, ou `ALLOW_DEPLOY=1` explícito);
2. árvore limpa (`git status --porcelain` vazio) — buildar de árvore suja publica código que ninguém revisou;
3. `.agent/approval.json` existe e contém `verdict: APPROVE` **e o sha do HEAD atual**. Aprovação de outro commit
   recusa: é o que impede "aprovei ontem" virar deploy de hoje;
4. só então build, migrações, `scripts/verify.sh` e registro.

O que gravar depois: `.agent/deployed.json` com `sha`, `deployed_at` e `by_role`, e `.agent/log` com a linha do tempo
(`deploy_start`, `verify_ok`, `deploy_done`, falhas com estágio). É esse arquivo — não a memória do agente — que
responde "o que está no ar".

Detalhes que já custaram tempo:

- **Caminho do log absoluto.** O script faz `cd deploy/` no meio; `>>"../$log"` com `log=".agent/log"` funciona por
  sorte, e qualquer `cd` extra gera `No such file or directory` no meio do deploy sem falhar o comando.
- **`ALLOW_DEPLOY=1` existe para o dono humano**, não para destravar agente: se um agente precisa dele, a trava está
  sendo contornada e isso é o sinal, não a solução.
- **Verificação pós-deploy é hash, não `ps`:** asset servido pelo domínio público contra o mesmo arquivo dentro do
  contêiner, mais `/health` e o sha registrado.

## 4. Convenção de findings

O supervisor escreve **um** arquivo de veredito por rodada, no diretório da rodada, com contagem explícita
(`APPROVE` / `REJECT — N altos, M médios, K baixos`), cada achado com `arquivo:linha`, cenário de uso e critério de
aceite. Achado sem reprodução executada é opinião; o gate só lê o arquivo.
