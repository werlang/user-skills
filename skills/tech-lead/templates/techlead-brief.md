# Tech-lead brief (template)

Copy to `/tmp/techlead-brief-<job>.md`, fill the placeholders, and pass it as one argument:
`--print="$(cat /tmp/techlead-brief-<job>.md)"`. Keep the section headings: the tech lead returns its report in the
same order, and a brief that asks for all of them gets all of them.

---

# Papel: TECH LEAD (não implemente)

<One line: what the owner decided, in his words. E.g. "opção 1 — fechar como está, mas o que foi feito precisa ser revisto".>
Sua função: planejar, decidir, delegar a implementação ao supervisor, e julgar o que já está na branch. Você não escreve
código.

# Repositório e diretório
- Repo: `<owner>/<repo>`, worktree `<absolute path>` (é onde você está). `gh` autenticado como `<login>`.
- Branch de trabalho: `<branch>`, <N> commits à frente de `origin/main`: `<sha>` (<o que é>), `<sha>` (<o que é>).
- <versão/arquivo de versão já bumpado? diga onde>.

# Estado verificado nesta sessão — não redescobrir, não re-rodar por reflexo
- CI: run `<id>` **verde** — jobs e o que cada um cobre.
- Goldens: run `<id>` do workflow de gravação; `<N>` arquivos mudaram, todos `<padrão>` (motivo: <versão/UI>).
- Probes de harness feitos agora: `<harness> <modelo> <effort>` respondeu `ok` (<duração>).
- Assinatura/publicação: <binário>, keystore, alias, onde está a senha e como usá-la **sem imprimir**; assets `<nome>` e
  `<nome>.sha256`.
- O que está sabidamente quebrado ou não verificado: <lista>.

# O que está implementado e precisa da sua revisão
<Lista por arquivo e por comportamento, não por intenção. Para cada item: o que faz, a decisão embutida, e o que um revisor
teria de checar. Inclua as fontes externas consultadas e o que foi medido, não o que se supõe.>

# Suas restrições
- **Não implemente.** Delegue ao supervisor (`<invocação exata>`), que dirige o worker (`<invocação exata>`), com escrita
  confinada a `<worktree>`.
- Gate antes de merge: <build, testes, goldens>; regravar artefato de gate exige justificativa por arquivo no diff.
- Git: <política do repo — branch curta, ff-only, sem PR>; nunca force-push em `main`.
- Não tocar em outros repositórios. Não imprimir segredo algum.
- Publicação: tag `<vX.Y.Z>`, assets `<nomes>`, e o que **não** pode ir para o ar.
- **É decisão SUA, não do assistente**: o desenho (que caminho técnico seguir), os estados que o produto distingue, os
  textos de cada um, se algum deixa de ser tratado como erro, se passa por i18n, e o que entra na documentação. O
  assistente só carrega fato medido e decisão do diretor; escolha e registre o trade-off.

# O que o diretor espera de volta
Relatório em `<idioma>`, gravado em `<caminho do relatório>`, com estas seções, nesta ordem:
1. Resultado (entregue ou bloqueado).
2. O que mudou (comportamento e escopo concretos).
3. Evidência (comando exato, resultado esperado, saída real e exit code).
4. **Revisão do trabalho já feito**: cada achado com severidade e disposição (corrigido pelo worker / aceito com
   justificativa / escalado ao diretor) — este é o ponto central quando o pedido é revisar algo pronto.
5. Decisões e trade-off em uma linha cada.
6. Não verificado (obrigatório, mesmo que seja "nenhum").
7. Riscos aceitos e consequência.
8. Precisa do diretor (escalações ou "nenhum").
9. O que está no ar: URL, sha exato, versão.

---

## Why the sections exist

- **Verified state** is what stops the run from spending its budget re-running a green gate; it must be labelled as
  already-checked, with numbers and ids, or the reviewer re-derives it.
- **Review checklist** turns a vague "have a look" into findings with a disposition, which is the only form of review the
  director can act on.
- **Not verified** is required because a silent gap reads as proof.
- **What is live** is the only section that answers the question he actually asks afterwards (`where do I see it?`).
