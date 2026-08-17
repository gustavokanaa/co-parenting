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
-- Rode este script no SQL Editor do Supabase (projeto Parenta).
-- Idempotente: pode ser executado novamente sem erro.
-- ─────────────────────────────────────────────────────────────────────────

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
    and exists (
        -- quem está autenticado precisa ser Responsável Principal ativo
        -- da MESMA criança do registro que está sendo excluído
        select 1
        from public.membros_familia rp
        where rp.crianca_id = membros_familia.crianca_id
          and rp.user_id = auth.uid()
          and rp.papel = 'responsavel_principal'
          and rp.ativo = true
    )
);

-- ─────────────────────────────────────────────────────────────────────────
-- Verificação rápida (opcional): lista as policies ativas na tabela.
-- select policyname, cmd, qual from pg_policies where tablename = 'membros_familia';
-- ─────────────────────────────────────────────────────────────────────────
