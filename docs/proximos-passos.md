# Parenta — Próximos Passos

> Documento de referência sobre o estado atual do app e o backlog em aberto, pra
> retomar a conversa com o Claude sobre prioridades. Baseado no histórico de
> commits (`git log`), no código atual e no diagnóstico anterior
> `docs/ux-review-linkar.html` (nome antigo do produto era "Linkar" — algumas
> lacunas apontadas lá já foram resolvidas, ver seção 1).

Gerado em 2026-08-17, branch `feature/familia-excluir-participante`.

---

## 1. O que já está entregue

**Autenticação e onboarding**
- Login, cadastro, recuperação de senha (fluxo completo com redirecionamento de token)
- Cadastro de criança em 3 steps (dados básicos, saúde, escola) via função `SECURITY DEFINER` (`criar_crianca_com_responsavel`)

**Família**
- Listagem de Responsável Principal / Participante Familiar com dados reais
- Convite por link com token, vínculo e papel pré-definidos
- Bloqueio de múltiplas famílias por usuário, limite de 2 Responsáveis Principais
- Participante Familiar não pode convidar nem excluir ninguém
- **Excluir Participante Familiar** (Responsável Principal apenas) — feature desta branch

**Diário**
- Posts com tag (Manhã/Noite/Tarde/Conquista/Saúde/Especial)
- Curtidas funcionando
- Respostas encadeadas estilo Instagram (comentários aninhados, menção @nome)
- Excluir post próprio (com cascata de respostas)
- Paginação e queries paralelas (perf)

**Calendário**
- CRUD de eventos, confirmação de presença, exclusão de eventos
- Navegação entre meses

**Perfil**
- Visualização e edição dos dados da criança (saúde, escola)
- Seção de Documentos existe só como placeholder ("Em breve")

**Infra**
- PWA configurado (manifest, service worker, ícones)
- RLS ativa nas tabelas principais, com funções `SECURITY DEFINER` para casos de
  bootstrap (`criar_crianca_com_responsavel`, `minhas_criancas`, `convite_por_token`,
  e agora `sou_responsavel_principal_de`)

---

## 2. Lacunas abertas — priorizadas

### Alta prioridade

| Item | Esforço | Por quê |
|---|---|---|
| **Home sem conteúdo vivo** | Médio | `Home.tsx` só mostra card da criança + próximos eventos. É a tela mais aberta e não dá motivo pra abrir de novo. Virar feed de atividade (último post do Diário, próxima troca de guarda) reaproveita dados que já existem. |
| **Sem perfil do próprio usuário logado** | Baixo | Existe edição dos dados da *criança*, mas nenhuma tela pra o usuário trocar nome/e-mail/senha. |
| **Foto real da criança** | Médio | Hoje é só emoji fixo (`CadastroCrianca.tsx`). Maior barreira emocional apontada no review antigo — ainda não resolvida. Precisa de Storage no Supabase. |
| **Fotos no Diário** | Médio | Botão já existe como "em breve" (commit `29cb4d5`). Precisa de upload real pro Storage. |

### Média prioridade

| Item | Esforço | Por quê |
|---|---|---|
| **Documentos no Perfil** | Alto | Ainda é placeholder puro. Carteira de vacinação/receitas é o tipo de conteúdo que fideliza. |
| **Eventos recorrentes no Calendário** | Alto | Sem isso, evento fixo semanal precisa ser recriado toda vez — atrito alto. |
| **Notificações push** | Alto | PWA já está configurado (service worker existe), falta a camada de push em si. Sem isso o app não cria hábito de uso. |

### Diferenciais (não existem em concorrentes)

- **"Quem está com a criança agora"** — card na Home tipo *"Esta semana: com a mãe · próxima troca: sexta às 18h"*. Maior diferencial apontado no review, mas exige modelar conceito de guarda/troca que não existe hoje no schema — mais esforço de design antes de codar.
- **Registro rápido de medicação administrada** — "Dei o antialérgico às 8h", com histórico do dia.
- **Humor/estado da criança no check-in de guarda** — reduz a necessidade de ligação de transição entre os pais.

---

## 3. Notas técnicas para o próximo Claude (armadilhas já mapeadas neste projeto)

- **RLS self-referencing = "infinite recursion detected in policy"**: qualquer policy que precise checar "sou eu mesmo membro desta família" fazendo `SELECT` na própria tabela protegida por RLS vai recursar. A saída usada no projeto é sempre envolver a checagem numa função `SECURITY DEFINER` (ver `minhas_criancas()` e `sou_responsavel_principal_de()`), nunca um `EXISTS` direto na mesma tabela dentro do `USING`.
- **`.delete()`/`.update()` sem `.select()` mascara bloqueio de RLS**: quando a policy barra a operação, o Supabase/PostgREST retorna sucesso com 0 linhas afetadas — **sem erro**. Sempre encadear `.select()` depois de `delete`/`update` sensível a RLS e checar `data.length === 0` como falha explícita (padrão já usado em `Convites.tsx` e agora em `Familia.tsx`).
- **1 vínculo por usuário**: cada usuário só pode pertencer a uma família (`membros_familia`) por vez — checado manualmente no fluxo de aceite de convite, não é constraint de banco.
- **`$$` em corpo de função SQL pode corromper ao colar via chat**: renderizadores de markdown às vezes tratam `$$...$$` como bloco LaTeX. Preferir `$func$...$func$` como delimitador ao compartilhar SQL de função por chat.
- Não há migrations versionadas no repo (pasta `supabase/sql/` começou nesta branch, só com o script de exclusão de participante) — vale considerar formalizar isso pra rastrear mudanças de schema/RLS ao longo do tempo.

---

## 4. Recomendação

Se for escolher **um único próximo passo**: **Home com feed de atividade**. Esforço médio (sem schema novo — reaproveita Diário + Calendário), ataca diretamente retenção (é a tela mais aberta e hoje é a mais vazia). O trade-off é que "quem está com a criança agora" tem impacto percebido ainda maior, mas exige modelar guarda/troca do zero — mais discovery antes de codar.
