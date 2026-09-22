# Migrations

Este diretório é a fonte de verdade versionada do schema do banco (Supabase/Postgres).

## Baseline

`000_schema_baseline.sql` é o ponto de partida: um snapshot completo do schema
existente no momento em que o versionamento formal de migrations começou
(tabelas, functions, policies, grants). Ele não deve ser reaplicado nem
editado — serve como referência do estado inicial.

## Convenção para novas alterações

- Toda alteração de banco a partir de agora vira um **novo arquivo**, nunca
  uma edição de um arquivo já existente/aplicado.
- Nomeação sequencial: `001_nome_descritivo.sql`, `002_nome_descritivo.sql`,
  etc. — sempre incrementando o número anterior mais alto no diretório.
- Todo arquivo deve começar com um comentário explicando o que a migration
  faz, por exemplo:

  ```sql
  -- Adiciona coluna "vinculo_outro_texto" em membros_familia para permitir
  -- descrever o vínculo quando o usuário escolhe "Outro".
  ```

- Migrations já aplicadas (em qualquer ambiente compartilhado) são
  **imutáveis**: se algo precisa mudar, cria-se uma nova migration que
  ajusta o que foi feito, em vez de editar a antiga.
