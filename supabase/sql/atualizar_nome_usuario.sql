-- ─────────────────────────────────────────────────────────────────────────
-- Propagação de nome do usuário (tela "Meu Perfil")
--
-- O nome do usuário logado é armazenado em 3 lugares:
--   1. auth.users.user_metadata.nome_completo (fonte "de login" — atualizada
--      direto pelo client via supabase.auth.updateUser({ data: {...} }))
--   2. membros_familia.nome (cópia usada em Familia.tsx)
--   3. posts_diario.autor_nome (cópia gravada em cada post no momento em
--      que foi publicado, usada em Diario.tsx e no feed da Home)
--
-- Esta função propaga o nome novo para (2) e (3) de uma vez, escopada
-- SEMPRE ao próprio usuário autenticado (auth.uid()).
--
-- Por que SECURITY DEFINER em vez de update direto do client:
--   membros_familia já tem policy de UPDATE liberando "user_id = auth.uid()"
--   sem restringir quais colunas podem mudar — daria pra usar update direto
--   ali. Mas a policy de UPDATE de posts_diario é desconhecida/potencialmente
--   ampla (o toggleCurtida do Diário já atualiza o campo "reacoes" de posts
--   de QUALQUER membro da família, então a policy não é só "autor_id = uid").
--   Em vez de depender dessa policy (que pode permitir mais do que deveria,
--   ex.: trocar crianca_id de um post), a função abaixo roda com privilégio
--   de dono da tabela e só toca exatamente nas colunas nome/autor_nome do
--   próprio usuário — nada mais.
--
-- Rode este script no SQL Editor do Supabase (projeto Parenta).
-- Idempotente: pode ser executado novamente sem erro.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.atualizar_nome_em_familia(p_novo_nome text)
returns void
language sql
security definer
set search_path = public
as $func$
    update public.membros_familia
    set nome = p_novo_nome
    where user_id = auth.uid();

    update public.posts_diario
    set autor_nome = p_novo_nome
    where autor_id = auth.uid();
$func$;

grant execute on function public.atualizar_nome_em_familia(text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Verificação rápida (opcional): confirma que a função foi criada.
-- select proname, prosecdef from pg_proc where proname = 'atualizar_nome_em_familia';
-- ─────────────────────────────────────────────────────────────────────────
