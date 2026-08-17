-- ─────────────────────────────────────────────────────────────────────────
-- Exclusão de Participante Familiar (tela Família)
--
-- Regras impostas por esta policy (independente do que o client mande):
--   1. Só é permitido DELETE em membros_familia se quem executa é
--      Responsável Principal ATIVO da mesma criança (crianca_id) do
--      registro sendo excluído.
--   2. O registro excluído só pode ser de um Participante Familiar
--      (papel = 'participante_familiar'). Um Responsável Principal
--      NUNCA pode ser excluído por esta policy — nem por outro
--      Responsável Principal.
--   3. Como o usuário logado só pode ter papel = 'responsavel_principal'
--      OU papel = 'participante_familiar' (nunca os dois ao mesmo tempo,
--      é 1 vínculo por usuário), a regra "não pode excluir a si mesmo"
--      já fica garantida estruturalmente: o próprio registro do
--      Responsável Principal nunca satisfaz papel = 'participante_familiar'.
--
-- IMPORTANTE — por que existe a função abaixo em vez de um EXISTS direto:
-- a policy precisa checar "existe uma linha de responsavel_principal para
-- este crianca_id" consultando a PRÓPRIA membros_familia. Fazer esse
-- self-join direto dentro do USING da policy causa erro do Postgres:
-- "infinite recursion detected in policy for relation membros_familia"
-- (a policy de SELECT da tabela reavalia a policy da própria tabela).
-- A saída, já usada no projeto para minhas_criancas(), é envolver a
-- checagem numa função SECURITY DEFINER: por rodar com os privilégios
-- do dono da função (que não sofre RLS), ela quebra o ciclo.
--
-- Rode este script no SQL Editor do Supabase (projeto Parenta).
-- Idempotente: pode ser executado novamente sem erro.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.sou_responsavel_principal_de(p_crianca_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $func$
    select exists (
        select 1
        from public.membros_familia
        where crianca_id = p_crianca_id
          and user_id = auth.uid()
          and papel = 'responsavel_principal'
          and ativo = true
    );
$func$;

grant execute on function public.sou_responsavel_principal_de(uuid) to authenticated;

-- Garante que RLS está habilitado na tabela (não altera se já estiver).
alter table public.membros_familia enable row level security;

-- Remove a policy antiga (se já existir) para permitir re-execução segura.
drop policy if exists "responsavel_principal_exclui_participante" on public.membros_familia;

create policy "responsavel_principal_exclui_participante"
on public.membros_familia
for delete
to authenticated
using (
    -- só pode excluir vínculo de Participante Familiar
    papel = 'participante_familiar'
    -- e quem executa precisa ser Responsável Principal ativo desta criança
    and public.sou_responsavel_principal_de(crianca_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Verificação rápida (opcional): lista as policies ativas na tabela.
-- select policyname, cmd, qual from pg_policies where tablename = 'membros_familia';
-- ─────────────────────────────────────────────────────────────────────────
